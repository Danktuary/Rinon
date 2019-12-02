const { RichEmbed } = require('discord.js');
const { Op } = require('sequelize');
const Sync = require('../sync.js');
const config = require('../../config.js');
const models = require('../../database/models/index.js');

module.exports = class Poll {
	constructor(client) {
		this.client = client;
		this.sync = new Sync(client);
	}

	async sendEmbed({ channel, author, thumbnail, description, fields = [], status = 'pending' }) {
		const embed = new RichEmbed()
			.setAuthor(`Request by ${author.tag} (${author.id})`, author.displayAvatarURL)
			.setDescription(description)
			.setThumbnail(thumbnail)
			.setColor(config.colors[status] || null);

		if (fields.length) {
			for (const field of fields) {
				embed.addField(field.title, field.value);
			}
		}

		return channel.send(embed);
	}

	async search(searchTerm, { column, model }) {
		const pollData = await models[model].findOne({
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
