import {
  ChannelType,
  InteractionContextType,
  MessageFlags,
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
      setContexts(InteractionContextType.Guild)

  /**
   * @param client {import('../lib/client.js').BotClient}
   * @param interaction {import('discord.js').ChatInputCommandInteraction}
   * @return {Promise<void>}
   */
  execute = async (client, interaction) => {
    await interaction.deferReply({flags: MessageFlags.Ephemeral})
    try {
      await interaction.editReply({content: 'Creating game channel, bear with me'})
      const gameName = interaction.options.getString('name')
      const role = await getOrCreateRole(interaction.guild, gameName)
      if (!role) {
        await interaction.editReply({content: "Can't find or create role, stopping"})
        return
      }
      const channel = interaction.guild.channels.cache.find(
          channel => channel.name === gameName && channel.parent?.id === process.env.GAMECHAN_CATEGORY)
      if (channel) {
        await interaction.editReply({content: 'Channel already exists, stopping'})
        return
      }
      const permissionOverwrites = [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        }, {
          id: role.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        }, {
          id: client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ManageRoles,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ]
      await interaction.guild.channels.create({
        name: gameName,
        parent: process.env.GAMECHAN_CATEGORY,
        type: ChannelType.GuildText,
        permissionOverwrites,
      })
      await interaction.editReply({content: 'Channel created'})
    } catch (error) {
      logger.error(`Error creating game channel : ${error}`)
      await interaction.editReply({content: 'There was an error creating the game role and channel'})
    }
  }
}
