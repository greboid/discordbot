import {SlashCommandBuilder} from 'discord.js'
import {DateTime} from 'luxon'
import {google} from 'googleapis'
import {drive} from '@googleapis/drive'
import {join, resolve} from 'path'

export default class NewHuntDocs {
  createDriveClient = () => {
    const auth = new google.auth.GoogleAuth({
      keyFile: join(resolve(''), 'google.json'),
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.file',
      ],
    })
    return drive({version: 'v3', auth})
  }
  data = new SlashCommandBuilder().setName('newhuntdocs').
      setDescription('Creates a new set of puzzle hunt documents in google drive').
      addStringOption(option => option.
          setName('name').
          setDescription('The name of the new hunt being started').
          setRequired(true))
  execute = async (interaction) => {
    await interaction.respond({content: 'Creating docs, bear with me', ephemeral: true})
    const huntName = interaction.options.getString('name')
    if (!huntName) {
      await interaction.respond('Name not provided')
      return
    }
    let client = await this.createDriveClient()
    let folderID = await client.files.create({
      requestBody: {
        name: `${DateTime.now().toFormat('yyyy-LL')}-${huntName}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.DRIVE_PARENT_FOLDER],
      },
    }).then(resp => {
      return resp.data.id
    }).catch(error => {
      console.error(error)
      return null
    })
    if (!folderID) {
      await interaction.respond('Error creating folder')
      return
    }
    let fileID = await client.files.copy({
      fileId: process.env.DRIVE_TEMPLATE_DOC,
      requestBody: {
        name: huntName,
        parents: [folderID],
      },
    }).then(resp => {
      return resp.data.id
    }).catch(error => {
      console.log(error)
      return null
    })
    if (!fileID) {
      await interaction.respond('Error creating spreadsheet')
      return
    }
    fileID = await client.files.create({
      requestBody: {
        name: huntName,
        mimeType: 'application/vnd.google-apps.jam',
        parents: [folderID],
      },
    }).then(resp => {
      return resp.data.id
    }).catch(error => {
      console.log(error)
      return null
    })
    if (!fileID) {
      await interaction.respond('Error creating jamboard')
      return
    }
    let files = await client.files.list({
      q: `'${folderID}' in parents`,
      fields: 'files/webViewLink',

    })
    let urls = files.data.files.map(value => {
      return value.webViewLink
    })
    await interaction.respond({content: `Hunt files created ${urls.join(', ')}`, ephemeral: false})
  }
}
