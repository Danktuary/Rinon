const { Listener } = require('discord-akairo')

module.exports = class CommandHandlerErrorListener extends Listener {
	constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
		})
	}

	exec(error, message, command) {
		console.log(`Error occured in "${command.id}" command.\n`, error)
		return message.channel.send(`An error occured trying to execute that command!\n\`\`\`js\n${error.message || error}\`\`\``)
	}
}
