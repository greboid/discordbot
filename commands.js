import {Collection} from 'discord.js'
import newHuntCommand from './commands/newhuntdocs.js'
import newGameChannelCommand from './commands/newgamechannel.js'

const commandCollection = new Collection()

commandCollection.set(newHuntCommand.data.name, newHuntCommand)
commandCollection.set(newGameChannelCommand.data.name, newGameChannelCommand)

export default commandCollection
