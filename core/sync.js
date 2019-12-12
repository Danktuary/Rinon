const { RichEmbed } = require('discord.js');
const chunk = require('lodash.chunk');
const redis = require('../core/redis.js');
const { colors } = require('../config.js');
const regexes = require('../util/regexes.js');

module.exports = class Sync {
	constructor(client) {
		this.client = client;
		this.cachedInvites = new Map();

		if (redis.hlen('guild-invites')) {
			redis.hgetall('guild-invites').then(cachedInvites => {
				this.cachedInvites = new Map(Object.entries(cachedInvites));
			});
		}
	}

	status() {
		const { client } = this;
		const [normal, animated] = client.emojis.partition(emoji => !emoji.animated);

		return client.user.setPresence({
			game: {
				name: `${client.emojis.size} emojis (${normal.size} normal, ${animated.size} animated) in ${client.guilds.size} servers`,
			},
		});
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

	async infoChannel(guild) {
		const { hubServer } = this.client;
		const channel = guild.channels.find(c => c.name === 'info');
		const [, number] = guild.name.match(regexes.guildNameEnding);

		const content = [
			`Welcome! This is **${guild.name}**, one of our ${this.client.guilds.size} emoji servers.`,
			'If you haven\'t already, please join the main server! That\'s where you\'ll get to vote on polls for new emojis and view all the existing emojis our servers have to offer.\n',
			`**Emoji gallery for server #${number}:** ${hubServer.galleryChannel(number)}`,
			`**Invite link for ${hubServer.guild.name}:** ${this.cachedInvites.get(hubServer.guild.id)}`,
		].join('\n');

		const messages = await channel.fetchMessages();
		if (messages.size) return messages.first().edit(content);
		return channel.send(content);
	}

	async infoChannels() {
		const guilds = this.client.guilds.filter(guild => guild.id !== this.client.hubServer.guild.id);

		for (const guild of guilds.values()) {
			await this.infoChannel(guild);
		}
	}

	async gallery(channel) {
		const [, number] = channel.name.match(regexes.galleryChannelNameEnding);
		const guild = this.client.guilds.find(g => g.name.endsWith(`(ES#${number})`));
		const [normal, animated] = guild.emojis.partition(emoji => !emoji.animated);

		const messages = await channel.fetchMessages();
		const emojiChunks = chunk(Array.from(guild.emojis), 5);

		if (!this.cachedInvites.has(guild.id)) await this.invites();
		const invite = this.cachedInvites.get(guild.id);

		const embed = new RichEmbed()
			.setColor(colors.pink)
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

	clearInvites() {
		this.cachedInvites.clear();
		return redis.del('guild-invites');
	}

	async clearChannel(channel) {
		try {
			await channel.bulkDelete(100);
		} catch (error) {
			await this._altDelete(await channel.fetchMessages(100));
		}
	}

	async clearGalleries() {
		for (const channel of this.client.hubServer.galleryChannels.values()) {
			await this.clearChannel(channel);
		}
	}

	async clearInfoChannels() {
		const guilds = this.client.guilds.filter(guild => guild.id !== this.client.hubServer.guild.id);

		for (const guild of guilds.values()) {
			const channel = guild.channels.find(c => c.name === 'info');
			await this.clearChannel(channel);
		}
	}

	_altDelete(items) {
		return Promise.all(items.map(item => item.delete()));
	}
};
