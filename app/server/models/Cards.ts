import * as mongoose from 'mongoose';
import { Try, trySchema } from './Tries';

export interface Card {
    _id?: any;
    prompt: string;
    answer: string;
    tries: Try[];
    created: Date;
    updated: Date;
}

export interface CardDoc extends mongoose.Document, Card {
    _id: string;
    addTry: (t: Try) => Promise<Try>;
}

export const cardSchema = new mongoose.Schema<CardDoc>({
    prompt: {
        type: 'string',
        required: true,
    },
    answer: {
        type: 'string',
        required: true,
    },
    tries: {
        type: 'array',
        of: trySchema,
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
    this.tries.push(t);
    return this.save();
};

const Cards = mongoose.model<CardDoc>('Card', cardSchema, 'cards');

export default Cards;
