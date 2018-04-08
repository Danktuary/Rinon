const Canvas = require('canvas');
const snekfetch = require('snekfetch');
const path = require('path');

const GuildManager = require('../controllers/GuildManagerController');
const RequestTransformer = require('../controllers/RequestTransformerController');

const { prefix } = require('../config');

const blobInitRegex = /^a?b(lo|ol)b/;
const blobRegex = /^a?b(lo|ol)b[a-z]+$/;
const gifRegex = /\.gif(\?v=\d+)?$/;

/**
 * @todo Update these docblocks
 */
class RequestValidatorController {

	/**
	 * @todo Update these docblocks
	 */
	static async validate(message, args) {
		if (!args.length) {
			throw new Error([
				'You need to provide an emoji, a name and an emoji, a name and an image URL, or a name and an image file!',
				`For example: \`${prefix}request AiSmug https://i.imgur.com/8jGJzmd.png\`.`,
			].join('\n'));
		}

		const [emojiName, imageLink] = RequestTransformer.transform(args, message.attachments);
		GuildManager.checkEmojiAmount(message.guild, imageLink);

		if (emojiName.length < 2 || emojiName.length > 32) {
			throw new RangeError('An emoji name needs to be between 2 and 32 characters long.');
		}

		const imageData = await snekfetch.get(imageLink).catch(error => error);

		if (!imageData.ok) {
			throw new Error('That image link doesn\'t seem to be working.');
		}
		else if (imageData.headers['content-length'] > (256 * 1024)) {
			throw new RangeError('That file surpasses the 256kb file size limit! Please resize it and try again.');
		}

		if (blobInitRegex.test(emojiName) && !blobRegex.test(emojiName)) {
			if (gifRegex.test(imageLink)) {
				const imgsPath = [__dirname, '..', 'assets', 'imgs'];

				throw {
					files: [
						{ attachment: path.join(...imgsPath, 'allmightblobblock-default.png') },
					],
				};
			}

			RequestValidatorController._allMightBlobBlock(emojiName, imageLink, imageData);
		}

		const duplicatedEmojis = message.client.emojis.filter(emoji => {
			return emojiName.toLowerCase() === emoji.name.toLowerCase();
		});

		if (duplicatedEmojis.size) {
			await message.reply([
				'I found these emojis with that same name: ',
				duplicatedEmojis.map(emoji => emoji.toString()).join(' '),
				'\nWould you like to continue with your request anyway?',
			].join(''));

			let response;
			const options = { max: 1, time: 20000, errors: ['time'] };
			const filter = m => ['yes', 'y', 'no', 'n'].includes(m.content.toLowerCase());

			try {
				const responses = await message.channel.awaitMessages(filter, options);
				response = responses.first().content.toLowerCase();
			}
			catch (error) {
				await message.reply('you didn\'t reply in time; I\'ll continue on with your original request.');
			}

			if (response && ['no', 'n'].includes(response)) {
				throw new Error('Got it; I\'ve cancelled your request.');
			}
		}

		return [message, [emojiName, imageLink], imageData];
	}

	static _allMightBlobBlock(name, imageLink, imageData) {
		const canvas = new Canvas.createCanvas(390, 309);
		const ctx = canvas.getContext('2d');

		const assetsPath = [__dirname, '..', 'assets'];
		const openSans = path.join(...assetsPath, 'fonts', 'OpenSans-Regular.ttf');
		const roboto = path.join(...assetsPath, 'fonts', 'Roboto-Regular.ttf');

		Canvas.registerFont(openSans, { family: 'OpenSans' });
		Canvas.registerFont(roboto, { family: 'Roboto' });

		const background = new Canvas.Image();
		background.src = path.join(...assetsPath, 'imgs', 'allmightblobblock.png');

		ctx.drawImage(background, 0, 0);

		const blobImage = new Canvas.Image();
		blobImage.src = imageData.body;

		const sizes = {
			width: ((blobImage.width > 128) ? 128 : blobImage.width) / 2.5,
			height: ((blobImage.height > 128) ? 128 : blobImage.height) / 2.5,
		};

		const positions = { x: 50, y: 50 };

		const centerText = (text, xAxis, width) => {
			const dimensions = ctx.measureText(text);
			return xAxis - ((xAxis + dimensions.width) - (xAxis + width)) / 2;
		};

		ctx.drawImage(blobImage, positions.x, positions.y, sizes.width, sizes.height);

		ctx.fillStyle = '#eee';
		ctx.textStyle = 'center';
		ctx.font = '16px Roboto';

		ctx.fillText(
			name.toLowerCase(),
			centerText(name.toLowerCase(), positions.x, sizes.width),
			positions.y + 70
		);

		positions.y = 205;

		ctx.drawImage(blobImage, positions.x, positions.y, sizes.width, sizes.height);

		ctx.fillText(
			name,
			centerText(name, positions.x, sizes.width),
			positions.y + 70
		);

		throw {
			files: [
				{ attachment: canvas.toBuffer() },
			],
		};
	}

}

module.exports = RequestValidatorController;
