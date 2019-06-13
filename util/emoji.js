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

async function search(channel, searchTerm) {
	const messages = await channel.fetchMessages({ limit: 100 });

	let requestMessage = messages.find(message => {
		const [embed] = message.embeds;
		return embed && !embed.color && (new RegExp(`\`${searchTerm}\`\\.$`, 'i')).test(embed.description);
	});

	if (!requestMessage && /\d+/.test(searchTerm)) {
		requestMessage = await channel.fetchMessages(searchTerm);
	}

	if (!requestMessage) {
		throw new Error('I couldn\'t find any requests that match your search term!');
	}

	return requestMessage;
}

module.exports.search = search;
module.exports.getAmounts = getAmounts;
module.exports.checkAmounts = checkAmounts;
