const { Command } = require('discord-akairo');

module.exports = class AsyncEvalCommand extends Command {
	constructor() {
		super('async-eval', {
			aliases: ['async-eval', 'async'],
			ownerOnly: true,
			args: [
				{
					id: 'code',
					match: 'content',
				},
			],
		});
	}

	async exec(message, args) {
		const code = `(async () => { ${args.code} })()`;
		return this.client.commandHandler.findCommand('eval').exec(message, { code });
	}
};
