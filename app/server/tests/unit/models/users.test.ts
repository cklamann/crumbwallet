/// <reference types="jest" />
import * as mongoose from 'mongoose';
import { createUser } from '../../../models/factories/UserFactory';
import Users from '../../../models/Users';

beforeAll(async () => {
	//https://jestjs.io/docs/en/mongodb
	await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }, err => {
		if (err) {
			console.error(err);
			process.exit(1)	;
		}
	});
});

describe('user model test', () => {
	test('test that user query works', () => {
		return expect(Users.countDocuments({})).resolves.toBe(0);
	});

	
	test('test can add user', () => {
	 	return createUser().then(() => expect(Users.countDocuments({})).resolves.toBe(1)); 	
	});
});
