const { MessageEmbed } = require('discord.js');

const { prefix } = require('../config');

/**
 * An object containing the state of the requirements check and the error message (if applicable)
 *
 * @typedef {Object} RequirementCheck
 * @property {boolean} passed Whether the check was passed or not
 * @property {(MessageEmbed|string)} [message] The error message if the check failed
 */

/**
 * Perform common operations on a guild
 */
class GuildManagerController {

	/**
	 * Check if the supplied Guild meets all requirements for the client to function properly
	 *
	 * @param {TextChannel} channel The channel to check in
	 * @todo Refactor this to check for channel-wise perms and not just guild-wise
	 * @return {RequirementCheck} Whether the Guild has passed or not
	 */
	static checkRequirements(channel) {
		const { guild } = channel;
		const failures = [];
		const missingPerms = this.missingPermissions(guild.me);

		if (missingPerms.length) {
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
			failures.unshift({
				title: 'Execution Error',
				body: 'I can\'t execute that command because I haven\'t been properly configured yet!',
			});

			let message;

			if (!guild.me.permissionsIn(channel).has('EMBED_LINKS')) {
				message = failures.map(failure => `**${failure.title}**: ${failure.body}`).join('\n\n');
			}
			else {
				message = new MessageEmbed().setColor('#e84a4a');

				for (const failure of failures) {
					message.addField(failure.title, failure.body);
				}
			}

			return { passed: false, message };
		}

		return { passed: true };
	}

	/**
	 * @todo Update these docblocks
	 */
	static checkEmojiAmount(guild, emojiLink) {
		const emojiAmount = GuildManagerController.emojiAmounts(guild);

		const maxEmojisReply = [
			'It seems like I can\'t add any more emojis to this server.',
			`Want to check the other servers I\'m in? Use the \`${prefix}server\` command!`,
		].join('\n');

		if (emojiAmount.static + emojiAmount.animated === 100) {
			throw new Error(maxEmojisReply);
		}
		else if (emojiLink.endsWith('.gif') && emojiAmount.animated === 50) {
			throw new Error(maxEmojisReply.replace('emojis', 'animated emojis'));
		}
		else if (emojiLink.endsWith('.png') && emojiAmount.static === 50) {
			throw new Error(maxEmojisReply.replace('emojis', 'static emojis'));
		}
	}

	/**
	 * @todo Update these docblocks
	 */
	static emojiAmounts(guild) {
		return {
			static: guild.emojis.filter(emoji => !emoji.animated).size,
			animated: guild.emojis.filter(emoji => emoji.animated).size,
		};
	}

	/**
	 * Return the missing permissions, if any
	 *
	 * @param {GuildMember} clientMember A GuildMember instance of the client
	 * @param {boolean} format Whether to format the permissions or not
	 * @return {string[]} The missing permissions
	 */
	static missingPermissions(clientMember, format = true) {
		const requiredPerms = [
			'ADD_REACTIONS', 'CREATE_INSTANT_INVITE', 'EMBED_LINKS',
			'MANAGE_CHANNELS', 'MANAGE_EMOJIS', 'MANAGE_MESSAGES',
		];

		const missingPerms = clientMember.permissions.missing(requiredPerms);

		if (!format) return missingPerms;
		return missingPerms.map(perm => `\`${perm}\``).join(', ');
	}

	/**
	 * Create and properly configure an `emoji-voting` channel for the supplied Guild
	 *
	 * @param {Guild} guild The guild to create the channel in
	 * @return {(void|Promise<GuildChannel>)} The newly created GuildChannel
	 */
	static createPollChannel(guild) {
		if (guild.channels.exists('name', 'emoji-voting')) return;

		return guild.channels.create('emoji-voting', {
			overwrites: [
				{ id: guild.id, deny: ['SEND_MESSAGES'] },
				{ id: guild.me.roles.highest, allow: ['SEND_MESSAGES', 'CREATE_INSTANT_INVITE', 'MANAGE_MESSAGES'] },
			],
		});
	}

}

module.exports = GuildManagerController;
