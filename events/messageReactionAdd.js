const Poll = require('../controllers/PollController');

const messageReactionAdd = (client, reaction, user) => {
	console.log(`Emoji name: ${reaction.emoji.name} -- Reaction count: ${reaction.count}`);

	if (user.bot || reaction.message.channel.name !== 'emoji-voting') return;
	if (!['approve', 'deny'].includes(reaction.emoji.name) || reaction.count < 1) return;
	if (reaction.message.embeds[0].color) return;

	if (reaction.emoji.name === 'approve' && reaction.count >= 2) {
		Poll.approve(reaction.message);
	} else if (reaction.emoji.name === 'deny' && reaction.count >= 2) {
		Poll.deny(reaction.message);
	}
};

module.exports = messageReactionAdd;
