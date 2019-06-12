const { Collection } = require('discord.js');

const baseEmojiURL = 'https://cdn.discordapp.com/emojis';
const wordsOnlyRegex = /^\w+$/;
const emojiRegex = /<(a)?:(\w+):(\d+)>/;
const urlRegex = /(https?:\/\/)?(www.)?[^\s<>#%{}|\\^~\\[\]]+\.(png|jpe?g|webp|gif)(\?v=\d*)?$/;

function fromEmoji(emoji) {
	const [, animated, name, emojiID] = emoji.match(emojiRegex);

	return { name, url: `${baseEmojiURL}/${emojiID}.${animated ? 'gif' : 'png'}` };
}

function fromNameAndEmoji(name, emoji) {
	const [, animated, , emojiID] = emoji.match(emojiRegex);

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

module.exports = function transform({ name, url }, attachments = new Collection()) {
	if (emojiRegex.test(name)) return fromEmoji(name);

	if (/^:\w+:$/.test(name)) name = name.replace(/:/g, '');

	if (!wordsOnlyRegex.test(name)) {
		throw new RangeError('Only alphanumeric characters are allowed!');
	} else if (emojiRegex.test(url)) {
		return fromNameAndEmoji(name, url);
	} else if (!url && attachments.size) {
		return fromNameAndAttachment(name, attachments.first());
	} else if (!urlRegex.test(url)) {
		throw new Error('That doesn\'t seem like a valid image URL.');
	}

	return { name, url };
};
