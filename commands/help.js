const Discord = require('discord.js');
const { adminChannel, embedColor, prefix } = require('../config.json');

module.exports = {
    name: 'help',
    elevated: false,
    usage: prefix + 'help [command]',
    brief: 'Lists all of my commands or info about a specific command.',
	description: 'Lists all of my commands or info about a specific command. \n`command` is an optional argument to see a more detailed description about the command.',
	execute(message, args) {
        const { commands } = message.client;
        let embed = new Discord.MessageEmbed()
                .setColor(embedColor);
        let inElevatedChannel = (message.client.channels.cache.find(channel => channel.name === adminChannel).id === message.channel.id);

        // If no command is specified, display description for all commands.
        if (!args.length) {
            let description = '';

            // Get and show commands in alphabetical order.
            for(command of commands.array()) {
                // Only include elevated commands if this command was used in the admin channel.
                if(inElevatedChannel || !command.elevated) {
                    description += '\n\n**' + prefix + command.name + '**\n' +
                                    (command.elevated ? '[ELEVATED] ': '') + command.brief;
                }
            }

            // Format and send help for all commands.
            message.channel.send(
                embed.setDescription('Here\'s a list of all my commands' + (inElevatedChannel ? ', including elevated commands available for use in this channel only' : '') + ':' + description)
            );   
        }
        else {
            // Display information for specified command.
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

            // Check if command exists.
            if (!command) {
                return message.reply('that\'s not a valid command!\nUse `' + prefix + 'help` to see all of my commands.');
            }
            else if(!inElevatedChannel && command.elevated) {
                // Do not provide help for elevated commands outside of the admin channel.
                return message.reply('that command requires elevated permissions!');
            }

            // Format and send the command's help.
            message.channel.send(
                embed.addField('Usage', command.usage, false)
                    .addField('Description', (command.elevated ? '*Must be used in #' + adminChannel + ' channel only.*\n' : '') + command.description, false)
            );
        }

	},
};