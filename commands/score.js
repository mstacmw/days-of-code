const Discord = require('discord.js');
const { embedColor, prefix } = require('../config.json');
const topToDisplay = 3;

module.exports = {
	name: 'score',
    elevated: false,
    usage: prefix + 'score',
    brief: 'Displays the user\'s current score.',
	description: 'Displays the user\'s current score. You should use this in a DM if you don\'t want to broadcast your score in the channel.',
	execute(message, args, db) {
        stmt = db.prepare(`SELECT * FROM scores WHERE userid=${message.author.id};`);

        let scoreEmbed = new Discord.MessageEmbed()
            .setColor(embedColor)
            .setTitle('Your score is: ')
            .setTimestamp()
        
        let scoreRow = stmt.get();
        if(scoreRow === undefined) {
            scoreEmbed.setDescription('0\n\nYou haven\'t answered any questions yet!');
        }
        else {
            scoreEmbed.setDescription(scoreRow.score.toString())
        }
        
        message.channel.send(scoreEmbed);
	},
};