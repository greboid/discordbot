import {Collection} from 'discord.js'
import {readdirSync} from 'fs'
import {BotEvent} from './botEvent.js'

export class EventManager {

  /**
   * @type {Map<string, BotEvent>}
   */
  events = new Collection()

  constructor() {
  }

  callConstructor(constructor) {
    let factoryFunction = constructor.bind.apply(constructor, arguments)
    return new factoryFunction()
  }

  async init(client) {
    const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'))
    for (const file of eventFiles) {
      let {default: module} = await import(`./events/${file}`)
      if (!module) {
        continue
      }
      let event = this.callConstructor(module)
      if (!event || !event.data.type) {
        continue
      }
      for(const type of event.data.type) {
        if (event.data.once) {
          client.once(type, (...args) => event.execute(client, ...args))
        } else {
          client.on(type, (...args) => event.execute(client, ...args))
        }
      }
    }
    return this
  }
}
