const { inspect } = require('util');
const { Command } = require('discord-akairo');

module.exports = class EvalCommand extends Command {
	constructor() {
		super('eval', {
			aliases: ['eval'],
			ownerOnly: true,
			args: [
				{
					id: 'code',
					match: 'content',
				},
			],
		});
	}

	exec(message, { code }) {
		const { client } = message;

		try {
			console.log(code);
			let evalResult = eval(code);
			const tokenRegex = new RegExp(client.token);

			if (typeof evalResult !== 'string') {
				evalResult = inspect(evalResult, false, 0);
			}

			if (tokenRegex.test(evalResult)) {
				evalResult = evalResult.replace(client.token, '[TOKEN]');
			}

			return message.channel.send(evalResult, { code: 'js' });
		} catch (error) {
			console.error(inspect(error));
			return message.channel.send(error, { code: 'js' });
		}
	}
}
