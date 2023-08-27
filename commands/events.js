import {SlashCommandBuilder} from 'discord.js'

export default class NewGameChannel {
  data = new SlashCommandBuilder()
      .setName('events')
      .setDescription('Manage events')
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
   * @param client {import('./client.js').BotClient}
   * @param interaction {import('discord.js').ChatInputCommandInteraction}
   * @return {Promise<void>}
   */
  execute = async (client, interaction) => {
    switch (interaction.options.getSubcommand()) {
      case 'create':
        interaction.respond({content: `This would create: ${interaction.options.getString('name')}`, ephemeral: true})
        break
      case 'list':
        interaction.respond({content: `Some events would be listed`, ephemeral: true})
        break
    }
  }
}
