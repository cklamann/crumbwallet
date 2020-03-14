import ApolloClient, { gql, DocumentNode } from 'apollo-boost';
import { useQuery, useMutation, QueryHookOptions } from '@apollo/react-hooks';
import { Deck } from 'Models/Decks';

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
            details
            options
        }
    }
`;

export const updateCardMutation = gql`
    mutation updateCard($cardId: String!, $prompt: String, $answer: String, $details: string) {
        updateCard(input: { cardId: $cardId, prompt: $prompt, answer: $answer, details: $details }) {
            _id
            prompt
            answer
            details
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
