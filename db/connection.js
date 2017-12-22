const Sequelize = require('sequelize');

const sequelize = new Sequelize('rinon', 'root', '', {
	host: 'localhost',
	dialect: 'mysql',
	logging: false,
});

module.exports = sequelize;
