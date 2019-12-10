const parseInput = require('../util/parseInput.js');
const regexes = require('../util/regexes.js');

const boostedEmojisLimits = { 0: 50, 1: 100, 2: 150, 3: 250 };

function getAmounts(emojis) {
	const [normal, animated] = emojis.partition(emoji => !emoji.animated);
	return { normal: normal.size, animated: animated.size };
}

function nextAvailableGuild({ guilds, imageURL }) {
	return guilds.find(guild => {
		const { normal, animated } = getAmounts(guild.emojis);
		const boostAmount = boostedEmojisLimits[guild.premiumTier];
		return regexes.gif.test(imageURL) ? animated < boostAmount : normal < boostAmount;
	});
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
	if (regexes.emoji.test(name)) return parseInput.fromEmoji(name).name;
	if (/^:\w+:$/.test(name)) name = name.replace(/:/g, '');
	if (!regexes.wordsOnly.test(name)) throw new Error('only alphanumeric characters are allowed!');
	return name;
}

module.exports.search = search;
module.exports.parseSearchQuery = parseSearchQuery;
module.exports.getAmounts = getAmounts;
module.exports.boostedEmojisLimits = boostedEmojisLimits;
module.exports.nextAvailableGuild = nextAvailableGuild;
