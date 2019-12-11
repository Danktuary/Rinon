const { Permissions } = require('discord.js');
const { capitalize } = require('./text.js');

const required = [
	'ADD_REACTIONS',
	'CREATE_INSTANT_INVITE',
	'EMBED_LINKS',
	'MANAGE_CHANNELS',
	'MANAGE_EMOJIS',
	'MANAGE_MESSAGES',
	'READ_MESSAGE_HISTORY',
	'SEND_MESSAGES',
	'USE_EXTERNAL_EMOJIS',
	'VIEW_CHANNEL',
];

module.exports.required = required;
module.exports.requiredNumber = Permissions.resolve(required);
module.exports.formatNames = names => names.map(name => name.toLowerCase().split('_').map(capitalize).join(' '));
