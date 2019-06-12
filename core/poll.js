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
			const channel = message.guild.channels.find(c => c.name === 'emoji-voting');
			const sent = await channel.send(embed);

			await Poll.create({
				messageID: sent.id,
				authorID: message.author.id,
				emojiName: name,
				imageURL: (url instanceof Buffer) ? previewEmoji.url : url,
			});

			await sent.react(emojis.approve);
			await sent.react(emojis.deny);

			await message.channel.send(`Done! Others can now vote on your request in ${channel}.`);
		} catch (error) {
			console.error(error);
			await message.channel.send('There was an error trying to create the poll!');
		}

		return message.guild.deleteEmoji(previewEmoji);
	},
};
