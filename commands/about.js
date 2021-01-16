const { MessageEmbed } = require('discord.js')
const { Command } = require('discord-akairo')
const { colors } = require('../config.js')
const permissionsUtil = require('../util/permissions.js')

module.exports = class AboutCommand extends Command {
	constructor() {
		super('about', {
			aliases: ['about'],
			description: 'Display some basic info about Rinon!',
		})
	}

	async exec(message) {
		const { client } = message
		const owner = await client.users.fetch(client.ownerID)
		const invite = await client.generateInvite({ permissions: permissionsUtil.required })
		const [normal, animated] = client.emojis.cache.partition(emoji => !emoji.animated)

		const embed = new MessageEmbed()
			.setColor(colors.pink)
			.setThumbnail(client.user.displayAvatarURL({ format: 'png', dynamic: true }))
			.setFooter(`Author: ${owner.tag}`, owner.displayAvatarURL({ format: 'png', dynamic: true }))
			.setDescription([
				`Use \`${this.handler.prefix}help\` to get a list of all my commands!`,
				`[Invite](${invite}) | [GitHub](https://github.com/Danktuary/Rinon)`,
			].join('\n'))
			.addField('Servers', `${client.guilds.cache.size} (${client.hubServer.serverList})`, true)
			.addField('Emojis', `${normal.size + animated.size} (${normal.size} normal, ${animated.size} animated)`, true)

		return message.util.send(embed)
	}
}
