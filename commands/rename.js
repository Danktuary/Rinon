const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const models = require('../database/models/index.js');
const parseInput = require('../util/parseInput.js');
const textUtil = require('../util/text.js');
const regexes = require('../util/regexes.js');

module.exports = class RenameCommand extends Command {
	constructor() {
		super('rename', {
			aliases: ['rename', 'rename-poll', 'rename-emoji'],
			args: [
				{ id: 'oldName' },
				{ id: 'newName' },
				{
					id: 'mode',
					match: 'prefix',
					prefix: ['--mode=', '-m='],
					'default': 'poll',
				},
			],
		});
	}

	async exec(message, { oldName, newName, mode }) {
		if (message.util.alias === 'rename-poll') mode = 'poll';
		else if (message.util.alias === 'rename-emoji') mode = 'emoji';
		else if (!['emoji', 'poll'].includes(mode)) mode = 'poll';

		if (mode === 'emoji' && regexes.emoji.test(oldName)) {
			oldName = parseInput.fromEmoji(oldName).name;
		} else if (mode === 'emoji' && regexes.emoji.test(newName)) {
			const emojiName = parseInput.fromEmoji(newName).name;
			newName = oldName;
			oldName = emojiName;
		}

		if (oldName.length < 2 || newName.length < 2 || oldName.length > 32 || newName.length > 32) {
			return message.util.send('An emoji name needs to be between 2 and 32 characters long.');
		}

		return this[`rename${textUtil.capitalize(mode)}`]({ message, oldName, newName });
	}

	async renamePoll({ message, oldName, newName }) {
		const pollMessage = await this.client.hubServer.polls.emoji.search(oldName);
		const pollData = await models.Poll.findOne({ where: { messageID: pollMessage.id } });

		if (message.author.id !== pollData.authorID) {
			throw new Error('You can\'t edit a poll that\'s not yours!');
		}

		pollData.emojiName = newName;

		const embed = new RichEmbed(pollMessage.embeds[0]);
		const previewEmoji = await message.guild.createEmoji(pollData.imageURL, newName);

		embed.fields = [];
		embed
			.setDescription(`\`${message.author.tag}\` wants to add an emoji with the name as \`${newName}\`.`)
			.addField('Preview', previewEmoji.toString());

		await pollData.save();
		await pollMessage.edit(embed);
		await message.guild.deleteEmoji(previewEmoji);
		return message.util.send('Done renaming your poll!');
	}

	async renameEmoji({ message, oldName, newName }) {
		const poll = this.client.hubServer.polls.rename;
		await poll.create({ message, oldName, newName });
		return message.util.send('*Done renaming your request!');
		// await poll.create({
		// 	message,
		// 	name: newName,
		// 	url: emoji.url,
		// 	description: `\`${message.author.tag}\` wants to rename an emoji with the name as \`${name}\`.`,
		// 	channel: this.client.hubServer.renameVoting,
		// });
	}
};
