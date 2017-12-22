const { readdirSync } = require('fs');
const DB = require('./db/connection');

const files = readdirSync('./db/models');

for (const file of files) {
	DB.import(`db/models/${file}`);
}

const force = process.argv.includes('--force') || process.argv.includes('-f');

DB.sync({ force }).then(() => {
	console.log('Database synced!', force ? '(forcefully synced)' : '');
	DB.close();
});
