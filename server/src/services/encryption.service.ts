import crypto from 'crypto';

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

class EncryptionService {
    /**
     * Generate RSA key pair for end-to-end encryption
     */
    generateKeyPair(): KeyPair {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });

        return { publicKey, privateKey };
    }

    /**
     * Encrypt message with recipient's public key
     */
    encryptMessage(message: string, publicKey: string): string {
        const buffer = Buffer.from(message, 'utf8');
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer
        );
        return encrypted.toString('base64');
    }

    /**
     * Decrypt message with recipient's private key
     */
    decryptMessage(encryptedMessage: string, privateKey: string): string {
        const buffer = Buffer.from(encryptedMessage, 'base64');
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer
        );
        return decrypted.toString('utf8');
    }

    /**
     * Hash data (for password hashing if needed)
     */
    hashData(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Generate random token
     */
    generateToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }
}

export default new EncryptionService();
