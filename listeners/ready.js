const { Listener } = require('discord-akairo');

module.exports = class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			eventName: 'ready',
			type: 'once',
		});
	}

	exec() {
		console.log(`${this.client.user.tag} ready!`);
	}
};
