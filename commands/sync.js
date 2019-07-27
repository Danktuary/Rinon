const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const chunk = require('lodash.chunk');
const redis = require('../core/redis.js');
const { colors } = require('../config.js');

module.exports = class SyncCommand extends Command {
	constructor() {
		super('sync', {
			aliases: ['sync'],
			ownerOnly: true,
		});
	}

	async exec(message) {
		await this.syncInvites();
		await this.syncGalleries();
		return message.channel.send('Syncing complete!');
	}

	async syncGalleries() {
		const { guilds, hubServer } = this.client;

		for (const channel of hubServer.galleryChannels.values()) {
			const number = channel.name.slice(-1);
			const guild = guilds.find(g => g.name.endsWith(`(ES#${number})`));
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
				continue;
			}

			const emojiMessages = messages.filter(message => !message.embeds.length && message.content !== invite);

			for (const [index, emojis] of emojiChunks.entries()) {
				await emojiMessages.last(index + 1)[0].edit(formatEmojis(emojis));
			}

			await messages.last().edit(invite, { embed });
		}
	}

	async syncInvites() {
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
		const fetchedInvites = await this.generateInvites(uncachedGuilds);

		for (const [id, url] of fetchedInvites.entries()) {
			await redis.hset('guild-invites', id, url);
			invites.set(id, url);
		}

		let content = '';

		for (const [id, url] of invites.entries()) {
			const guild = guilds.get(id);
			const [, number] = guild.name.match(/\(ES#(\d+)\)$/);
			const gallery = hubServer.galleryChannels.find(channel => channel.name.slice(-1) === number);

			content += `Invite link for **${guild.name}**:\n${url} (View gallery: ${gallery})\n\n`;
		}

		const messages = await hubServer.serverList.fetchMessages();
		if (messages.size) return messages.first().edit(content);
		return hubServer.serverList.send(content);
	}

	async generateInvites(guilds) {
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
