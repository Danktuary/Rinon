const baseEmojiURL = 'https://cdn.discordapp.com/emojis';

const wordsOnlyRegex = /^\w+$/;
const emojiRegex = /<(a)?:(\w+):(\d+)>/;
const urlRegex = /(https?:\/\/)?(www.)?[^\s<>#%{}|\^~\[\]]+\.(png|jpg|jpeg|webp|gif)(\?v=\d*)?$/;

/**
 * @todo Update these docblocks
 */
class RequestParserController {

	/**
	 * @todo Update these docblocks
	 */
	static parse(message, args) {
		if (emojiRegex.test(args[0])) {
			const [, animated, emojiName, emojiID] = args[0].match(emojiRegex);

			return [emojiName, `${baseEmojiURL}/${emojiID}.${animated ? 'gif' : 'png'}`];
		}
		else if (!wordsOnlyRegex.test(args[0])) {
			throw new Error('only alphanumeric characters are allowed!');
		}

		if (emojiRegex.test(args[1])) {
			const [, animated, , emojiID] = args[1].match(emojiRegex);

			return [args[0], `${baseEmojiURL}/${emojiID}.${animated ? 'gif' : 'png'}`];
		}
		else if (!args[1] && message.attachments.size) {
			const attachment = message.attachments.first();

			if (attachment.size > (256 * 1000)) {
				throw new Error('that file surpasses the 256kb file size limit! Please resize it and try again.');
			}
			else if (!attachment.width || !attachment.height) {
				throw new Error('that doesn\'t seem like a valid image file.');
			}

			args[1] = attachment.url;
		}
		else if (!urlRegex.test(args[1])) {
			throw new Error('that doesn\'t seem like a valid image URL.');
		}

		return args;
	}

}

module.exports = RequestParserController;
