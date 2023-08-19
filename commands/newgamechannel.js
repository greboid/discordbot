import {ChannelType, PermissionsBitField, SlashCommandBuilder} from 'discord.js'

export default {
  data: new SlashCommandBuilder().setName('newgamechannel').
      setDescription('Creates a new game channel and associated permissions').
      addStringOption(option => option.
          setName('name').
          setDescription('The name of the game').
          setRequired(true)), async execute(interaction) {
    await interaction.reply({content: 'Creating game channel, bear with me', ephemeral: true})
    const gameName = interaction.options.getString('name')
    if (!gameName) {
      await interaction.editReply('Name not provided')
      return
    }
    let role = await interaction.guild.roles.cache.
        find(role => role.name === gameName)
    if (!role) {
      role = await interaction.guild.roles.create({
        name: gameName, permissionOverwrites: [],
      })
    }
    if (!role) {
      await interaction.editReply('Unable to get or create role')
      return
    }
    let channel = await interaction.guild.channels.cache.
        find(channel => channel.name === gameName && channel.parent?.id === process.env.GAMECHAN_CATEGORY)
    if (channel) {
      await interaction.editReply('Channel already exists, stopping')
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
    await interaction.editReply('Channel created')
  },
}
