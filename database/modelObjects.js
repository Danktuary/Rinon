const sequelize = require('./connection');

const Poll = sequelize.import('models/Poll');

module.exports = { Poll };
