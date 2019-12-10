const Poll = require('./index.js');
const { emojis } = require('../../config.js');
const emojiUtil = require('../../util/emoji.js');
const regexes = require('../../util/regexes.js');
const models = require('../../database/models/index.js');

module.exports = class EmojiVotingPoll extends Poll {
	constructor(client) {
		super(client);
		this.model = models.Poll;
	}

	async create({ message, name, url }) {
		const guild = emojiUtil.nextAvailableGuild({ guilds: this.client.guilds, imageURL: url });
		const emoji = await guild.createEmoji(url, name);

		const sent = await this.sendEmbed({
			channel: this.client.hubServer.votingChannel,
			author: message.author,
			thumbnail: emoji.url,
			description: `\`${message.author.tag}\` wants to add an emoji with the name as \`${name}\`.`,
			fields: [{ title: 'Preview', value: emoji.toString() }],
		});

		await emoji.delete();
		await sent.react(emojis.approve);
		await sent.react(emojis.deny);

		return this.model.create({
			messageID: sent.id,
			authorID: message.author.id,
			emojiName: name,
			imageURL: url instanceof Buffer ? emoji.url : url,
		});
	}

	async approve({ message }) {
		const pollData = await this.model.findOne({ where: { messageID: message.id } });
		const author = await this.client.fetchUser(pollData.authorID);
		const guild = emojiUtil.nextAvailableGuild({ guilds: this.client.guilds, imageURL: pollData.imageURL });

		await message.delete();

		const emoji = await guild.createEmoji(pollData.imageURL, pollData.emojiName);

		pollData.status = 'approved';
		await pollData.save();

		const [, number] = guild.name.match(regexes.guildNameEnding);
		const galleryChannel = this.client.hubServer.galleryChannel(number);
		await this.client.sync.gallery(galleryChannel);

		return this.sendEmbed({
			channel: this.client.hubServer.logsChannel,
			author,
			thumbnail: emoji.url,
			description: `\`${emoji.name}\` has been approved! ${emoji}`,
			fields: [{ title: 'Added to', value: `${guild.name} (${galleryChannel})` }],
			color: 'green',
		});
	}

	async deny({ message, reason }) {
		await message.delete();

		const pollData = await this.model.findOne({ where: { messageID: message.id } });
		const author = await this.client.fetchUser(pollData.authorID);

		pollData.status = 'denied';
		await pollData.save();

		return this.sendEmbed({
			channel: this.client.hubServer.logsChannel,
			author,
			thumbnail: pollData.imageURL,
			description: `\`${pollData.emojiName}\` has been denied. :(`,
			fields: reason ? [{ title: 'Reason', value: reason }] : [],
			color: 'red',
		});
	}

	async search(searchTerm) {
		return super.search(searchTerm, { column: /\d+/.test(searchTerm) ? 'message_id' : 'emoji_name' });
	}
};
