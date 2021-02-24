# X-days-of-code

## Getting Started

Verify that Node.js is successfully installed by running `node -v`. If Node.js is not installed, install it.

Install discord.js by running `npm install discord.js`.

Add this bot to a server. Instructions can be found [in the discord.js guide](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links). The client ID is found in the [Discord Developer Portal](https://discord.com/developers/applications) under `Applications`. It is not necessary that the bot is given any permissions when the invite link is created. In order to use all of the commands, however, it will be necessary that the bot is given an elevated role that is specified in `config.json`.

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
  "questionChannel": "general",
  "embedColor": "#2292CF",
  "leaderboardImage": "https://cdn.mstacm.org/static/acm-w.png"
}
```

## `questions.json`

The `questions.json` file for the competition should not be uploaded to this repository. It needs to be stored in the same location as this readme in order for the bot to use it properly. There is no question limit, but the contents and formatting of the file should be approved using the bot's `preview` command.

The `image` key in `questions.json` is not required for every question. If there is an image associated with a question, the value for the `image` key should be a URL of the image. The easiest way to host images is through the ACM-W's Google Photos repository. Upload all images for the competition, then open each individually and _right click -> Copy Image Location_ (not _Copy Link Location_) and put that URL in the correct place in `questions.json`. This works for _png_ and _jpg_ files. It is possible to use ACM-W's shared Google Drive to host these images, but that requires manually building the URLs which is more error-prone.

When phrasing questions in `questions.json`, keep in mind that the question's image will always appear below the question and question's options. Use the bot's `preview` command to verify that the phrasing of questions is clear with the question's images.
