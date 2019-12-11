const path = require('path');
const Canvas = require('canvas');
const regexes = require('../util/regexes.js');

function blobs(emojiName, imageURL, imageData) {
	const assetsPath = [__dirname, '..', 'assets'];

	if (regexes.gif.test(imageURL)) {
		// TODO: Figure out a different way to approach this
		// eslint-disable-next-line no-throw-literal
		throw {
			files: [{ attachment: path.join(...assetsPath, 'imgs', 'allmightblobblock-default.png') }],
		};
	}

	Canvas.registerFont(path.join(...assetsPath, 'fonts', 'Roboto-Regular.ttf'), { family: 'Roboto' });

	const canvas = new Canvas.createCanvas(390, 309);
	const ctx = canvas.getContext('2d');

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
	ctx.fillText(emojiName.toLowerCase(), centerText(emojiName.toLowerCase(), positions.x, sizes.width), positions.y + 70);

	positions.y = 205;

	ctx.drawImage(blobImage, positions.x, positions.y, sizes.width, sizes.height);
	ctx.fillText(emojiName, centerText(emojiName, positions.x, sizes.width), positions.y + 70);

	// TODO: Figure out a different way to approach this
	// eslint-disable-next-line no-throw-literal
	throw { files: [{ attachment: canvas.toBuffer() }] };
}

async function duplicates(message, emojiName) {
	const duplicatedEmojis = message.client.emojis.filter(emoji => {
		return emojiName.toLowerCase() === emoji.name.toLowerCase();
	});

	if (!duplicatedEmojis.size) return;

	await message.reply([
		`I found these emojis with that same name: ${duplicatedEmojis.map(emoji => emoji.toString()).join(' ')}`,
		'Would you like to continue with your request anyway?',
	].join('\n'));

	let response;
	const options = { max: 1, time: 20000, errors: ['time'] };
	const filter = m => ['yes', 'y', 'no', 'n'].includes(m.content.toLowerCase()) && m.author.id === message.author.id;

	try {
		const responses = await message.channel.awaitMessages(filter, options);
		response = responses.first().content.toLowerCase();
	} catch (error) {
		await message.reply('you didn\'t reply in time; I\'ll continue on with your original request.');
	}

	if (response && ['no', 'n'].includes(response)) {
		throw new Error('Got it; I\'ve cancelled your request.');
	}
}

module.exports.blobs = blobs;
module.exports.duplicates = duplicates;
