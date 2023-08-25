import {Collection} from 'discord.js'
import {readdirSync} from 'fs'
import {BotEvent} from './botEvent.js'
import {logger} from './logger.js'

export class EventManager {

  constructor() {
  }

  callConstructor(constructor) {
    let factoryFunction = constructor.bind.apply(constructor, arguments)
    return new factoryFunction()
  }

  async init(client) {
    const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'))
    for (const file of eventFiles) {
      let {default: module} = await import(`../events/${file}`)
      if (!module) {
        logger.error("Couldn't load event module", file)
        continue
      }
      let event = this.callConstructor(module)
      if (!event || !event.data.type) {
        logger.error("Couldn't construct event class", file, event)
        continue
      }
      for(const type of event.data.type) {
        logger.info(`Registering event handler ${type} for ${file}`)
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
