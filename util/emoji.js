const { prefix } = require('../config.js');
const parseInput = require('../util/parseInput.js');
const regexes = require('../util/regexes.js');

const boostedEmojisLimits = { 0: 50, 1: 100, 2: 150, 3: 250 };

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

function search(emojis, searchTerm) {
	const foundEmojis = emojis.filter(emoji => {
		return emoji.name.toLowerCase().includes(searchTerm.toLowerCase());
	});

	if (!foundEmojis.size) {
		throw new Error('I couldn\'t find any requests that match your search term!');
	}

	return foundEmojis;
}

function parseSearchQuery(name) {
	if (regexes.emoji.test(name)) {
		return parseInput.fromEmoji(name).name.toLowerCase();
	}

	if (/^:\w+:$/.test(name)) name = name.replace(/:/g, '');

	if (!regexes.wordsOnly.test(name)) {
		throw new Error('only alphanumeric characters are allowed!');
	}

	return name.toLowerCase();
}

module.exports.search = search;
module.exports.parseSearchQuery = parseSearchQuery;
module.exports.getAmounts = getAmounts;
module.exports.boostedEmojisLimits = boostedEmojisLimits;
