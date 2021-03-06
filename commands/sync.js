const { MessageEmbed } = require('discord.js')
const { Command } = require('discord-akairo')
const { colors } = require('../config.js')

module.exports = class SyncCommand extends Command {
	constructor() {
		super('sync', {
			aliases: ['sync'],
			description: 'Sync properties such as server invites, info channels, and emoji galleries.',
			ownerOnly: true,
			args: [
				{
					id: 'mode',
					type: ['all', 'invites', 'info', 'galleries', 'gallery', 'status'],
					prompt: {
						start: () => 'choose what you\'d like to sync: invites, info, galleries, gallery, status, or all.',
						retry: () => `That's not a valid answer! Please choose from: invites, info, galleries, gallery, status, or all.`,
					},
				},
				{
					id: 'serverNumber',
					type: 'serverNumber',
					prompt: {
						start: message => `which server would you like to sync? Pick a number 1-${message.client.guilds.cache.size}.`,
						retry: message => `That's not a valid answer! Pick a number 1-${message.client.guilds.cache.size}.`,
						optional: true,
					},
				},
				{
					id: 'force',
					match: 'flag',
					flag: ['--force', '-f'],
				},
			],
		})
	}

	async exec(message, { mode, force, serverNumber }) {
		const { hubServer, sync } = this.client
		const syncMethod = force ? 'force-synced' : 'synced'
		const embed = new MessageEmbed()
			.setColor(colors.pink)
			.setAuthor('Sync Action: ', hubServer.guild.iconURL({ format: 'png', dynamic: true }))

		if (mode === 'all') {
			if (force) {
				await sync.clearInvites()
				await sync.clearChannel(hubServer.serverList)
				await sync.clearInfoChannels()
				await sync.clearGalleries()
			}

			await sync.status()
			await sync.invites()
			await sync.serverList()
			await sync.infoChannels()
			await sync.galleries()

			embed.author.name += 'Full sync (invites, server list, info channels, and galleries)'
			embed.setDescription(`The invites, ${hubServer.serverList} channel, info channels, and emoji galleries have been ${syncMethod}.`)
		} else if (mode === 'invites') {
			if (force) {
				await sync.clearInvites()
				await sync.clearChannel(hubServer.serverList)
				await sync.clearInfoChannels()
			}

			await sync.invites()
			await sync.serverList()
			await sync.infoChannels()

			embed.author.name += 'Invites and server list'
			embed.setDescription(`The invites, ${hubServer.serverList} channel, and info channels have been ${syncMethod}.`)
		} else if (mode === 'info') {
			if (!serverNumber) {
				return message.channel.send('You need to provide a server number with your input.')
			} else if (serverNumber === 1) {
				return message.channel.send('Server #1 doesn\'t have an info channel.')
			}

			const guild = this.client.guilds.cache.find(g => g.name.endsWith(`(ES#${serverNumber})`))
			const channel = guild.channels.cache.find(c => c.name === 'info')

			if (force) await sync.clearChannel(channel)
			await sync.infoChannel(guild)

			embed.author.name += `Info channel (Server #${serverNumber})`
			embed.setDescription(`The ${channel} channel for server #${serverNumber} has been ${syncMethod}.`)
		} else if (mode === 'galleries') {
			if (force) await sync.clearGalleries()
			await sync.galleries()

			embed.author.name += 'Galleries'
			embed.setDescription(`The emoji galleries have been ${syncMethod}.`)
		} else if (mode === 'gallery') {
			if (!serverNumber) return message.channel.send('You need to provide a server number with your input.')
			const channel = hubServer.galleryChannel(serverNumber)

			if (force) await sync.clearChannel(channel)
			await sync.gallery(channel)

			embed.author.name += `Gallery (Server #${serverNumber})`
			embed.setDescription(`The emoji gallery for ${channel} has been ${syncMethod}.`)
		} else if (mode === 'status') {
			await sync.status()

			embed.author.name += 'Status'
			embed.setDescription('The bot status has been synced.')
		}

		await hubServer.logsChannel.send(embed)
		return message.channel.send('Syncing complete!')
	}
}
