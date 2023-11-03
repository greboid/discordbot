import {
  ChannelType,
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js'
import {getOrCreateRole} from '../lib/roles.js'
import {logger} from '../lib/logger.js'

export default class NewGameChannel {
  data = new SlashCommandBuilder().setName('newgamechannel').
      setDescription('Creates a new game channel and associated permissions').
      addStringOption(option => option.
          setName('name').
          setDescription('The name of the game').
          setRequired(true)).
      setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).
      setDMPermission(false)

  /**
   * @param client {import('./client.js').BotClient}
   * @param interaction {import('discord.js').ChatInputCommandInteraction}
   * @return {Promise<void>}
   */
  execute = async (client, interaction) => {
    try {
      await interaction.respond({content: 'Creating game channel, bear with me', ephemeral: true})
      const gameName = interaction.options.getString('name')
      let role = await getOrCreateRole(interaction.guild, gameName)
      if (!role) {
        await interaction.respond(`Can't find or create role, stopping`)
        return
      }
      let channel = await interaction.guild.channels.cache.find(
          channel => channel.name === gameName && channel.parent?.id === process.env.GAMECHAN_CATEGORY)
      if (channel) {
        await interaction.respond('Channel already exists, stopping')
        return
      }
      const roles = [
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel],
        }, {
          id: role.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        }, {
          id: interaction.guild.roles.botRoleFor(client.user.id).id,
          allow: [PermissionsBitField.Flags.ViewChannel | PermissionsBitField.Flags.ManageRoles | PermissionsBitField.Flags.SendMessages],
        },
      ]
      await interaction.guild.channels.create({
        name: gameName,
        parent: process.env.GAMECHAN_CATEGORY,
        type: ChannelType.GuildText,
        permissionOverwrites: roles,
      })
      await interaction.respond('Channel created')
    } catch (error) {
      logger.error(`Error creating game channel : ${error}`)
      interaction.respond('There was an error creating the game role and channel')
    }
  }
}
