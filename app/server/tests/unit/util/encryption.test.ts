/// <reference types="jest" />
import { encrypt, decrypt } from '../../../util/encryption';

describe('encryption test', () => {
	test('test that encryptor works', () => {
		return expect(typeof encrypt('foo')).toBe('string');
	});

	test('test that decryptor works', () => {
		const encrypted = encrypt('foo');
		return expect(decrypt(encrypted)).toBe('foo');
	});
});
