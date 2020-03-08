import {
    GraphQLSchema,
    GraphQLBoolean,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql';
import mongoose from 'mongoose';
import Decks, { Deck } from '../models/Decks';
import { Try } from '../models/Tries';
import { Card } from '../models/Cards';
import { IUser } from '../models/Users';

const queryType = new GraphQLObjectType<any, { user: IUser }, any>({
    name: 'RootQuery',
    fields: () => ({
        deck: {
            type: deckType,
            args: {
                id: {
                    type: GraphQLString,
                },
            },
            resolve: async (_source, args, context, info) => Decks.findById(args.id),
        },
        decks: {
            type: new GraphQLList(deckType),
            resolve: async (_source, args, context, info) => Decks.find({}),
        },
    }),
});

const mutationType = new GraphQLObjectType({
    name: 'RootMutation',
    fields: () => ({
        createDeck: {
            type: deckType,
            args: {
                input: {
                    type: GraphQLNonNull(newDeckInputType),
                },
            },
            resolve: async (_source, { input }) => {
                input.cards = [];
                return Decks.create({ ...input, created: new Date() });
            },
        },
        updateDeck: {
            type: deckType,
            args: {
                input: {
                    type: GraphQLNonNull(updateDeckInputType),
                },
            },
            resolve: async (_source, { input }) => {
                const { _id, ...fields } = input;
                return Decks.findByIdAndUpdate(_id, fields, { new: true });
            },
        },
        addCard: {
            type: deckType,
            args: {
                input: {
                    type: GraphQLNonNull(newCardInputType),
                },
            },
            resolve: async (_source, { input }) => {
                const { deckId, ...fields } = input,
                    deck = await Decks.findById(deckId);
                return deck.addCard(fields);
            },
        },
        deleteCard: {
            type: deckType,
            args: {
                _id: {
                    type: GraphQLNonNull(GraphQLString),
                },
            },
            resolve: async (_source, { _id }) => {
                const deck = await Decks.findOne({ 'cards._id': mongoose.Types.ObjectId(_id) });
                deck.cards = deck.cards.filter(c => c._id != _id);
                return deck.save();
            },
        },
        updateCard: {
            type: deckType,
            args: {
                input: {
                    type: GraphQLNonNull(updateCardInputType),
                },
            },
            resolve: async (_source, { input }) => {
                const { cardId, ...fields } = input,
                    deck = await Decks.findOne({ 'cards._id': mongoose.Types.ObjectId(cardId) });
                deck.cards = deck.cards.map(c => {
                    return c._id == cardId
                        ? {
                              c,
                              ...fields,
                          }
                        : c;
                });
                return deck.save();
            },
        },
    }),
});

const newDeckInputType = new GraphQLInputObjectType({
    name: 'NewDeckInput',
    fields: () => ({
        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The name of the deck.',
        },
        categories: {
            type: GraphQLList(GraphQLString),
            description: 'The list of deck categories.',
        },
    }),
});

const updateDeckInputType = new GraphQLInputObjectType({
    name: 'UpdateDeckInput',
    fields: () => ({
        _id: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The deck id',
        },
        name: {
            type: GraphQLString,
            description: 'The name of the deck.',
        },
        categories: {
            type: GraphQLList(GraphQLString),
            description: 'The list of deck categories.',
        },
        details: {
            type: GraphQLString,
            description: 'The HTML details.',
        },
    }),
});

const newCardInputType = new GraphQLInputObjectType({
    name: 'newCardInput',
    fields: () => ({
        deckId: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The _id of the containing deck',
        },
        prompt: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The HTML Prompt.',
        },
        answer: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The plain text answer.',
        },
        details: {
            type: GraphQLString,
            description: 'The HTML details.',
        },
        options: {
            type: GraphQLList(GraphQLString),
            description: 'Plain text multiple choice answers',
        },
    }),
});

const updateCardInputType = new GraphQLInputObjectType({
    name: 'updateCardInput',
    fields: () => ({
        cardId: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The _id of the card',
        },
        prompt: {
            type: GraphQLString,
            description: 'The HTML Prompt.',
        },
        answer: {
            type: GraphQLString,
            description: 'The HTML answer.',
        },
        details: {
            type: GraphQLString,
            description: 'The HTML details.',
        },
        options: {
            type: GraphQLList(GraphQLString),
            description: 'Plain text multiple choice answers',
        },
    }),
});

const deckType = new GraphQLObjectType<Deck>({
    name: 'Deck',
    description: 'A deck.',
    fields: () => ({
        _id: {
            type: GraphQLString,
            description: 'The id of the deck.',
        },
        name: {
            type: GraphQLString,
            description: 'The name of the deck.',
        },
        cards: {
            type: new GraphQLList(cardType),
            description: 'list of cards.',
        },
        categories: {
            type: new GraphQLList(GraphQLString),
            description: 'list of categories.',
        },
        created: {
            type: GraphQLString,
            description: 'when the deck was created',
        },
        updated: {
            type: GraphQLString,
            description: 'When the deck was updated',
        },
        published: {
            type: GraphQLString,
            description: 'When the deck was published',
        },
    }),
});

const cardType = new GraphQLObjectType<Card>({
    name: 'Card',
    description: 'A card.',
    fields: () => ({
        _id: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The id of the card.',
        },
        prompt: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The HTML Prompt.',
        },
        answer: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The plain text answer.',
        },
        details: {
            type: GraphQLString,
            description: 'The HTML details.',
        },
        options: {
            type: new GraphQLList(GraphQLString),
            description: 'Plain text multiple choice options',
        },
        tries: {
            type: new GraphQLList(tryType),
            description: 'list of tries',
        },
        created: {
            type: GraphQLString,
            description: 'when the post was created',
        },
        updated: {
            type: GraphQLString,
            description: 'When the post was updated',
        },
    }),
});

const tryType = new GraphQLObjectType<Try>({
    name: 'try',
    description: 'A try.',
    fields: () => ({
        _id: {
            type: GraphQLString,
            description: 'The id of the try.',
        },
        correct: {
            type: GraphQLBoolean,
            description: 'Was the try correct?',
        },
        created: {
            type: GraphQLString,
            description: 'when the post was created',
        },
        updated: {
            type: GraphQLString,
            description: 'When the post was updated',
        },
    }),
});

export const Schema = new GraphQLSchema({
    query: queryType,
    //dunno if i need all these?
    types: [deckType],
    mutation: mutationType,
});
