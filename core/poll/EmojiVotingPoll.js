const Poll = require('./index.js');
const Sync = require('../sync.js');
const emojiUtil = require('../../util/emoji.js');
const models = require('../../database/models/index.js');

module.exports = class EmojiVotingPoll extends Poll {
	constructor(client) {
		super(client);
		this.sync = new Sync(client);
		this.channel = client.hubServer.emojiVoting;
	}

	async create({ message, name, url }) {
		const guild = this._nextAvailableGuild({ imageURL: url });
		const emoji = await guild.createEmoji(url, name);

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
		const { client } = message;
		const pollData = await models.Poll.findOne({ where: { messageID: message.id } });
		const author = await client.fetchUser(pollData.authorID);
		const guild = this._nextAvailableGuild({ imageURL: pollData.imageURL });

		await message.delete();

		const emoji = await guild.createEmoji(pollData.imageURL, pollData.emojiName);

		pollData.status = 'approved';
		await pollData.save();

		const [, number] = guild.name.match(/\(ES#(\d+)\)$/);
		const galleryChannel = client.hubServer.galleryChannel(number);
		await this.sync.gallery(galleryChannel);

		return this.sendEmbed({
			author,
			emoji,
			status: 'approved',
			channel: this.client.hubServer.approvedEmojis,
			description: `\`${pollData.emojiName}\` has been approved! ${emoji}\nAdded to **${guild.name}**. (${galleryChannel})`,
		});
	}

	async deny(message, reason) {
		await message.delete();

		const pollEntry = await models.Poll.findOne({ where: { messageID: message.id } });
		const author = await this.client.fetchUser(pollEntry.authorID);

		pollEntry.status = 'denied';
		await pollEntry.save();

		return this.sendEmbed({
			author,
			emoji: { url: pollEntry.imageURL },
			status: 'denied',
			channel: this.client.hubServer.deniedEmojis,
			description: `\`${pollEntry.emojiName}\` has been denied. :(${(reason ? `\nReason: ${reason}` : '')}`,
		});
	}

	_nextAvailableGuild({ imageURL }) {
		return this.client.guilds.find(guild => {
			const { normal, animated } = emojiUtil.getAmounts(guild.emojis);
			const boostAmount = emojiUtil.boostedEmojisLimits[guild.premiumTier];
			return /\.gif(\?v=\d+)?$/.test(imageURL) ? animated < boostAmount : normal < boostAmount;
		});
	}
};
