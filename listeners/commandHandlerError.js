const { Listener } = require('discord-akairo');

module.exports = class ReadyListener extends Listener {
	constructor() {
		super('error', {
			emitter: 'commandHandler',
			eventName: 'error',
		});
	}

	exec(error, message, command) {
		console.log(`Error occured in "${command.id}" command.\n`, error);
		return message.channel.send(`An error occured trying to execute that command!\n\`\`\`js\n${error.message || error}\`\`\``);
	}
};
