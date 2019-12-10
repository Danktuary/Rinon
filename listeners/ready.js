const { Listener } = require('discord-akairo');

module.exports = class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			eventName: 'ready',
			type: 'once',
		});
	}

	exec() {
		const { client } = this;
		console.log(`${client.user.tag} ready!`);
		client.user.setPresence({ game: { name: `${client.emojis.size} emojis in ${client.guilds.size} servers` } });
	}
};
