const { readdirSync } = require('fs');
const { basename, join } = require('path');
const { Collection } = require('discord.js');

const { paths } = require('./config');

/**
 * Initialize required aspects of the client
 */
class Bootstrap {

	/**
	 * Load all commands from the designated folder into a Collection
	 *
	 * @return {Collection} All commands
	 */
	static commands() {
		const commands = new Collection;
		const commandsFiles = readdirSync(paths.commands);

		for (const commandFile of commandsFiles) {
			const command = require(join(paths.commands, commandFile));

			commands.set(basename(commandFile, '.js'), command);
		}

		return commands;
	}

	/**
	 * Loads all events from the designated folder and binds them to the client
	 *
	 * @param {Client} client The discord.js Client instance to bind the events to
	 */
	static events(client) {
		const eventsFiles = readdirSync(paths.events);

		for (const eventFile of eventsFiles) {
			const event = require(join(paths.events, eventFile));

			client.on(basename(eventFile, '.js'), (...args) => {
				return event(client, ...args);
			});
		}
	}

}

module.exports = Bootstrap;
