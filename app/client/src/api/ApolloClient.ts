import ApolloClient, { gql, DocumentNode } from 'apollo-boost';
import { useQuery, useMutation, QueryHookOptions } from '@apollo/react-hooks';

const port = process.env.APP_PORT;
const host = process.env.APP_HOST === '0.0.0.0' ? 'localhost' : process.env.APP_HOST;

const client = new ApolloClient<any>({
    uri: `http://${host}:${port}/graphql`,
});

export const useApolloQuery = <T>(query: DocumentNode, options: QueryHookOptions = {}) =>
    useQuery<T>(query, { client, ...options });
export const useApolloMutation = <T>(query: DocumentNode, options: QueryHookOptions = {}) =>
    useMutation<T, any>(query, { client, ...options });

export const fetchDeckNamesQuery = gql`
    query {
        decks {
            _id
            name
        }
    }
`;

export const fetchDeckQuery = gql`
    query fetchDeck($_id: String!) {
        deck(_id: $_id) {
            _id
            name
            cards {
                _id
                prompt
                answer
                details
                options
            }
        }
    }
`;

export const fetchCardQuery = gql`
    query fetchCard($_id: String!) {
        card(_id: $_id) {
            _id
            prompt
            answer
            imageUrl
            details
            options
            handle
        }
    }
`;

export const updateCardMutation = gql`
    mutation card(
        $_id: String!
        $prompt: String
        $answer: String
        $details: String
        $handle: String
        $imageUrl: String
        $options: [String!]
    ) {
        updateCard(
            input: {
                _id: $_id
                prompt: $prompt
                answer: $answer
                details: $details
                handle: $handle
                imageUrl: $imageUrl
                options: $options
            }
        ) {
            _id
            prompt
            answer
            details
            handle
            imageUrl
            options
        }
    }
`;

export const addCardMutation = gql`
    mutation addCard($deckId: String!) {
        addCard(input: { deckId: $deckId, prompt: "<p>Prompt</p>", answer: "<p>Answer</p>", details: "details" }) {
            _id
        }
    }
`;

export const addDeckMutation = gql`
    mutation deckId($name: String!, $categories: [String!]) {
        createDeck(input: { name: $name, categories: $categories }) {
            _id
        }
    }
`;

export const updateDeckMutation = gql`
    mutation deck($_id: String!, $name: String, $categories: [String!], $details: String) {
        updateDeck(input: { _id: $_id, name: $name, categories: $categories, details: $details }) {
            _id
        }
    }
`;
