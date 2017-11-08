const invite = {
	name: 'invite',
	description: 'Invite me to your server!',
	aliases: ['inv'],
	async execute(message) {
		return message.channel.send([
			'Here\'s a link you can use to invite me to your server!',
			'https://discordapp.com/oauth2/authorize?client_id=372685586126864396&scope=bot&permissions=1073758289',
		]);
	},
};

module.exports = invite;
