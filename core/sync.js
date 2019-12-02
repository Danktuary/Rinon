const { RichEmbed } = require('discord.js');
const chunk = require('lodash.chunk');
const redis = require('../core/redis.js');
const { colors } = require('../config.js');
const regexes = require('../util/regexes.js');

module.exports = class Sync {
	constructor(client) {
		this.client = client;
		if (redis.hlen('guild-invites')) {
			redis.hgetall('guild-invites').then(cachedInvites => {
				this.cachedInvites = new Map(Object.entries(cachedInvites));
			});
		}
	}

	async invites() {
		const uncachedGuilds = this.client.guilds.filter(guild => !this.cachedInvites.has(guild.id));
		if (!uncachedGuilds.size) return;

		const fetchedInvites = await this._generateInvites(uncachedGuilds);

		for (const [id, url] of fetchedInvites.entries()) {
			await redis.hset('guild-invites', id, url);
			this.cachedInvites.set(id, url);
		}
	}

	async _generateInvites(guilds) {
		const urls = new Map();

		for (const guild of guilds.values()) {
			const invites = await guild.fetchInvites();

			if (invites.size) {
				urls.set(guild.id, invites.first().url);
				continue;
			}

			const invite = await guild.channels.first().createInvite({ maxAge: 0 });
			urls.set(guild.id, invite.url);
		}

		return urls;
	}

	async serverList() {
		let content = '';
		const { guilds, hubServer } = this.client;

		for (const [id, url] of this.cachedInvites.entries()) {
			const guild = guilds.get(id);
			const [, number] = guild.name.match(regexes.guildNameEnding);
			content += `Invite link for **${guild.name}**:\n${url} (View gallery: ${hubServer.galleryChannel(number)})\n\n`;
		}

		const messages = await hubServer.serverList.fetchMessages();
		if (messages.size) return messages.first().edit(content);
		return hubServer.serverList.send(content);
	}

	async gallery(channel) {
		const number = channel.name.slice(-1);
		const guild = this.client.guilds.find(g => g.name.endsWith(`(ES#${number})`));
		const [normal, animated] = guild.emojis.partition(emoji => !emoji.animated);

		const messages = await channel.fetchMessages();
		const emojiChunks = chunk(Array.from(guild.emojis), 5);

		if (!this.cachedInvites.has(guild.id)) await this.invites();
		const invite = this.cachedInvites.get(guild.id);

		const embed = new RichEmbed()
			.setColor(colors.green)
			.setDescription(`Emojis for **${guild.name}** (${guild.channels.first()}). ${normal.size} normal, ${animated.size} animated.`);

		const formatEmojis = emojis => emojis.map(([, emoji]) => emoji.toString()).join(' ');

		if (!messages.size) {
			await channel.send(invite, { embed });
			for (const emojis of emojiChunks) await channel.send(formatEmojis(emojis));
			return;
		}

		const emojiMessages = messages.filter(message => !message.embeds.length && message.content !== invite);

		for (const [index, emojis] of emojiChunks.entries()) {
			if (index + 1 > emojiMessages.size) {
				await channel.send(formatEmojis(emojis));
				continue;
			}

			await emojiMessages.last(index + 1)[0].edit(formatEmojis(emojis));
		}

		return messages.last().edit(invite, { embed });
	}

	async galleries() {
		for (const channel of this.client.hubServer.galleryChannels.values()) {
			await this.gallery(channel);
		}
	}
};
