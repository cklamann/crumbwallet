import ApolloClient, { gql, DocumentNode } from 'apollo-boost';
import { useQuery, useMutation, QueryHookOptions } from '@apollo/react-hooks';
import { Deck } from 'Models/Decks';
import { Card } from 'Models/Cards';

const port = process.env.APP_PORT;
const host = process.env.APP_HOST === '0.0.0.0' ? 'localhost' : process.env.APP_HOST;

const client = new ApolloClient<any>({
    uri: `http://${host}:${port}/graphql`,
});

export const useApolloQuery = <T>(query: DocumentNode, choices: QueryHookOptions = {}) =>
    useQuery<T>(query, { client, fetchPolicy: 'no-cache', ...choices });
export const useApolloMutation = <T>(query: DocumentNode, choices: QueryHookOptions = {}) =>
    useMutation<T>(query, { client, fetchPolicy: 'no-cache', ...choices });

const fetchDecksQuery = gql`
    query {
        decks {
            _id
            name
        }
    }
`;

export const useFetchDecksQuery = () => useApolloQuery<{ decks: Deck[] }>(fetchDecksQuery);

const fetchDeckQuery = gql`
    query fetchDeck($_id: String!) {
        deck(_id: $_id) {
            _id
            name
            cards {
                _id
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

export const useFetchDeckQuery = (_id: string) =>
    useApolloQuery<{ deck: Deck }>(fetchDeckQuery, {
        variables: { _id },
    });

const deleteDeckMutation = gql`
    mutation deleteDeck($_id: String!) {
        deleteDeck(_id: $_id) {
            deleted
        }
    }
`;

export const useDeleteDeckMutation = () => useApolloMutation<{ deleted: boolean }>(deleteDeckMutation);

const fetchCardQuery = gql`
    query fetchCard($_id: String!) {
        card(_id: $_id) {
            _id
            prompt
            answer
            imageKey
            details
            choices
            handle
        }
    }
`;

export const useFetchCardQuery = (_id: string) =>
    useApolloQuery<{ card: Card }>(fetchCardQuery, {
        variables: { _id },
    });

const updateCardMutation = gql`
    mutation card(
        $_id: String!
        $prompt: String
        $answer: String
        $details: String
        $handle: String
        $imageKey: String
        $choices: [String!]
    ) {
        updateCard(
            input: {
                _id: $_id
                prompt: $prompt
                answer: $answer
                details: $details
                handle: $handle
                imageKey: $imageKey
                choices: $choices
            }
        ) {
            _id
            prompt
            answer
            details
            handle
            imageKey
            choices
        }
    }
`;

export const useUpdateCardMutation = () => useApolloMutation<{ card: { _id: string } }>(updateCardMutation);

const deleteCardMutation = gql`
    mutation deleteCard($_id: String!) {
        deleteCard(_id: $_id) {
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
            _id
        }
    }
`;

export const useAddCardMutation = () => useApolloMutation<{ addCard: { _id: string } }>(addCardMutation);

const addDeckMutation = gql`
    mutation whocaresswhatthisiscalled($name: String!, $categories: [String!], $userId: string) {
        createDeck(input: { name: $name, categories: $categories, userId: $userId }) {
            _id
        }
    }
`;

export const useAddDeckMutation = () => useApolloMutation<{ createDeck: { _id: string } }>(addDeckMutation);

const updateDeckMutation = gql`
    mutation deck($_id: String!, $name: String, $categories: [String!], $details: String) {
        updateDeck(input: { _id: $_id, name: $name, categories: $categories, details: $details }) {
            _id
        }
    }
`;

export const useUpdateDeckMutation = () => useApolloMutation<{ addCard: { _id: string } }>(updateDeckMutation);

const addTryMutation = gql`
    mutation addTry($cardId: String!, $correct: Boolean!) {
        addTry(input: { cardId: $cardId, correct: $correct }) {
            added
        }
    }
`;

export const useAddTryMutation = () => useApolloMutation<{ addTry: { added: boolean } }>(addTryMutation);
