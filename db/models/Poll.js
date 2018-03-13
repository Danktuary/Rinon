/**
 * @todo Use `field` instead of directly underscoring the names
 */
const Poll = (database, DataTypes) => {
	return database.define('poll', {
		messageID: {
			field: 'message_id',
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		authorID: {
			field: 'author_id',
			type: DataTypes.STRING,
			allowNull: false,
		},
		emojiName: {
			field: 'emoji_name',
			type: DataTypes.STRING,
			allowNull: false,
		},
		imageURL: {
			field: 'image_url',
			type: DataTypes.STRING,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM('pending', 'approved', 'denied'),
			defaultValue: 'pending',
			allowNull: false,
		},
	}, {
		underscored: true,
	});
};

module.exports = Poll;
