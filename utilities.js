const Discord = require('discord.js');

// Hard-coded unicode alphabet. To do this dynamically, research surrogate pairs.
// For example, the surrogate pair for unicode A is \uD83C\uDDE6.
const unicodeAlphabet = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬']

module.exports = {
    unicodeAlphabet: unicodeAlphabet,
    generateQuestionEmbed(title, description) {
        return new Discord.MessageEmbed()
                .setColor('#2292CF')
                .setTitle(title)
                .setDescription(description);
    }
};
