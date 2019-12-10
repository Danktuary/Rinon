const { Collection } = require('discord.js');
const regexes = require('./regexes.js');

function fromEmoji(emoji) {
	const [, animated, name, emojiID] = emoji.match(regexes.emoji);
	return { name, url: `https://cdn.discordapp.com/emojis'/${emojiID}.${animated ? 'gif' : 'png'}` };
}

function fromEmojiAndName(emoji, name) {
	return Object.assign(fromEmoji(emoji), { name });
}

function fromNameAndEmoji(name, emoji) {
	return Object.assign(fromEmoji(emoji), { name });
}

function fromUrlAndName(url, name) {
	if (!regexes.wordsOnly.test(name)) {
		throw new RangeError('Only alphanumeric characters are allowed!');
	}

	return { name, url };
}

function fromNameAndAttachment(name, attachment) {
	if (!attachment.width || !attachment.height) {
		throw new Error('That doesn\'t seem like a valid image file.');
	} else if (attachment.size > (256 * 1000)) {
		throw new Error('That file surpasses the 256kb file size limit! Please resize it and try again.');
	}

	return { name, url: attachment.url };
}

module.exports = function parseInput({ name, url }, attachments = new Collection()) {
	if (regexes.emoji.test(name) && !url) {
		return fromEmoji(name);
	} else if (regexes.emoji.test(name) && regexes.wordsOnly.test(url)) {
		return fromEmojiAndName(name, url);
	} else if (regexes.url.test(name) && regexes.wordsOnly.test(url)) {
		return fromUrlAndName(name, url);
	} else if (!regexes.wordsOnly.test(name)) {
		throw new RangeError('Only alphanumeric characters are allowed!');
	} else if (regexes.emoji.test(url)) {
		return fromNameAndEmoji(name, url);
	} else if (!url && attachments.size) {
		return fromNameAndAttachment(name, attachments.first());
	} else if (!regexes.url.test(url)) {
		throw new Error('That doesn\'t seem like a valid image URL.');
	}

	return { name, url };
};

module.exports.fromEmoji = fromEmoji;
module.exports.fromEmojiAndName = fromEmoji;
module.exports.fromNameAndEmoji = fromNameAndEmoji;
module.exports.fromNameAndAttachment = fromNameAndAttachment;
module.exports.fromUrlAndName = fromUrlAndName;
