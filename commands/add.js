const { Command } = require('discord-akairo');
const Canvas = require('canvas');
const snekfetch = require('snekfetch');
const parseInput = require('../util/parseInput.js');
const validators = require('../util/validators.js');

module.exports = class AddCommand extends Command {
	constructor() {
		super('add', {
			aliases: ['add', 'request', 'vote', 'poll', 'reverse'],
			channel: 'guild',
			args: [
				{ id: 'name' },
				{ id: 'url' },
				{
					id: 'reverse',
					match: 'flag',
					prefix: ['--reverse', '-r'],
				},
			],
		});
	}

	async exec(message, args) {
		const { hubServer } = this.client;
		let { name, url, imageData } = await this.validate(message, args);

		if (message.util.alias === 'reverse' || args.reverse) {
			if (!name.toLowerCase().endsWith('reverse')) {
				name = await this.modifyEmojiName(message, name);
			}

			url = this.reverseImage(imageData, url);
		}

		await hubServer.polls.emoji.create({ message, name, url });

		const response = [`Done! Others can now vote on your request in ${hubServer.emojiVoting}.`];

		if (message.guild.id !== hubServer.id) {
			response[0] = `${response[0].slice(0, -1)} in **${hubServer.guild.name}**.`;
			response.push(`If you can\'t open the channel link, send \`${this.handler.prefix()}server 1\` for an invite.`);
		}

		return message.util.send(response.join('\n'));
	}

	async validate(message, { name, url }) {
		if (!name && !url) {
			throw new Error([
				'You need to provide: an emoji, a name and an emoji, a name and an image URL, an image URL and a name, or a name and an image file!',
				`For example: \`${this.handler.prefix()}add AiSmug https://i.imgur.com/8jGJzmd.png\`.`,
			].join('\n'));
		}

		const { name: emojiName, url: imageURL } = parseInput({ name, url }, message.attachments);

		if (emojiName.length < 2 || emojiName.length > 32) {
			throw new RangeError('An emoji name needs to be between 2 and 32 characters long.');
		}

		const imageData = await snekfetch.get(imageURL);

		if (!imageData.ok) {
			throw new Error('That image link doesn\'t seem to be working.');
		} else if (imageData.headers['content-length'] > (256 * 1024)) {
			throw new RangeError('That file surpasses the 256kb file size limit! Please resize it and try again.');
		}

		if (validators.regexes.blobInit.test(emojiName) && !validators.regexes.blob.test(emojiName)) {
			validators.blobs(emojiName, imageURL, imageData);
		}

		await validators.duplicates(message, emojiName);

		return { name: emojiName, url: imageURL, imageData };
	}

	reverseImage(imageData, url) {
		if (!/\.png(\?v=\d*)?$/.test(url)) {
			throw new RangeError('I can only reverse PNG images!');
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

		return canvas.toBuffer();
	}

	async modifyEmojiName(message, name) {
		await message.channel.send([
			'Your emoji name doesn\'t end with "reverse". Do you want me to modify it for you?',
			'1) Yes, with "reverse" - 2) Yes, with "Reverse" - 3) No',
		].join('\n'));

		const options = { max: 1, time: 20000, errors: ['time'] };
		const filter = m => ['yes', 'y', 'no', 'n', '1', '2', '3'].includes(m.content.toLowerCase());

		try {
			const responses = await message.channel.awaitMessages(filter, options);
			const response = responses.first().content.toLowerCase();

			if (response && ['yes', 'y', '1', '2'].includes(response)) {
				return response !== '2' ? `${name}reverse` : `${name}Reverse`;
			}
		} catch (error) {
			await message.channel.send('You didn\'t reply in time, leaving emoji name as is.');
		}

		return name;
	}
};
