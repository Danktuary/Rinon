const { Collection, MessageEmbed } = require('discord.js');

const Poll = require('../controllers/PollController');

const { colors, prefix } = require('../config');

const servers = {
	name: 'servers',
	description: 'View all the emoji servers I\'m in and get an invite!',
	aliases: ['server', 'guild', 'guilds'],
	async execute(message, ...args) {
		let serverName = args;
		const serverNameRegex = /^(?:emoji\s*)?(?:server\s*)?(\d+)$/i;
		const guilds = message.client.guilds.filter(guild => /emoji server \d+/i.test(guild.name));

		if (serverName.length && serverNameRegex.test(serverName.join(' '))) {
			serverName = serverName.join(' ').match(serverNameRegex)[1];
		} else {
			const filter = m => m.author.id === message.author.id && serverNameRegex.test(m.content);

			try {
				await message.channel.send('Which server would you like info about? For example, `emoji server 1`.');

				const messages = await message.channel.awaitMessages(filter, {
					time: 15000,
					max: 1,
					errors: ['time'],
				});

				serverName = messages.first().content.match(serverNameRegex)[1];
			} catch(error) {
				return message.reply(`you didn't reply with a valid name in time! Try \`${prefix}servers Emoji Server 1\`.`);
			}
		}

		const guild = guilds.find(g => g.name.toLowerCase() === `emoji server ${serverName}`);

		if (!guild) {
			return message.reply('I couldn\'t find a server with that name!');
		}

		const pollChannel = guild.channels.find('name', 'emoji-voting');

		if (!pollChannel) {
			return message.channel.send('Sorry, it looks like that server hasn\'t been set up yet!');
		}

		const { approved, denied, pending, total } = await Poll.fetchStats(pollChannel);

		const guildData = {
			server: guild.name,
			emojis: guild.emojis.size,
			approved,
			denied,
			pending,
			total,
		};

		let invite;
		const allInvites = await guild.fetchInvites().catch(() => new Collection);

		if (allInvites.size) {
			invite = allInvites.first();
		} else {
			if (!guild.me.permissionsIn(pollChannel).has('CREATE_INSTANT_INVITE')) {
				return message.channel.send('Sorry, it looks like I\'m not allowed to create an invite to that server!');
			}

			invite = await pollChannel.createInvite({ maxAge: 0 });
		}

		const replyData = { content: [invite.url] };

		if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) {
			const fallbackText = Object.entries(guildData).map(([type, data]) => {
				const title = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
				return `**${title}**: ${data}`;
			}).join('\n');

			replyData.content.unshift(fallbackText);
		} else {
			replyData.embed = new MessageEmbed()
				.setColor(colors.misc)
				.setThumbnail(guild.iconURL());

			for (const [type, data] of Object.entries(guildData)) {
				const title = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
				replyData.embed.addField(title, data, true);
			}
		}

		return message.channel.send(replyData);
	},
};

module.exports = servers;
