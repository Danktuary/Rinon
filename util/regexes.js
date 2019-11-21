module.exports = {
	wordsOnly: /^\w+$/,
	emoji: /<(a)?:(\w+):(\d+)>/,
	url: /(https?:\/\/)?(www.)?[^\s<>#%{}|\\^~\\[\]]+\.(png|jpe?g|webp|gif)(\?v=\d*)?$/,
	png: /\.png(\?v=\d*)?$/,
	gif: /\.gif(\?v=\d*)?$/,
	blob: /^a?b(lo|ol)b[a-z]+$/,
	blobInit: /^a?b(lo|ol)b/i,
	guildNameEnding: /\(ES#(\d+)\)$/,
};
