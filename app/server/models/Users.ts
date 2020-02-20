import * as mongoose from 'mongoose';

export interface IUser {
	name: string;
	username: string;
	password: string;
	isAdmin: boolean;
	token: string;
}

export type IUserDoc = IUser & mongoose.Document;

export const userSchema = {
	name: {
		type: 'string',
		required: true,
	},
	isAdmin: {
		type: 'boolean',
		required: true,
	},
	username: {
		type: 'string',
		required: true,
	},
	password: {
		type: 'string',
		required: true,
	},
	token: {
		type: 'string',
		required: false,
	},
};

const Users = mongoose.model<IUserDoc>('User', new mongoose.Schema(userSchema), 'users');

export default Users;
