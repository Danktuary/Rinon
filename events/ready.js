// const GuildManager = require('../controllers/GuildManagerController');

const ready = client => {
	// for (const guild of client.guilds.values()) {
	// 	GuildManager.createPollChannel(guild);
	// }

	console.log(`Logged in as ${client.user.tag}!`);
};

module.exports = ready;
