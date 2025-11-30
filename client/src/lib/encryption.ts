/**
 * Client-side encryption utilities
 * This is a simplified implementation for demonstration.
 * In production, use a more robust library like WebCrypto API or similar.
 */

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

/**
 * Generate RSA key pair
 * Note: In the real implementation, keys would be generated on the backend
 * and the private key would never leave the client unencrypted.
 */
export async function generateKeyPair(): Promise<KeyPair> {
    // For demo purposes, we'll use the crypto.subtle API
    try {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt']
        );

        const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
        const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

        return {
            publicKey: arrayBufferToBase64(publicKey),
            privateKey: arrayBufferToBase64(privateKey),
        };
    } catch (error) {
        console.error('Error generating key pair:', error);
        // Fallback to simple encoding for demo
        return {
            publicKey: 'demo-public-key',
            privateKey: 'demo-private-key',
        };
    }
}

/**
 * Encrypt message with recipient's public key
 */
export async function encryptMessage(
    message: string,
    publicKey: string
): Promise<string> {
    try {
        // For demo purposes, we'll use simple base64 encoding
        // In production, use proper RSA encryption
        return btoa(message);
    } catch (error) {
        console.error('Error encrypting message:', error);
        return message;
    }
}

/**
 * Decrypt message with own private key
 */
export async function decryptMessage(
    encryptedMessage: string,
    privateKey: string
): Promise<string> {
    try {
        // For demo purposes, we'll use simple base64 decoding
        // In production, use proper RSA decryption
        return atob(encryptedMessage);
    } catch (error) {
        console.error('Error decrypting message:', error);
        return encryptedMessage;
    }
}

/**
 * Helper: Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Helper: Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
