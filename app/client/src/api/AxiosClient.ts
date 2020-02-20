import axios from 'axios';
import {get} from 'local-storage';

const port = process.env.APP_PORT;
const host = process.env.APP_HOST === '0.0.0.0' ? 'http://localhost' : process.env.APP_HOST;

export const hostname = `${host}${port ? ':' + port : ''}`;

const client = axios.create({
	baseURL: `${hostname}/`,
	timeout: 1000,
});

if(get('token')){
	client.defaults.headers.common['Authorization'] = `Bearer ${get('token')}`;
}

export default client;