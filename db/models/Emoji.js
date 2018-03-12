/**
 * @todo Use `field` instead of directly underscoring the names
 */
const Emoji = (database, DataTypes) => {
	return database.define('emoji', {
		emoji_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		guild_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		underscored: true,
	});
};

module.exports = Emoji;
