import {google} from 'googleapis'
import {join, resolve} from 'path'
import {drive} from '@googleapis/drive'
import {DateTime} from 'luxon'

/**
 *
 * @return {Promise<import('@googleapis/drive').drive_v3.Drive>}
 */
const createDriveClient = async () => {
  const scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file',
  ]
  const auth = new google.auth.GoogleAuth({
    keyFile: join(resolve(''), 'google.json'),
    scopes: scopes,
  })
  return Promise.resolve(drive({version: 'v3', auth}))
}

/**
 *
 * @param client {import('@googleapis/drive').drive_v3.Drive}
 * @param parentID {string}
 * @param folderName {string}
 * @return {Promise<boolean>}
 */
const checkExistingFolder = async (client, parentID, folderName) => {
  return await client.files.list({
    q: `'${parentID}' in parents and mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
  }).
      then(json => json.data.files.length !== 0).
      catch(error => {throw new Error(`Unable to get URLs: ${error}`)})
}

/**
 * @param client {import('@googleapis/drive').drive_v3.Drive}
 * @param parentID {string}
 * @param folderName {string}
 * @return {Promise<string>}
 */
const createDatedFolder = async (client, parentID, folderName) => {
  const datedName = `${DateTime.now().toFormat('yyyy-LL')}-${folderName}`
  const existingFolder = await checkExistingFolder(client, parentID, datedName)
  if (existingFolder) {
    throw new Error(`Folder already exists, choose another name`)
  }
  /** @type {Params$Resource$Files$Create} */
  const createParams = {
    requestBody: {
      name: datedName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentID],
    },
  }
  return await client.files.create(createParams).then(resp => {
    return resp.data.id
  }).catch(error => {
    throw new Error(`Unable to create folder: ${error}}`)
  })
}

/**
 * @param client {import('@googleapis/drive').drive_v3.Drive}
 * @param source {string}
 * @param parentFolder {string}
 * @param fileName {string}
 * @return {Promise<string>}
 */
const copyFile = async (client, source, parentFolder, fileName) => {
  return await client.files.copy({
    fileId: process.env.DRIVE_TEMPLATE_DOC,
    requestBody: {
      name: fileName,
      parents: [parentFolder],
    },
  }).then(resp => {
    return resp.data.id
  }).catch(error => {
    throw new Error(`Unable to copy spreadsheet: ${error}`)
  })
}

/**
 * @param client {import('@googleapis/drive').drive_v3.Drive}
 * @param parentFolder {string}
 * @param fileName {string}
 * @return {Promise<string>}
 */
const createFile = async (client, parentFolder, fileName) => {
  return await client.files.create({
    requestBody: {
      name: fileName,
      mimeType: 'application/vnd.google-apps.jam',
      parents: [parentFolder],
    },
  }).then(resp => {
    return resp.data.id
  }).catch(error => {
    throw new Error(`Unable to create file: ${error}`)
  })
}

/**
 * @param client {import('@googleapis/drive').drive_v3.Drive}
 * @param folder {string}
 * @return {Promise<string[]>}
 */
const getLinksFromFolder = async (client, folder) => {
  return await client.files.list({
    q: `'${folder}' in parents`,
    fields: 'files/webViewLink',

  }).then(files => files.data.files.map(value => value.webViewLink))
  .catch(error => {
    throw new Error(`Unable to get URLs: ${error}`)
  })
}

/**
 * @param huntsFolder {string}
 * @param huntsTemplate {string}
 * @param huntName {string}
 * @return {Promise<string[]>}
 */
export const createHuntFilesAndGetLink = async (huntsFolder, huntsTemplate, huntName) => {
  return await createDriveClient().then(async client => {
    let folderID = await createDatedFolder(client, huntsFolder, huntName)
    return {client, folderID}
  }).then(async ({client, folderID}) => {
    await copyFile(client, huntsTemplate, folderID, huntName)
    return {client, folderID}
  }).then(async ({client, folderID}) => {
    await createFile(client, folderID, huntName)
    return {client, folderID}
  }).then(async ({client, folderID}) => {
    return await getLinksFromFolder(client, folderID)
  })
}
