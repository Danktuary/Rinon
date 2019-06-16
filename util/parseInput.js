const { Collection } = require('discord.js');
const regexes = require('./regexes.js');

const baseEmojiURL = 'https://cdn.discordapp.com/emojis';

function fromEmoji(emoji) {
	const [, animated, name, emojiID] = emoji.match(regexes.emoji);
	return { name, url: `${baseEmojiURL}/${emojiID}.${animated ? 'gif' : 'png'}` };
}

function fromNameAndEmoji(name, emoji) {
	const [, animated, , emojiID] = emoji.match(regexes.emoji);
	return { name, url: `${baseEmojiURL}/${emojiID}.${animated ? 'gif' : 'png'}` };
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
	if (regexes.emoji.test(name)) return fromEmoji(name);

	if (/^:\w+:$/.test(name)) name = name.replace(/:/g, '');

	if (!regexes.wordsOnly.test(name)) {
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
module.exports.fromNameAndEmoji = fromNameAndEmoji;
module.exports.fromNameAndAttachment = fromNameAndAttachment;
