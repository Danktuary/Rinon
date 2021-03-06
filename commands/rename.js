const { MessageEmbed } = require('discord.js')
const { Command } = require('discord-akairo')
const parseInput = require('../util/parseInput.js')
const textUtil = require('../util/text.js')
const emojiUtil = require('../util/emoji.js')
const regexes = require('../util/regexes.js')

module.exports = class RenameCommand extends Command {
	constructor() {
		super('rename', {
			aliases: ['rename', 'rename-poll', 'rename-emoji'],
			description: 'Rename an existing emoji or poll.',
			channel: 'guild',
			args: [
				{ id: 'oldName' },
				{ id: 'newName' },
				{
					id: 'mode',
					match: 'option',
					flag: ['--mode=', '-m='],
					'default': 'emoji',
				},
				{
					id: 'reason',
					match: 'rest',
				},
			],
		})
	}

	async exec(message, { oldName, newName, mode, reason }) {
		if (message.util.parsed.alias === 'rename-poll') mode = 'poll'
		else if (message.util.parsed.alias === 'rename-emoji') mode = 'emoji'
		else if (!['emoji', 'poll'].includes(mode)) mode = 'emoji'

		if (mode === 'emoji' && regexes.emoji.test(oldName)) {
			oldName = parseInput.fromEmoji(oldName).name
		} else if (mode === 'emoji' && regexes.emoji.test(newName)) {
			const emojiName = parseInput.fromEmoji(newName).name
			newName = oldName
			oldName = emojiName
		}

		if (oldName.length < 2 || newName.length < 2 || oldName.length > 32 || newName.length > 32) {
			return message.util.send('An emoji name needs to be between 2 and 32 characters long.')
		}

		return this[`rename${textUtil.capitalize(mode)}`]({ message, oldName, newName, reason })
	}

	async renamePoll({ message, oldName, newName }) {
		let searchResult
		const poll = this.client.hubServer.polls.emoji

		try {
			searchResult = await poll.search(oldName)
		} catch (error) {
			return message.util.send([
				'I couldn\'t find any requests that match your search term!',
				`If you want to rename an existing emoji, use the \`${this.handler.prefix}rename-emoji <emoji name> <new name>\` command.`,
			].join('\n'))
		}

		const { pollData, message: pollMessage } = searchResult

		if (message.author.id !== pollData.authorID) {
			throw new Error('You can\'t edit a poll that\'s not yours!')
		} else if (pollData.emojiName === newName) {
			throw new Error('The new emoji name can\'t be the same as the old one!')
		}

		pollData.emojiName = newName

		const embed = new MessageEmbed(pollMessage.embeds[0])
		const guild = emojiUtil.nextAvailableGuild({ guilds: this.client.guilds.cache, imageURL: pollData.imageURL })
		const previewEmoji = await guild.emojis.create(pollData.imageURL, newName)

		embed.fields = []
		embed
			.setDescription(`\`${message.author.tag}\` wants to add an emoji with the name as \`${newName}\`.`)
			.addField('Preview', previewEmoji.toString())

		await pollData.save()
		await pollMessage.edit(embed)
		await previewEmoji.delete()
		return message.channel.send('Done renaming your poll!')
	}

	async renameEmoji({ message, oldName, newName, reason }) {
		let selectedEmoji = null
		const { hubServer } = this.client
		const emojis = emojiUtil.search(this.client.emojis.cache, emojiUtil.parseSearchQuery(oldName))

		if (!emojis.size) {
			return message.util.send([
				'I couldn\'t find any emojis that match your search term!',
				`If you want to rename a current poll, use the \`${this.handler.prefix}rename-poll <old name> <new name>\` command.`,
			].join('\n'))
		} else if (emojis.size === 1) {
			selectedEmoji = emojis.first()
		} else {
			const sent = await message.channel.send([
				`I found these emojis with that same name: ${emojis.map(emoji => emoji.toString()).join(' ')}`,
				'React with the corresponding emoji you want to rename.',
			].join('\n'))

			await Promise.all(emojis.map(emoji => sent.react(emoji)))

			const options = { max: 1, time: 20000, errors: ['time'] }
			const filter = (reaction, user) => emojis.has(reaction.emoji.id) && user.id === message.author.id

			try {
				const reactions = await sent.awaitReactions(filter, options)
				await sent.reactions.removeAll()
				selectedEmoji = reactions.first().emoji
			} catch (error) {
				await sent.reactions.removeAll()
				return message.channel.send('You didn\'t react in time; cancelling the request.')
			}
		}

		if (selectedEmoji.name === newName) {
			throw new Error('The new emoji name can\'t be the same as the old one!')
		}

		await hubServer.polls.rename.create({ message, emoji: selectedEmoji, newName, reason })

		const response = [`Done! Others can now vote on your request in ${hubServer.votingChannel}.`]

		if (message.guild.id !== hubServer.guild.id) {
			response[0] = `${response[0].slice(0, -1)} in **${hubServer.guild.name}**.`
			response.push(`If you can\'t open the channel link, send \`${this.handler.prefix}server 1\` for an invite.`)
		}

		return message.channel.send(response.join('\n'))
	}
}
