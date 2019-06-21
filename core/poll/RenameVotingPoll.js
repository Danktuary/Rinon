const Poll = require('./index.js');
const emojiUtil = require('../../util/emoji.js');
const regexes = require('../../util/regexes.js');
const models = require('../../database/models/index.js');

module.exports = class RenameVotingPoll extends Poll {
	constructor(client) {
		super(client);
		this.channel = client.hubServer.renameVoting;
	}

	async create({ message, oldName, newName }) {
		// TODO: Account for multiple results
		const emoji = emojiUtil.search(this.client.emojis, oldName).first();
		return this.sendEmbed({
			thumbnail: emoji.url,
			author: message.author,
			description: `\`${message.author.tag}\` wants to rename ${emoji} from \`${emoji.name}\` to \`${newName}\`.`,
		});
	}

	async approve(message) {
		const { oldName, newName, author, emoji } = await this._parseData(message);
		const emojiData = await models.Emoji.findOne({ where: { emojiID: emoji.id }, include: ['poll'] });

		emojiData.poll.emojiName = newName;
		await message.delete();
		await emoji.edit({ name: newName });
		await emojiData.save();

		return this.sendEmbed({
			author,
			status: 'approved',
			thumbnail: emoji.url,
			channel: this.client.hubServer.approvedRenames,
			description: `\`${oldName}\` has been renamed to \`${newName}\`! ${emoji}`,
		});
	}

	async deny(message, reason) {
		const { oldName, newName, author, emoji } = await this._parseData(message);
		await message.delete();
		return this.sendEmbed({
			author,
			status: 'denied',
			thumbnail: emoji.url,
			channel: this.client.hubServer.deniedRenames,
			description: reason || `Renaming \`${oldName}\` to \`${newName}\` has been denied. :(`,
		});
	}

	async _parseData(message) {
		const { client, embeds: [embed] } = message;
		const [, authorID] = embed.author.name.match(/\((\d+)\)/);
		const [, oldName, newName] = embed.description.match(/from `(\w+)` to `(\w+)`\./);
		const emojiID = embed.description.match(regexes.emoji)[3];

		return {
			oldName,
			newName,
			author: await client.fetchUser(authorID),
			emoji: client.emojis.get(emojiID),
		};
	}
};
