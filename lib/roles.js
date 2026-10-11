import {logger} from './logger.js'

/**
 * @typedef {import('discord.js').Guild} Guild
 * @typedef {import('discord.js').Role} Role
 *
 * @param  {Guild} guild Guild role being created in
 * @param  {string} roleName Name of role being created
 *
 * @return {Promise<Role | null>} Role or null
 */
export const getOrCreateRole = async (guild, roleName) => {
  const existingRole = guild.roles.cache.find(role => role.name === roleName)
  if (existingRole) {
    return existingRole
  }
  try {
    return await guild.roles.create({name: roleName, permissions: []})
  } catch (error) {
    logger.error(`Unable to create role ${roleName}: ${error}`)
    return null
  }
}
