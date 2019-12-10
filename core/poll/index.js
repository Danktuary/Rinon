const { RichEmbed } = require('discord.js');
const { Op } = require('sequelize');
const { colors } = require('../../config.js');

module.exports = class Poll {
	constructor(client) {
		this.client = client;
	}

	async sendEmbed({ channel, author, thumbnail, description, fields = [], color = 'pink' }) {
		const embed = new RichEmbed()
			.setAuthor(`Request by ${author.tag} (${author.id})`, author.displayAvatarURL)
			.setDescription(description)
			.setThumbnail(thumbnail)
			.setColor(colors[color]);

		if (fields.length) {
			for (const field of fields) {
				embed.addField(field.title, field.value);
			}
		}

		return channel.send(embed);
	}

	async search(searchTerm, { column }) {
		const pollData = await this.model.findOne({
			where: {
				status: 'pending',
				[column]: { [Op.iLike]: searchTerm },
			},
		});

		if (!pollData) {
			throw new Error('I couldn\'t find any requests that match your search term!');
		}

		return this.client.hubServer.votingChannel.fetchMessage(pollData.messageID);
	}
};
