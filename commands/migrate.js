const { Poll } = require('../db/models/');

const { colors } = require('../config');

const emojiRegex = /<(a)?:(\w+):(\d+)>/;
const baseEmojiURL = 'https://cdn.discordapp.com/emojis';
const usernameUpdates = { synicalsyntax: 'ikemendia' };

const migrate = {
	name: 'migrate',
	description: 'Take the existing, approved/denied polls and store them in a database, for statistics and such.',
	async execute(message, args) {
		const [after, limit] = args;
		const channel = message.guild.channels.find('name', 'emoji-voting');

		const messages = await channel.messages.fetch({ after, limit });
		const approvedMessages = messages.filter(m => m.embeds.length && m.embeds[0].color);

		for (const m of approvedMessages.values()) {
			const [embed] = m.embeds;

			let [, username] = embed.author.name.match(/Request by (\w+)#\d{4}/);

			if (usernameUpdates.hasOwnProperty(username)) {
				username = usernameUpdates[username];
			}

			const author = message.client.users.find('username', username);

			let data = {
				messageID: m.id,
				authorID: author.id,
				status: embed.color === colors.approved ? 'approved' : 'denied',
				created_at: m.createdAt,
				updated_at: m.editedAt,
			};

			if (embed.color === colors.approved) {
				const [, animated, emojiName, emojiID] = embed.description.match(emojiRegex);

				// TODO: emojiID is no longer on the Poll model; need to make a new row in the Emoji model
				data = Object.assign(data, {
					emojiName,
					imageURL: `${baseEmojiURL}/${emojiID}.${animated ? 'gif' : 'png'}`,
					emojiID,
				});
			}
			else {
				data = Object.assign(data, {
					emojiName: 'placeholder',
					imageURL: 'placeholder',
				});
			}

			console.log(data);
			console.log();

			await Poll.create(data, { silent: true });
		}
	},
};

module.exports = migrate;
