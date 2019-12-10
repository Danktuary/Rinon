const parseInput = require('../util/parseInput.js');
const regexes = require('../util/regexes.js');

const boostedEmojisLimits = { 0: 50, 1: 100, 2: 150, 3: 250 };

function nextAvailableGuild({ guilds, imageURL }) {
	return guilds.find(guild => {
		const [normal, animated] = guild.emojis.partition(emoji => !emoji.animated);
		const boostAmount = boostedEmojisLimits[guild.premiumTier];
		return regexes.gif.test(imageURL) ? animated.size < boostAmount : normal.size < boostAmount;
	});
}

function search(emojis, searchTerm) {
	return emojis.filter(emoji => emoji.name.toLowerCase().includes(searchTerm.toLowerCase()));
}

function parseSearchQuery(name) {
	if (regexes.emoji.test(name)) return parseInput.fromEmoji(name).name;
	if (/^:\w+:$/.test(name)) name = name.replace(/:/g, '');
	if (!regexes.wordsOnly.test(name)) throw new Error('only alphanumeric characters are allowed!');
	return name;
}

module.exports.search = search;
module.exports.parseSearchQuery = parseSearchQuery;
module.exports.boostedEmojisLimits = boostedEmojisLimits;
module.exports.nextAvailableGuild = nextAvailableGuild;
