import {
  ChannelType,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
  userMention,
} from 'discord.js'
import {createHuntFilesAndGetLink} from '../lib/googledocs.js'
import {logger} from '../lib/logger.js'

/**
 * @typedef {import('discord.js').ChatInputCommandInteraction} ChatInputCommandInteraction
 * @typedef {import('discord.js').GuildTextBasedChannel} GuildTextBasedChannmel
 * @typedef {import('discord.js').Message} Message
 */

export default class NewHuntDocs {
  data = new SlashCommandBuilder().setName('newhunt').
      setDescription('Creates a new set puzzle hunt thread and documents in google drive').
      addStringOption(option => option.
          setName('name').
          setDescription('The name of the new hunt being started').
          setRequired(true)).
      setContexts(InteractionContextType.Guild)

  /**
   * @param client {import('../lib/client.js').BotClient}
   * @param interaction {ChatInputCommandInteraction}
   * @return {Promise<void>}
   */
  execute = async (client, interaction) => {
    const puzzlesChannel = await interaction.guild.channels.fetch(process.env.PUZZLES_CHANNEL).catch(() => null)
    if (!puzzlesChannel || !puzzlesChannel.isTextBased()) {
      await interaction.reply({content: 'Unable to find the puzzles channel', flags: MessageFlags.Ephemeral})
      return
    }
    if (!puzzlesChannel.permissionsFor(interaction.member).has(PermissionsBitField.Flags.ViewChannel)) {
      await interaction.reply({content: 'You do not have access to the puzzles channel', flags: MessageFlags.Ephemeral})
      return
    }
    await interaction.deferReply({flags: MessageFlags.Ephemeral})
    const huntName = interaction.options.getString('name')
    try {
      const thread = await puzzlesChannel.threads.create({
        name: huntName,
        type: ChannelType.PrivateThread,
      })
      await thread.join()
      await interaction.editReply({content: 'Hunt created'})
      let msg = await thread.send({content: 'Creating hunt Docs'})
      const embed = await createDocs(huntName)
      msg = await msg.edit({content: '', embeds: [embed]})
      try {
        await msg.pin()
      } catch (pinError) {
        logger.error(`Unable to pin hunt message: ${pinError}`)
      }
      await thread.send({content: `${userMention(process.env.PUZZLES_BOT)} - You're needed in here please!`})
    } catch (error) {
      logger.error(`Unable to create hunt docs ${error}`)
      await interaction.editReply({content: 'Unable to create docs'})
    }
  }
}

const createDocs = async (huntName) => {
  const sheet = await createHuntFilesAndGetLink(process.env.DRIVE_PARENT_FOLDER,
      process.env.DRIVE_TEMPLATE_DOC, huntName)
  return new EmbedBuilder().
      setTitle('Hunt docs').
      setDescription(` - [Sheet](${sheet})`).
      setColor('#a51d2d').
      setFooter({text: 'Good luck!'})
}
