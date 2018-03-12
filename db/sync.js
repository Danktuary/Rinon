const database = require('./connection');
const models = require('./models/');

const { Poll, Emoji } = models;

Poll.hasOne(Emoji);
Emoji.belongsTo(Poll);

const force = process.argv.includes('--force') || process.argv.includes('-f');

database.sync({ force }).then(() => {
	console.log((force) ? 'Database forcefully synced.' : 'Database synced.');
	database.close();
}).catch(console.error);
