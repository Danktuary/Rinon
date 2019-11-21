const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { colors } = require('../config.js');
const redis = require('../core/redis.js');
const emojiUtil = require('../util/emoji.js');

module.exports = class ServerCommand extends Command {
	constructor() {
		super('server', {
			aliases: ['server', 'servers', 'invite', 'inv'],
			args: [
				{
					id: 'number',
					type: 'integer',
					prompt: {
						start: message => `Which server would you like info about? Pick a number 1-${message.client.guilds.size}.`,
						retry: message => `That's not a valid answer! Pick a number 1-${message.client.guilds.size}.`,
					},
				},
			],
		});
	}

	async exec(message, { number }) {
		const { guilds, hubServer } = this.client;
		const guild = guilds.find(g => g.name.endsWith(`(ES#${number})`));
		const { normal, animated } = emojiUtil.getAmounts(guild.emojis);
		const gallery = hubServer.galleryChannel(number);

		const embed = new RichEmbed()
			.setColor(colors.misc)
			.setDescription(`${normal} normal emojis, ${animated} animated emojis. (View gallery: ${gallery})`);

		return message.util.send(await redis.hget('guild-invites', guild.id), embed);
	}
};
