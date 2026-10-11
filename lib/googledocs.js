import {auth, drive} from '@googleapis/drive'
import {join, resolve} from 'path'
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
  const keyFileAuth = new auth.GoogleAuth({
    keyFile: join(resolve(''), 'google.json'),
    scopes: scopes,
  })
  return drive({version: 'v3', auth: keyFileAuth})
}

/**
 *
 * @param client {import('@googleapis/drive').drive_v3.Drive}
 * @param parentID {string}
 * @param folderName {string}
 * @return {Promise<boolean>}
 */
const checkExistingFolder = async (client, parentID, folderName) => {
  // Escape single quotes so names containing them can't break the query.
  const escapedName = folderName.replace(/'/g, "\\'")
  return await client.files.list({
    q: `'${parentID}' in parents and mimeType='application/vnd.google-apps.folder' and name='${escapedName}' and trashed=false`,
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
    throw new Error(`A folder for this hunt already exists for this month`)
  }
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
    throw new Error(`Unable to create folder: ${error}`)
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
    fileId: source,
    fields: 'webViewLink',
    requestBody: {
      name: fileName,
      parents: [parentFolder],
    },
  }).then(resp => {
    return resp.data.webViewLink
  }).catch(error => {
    throw new Error(`Unable to copy spreadsheet: ${error}`)
  })
}

/**
 * @param huntsFolder {string}
 * @param huntsTemplate {string}
 * @param huntName {string}
 * @return {Promise<string>}
 */
export const createHuntFilesAndGetLink = async (huntsFolder, huntsTemplate, huntName) => {
  const client = await createDriveClient()
  const folderID = await createDatedFolder(client, huntsFolder, huntName)
  return await copyFile(client, huntsTemplate, folderID, huntName)
}
