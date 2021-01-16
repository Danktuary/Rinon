const { database } = require('../config.js')
const Sequelize = require('sequelize')

const connection = new Sequelize(database.name, database.username, database.password, database.options)

module.exports = connection

module.exports.init = async () => {
	try {
		await connection.authenticate()
		console.log('Successfully connected to the database.')
	} catch (error) {
		console.error('Failed to connect to the database.\n', error)
		process.exit()
	}
}
