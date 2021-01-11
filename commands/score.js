const Discord = require('discord.js');
const topToDisplay = 3;

module.exports = {
	name: 'score',
	description: 'Displays the user\'s current score.',
	execute(message, args, db) {
        stmt = db.prepare(`SELECT * FROM scores WHERE userid=${message.author.id};`);

        let scoreEmbed = new Discord.MessageEmbed()
            .setColor('#2292CF')
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