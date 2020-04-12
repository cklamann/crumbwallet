require('dotenv').config();
import express, { ErrorRequestHandler } from 'express';
import graphqlHTTP from 'express-graphql';
import { Schema } from './graphql/schema';
import * as path from 'path';
import * as mongoose from 'mongoose';
import * as pino from 'pino';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import User, { IUser } from './models/Users';
import Users from './models/Users';
import { printSchema } from 'graphql';

//logging
export const logger = pino(pino.destination('./node.log')),
    logErrors: ErrorRequestHandler = (err, req, res, next) => {
        logger.error(err);
        next(err);
    };

// Constants
const CLIENT_BUILD_PATH = path.resolve('./../client/dist'),
    DB_USER = process.env.DB_USER,
    DB_PASSWORD = process.env.DB_PASSWORD;

// App
const app = express();

app.use(logErrors);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@mongo:27017/app`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.set('debug', true);

const db = mongoose.connection;

db.once('open', function() {
    User.countDocuments().then(c => {
        if (c === 0 && process.env.NODE_ENV !== 'production') {
            return Users.create({
                name: 'admin',
                isAdmin: true,
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
            });
        }
        console.log('connected to mongo!');
        logger.info('log initiated!');
    });
});

db.on('error', console.error.bind(console, 'connection error:'));

//handle calls for assets from non-base urls
app.use((req, _, next) => {
    if (req.url.endsWith('.js')) {
        req.url = req.url.split('/')[req.url.split('/').length - 1];
    }
    next();
});

// Static files
app.use(express.static(CLIENT_BUILD_PATH));

app.use(
    '/graphql',
    graphqlHTTP({
        schema: Schema,
        graphiql: true,
    })
);

app.get('/schema', (req, res) => res.send(printSchema(Schema)));

app.get('*', (_, res) => res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html')));

export default app;
