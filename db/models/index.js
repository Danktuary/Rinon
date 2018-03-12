const fs = require('fs');
const path = require('path');

const database = require('../connection');

const models = {};

const modelFiles = fs.readdirSync(__dirname).filter(file => {
	return file.endsWith('.js') && path.resolve(__dirname, file) !== __filename;
});

for (const modelFile of modelFiles) {
	const model = database.import(modelFile);
	models[model.name] = model;

	if (models[model.name].associate) {
		models[model.name].associate(models);
	}
}

module.exports = models;