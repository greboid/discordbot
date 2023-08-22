import {Collection, CommandInteraction, REST, Routes} from 'discord.js'
import {readdirSync} from 'fs'
import {BotApplicationCommand} from './BotApplicationCommand.js'

export class CommandManager {

  /**
   * @type {Map<string, BotApplicationCommand>}
   */
  commands = new Collection()

  constructor() {
  }

  callConstructor(constructor) {
    let factoryFunction = constructor.bind.apply(constructor, arguments)
    return new factoryFunction()
  }

  async init(client) {
    const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
      let {default: module} = await import(`./commands/${file}`)
      if (!module) {
        continue
      }
      let command = this.callConstructor(module)
      if (!command || !command.data.name) {
        continue
      }
      this.commands.set(command.data.name.toLowerCase(), command)
      if (command.aliases) {
        command.data.aliases.forEach(alias => this.commands.set(alias.toLowerCase(), command))
      }
    }
    await this.deployCommands(client)
    return this
  }

  /**
   * @param interaction {CommandInteraction}
   * @returns {BotApplicationCommand}
   */
  getCommand = (interaction) => {
    let command
    this.commands.forEach(loopCommand => {
      if (loopCommand.data.name === interaction.commandName) {
        command = loopCommand
      }
    })
    return command
  }

  /**
   * @param interaction {CommandInteraction}
   * @returns {Promise<void>}
   */
  handleCommand = async (interaction) => {
    let command = this.getCommand(interaction)
    await interaction.deferReply({})
    if (interaction.deferred) {
      CommandInteraction.prototype.respond = (response) => {
        interaction.editReply(response)
      }
    } else if (interaction.replied) {
      CommandInteraction.prototype.respond = (response) => {
        interaction.editReply(response)
      }
    } else {
      CommandInteraction.prototype.respond = (response) => {
        interaction.followUp(response)
      }
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
  }

  async deployCommands(client) {
    const rest = new REST()
    rest.setToken(process.env.DISCORD_TOKEN)
    const apiPath = Routes.applicationGuildCommands(process.env.DISCORD_CLIENT, process.env.DISCORD_SERVER)
    await rest.put(apiPath, {body: client.commands.commands.mapValues(value => value.data.toJSON())}).
        then(response => console.log(`Loaded: ${response.length} command(s)`)).
        catch(error => console.error(`Error loading: ${error}`))
  }
}
