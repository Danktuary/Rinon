const { MessageEmbed } = require('discord.js');
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
		const [normal, animated] = client.emojis.cache.partition(emoji => !emoji.animated);

		return client.user.setPresence({
			activity: {
				name: `${normal.size + animated.size} emojis (${normal.size} normal, ${animated.size} animated) in ${client.guilds.cache.size} servers`,
			},
		});
	}

	async invites() {
		const uncachedGuilds = this.client.guilds.cache.filter(guild => !this.cachedInvites.has(guild.id));
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

			const invite = await guild.channels.cache.first().createInvite({ maxAge: 0 });
			urls.set(guild.id, invite.url);
		}

		return urls;
	}

	async serverList() {
		const content = [];
		const { guilds, hubServer } = this.client;

		for (const [id, url] of this.cachedInvites.entries()) {
			const guild = guilds.cache.get(id);
			const [, number] = guild.name.match(regexes.guildNameEnding);
			content.push(`Invite link for **${guild.name}**:\n${url} (View gallery: ${hubServer.galleryChannel(number)})\n\n`);
		}

		const contentChunks = chunk(content, 5);
		const messages = await hubServer.serverList.messages.fetch();

		if (!messages.size) {
			for (const contentChunk of contentChunks) await hubServer.serverList.send(contentChunk.join(''));
			return;
		}

		for (const [index, contentChunk] of contentChunks.entries()) {
			if (index + 1 > messages.size) {
				await hubServer.serverList.send(contentChunk.join(''));
				continue;
			}

			await messages.last(index + 1)[0].edit(contentChunk.join(''));
		}
	}

	async infoChannel(guild) {
		const { hubServer } = this.client;
		const channel = guild.channels.cache.find(c => c.name === 'info');
		const [, number] = guild.name.match(regexes.guildNameEnding);

		const content = [
			`Welcome! This is **${guild.name}**, one of our ${this.client.guilds.cache.size} emoji servers.`,
			'If you haven\'t already, please join the main server! That\'s where you\'ll get to vote on polls for new emojis and view all the existing emojis our servers have to offer.\n',
			`**Emoji gallery for server #${number}:** ${hubServer.galleryChannel(number)}`,
			`**Invite link for ${hubServer.guild.name}:** ${this.cachedInvites.get(hubServer.guild.id)}`,
		].join('\n');

		const messages = await channel.messages.fetch();
		if (messages.size) return messages.first().edit(content);
		return channel.send(content);
	}

	async infoChannels() {
		const guilds = this.client.guilds.cache.filter(guild => guild.id !== this.client.hubServer.guild.id);

		for (const guild of guilds.values()) {
			await this.infoChannel(guild);
		}
	}

	async gallery(channel) {
		const [, number] = channel.name.match(regexes.galleryChannelNameEnding);
		const guild = this.client.guilds.cache.find(g => g.name.endsWith(`(ES#${number})`));
		const [normal, animated] = guild.emojis.cache.partition(emoji => !emoji.animated);

		const messages = await channel.messages.fetch();
		const emojiChunks = chunk(Array.from(guild.emojis.cache), 5);

		if (!this.cachedInvites.has(guild.id)) await this.invites();
		const invite = this.cachedInvites.get(guild.id);

		const embed = new MessageEmbed()
			.setColor(colors.pink)
			.setDescription(`Emojis for **${guild.name}** (${guild.channels.cache.first()}). ${normal.size} normal, ${animated.size} animated.`);

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
			await channel.bulkDelete(100, true);
		} catch (error) {
			await this._altDelete(await channel.messages.fetch(100));
		}
	}

	async clearGalleries() {
		for (const channel of this.client.hubServer.galleryChannels.values()) {
			await this.clearChannel(channel);
		}
	}

	async clearInfoChannels() {
		const guilds = this.client.guilds.cache.filter(guild => guild.id !== this.client.hubServer.guild.id);

		for (const guild of guilds.values()) {
			const channel = guild.channels.cache.find(c => c.name === 'info');
			await this.clearChannel(channel);
		}
	}

	_altDelete(items) {
		return Promise.all(items.map(item => item.delete()));
	}
};
