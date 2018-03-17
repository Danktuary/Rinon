const Canvas = require('canvas');

const Poll = require('../controllers/PollController');
const RequestValidator = require('../controllers/RequestValidatorController');

const reverseRequest = {
	name: 'reverse-request',
	// left here as per Lewd's request
	description: 'Canvas thingamashit.',
	usage: '<name or emoji> [url, emoji, or file]',
	aliases: [
		'add-reverse', 'addreverse',
		'vote-request', 'voterequest',
		'poll-reverse', 'pollreverse',
		'reverse',
	],
	requiresInit: true,
	async execute(message, args) {
		let imageData;

		try {
			[message, args, imageData] = await RequestValidator.validate(message, args);
		}
		catch (error) {
			return message.channel.send(error.message || error);
		}

		const [name, url] = args;

		if (!/\.png(\?v=\d*)?$/.test(url)) {
			return message.reply('sorry, but I can only reverse PNG images!');
		}

		const canvas = new Canvas.createCanvas(128, 128);
		const ctx = canvas.getContext('2d');

		const image = new Canvas.Image();
		image.src = imageData.body;

		canvas.width = image.width;
		canvas.height = image.height;

		ctx.translate(canvas.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(image, 0, 0);

		return Poll.create(message, [name, canvas.toBuffer()]);
	},
};

module.exports = reverseRequest;
