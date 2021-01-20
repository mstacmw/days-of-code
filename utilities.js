const Discord = require('discord.js');
const { embedColor } = require('./config.json');

// Hard-coded unicode alphabet. To do this dynamically, research surrogate pairs.
// For example, the surrogate pair for unicode A is \uD83C\uDDE6.
const unicodeAlphabet = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬']

module.exports = {
    unicodeAlphabet: unicodeAlphabet,
    questionInterval: 1000*60*60*24, // in ms
    generateQuestionEmbed(title, description, image = undefined) {
        let embed = new Discord.MessageEmbed()
                .setColor(embedColor)
                .setTitle(title)
                .setDescription(description);

        if(image !== undefined) {
            embed.setImage(image);
        }

        return embed;
    }
};
