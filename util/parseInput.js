const { Collection } = require('discord.js')
const regexes = require('./regexes.js')

function fromEmoji(emoji) {
	const [, animated, name, emojiID] = emoji.match(regexes.emoji)
	return { name, url: `https://cdn.discordapp.com/emojis/${emojiID}.${animated ? 'gif' : 'png'}` }
}

function fromEmojiAndName(emoji, name) {
	return Object.assign(fromEmoji(emoji), { name })
}

function fromNameAndEmoji(name, emoji) {
	return Object.assign(fromEmoji(emoji), { name })
}

function fromUrlAndName(url, name) {
	if (!regexes.wordsOnly.test(name)) {
		throw new RangeError('Only alphanumeric characters are allowed!')
	}

	return { name, url }
}

function fromNameAndAttachment(name, attachment) {
	if (!attachment.width || !attachment.height) {
		throw new Error('That doesn\'t seem like a valid image file.')
	} else if (attachment.size > (256 * 1000)) {
		throw new Error('That file surpasses the 256kb file size limit! Please resize it and try again.')
	}

	return { name, url: attachment.url }
}

function fromAny({ first, last, attachments = new Collection() }) {
	if (regexes.emoji.test(first) && !last) {
		return fromEmoji(first)
	} else if (regexes.emoji.test(first) && regexes.wordsOnly.test(last)) {
		return fromEmojiAndName(first, last)
	} else if (regexes.url.test(first) && regexes.wordsOnly.test(last)) {
		return fromUrlAndName(first, last)
	} else if (regexes.embedlessUrl.test(first) && regexes.wordsOnly.test(last)) {
		return fromUrlAndName(first.slice(1, -1), last)
	} else if (!regexes.wordsOnly.test(first)) {
		throw new RangeError('Only alphanumeric characters are allowed!')
	} else if (regexes.emoji.test(last)) {
		return fromNameAndEmoji(first, last)
	} else if (!last && attachments.size) {
		return fromNameAndAttachment(first, attachments.first())
	} else if (regexes.embedlessUrl.test(last)) {
		last = last.slice(1, -1)
	} else if (!regexes.url.test(last)) {
		throw new Error('That doesn\'t seem like a valid image URL.')
	}

	return { name: first, url: last }
}

module.exports.fromAny = fromAny
module.exports.fromEmoji = fromEmoji
module.exports.fromEmojiAndName = fromEmoji
module.exports.fromNameAndEmoji = fromNameAndEmoji
module.exports.fromNameAndAttachment = fromNameAndAttachment
module.exports.fromUrlAndName = fromUrlAndName
