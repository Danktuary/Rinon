const database = require('./connection.js');

module.exports = database;

module.exports.init = async () => {
	await database.check();
	console.log('Successfully initialized the database.');
};
