const { Listener } = require('discord-akairo');

module.exports = class ReadyListener extends Listener {
	constructor() {
		super('error', {
			emitter: 'commandHandler',
			eventName: 'error',
		});
	}

	exec(error, message) {
		const response = error.message
			? `An error occured trying to execute that command!\n\`\`\`js\n${error.message || error}\`\`\``
			: error;

		return message.channel.send(response);
	}
};
