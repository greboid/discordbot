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
  /** @type Role */
  let role
  //Try to get existing role
  role = await guild.roles.cache.find(role => role.name === roleName)
  if (role) {
    return role
  }
  //Try to create role
  role = await guild.roles.create({name: roleName, permissionOverwrites: []})
  if (role) {
    return role
  }
  //Can't find existing role, or create new one
  return null
}
