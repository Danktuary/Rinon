const Poll = (database, DataTypes) => {
	return database.define('Poll', {
		message_id: {
			type: DataTypes.STRING,
			unique: true,
		},
		author_id: DataTypes.STRING,
		emoji_name: DataTypes.STRING,
		image_url: DataTypes.STRING,
		status: {
			type: DataTypes.ENUM('pending', 'approved', 'denied'),
			defaultValue: 'pending',
		},
	}, {
		underscored: true,
	});
};

module.exports = Poll;
