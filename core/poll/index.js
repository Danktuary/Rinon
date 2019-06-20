const { RichEmbed } = require('discord.js');
const config = require('../../config.js');

module.exports = class Poll {
	constructor(client) {
		this.client = client;
	}

	async sendEmbed({ author, description, emoji = null, channel = this.channel, status = 'pending' }) {
		const embed = new RichEmbed()
			.setAuthor(`Request by ${author.tag}`, author.displayAvatarURL)
			.setDescription(description);

		if (emoji) {
			embed.setThumbnail(emoji.url).addField('Preview', emoji.toString());
		}

		if (status !== 'pending') {
			embed.fields = [];
			embed.setColor(config.colors[status]);
		}

		const sent = await channel.send(embed);

		if (status === 'pending') {
			await sent.react(config.emojis.approve);
			await sent.react(config.emojis.deny);
		}

		return sent;
	}

	async search(searchTerm) {
		const messages = await this.channel.fetchMessages({ limit: 100 });

		let requestMessage = messages.find(message => {
			const [embed] = message.embeds;
			return embed && !embed.color && (new RegExp(`\`${searchTerm}\`\\.$`, 'i')).test(embed.description);
		});

		if (!requestMessage && /\d+/.test(searchTerm)) {
			requestMessage = await this.channel.fetchMessage(searchTerm);
		}

		if (!requestMessage) {
			throw new Error('I couldn\'t find any requests that match your search term!');
		}

		return requestMessage;
	}
};
