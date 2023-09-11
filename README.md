# Discord Bot

## Functions
- Logs role changes
- Creates game channels in a category with roles and an onboarding selector
- Creates threads in a puzzle hunt channel and creates some Google Drive documents for the hunt

## Config
  - .env
  - environment variables

## Config Options

| **Base Settings**    | **Description**                   |
|----------------------|-----------------------------------|
| DISCORD_TOKEN        | Bot Token                         |
| DISCORD_CLIENT       | Bot client ID                     |
| DB_PATH              | File path for the sqlite database |
| SESSION_SECRET       | Session secret                    |
|                      |                                   |
| **Game Channels**    | **Description**                   |
|                      |                                   |
| GAMECHAN_CATEGORY    | Games category                    |
|                      |                                   |
| **Puzzle Hunt**      | **Description**                   |
| PUZZLES_CHANNEL      | Puzzles channel snowflake         |
| PUZZLES_BOT          | Puzzles bot snowflake             |
| DRIVE_PARENT_FOLDER  | Hunts folder ID                   |
| DRIVE_TEMPLATE_DOC   | Spreadsheet template ID           |
|                      |                                   |
| **Log role changes** | **Description**                   |
| LOG_CHANNEL          | Log channel snowflake             |
|                      |                                   |
| **Event Management** | **Description**                   |
| EVENTS_CHANNEL       | Events channel snowflake          |
