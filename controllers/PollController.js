const { MessageEmbed } = require('discord.js');

const { emojis } = require('../config');

class PollController {

	/**
	 * Approve the emoji request, create the emoji, and close the poll
	 *
	 * @param {Message} message The poll Message object to approve/close
	 */
	static async approve(message) {
		const embedData = message.embeds[0];

		const [, name] = embedData.description.match(/`(\w+)`\.$/);
		const { url } = embedData.thumbnail;

		const emoji = await message.guild.createEmoji(url, name);

		const embed = new MessageEmbed()
			.setAuthor(embedData.author.name.replace('New', 'Approved'), embedData.author.iconURL)
			.setColor('#43d490')
			.setThumbnail(url)
			.addField('Approved emoji', emoji);

		message.edit(embed);
	}

	/**
	 * Create a new poll for the requested emoji
	 *
	 * @param {Message} message The Message object used to create the request
	 * @param {array} args The emoji name and URL to use in the poll
	 */
	static async create(message, [name, url]) {
		const previewEmoji = await message.guild.createEmoji(url, name);

		const embed = new MessageEmbed()
			.setAuthor(`New request by ${message.author.tag}`, message.author.displayAvatarURL())
			.setThumbnail(url)
			.setDescription(`\`${message.author.tag}\` wants to add an emoji with the name as \`${name}\`.`)
			.addField('Preview', previewEmoji);

		const sent = await message.guild.channels.find('name', 'emoji-voting').send(embed);
		await sent.react(emojis.approve);
		await sent.react(emojis.deny);

		await previewEmoji.delete();
	}

}

module.exports = PollController;
