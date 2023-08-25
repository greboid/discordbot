import {BotEvent} from '../lib/botEvent.js'
import {Events} from 'discord.js'
import {logger} from '../lib/logger.js'

export default class ClientReady extends BotEvent {
  data = {
    type: [Events.ClientReady]
  }
  execute = (client, ... args) => {
    logger.info(`Connected to Discord`)
  }
}
