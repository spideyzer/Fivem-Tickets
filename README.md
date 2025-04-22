
# Discord Bot Project

This is a custom Discord bot built with Node.js and the `discord.js` library. The bot provides various features such as ticket management, custom commands, and automatic logging.

## Features

- **Ticket System**: Create and manage support, development, and report tickets with a full UI via Discord buttons.
- **Logging**: Log ticket actions (open, close, rename) into a specified channel.
- **Role-Based Permissions**: Automatically assign roles and grant permissions based on ticket type.
- **Custom Commands**: Implemented commands like `!rename` and `!stats` to manage and track tickets.

## Requirements

Before running the bot, ensure that you have the following:

- Node.js (version 16 or above)
- A Discord bot token
- A `.env` file with necessary environment variables (described below)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/discord-bot.git
cd discord-bot
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file in the root of the project and populate it with the following environment variables:

```env
TOKEN=YOUR_DISCORD_BOT_TOKEN
PANEL_CHANNEL_ID=YOUR_PANEL_CHANNEL_ID
CATEGORY_SUPPORT_ID=YOUR_SUPPORT_CATEGORY_ID
CATEGORY_DEV_ID=YOUR_DEV_CATEGORY_ID
CATEGORY_REPORT_ID=YOUR_REPORT_CATEGORY_ID
ROLE_SUPPORT_ID=YOUR_SUPPORT_ROLE_ID
ROLE_DEV_ID=YOUR_DEV_ROLE_ID
ROLE_REPORT_ID=YOUR_REPORT_ROLE_ID
LOG_CHANNEL_ID=YOUR_LOG_CHANNEL_ID
TICKET_LOG_CHANNEL_ID=YOUR_TICKET_LOG_CHANNEL_ID
```

Replace the `YOUR_*` placeholders with your actual values. 

4. Run the bot:

```bash
npm start
```

## Commands

### Ticket Commands

- **Create a Ticket**: Use the button in the designated ticket panel channel to create a ticket in the appropriate category (Support, Dev, or Report).
  
- **Close a Ticket**: Click the "Close Ticket" button in a ticket channel to close it and generate a transcript.

- **Rename Ticket Channel**: Use the `!rename <new-name>` command to rename a ticket channel. Only accessible in ticket channels.

- **Ticket Stats**: Use the `!stats` command to view the number of open tickets you have.

### Logging

All ticket actions (opening, closing, renaming) are logged into the specified log channels:
- **General Ticket Log Channel**: Logs all ticket creation and closure actions.
- **Ticket Specific Logs**: Logs individual ticket actions like opening and closing, including the transcript.

## Directory Structure

The bot's directory structure is as follows:

```
discord-bot/
│
├── commands/              # Command handlers
│   ├── tickets.js         # Ticket system logic
│   ├── welcome.js         # Welcome message command
│   ├── say.js             # Say command
│   └── vc.js              # Voice channel activity logging
│
├── index.js               # Main bot entry point
├── .env                   # Environment variables
├── package.json           # Node.js dependencies and scripts
└── README.md              # Project documentation
```

## Contributing

Contributions are welcome! If you have a feature request or bug fix, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The bot uses the `discord.js` library, which is a powerful library for interacting with the Discord API.
- Special thanks to the open-source community for their contributions to `discord.js` and other Node.js libraries!

