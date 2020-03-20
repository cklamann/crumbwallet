import {
    GraphQLSchema,
    GraphQLBoolean,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLString,
    GraphQLNonNull,
    GraphQLSkipDirective,
} from 'graphql';
import Decks, { Deck, DeckDoc } from '../models/Decks';
import { Try } from 'Models/Tries';
import Cards, { Card } from 'Models/Cards';
import { get } from 'lodash';

const queryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: () => ({
        card: {
            type: cardType,
            args: {
                _id: {
                    type: GraphQLNonNull(GraphQLString),
                },
            },
            resolve: async (_source, args, context, info) => Decks.schema.statics.findCardById(args._id),
        },
        deck: {
            type: deckType,
            args: {
                _id: {
                    type: GraphQLNonNull(GraphQLString),
                },
            },
            resolve: async (_source, args, context, info) => Decks.findById(args._id),
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
        deleteDeck: {
            type: GraphQLBoolean,
            args: {
                _id: {
                    type: GraphQLNonNull(GraphQLString),
                },
            },
            resolve: async (_source, { _id }) => {
                const res = await Decks.findByIdAndDelete(_id);
                return res ? true : false;
            },
        },
        addCard: {
            type: new GraphQLObjectType({
                name: '_id',
                description: 'ID of the new card',
                fields: () => ({
                    _id: {
                        type: GraphQLString,
                        description: 'The id of the deck.',
                    },
                }),
            }),
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
                const deck: DeckDoc = await Decks.schema.statics.findByCardId(_id);
                deck.cards = deck.cards.filter(c => c._id != _id);
                return deck.save();
            },
        },
        updateCard: {
            type: cardType,
            args: {
                input: {
                    type: GraphQLNonNull(updateCardInputType),
                },
            },
            resolve: async (_source, { input }) => {
                const { _id, ...fields } = input,
                    deck: DeckDoc = await Decks.schema.statics.findByCardId(_id),
                    card = { ...deck.cards.find(c => c._id == _id), ...fields, ...{ updated: new Date() } };

                deck.cards = deck.cards.map(c => (c._id == _id ? card : c));
                await deck.save();
                return card;
            },
        },
        addTry: {
            type: deckType,
            args: {
                input: {
                    type: GraphQLNonNull(newTryInputType),
                },
            },
            resolve: async (_source, { input }) => {
                const { cardId, ...fields } = input,
                    deck = await Decks.schema.statics.findByCardId(cardId);
                return deck.addTry(cardId, { ...fields, created: new Date(), updated: new Date() });
            },
        },
        updateTry: {
            type: deckType,
            args: {
                input: {
                    type: GraphQLNonNull(updateTryInputType),
                },
            },
            resolve: async (_source, { input }) => {
                const { tryId, ...fields } = input,
                    deck: DeckDoc = await Decks.schema.statics.findByTryId(tryId);
                deck.cards = deck.cards.map(c =>
                    get(c, 'tries', []).find(t => t._id == tryId)
                        ? {
                              ...c,
                              ...{
                                  tries: c.tries.map(t =>
                                      t._id == tryId ? { ...t, updated: new Date(), ...fields } : t
                                  ),
                              },
                          }
                        : c
                );
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
        choices: {
            type: GraphQLList(GraphQLString),
            description: 'Plain text multiple choice answers',
        },
    }),
});

const updateCardInputType = new GraphQLInputObjectType({
    name: 'updateCardInput',
    fields: () => ({
        _id: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The _id of the card',
        },
        answer: {
            type: GraphQLString,
            description: 'The plain text answer.',
        },
        details: {
            type: GraphQLString,
            description: 'The plain text details.',
        },
        handle: {
            type: GraphQLString,
            description: 'The name of the card',
        },
        imageKey: {
            type: GraphQLString,
            description: 'The url of the image prompt',
        },
        choices: {
            type: GraphQLList(GraphQLString),
            description: 'Plain text multiple choice answers',
        },
        prompt: {
            type: GraphQLString,
            description: 'The HTML Prompt.',
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
        answer: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The plain text answer.',
        },
        details: {
            type: GraphQLString,
            description: 'The plain text details.',
        },
        handle: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The name of the card',
        },
        imageKey: {
            type: GraphQLString,
            description: 'Url of the image prompt',
        },
        choices: {
            type: new GraphQLList(GraphQLString),
            description: 'Plain text multiple choice choices',
        },
        prompt: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The HTML Prompt.',
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

const newTryInputType = new GraphQLInputObjectType({
    name: 'newTryInput',
    fields: () => ({
        cardId: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The _id of the containing card',
        },
        correct: {
            type: GraphQLNonNull(GraphQLBoolean),
            description: 'Whether the try was successful.',
        },
    }),
});

const updateTryInputType = new GraphQLInputObjectType({
    name: 'updateTryInput',
    fields: () => ({
        tryId: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The _id of the try',
        },
        correct: {
            type: GraphQLNonNull(GraphQLBoolean),
            description: 'Whether the try was successful.',
        },
    }),
});

export const Schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});
