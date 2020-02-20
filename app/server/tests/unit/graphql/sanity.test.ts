import { graphql, Source } from 'graphql';
import * as mongoose from 'mongoose';
import { Schema } from '../../../graphql/index';
import { createPost } from '../../../models/factories/PostFactory';
import Posts from '../../../models/Posts';

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
	await createPost()
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
});
