const { prefix } = require('../config.json');

module.exports = {
	name: 'ping',
	elevated: true,
	usage: prefix + 'ping',
	brief: 'Ping!',
	description: 'Ping!',
	execute(message, args, db) {
		message.channel.send('Pong.');
	},
};