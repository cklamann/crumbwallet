import * as crypto from 'crypto';
require('dotenv').config();

//encryption

const key = crypto.scryptSync(process.env.ENCRYPTION_PASSWORD, 'salt', 24);
const iv = Buffer.alloc(16, 0);

const decrypt = (encrypted: string) => {
	const decipher = crypto.createDecipheriv(process.env.ENCRYPTION_ALGORITHM, key, iv);
	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
};

const encrypt = (string: string) => {
	const cipher = crypto.createCipheriv(process.env.ENCRYPTION_ALGORITHM, key, iv);
	let encrypted = cipher.update(string, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
};

export { encrypt, decrypt };
