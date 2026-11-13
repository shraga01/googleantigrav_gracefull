import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Generates Android launcher icons for all mipmap densities:
 * - ic_launcher.png (warm amber squircle + sun & heart-sprout emblem)
 * - ic_launcher_round.png (warm amber circle + sun & heart-sprout emblem)
 * - ic_launcher_foreground.png (transparent background + sun & heart-sprout emblem within safe 66dp zone)
 */

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, toCrc, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const scanlineWidth = width * 4 + 1;
  const scanlines = Buffer.alloc(height * scanlineWidth);
  for (let y = 0; y < height; y++) {
    scanlines[y * scanlineWidth] = 0; // Filter None
    rgba.copy(scanlines, y * scanlineWidth + 1, y * width * 4, (y + 1) * width * 4);
  }

  const idatData = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function evalCubic(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
  };
}

function bezierCurveToPolygon(beziers, stepsPerSegment = 20) {
  const poly = [];
  for (const b of beziers) {
    for (let i = 0; i < stepsPerSegment; i++) {
      poly.push(evalCubic(b[0], b[1], b[2], b[3], i / stepsPerSegment));
    }
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of poly) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { poly, bbox: { minX, maxX, minY, maxY } };
}

function pointInPolygonFast(px, py, shape) {
  const b = shape.bbox;
  if (px < b.minX || px > b.maxX || py < b.minY || py > b.maxY) return false;
  const polygon = shape.poly;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function sdRoundRect(px, py, w, h, r) {
  const qx = Math.abs(px - w / 2) - (w / 2 - r);
  const qy = Math.abs(py - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// Geometric shapes (108x108 coordinate space)
const heartShape = bezierCurveToPolygon([
  [ { x: 54, y: 53 }, { x: 49, y: 46 }, { x: 39, y: 46 }, { x: 36, y: 54 } ],
  [ { x: 36, y: 54 }, { x: 33, y: 63 }, { x: 42, y: 71 }, { x: 54, y: 78 } ],
  [ { x: 54, y: 78 }, { x: 66, y: 71 }, { x: 75, y: 63 }, { x: 72, y: 54 } ],
  [ { x: 72, y: 54 }, { x: 69, y: 46 }, { x: 59, y: 46 }, { x: 54, y: 53 } ]
], 25);

const innerHeartShape = bezierCurveToPolygon([
  [ { x: 54, y: 58 }, { x: 51, y: 53 }, { x: 44, y: 53 }, { x: 42, y: 58 } ],
  [ { x: 42, y: 58 }, { x: 40, y: 64 }, { x: 47, y: 68 }, { x: 54, y: 73 } ],
  [ { x: 54, y: 73 }, { x: 61, y: 68 }, { x: 68, y: 64 }, { x: 66, y: 58 } ],
  [ { x: 66, y: 58 }, { x: 64, y: 53 }, { x: 57, y: 53 }, { x: 54, y: 58 } ]
], 20);

const leftLeafShape = bezierCurveToPolygon([
  [ { x: 54, y: 54 }, { x: 47, y: 50 }, { x: 39, y: 44 }, { x: 41, y: 36 } ],
  [ { x: 41, y: 36 }, { x: 47, y: 39 }, { x: 51, y: 46 }, { x: 54, y: 54 } ]
], 25);

const rightLeafShape = bezierCurveToPolygon([
  [ { x: 54, y: 54 }, { x: 61, y: 50 }, { x: 69, y: 44 }, { x: 67, y: 36 } ],
  [ { x: 67, y: 36 }, { x: 61, y: 39 }, { x: 57, y: 46 }, { x: 54, y: 54 } ]
], 25);

const sunRays = [
  { x1: 54, y1: 26, x2: 54, y2: 21 },
  { x1: 61.5, y1: 29.5, x2: 64.5, y2: 26.5 },
  { x1: 64, y1: 36, x2: 69, y2: 36 },
  { x1: 44, y1: 36, x2: 39, y2: 36 },
  { x1: 46.5, y1: 29.5, x2: 43.5, y2: 26.5 }
];

// Color palette
const COLOR_AMBER_400 = [251, 191, 36];  // #FBBF24
const COLOR_AMBER_500 = [245, 158, 11];  // #F59E0B
const COLOR_AMBER_600 = [217, 119, 6];   // #D97706
const COLOR_GOLD      = [253, 230, 138]; // #FDE68A
const COLOR_CREAM     = [255, 253, 249]; // #FFFDF9

function blend(dst, srcR, srcG, srcB, srcA) {
  const sa = srcA / 255;
  const da = dst.a / 255;
  const outA = sa + da * (1 - sa);
  if (outA <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  const outR = (srcR * sa + dst.r * da * (1 - sa)) / outA;
  const outG = (srcG * sa + dst.g * da * (1 - sa)) / outA;
  const outB = (srcB * sa + dst.b * da * (1 - sa)) / outA;
  return { r: Math.round(outR), g: Math.round(outG), b: Math.round(outB), a: Math.round(outA * 255) };
}

function sampleIcon(u, v, mode) {
  let pixel = { r: 0, g: 0, b: 0, a: 0 };

  // 1. Background layer
  if (mode === 'squircle') {
    const d = sdRoundRect(u, v, 108, 108, 24);
    if (d > 0.5) return pixel;
    const alpha = Math.max(0, Math.min(1, 0.5 - d)) * 255;
    const t = Math.max(0, Math.min(1, (u + v - 24) / 168));
    let br, bg, bb;
    if (t < 0.55) {
      const f = t / 0.55;
      br = COLOR_AMBER_400[0] + f * (COLOR_AMBER_500[0] - COLOR_AMBER_400[0]);
      bg = COLOR_AMBER_400[1] + f * (COLOR_AMBER_500[1] - COLOR_AMBER_400[1]);
      bb = COLOR_AMBER_400[2] + f * (COLOR_AMBER_500[2] - COLOR_AMBER_400[2]);
    } else {
      const f = (t - 0.55) / 0.45;
      br = COLOR_AMBER_500[0] + f * (COLOR_AMBER_600[0] - COLOR_AMBER_500[0]);
      bg = COLOR_AMBER_500[1] + f * (COLOR_AMBER_600[1] - COLOR_AMBER_500[1]);
      bb = COLOR_AMBER_500[2] + f * (COLOR_AMBER_600[2] - COLOR_AMBER_500[2]);
    }
    const radDist = Math.hypot(u - 54, v - 46);
    if (radDist < 44) {
      const glow = Math.pow(1 - radDist / 44, 1.5) * 0.22;
      br = br + (254 - br) * glow;
      bg = bg + (243 - bg) * glow;
      bb = bb + (199 - bb) * glow;
    }
    pixel = blend(pixel, br, bg, bb, alpha);
  } else if (mode === 'round') {
    const d = Math.hypot(u - 54, v - 54) - 52;
    if (d > 0.5) return pixel;
    const alpha = Math.max(0, Math.min(1, 0.5 - d)) * 255;
    const t = Math.max(0, Math.min(1, (u + v - 24) / 168));
    let br, bg, bb;
    if (t < 0.55) {
      const f = t / 0.55;
      br = COLOR_AMBER_400[0] + f * (COLOR_AMBER_500[0] - COLOR_AMBER_400[0]);
      bg = COLOR_AMBER_400[1] + f * (COLOR_AMBER_500[1] - COLOR_AMBER_400[1]);
      bb = COLOR_AMBER_400[2] + f * (COLOR_AMBER_500[2] - COLOR_AMBER_400[2]);
    } else {
      const f = (t - 0.55) / 0.45;
      br = COLOR_AMBER_500[0] + f * (COLOR_AMBER_600[0] - COLOR_AMBER_500[0]);
      bg = COLOR_AMBER_500[1] + f * (COLOR_AMBER_600[1] - COLOR_AMBER_500[1]);
      bb = COLOR_AMBER_500[2] + f * (COLOR_AMBER_600[2] - COLOR_AMBER_500[2]);
    }
    const radDist = Math.hypot(u - 54, v - 46);
    if (radDist < 44) {
      const glow = Math.pow(1 - radDist / 44, 1.5) * 0.22;
      br = br + (254 - br) * glow;
      bg = bg + (243 - bg) * glow;
      bb = bb + (199 - bb) * glow;
    }
    pixel = blend(pixel, br, bg, bb, alpha);
  }

  // 2. Emblem within safe inner zone
  if (u >= 30 && u <= 78 && v >= 20 && v <= 80) {
    // Sun Rays
    for (const ray of sunRays) {
      const d = distToSegment(u, v, ray.x1, ray.y1, ray.x2, ray.y2) - 1.2;
      if (d <= 0.5) {
        const alpha = Math.max(0, Math.min(1, 0.5 - d)) * 255;
        pixel = blend(pixel, COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2], alpha);
      }
    }

    // Sun Disc
    const dSun = Math.hypot(u - 54, v - 36) - 7.0;
    if (dSun <= 0.5) {
      const alpha = Math.max(0, Math.min(1, 0.5 - dSun)) * 255;
      pixel = blend(pixel, COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2], alpha);
    }

    // Sun Core
    const dCore = Math.hypot(u - 54, v - 36) - 3.2;
    if (dCore <= 0.5) {
      const alpha = Math.max(0, Math.min(1, 0.5 - dCore)) * 255;
      pixel = blend(pixel, COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2], alpha);
    }

    // Sprout Leaves
    if (pointInPolygonFast(u, v, leftLeafShape) || pointInPolygonFast(u, v, rightLeafShape)) {
      pixel = blend(pixel, COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2], 255);
    }

    // Sprout Stem
    const dStem = distToSegment(u, v, 54, 54, 54, 43) - 1.0;
    if (dStem <= 0.5) {
      const alpha = Math.max(0, Math.min(1, 0.5 - dStem)) * 255;
      pixel = blend(pixel, COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2], alpha);
    }

    // Foundation Heart
    if (pointInPolygonFast(u, v, heartShape)) {
      pixel = blend(pixel, COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2], 255);

      // Heart Inner Warmth Droplet Accent
      if (pointInPolygonFast(u, v, innerHeartShape)) {
        pixel = blend(pixel, COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2], 100);
      }
    }
  }

  return pixel;
}

function renderIcon(width, height, mode) {
  const buf = Buffer.alloc(width * height * 4);
  const subOffsets = [
    { dx: 0.25, dy: 0.25 },
    { dx: 0.75, dy: 0.25 },
    { dx: 0.25, dy: 0.75 },
    { dx: 0.75, dy: 0.75 }
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
      for (const off of subOffsets) {
        const u = ((x + off.dx) / width) * 108;
        const v = ((y + off.dy) / height) * 108;
        const s = sampleIcon(u, v, mode);
        rSum += s.r * (s.a / 255);
        gSum += s.g * (s.a / 255);
        bSum += s.b * (s.a / 255);
        aSum += s.a;
      }
      const finalA = Math.round(aSum / 4);
      let finalR = 0, finalG = 0, finalB = 0;
      if (finalA > 0) {
        finalR = Math.round((rSum / 4) / (finalA / 255));
        finalG = Math.round((gSum / 4) / (finalA / 255));
        finalB = Math.round((bSum / 4) / (finalA / 255));
      }
      const idx = (y * width + x) * 4;
      buf[idx] = Math.min(255, Math.max(0, finalR));
      buf[idx + 1] = Math.min(255, Math.max(0, finalG));
      buf[idx + 2] = Math.min(255, Math.max(0, finalB));
      buf[idx + 3] = finalA;
    }
  }

  return encodePNG(width, height, buf);
}

// Target icon configurations
const TARGETS = [
  {
    folder: 'mipmap-mdpi',
    files: [
      { name: 'ic_launcher.png', size: 48, mode: 'squircle' },
      { name: 'ic_launcher_round.png', size: 48, mode: 'round' },
      { name: 'ic_launcher_foreground.png', size: 108, mode: 'foreground' },
    ]
  },
  {
    folder: 'mipmap-hdpi',
    files: [
      { name: 'ic_launcher.png', size: 72, mode: 'squircle' },
      { name: 'ic_launcher_round.png', size: 72, mode: 'round' },
      { name: 'ic_launcher_foreground.png', size: 162, mode: 'foreground' },
    ]
  },
  {
    folder: 'mipmap-xhdpi',
    files: [
      { name: 'ic_launcher.png', size: 96, mode: 'squircle' },
      { name: 'ic_launcher_round.png', size: 96, mode: 'round' },
      { name: 'ic_launcher_foreground.png', size: 216, mode: 'foreground' },
    ]
  },
  {
    folder: 'mipmap-xxhdpi',
    files: [
      { name: 'ic_launcher.png', size: 144, mode: 'squircle' },
      { name: 'ic_launcher_round.png', size: 144, mode: 'round' },
      { name: 'ic_launcher_foreground.png', size: 324, mode: 'foreground' },
    ]
  },
  {
    folder: 'mipmap-xxxhdpi',
    files: [
      { name: 'ic_launcher.png', size: 192, mode: 'squircle' },
      { name: 'ic_launcher_round.png', size: 192, mode: 'round' },
      { name: 'ic_launcher_foreground.png', size: 432, mode: 'foreground' },
    ]
  }
];

export async function generateAllLauncherIcons() {
  const baseResDir = path.resolve(process.cwd(), 'android', 'app', 'src', 'main', 'res');
  console.log(`Starting launcher icon generation in: ${baseResDir}`);
  const startTime = Date.now();
  let totalFiles = 0;

  for (const target of TARGETS) {
    const dir = path.join(baseResDir, target.folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    for (const f of target.files) {
      const outPath = path.join(dir, f.name);
      const pngBuffer = renderIcon(f.size, f.size, f.mode);
      fs.writeFileSync(outPath, pngBuffer);
      totalFiles++;
      console.log(`  ✓ Generated ${target.folder}/${f.name} (${f.size}x${f.size}, ${pngBuffer.length} bytes)`);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`\nSuccessfully generated ${totalFiles} launcher icons across 5 densities in ${duration}ms.`);
}

generateAllLauncherIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
