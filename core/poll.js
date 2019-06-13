const { RichEmbed } = require('discord.js');
const { Emoji, Poll } = require('../database/models/index.js');
const { emojis } = require('../config.js');

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
};
