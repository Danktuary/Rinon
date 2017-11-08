/* eslint-disable no-inline-comments */

const config = {
	prefix: '!',
	token: 'your-token-goes-here',
	owners: ['your-id-goes-here'],
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
};

module.exports = config;
