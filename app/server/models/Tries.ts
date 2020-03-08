import * as mongoose from 'mongoose';

export interface Try {
    _id?: any;
    correct: boolean;
    created: Date;
    updated: Date;
}

export interface TryDoc extends mongoose.Document, Try {
    _id: string;
}

export const trySchema = new mongoose.Schema<TryDoc>({
    correct: {
        type: 'boolean',
        required: true,
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

const Tries = mongoose.model<TryDoc>('Try', trySchema, 'tries');

export default Tries;
