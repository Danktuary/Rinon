const { inspect } = require('util');

const evalCommand = {
	name: 'eval',
	description: 'Evaluate JavaScript.',
	ownerOnly: true,
	async execute(message, args) {
		const { client } = message;
		const bot = client; // eslint-disable-line no-unused-vars
		const msg = message; // eslint-disable-line no-unused-vars

		try {
			const tokenRegex = new RegExp(client.token);
			let evalResult = eval(args.join(' '));

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
	},
};

module.exports = evalCommand;
