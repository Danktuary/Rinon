const Poll = require('../controllers/PollController');

const { emojis, voteEndAmount } = require('../config');

/**
 * @todo Update these docblocks
 * @todo Refactor this to rely on the database instead of embed data
 * @todo Refactor the conditionals, make them cleaner where possible
 */
const messageReactionAdd = (client, reaction, user) => {
	if (user.bot || reaction.message.channel.name !== 'emoji-voting') return;
	if (![emojis.approve, emojis.deny].includes(reaction.emoji.id) || reaction.count < 1) return;
	if (!reaction.message.embeds.length || reaction.message.embeds[0].color) return;

	const [, author] = reaction.message.embeds[0].description.match(/^`(\w+)#\d+`/);
	const endAmount = (reaction.users.exists('username', author)) ? voteEndAmount + 2 : voteEndAmount + 1;

	if (reaction.emoji.id === emojis.approve && reaction.count >= endAmount) {
		Poll.approve(reaction.message);
	}
	else if (reaction.emoji.id === emojis.deny && reaction.count >= endAmount) {
		Poll.deny(reaction.message);
	}
};

module.exports = messageReactionAdd;
