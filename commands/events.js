import {InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder} from 'discord.js'

export default class EventsCommand {
  data = new SlashCommandBuilder()
      .setName('events')
      .setDescription('Manage events')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
      .setContexts(InteractionContextType.Guild)
      .addSubcommand(subCommand =>
                         subCommand.setName('create')
                                   .setDescription('Creates a new event')
                                   .addStringOption(option =>
                                                        option.setName('name')
                                                              .setDescription('Name of the event')
                                                              .setMaxLength(25)
                                                              .setRequired(true),
                                   ),
      )
      .addSubcommand(subCommand =>
                         subCommand.setName('list')
                                   .setDescription('List existing events'),
      )

  /**
   * @param client {import('../lib/client.js').BotClient}
   * @param interaction {import('discord.js').ChatInputCommandInteraction}
   * @return {Promise<void>}
   */
  execute = async (client, interaction) => {
    await interaction.deferReply({flags: MessageFlags.Ephemeral})
    switch (interaction.options.getSubcommand()) {
      case 'create':
        await interaction.editReply({content: `This would create: ${interaction.options.getString('name')}`})
        break
      case 'list':
        await interaction.editReply({content: 'Some events would be listed'})
        break
    }
  }
}
