module.exports = {
	add: [
		':emojiName:',
		'EmojiName :emojiName:',
		':emojiName: EmojiName',
		'EmojiName https: //i.imgur.com/8jGJzmd.png',
		'https: //i.imgur.com/8jGJzmd.png EmojiName',
		'EmojiName https: //i.imgur.com/8jGJzmd.png --reverse',
		'EmojiName (supply only a name with an image attachment)',
	],
	approve: [
		'EmojiName (if `--mode=x` argument is omitted, defaults to `emoji`)',
		'EmojiName --mode=emoji (approves a pending emoji poll)',
		'EmojiName --mode=rename (approves a pending rename poll)',
	],
	deny: [
		'EmojiName (if `--mode=x` argument is omitted, defaults to `emoji`)',
		'EmojiName --mode=emoji (approves a pending emoji poll)',
		'EmojiName --mode=rename (approves a pending rename poll)',
	],
	'emoji-search': ['EmojiName', ':emoji:'],
	help: ['', 'add'],
	rename: [
		'oldName newName (if `--mode=x` argument is omitted, defaults to `emoji`)',
		'oldName newName --mode=poll (renames a pending poll you\'ve made)',
		':oldEmoji: newName',
		'newName :oldEmoji:',
	],
	server: ['1'],
	sync: [
		'all',
		'invites',
		'info 2 (`1` is invalid)',
		'galleries',
		'gallery 2',
		'status',
	],
}
