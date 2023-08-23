import {SlashCommandBuilder} from 'discord.js'
import {createHuntFilesAndGetLink} from '../lib/googledocs.js'

export default class NewHuntDocs {
  data = new SlashCommandBuilder().setName('newhuntdocs').
      setDescription('Creates a new set of puzzle hunt documents in google drive').
      addStringOption(option => option.
          setName('name').
          setDescription('The name of the new hunt being started').
          setRequired(true))
  execute = async (interaction) => {
    //TODO some kind of permissions check....
    await interaction.respond({content: 'Creating docs, bear with me', ephemeral: true})
    try {
      const huntName = interaction.options.getString('name')
      let urls = await createHuntFilesAndGetLink(process.env.DRIVE_PARENT_FOLDER, process.env.DRIVE_TEMPLATE_DOC,
          huntName)
      const jamboard = urls.find(value => value.includes('jamboard.google.com'))
      const sheet = urls.find(value => value.includes('docs.google.com'))
      await interaction.respond(
          {content: `Hunt files created [Sheet](${sheet}) [Jamboard](${jamboard})`, ephemeral: false})
    } catch (error) {
      interaction.respond({content: `Unable to create docs: ${error}`})
    }
  }
}
