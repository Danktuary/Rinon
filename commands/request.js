const request = {
	name: 'request',
	description: 'Make a request for a new emoji to be added!',
	execute(message, args) {
		// make this better later
		const urlRegex = /(https?:\/\/)?(www.)?[^\s<>#%{}|\^~\[\]]+\.(png|jpg|jpeg|webp)$/;

		if (!/^\w+$/.test(args[0])) {
			return message.reply('only alphanumeric characters are allowed!');
		} else if (!urlRegex.test(args[1])) {
			return message.reply('invalid image URL.');
		}

		// poll.create(message, args);
	},
};

module.exports = request;
