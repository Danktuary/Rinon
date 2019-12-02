const Poll = require('./index.js');
const config = require('../../config.js');
const regexes = require('../../util/regexes.js');
const models = require('../../database/models/index.js');

module.exports = class RenameVotingPoll extends Poll {
	async create({ message, emoji, newName }) {
		const sent = await this.sendEmbed({
			channel: this.client.hubServer.votingChannel,
			author: message.author,
			thumbnail: emoji.url,
			description: `\`${message.author.tag}\` wants to rename ${emoji} from \`${emoji.name}\` to \`${newName}\`.`,
		});

		await sent.react(config.emojis.approve);
		await sent.react(config.emojis.deny);

		return models.RenamePoll.create({
			messageID: sent.id,
			authorID: message.author.id,
			emojiID: emoji.id,
			oldName: emoji.name,
			newName,
		});
	}

	async approve({ message }) {
		const pollData = await models.RenamePoll.findOne({ where: { messageID: message.id } });
		const author = await message.client.fetchUser(pollData.authorID);
		const emoji = message.client.emojis.get(pollData.emojiID);

		await message.delete();
		await emoji.edit({ name: pollData.newName });

		pollData.status = 'approved';
		await pollData.save();

		const [, number] = emoji.guild.name.match(regexes.guildNameEnding);
		const galleryChannel = this.client.hubServer.galleryChannel(number);
		await this.sync.gallery(galleryChannel);

		return this.sendEmbed({
			channel: this.client.hubServer.logsChannel,
			author,
			thumbnail: emoji.url,
			description: `\`${pollData.oldName}\` has been renamed to \`${emoji.name}\`! ${emoji}`,
			fields: [{ title: 'Belongs to', value: `${emoji.guild.name} (${galleryChannel})` }],
			status: 'approved',
		});
	}

	async deny({ message, reason }) {
		await message.delete();

		const pollData = await models.RenamePoll.findOne({ where: { messageID: message.id } });
		const author = await message.client.fetchUser(pollData.authorID);
		const emoji = message.client.emojis.get(pollData.emojiID);

		pollData.status = 'denied';
		await pollData.save();

		return this.sendEmbed({
			channel: this.client.hubServer.logsChannel,
			author,
			thumbnail: emoji.url,
			description: `Renaming ${emoji} from \`${emoji.name}\` to \`${pollData.newName}\` has been denied. :(`,
			fields: reason ? [{ title: 'Reason', value: reason }] : [],
			status: 'denied',
		});
	}

	async search(searchTerm) {
		return super.search(searchTerm, {
			model: 'RenamePoll',
			column: /\d+/.test(searchTerm) ? 'message_id' : 'new_name',
		});
	}
};
