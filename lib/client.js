import {Client} from 'discord.js'
import {EventManager} from './eventManager.js'
import {CommandManager} from './commandManager.js'

export class BotClient extends Client {
  /** @type {CommandManager} */
  commands
  /** @type {EventManager} */
  events
}
