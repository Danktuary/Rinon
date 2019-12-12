module.exports = {
	token: '',
	prefix: '>',
	ownerID: '123456789012345678',
	hubServerID: '098765432109876543',
	database: {
		name: 'rinon',
		username: 'root',
		password: 'root',
		options: {
			host: 'localhost',
			dialect: 'postgres',
			logging: false,
		},
	},
	voteEndAmount: 3,
	emojis: {
		approve: '112233445566778899',
		deny: '009988776655443322',
	},
	colors: {
		green: 4445328,
		red: 14042180,
		pink: 16746911,
	},
};
