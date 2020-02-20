require('dotenv').config();
import express, { ErrorRequestHandler } from 'express';
import graphqlHTTP from 'express-graphql';
import { Schema } from './graphql/index';
import * as path from 'path';
import * as mongoose from 'mongoose';
import * as pino from 'pino';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
import * as BearerStrategy from 'passport-http-bearer';
import * as session from 'express-session';
import User, { IUser } from './models/Users';
import { createUser } from './models/factories/UserFactory';
import { encrypt, decrypt } from './util/encryption';
import Users from './models/Users';
import { get } from 'lodash';

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

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@mongo:27017/app`, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
mongoose.set('debug', true);

const db = mongoose.connection;

//if we just built the container, we'll create an admin user using the same db credentials passed in
//the global env
db.once('open', () => {
	logger.info('opening)');
	User.countDocuments().then(c => {
		if (c === 0 && process.env.NODE_ENV !== 'production') {
			return createUser({
				name: 'admin',
				username: process.env.DB_USER,
				password: process.env.DB_PASSWORD,
			});
		}
	});
});

db.once('open', function () {
	console.log('connected to mongo!');
	logger.info('log initiated!');
});

db.on('error', console.error.bind(console, 'connection error:'));

app.all('/api/*', function (req, res, next) {
	res.header('Content-Type', 'application/json');
	next();
});

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
	next();
});

// Static files
app.use(express.static(CLIENT_BUILD_PATH));

//auth
passport.use(
	new BearerStrategy.Strategy((token, done) => {
		const decryptedToken = decrypt(token);
		User.findOne({ token: decryptedToken }, (err: Error, user: IUser) => {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false);
			}
			return done(null, user);
		});
	})
);

//login route
app.post('/login', async (req, res) => {
	const { username, password } = req.body,
		user = await User.findOne({ username, password: encrypt(password) }),
		token = user.token ? user.token : Math.random()
			.toString(36)
			.slice(2);
	await user.update({ token });
	res.setHeader('Authorization', `Bearer ${encrypt(token)}`)
	return res.json({ user });
});

app.post('/fetchUser', async (req, res) => {
	const { token } = req.body,
		user = await User.findOne({ token: decrypt(token) });
	return res.json(user);
});

app.get('/verifyLoggedIn', passport.authenticate('bearer', { session: false }), (req, res) => res.json("LOGGED_IN"));

app.use(
	'/graphql',
	graphqlHTTP(async req => {
		const auth = req.headers.authorization ? req.headers.authorization : null,
			token = auth ? req.headers.authorization.replace("Bearer ", "") : null,
			user = token ? await Users.findOne({ token: decrypt(token) }) : null;
		return {
			schema: Schema,
			graphiql: true,
			context: { user }
		}
	})
);

app.post('/*', passport.authenticate('bearer', { session: false }), (req, res, next) => next());

app.get('*', (req, res) => res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html')));

export default app;
