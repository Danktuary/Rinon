const { token } = require('./config.js')
const RinonClient = require('./core/client.js')

const client = new RinonClient()

client.login(token)
