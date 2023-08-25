import {EmbedBuilder, SlashCommandBuilder, SnowflakeUtil} from 'discord.js'
import {createHuntFilesAndGetLink} from '../lib/googledocs.js'
import {logger} from '../lib/logger.js'

/**
 * @typedef {import('discord.js').ChatInputCommandInteraction} ChatInputCommandInteraction
 */

export default class NewHuntDocs {
  data = new SlashCommandBuilder().setName('newhuntdocs').
      setDescription('Creates a new set of puzzle hunt documents in google drive').
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
      await interaction.respond({content: "This command cannot be used here", ephemeral: true})
      return
    }
    //TODO some kind of permissions check....
    await interaction.respond({content: 'Creating docs, bear with me', ephemeral: true})
    try {
      const huntName = interaction.options.getString('name')
      let urls = await createHuntFilesAndGetLink(process.env.DRIVE_PARENT_FOLDER,
          process.env.DRIVE_TEMPLATE_DOC, huntName)
      const jamboard = urls.find(value => value.includes('jamboard.google.com'))
      const sheet = urls.find(value => value.includes('docs.google.com'))
      const embed = new EmbedBuilder().
          setTitle('Hunt docs').
          setDescription(` - [Sheet](${sheet}})\n- [Jamboard](${jamboard})`).
          setColor('#a51d2d').
          setFooter({text: "Good luck!",})
      await interaction.respond({content: "", embeds: [embed]}).then(
          /** @type {import('discord.js').Message} */
          async message => {
            await message.pin()
          },
      ).catch(error => logger.error(error))
    } catch (error) {
      interaction.respond({content: `Unable to create docs: ${error}`})
    }
  }
}
