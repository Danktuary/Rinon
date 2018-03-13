const { Op } = require('sequelize');
const { Poll } = require('../db/models/');

const rename = {
	name: 'rename',
	description: 'Rename .',
	usage: '<old name> <new name>',
	async execute(message, [oldName, newName]) {
		if (!oldName || !newName) {
			return message.reply(
				'you need to supply the name of the current request you want to rename and the name you want to give it.'
			);
		}

		// TODO: Use `.findAll()` instead
		const pollEntry = Poll.findOne({
			where: {
				emoji_name: { [Op.iLike]: oldName },
			},
		});

		if (message.author.id !== pollEntry.authorID) {

		}
	},
};

module.exports = rename;
