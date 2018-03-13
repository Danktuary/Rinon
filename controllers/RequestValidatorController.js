const Canvas = require('canvas');
const snekfetch = require('snekfetch');
const path = require('path');

const GuildManager = require('../controllers/GuildManagerController');
const RequestTransformer = require('../controllers/RequestTransformerController');

const { prefix } = require('../config');

const blobRegex = /^blob[a-z]+$/;

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

		const [emojiName, imageLink] = RequestTransformer.transform(message, args);
		GuildManager.checkEmojiAmount(message.guild, imageLink);

		const imageData = await snekfetch.get(imageLink).catch(error => error);

		if (!imageData.ok) {
			throw new Error('That image link doesn\'t seem to be working.');
		}
		else if (imageData.headers['content-length'] > (256 * 1000)) {
			throw new Error('That file surpasses the 256kb file size limit! Please resize it and try again.');
		}

		if (/^a?blob/.test(emojiName) && !blobRegex.test(emojiName)) {
			if (imageLink.endsWith('.gif')) {
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

	/**
	 * @todo Update these docblocks
	 * @todo Remove the 2nd parameter since it's unused
	 */
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
