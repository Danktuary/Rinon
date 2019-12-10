const { RichEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const { colors } = require('../config.js');

module.exports = class SyncCommand extends Command {
	constructor() {
		super('sync', {
			aliases: ['sync'],
			description: '',
			ownerOnly: true,
			args: [
				{
					id: 'mode',
					type: ['all', 'invites', 'galleries', 'gallery'],
					prompt: {
						start: () => 'Choose what you\'d like to sync: invites, galleries, gallery, or all.',
						retry: () => `That's not a valid answer! Please choose from: invites, galleries, gallery, or all.`,
					},
				},
				{
					id: 'serverNumber',
					type: 'serverNumber',
					prompt: {
						start: message => `Which server would you like to sync? Pick a number 1-${message.client.guilds.size}.`,
						retry: message => `That's not a valid answer! Pick a number 1-${message.client.guilds.size}.`,
						optional: true,
					},
				},
				{
					id: 'force',
					match: 'flag',
					prefix: ['--force', '-f'],
				},
			],
		});
	}

	async exec(message, { mode, force, serverNumber }) {
		const { hubServer, sync } = this.client;
		const syncMethod = force ? 'force-synced' : 'synced';
		const embed = new RichEmbed()
			.setColor(colors.pink)
			.setAuthor('Server Sync Action: ', this.client.user.displayAvatarURL);

		if (mode === 'all') {
			if (force) {
				await sync.clearInvites();
				await sync.clearChannel(hubServer.serverList);
				await sync.clearGalleries();
			}

			await sync.invites();
			await sync.serverList();
			await sync.galleries();

			embed.author.name += 'Full sync (invites, server list, and galleries)';
			embed.setDescription(`The invites, ${hubServer.serverList} channel, and emoji galleries have been ${syncMethod}.`);
		} else if (mode === 'invites') {
			if (force) {
				await sync.clearInvites();
				await sync.clearChannel(hubServer.serverList);
			}

			await sync.invites();
			await sync.serverList();

			embed.author.name += 'Invites and server list';
			embed.setDescription(`The invites and ${hubServer.serverList} channel have been ${syncMethod}.`);
		} else if (mode === 'galleries') {
			if (force) await sync.clearGalleries();
			await sync.galleries();
			embed.author.name += 'Galleries';
			embed.setDescription(`The emoji galleries have been ${syncMethod}.`);
		} else if (mode === 'gallery') {
			if (!serverNumber) return message.channel.send('You need to provide a server number with your input.');
			const channel = hubServer.galleryChannel(serverNumber);

			if (force) await sync.clearChannel(channel);
			await sync.gallery(channel);
			embed.author.name += `Gallery (#${serverNumber})`;
			embed.setDescription(`The emoji gallery for ${channel} has been ${syncMethod}.`);
		}

		await hubServer.logsChannel.send(embed);
		return message.channel.send('Syncing complete!');
	}
};
