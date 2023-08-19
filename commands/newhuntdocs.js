import {SlashCommandBuilder} from 'discord.js'
import {scheduler} from 'node:timers/promises'
import {readFileSync} from 'fs'
import {google} from 'googleapis'
import {join, resolve} from 'path'

export async function loadSavedCredentialsIfExist() {
  return google.auth.fromJSON(JSON.parse(readFileSync(join(resolve(''), 'google.json'))))
}

export default {
  data: new SlashCommandBuilder().setName('newhuntdocs').
      setDescription('Creates a new set of puzzle hunt documents in google drive').
      addStringOption(option => option.
          setName('name').
          setDescription('The name of the new hunt being started').
          setRequired(true)),
  async execute(interaction) {
    await scheduler.wait(10000)
    await interaction.editReply('lol, not implemented yet')
  },
}
