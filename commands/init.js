const GuildManager = require('../controllers/GuildManagerController');

const { prefix } = require('../config');

const init = {
	name: 'init',
	description: 'Initialize and properly configure this guild, if applicable.',
	async execute(message) {
		if (GuildManager.checkRequirements(message.guild).passed) {
			return message.reply('already good to go!');
		}

		const missingPerms = GuildManager.missingPermissions(message.guild.me);
		if (missingPerms) {
			return message.reply([
				'I don\'t have enough permimssion to do that!',
				`Contact an administrator and let them know I'm missing these permissions: ${missingPerms}`,
			].join('\n'));
		}

		await GuildManager.createPollChannel(message.guild);
		message.channel.send(`Done! You can now use the \`${prefix}request\` command to create polls.`);
	},
};

module.exports = init;
