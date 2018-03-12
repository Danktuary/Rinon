/* eslint-disable no-inline-comments */

const config = {
	prefix: '>',
	token: 'your-token-goes-here',
	owners: ['your-id-goes-here'],
	database: {
		credentials: {
			database: '',
			username: '',
			password: '',
		},
		options: {
			host: 'localhost',
			dialect: 'postgres',
			logging: false,
		},
	},
	voteEndAmount: 3,
	paths: {
		events: `${__dirname}/events`,
		commands: `${__dirname}/commands`,
	},
	emojis: {
		approve: 'approval-emoji-id',
		deny: 'denial-emoji-id',
	},
	colors: {
		approved: 4445328, // seafoam green
		denied: 14042180, // flat red
		misc: 16746911, // rinon pink
	},
	disabledEvents: [
		'GUILD_BAN_ADD',
		'GUILD_BAN_REMOVE',
		'CHANNEL_PINS_UPDATE',
		'MESSAGE_DELETE_BULK',
		'USER_UPDATE',
		'USER_NOTE_UPDATE',
		'USER_SETTINGS_UPDATE',
		'PRESENCE_UPDATE',
		'VOICE_STATE_UPDATE',
		'TYPING_START',
		'VOICE_SERVER_UPDATE',
		'RELATIONSHIP_ADD',
		'RELATIONSHIP_REMOVE',
	],
};

module.exports = config;
