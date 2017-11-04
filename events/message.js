const GuildManager = require('../controllers/GuildManagerController');
const { owners, prefix } = require('../config');

const messageEvent = async (client, message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/\s+/);
	const commandName = args.shift();

	if (!client.commands.has(commandName)) return;

	const guildStatus = GuildManager.checkRequirements(message.guild);

	if (!guildStatus.passed && commandName !== 'init') {
		return message.channel.send(guildStatus.message);
	}

	const command = client.commands.get(commandName);

	if (command.ownerOnly && owners.includes(message.author.id)) {
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
