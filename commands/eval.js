const eval = {
	name: 'eval',
	description: 'Evaluate JavaScript.',
	ownerOnly: true,
	execute(message, args) {
		message.channel.send(eval(args.join(' ')), { code: 'js' });
	},
};
