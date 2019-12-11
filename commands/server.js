const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { colors } = require('../config.js');

module.exports = class ServerCommand extends Command {
	constructor() {
		super('server', {
			aliases: ['server', 'servers', 'invite', 'inv'],
			description: 'Display emoji info and the invite link for a specific server.',
			args: [
				{
					id: 'number',
					type: 'serverNumber',
					prompt: {
						start: message => `Which server would you like info about? Pick a number 1-${message.client.guilds.size}.`,
						retry: message => `That's not a valid answer! Pick a number 1-${message.client.guilds.size}.`,
					},
				},
			],
		});
	}

	async exec(message, { number }) {
		const { guilds, hubServer, sync } = this.client;
		const guild = guilds.find(g => g.name.endsWith(`(ES#${number})`));
		const [normal, animated] = guild.emojis.partition(emoji => !emoji.animated);
		const gallery = hubServer.galleryChannel(number);

		const embed = new RichEmbed()
			.setColor(colors.pink)
			.setDescription(`${normal.size} normal emojis, ${animated.size} animated emojis. (View gallery: ${gallery})`);

		return message.util.send(sync.cachedInvites.get(guild.id), embed);
	}
};
