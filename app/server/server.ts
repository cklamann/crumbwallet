require('dotenv').config();
import express, { ErrorRequestHandler } from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

// Constants
const CLIENT_BUILD_PATH = path.resolve('./../client/dist'),
    DB_USER = process.env.DB_USER,
    DB_PASSWORD = process.env.DB_PASSWORD;

// App
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//handle calls for assets from non-base urls
app.use((req, _, next) => {
    if (req.url.endsWith('.js')) {
        req.url = req.url.split('/')[req.url.split('/').length - 1];
    }
    next();
});

// Static files
app.use(express.static(CLIENT_BUILD_PATH));

app.get('*', (_, res) => res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html')));

export default app;
