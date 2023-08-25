import {BotClient} from './lib/client.js'
import {config} from 'dotenv'
import {GatewayIntentBits} from 'discord-api-types/v10'
import {CommandManager} from './lib/commandManager.js'
import {EventManager} from './lib/eventManager.js'
import {logger} from './lib/logger.js'

config()

const client = new BotClient({intents: [GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages | GatewayIntentBits.GuildMembers]})
client.init(process.env.DB_PATH)

client.commands = new CommandManager()
client.events = new EventManager()
await client.commands.init(client)
await client.events.init(client)

client.login(process.env.DISCORD_TOKEN).catch(error => logger.error(`Error logging in ${error}`))
