import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { addEvidence } from '../services/knowledgeBase.js';
import mongoose from 'mongoose'; // Just to close connections if opened via imports

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

async function uploadData() {
    try {
        const args = process.argv.slice(2);
        const filename = args[0] || 'knowledge_data.json';
        const filePath = join(__dirname, '../', filename);

        if (!existsSync(filePath)) {
            console.error(`❌ File not found: ${filename}`);
            console.log('Usage: node scripts/uploadKnowledge.js [filename]');
            process.exit(1);
        }

        const data = JSON.parse(readFileSync(filePath, 'utf8'));
        console.log(`🔍 Found ${data.length} items to upload...`);

        for (const item of data) {
            console.log(`Processing: ${item.title}...`);
            await addEvidence(item);
        }

        console.log('✨ All data uploaded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Upload failed:', error);
        process.exit(1);
    }
}

uploadData();
