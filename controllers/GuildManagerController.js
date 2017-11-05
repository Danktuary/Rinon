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
		const embed = new MessageEmbed().setColor('#e84a4a');
		const missingPerms = this.missingPermissions(guild.me);

		if (missingPerms) {
			failures.push({
				title: 'Missing Permissions',
				body: `I'm missing the following permissions: ${missingPerms}`,
			});
		}

		if (!guild.channels.exists('name', 'emoji-voting')) {
			failures.push({
				title: 'Missing Voting Channel',
				body: [
					'A channel named \`emoji-voting\` doesn\'t exist here yet!',
					`Use the \`${prefix}init\` command to set it up.`,
				].join('\n'),
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
	 * Return the missing permissions, if any
	 *
	 * @param {GuildMember} client A GuildMember instance of the client
	 * @param {boolean} format Whether to format this or not
	 * @return {(boolean|string[])} The missing permissions
	 */
	static missingPermissions(client, format = true) {
		const requiredPerms = ['MANAGE_CHANNELS', 'MANAGE_EMOJIS', 'ADD_REACTIONS', 'EMBED_LINKS'];
		const missingPerms = client.permissions.missing(requiredPerms);

		if (!missingPerms.length) return false;
		if (!format) return missingPerms;
		return missingPerms.map(perm => `\`${perm}\``).join(', ');
	}

	/**
	 * Create and properly configure an `emoji-voting` channel for the supplied Guild
	 *
	 * @param {Guild} guild The Guild to create the channel in
	 * @return {(void|Promise<GuildChannel>)} The newly created GuildChannel
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
