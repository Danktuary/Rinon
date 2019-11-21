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

	async sendEmbed({ author, description, thumbnail, emoji, channel, status = 'pending' }) {
		const embed = new RichEmbed()
			.setAuthor(`Request by ${author.tag} (${author.id})`, author.displayAvatarURL)
			.setDescription(description)
			.setThumbnail(thumbnail || (emoji && emoji.url));

		if (emoji) embed.addField('Preview', emoji.toString());

		if (status !== 'pending') {
			embed.fields = [];
			embed.setColor(config.colors[status]);
		}

		const sent = await (channel || this.channel).send(embed);

		if (status === 'pending') {
			await sent.react(config.emojis.approve);
			await sent.react(config.emojis.deny);
		}

		return sent;
	}

	async search(searchTerm, data = {}) {
		const column = data.column || (/\d+/.test(searchTerm) ? 'message_id' : 'emoji_name');
		const pollData = await models[data.model || 'Poll'].findOne({
			where: {
				status: 'pending',
				[column]: { [Op.iLike]: searchTerm },
			},
		});

		if (!pollData) {
			throw new Error('I couldn\'t find any requests that match your search term!');
		}

		return this.channel.fetchMessage(pollData.messageID);
	}
};
