const Discord = require('discord.js');
const fs = require('fs');
const { options } = require('joi');
const { start } = require('../config.json');

const startDate = new Date(start);
const ptsPerQuestion = 1;   // constant score for all questions

// Hard-coded unicode alphabet. To do this dynamically, research surrogate pairs.
// For example, the surrogate pair for unicode A is \uD83C\uDDE6.
const unicodeAlphabet = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬']

var trivia = JSON.parse(fs.readFileSync('./questions.json'));

module.exports = {
	name: 'question',
	description: 'Presents the question for the day.',
	execute(message, args, db) {
        now = new Date();

        // Convert difference from milliseconds to days.
        elapsedDays = Math.floor((now - startDate)/(1000*60*60*24));

        let questionEmbed = new Discord.MessageEmbed()
            .setColor('#2292CF')
            .setTitle('Day ' + (elapsedDays+1).toString())

        // Check if start date has occurred.
        if(now < startDate)
        {
            questionEmbed.setTitle('Error')
                    .setDescription('Woah, the event hasn\'t started yet!\n' +
                            'Check back after ' + startDate.toLocaleDateString('en-US', 
                            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric' }) + '.')
                    .setTimestamp();
            message.channel.send(questionEmbed);
        } // Check if all questions have been cycled through.
        else if(elapsedDays > trivia.questions.length)
        {
            questionEmbed.setTitle('Error')
                    .setDescription('Woah, the event ended!\nIf you think this is a mistake, please contact an Officer.')
                    .setTimestamp();
            message.channel.send(questionEmbed);
        }
        else
        {
            let fullQuestion = 'Today\'s question is:\n\n' + trivia.questions[elapsedDays].question;
            let options = '';
            for(option in trivia.questions[elapsedDays].options)
            {
                options += '\n' + trivia.questions[elapsedDays].options[option]
            }
            // Send the message, but only add reactions if the command was sent in a direct message.
            if(message.guild === null) {
                // Check if user has already answered the question for the day.
                let stmt = db.prepare(`SELECT * FROM responses WHERE userid=${message.author.id} AND question=${elapsedDays};`);
                let responseRow = stmt.get();
                if(responseRow !== undefined) {
                    questionEmbed.setTitle('Error')
                            .setDescription('It looks like you have already answered the question for day ' + (elapsedDays+1).toString() + '!\n' +
                                            'You answered ' + unicodeAlphabet[responseRow.response] + ' for the following question:\n\n' +
                                            trivia.questions[elapsedDays].question + options)
                            .setTimestamp();
                    message.channel.send(questionEmbed);
                }
                else { // If the user hasn't answered the question for the day.
                    fullQuestion += options;
                    questionEmbed.setDescription(fullQuestion);
                    message.channel.send(questionEmbed).then(async sentMessage => {
                        // React to the sent message with alphabetical emojis.
                        // Using async/await forces the reactions to consistently happen in order.
                        try {
                            for(option in trivia.questions[elapsedDays].options)
                            {
                                await sentMessage.react(unicodeAlphabet[option]);
                            }
                        } catch (error) {
                            console.error('One of the emojis failed to react.');
                        }

                        // Check if user that reacted is the original querying user in direct message.
                        const filter = (reaction, user) => {
                            return user.id === message.author.id;
                        };
                        // Wait for first and only first reaction to message.
                        sentMessage.awaitReactions(filter, { max: 1 })
                        .then(collected => {
                            // Collected is a Collection (like a Map) with ONE element because max is set to one attempt
                            // This element has key: emoji (as type String) and value: Object (as type MessageReaction)
                            answerIndex = trivia.questions[elapsedDays].answer.toString().toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
                            responseIndex = unicodeAlphabet.indexOf(collected.firstKey());

                            // Add user's response to database.
                            stmt = db.prepare(`INSERT INTO responses VALUES (${message.author.id}, ${elapsedDays}, ${responseIndex});`);
                            info = stmt.run();
                            console.log('[DB] ' + info.changes + ' changes made to responses table.');

                            // If this is user's first answered question, add them to the scores table.
                            stmt = db.prepare(`SELECT * FROM scores WHERE userid=${message.author.id};`);
                            if(stmt.get() === undefined) {
                                // Add user to scores table.
                                stmt = db.prepare(`INSERT INTO scores(userid) VALUES (${message.author.id});`);
                                let info = stmt.run();
                                console.log('[DB] ' + info.changes + ' changes made to scores table.');
                            }

                            // Ensure the user's nickname is stored in the database.
                            stmt = db.prepare(`SELECT * FROM usernames WHERE userid=${message.author.id};`);
                            if(stmt.get() === undefined) {
                                // Add username to usernames table.
                                stmt = db.prepare(`INSERT INTO usernames VALUES (${message.author.id}, \'${message.author.username.toString()}\');`);
                                let info = stmt.run();
                                console.log('[DB] ' + info.changes + ' changes made to usernames table.');
                            }

                            // Compare attempt to correct answer using index values.
                            if(responseIndex === answerIndex) {
                                // Get the user's current score.
                                stmt = db.prepare(`SELECT score FROM scores WHERE userid=${message.author.id};`);
                                let score = stmt.get().score;
                                score += ptsPerQuestion;
                                // Update user's score in database.
                                stmt = db.prepare(`UPDATE scores SET score=${score} WHERE userid=${message.author.id};`);
                                info = stmt.run();
                                console.log('[DB] ' + info.changes + ' changes made to scores table.');

                                sentMessage.channel.send('That\'s correct!\nYour score is now: **' + score + '**');
                            }
                            else {
                                sentMessage.channel.send('Sorry, that\'s incorrect.');
                            }
                        })
                        .catch(console.error);
                    });
                }
            }
            else {
                questionEmbed.setDescription(fullQuestion + '\n\nAsk me this in a DM to answer!');
                message.channel.send(questionEmbed);
            }
        }
	},
};