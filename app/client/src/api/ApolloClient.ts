import ApolloClient from 'apollo-client';
import { ApolloLink, from } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { useQuery, useMutation, QueryHookOptions } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { useDispatch } from 'react-redux';
import gql from 'graphql-tag';
import { DocumentNode, GraphQLEnumType } from 'graphql';
import Auth from '@aws-amplify/auth';
import { createAppSyncLink } from 'aws-appsync';
import awsconfig from './../aws-exports';
import { Deck } from 'Models/Decks';
import { Card } from 'Models/Cards';
import { get, uniqueId } from 'lodash';

const httpLink = createHttpLink({
    uri: awsconfig.aws_appsync_graphqlEndpoint,
});

const awsLink = createAppSyncLink({
    url: awsconfig.aws_appsync_graphqlEndpoint,
    region: awsconfig.aws_appsync_region,
    auth: {
        type: awsconfig.aws_appsync_authenticationType as any, //type widening....
        credentials: () => Auth.currentCredentials(),
        jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken(),
    },
    complexObjectsCredentials: () => Auth.currentCredentials(),
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
    if (networkError) console.error(`[Network error]: ${networkError}`);
});

const localLink = new ApolloLink((operation, forward) => {
    const { dispatch, uid } = operation.getContext();

    //could be a sync state update
    setTimeout(() => dispatch({ type: 'LOADING', payload: uid }));

    return forward(operation).map((response) => {
        dispatch({ type: 'LOADED', payload: uid });

        if (!!get(response, 'errors.length', 0)) {
            dispatch({ type: 'ERROR', payload: response.errors });
        }

        return response;
    });
});

export const client = new ApolloClient({
    link: from([localLink, errorLink, awsLink, httpLink]),
    cache: new InMemoryCache(),
});

export const useApolloQuery = <T>(query: DocumentNode, choices: QueryHookOptions = {}) => {
    const dispatch = useDispatch();
    return useQuery<T>(query, {
        client,
        context: { uid: uniqueId(), dispatch },
        fetchPolicy: 'no-cache',
        ...choices,
    });
};

export const useApolloMutation = <T, V>(query: DocumentNode) => {
    const dispatch = useDispatch();

    return useMutation<T, V>(query, {
        client,
        fetchPolicy: 'no-cache',
        context: { uid: uniqueId(), dispatch },
    });
};

const fetchDecksQuery = gql`
    query {
        decks {
            id
            name
            type
        }
    }
`;

const Type = new GraphQLEnumType({
    name: 'Type',
    values: { quotation: { value: 'quotation' }, standard: { value: 'standard' } },
});

export const useFetchDecksQuery = () => useApolloQuery<{ decks: Deck[] }>(fetchDecksQuery);

const fetchDeckQuery = gql`
    query fetchDeck($id: String!) {
        deck(id: $id) {
            id
            name
            type
            cards {
                id
                answer
                choices
                details
                handle
                imageKey
                prompt
                type
            }
        }
    }
`;

export const useFetchDeckQuery = (id: string) =>
    useApolloQuery<{ deck: Deck }>(fetchDeckQuery, {
        variables: { id },
    });

const deleteDeckMutation = gql`
    mutation deleteDeck($id: String!) {
        deleteDeck(id: $id) {
            deleted
        }
    }
`;

export const useDeleteDeckMutation = () => useApolloMutation<{ deleted: boolean }, { id: string }>(deleteDeckMutation);

const fetchCardQuery = gql`
    query fetchCard($id: String!) {
        card(id: $id) {
            answer
            choices
            details
            handle
            id
            type
            imageKey
            prompt
        }
    }
`;

export const useCreateChessDiagramPngUrlMutation = () =>
    useApolloMutation<{ createChessDiagram: { key: string } }, { pgn: string; savePath: string }>(
        createChessDiagramPng
    );

const createChessDiagramPng = gql`
    mutation createChessDiagram($pgn: String!, $savePath: String!) {
        createChessDiagram(input: { pgn: $pgn, savePath: $savePath }) {
            key
        }
    }
`;

export const useFetchCardQuery = (id: string) =>
    useApolloQuery<{ card: Card }>(fetchCardQuery, {
        variables: { id },
    });

const updateCardMutation = gql`
    mutation card(
        $answer: String
        $choices: [String]
        $deckId: String!
        $details: String
        $handle: String
        $id: String!
        $imageKey: String
        $prompt: String
        $type: NewCardType
    ) {
        updateCard(
            input: {
                answer: $answer
                choices: $choices
                deckId: $deckId
                details: $details
                handle: $handle
                id: $id
                imageKey: $imageKey
                prompt: $prompt
                type: $type
            }
        ) {
            id
        }
    }
`;

export const useUpdateCardMutation = () =>
    useApolloMutation<
        { card: { id: string } },
        {
            id: string;
            deckId: string;
            answer?: string;
            choices?: string[];
            handle?: string;
            imageKey?: string;
            prompt?: string;
            type?: NewCardType;
        }
    >(updateCardMutation);

const deleteCardMutation = gql`
    mutation deleteCard($id: String!, $deckId: String!) {
        deleteCard(id: $id, deckId: $deckId) {
            deleted
        }
    }
`;

export const useDeleteCardMutation = () =>
    useApolloMutation<{ deleted: boolean }, { id: string; deckId: string }>(deleteCardMutation);

const addCardMutation = gql`
    mutation addCard(
        $answer: String!
        $choices: [String]
        $deckId: String!
        $details: String
        $handle: String!
        $imageKey: String
        $prompt: String!
        $type: NewCardType
    ) {
        addCard(
            input: {
                answer: $answer
                choices: $choices
                deckId: $deckId
                details: $details
                handle: $handle
                imageKey: $imageKey
                prompt: $prompt
                type: $type
            }
        ) {
            id
        }
    }
`;

type NewCardType = 'standard' | 'quotation';

export const useAddCardMutation = () =>
    useApolloMutation<
        { addCard: { id: string } },
        {
            answer: string;
            choices?: string[];
            deckId: string;
            details?: string;
            handle: string;
            imageKey?: string;
            prompt: string;
            type?: NewCardType;
        }
    >(addCardMutation);

const addDeckMutation = gql`
    mutation createDeckNameUnimportant(
        $name: String!
        $categories: [String]
        $type: String
        $userId: String
        $private: Boolean!
    ) {
        createDeck(input: { name: $name, categories: $categories, userId: $userId, private: $private, type: $type }) {
            id
        }
    }
`;

export const useAddDeckMutation = () =>
    useApolloMutation<
        { createDeck: { id: string } },
        { name: string; categories?: string[]; type?: string; userId?: string; private: boolean }
    >(addDeckMutation);

const updateDeckMutation = gql`
    mutation deck($id: String!, $name: String, $categories: [String], $details: String) {
        updateDeck(input: { id: $id, name: $name, categories: $categories, details: $details }) {
            id
        }
    }
`;

export const useUpdateDeckMutation = () =>
    useApolloMutation<
        { addCard: { id: string } },
        { id: string; name?: string; categories?: string; details?: string }
    >(updateDeckMutation);

const addTryMutation = gql`
    mutation addTry($cardId: String!, $correct: Boolean!) {
        addTry(input: { cardId: $cardId, correct: $correct }) {
            added
        }
    }
`;

export const useAddTryMutation = () =>
    useApolloMutation<{ addTry: { added: boolean } }, { cardId: string; correct: boolean }>(addTryMutation);
