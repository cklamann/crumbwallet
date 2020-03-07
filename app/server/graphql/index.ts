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
import Decks, { Deck } from '../models/Decks';
import Tries, { Try } from '../models/Tries';
import Cards, { Card } from '../models/Cards';
import { IUser } from '../models/Users';
import { encrypt } from '../util/encryption';
import { logger } from '../server';

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
                    type: GraphQLNonNull(deckInputType),
                },
            },
            resolve: async (_source, { input }) => {
                input.cards = [];
                return Decks.create(input);
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
    }),
});

const deckInputType = new GraphQLInputObjectType({
    name: 'DeckInput',
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

const newCardInputType = new GraphQLInputObjectType({
    name: 'CardInput',
    fields: () => ({
        deckId: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The _id of the containing deck',
        },
        prompt: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The HTML Prompt.',
        },
        amswer: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The HTML answer.',
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
            type: GraphQLString,
            description: 'The id of the card.',
        },
        prompt: {
            type: GraphQLString,
            description: 'The HTML Prompt.',
        },
        answer: {
            type: GraphQLString,
            description: 'The HTML answer.',
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

const userType = new GraphQLObjectType<IUser>({
    name: 'User',
    description: 'A user.',
    fields: () => ({
        _id: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The id of the user.',
        },
        name: {
            type: GraphQLString,
            description: 'The name of the user.',
        },
        isAdmin: {
            type: GraphQLBoolean,
            description: 'Is the user an admin.',
        },
        username: {
            type: GraphQLString,
            description: 'Username.',
        },
        password: {
            type: GraphQLString,
            description: 'Password',
        },
        token: {
            type: GraphQLString,
            description: 'Api Token',
        },
    }),
});

export const Schema = new GraphQLSchema({
    query: queryType,
    //dunno if i need all these
    types: [deckType, userType, tryType, cardType, userInputType, postInputType],
    mutation: mutationType,
});
