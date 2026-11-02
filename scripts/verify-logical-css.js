import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('src');

const FORBIDDEN_PATTERNS = [
    { regex: /\bml-([0-9]+|auto|px)\b/g, suggestion: 'ms-* (margin-inline-start)' },
    { regex: /\bmr-([0-9]+|auto|px)\b/g, suggestion: 'me-* (margin-inline-end)' },
    { regex: /\bpl-([0-9]+|auto|px)\b/g, suggestion: 'ps-* (padding-inline-start)' },
    { regex: /\bpr-([0-9]+|auto|px)\b/g, suggestion: 'pe-* (padding-inline-end)' },
    { regex: /\btext-left\b/g, suggestion: 'text-start' },
    { regex: /\btext-right\b/g, suggestion: 'text-end' },
    { regex: /\bborder-l(-[0-9]+)?\b/g, suggestion: 'border-s-*' },
    { regex: /\bborder-r(-[0-9]+)?\b/g, suggestion: 'border-e-*' },
    { regex: /\bleft-([0-9]+|auto|full)\b/g, suggestion: 'start-*' },
    { regex: /\bright-([0-9]+|auto|full)\b/g, suggestion: 'end-*' },
];

let totalViolations = 0;

function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
            checkFile(fullPath);
        }
    }
}

function checkFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
            return;
        }

        for (const { regex, suggestion } of FORBIDDEN_PATTERNS) {
            regex.lastIndex = 0;
            const match = regex.exec(line);
            if (match) {
                console.error(
                    `❌ [Logical CSS Violation] ${relativePath}:${index + 1}\n` +
                    `   Found physical class: "${match[0]}" -> Use logical equivalent: "${suggestion}"\n` +
                    `   Line: ${line.trim()}`
                );
                totalViolations++;
            }
        }
    });
}

console.log('🔍 Scanning src/ for strict CSS Logical Properties compliance...');
scanDirectory(SRC_DIR);

if (totalViolations > 0) {
    console.error(`\n❌ FAILED: Found ${totalViolations} physical CSS directional violation(s).`);
    process.exit(1);
} else {
    console.log('✅ PASSED: 100% compliant with strict Tailwind CSS Logical Properties law (Zero physical directionals).');
    process.exit(0);
}
