import { Document } from 'mongoose';
import * as faker from 'faker';
import Users, { IUser } from '../Users';
import { encrypt } from '../../util/encryption';

export const createUser = (config?: Partial<IUser>) => {
	const user = makeUser(config);
	user.password = encrypt(user.password);
	return Users.create(user);
};

export const makeUser = (config?: Partial<IUser>) => {
	const proto: IUser = {
		name: faker.fake('{{name.firstName}} {{name.lastName}}'),
		username: faker.company.bsNoun(),
		password: faker.random.word(),
		isAdmin: false,
		token: null,
	};
	return Object.assign({}, proto, config ? config : proto);
};
