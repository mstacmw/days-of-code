# X-days-of-code

## Getting Started

Verify that Node.js is successfully installed by running `node -v`. If Node.js is not installed, install it.

Install discord.js by running `npm install discord.js`.

Add this bot to a server. Instructions can be found [in the discord.js guide](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links). It is not necessary that the bot is given any permissions when the invite link is created. In order to use all of the commands, however, it will be necessary that the bot is given an elevated role that is specified in `config.json`.

When first cloning the repository, run `npm install` to install the required dependencies.

To start the bot, run `npm start`.

## `config.json`

You need to create your own `config.json` file. It should be in the following format:

```json
{
  "prefix": "<prefix>",
  "token": "<token>",
  "start": "<start date>",
  "adminRole": "Officers",
  "adminChannel": "officers",
  "embedColor": "#2292CF"
}
```
