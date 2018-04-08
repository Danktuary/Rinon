const { Poll } = require('../db/models/');
const PollController = require('../controllers/PollController');

const { emojis, voteEndAmount } = require('../config');

/**
 * @todo Update these docblocks
 */
const messageReactionAdd = async (client, reaction, user) => {
	if (user.bot || reaction.message.channel.name !== 'emoji-voting') return;
	if (![emojis.approve, emojis.deny].includes(reaction.emoji.id)) return;

	const { message } = reaction;
	const [embed] = message.embeds;

	if (!embed || embed.color) return;

	const pollData = await Poll.findOne({ where: { messageID: message.id } });
	const endAmount = (reaction.users.has(pollData.authorID)) ? voteEndAmount + 2 : voteEndAmount + 1;

	if (reaction.count < endAmount) return;
	if (reaction.emoji.id === emojis.deny) return PollController.deny(message);
	return PollController.approve(message);
};

module.exports = messageReactionAdd;
