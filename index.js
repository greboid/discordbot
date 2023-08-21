import {Client, Events, REST, Routes} from 'discord.js'
import {config} from 'dotenv'
import {GatewayIntentBits} from 'discord-api-types/v10'
import {Commands} from './commands.js'

config()

const client = new Client({intents: [GatewayIntentBits.Guilds]})
client.commands = await new Commands().init()

client.once(Events.ClientReady, c => {
  console.log(`Connected to Discord`)
})

client.on(Events.InteractionCreate, async interaction => {
  await client.commands.handleCommand(interaction)
})

const rest = new REST()
rest.setToken(process.env.DISCORD_TOKEN)
const apiPath = Routes.applicationGuildCommands(process.env.DISCORD_CLIENT, process.env.DISCORD_SERVER)
await rest.put(apiPath, {body: client.commands.commands.mapValues(value => value.data.toJSON())}).
    then(response => console.log(`Loaded: ${response.length} command(s)`)).
    catch(error => console.error(`Error loading: ${error}`))

client.login(process.env.DISCORD_TOKEN).
    catch(error => console.log(`Error logging in ${error}`))
