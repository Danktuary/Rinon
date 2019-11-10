const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const models = require('../database/models/index.js');
const parseInput = require('../util/parseInput.js');
const textUtil = require('../util/text.js');
const emojiUtil = require('../util/emoji.js');
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
		let pollMessage = null;

		try {
			pollMessage = await this.client.hubServer.polls.emoji.search(oldName);
		} catch (error) {
			return message.util.send([
				'I couldn\'t find any requests that match your search term!',
				`If you want to rename an existing emoji, use the \`${this.handler.prefix()}rename-emoji <emoji name> <new name>\` command.`,
			].join('\n'));
		}

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
		let emojis = null;
		let selectedEmoji = null;
		const { hubServer } = this.client;

		try {
			emojis = emojiUtil.search(message.client.emojis, emojiUtil.parseSearchQuery(oldName));
		} catch (error) {
			return message.util.send([
				'I couldn\'t find any requests that match your search term!',
				`If you want to rename a current poll, use the \`${this.handler.prefix()}rename-poll <old name> <new name>\` command.`,
			].join('\n'));
		}

		if (emojis.size === 1) {
			selectedEmoji = emojis.first();
		} else {
			const sent = await message.channel.send([
				`I found these emojis with that same name: ${emojis.map(emoji => emoji.toString()).join(' ')}`,
				'React with the corresponding emoji you want to rename.',
			].join('\n'));

			await Promise.all(emojis.map(emoji => sent.react(emoji)));

			const filter = (reaction, user) => {
				return emojis.map(emoji => emoji.id).includes(reaction.emoji.id) && user.id === message.author.id;
			};

			try {
				const reactions = await sent.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] });
				await sent.clearReactions();
				selectedEmoji = reactions.first().emoji;
			} catch (error) {
				await sent.clearReactions();
				return message.channel.send('You didn\'t react in time; cancelling the request.');
			}
		}

		await hubServer.polls.rename.create({ message, emoji: selectedEmoji, newName });

		const response = [`Done! Others can now vote on your request in ${hubServer.renameVoting}.`];

		if (message.guild.id !== hubServer.id) {
			response[0] = `${response[0].slice(0, -1)} in **${hubServer.guild.name}**.`;
			response.push(`If you can\'t open the channel link, send \`${this.handler.prefix()}server 1\` for an invite.`);
		}

		return message.util.send(response.join('\n'));
	}
};
