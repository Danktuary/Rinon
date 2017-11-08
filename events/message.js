const GuildManager = require('../controllers/GuildManagerController');
const { owners, prefix } = require('../config');

const messageEvent = async (client, message) => {
	if (message.channel.type !== 'text' || message.author.bot) return;

	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${prefix}) *?`);
	if (!prefixRegex.test(message.content)) return;

	const matchedPrefix = message.content.match(prefixRegex)[1];

	const args = message.content.slice(matchedPrefix.length).split(/\s+/);
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

	try {
		command.execute(message, args);
	} catch(e) {
		console.error(e);
		message.reply('something went wrong with executing that command.');
	}
};

module.exports = messageEvent;
