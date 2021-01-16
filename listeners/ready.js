const { Listener } = require('discord-akairo')
const Sync = require('../core/sync.js')
const HubServer = require('../core/hubServer.js')

module.exports = class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			type: 'once',
		})
	}

	exec() {
		this.client.sync = new Sync(this.client)
		this.client.hubServer = new HubServer(this.client)
		this.client.sync.status()
		console.log(`${this.client.user.tag} ready!`)
	}
}
