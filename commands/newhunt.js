import {channelMention, ChannelType, EmbedBuilder, SlashCommandBuilder, userMention} from 'discord.js'
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
          setRequired(true))

  /**
   * @param client {import('./client.js').BotClient}
   * @param interaction {ChatInputCommandInteraction}
   * @return {Promise<void>}
   */
  execute = async (client, interaction) => {
    if (interaction.channel.id !== process.env.PUZZLES_CHANNEL) {
      await interaction.respond({content: 'This command cannot be used here', ephemeral: true})
      return
    }
    if (!interaction.channel.isTextBased) {
      await interaction.respond({content: 'This must be a text based channel', ephemeral: true})
    }
    const huntName = interaction.options.getString('name')
    /** @type {GuildTextBasedChannmel} */
    const channel = interaction.channel
    try {
      let thread = await channel.threads.create({
        name: huntName,
        type: ChannelType.PrivateThread,
      })
      await thread.join()
      await interaction.respond({content: 'Hunt created', ephemeral: true})
      let msg = await thread.send({content: 'Creating hunt Docs'})
      const embed = await createDocs(huntName)
      msg = await msg.edit({content: '', embeds: [embed]})
      msg.pin()
      await thread.send({content: `${userMention(process.env.PUZZLES_BOT)} - You're needed in here please!`})
    } catch (error) {
      interaction.respond({content: `Unable to create docs: ${error}`})
    }
  }
}

const createDocs = async (huntName) => {
  const [sheet, jamboard] = await createHuntFilesAndGetLink(process.env.DRIVE_PARENT_FOLDER,
      process.env.DRIVE_TEMPLATE_DOC, huntName)
  return new EmbedBuilder().
      setTitle('Hunt docs').
      setDescription(` - [Sheet](${sheet}})\n- [Jamboard](${jamboard})`).
      setColor('#a51d2d').
      setFooter({text: 'Good luck!'})
}
