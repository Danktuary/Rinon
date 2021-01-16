const { Command } = require('discord-akairo')
const permissionsUtil = require('../util/permissions.js')
const regexes = require('../util/regexes.js')

module.exports = class InitializeCommand extends Command {
	constructor() {
		super('initialize', {
			aliases: ['initialize', 'init'],
			description: 'Initialize a new guild with the proper settings to make it function as needed.',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'skipConfirmation',
					match: 'flag',
					flag: ['--yes', '-y'],
				},
			],
		})
	}

	async exec(message, { skipConfirmation }) {
		const { guild } = message.channel
		const [, guildNumber] = guild.name.match(regexes.guildNameEnding)
		const missingPermissions = guild.me.permissions.missing(permissionsUtil.required)

		if (missingPermissions.length) {
			return message.channel.send(`I'm missing the following permissions: ${permissionsUtil.formatNames(missingPermissions)}`)
		}

		if (guild.channels.cache.some(channel => channel.name === 'info') || this.client.hubServer.galleryChannel(guildNumber)) {
			return message.util.send('I\'m already good to go!')
		}

		if (!skipConfirmation) {
			try {
				await this.confirmInit(message)
			} catch (error) {
				return message.channel.send(error.message)
			}
		}

		await this.setupChannels(guild)

		if (guild.me.permissions.has('MANAGE_GUILD')) {
			try {
				await guild.setSystemChannel(null)
				await guild.setDefaultMessageNotifications('MENTIONS')
			} catch (error) {
				await message.channel.send([
					'Error trying to adjust the server\'s current settings.',
					'Server default message notifications and system channel settings left unconfigured.',
				])
			}
		} else {
			await message.channel.send([
				'There are some extra settings I can adjust for you if I\'m given the "Manage Server" permission.',
				'Server default message notifications and system channel left unconfigured.',
			])
		}

		return message.channel.send(`Done! You can now use the \`${this.handler.prefix}add\` command to create polls.`)
	}

	async confirmInit(message) {
		await message.channel.send([
			'This will setup the necessary additional channels for this server.',
			'I\'ll also try to configure the guild settings appropriately, if possible. Continue?',
		])

		let response
		const options = { max: 1, time: 20000, errors: ['time'] }
		const filter = m => ['yes', 'y', 'no', 'n'].includes(m.content.toLowerCase()) && m.author.id === message.author.id

		try {
			const responses = await message.channel.awaitMessages(filter, options)
			response = responses.first().content.toLowerCase()
		} catch (error) {
			throw new Error('You didn\'t reply in time. Initialization cancelled.')
		}

		if (response && ['no', 'n'].includes(response)) {
			throw new Error('Got it, I\'ve cancelled the initialization.')
		}
	}

	async setupChannels(guild) {
		const { hubServer, sync } = this.client
		const [, guildNumber] = guild.name.match(regexes.guildNameEnding)

		for (const channel of guild.channels.cache.filter(c => c.type !== 'text' && c.name !== 'general').values()) {
			await channel.delete()
		}

		await guild.channels.cache
			.find(channel => channel.name.toLowerCase() === 'general')
			.createOverwrite(guild.roles.everyone.id, { MENTION_EVERYONE: false })

		await guild.channels.create('info', {
			type: 'text',
			permissionOverwrites: [
				{ id: this.client.user.id, allow: ['SEND_MESSAGES'] },
				{ id: guild.roles.everyone.id, deny: ['SEND_MESSAGES'] },
			],
		})

		const galleriesCategory = hubServer.guild.channels.cache.find(channel => {
			return channel.type === 'category' && channel.name.toLowerCase() === 'galleries'
		})

		const galleryChannel = await hubServer.guild.channels.create(`emoji-gallery-${guildNumber}`, {
			type: 'text',
			permissionOverwrites: [
				{ id: this.client.user.id, allow: ['SEND_MESSAGES'] },
				{ id: hubServer.guild.roles.everyone.id, deny: ['SEND_MESSAGES'] },
			],
			parent: galleriesCategory,
		})

		await sync.status()
		await sync.infoChannel(guild)
		return sync.gallery(galleryChannel)
	}
}
