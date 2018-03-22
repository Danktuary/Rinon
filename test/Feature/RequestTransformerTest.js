const test = require('ava');

const RequestTransformer = require('../../controllers/RequestTransformerController');

const baseEmojiURL = 'https://cdn.discordapp.com/emojis';

test('it transforms a string in Discord\'s emoji format into a name and link', t => {
	const staticEmoji = '<:SataniaThumbsUp:327605996929417227>';
	const animatedEmoji = '<a:ANGREEEEPING:415963494525960193>';

	t.deepEqual(
		RequestTransformer.fromEmoji(staticEmoji),
		['SataniaThumbsUp', `${baseEmojiURL}/327605996929417227.png`]
	);

	t.deepEqual(
		RequestTransformer.fromEmoji(animatedEmoji),
		['ANGREEEEPING', `${baseEmojiURL}/415963494525960193.gif`]
	);
});

test('it transforms a name and a string in Discord\'s emoji format into a name and link', t => {
	const staticName = 'Satania';
	const staticEmoji = '<:SataniaThumbsUp:327605996929417227>';

	const animatedName = 'ANGREEEEPINGNOISES';
	const animatedEmoji = '<a:ANGREEEEPING:415963494525960193>';

	t.deepEqual(
		RequestTransformer.fromNameAndEmoji(staticName, staticEmoji),
		['Satania', `${baseEmojiURL}/327605996929417227.png`]
	);

	t.deepEqual(
		RequestTransformer.fromNameAndEmoji(animatedName, animatedEmoji),
		['ANGREEEEPINGNOISES', `${baseEmojiURL}/415963494525960193.gif`]
	);
});

test('it transforms a name and an image file into a name and link', t => {
	const staticName = 'SataniaThumbsUp';
	const staticImage = {
		width: 100,
		height: 100,
		size: 200000,
		url: `${baseEmojiURL}/327605996929417227.png`,
	};

	const animatedName = 'ANGREEEEPING';
	const animatedImage = {
		width: 100,
		height: 100,
		size: 200000,
		url: `${baseEmojiURL}/415963494525960193.gif`,
	};

	t.deepEqual(
		RequestTransformer.fromNameAndAttachment(staticName, staticImage),
		['SataniaThumbsUp', `${baseEmojiURL}/327605996929417227.png`]
	);

	t.deepEqual(
		RequestTransformer.fromNameAndAttachment(animatedName, animatedImage),
		['ANGREEEEPING', `${baseEmojiURL}/415963494525960193.gif`]
	);
});

test('it returns an array with the name and link if supplied', t => {
	const emoji = ['AiSmug', 'https://i.imgur.com/8jGJzmd.png'];

	t.deepEqual(
		RequestTransformer.transform({}, emoji),
		['AiSmug', 'https://i.imgur.com/8jGJzmd.png']
	);
});

test('it strips out colons (:) if a request name starts and ends with one', t => {
	const emoji = [':AiSmug:', 'https://i.imgur.com/8jGJzmd.png'];

	t.deepEqual(
		RequestTransformer.transform({}, emoji),
		['AiSmug', 'https://i.imgur.com/8jGJzmd.png']
	);
});

test('it throws an error if non-alphanumeric characters are used in a name', t => {
	const emoji = ['Ai*@(#$&', 'https://i.imgur.com/8jGJzmd.png'];

	const error = t.throws(() => RequestTransformer.transform({}, emoji), RangeError);

	t.is(error.message, 'Only alphanumeric characters are allowed!');
});

test('it throws an error if a non-proper link is used', t => {
	const emoji = ['someName', 'probably not a link'];

	const error = t.throws(() => RequestTransformer.transform({}, emoji), Error);

	t.is(error.message, 'That doesn\'t seem like a valid image URL.');
});
