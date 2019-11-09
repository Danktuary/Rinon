const { Command } = require('discord-akairo');
const redis = require('../core/redis.js');
const Sync = require('../core/sync.js');

module.exports = class SyncCommand extends Command {
	constructor() {
		super('sync', {
			aliases: ['sync'],
			ownerOnly: true,
			args: [
				{
					id: 'force',
					match: 'flag',
					prefix: ['--force', '-f'],
				},
			],
		});
	}

	async exec(message, { force }) {
		const sync = new Sync(this.client);

		if (force) {
			const { hubServer } = this.client;
			await redis.del('guild-invites');

			const altDelete = items => Promise.all(items.map(item => item.delete()));

			try {
				await hubServer.serverList.bulkDelete(100);
			} catch (error) {
				await altDelete(await hubServer.serverList.fetchMessages(100));
			}

			try {
				await Promise.all(hubServer.galleryChannels.map(channel => channel.bulkDelete(100)));
			} catch (error) {
				for (const channel of hubServer.galleryChannels.values()) {
					await altDelete(await channel.fetchMessages(100));
				}
			}
		}

		await sync.invites();
		await sync.galleries();
		return message.util.send('Syncing complete!');
	}
};
