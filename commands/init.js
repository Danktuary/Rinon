const GuildManager = require('../controllers/GuildManagerController');

const init = {
	name: 'init',
	description: 'Initialize and properly configure this guild, if applicable.',
	async execute(message) {
		if (GuildManager.checkRequirements(message.guild).passed) {
			return message.reply('already good to go!');
		}

		try {
			await GuildManager.createPollChannel(message.guild);
		} catch (e) {
			return message.channel.send([
				'I don\'t have permission to create channels here!',
				'Contact an administrator and have them adjust this.',
			].join('\n'));
		}

		message.channel.send('hi');
	},
};

module.exports = init;
