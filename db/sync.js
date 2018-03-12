const database = require('./connection');
// eslint-disable-next-line no-unused-vars
const models = require('./models/');

const force = process.argv.includes('--force') || process.argv.includes('-f');

database.sync({ force }).then(() => {
	console.log((force) ? 'Database forcefully synced.' : 'Database synced.');
	database.close();
}).catch(console.error);
