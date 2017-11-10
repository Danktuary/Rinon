const { MessageEmbed } = require('discord.js');

const { colors, emojis } = require('../config');

/**
 * An object containing the amount of approved, denied, and pending polls
 * in the `emoji-voting` channel (if any)
 *
 * @typedef {Object} PollStats
 * @property {number} approved The amount of approved emoji requests
 * @property {number} denied The amount of denied emoji requests
 * @property {number} pending The amount of pending emoji requests
 * @property {number} total The amount of total emoji requests
 */

/**
 * Manage emoji voting and related operations
 */
class PollController {

	/**
	 * Create a new poll for the requested emoji
	 *
	 * @param {Message} message The Message object used to create the request
	 * @param {array} args The emoji name and URL to use in the poll
	 * @return {Promise<Emoji>} The deleted preview emoji
	 */
	static async create(message, [name, url]) {
		const previewEmoji = await message.guild.createEmoji(url, name);

		const embed = new MessageEmbed()
			.setAuthor(`Request by ${message.author.tag}`, message.author.displayAvatarURL())
			.setThumbnail(url)
			.setDescription(`\`${message.author.tag}\` wants to add an emoji with the name as \`${name}\`.`)
			.addField('Preview', previewEmoji);

		try {
			const channel = message.guild.channels.find('name', 'emoji-voting');
			const sent = await channel.send(embed);
			await sent.react(emojis.approve);
			await sent.react(emojis.deny);
			await message.channel.send(`Done! Others can now vote on your request in ${channel}.`);
		} catch (error) {
			console.error(error);
			await message.channel.send('There was an error trying to create the poll!');
		}

		return previewEmoji.delete();
	}

	/**
	 * Approve the emoji request, create the emoji, and close the poll
	 *
	 * @param {Message} message The poll Message object to approve/close
	 * @return {Promise<Message>} The edited messaged
	 */
	static async approve(message) {
		const embedData = message.embeds[0];

		const [, name] = embedData.description.match(/`(\w+)`\.$/);
		const { url } = embedData.thumbnail;

		const emoji = await message.guild.createEmoji(url, name);

		const embed = new MessageEmbed()
			.setAuthor(embedData.author.name, embedData.author.iconURL)
			.setColor(colors.approved)
			.setThumbnail(url)
			.setDescription(`Request approved! ${emoji}`);

		await message.clearReactions();
		return message.edit(embed);
	}

	/**
	 * Approve the emoji request, create the emoji, and close the poll
	 *
	 * @param {Message} message The poll Message object to approve/close
	 * @return {Promise<Message>} The edited messaged
	 */
	static async deny(message) {
		const embedData = message.embeds[0];

		const embed = new MessageEmbed()
			.setAuthor(embedData.author.name, embedData.author.iconURL)
			.setColor(colors.denied)
			.setThumbnail(embedData.thumbnail.url)
			.setDescription('Request denied. :(');

		await message.clearReactions();
		return message.edit(embed);
	}

	/**
	 * Fetch the emoji poll statistics for a channel
	 *
	 * @param {TextChannel} channel The `emoji-voting` channel
	 * @return {PollStats} The statistics for the channel
	 */
	static async fetchStats(channel) {
		let messages = await channel.messages.fetch({ limit: 100 });

		if (!messages.size) {
			return { approved: 0, denied: 0, pending: 0, total: 0 };
		}

		messages = messages.filter(message => message.embeds.length);
		const pending = messages.filter(message => !message.embeds[0].color);
		const approved = messages.filter(message => message.embeds[0].color === colors.approved);
		const denied = messages.filter(message => message.embeds[0].color === colors.denied);

		return {
			approved: approved.size,
			denied: denied.size,
			pending: pending.size,
			total: messages.size,
		};
	}

}

module.exports = PollController;
