const Sequelize = require('sequelize');

const { database: { credentials, options } } = require('../config');

const database = new Sequelize(
	credentials.database,
	credentials.username,
	credentials.password,
	options,
);

module.exports = database;
