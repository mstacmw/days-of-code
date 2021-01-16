const Utilities = require('../utilities.js');

const fs = require('fs');
const { prefix, start } = require('../config.json');

const startDate = new Date(start);
const ptsPerQuestion = 1;   // constant score for all questions

let trivia = JSON.parse(fs.readFileSync('./questions.json'));

module.exports = {
	name: 'question',
    elevated: false,
    usage: prefix + 'question',
    brief: 'Presents the question for the day.',
    description: 'Presents the question for the day. You can only respond to the question in a DM.',
	execute(message, args, db) {
        now = new Date();

        // Convert difference from milliseconds to days.
        elapsedDays = Math.floor((now - startDate)/Utilities.questionInterval);

        // Check if start date has occurred.
        if(now < startDate)
        {
            message.channel.send(
                Utilities.generateQuestionEmbed('Error', 'Woah, the event hasn\'t started yet!\n' +
                            'Check back after ' + startDate.toLocaleDateString('en-US', 
                            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric' }) + '.')
                .setTimestamp()
            );
        } // Check if all questions have been cycled through.
        else if(elapsedDays >= trivia.questions.length)
        {
            message.channel.send(
                Utilities.generateQuestionEmbed('Error', 'Woah, the event ended!\nIf you think this is a mistake, please contact an Officer.')
                    .setTimestamp()
            );
        }
        else
        {
            let fullQuestion = 'Today\'s question is:\n\n' + trivia.questions[elapsedDays].question;
            let options = '';
            for(option in trivia.questions[elapsedDays].options)
            {
                if(option >= Utilities.unicodeAlphabet.length && !fullQuestion.includes('Please contact an officer.')) {
                    fullQuestion = 'There is an issue with the reactions for this ' +
                                    'question. Please contact an officer.\n\n' + fullQuestion;
                }
                options += '\n' + Utilities.unicodeAlphabet[option] + trivia.questions[elapsedDays].options[option].substring(1);
            }
            // Send the message, but only add reactions if the command was sent in a direct message.
            if(message.guild === null) {
                // Check if user has already answered the question for the day.
                let stmt = db.prepare(`SELECT * FROM responses WHERE userid=${message.author.id} AND question=${elapsedDays};`);
                let responseRow = stmt.get();
                if(responseRow !== undefined) {
                    message.channel.send(
                        Utilities.generateQuestionEmbed('Error',
                                            'It looks like you have already answered the question for day ' +
                                            (elapsedDays+1).toString() + '!\n' + 'You answered ' +
                                            Utilities.unicodeAlphabet[responseRow.response] + ' for the following question:\n\n' +
                                            trivia.questions[elapsedDays].question + options)
                            .setTimestamp()
                    );
                }
                else { // If the user hasn't answered the question for the day.
                    fullQuestion += options;
                    message.channel.send(Utilities.generateQuestionEmbed('Day ' + (elapsedDays+1).toString(), fullQuestion)).then(async sentMessage => {
                        // React to the sent message with alphabetical emojis.
                        // Using async/await forces the reactions to consistently happen in order.
                        try {
                            for(option in trivia.questions[elapsedDays].options)
                            {
                                await sentMessage.react(Utilities.unicodeAlphabet[option]);
                            }
                        } catch (error) {
                            console.error('One of the emojis failed to react.');
                        }

                        // Check if user that reacted is the original querying user in direct message.
                        const filter = (reaction, user) => {
                            return user.id === message.author.id;
                        };
                        // Get the time left for the user to answer today's question.
                        now = new Date();
                        let timeLeft = Utilities.questionInterval - ((now - (startDate)) % Utilities.questionInterval);
                        // Wait for first and only first reaction to message.
                        sentMessage.awaitReactions(filter, { max: 1, time: timeLeft, errors: ['time'] })
                        .then(collected => {
                            // Collected is a Collection (like a Map) with ONE element because max is set to one attempt
                            // This element has key: emoji (as type String) and value: Object (as type MessageReaction)
                            answerIndex = trivia.questions[elapsedDays].answer.toString().toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
                            responseIndex = Utilities.unicodeAlphabet.indexOf(collected.firstKey());

                            // If user has already responded to this question, don't process the response.
                            // This can happen here if this command is called more than once without an attempt to answer,
                            // then two messages have been sent and awaiting reactions as an answer.
                            let stmt = db.prepare(`SELECT * FROM responses WHERE userid=${message.author.id} AND question=${elapsedDays};`);
                            let responseRow = stmt.get();
                            if(responseRow !== undefined) {
                                message.channel.send(
                                    Utilities.generateQuestionEmbed('Error',
                                                        'It looks like you have already answered the question for day ' +
                                                        (elapsedDays+1).toString() + '!\n' + 'You answered ' +
                                                        Utilities.unicodeAlphabet[responseRow.response] + ' for the following question:\n\n' +
                                                        trivia.questions[elapsedDays].question + options)
                                        .setTimestamp()
                                );
                            }
                            else {
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
                                    sentMessage.channel.send('Sorry, your answer for day ' + (elapsedDays+1).toString() + ' is incorrect.');
                                }
                            }
                        })
                        .catch(collected => {
                            sentMessage.channel.send('You asked for day ' + (elapsedDays+1).toString() + '\'s question but then did\'nt answer!');
                        });
                    });
                }
            }
            else {
                message.channel.send(Utilities.generateQuestionEmbed('Day ' + (elapsedDays+1).toString(), fullQuestion + '\n\nAsk me this in a DM to answer!'));
            }
        }
	},
};