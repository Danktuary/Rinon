const { Op } = require('sequelize');

const { Poll } = require('../db/models/');

const rename = {
	name: 'rename',
	description: 'Rename .',
	usage: '<old name> <new name>',
	async execute(message, [oldName, newName]) {
		if (!oldName || !newName) {
			return message.reply(
				'you need to supply the name of the current request you want to rename and the name you want to give it.'
			);
		}

		const { count: pollsCount, rows: polls } = await Poll.findAndCount({
			where: {
				authorID: message.author.id,
				emojiName: { [Op.iLike]: oldName },
				status: 'pending',
			},
		});

		let [selectedEmoji] = polls;

		if (pollsCount > 1) {
			const imageLinks = polls.map((poll, index) => {
				return `#${index + 1}: <${poll.imageURL}>`;
			});

			await message.channel.send([
				'I\'ve found multiple pending polls with that name!',
				'Which of the following would you like to rename?\n',
				imageLinks.join('\n'),
			].join('\n'));

			let response;
			const options = { max: 1, time: 20000, errors: ['time'] };
			const filter = m => m.author.id === message.author.id && /#?\d+/.test(m.content);

			try {
				const responses = await message.channel.awaitMessages(filter, options);
				response = responses.first().content.replace('#', '');
			}
			catch (error) {
				await message.reply('you didn\'t reply in time; cancelling the rename request.');
			}

			selectedEmoji = polls[response - 1];
		}

		selectedEmoji.emojiName = newName;

		const pollChannel = message.guild.channels.find('name', 'emoji-voting');
		const pollMessage = await pollChannel.messages.fetch(selectedEmoji.messageID);
		const [embed] = pollMessage.embeds;

		embed.setDescription(embed.description.replace(oldName, newName));

		// NOTE: When editing an embed, the preview emoji will break because it no longer exists.
		// When a global "CDN"-like server gets created to store these temporary emojis,
		// Create one there and do basically the same thing as PollController.approve()
		pollMessage.edit(embed);

		selectedEmoji.save({ silent: true });

		return message.channel.send(`\`${oldName}\` has been renamed to \`${newName}\`!`);
	},
};

module.exports = rename;
