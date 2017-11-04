const { MessageEmbed } = require('discord.js');

const { prefix } = require('../config');

/**
 * An object containing the state of the requirements check and the error message, if applicable
 *
 * @typedef {Object} RequirementCheck
 * @property {boolean} passed Whether the check was passed or not
 * @property {(MessageEmbed|string)} [message] The error message if the check failed
 */

class GuildManagerController {

	/**
	 * Check if the supplied Guild meets all requirements for the client to function properly
	 *
	 * @param {Guild} guild The Guild to check
	 * @return {RequirementCheck} Whether the Guild has passed or not
	 */
	static checkRequirements(guild) {
		const failures = [];
		const requiredPerms = ['MANAGE_CHANNELS', 'MANAGE_EMOJIS', 'ADD_REACTIONS', 'EMBED_LINKS'];

		const embed = new MessageEmbed().setColor('#e84a4a');

		if (!guild.me.permissions.has(requiredPerms)) {
			const missingPerms = guild.me.permissions.missing(requiredPerms);

			failures.push({
				title: 'Missing Permissions',
				body: `I'm missing the following permissions: ${missingPerms.map(perm => `\`${perm}\``).join(', ')}`,
			});
		}

		if (!guild.channels.exists('name', 'emoji-voting')) {
			failures.push({
				title: 'Missing Voting Channel',
				body: `A channel named \`emoji-voting\` doesn't exist here yet!\nUse the \`${prefix}init\` command to set it up.`,
			});
		}

		if (failures.length) {
			embed.addField('Execution Error', 'I can\'t execute that command because I haven\'t been properly configured yet!');

			for (const failure of failures) {
				embed.addField(failure.title, failure.body);
			}

			return { passed: false, message: embed };
		}

		return { passed: true };
	}

	/**
	 * Create and properly configure an `emoji-voting` channel for the supplied Guild
	 *
	 * @param {Guild} guild The Guild to create the channel in
	 * @return {Promise<GuildChannel>} The newly created GuildChannel
	 */
	static createPollChannel(guild) {
		if (guild.channels.exists('name', 'emoji-voting')) return;

		return guild.createChannel('emoji-voting', 'text', {
			overwrites: [
				{ id: guild.id, deny: ['SEND_MESSAGES'] },
				{ id: guild.roles.find('name', 'Rinon'), allow: ['SEND_MESSAGES'] },
			],
		});
	}

}

module.exports = GuildManagerController;
