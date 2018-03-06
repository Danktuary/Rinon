const reload = {
	name: 'reload',
	description: 'Reload a file from Node\'s `require()` cache.',
	aliases: ['r', 're'],
	ownerOnly: true,
	async execute(message, args) {
		if (!args.length) {
			return message.reply('you need to provide a file to reload.');
		}

		const [file] = args;

		if (['canvas', 'c'].includes(file)) {
			delete require.cache[require.resolve('./request.js')];
			delete require.cache[require.resolve('../controllers/RequestValidatorController.js')];
			message.client.commands.delete('request');

			const requestFile = require('./request.js');
			message.client.commands.set(requestFile.name, requestFile);

			return message.channel.send('Done!');
		}

		delete require.cache[require.resolve(`./${file}.js`)];
		return message.channel.send('Done!');
	},
};

module.exports = reload;
