const { prefix } = require('../config.js');

function getAmounts(emojis) {
	const [normal, animated] = emojis.partition(emoji => !emoji.animated);
	return { normal: normal.size, animated: animated.size };
}

function checkAmounts(emojis, emojiURL) {
	const { normal, animated } = getAmounts(emojis);

	const maxEmojisReply = [
		'It seems like I can\'t add any more emojis to this server.',
		`Want to check the other servers I'm in? Use the \`${prefix}server\` command!`,
	].join('\n');

	if (normal + animated === 100) {
		throw new Error(maxEmojisReply);
	} else if (emojiURL.endsWith('.gif') && animated === 50) {
		throw new Error(maxEmojisReply.replace('emojis', 'animated emojis'));
	} else if (emojiURL.endsWith('.png') && normal === 50) {
		throw new Error(maxEmojisReply.replace('emojis', 'static emojis'));
	}
}

module.exports.getAmounts = getAmounts;
module.exports.checkAmounts = checkAmounts;
