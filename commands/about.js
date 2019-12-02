const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { colors } = require('../config.js');
const permissionsUtil = require('../util/permissions.js');
const emojiUtil = require('../util/emoji.js');

module.exports = class AboutCommand extends Command {
	constructor() {
		super('about', {
			aliases: ['about'],
		});
	}

	async exec(message) {
		const { client } = message;
		const owner = await client.fetchUser(client.ownerID);
		const invite = await client.generateInvite(permissionsUtil.required);
		const emojis = { total: client.emojis.size, ...emojiUtil.getAmounts(client.emojis) };

		const embed = new RichEmbed()
			.setColor(colors.pink)
			.setThumbnail(client.user.displayAvatarURL)
			.setFooter(`Author: ${owner.tag}`, owner.displayAvatarURL)
			.setDescription([
				`Use \`${this.handler.prefix()}help\` to get a list of all my commands!`,
				`[Invite](${invite}) | [GitHub](https://github.com/Danktuary/Rinon)`,
			].join('\n'))
			.addField('Servers', `${client.guilds.size} (${client.hubServer.serverList})`, true)
			.addField('Emojis', `${emojis.total} (${emojis.animated} animated, ${emojis.normal} normal)`, true)

		return message.util.send(embed);
	}
};
