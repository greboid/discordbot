import {BotEvent} from '../lib/botEvent.js'
import {Events} from 'discord.js'
import {logger} from '../lib/logger.js'

export default class ClientReady extends BotEvent {
  data = {
    type: [Events.ClientReady]
  }
  execute = async (client, ... args) => {
    for (const guild of Array.from(await client.guilds.cache.values())) {
      await client.commands.deployCommands(client, guild)
    }
    logger.info(`Connected to Discord`)
  }
}
