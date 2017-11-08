const GuildManager = require('../controllers/GuildManagerController');
const { owners, prefix } = require('../config');

const messageEvent = async (client, message) => {
	if (message.channel.type !== 'text' || message.author.bot) return;
	if (!message.guild.me.permissionsIn(message.channel).has('SEND_MESSAGES')) return;

	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${prefix})\s*`);
	if (!prefixRegex.test(message.content)) return;

	const [, matchedPrefix] = message.content.match(prefixRegex);

	const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);
	const commandName = args.shift();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.requiresInit) {
		const guildStatus = GuildManager.checkRequirements(message.channel);
		if (!guildStatus.passed) return message.channel.send(guildStatus.message);
	}

	if (command.ownerOnly && !owners.includes(message.author.id)) {
		return message.reply('only owners may execute that command.');
	}

	command.execute(message, args).catch(error => {
		console.error(error);
		message.reply('something went wrong with executing that command.');
	});
};

module.exports = messageEvent;
