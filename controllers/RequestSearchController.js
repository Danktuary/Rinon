/**
 * @todo Update these docblocks
 */
class RequestSearchController {

	/**
	 * @todo Update these docblocks
	 */
	static async search(guild, searchTerm) {
		const pollChannel = guild.channels.find('name', 'emoji-voting');

		if (!pollChannel) {
			throw new Error('I couldn\'t find the `emoji-voting` channel !');
		}

		const messages = await pollChannel.messages.fetch({ limit: 100 });

		let requestMessage = messages.find(message => {
			const [embed] = message.embeds;
			return embed && !embed.color && (new RegExp(`\`${searchTerm}\`\\.$`, 'i')).test(embed.description);
		});

		if (!requestMessage && /\d+/.test(searchTerm)) {
			requestMessage = await pollChannel.messages.fetch(searchTerm);
		}

		if (!requestMessage) {
			throw new Error('I couldn\'t find any requests that match your search term!');
		}

		return requestMessage;
	}

}

module.exports = RequestSearchController;
