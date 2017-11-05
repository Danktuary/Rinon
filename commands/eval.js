const { inspect } = require('util');

const evalCommand = {
	name: 'eval',
	description: 'Evaluate JavaScript.',
	ownerOnly: true,
	execute(message, args) {
		const { client } = message;
		const bot = client;
		const msg = message;

		try {
			const regex = new RegExp(message.client.token);
			let evaled = eval(args.join(' '));

			if (typeof evaled !== 'string') {
				evaled = inspect(evaled, false, 0);
			}

			if (regex.test(evaled)) {
				evaled = evaled.replace(message.client.token, '[TOKEN]');
			}

			return message.channel.send(evaled, { code: 'js' });
		} catch (error) {
			console.error(inspect(error));
			return message.channel.send(error, { code: 'js' });
		}
	},
};

module.exports = evalCommand;
