import {BotEvent} from '../lib/botEvent.js'
import {Events} from 'discord.js'
import {logger} from '../lib/logger.js'

export default class ClientReady extends BotEvent {
  data = {
    type: [Events.ClientReady],
    once: true,
  }
  execute = async (client) => {
    for (const guild of client.guilds.cache.values()) {
      await client.commands.deployCommands(client, guild)
    }
    logger.info('Connected to Discord')
  }
}
