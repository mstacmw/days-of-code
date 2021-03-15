require('../log.js');
const Discord = require('discord.js');
//const fs = require('fs');
// included in log.js
const { adminChannel, adminRole, embedColor, prefix, start, questionChannel } = require("../config.json");
const Utilities = require('../utilities');
const trivia = JSON.parse(fs.readFileSync('./questions.json'));

function alertQuestion(client, initiator) {
    let now = new Date();
    let questionIndex = Math.floor((now - (new Date(start)))/Utilities.questionInterval);

    // Check if the event is currently happening.
    if(questionIndex >= 0 && questionIndex < trivia.questions.length) {
        // Prepare question for embed.
        let fullQuestion = 'The question for today is:\n\n' + trivia.questions[questionIndex].question + '\n';
        for(option in trivia.questions[questionIndex].options)
        {
            fullQuestion += '\n' + Utilities.unicodeAlphabet[option] + trivia.questions[questionIndex].options[option].substring(1);
        }
        fullQuestion += '\n\nSend me a DM with `' + prefix + 'question` to answer!';

        // Send question to different channel.
        questionChannelId = client.channels.cache.find(channel => channel.name === questionChannel).id;
        client.channels.cache.get(questionChannelId).send(Utilities.generateQuestionEmbed('Day ' + (questionIndex+1).toString(), fullQuestion, trivia.questions[questionIndex].image));

        console.log('[+] Scheduled message sent to #' + questionChannel + ' channel at ' + now + '.');
    }
    else {
        console.log('[-] Interval wanted to send message to ' + questionChannel + ' at ' + now + ' but event isn\'t happening.');
        // Direct message the user that initiated the interval to inform them of a problem.
        client.users.cache.find(user => user.id === initiator.id).send(
            'A problem occurred with my interval.' +
            '\n\nIf the event is over, you should stop me and send a message in the server announcing the winners and end of the competition.' +
            '\n\nIf the event has not yet started, then I will start sending messages when it starts, so do not run `' + prefix + 'startReminder` again!');
    }
}

module.exports = {
	name: 'startreminder',
    elevated: true,
    usage: prefix + 'startReminder',
    brief: 'Starts sending the question for the day in `#' + questionChannel + '` every ' + Utilities.questionInterval/(1000*60*60) + ' hours.',
    description: 'Starts sending the question for the day in `#' + questionChannel + '` every ' + Utilities.questionInterval/(1000*60*60) + ' hours. ' +
                'A DM will be sent to the person who used the command when a problem occurs with the interval, when the event is over, or if the command ' +
                'is used before the event starts.\n' +
                'If this command is used before the event starts, it will still run at the same time after the event starts.' +
                '\n\nIdeally, this command should only be used once. If used more than once, then the question of the day will be ' +
                'sent more than once in the interval of ' + Utilities.questionInterval/(1000*60*60) + ' hours.' +
                '\n\nThe log is updated when the interval is called.',
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
            // Set the client to call this function for every interval, then call the function now.
            message.client.setInterval(alertQuestion, Utilities.questionInterval, message.client, message.author);
            alertQuestion(message.client, message.author);

            // Send status message.
            message.channel.send(
                embed.setTitle('Question Interval')
                    .setDescription('Interval set.\nToday\'s question will be sent to `#' +
                                    questionChannel + '` starting now and repeating every ' +
                                    Utilities.questionInterval/(1000*60*60) + ' hours.' +
                                    '\n\nIf and/or when there is an error with the interval, you will recieve a DM from me.')
            );
        }
        else {
            message.channel.send(embed);
        }
	},
};
