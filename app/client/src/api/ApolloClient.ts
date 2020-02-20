import ApolloClient, { gql } from 'apollo-boost';
import { get } from 'local-storage';

const port = process.env.APP_PORT;
const host = process.env.APP_HOST === '0.0.0.0' ? 'localhost' : process.env.APP_HOST;

const headers = get('token') ? { 'Authorization': `Bearer ${get('token')}` } : {}

const client = new ApolloClient({
	uri: `http://${host}:${port}/graphql`,
	headers
});

export const test = () =>
	client
		.query({
			query: gql`
				{
					posts {
						title   
					}
				}
			`,
		})
		.then(result => console.log(result));
