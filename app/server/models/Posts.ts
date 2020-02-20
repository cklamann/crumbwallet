import * as mongoose from 'mongoose';
import { IUser, userSchema } from './Users';
import { sortDesc } from '../util/sort';
import { remove } from 'lodash';

export interface Post {
	_id?: any;
	drafts: Draft[];
	title: string;
	user: IUser;
	created: Date;
	published: Date;
	updated: Date;
}

export interface Draft {
	_id?: any;
	active: boolean;
	content: string;
	created: Date;
	updated: Date;
}

export interface PostDoc extends mongoose.Document, Post {
	_id: string;
	addDraft: (draft: Draft) => Promise<Post>;
	getPosts: () => Promise<Post[]>;
	updateDraft: (draft: Partial<Draft>) => Promise<Post>;
}

export interface DraftDoc extends mongoose.Document, Draft {
	_id: string;
}

const draftSchema = new mongoose.Schema<DraftDoc>({
	content: {
		type: 'string',
		required: true,
	},
	active: {
		type: 'boolean',
		required: false,
	},
	created: {
		type: 'date',
		required: true,
	},
	updated: {
		type: 'date',
		required: false,
	},
});

const postSchema = new mongoose.Schema<PostDoc>({
	title: {
		type: 'string',
		required: true,
	},
	user: userSchema,
	drafts: {
		type: 'array',
		of: draftSchema,
	},
	created: {
		type: 'date',
		required: true,
	},
	updated: {
		type: 'date',
		required: false,
	},
	published: {
		type: 'date',
		require: false,
	},
});

postSchema.methods.addDraft = function(draft: Draft) {
	if (!draft.created) {
		draft.created = new Date();
	}
	this.drafts.push(draft);
	return this.save();
};

postSchema.methods.updateDraft = function(draft: Partial<Draft>) {
	const targetDraft = remove(this.drafts, (dr: Draft) => dr._id === draft._id),
		updated = Object.assign({ updated: new Date() }, targetDraft, draft);
	this.drafts.push(updated);
	return this.save();
};

const Posts = mongoose.model<PostDoc>('Post', postSchema, 'posts');

export default Posts;
