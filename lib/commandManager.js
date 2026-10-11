import {Collection, MessageFlags, REST, Routes} from 'discord.js'
import {readdirSync} from 'fs'
import {BotApplicationCommand} from './botApplicationCommand.js'
import {logger} from './logger.js'

export class CommandManager {

  /**
   * @type {Collection<string, BotApplicationCommand>}
   */
  commands = new Collection()
  /**
   * @type {import('./client.js').BotClient}
   */
  client

  async init(client) {
    this.client = client
    const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
      const {default: CommandClass} = await import(`../commands/${file}`)
      if (!CommandClass) {
        logger.warn(`No default export found for command file ${file}`)
        continue
      }
      const command = new CommandClass()
      if (!command || !command.data?.name) {
        logger.warn(`Couldn't construct command class for ${file}`)
        continue
      }
      this.commands.set(command.data.name.toLowerCase(), command)
      for (const alias of command.aliases ?? []) {
        this.commands.set(alias.toLowerCase(), command)
      }
    }
    return this
  }

  /**
   * @param interaction {import('discord.js').ChatInputCommandInteraction}
   * @returns {BotApplicationCommand}
   */
  getCommand = (interaction) => {
    return this.commands.get(interaction.commandName?.toLowerCase())
  }

  /**
   * Commands reply for themselves (defer + editReply / reply). This only
   * handles lookup failures and crash recovery.
   *
   * @param interaction {import('discord.js').ChatInputCommandInteraction}
   * @returns {Promise<void>}
   */
  handleCommand = async (interaction) => {
    const command = this.getCommand(interaction)
    if (!command) {
      logger.warn(`No handler registered for command ${interaction.commandName}`)
      await interaction.reply({content: "Sorry, I don't know that command.", flags: MessageFlags.Ephemeral})
      return
    }
    try {
      await command.execute(this.client, interaction)
    } catch (error) {
      logger.error(error)
      const content = 'Sorry, seems I messed up whilst executing that.'
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply(content)
      } else if (!interaction.replied) {
        await interaction.reply({content, flags: MessageFlags.Ephemeral})
      }
    } finally {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({content: 'Oops, I forgot to reply, sorry.', flags: MessageFlags.Ephemeral})
      }
    }
  }

  async deployCommands(client, server) {
    const rest = new REST()
    rest.setToken(process.env.DISCORD_TOKEN)
    const apiPath = Routes.applicationGuildCommands(process.env.DISCORD_CLIENT, server.id)
    // Aliased entries share their command object with the canonical name, so dedupe before deploying.
    const uniqueCommands = [...new Set(this.commands.values())]
    try {
      const response = await rest.put(apiPath, {body: uniqueCommands.map(command => command.data.toJSON())})
      logger.info(`Loaded: ${response.length} command(s) onto ${server.name}`)
    } catch (error) {
      logger.error(`Error loading commands onto ${server.name}: ${error}`)
    }
  }
}
