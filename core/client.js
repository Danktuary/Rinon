const path = require('path')
const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo')
const database = require('../database/index.js')
const { ownerID, prefix } = require('../config.js')

module.exports = class RinonClient extends AkairoClient {
	constructor() {
		super({ ownerID }, { partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

		this.commandHandler = new CommandHandler(this, {
			prefix,
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 600000,
			directory: path.join(__dirname, '..', 'commands'),
			argumentDefaults: {
				prompt: {
					timeout: 'time ran out, command has been cancelled.',
					ended: 'too many retries, command has been cancelled.',
					cancel: 'command has been cancelled.',
					retries: 4,
					time: 30000,
				},
			},
		})

		this.commandHandler.resolver.addType('serverNumber', (message, phrase) => {
			const intType = this.commandHandler.resolver.type('integer')
			const int = intType(message, phrase)
			if (int < 1 || int > message.client.guilds.cache.size) return null
			return int
		})

		this.listenerHandler = new ListenerHandler(this, {
			directory: path.join(__dirname, '..', 'listeners'),
		})

		this.listenerHandler.setEmitters({ commandHandler: this.commandHandler })

		this.commandHandler.loadAll()
		this.commandHandler.useListenerHandler(this.listenerHandler)
		this.listenerHandler.loadAll()

		this.sync = null
		this.hubServer = null
	}

	async login(token) {
		await database.init()
		return super.login(token)
	}
}
