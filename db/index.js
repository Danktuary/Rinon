const database = require('./connection');

database
	.authenticate()
	.then(() => {
		console.log('Successfully connected to the database.');
	})
	.catch(error => {
		console.error('Unable to connect to the database.\n', error);
		process.exit();
	});
