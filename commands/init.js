const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

module.exports = class InitCommand extends Command {
	constructor() {
		super('init', {
			aliases: ['init'],
			userPermissions: ['MANAGE_GUILD'],
		});
	}

	missingPermissions(clientMember, format = true) {
		const requiredPerms = [
			'ADD_REACTIONS',
			'CREATE_INSTANT_INVITE',
			'EMBED_LINKS',
			'MANAGE_CHANNELS',
			'MANAGE_EMOJIS',
			'MANAGE_MESSAGES',
			'READ_MESSAGE_HISTORY',
			'SEND_MESSAGES',
			'USE_EXTERNAL_EMOJIS',
			'VIEW_CHANNEL',
		];

		const missingPerms = clientMember.permissions.missing(requiredPerms);

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

	async setupChannels(guild) {
		if (guild.channels.some(channel => ['emoji-voting', 'rinon-testing'].includes(channel.name))) return;

		await guild.createChannel('emoji-voting', 'text', [
			{ id: guild.defaultRole.id, denied: ['SEND_MESSAGES'] },
			{ id: guild.me.id, allowed: ['SEND_MESSAGES', 'CREATE_INSTANT_INVITE', 'MANAGE_MESSAGES'] },
		]);

		return guild.createChannel('rinon-testing', 'text', [
			{ id: guild.defaultRole.id, denied: ['VIEW_CHANNEL'] },
			{ id: guild.me.id, allowed: ['VIEW_CHANNEL'] },
		]);
	}

	async exec(message) {
		const { guild } = message.channel;
		const missingPerms = this.missingPermissions(guild.me);

		if (missingPerms.length) {
			return message.channel.send(this.formatErrors([{
				title: 'Missing Permissions',
				body: `I'm missing the following permissions: ${missingPerms}`,
			}]));
		}

		if (guild.channels.some(channel => channel.name === 'emoji-voting')) {
			return message.channel.send('I\'m already good to go!');
		}

		const channels = guild.channels.filter(channel => channel.id !== message.channel.id);

		try {
			await Promise.all(channels.map(channel => channel.delete()));
			await this.setupChannels(guild);
		} catch (error) {
			console.error('Failed to initialize channels.\n', error);
			return message.channel.send('There was an error setting up the channels.');
		}

		if (guild.me.hasPermission('MANAGE_GUILD')) {
			try {
				await guild.setSystemChannel(null);
				await guild.setDefaultMessageNotifications('MENTIONS');
			} catch (error) {
				await message.channel.send([
					'Error trying to adjust the server\'s current settings.',
					'Server default message notifications and system channel settings left unconfigured.',
				]);
			}
		} else {
			await message.channel.send([
				'There are some extra settings I can adjust for you if I\'m given the "Manage Server" permission.',
				'Server default message notifications and system channel left unconfigured.',
			]);
		}

		return message.channel.send(`Done! You can now use the \`${this.handler.prefix()}add\` command to create polls.`);
	}
};
