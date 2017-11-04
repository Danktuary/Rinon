const sequelize = require('./connection');

sequelize.import('models/Poll');

sequelize.sync()
	.then(() => console.log('Database loaded'))
	.catch(console.error);
