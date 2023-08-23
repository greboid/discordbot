import {ChannelType, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder} from 'discord.js'
import {getOrCreateRole} from '../lib/roles.js'

export default class NewGameChannel {
  data = new SlashCommandBuilder().setName('newgamechannel').
      setDescription('Creates a new game channel and associated permissions').
      addStringOption(option => option.
          setName('name').
          setDescription('The name of the game').
          setRequired(true)).
      setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).
      setDMPermission(false)

  execute = async (interaction) => {
    try {
      //Defer response
      await interaction.respond({content: 'Creating game channel, bear with me', ephemeral: true})
      //Get entered name, fail if not provided
      const gameName = interaction.options.getString('name')
      let role = await getOrCreateRole(interaction.guild, gameName)
      let channel = await interaction.guild.channels.cache.find(channel => channel.name === gameName && channel.parent?.id === process.env.GAMECHAN_CATEGORY)
      if (channel) {
        await interaction.respond('Channel already exists, stopping')
        return
      }
      await interaction.guild.channels.create({
        name: gameName,
        parent: process.env.GAMECHAN_CATEGORY,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          }, {
            id: role.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          }],
      })
      await interaction.respond('Channel created')
    } catch (error) {
      console.error(`Error creating game channel : ${error}`)
      interaction.respond("There was an error creating the game role and channel")
    }
  }
}
