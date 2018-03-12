const Poll = (database, DataTypes) => {
	return database.define('Poll', {
		message_id: DataTypes.STRING,
		author_id: DataTypes.STRING,
		emoji_name: DataTypes.STRING,
		image_url: DataTypes.STRING,
		approved: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	}, {
		underscored: true,
	});
};

module.exports = Poll;
