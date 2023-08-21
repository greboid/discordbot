import {CommandInteraction} from 'discord.js'

/**
 * @abstract
 */
export class BotApplicationCommand {

  data = {
    name: ''
  }

  /**
   * @param interaction {CommandInteraction}
   */
  execute = (interaction) => {}
}
