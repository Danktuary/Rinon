const RenamePoll = (database, DataTypes) => {
	return database.define('rename_poll', {
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
		emojiID: {
			field: 'emoji_id',
			type: DataTypes.STRING,
			allowNull: false,
		},
		oldName: {
			field: 'old_name',
			type: DataTypes.STRING,
			allowNull: false,
		},
		newName: {
			field: 'new_name',
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

module.exports = RenamePoll;
