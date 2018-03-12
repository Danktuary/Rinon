const Sequelize = require('sequelize');

const { database: { credentials, options } } = require('../config');

const sequelize = new Sequelize(
	credentials.database,
	credentials.username,
	credentials.password,
	options,
);

module.exports = sequelize;
