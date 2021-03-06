module.exports.wordsOnly = /^\w+$/
module.exports.emoji = /<(a)?:(\w+):(\d+)>/
module.exports.url = /(https?:\/\/)?(www.)?[^\s<>#%{}|\\^~\\[\]]+\.(png|jpe?g|webp|gif)(\?v=\d*)?$/
module.exports.embedlessUrl = /<(https?:\/\/)?(www.)?[^\s<>#%{}|\\^~\\[\]]+\.(png|jpe?g|webp|gif)(\?v=\d*)?>$/
module.exports.png = /\.png(\?v=\d*)?$/
module.exports.gif = /\.gif(\?v=\d*)?$/
module.exports.blob = /^a?b(lo|ol)b[a-z]+$/
module.exports.blobInit = /^a?b(lo|ol)b/i
module.exports.guildNameEnding = /\(ES#(\d+)\)$/
module.exports.galleryChannelNameEnding = /emoji\-gallery\-(\d+)$/
