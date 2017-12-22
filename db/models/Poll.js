const Poll = (sequelize, DataTypes) => {
	return sequelize.define('polls', {
		message_id: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		// owner_id: {
		// 	type: DataTypes.STRING,
		// 	allowNull: false,
		// },
		approved: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};

module.exports = Poll;
