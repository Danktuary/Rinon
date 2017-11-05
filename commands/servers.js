const { Collection } = require('discord.js');

const { prefix } = require('../config');

const servers = {
	name: 'servers',
	description: 'View all the emoji servers I\'m in and get an invite!',
	aliases: ['server', 'guild', 'guilds'],
	async execute(message, [...serverName]) {
		const serverNameRegex = /^(?:emoji\s*)?(?:server\s*)?(\d+)$/i;
		const guilds = message.client.guilds.filter(guild => /Emoji Server \d+/i.test(guild.name));

		if (serverName.length && serverNameRegex.test(serverName.join(' '))) {
			serverName = serverName.join(' ').match(serverNameRegex)[1];
		} else {
			const filter = m => m.author.id === message.author.id && serverNameRegex.test(m.content);

			try {
				await message.channel.send('Which server would you like info about?');
				const messages = await message.channel.awaitMessages(filter, { time: 15000, max: 1, errors: ['time'] });
				serverName = messages.first().content.match(serverNameRegex)[1];
			} catch(error) {
				return message.reply(`you didn't reply with a valid name! Try \`${prefix}servers Emoji Server 1\`.`);
			}
		}

		let invite;
		const guild = guilds.find(g => g.name.toLowerCase() === `emoji server ${serverName}`);

		if (!guild) {
			return message.reply('I couldn\'t find a server with that name!');
		}

		const invites = await guild.fetchInvites().catch(() => new Collection);

		if (invites.size) {
			invite = invites.first();
		} else {
			const pollChannel = guild.channels.find('name', 'emoji-voting');

			if (!pollChannel) {
				return message.channel.send('Sorry, it looks like that server hasn\'t been set up yet!');
			}

			if (!guild.me.permissionsIn(pollChannel).has('CREATE_INSTANT_INVITE')) {
				return message.channel.send('Sorry, it looks like I\'m not allowed to create invites on that server!');
			}

			invite = await pollChannel.createInvite({ maxAge: 0 });
		}

		return message.channel.send(`Here's an invite to ${guild.name}! ${invite}`);
	},
};

module.exports = servers;
