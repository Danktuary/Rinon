const invite = {
	name: 'invite',
	description: 'Invite me to your server!',
	aliases: ['inv'],
	async execute(message) {
		return message.channel.send([
			'Here\'s a link you can use to invite me to your server!',
			`https://discordapp.com/oauth2/authorize?client_id=${message.client.user.id}&scope=bot&permissions=1073766481`,
		]);
	},
};

module.exports = invite;
