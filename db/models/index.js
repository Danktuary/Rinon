// TODO: Maybe move this to the bootstrap file. I dunno.
const fs = require('fs');
const path = require('path');

const database = require('../connection');

const models = {};

const modelFiles = fs.readdirSync(__dirname).filter(file => {
	return file.endsWith('.js') && path.resolve(__dirname, file) !== __filename;
});

for (const modelFile of modelFiles) {
	const model = database.import(modelFile);
	const name = path.basename(modelFile, '.js');
	models[name] = model;
}

const { Poll, Emoji } = models;

Poll.hasOne(Emoji);
Emoji.belongsTo(Poll);

module.exports = models;
