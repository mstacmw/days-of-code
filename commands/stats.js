const Discord = require('discord.js');
const fs = require('fs');
const { adminChannel, adminRole, embedColor, prefix, start } = require("../config.json");
const trivia = JSON.parse(fs.readFileSync('./questions.json'));

module.exports = {
	name: 'stats',
    elevated: true,
    usage: prefix + 'stats',
    brief: 'Returns stats for preparing for competition.',
    description: 'Returns stats for preparing for competition.',
	execute(message, args, db) {
        let embed = new Discord.MessageEmbed()
                .setColor(embedColor)
                .setTitle('Error')
                .setDescription('This command will not work here!\n' +
                                'Try using this command in the ACM-W server\'s `#' + adminChannel + '` channel.\n' +
                                'If the bot does not appear in `#' + adminChannel +
                                '`, then give it the `' + adminRole + '` role.')
                .setTimestamp();

        // Only process this command if it is being executed in a channel that should be for administrators only.
        if(message.client.channels.cache.find(channel => channel.name === adminChannel).id === message.channel.id) {
            let statistics = {};
            let description = '';

            startDate = new Date(start);
            statistics['Start Date'] = startDate.toString();

            statistics['Number of Questions'] = trivia.questions.length;

            endDate = new Date(startDate.getTime() + (trivia.questions.length*1000*60*60*24));
            statistics['Calculated End Date'] = endDate.toString();

            statistics['Admin Channel'] = adminChannel;

            statistics['Admin Role'] = adminRole;

            stmt = db.prepare(`SELECT userid FROM usernames;`);
            statistics['Number of Participants'] = stmt.all().length;

            stmt = db.prepare(`SELECT * FROM responses;`);
            statistics['Total question responses received'] = stmt.all().length;

            // Format and send embed.
            for(key in statistics) {
                description += '\n\n**' + key + '**\n ' + statistics[key];
            }
            message.channel.send(
                embed.setTitle('Competition Statistics')
                    .setDescription(description)
            );
        }
        else {
            message.channel.send(embed);
        }
	},
};