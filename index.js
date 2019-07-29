const { token } = require('./config.js');
const RinonClient = require('./core/client.js');

const client = new RinonClient();

client.build();

client.commandHandler.resolver.addType('serverNumber', (input, message) => {
	const intType = client.commandHandler.resolver.type('integer');
	const int = intType(input);
	if (int < 1 || int > message.client.guilds.size) return null;
	return int;
});

client.login(token);
