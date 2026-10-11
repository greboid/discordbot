# Discord Bot

## Functions
- Logs role changes
- Creates game channels in a category with roles and an onboarding selector
- Creates threads in a puzzle hunt channel and creates some Google Drive documents for the hunt

## Config
  - .env
  - environment variables

## Intents
The `GuildMembers` intent is privileged and must be enabled for the bot in the
[Discord developer portal](https://discord.com/developers/applications) or
login will fail.

## Web UI
The web UI requires Discord OAuth login. Create an OAuth2 application in the
Discord developer portal with a redirect URI of `<WEB_URL>/callback`.

## Config Options

| **Base Settings**        | **Description**                          |
|--------------------------|------------------------------------------|
| DISCORD_TOKEN            | Bot Token                                |
| DISCORD_CLIENT           | Bot client ID                            |
| DISCORD_CLIENT_SECRET    | Bot OAuth client secret                  |
| DB_PATH                  | File path for the sqlite database        |
| SESSION_SECRET           | Session secret (required for web UI)     |
| WEB_URL                  | Public base URL of the web UI            |
| WEB_PORT                 | Port for the web UI                      |
|                          |                                          |
| **Game Channels**        | **Description**                          |
|                          |                                          |
| GAMECHAN_CATEGORY        | Games category                           |
|                          |                                          |
| **Puzzle Hunt**          | **Description**                          |
|                          |                                          |
| PUZZLES_CHANNEL          | Puzzles channel snowflake                |
| PUZZLES_BOT              | Puzzles bot snowflake                    |
| DRIVE_PARENT_FOLDER      | Hunts folder ID                          |
| DRIVE_TEMPLATE_DOC       | Spreadsheet template ID                  |
|                          |                                          |
| **Log role changes**     | **Description**                          |
| LOG_CHANNEL              | Log channel snowflake                    |
|                          |                                          |
| **Event Management**     | **Description**                          |
| EVENTS_CHANNEL           | Events channel snowflake                 |
