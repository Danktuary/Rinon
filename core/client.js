const { AkairoClient } = require('discord-akairo');
const database = require('../database/index.js');

module.exports = class RinonClient extends AkairoClient {
	constructor() {
		super({
			ownerID: '126485019500871680',
		});
	}

	async login(token) {
		await database.init();
		return super.login(token);
	}
};
