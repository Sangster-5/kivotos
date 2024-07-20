import { createCipheriv, createDecipheriv } from "crypto";

export const key = Buffer.from('e6f5c8a8f23c8e69f3dc4b88e3b17bb9cbb9f238c3c7e8e9b3f7b8d8e8f7e8b9', 'hex');
export const iv = Buffer.from('3c7f9e8b7e6f8b7d9e7b3c9d3e8f7e6f', 'hex');

export function encrypt(text: string): string {
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return encrypted.toString('hex');
}
  
export function decrypt(encrypted: string): string {
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
}