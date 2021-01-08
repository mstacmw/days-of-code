const fs = require('fs');
const { start } = require("../config.json");

const startDate = new Date(start); 

// Hard-coded unicode alphabet. To do this dynamically, research surrogate pairs.
// For example, the surrogate pair for unicode A is \uD83C\uDDE6.
const unicodeAlphabet = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬']

var trivia = JSON.parse(fs.readFileSync('./questions.json'));

module.exports = {
	name: 'question',
	description: 'Presents the question for the day.',
	execute(message, args) {
        now = new Date();

        // Convert difference from milliseconds to days.
        elapsedDays = Math.floor((now - startDate)/(1000*60*60*24));

        // Check if start date has occurred.
        if(now < startDate)
        {
            message.channel.send('Woah, the event hasn\'t started yet!\n\Check back after ' + 
                            startDate.toLocaleDateString('en-US', 
                            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric' }) + '.');
        } // Check if all questions have been cycled through
        else if(elapsedDays > trivia.questions.length)
        {
            message.channel.send('Woah, the event ended!\nIf you think this is a mistake, please contact an Officer.');
        }
        else // Fetch the question for the day. Indexing is based off of the number of whole days since the start date.
        {
            str = 'The question for today is:\n' + trivia.questions[elapsedDays].question;
            for(option in trivia.questions[elapsedDays].options)
            {
                str += '\n' + trivia.questions[elapsedDays].options[option]
            }
            message.channel.send(str).then(async sentMessage => {
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
            });
        }
	},
};