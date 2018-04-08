const { Collection } = require('discord.js');

const baseEmojiURL = 'https://cdn.discordapp.com/emojis';

const wordsOnlyRegex = /^\w+$/;
const emojiRegex = /<(a)?:(\w+):(\d+)>/;
const urlRegex = /(https?:\/\/)?(www.)?[^\s<>#%{}|\\^~\\[\]]+\.(png|jpe?g|webp|gif)(\?v=\d*)?$/;

/**
 * @todo Update these docblocks
 */
class RequestTransformerController {

	/**
	 * @todo Update these docblocks
	 */
	static transform(args, attachments = new Collection) {
		if (emojiRegex.test(args[0])) {
			return this.fromEmoji(args[0]);
		}

		if (/^:\w+:$/.test(args[0])) {
			args[0] = args[0].replace(/:/g, '');
		}

		if (!wordsOnlyRegex.test(args[0])) {
			throw new RangeError('Only alphanumeric characters are allowed!');
		}
		else if (emojiRegex.test(args[1])) {
			return this.fromNameAndEmoji(...args);
		}
		else if (!args[1] && attachments.size) {
			return this.fromNameAndAttachment(args[0], attachments.first());
		}
		else if (!urlRegex.test(args[1])) {
			throw new Error('That doesn\'t seem like a valid image URL.');
		}

		return args;
	}

	/**
	 * @todo Update these docblocks
	 */
	static fromEmoji(emoji) {
		const [, animated, emojiName, emojiID] = emoji.match(emojiRegex);

		return [emojiName, `${baseEmojiURL}/${emojiID}.${animated ? 'gif' : 'png'}`];
	}

	/**
	 * @todo Update these docblocks
	 */
	static fromNameAndEmoji(name, emoji) {
		const [, animated, , emojiID] = emoji.match(emojiRegex);

		return [name, `${baseEmojiURL}/${emojiID}.${animated ? 'gif' : 'png'}`];
	}

	/**
	 * @todo Update these docblocks
	 */
	static fromNameAndAttachment(name, attachment) {
		if (!attachment.width || !attachment.height) {
			throw new Error('That doesn\'t seem like a valid image file.');
		}
		else if (attachment.size > (256 * 1000)) {
			throw new Error('That file surpasses the 256kb file size limit! Please resize it and try again.');
		}

		return [name, attachment.url];
	}

}

module.exports = RequestTransformerController;
