import {BotEvent} from '../lib/botEvent.js';
import {Events} from 'discord.js'
import {logger} from '../lib/logger.js'

export default class LogRoleChanges extends BotEvent {
    data = {
        type: [Events.GuildMemberUpdate]
    }
    execute = (client, oldMember, newMember) => {
        const removedRoles = oldMember.roles.cache.
                filter(role => !newMember.roles.cache.has(role.id)).
                map(r => `removed \`${r.name}\``)
        const addedRoles = newMember.roles.cache.
                filter(role => !oldMember.roles.cache.has(role.id)).
                map(r => `added \`${r.name}\``)
        const changedRoles = removedRoles.concat(addedRoles)

        if (changedRoles.length > 0) {
            client.channels.
                    fetch(process.env.LOG_CHANNEL).
                    then(channel => channel.send(`Roles changed for \`@${newMember.user.username}\`: ${changedRoles.join(" ")}`)).
                    catch(e => logger.error("Failed to log role changes", e))
        }
    }
}