import * as mongoose from 'mongoose';
import { Card, cardSchema } from './Cards';
import { remove } from 'lodash';

export interface Deck {
    _id?: any;
    name: string;
    cards: Card[];
    categories: string[];
    created: Date;
    updated: Date;
}

export interface DeckDoc extends mongoose.Document, Deck {
    _id: string;
    addCard: (card: Card) => Promise<Deck>;
    getDecks: () => Promise<Deck[]>;
    updateCard: (card: Partial<Card>) => Promise<Deck>;
}

const deckSchema = new mongoose.Schema<DeckDoc>({
    name: {
        type: 'string',
        required: true,
    },
    cards: {
        type: 'array',
        of: cardSchema,
    },
    categories: {
        type: 'array',
        of: 'string',
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

deckSchema.methods.addCard = function(card: Card) {
    if (!card.created) {
        card.created = new Date();
    }
    if (!card._id) {
        card._id = mongoose.Types.ObjectId();
    }
    this.cards.push(card);
    return this.save();
};

deckSchema.methods.updateCard = function(card: Partial<Card>) {
    const targetCard = remove(this.cards, (cd: Card) => cd._id === card._id),
        updated = Object.assign({ updated: new Date() }, targetCard, card);
    this.cards.push(updated);
    return this.save();
};

const Decks = mongoose.model<DeckDoc>('Deck', deckSchema, 'decks');

export default Decks;
