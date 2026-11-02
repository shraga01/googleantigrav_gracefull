import fs from 'fs';

const heRaw = fs.readFileSync('src/locales/he.ts', 'utf8')
    .replace('export const he =', 'const he =')
    .concat('\nexport default he;');
const enRaw = fs.readFileSync('src/locales/en.ts', 'utf8')
    .replace('export const en =', 'const en =')
    .concat('\nexport default en;');

fs.writeFileSync('scripts/_temp_he.mjs', heRaw);
fs.writeFileSync('scripts/_temp_en.mjs', enRaw);

const { default: he } = await import('./_temp_he.mjs');
const { default: en } = await import('./_temp_en.mjs');

function getDeepKeys(obj, prefix = '') {
    return Object.keys(obj).flatMap(k => {
        const full = prefix ? prefix + '.' + k : k;
        return typeof obj[k] === 'object' && obj[k] !== null
            ? getDeepKeys(obj[k], full)
            : [full];
    });
}

const heKeys = getDeepKeys(he);
const enKeys = getDeepKeys(en);

const diff1 = heKeys.filter(k => !enKeys.includes(k));
const diff2 = enKeys.filter(k => !heKeys.includes(k));

fs.unlinkSync('scripts/_temp_he.mjs');
fs.unlinkSync('scripts/_temp_en.mjs');

console.log('Deep HE keys:', heKeys.length, 'Deep EN keys:', enKeys.length);
if (diff1.length === 0 && diff2.length === 0) {
    console.log('✅ 100% Locale Key Parity verified!');
    process.exit(0);
} else {
    console.error('❌ Missing in EN:', diff1);
    console.error('❌ Missing in HE:', diff2);
    process.exit(1);
}
