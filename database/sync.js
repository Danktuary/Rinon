const database = require('./index.js')
const force = process.argv.includes('--force') || process.argv.includes('-f')

database.models = require('./models/index.js')

database.init().then(async () => {
	try {
		await database.sync({ force })
		console.log(`Successfully ${force ? 'force-synced' : 'synced'} the database`)
		database.close()
	} catch (error) {
		console.error('Failed to sync the database.\n', error)
	}
}).catch(console.error)
