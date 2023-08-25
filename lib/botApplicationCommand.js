import {CommandInteraction} from 'discord.js'

/**
 * @abstract
 */
export class BotApplicationCommand {

  data = {
    name: ''
  }

  /**
   * @param client {import('./client.js').BotClient}
   * @param interaction {CommandInteraction}
   */
  execute = (client, interaction) => {}
}
