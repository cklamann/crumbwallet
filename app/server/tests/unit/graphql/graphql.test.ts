/// <reference types="jest" />
import { graphql, Source } from 'graphql';
import * as mongoose from 'mongoose';
import { Schema } from '../../../graphql/index';
import { createPost } from '../../../models/factories/PostFactory';
import { createUser, makeUser } from '../../../models/factories/UserFactory';
import Posts from '../../../models/Posts';
import Users from '../../../models/Users';
import { decrypt } from '../../../util/encryption';

beforeAll(async () => {
	//https://jestjs.io/docs/en/mongodb
	await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }, err => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
	});
});

beforeEach(async () => {
	await Posts.deleteMany({});
	await createPost();
});

describe('basic schema test', () => {
	test('test that posts query works', async () => {
		const post = await Posts.findOne({}).exec(),
			query = `{ posts { title } }`,
			source = new Source(query);
		return graphql(Schema, source).then(result => {
			expect(result.data.posts.length).toBe(1);
			return;
		});
	});

	test('test that post query works', async () => {
		const post = await Posts.findOne({}),
			query = `{ post(id: "${post._id}") { title } }`,
			source = new Source(query);
		return graphql(Schema, source).then(result => {
			expect(result.data.post.title).toEqual(post.title);
			return;
		});
	});

	test('test that create post mutation works', async () => {
		const user = await createUser(),
			mutation = `mutation 
						  { createPost(input: 
							{ title: "foo" 
							  userId: "${user._id}" 
							  content: "<span></span>"
							}) 
							{ title } 
						}`,
			source = new Source(mutation);
		return graphql(Schema, source).then(result => {
			expect(result.data.createPost.title).toEqual('foo');
			return;
		});
	});

	test('test that create user mutation works', async () => {
		const mutation = `mutation 
						  { createUser(input: 
							{ name: "foo" 
							  username: "foo" 
							  password: "foo"
							  isAdmin: false
							}) 
							{ name } 
						}`,
			source = new Source(mutation);
		return graphql(Schema, source).then(result => {
			expect(result.data.createUser.name).toEqual('foo');
			return;
		});
	});

	test('test that user query works', async () => {
		await createUser();
		const user = await Users.findOne({}),
			query = `{ user(id: "${user._id}") { name } }`,
			source = new Source(query);
		return graphql(Schema, source).then(result => {
			expect(result.data.user.name).toEqual(user.name);
			return;
		});
	});

	test('test that login query works', async () => {
		await createUser();
		const user = await Users.findOne({});
		expect(user.token).toBeNull();
		const query = `{ user(username: "${user.username}" password: "${decrypt(user.password)}") { name token } }`,
			source = new Source(query);
		return graphql(Schema, source).then(result => {
			expect(result.data.user.name).toEqual(user.name);
			expect(result.data.user.token).toBeTruthy();
			return;
		});
	});
});
