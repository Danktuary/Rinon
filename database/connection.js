const { database } = require('../config.js');
const Sequelize = require('sequelize');

const connection = new Sequelize(database.name, database.username, database.password, {
	host: database.host,
	dialect: database.dialect,
	logging: false,
});

module.exports = connection;

module.exports.check = async () => {
	try {
		await connection.authenticate();
		console.log('Successfully connected to the database.');
	} catch (error) {
		console.error('Failed to connect to the database.\n', error);
		process.exit();
	}
};
