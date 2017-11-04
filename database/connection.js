const Sequelize = require('sequelize');

const sequelize = new Sequelize({
	host: 'localhost',
	dialect: 'sqlite',
	logging: console.log,
	storage: `${__dirname}/emoji_db.sqlite`,
	operatorsAliases: false,
});

module.exports = sequelize;
