require('dotenv').config();
import app from './server';

const PORT = process.env.APP_PORT || 3009,
	HOST = process.env.APP_HOST || "0.0.0.0";

app.listen(+PORT, HOST);

console.log(`Running on http://${HOST}:${PORT}`);
