const Poll = require('./index.js');
const config = require('../../config.js');
const regexes = require('../../util/regexes.js');
const models = require('../../database/models/index.js');

module.exports = class RenameVotingPoll extends Poll {
	constructor(client) {
		super(client);
		this.model = models.RenamePoll;
	}

	async create({ message, emoji, newName }) {
		const sent = await this.sendEmbed({
			channel: this.client.hubServer.votingChannel,
			author: message.author,
			thumbnail: emoji.url,
			description: `\`${message.author.tag}\` wants to rename ${emoji} from \`${emoji.name}\` to \`${newName}\`.`,
		});

		await sent.react(config.emojis.approve);
		await sent.react(config.emojis.deny);

		return this.model.create({
			messageID: sent.id,
			authorID: message.author.id,
			emojiID: emoji.id,
			oldName: emoji.name,
			newName,
		});
	}

	async approve({ message }) {
		const pollData = await this.model.findOne({ where: { messageID: message.id } });
		const author = await message.client.fetchUser(pollData.authorID);
		const emoji = message.client.emojis.get(pollData.emojiID);

		await message.delete();
		await emoji.edit({ name: pollData.newName });

		pollData.status = 'approved';
		await pollData.save();

		const [, number] = emoji.guild.name.match(regexes.guildNameEnding);
		const galleryChannel = this.client.hubServer.galleryChannel(number);
		await this.client.sync.gallery(galleryChannel);

		return this.sendEmbed({
			channel: this.client.hubServer.logsChannel,
			author,
			thumbnail: emoji.url,
			description: `\`${pollData.oldName}\` has been renamed to \`${emoji.name}\`! ${emoji}`,
			fields: [{ title: 'Belongs to', value: `${emoji.guild.name} (${galleryChannel})` }],
			color: 'green',
		});
	}

	async deny({ message, reason }) {
		await message.delete();

		const pollData = await this.model.findOne({ where: { messageID: message.id } });
		const author = await message.client.fetchUser(pollData.authorID);
		const emoji = message.client.emojis.get(pollData.emojiID);

		pollData.status = 'denied';
		await pollData.save();

		const [, number] = emoji.guild.name.match(regexes.guildNameEnding);
		const galleryChannel = this.client.hubServer.galleryChannel(number);

		const fields = [{ title: 'Belongs to', value: `${emoji.guild.name} (${galleryChannel})` }];
		if (reason) fields.push({ title: 'Reason', value: reason });

		return this.sendEmbed({
			channel: this.client.hubServer.logsChannel,
			author,
			thumbnail: emoji.url,
			description: `Renaming ${emoji} from \`${emoji.name}\` to \`${pollData.newName}\` has been denied. :(`,
			fields,
			color: 'red',
		});
	}

	async search(searchTerm) {
		return super.search(searchTerm, { column: /\d+/.test(searchTerm) ? 'message_id' : 'new_name' });
	}
};
