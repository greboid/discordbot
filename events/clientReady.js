import {BotEvent} from '../lib/botEvent.js'
import {Events} from 'discord.js'

export default class ClientReady extends BotEvent {
  data = {
    type: [Events.ClientReady]
  }
  execute = (client, ... args) => {
    console.log(`Connected to Discord`)
  }
}
