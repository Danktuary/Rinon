const Poll = require('./index.js');
const Sync = require('../sync.js');
const models = require('../../database/models/index.js');

module.exports = class RenameVotingPoll extends Poll {
	constructor(client) {
		super(client);
		this.sync = new Sync(client);
		this.channel = client.hubServer.renameVoting;
	}

	async create({ message, emoji, newName }) {
		const sent = await this.sendEmbed({
			thumbnail: emoji.url,
			author: message.author,
			description: `\`${message.author.tag}\` wants to rename ${emoji} from \`${emoji.name}\` to \`${newName}\`.`,
		});

		return models.RenamePoll.create({
			messageID: sent.id,
			authorID: message.author.id,
			emojiID: emoji.id,
			oldName: emoji.name,
			newName,
		});
	}

	async approve(message) {
		const pollData = await models.RenamePoll.findOne({ where: { messageID: message.id } });
		const author = await message.client.fetchUser(pollData.authorID);
		const emoji = message.client.emojis.get(pollData.emojiID);

		await message.delete();
		await emoji.edit({ name: pollData.newName });

		pollData.status = 'approved';
		await pollData.save();

		const [, number] = emoji.guild.name.match(/\(ES#(\d+)\)$/);
		await this.sync.gallery(this.client.hubServer.galleryChannel(number));

		return this.sendEmbed({
			author,
			status: 'approved',
			thumbnail: emoji.url,
			channel: this.client.hubServer.approvedRenames,
			description: `\`${pollData.oldName}\` has been renamed to \`${pollData.newName}\`! ${emoji}`,
		});
	}

	async deny(message, reason) {
		const pollData = await models.RenamePoll.findOne({ where: { messageID: message.id } });
		const author = await message.client.fetchUser(pollData.authorID);
		const emoji = message.client.emojis.get(pollData.emojiID);

		await message.delete();

		pollData.status = 'denied';
		await pollData.save();

		return this.sendEmbed({
			author,
			status: 'denied',
			thumbnail: emoji.url,
			channel: this.client.hubServer.deniedRenames,
			description: `Renaming \`${pollData.oldName}\` to \`${pollData.newName}\` has been denied. :(${(reason ? `\nReason: ${reason}` : '')}`,
		});
	}

	search(searchTerm) {
		return super.search(searchTerm, {
			model: 'RenamePoll',
			column: (/\d+/.test(searchTerm) ? 'message_id' : 'new_name'),
		});
	}
};
