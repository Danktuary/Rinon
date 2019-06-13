const { RichEmbed } = require('discord.js');
const emojiUtil = require('../util/emoji.js');
const { Emoji, Poll } = require('../database/models/index.js');
const { colors, emojis, prefix } = require('../config.js');

module.exports = {
	async create(message, { name, url }) {
		let previewEmoji;

		try {
			previewEmoji = await message.guild.createEmoji(url, name);
		} catch (error) {
			console.error(`Error uploading emoji to "${message.guild.name}". Name: ${name} - URL: ${url}\n`, error);
			return message.channel.send('There was an error trying to upload that emoji!');
		}

		const embed = new RichEmbed()
			.setAuthor(`Request by ${message.author.tag}`, message.author.displayAvatarURL)
			.setThumbnail(previewEmoji.url)
			.setDescription(`\`${message.author.tag}\` wants to add an emoji with the name as \`${name}\`.`)
			.addField('Preview', previewEmoji.toString());

		try {
			const { hubServer } = message.client;
			const sent = await hubServer.emojiVoting.send(embed);

			await Poll.create({
				messageID: sent.id,
				authorID: message.author.id,
				emojiName: name,
				imageURL: (url instanceof Buffer) ? previewEmoji.url : url,
			});

			await sent.react(emojis.approve);
			await sent.react(emojis.deny);

			const successMessage = [`Done! Others can now vote on your request in ${hubServer.emojiVoting}.`];

			if (message.guild.id !== hubServer.id) {
				successMessage[0] = `${successMessage.slice(0, -1)} in ${hubServer.guild.name}.`;
				successMessage.push(`If you can\'t open the channel link, send \`${prefix}server 1\` for an invite.`);
			}

			await message.channel.send(successMessage.join('\n'));
		} catch (error) {
			console.error(error);
			await message.channel.send(`There was an error trying to create the poll!\n\`\`\`js\n${error.message}\`\`\``);
		}

		return message.guild.deleteEmoji(previewEmoji);
	},
	async approve(message) {
		const pollData = await Poll.findOne({ where: { messageID: message.id } });
		const author = await message.client.fetchUser(pollData.authorID);

		try {
			emojiUtil.checkAmounts(message.guild.emojis, pollData.imageURL);
		} catch (error) {
			return this.deny(message, error.message);
		}

		await message.clearReactions();

		const emoji = await message.guild.createEmoji(pollData.imageURL, pollData.emojiName);

		const pollEntry = await Poll.findOne({ where: { messageID: message.id } });
		const emojiEntry = await Emoji.create({ emojiID: emoji.id, guildID: message.guild.id });

		pollEntry.status = 'approved';

		await pollEntry.setEmoji(emojiEntry);
		await pollEntry.save();

		const embed = new RichEmbed()
			.setColor(colors.approved)
			.setAuthor(author.username, author.displayAvatarURL)
			.setThumbnail(pollData.imageURL)
			.setDescription(`\`${pollData.emojiName}\` has been approved! ${emoji}`);

		return message.edit(embed);
	},
	async deny(message, reason) {
		await message.clearReactions();

		const pollEntry = await Poll.findOne({ where: { messageID: message.id } });
		const author = await message.client.fetchUser(pollEntry.authorID);

		pollEntry.status = 'denied';
		await pollEntry.save();

		const embed = new RichEmbed()
			.setColor(colors.denied)
			.setAuthor(author.username, author.displayAvatarURL)
			.setThumbnail(pollEntry.imageURL)
			.setDescription(reason || `\`${pollEntry.emojiName}\` was denied. :(`);

		return message.edit(embed);
	},
};
