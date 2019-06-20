const Poll = require('./index.js');
const emojiUtil = require('../../util/emoji.js');
const models = require('../../database/models/index.js');

module.exports = class RenameVotingPoll extends Poll {
	constructor(client) {
		super(client);
		this.channel = client.hubServer.renameVoting;
	}

	async create({ message, oldName, newName }) {
		const emoji = emojiUtil.search(this.client.emojis, oldName);

		return this.sendEmbed({
			emoji,
			author: message.author,
			description: `\`${message.author.tag}\` wants to rename ${emoji} from \`${oldName}\` to \`${newName}\`.`,
		});
	}
};
