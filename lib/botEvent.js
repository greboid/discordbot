import {Events} from 'discord.js'
import {BotClient} from './client.js'

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
   * @param client {BotClient}
   * @param args {any[]}
   */
  execute = (client, ...args) => {}
}
