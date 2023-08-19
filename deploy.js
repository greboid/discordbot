import {REST, Routes} from 'discord.js'
import {config} from 'dotenv'
import commandCollection from './commands.js'

config()

const commands = commandCollection
const rest = new REST()
rest.setToken(process.env.DISCORD_TOKEN)
const apiPath = Routes.applicationGuildCommands(process.env.DISCORD_CLIENT, process.env.DISCORD_SERVER)
rest.put(apiPath, {body: commands.mapValues(value => value.data.toJSON())}).
    then(response => console.log(`Loaded: ${response.length} command(s)`)).
    catch(error => console.error(`Error loading: ${error}`))
