import {Events} from 'discord.js'
import {BotEvent} from '../lib/botEvent.js'

export default class GuildCreated extends BotEvent {
  data = {
    type: [Events.GuildCreate]
  }
  execute = async (client, guild) => {
    await client.commands.deployCommands(client, guild)
  }
}
