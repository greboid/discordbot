import {Client} from 'discord.js'
import {EventManager} from './eventManager.js'
import {CommandManager} from './commandManager.js'
import Keyv from 'keyv'
import {logger} from './logger.js'

export class BotClient extends Client {
  /**
   * @type {Keyv<any, typeof Record<String, any>>}
   */
  settings
  /** @type {CommandManager} */
  commands
  /** @type {EventManager} */
  events

  init = (path) => {
    this.settings = new Keyv(`sqlite://${path ?? "db.sqlite3"}`)
    this.settings.on('error', (error) => {
      logger.error(error)
    });
  }

  /**
   *
   * @param namespace
   */
  getValueStore = (namespace) => {
    logger.debug(this.settings.opts.uri)
    return new Keyv(this.settings.opts.uri, {namespace: namespace})
  }
}
