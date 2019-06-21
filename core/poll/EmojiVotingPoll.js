const Poll = require('./index.js');
const emojiUtil = require('../../util/emoji.js');
const models = require('../../database/models/index.js');

module.exports = class EmojiVotingPoll extends Poll {
	constructor(client) {
		super(client);
		this.channel = client.hubServer.emojiVoting;
	}

	async create({ message, name, url }) {
		const emoji = await message.guild.createEmoji(url, name);

		const sent = await this.sendEmbed({
			emoji,
			thumbnail: emoji.url,
			author: message.author,
			description: `\`${message.author.tag}\` wants to add an emoji with the name as \`${name}\`.`,
		});

		await models.Poll.create({
			messageID: sent.id,
			authorID: message.author.id,
			emojiName: name,
			imageURL: url instanceof Buffer ? emoji.url : url,
		});

		return message.guild.deleteEmoji(emoji);
	}

	async approve(message) {
		const { client, guild } = message;
		const pollData = await models.Poll.findOne({ where: { messageID: message.id } });
		const author = await client.fetchUser(pollData.authorID);

		try {
			emojiUtil.checkAmounts(guild.emojis, pollData.imageURL);
		} catch (error) {
			return this.deny(message, error.message);
		}

		await message.delete();

		const emoji = await guild.createEmoji(pollData.imageURL, pollData.emojiName);
		const emojiData = await models.Emoji.create({ emojiID: emoji.id, guildID: guild.id });

		pollData.status = 'approved';
		await pollData.setEmoji(emojiData);
		await pollData.save();

		return this.sendEmbed({
			author,
			emoji,
			status: 'approved',
			channel: this.client.hubServer.approvedEmojis,
			description: `\`${pollData.emojiName}\` has been approved! ${emoji}`,
		});
	}

	async deny(message, reason) {
		await message.clearReactions();

		const pollEntry = await Poll.findOne({ where: { messageID: message.id } });
		const author = await this.client.fetchUser(pollEntry.authorID);

		pollEntry.status = 'denied';
		await pollEntry.save();

		await this.sendEmbed({
			author,
			emoji: { url: pollEntry.imageURL },
			status: 'denied',
			channel: this.client.hubServer.deniedEmojis,
			description: reason || `\`${pollEntry.emojiName}\` has been denied. :(`,
		});

		return message.delete();
	}
};
