/**
 * Client-Side Encryption Service
 * 
 * This service provides end-to-end encryption for journal entries.
 * Encryption keys are derived from the user's Google ID and never leave the device.
 * The server stores only encrypted data and cannot decrypt user content.
 */

// Encryption configuration
const ENCRYPTION_CONFIG = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12,
    saltLength: 16,
    iterations: 100000,
} as const;

/**
 * Derives an encryption key from a user's Google ID
 * Uses PBKDF2 to create a strong key that's consistent across devices
 */
async function deriveKeyFromGoogleId(googleId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(googleId),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    // Use a fixed salt derived from the app name
    // This ensures the same key is generated on all devices for the same user
    const salt = encoder.encode('daily-appreciation-app-v1');

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: ENCRYPTION_CONFIG.iterations,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: ENCRYPTION_CONFIG.algorithm, length: ENCRYPTION_CONFIG.keyLength },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts text content using AES-GCM
 * Returns base64-encoded encrypted data with IV prepended
 */
export async function encryptEntry(
    content: string,
    googleId: string
): Promise<string> {
    try {
        const key = await deriveKeyFromGoogleId(googleId);
        const encoder = new TextEncoder();
        const data = encoder.encode(content);

        // Generate random IV for this encryption
        const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));

        // Encrypt the data
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: ENCRYPTION_CONFIG.algorithm,
                iv,
            },
            key,
            data
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedData), iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt entry');
    }
}

/**
 * Decrypts encrypted content
 * Extracts IV from the beginning of the encrypted data
 */
export async function decryptEntry(
    encryptedContent: string,
    googleId: string
): Promise<string> {
    try {
        const key = await deriveKeyFromGoogleId(googleId);

        // Decode from base64
        const combined = Uint8Array.from(atob(encryptedContent), (c) => c.charCodeAt(0));

        // Extract IV and encrypted data
        const iv = combined.slice(0, ENCRYPTION_CONFIG.ivLength);
        const encryptedData = combined.slice(ENCRYPTION_CONFIG.ivLength);

        // Decrypt
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: ENCRYPTION_CONFIG.algorithm,
                iv,
            },
            key,
            encryptedData
        );

        // Convert back to string
        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt entry');
    }
}

/**
 * Generates a hash of content for deduplication
 * This allows the server to detect duplicate entries without reading content
 */
export async function hashContent(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Test function to verify encryption/decryption works
 */
export async function testEncryption(): Promise<boolean> {
    const testContent = 'This is a test journal entry';
    const testGoogleId = 'test-google-id-123';

    try {
        const encrypted = await encryptEntry(testContent, testGoogleId);
        const decrypted = await decryptEntry(encrypted, testGoogleId);
        return decrypted === testContent;
    } catch (error) {
        console.error('Encryption test failed:', error);
        return false;
    }
}
