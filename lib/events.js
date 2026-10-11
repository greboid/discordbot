import {DateTime} from 'luxon'
import {randomUUID} from 'node:crypto'

const DBNAMESPACE = 'events'

export const RESPONSE_YES = 'yes'
export const RESPONSE_NO = 'no'
export const RESPONSE_MAYBE = 'maybe'

/**
 * @param client {import('./client.js').BotClient}
 * @returns {Keyv}
 */
const getStore = (client) => client.getValueStore(DBNAMESPACE)

/**
 * Events are stored as plain JSON: Maps and Luxon DateTime objects do not
 * survive the round-trip through SQLite, so responses use a plain object and
 * dates are stored as ISO strings.
 *
 * @param client {import('./client.js').BotClient}
 * @param thread {string}
 * @param name {string}
 * @param date {DateTime}
 * @return {Promise<string>}
 */
export const createEvent = async (client, thread, name, date) => {
  const id = randomUUID()
  await getStore(client).set(id, {
    id,
    threadID: thread,
    name,
    date: date.toISO(),
    finished: false,
    responses: {},
  })
  return id
}

/**
 * @param client {import('./client.js').BotClient}
 * @param id {string}
 * @return {Promise<object|undefined>}
 */
export const getEvent = async (client, id) => {
  return getStore(client).get(id)
}

/**
 * @param client {import('./client.js').BotClient}
 * @param id {string}
 * @param update {function(object)}
 * @return {Promise<void>}
 */
export const updateEvent = async (client, id, update) => {
  const store = getStore(client)
  const event = await store.get(id)
  if (!event) {
    return
  }
  update(event)
  await store.set(id, event)
}

/**
 * @param client {import('./client.js').BotClient}
 * @param id {string}
 * @param name {string}
 * @param date {DateTime}
 */
export const editEvent = async (client, id, name, date) => {
  await updateEvent(client, id,
      (event) => {
        event.name = name
        event.date = date.toISO()
      },
  )
}

/**
 * @param client {import('./client.js').BotClient}
 * @param id {string}
 * @param user {string}
 * @param response {string} one of RESPONSE_YES, RESPONSE_NO, RESPONSE_MAYBE
 */
export const setResponse = async (client, id, user, response) => {
  await updateEvent(client, id,
      (event) => {
        event.responses[user] = response
      },
  )
}

/**
 * @param client {import('./client.js').BotClient}
 * @param id {string}
 * @param user {string}
 */
export const removeResponse = async (client, id, user) => {
  await updateEvent(client, id,
      (event) => {
        delete event.responses[user]
      },
  )
}

/**
 * @param client {import('./client.js').BotClient}
 * @return {Promise<object[]>}
 */
export const getEvents = async (client) => {
  const values = getStore(client).iterator()
  /** @type {object[]} */
  const arr = []
  for await (const {1: value} of values) {
    arr.push(value)
  }
  return arr
}
