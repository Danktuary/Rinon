const config = {
	prefix: '>',
	token: 'your-token-goes-here',
	owners: ['your-id-goes-here'],
	paths: {
		events: `${__dirname}/events`,
		commands: `${__dirname}/commands`,
		models: `${__dirname}/database/models`,
	},
	emojis: {
		approve: 'approval-emoji-id-goes-here',
		deny: 'denial-emoji-id-goes-here',
	},
};

module.exports = config;
