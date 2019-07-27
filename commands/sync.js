const { Command } = require('discord-akairo');
const redis = require('../core/redis.js');

module.exports = class SyncCommand extends Command {
	constructor() {
		super('sync', {
			aliases: ['sync'],
			ownerOnly: true,
		});
	}

	async exec(message) {
		await this.syncInvites();
		return message.channel.send('Syncing complete!');
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
