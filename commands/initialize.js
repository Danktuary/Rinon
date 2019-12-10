const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const permissionsUtil = require('../util/permissions.js');
const regexes = require('../util/regexes.js');

module.exports = class InitializeCommand extends Command {
	constructor() {
		super('initialize', {
			aliases: ['initialize', 'init'],
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'skipConfirmation',
					match: 'flag',
					prefix: ['--yes', '-y'],
				},
			],
		});
	}

	async exec(message, { skipConfirmation }) {
		const { guild } = message.channel;
		const missingPerms = this.missingPermissions(guild.me);

		if (missingPerms.length) {
			return message.util.send(this.formatErrors([{
				title: 'Missing Permissions',
				body: `I'm missing the following permissions: ${missingPerms}`,
			}]));
		}

		if (guild.channels.some(channel => channel.name === 'info')) {
			return message.util.send('I\'m already good to go!');
		}

		if (!skipConfirmation) {
			try {
				await this.confirmInit(message);
			} catch (error) {
				return message.util.send(error.message);
			}
		}

		const channels = guild.channels.filter(channel => channel.id !== message.channel.id);

		try {
			await Promise.all(channels.map(channel => channel.delete()));
			await this.setupChannels(guild);
		} catch (error) {
			console.error('Failed to initialize channels.\n', error);
			return message.util.send('There was an error setting up the channels.');
		}

		if (guild.me.hasPermission('MANAGE_GUILD')) {
			try {
				await guild.setSystemChannel(null);
				await guild.setDefaultMessageNotifications('MENTIONS');
			} catch (error) {
				await message.util.send([
					'Error trying to adjust the server\'s current settings.',
					'Server default message notifications and system channel settings left unconfigured.',
				]);
			}
		} else {
			await message.util.send([
				'There are some extra settings I can adjust for you if I\'m given the "Manage Server" permission.',
				'Server default message notifications and system channel left unconfigured.',
			]);
		}

		return message.util.send(`Done! You can now use the \`${this.handler.prefix()}add\` command to create polls.`);
	}


	missingPermissions(clientMember, format = true) {
		const missingPerms = clientMember.permissions.missing(permissionsUtil.required);

		if (!format) return missingPerms;
		return missingPerms.map(perm => `\`${perm}\``).join(', ');
	}

	formatErrors(errors) {
		errors.unshift({
			title: 'Execution Error',
			body: 'I can\'t execute that command because I haven\'t been properly configured yet!',
		});

		const message = new MessageEmbed().setColor('#e84a4a');

		for (const error of errors) {
			message.addField(error.title, error.body);
		}

		return message;
	}

	async confirmInit(message) {
		await message.util.send([
			'This will delete all other channels in this server and setup the necessary ones.',
			'I\'ll also try to configure the guild settings appropriately, if possible. Continue?',
		]);

		let response;
		const options = { max: 1, time: 20000, errors: ['time'] };
		const filter = m => ['yes', 'y', 'no', 'n'].includes(m.content.toLowerCase());

		try {
			const responses = await message.channel.awaitMessages(filter, options);
			response = responses.first().content.toLowerCase();
		} catch (error) {
			throw new Error('You didn\'t reply in time. Initialization cancelled.');
		}

		if (response && ['no', 'n'].includes(response)) {
			throw new Error('Got it, I\'ve cancelled the initialization.');
		}
	}

	async setupChannels(guild) {
		const { hubServer, sync } = this.client;

		const infoChannel = guild.channels.find(channel => channel.name === 'info')
			|| await guild.createChannel('info', 'text', [
				{ id: guild.defaultRole.id, denied: ['SEND_MESSAGES'] },
				{ id: guild.me.id, allowed: ['SEND_MESSAGES', 'CREATE_INSTANT_INVITE', 'MANAGE_MESSAGES'] },
			]);

		const [, number] = guild.name.match(regexes.guildNameEnding);

		return infoChannel.send([
			`Welcome! This is **${guild.name}**, one of our many emoji servers.`,
			'If you haven\'t already, please join the main server! That\'s where you\'ll get to vote on polls for new emojis and view all the existing emojis our servers have to offer.\n',
			`**Emoji gallery for server #${number}:** ${hubServer.galleryChannel(number)}`,
			`**Invite link for ${hubServer.guild.name}:** ${sync.cachedInvites.get(hubServer.guild.id)}`,
		]);
	}
};
