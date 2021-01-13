const Discord = require('discord.js');
const fs = require('fs');
const { prefix, token } = require('./config.json');
const Database = require('better-sqlite3');

const client = new Discord.Client();
client.commands = new Discord.Collection();

// Open database (create if it does not exist).
const db = new Database('responses.db', { /*verbose: console.log*/ });

// Create tables if they do not exist.
stmt = db.prepare('CREATE TABLE IF NOT EXISTS \n' +
                      'responses(userid VARCHAR NOT NULL, \n' +
                      'question INTEGER NOT NULL, \n' +
                      'response CHAR NOT NULL, \n' +
                      'PRIMARY KEY (userid, question));');
let info = stmt.run();
console.log('[DB] ' + info.changes + ' changes made to responses table.');
stmt = db.prepare('CREATE TABLE IF NOT EXISTS \n' +
                  'scores(userid VARCHAR PRIMARY KEY NOT NULL, \n' +
                  'score INTEGER NOT NULL DEFAULT 0);');
info = stmt.run();
console.log('[DB] ' + info.changes + ' changes made to scores table.');
stmt = db.prepare('CREATE TABLE IF NOT EXISTS \n' +
                  'usernames(userid VARCHAR PRIMARY KEY NOT NULL, \n' +
                  'name VARCHAR(32) NOT NULL);');
info = stmt.run();
console.log('[DB] ' + info.changes + ' changes made to usernames table.');

client.once('ready', () => {
  console.log('Ready!');
});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

  // Set a new item in the Collection with the key as the 
  // command name and the value as the exported module.
	client.commands.set(command.name, command);
}

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Grab the command and args from the command.
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;

  try {
    client.commands.get(command).execute(message, args, db);
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!\nPlease contact an officer.');
  }
});

client.login(token);
