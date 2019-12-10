const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { colors } = require('../config.js');
const permissionsUtil = require('../util/permissions.js');

module.exports = class AboutCommand extends Command {
	constructor() {
		super('about', {
			aliases: ['about'],
			description: 'Displays some basic info about Rinon!',
		});
	}

	async exec(message) {
		const { client } = message;
		const owner = await client.fetchUser(client.ownerID);
		const invite = await client.generateInvite(permissionsUtil.required);
		const [normal, animated] = client.emojis.partition(emoji => !emoji.animated);

		const embed = new RichEmbed()
			.setColor(colors.pink)
			.setThumbnail(client.user.displayAvatarURL)
			.setFooter(`Author: ${owner.tag}`, owner.displayAvatarURL)
			.setDescription([
				`Use \`${this.handler.prefix()}help\` to get a list of all my commands!`,
				`[Invite](${invite}) | [GitHub](https://github.com/Danktuary/Rinon)`,
			].join('\n'))
			.addField('Servers', `${client.guilds.size} (${client.hubServer.serverList})`, true)
			.addField('Emojis', `${client.emojis.size} (${animated.size} animated, ${normal.size} normal)`, true);

		return message.util.send(embed);
	}
};
