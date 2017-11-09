const Poll = require('../controllers/PollController');

const { voteEndAmount } = require('../config');

const messageReactionAdd = (client, reaction, user) => {
	if (user.bot || reaction.message.channel.name !== 'emoji-voting') return;
	if (!['approve', 'deny'].includes(reaction.emoji.name) || reaction.count < 1) return;
	if (!reaction.message.embeds.length || reaction.message.embeds[0].color) return;

	const [, author] = reaction.message.embeds[0].description.match(/^`(\w+)#\d+`/);
	const endAmount = (reaction.users.exists('username', author)) ? voteEndAmount + 2 : voteEndAmount + 1;

	if (reaction.emoji.name === 'approve' && reaction.count >= endAmount) {
		Poll.approve(reaction.message);
	} else if (reaction.emoji.name === 'deny' && reaction.count >= endAmount) {
		Poll.deny(reaction.message);
	}
};

module.exports = messageReactionAdd;
