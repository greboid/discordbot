import {Client, Events} from 'discord.js'
import {config} from 'dotenv'
import {GatewayIntentBits} from 'discord-api-types/v10'
import Commands from './commands.js'

config()
const client = new Client({intents: [GatewayIntentBits.Guilds]})
client.once(Events.ClientReady, c => {
  console.log(`Connected to Discord`)
})
client.commands = Commands

client.on(Events.InteractionCreate, async interaction => {
  const command = client.commands.get(interaction.commandName)
  if (!command) {
    console.error(`Unable to find command ${interaction.commandName}}`)
    return
  }
  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply({content: 'Sorry, seems I messed up whilst executing that.', ephemeral: true})
    } else {
      await interaction.editReply('Sorry, seems I messed up whilst executing that.')
    }
  } finally {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply({content: 'Oops, I forgot to reply, sorry.', ephemeral: true})
    }
  }
})

client.login(process.env.DISCORD_TOKEN).
    catch(error => console.log(`Error logging in ${error}`))
