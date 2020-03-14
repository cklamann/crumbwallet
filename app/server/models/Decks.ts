import * as mongoose from 'mongoose';
import { Card, cardSchema } from './Cards';
import { Try } from './Tries';
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
    addCard: (card: Card) => Promise<string>;
    getDecks: () => Promise<Deck[]>;
    addTry: (cardId: string, tr: Try) => Promise<Deck>;
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

deckSchema.static('findByCardId', (cardId: string) => Decks.findOne({ 'cards._id': mongoose.Types.ObjectId(cardId) }));

deckSchema.static('findCardById', (cardId: string) =>
    Decks.findOne({ 'cards._id': mongoose.Types.ObjectId(cardId) }).then(res => res.cards.find(c => c._id == cardId))
);

deckSchema.methods.addCard = function(card: Card) {
    if (!card.created) {
        card.created = new Date();
    }
    if (!card._id) {
        card._id = mongoose.Types.ObjectId();
    }
    if (!card.tries) {
        //test: does specifying a default value free us from having to use
        //markModified?
        card.tries = [];
    }
    this.cards.push(card);
    return this.save().then(() => card._id);
};

deckSchema.methods.addTry = function(cardId: string, tr: Try) {
    tr._id = mongoose.Types.ObjectId();
    (this.cards as Card[]).find(c => c._id == cardId).tries.push(tr);
    //https://github.com/Automattic/mongoose/issues/1204
    this.markModified('cards');
    return this.save();
};

deckSchema.statics.findByCardId = function(cardId: string) {
    return Decks.findOne({ 'cards._id': mongoose.Types.ObjectId(cardId) });
};

deckSchema.statics.findByTryId = function(tryId: string) {
    return Decks.findOne({ 'cards.tries._id': mongoose.Types.ObjectId(tryId) });
};

deckSchema.methods.updateCard = function(card: Partial<Card>) {
    const targetCard = remove(this.cards, (cd: Card) => cd._id === card._id),
        updated = Object.assign({ updated: new Date() }, targetCard, card);
    this.cards.push(updated);
    return this.save();
};

const Decks = mongoose.model<DeckDoc>('Deck', deckSchema, 'decks');

export default Decks;
