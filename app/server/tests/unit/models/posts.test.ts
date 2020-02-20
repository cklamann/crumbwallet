/// <reference types="jest" />
import * as mongoose from 'mongoose';
import { createPost } from '../../../models/factories/PostFactory';
import Posts, { Draft, DraftDoc } from '../../../models/Posts';
import faker from 'faker';

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
});

describe('post model test', () => {
	test('test that post query works', () => {
		return expect(Posts.countDocuments({})).resolves.toBe(0);
	});

	test('test can add post', async () => {
		return createPost().then(() => expect(Posts.countDocuments({})).resolves.toBe(1));
	});

	test('test can add draft', async () => {
		const post = await createPost(),
			newDraft: Draft = {
				content: 'stg',
				active: false,
				created: new Date(),
				updated: new Date(),
			};

		return post.addDraft(newDraft).then(res => expect(res.drafts.length).toBe(2));
	});

	test('test can update draft', async () => {
		const post = await createPost(),
			newDraft: Partial<DraftDoc> = {
				active: true,
				_id: post.drafts[0]._id,
			};

		return post.updateDraft(newDraft).then(res => {
			expect(res.drafts.length).toBe(1);
			expect(res.drafts[0].active).toBeTruthy();
		});
	});
});
