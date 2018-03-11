const Poll = require('../controllers/PollController');
const RequestSearch = require('../controllers/RequestSearchController');

const forceDeny = {
	name: 'force-deny',
	description: 'Deny an emoji request, regardless of how many votes it has.',
	aliases: ['forcedeny'],
	usage: '<emoji name> or <message ID>',
	ownerOnly: true,
	async execute(message, args) {
		let response;

		try {
			response = await RequestSearch.search(message.guild, args.join(' '));
		}
		catch (error) {
			return message.reply(error.message);
		}

		await Poll.deny(response);

		return message.channel.send('Done!');
	},
};

module.exports = forceDeny;
