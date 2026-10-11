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

  /** @type {Map<string, Keyv>} */
  stores = new Map()
  dbUri

  init = (path) => {
    this.dbUri = `sqlite://${path ?? 'db.sqlite3'}`
    this.settings = new Keyv(this.dbUri)
    this.settings.on('error', (error) => {
      logger.error(error)
    })
  }

  /**
   * Returns a shared namespaced store; one Keyv (and therefore one SQLite
   * connection) per namespace instead of one per call.
   *
   * @param namespace {string}
   * @returns {Keyv}
   */
  getValueStore = (namespace) => {
    if (!this.stores.has(namespace)) {
      this.stores.set(namespace, new Keyv(this.dbUri, {namespace}))
    }
    return this.stores.get(namespace)
  }
}
