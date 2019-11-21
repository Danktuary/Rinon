const { RichEmbed } = require('discord.js');
const chunk = require('lodash.chunk');
const redis = require('../core/redis.js');
const { colors } = require('../config.js');
const regexes = require('../util/regexes.js');

module.exports = class Sync {
	constructor(client) {
		this.client = client;
	}

	async invites() {
		const invites = new Map();
		const { guilds, hubServer } = this.client;

		if (redis.hlen('guild-invites')) {
			const cachedInvites = await redis.hgetall('guild-invites');
			const cachedGuilds = guilds.filter(guild => Object.keys(cachedInvites).includes(guild.id));

			for (const id of cachedGuilds.keys()) {
				invites.set(id, cachedInvites[id]);
			}
		}

		const uncachedGuilds = guilds.filter(guild => !invites.has(guild.id));
		const fetchedInvites = await this._generateInvites(uncachedGuilds);

		for (const [id, url] of fetchedInvites.entries()) {
			await redis.hset('guild-invites', id, url);
			invites.set(id, url);
		}

		let content = '';

		for (const [id, url] of invites.entries()) {
			const guild = guilds.get(id);
			const [, number] = guild.name.match(regexes.guildNameEnding);
			const gallery = hubServer.galleryChannels.find(channel => channel.name.slice(-1) === number);

			content += `Invite link for **${guild.name}**:\n${url} (View gallery: ${gallery})\n\n`;
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
		const invite = await redis.hget('guild-invites', guild.id);
		const embed = new RichEmbed()
			.setColor(colors.approved)
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
};
