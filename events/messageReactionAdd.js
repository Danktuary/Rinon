const Poll = require('../controllers/PollController');

const { voteEndAmount } = require('../config');

const messageReactionAdd = (client, reaction, user) => {
	if (user.bot || reaction.message.channel.name !== 'emoji-voting') return;
	if (!['approve', 'deny'].includes(reaction.emoji.name) || reaction.count < 1) return;
	if (!reaction.message.embeds.length || reaction.message.embeds[0].color) return;

	const author = reaction.message.embeds[0].description.match(/^`(\w+)#\d+`/)[1];
	const amount = (reaction.users.exists('username', author)) ? voteEndAmount + 1 : voteEndAmount;

	if (reaction.emoji.name === 'approve' && reaction.count >= amount) {
		Poll.approve(reaction.message);
	} else if (reaction.emoji.name === 'deny' && reaction.count >= amount) {
		Poll.deny(reaction.message);
	}
};

module.exports = messageReactionAdd;
