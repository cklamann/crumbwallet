import { Document } from 'mongoose';
import * as faker from 'faker';
import Posts, { Post } from '../Posts';
import { makeUser } from './UserFactory';
import { get } from 'lodash';

export const createPost = (config?: Post) => {
	const post = makePost(config);
	return Posts.create(post);
};

const makeDraft = () => ({
	content: faker.lorem.sentence(25),
	active: true,
	created: new Date(),
	updated: new Date(),
});

export const makePost = (config?: Partial<Post>) => {
	const proto: Post = {
		title: faker.lorem.word(),
		user: get(config, 'user;') ? config.user : makeUser(),
		drafts: [makeDraft()],
		created: new Date(),
		updated: new Date(),
		published: new Date(),
	};
	return Object.assign({}, proto, config ? config : proto);
};
