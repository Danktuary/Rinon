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
			const regex = new RegExp(client.token);
			let evaled = eval(args.join(' '));

			if (typeof evaled !== 'string') {
				evaled = inspect(evaled, false, 0);
			}

			if (regex.test(evaled)) {
				evaled = evaled.replace(client.token, '[TOKEN]');
			}

			return message.channel.send(evaled, { code: 'js' });
		} catch (error) {
			console.error(inspect(error));
			return message.channel.send(error, { code: 'js' });
		}
	},
};

module.exports = evalCommand;
