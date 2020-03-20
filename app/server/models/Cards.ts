import * as mongoose from 'mongoose';
import { Try, trySchema } from './Tries';

export interface Card {
    _id?: any;
    answer: string;
    details: string;
    handle: string;
    choices: string[];
    imageKey?: string;
    tries: Try[];
    prompt: string;
    created: Date;
    updated: Date;
}

export interface CardDoc extends mongoose.Document, Card {
    _id: string;
    addTry: (t: Try) => Promise<Try>;
}

export const cardSchema = new mongoose.Schema<CardDoc>({
    answer: {
        type: 'string',
        required: true,
    },
    details: {
        type: 'string',
    },
    handle: {
        type: 'string',
        required: true,
    },
    choices: {
        type: 'array',
        of: 'string',
    },
    prompt: {
        type: 'string',
        required: true,
    },
    tries: {
        type: [trySchema],
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

cardSchema.methods.addTry = function(t: Try) {
    if (!t.created) {
        t.created = new Date();
    }
    if (!t._id) {
        t._id = mongoose.Types.ObjectId();
    }
    this.tries.push(t);
    return this.save();
};

const Cards = mongoose.model<CardDoc>('Card', cardSchema, 'cards');

export default Cards;
