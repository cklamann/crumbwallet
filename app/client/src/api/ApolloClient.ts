import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';
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
            id
            prompt
            answer
            imageKey
            details
            choices
            handle
        }
    }
`;

export const useFetchCardQuery = (id: string) =>
    useApolloQuery<{ card: Card }>(fetchCardQuery, {
        variables: { id },
    });

const updateCardMutation = gql`
    mutation card(
        $id: String!
        $deckId: String!
        $prompt: String
        $answer: String
        $details: String
        $handle: String
        $imageKey: String
        $choices: [String]
    ) {
        updateCard(
            input: {
                id: $id
                deckId: $deckId
                prompt: $prompt
                answer: $answer
                details: $details
                handle: $handle
                imageKey: $imageKey
                choices: $choices
            }
        ) {
            id
        }
    }
`;

export const useUpdateCardMutation = () => useApolloMutation<{ card: { id: string } }>(updateCardMutation);

const deleteCardMutation = gql`
    mutation deleteCard($id: String!) {
        deleteCard(id: $id) {
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
                prompt: "<p>New Prompt</p>"
                answer: "New answer"
                details: "new details"
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
