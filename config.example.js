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

const config = {
	prefix: '>',
	token: 'MzcyNjg1NTg2MTI2ODY0Mzk2.DNHyDA.9yji0yAmHssw_Lck9tuWSltqq5U',
	owners: ['126485019500871680'],
	voteEndAmount: 3,
	paths: {
		events: `${__dirname}/events`,
		commands: `${__dirname}/commands`,
		models: `${__dirname}/database/models`,
	},
	emojis: {
		approve: '372693863300595723',
		deny: '372693884557590539',
	},
	colors: {
		approved: 4445328, // seafoam green
		denied: 14042180, // flat red
		misc: 16746911, // rinon pink
	},
};

module.exports = config;
