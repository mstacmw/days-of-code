const Discord = require('discord.js');
const Utilities = require('../utilities.js');
const fs = require('fs');
const { adminRole, adminChannel, embedColor, prefix } = require('../config.json');

const maxPreviewCount = 10; // needs to be considered so the rate limit is not exceeded
var trivia = JSON.parse(fs.readFileSync('./questions.json'));

function generatePreview(questionIndex) {
    let fullQuestion = 'Today\'s question is:\n\n' + trivia.questions[questionIndex].question;                                
    for(option in trivia.questions[questionIndex].options)
    {
        // Check if more options are used than Utilities is prepared for.
        if(option >= Utilities.unicodeAlphabet.length) {
            return Utilities.generateQuestionEmbed(
                    'Day ' + (questionIndex+1).toString() + ' with ERROR: too many options',
                    fullQuestion + '\n\nCheck that Utilities is capable of handling that many options!')
                .setColor('#FF0000');
        }
        else {
            fullQuestion += '\n' + Utilities.unicodeAlphabet[option] + trivia.questions[questionIndex].options[option].substring(1);
        }
    }
    return Utilities.generateQuestionEmbed('Day ' + (questionIndex+1).toString(), fullQuestion);
}

module.exports = {
	name: 'preview',
    elevated: true,
    usage: prefix + 'preview firstDayNumber [lastDayNumber]',
    brief: 'Preview question embeds from question file.',
    description: 'Preview question embeds from question file. \n' +
                '`firstDayNumber` should be an integer of the first day\'s question to preview. If no second argument is provided, then only this day\'s question is previewed. \n' +
                '`lastDayNumber` is an optional argument and should be an integer of the last day\'s question to preview. \n' +
                'If a previewed question has a problem being displayed, it will be indicated with a red color. ' +
                'In order to avoid being rate limited by Discord, a range of up to ' + maxPreviewCount + ' is permitted. ' +
                '\nThis command is intended to be used to check for grammatical and content issues within the questions.',
	execute(message, args, db) {
        let embed = new Discord.MessageEmbed()
                .setColor(embedColor)
                .setTitle('Error')
                .setDescription('This command will not work here!\n' +
                                'Try using this command in the ACM-W server\'s `#' + adminChannel + '` channel.\n' +
                                'If the bot does not appear in `#' + adminChannel +
                                '`, then give it the `' + adminRole + '` role.')
                .setTimestamp();
        // Only allow this command if it is being executed in a given channel that should be for administrators only.
        if(message.client.channels.cache.find(channel => channel.name === adminChannel).id === message.channel.id) {
            // Check if number of given arguments is allowed.
            if(args.length < 1 || args.length > 2) {
                message.channel.send(embed.setTitle('Error').setDescription('Expecting 1 or 2 arguments with command.'));
            }
            else {
                // Grab the arguments.
                let startIndex = parseInt(args[0]) - 1;
                let endIndex = startIndex;
                if(args.length > 1) {
                    endIndex = parseInt(args[1]) - 1;
                }
                
                // Check bounds for arguments.
                if(startIndex < 0 || startIndex >= trivia.questions.length) {
                    message.channel.send(embed.setDescription('1st argument is invalid. Argument must be between 1 and ' + trivia.questions.length + '.'));
                }
                else if(endIndex < 0 || endIndex >= trivia.questions.length) {
                    message.channel.send(embed.setDescription('2nd argument is invalid. Argument must be between 1 and ' + trivia.questions.length + '.'));
                }
                else if((endIndex < startIndex) || (endIndex === startIndex && args.length > 1)) {
                    message.channel.send(embed.setDescription('1st argument must be less than 2nd argument.'));
                }
                else if((endIndex - startIndex + 1) > maxPreviewCount) { // +1 because day at endIndex is also previewed
                    message.channel.send(embed.setDescription('Cannot preview more than ' + maxPreviewCount + ' messages at a time to avoid exceeding the rate limit.'));
                }
                else {
                    // Only send message for confirmation if more than one question is being previewed.
                    if(args.length > 1) {
                        // Send message for confirmation.
                        message.channel.send(
                            embed.setTitle('Elevated Command')
                                .setDescription('React with 👍 confirm preview of questions from day ' +
                                                (startIndex+1) + ' to day ' + (endIndex+1) + '.' +
                                                '\nNote: reactions are not shown on the preview.')
                        ).then(async sentMessage => {
                            // React to the sent message for confirmation.
                            try {
                                await sentMessage.react('👍');
                            } catch (error) {
                                console.error('One of the emojis failed to react.');
                            }
                            // Check if user that reacted is the original querying user with the expected reaction.
                            const filter = (reaction, user) => {
                                return reaction.emoji.name === '👍' && user.id === message.author.id;
                            };
                            // Wait for first and only first reaction to message.
                            sentMessage.awaitReactions(filter, { max: 1 })
                            .then(() => {
                                // Send message previews.
                                for(index = startIndex; index <= endIndex; index++) {
                                    message.channel.send(generatePreview(index));
                                }
                            })
                            .catch(console.error);
                        });
                    }
                    else {
                        // Send single preview without message for confirmation.
                        message.channel.send(generatePreview(startIndex));
                    }
                }
            }
        }
        else {
            message.channel.send(embed);
        }
	},
};