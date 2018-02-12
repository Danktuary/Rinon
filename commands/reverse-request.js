const fs = require('fs');
const Canvas = require('canvas');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

const Poll = require('../controllers/PollController');

const { colors, prefix } = require('../config');

const reverseRequest = {
	name: 'reverse-request',
	description: 'Canvas thingamashit.',
	aliases: [
		'add-reverse', 'addreverse',
		'vote-request', 'voterequest',
		'poll-reverse', 'pollreverse',
		'reverse',
	],
	async execute(message, args) {
		let imageData;

		try {
			const { commands } = message.client;
			[message, args, imageData] = await commands.get('request')._parse(message, args);
		}
		catch (error) {
			return message.channel.send(error.message);
		}

		const [name, url] = args;

		if (!/\.png(\?v=\d*)?$/.test(url)) {
			return message.reply('sorry, but I can only reverse PNG images!');
		}

		const canvas = new Canvas(128, 128);
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
