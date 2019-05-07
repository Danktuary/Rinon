const Emoji = (database, DataTypes) => {
	return database.define('emoji', {
		emojiID: {
			field: 'emoji_id',
			type: DataTypes.STRING,
			primaryKey: true,
		},
		guildID: {
			field: 'guild_id',
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		underscored: true,
	});
};

module.exports = Emoji;
