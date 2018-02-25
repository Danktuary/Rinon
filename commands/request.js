const Poll = require('../controllers/PollController');
const RequestValidator = require('../controllers/RequestValidatorController');

const request = {
	name: 'request',
	description: 'Make a request for a new emoji to be added!',
	aliases: ['add', 'vote', 'poll'],
	usage: '<name or emoji> [url, emoji, or file]',
	requiresInit: true,
	async execute(message, args) {
		try {
			[message, args] = await RequestValidator.validate(message, args);
		}
		catch (error) {
			return message.channel.send(error.message || error);
		}

		return Poll.create(message, args);
	},
};

module.exports = request;
