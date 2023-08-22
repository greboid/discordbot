import {BotEvent} from '../botEvent.js'
import {Events} from 'discord.js'

export default class InteractionCreate extends BotEvent {
  data = {
    type: [Events.InteractionCreate]
  }
  execute = (client, interaction) => {
    client.commands.handleCommand(interaction)
  }
}
