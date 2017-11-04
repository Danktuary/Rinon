const Poll = (sequelize, DataTypes) => {
	return sequelize.define('poll', {
		message_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		votes: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	});
};

module.exports = Poll;
