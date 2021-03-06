const { Command } = require('discord-akairo')
const Canvas = require('canvas')
const fetch = require('node-fetch')
const parseInput = require('../util/parseInput.js')
const validators = require('../util/validators.js')
const regexes = require('../util/regexes.js')

module.exports = class AddCommand extends Command {
	constructor() {
		super('add', {
			aliases: ['add', 'request', 'vote', 'poll', 'reverse'],
			description: 'Create a poll to add a new emoji to one of the emoji servers.',
			channel: 'guild',
			args: [
				{ id: 'name' },
				{ id: 'url' },
				{
					id: 'reverse',
					match: 'flag',
					flag: ['--reverse', '-r'],
				},
			],
		})
	}

	async exec(message, args) {
		let validatedArgs
		const { hubServer } = this.client

		try {
			validatedArgs = await this.validate(message, args)
		} catch (error) {
			return message.channel.send(error.message || error)
		}

		let { name, url, imageData } = validatedArgs

		if (message.util.parsed.alias === 'reverse' || args.reverse) {
			if (!name.toLowerCase().endsWith('reverse')) {
				name = await this.modifyEmojiName(message, name)
			}

			url = this.reverseImage(await imageData.buffer(), url)
		}

		try {
			await hubServer.polls.emoji.create({ message, name, url })
		} catch (error) {
			const owner = await this.client.users.fetch(this.client.ownerID)
			const anger = ['tch', 'meguAngry', 'angry', 'nyanrage', 'WeebRage']
			const angryEmoji = this.client.emojis.cache.filter(emoji => anger.includes(emoji.name)).random()
			return message.channel.send(`<@${owner.id}>: ${error.message} ${angryEmoji}`)
		}

		const response = [`Done! Others can now vote on your request in ${hubServer.votingChannel}.`]

		if (message.guild.id !== hubServer.guild.id) {
			response[0] = `${response[0].slice(0, -1)} in **${hubServer.guild.name}**.`
			response.push(`If you can\'t open the channel link, send \`${this.handler.prefix}server 1\` for an invite.`)
		}

		return message.channel.send(response.join('\n'))
	}

	async validate(message, { name, url }) {
		if (!name && !url) {
			throw new Error([
				'You need to provide: an emoji, a name and an emoji, a name and an image URL, or a name and an image file!',
				`For example: \`${this.handler.prefix}add AiSmug https://i.imgur.com/8jGJzmd.png\`.`,
			].join('\n'))
		}

		const { name: emojiName, url: imageURL } = parseInput.fromAny({ first: name, last: url, attachments: message.attachments })

		if (emojiName.length < 2 || emojiName.length > 32) {
			throw new RangeError('An emoji name needs to be between 2 and 32 characters long.')
		}

		const imageData = await fetch(imageURL)

		if (!imageData.ok) {
			throw new Error('That image link doesn\'t seem to be working.')
		} else if (imageData.headers.get('content-length') > (256 * 1024)) {
			throw new RangeError('That file surpasses the 256kb file size limit! Please resize it and try again.')
		}

		if (regexes.blobInit.test(emojiName) && !regexes.blob.test(emojiName)) {
			validators.blobs(emojiName, imageURL, await imageData.buffer())
		}

		await validators.duplicates(message, emojiName)

		return { name: emojiName, url: imageURL, imageData }
	}

	reverseImage(imageData, url) {
		if (!regexes.png.test(url)) {
			throw new RangeError('I can only reverse PNG images!')
		}

		const canvas = new Canvas.createCanvas(128, 128)
		const ctx = canvas.getContext('2d')

		const image = new Canvas.Image()
		image.src = imageData

		canvas.width = image.width
		canvas.height = image.height

		ctx.translate(canvas.width, 0)
		ctx.scale(-1, 1)
		ctx.drawImage(image, 0, 0)

		return canvas.toBuffer()
	}

	async modifyEmojiName(message, name) {
		await message.channel.send([
			'Your emoji name doesn\'t end with "reverse". Do you want me to modify it for you?',
			'1) Yes, with "reverse" - 2) Yes, with "Reverse" - 3) No',
		].join('\n'))

		const options = { max: 1, time: 20000, errors: ['time'] }
		const filter = m => {
			return ['yes', 'y', 'no', 'n', '1', '2', '3'].includes(m.content.toLowerCase()) && m.author.id === message.author.id
		}

		try {
			const responses = await message.channel.awaitMessages(filter, options)
			const response = responses.first().content.toLowerCase()

			if (response && ['yes', 'y', '1', '2'].includes(response)) {
				return response !== '2' ? `${name}reverse` : `${name}Reverse`
			}
		} catch (error) {
			await message.channel.send('You didn\'t reply in time, leaving emoji name as is.')
		}

		return name
	}
}
