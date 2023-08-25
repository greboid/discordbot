import {Events} from 'discord.js'

/**
 * @abstract
 */
export class BotEvent {

  /**
   * @type {{once: boolean, type: Events[]}}
   */
  data = {
    /** @type {Events[]} */
    type: null,
    once: true,
  }

  /**
   * @param client {import('discord.js').BotClient}
   * @param args {any[]}
   */
  execute = async (client, ...args) => {}
}
