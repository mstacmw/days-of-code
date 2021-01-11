const Discord = require('discord.js');
const topToDisplay = 3;

module.exports = {
	name: 'leaderboard',
	description: 'Displays the leaderboard. The highest ' + topToDisplay.toString() + ' scores are displayed.',
	execute(message, args, db) {
        stmt = db.prepare('SELECT * FROM scores;');
        rows = stmt.all();
        // Sort entries in ascending order by score.
        rows.sort((a, b) => (a.score < b.score) ? 1 : -1);

        // Check if there is any data to present on the leaderboard.
        if(rows.length < 1) {
            message.channel.send('No participants yet!');
        }
        else {
            let usernames = '';
            let scores = '';

            // Find the top three scores including ties.
            let place = 1;
            let placeScore = rows[0].score; // first score to send
            let index = 0;
            while(index < rows.length && place <= topToDisplay) {
                // Grab all scores for the current place.
                while(index < rows.length && rows[index].score === placeScore) {
                    // Retrieve username from database to display with score.
                    let stmt = db.prepare(`SELECT name FROM usernames WHERE userid=${rows[index].userid};`);
                    usernames += stmt.get().name.toString() + '\n';
                    scores += rows[index].score.toString() + '\n';
                    index += 1;
                }
                place += 1;
                if(index < rows.length) {
                    placeScore = rows[index].score;
                }
            }
            message.channel.send(new Discord.MessageEmbed()
                .setColor('#2292CF')
                .setTitle('Top ' + topToDisplay + ' Scores')
                .setThumbnail('https://i.imgur.com/wSTFkRM.png')
                .addFields(
                    { name: 'Username', value: usernames, inline: true },
                    { name: 'Score', value: scores, inline: true }
                )
                .setTimestamp()
            );
        }
	},
};