import admin from '../config/firebase.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

const COLLECTION_NAME = 'gratitude_knowledge';

/**
 * Generate embedding for text
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
async function embedText(text) {
    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Search for relevant evidence in the knowledge base
 * @param {string} queryText - The user context or query
 * @param {object} options - { limit, purpose }
 * @returns {Promise<object[]>}
 */
export async function searchEvidence(queryText, options = {}) {
    const { limit = 3, purpose } = options;

    try {
        const queryVector = await embedText(queryText);

        // Vector search using Firestore
        // Note: Firestore Vector Search requires specific indexing.
        // For now, we are assuming the collection implements vector search via extension or native capability
        // If native Vector Search is not enabled, we might need a workaround or ensure the index is created.

        // Using the vector query syntax if supported by the admin SDK version
        const coll = db.collection(COLLECTION_NAME);

        // Basic implementation concept for vector search
        // Actual implementation depends on specific Firestore Vector Search release details
        // As of 2025, it's typically:
        const vectorQuery = coll.findNearest('embedding', queryVector, {
            limit: limit,
            distanceMeasure: 'COSINE'
        });

        const snapshot = await vectorQuery.get();

        const results = [];
        snapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() });
        });

        // Optional filtering by purpose/use_case if needed (post-retrieval or pre-filter if supported)
        if (purpose) {
            return results.filter(r => !r.use_cases || r.use_cases.includes(purpose));
        }

        return results;

    } catch (error) {
        console.error('Error searching knowledge base:', error);
        return [];
    }
}

/**
 * Add a new evidence item to the knowledge base
 * @param {object} item 
 */
export async function addEvidence(item) {
    try {
        const textToEmbed = `${item.title}: ${item.content}`;
        const embedding = await embedText(textToEmbed);

        await db.collection(COLLECTION_NAME).add({
            ...item,
            embedding,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Added evidence: ${item.title}`);
    } catch (error) {
        console.error('Error adding evidence:', error);
        throw error;
    }
}
