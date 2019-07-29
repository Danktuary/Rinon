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
			await hubServer.serverList.bulkDelete(10);
			await Promise.all(hubServer.galleryChannels.map(channel => channel.bulkDelete(10)));
		}

		await sync.invites();
		await sync.galleries();
		return message.util.send('Syncing complete!');
	}
};
