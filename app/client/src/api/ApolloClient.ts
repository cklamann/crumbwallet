import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { DocumentNode, GraphQLEnumType } from 'graphql';
import { InMemoryCache } from 'apollo-cache-inmemory';
import Auth from '@aws-amplify/auth';
import { createAppSyncLink } from 'aws-appsync';
import awsconfig from './../aws-exports';
import { createHttpLink } from 'apollo-link-http';
import { useQuery, useMutation, QueryHookOptions } from '@apollo/react-hooks';
import { Deck } from 'Models/Decks';
import { Card } from 'Models/Cards';

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

export const client = new ApolloClient({
    link: awsLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export const useApolloQuery = <T>(query: DocumentNode, choices: QueryHookOptions = {}) =>
    useQuery<T>(query, { client, fetchPolicy: 'no-cache', ...choices });
export const useApolloMutation = <T>(query: DocumentNode, choices: QueryHookOptions = {}) =>
    useMutation<T>(query, { client, fetchPolicy: 'no-cache', ...choices });

const fetchDecksQuery = gql`
    query {
        decks {
            id
            name
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

export const useDeleteDeckMutation = () => useApolloMutation<{ deleted: boolean }>(deleteDeckMutation);

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
        $type: Type
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

export const useUpdateCardMutation = () => useApolloMutation<{ card: { id: string } }>(updateCardMutation);

const deleteCardMutation = gql`
    mutation deleteCard($id: String!, $deckId: String!) {
        deleteCard(id: $id, deckId: $deckId) {
            deleted
        }
    }
`;

export const useDeleteCardMutation = () => useApolloMutation<{ deleted: boolean }>(deleteCardMutation);

const addCardMutation = gql`
    mutation addCard($deckId: String!) {
        addCard(
            input: {
                deckId: $deckId
                handle: "New Card"
                prompt: "New Prompt"
                answer: "New answer"
                details: "<p>new details</p>"
                type: "standard"
            }
        ) {
            id
        }
    }
`;

export const useAddCardMutation = () => useApolloMutation<{ addCard: { id: string } }>(addCardMutation);

const addDeckMutation = gql`
    mutation whocaresswhatthisiscalled($name: String!, $categories: [String], $userId: String) {
        createDeck(input: { name: $name, categories: $categories, userId: $userId }) {
            id
        }
    }
`;

export const useAddDeckMutation = () => useApolloMutation<{ createDeck: { id: string } }>(addDeckMutation);

const updateDeckMutation = gql`
    mutation deck($id: String!, $name: String, $categories: [String], $details: String) {
        updateDeck(input: { id: $id, name: $name, categories: $categories, details: $details }) {
            id
        }
    }
`;

export const useUpdateDeckMutation = () => useApolloMutation<{ addCard: { id: string } }>(updateDeckMutation);

const addTryMutation = gql`
    mutation addTry($cardId: String!, $correct: Boolean!) {
        addTry(input: { cardId: $cardId, correct: $correct }) {
            added
        }
    }
`;

export const useAddTryMutation = () => useApolloMutation<{ addTry: { added: boolean } }>(addTryMutation);
