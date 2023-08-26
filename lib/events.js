import {DateTime} from 'luxon'

const DBNAMESPACE = 'events'

/**
 * @param client {BotClient}
 * @param thread {string}
 * @param name {string}
 * @param date {DateTime}
 * @return {Promise<string>}
 */
export const createEvent = async (client, thread, name, date) => {
  const id = crypto.randomUUID()
  const event = new Event(id, name, date, thread)
  await client.getValueStore(DBNAMESPACE).set(id, event)
  return Promise.resolve(id)
}

/**
 * @param client {BotClient}
 * @param id {string}
 * @return {Promise<Event>}
 */
export const getEvent = async (client, id) => {
  return client.getValueStore(DBNAMESPACE).get(id)
}

/**
 * @param client {BotClient}
 * @param id {string}
 * @param update {function(Event)}
 * @return {Promise<void>}
 */
export const updateEvent = async (client, id, update) => {
  const db = client.getValueStore(DBNAMESPACE)
  const event = await db.get(id)
  update.call(event)
  return db.set(id, event)
}

/**
 * @param client {BotClient}
 * @param id {string}
 * @param name {string}
 * @param date {DateTime}
 */
export const editEvent = async (client, id, name, date) => {
  await updateEvent(client, id,
      (event) => {
        event.name = name
        event.date = date
      },
  )
}

/**
 * @param client {BotClient}
 * @param id {string}
 * @param user {string}
 * @param response {Response}
 */
export const setResponse = async (client, id, user, response) => {
  await updateEvent(client, id,
      (event) => {
        const responses = event.responses
        responses.set(user, response)
      },
  )
}

/**
 * @param client {BotClient}
 * @param id {string}
 * @param user {string}
 */
export const removeResponse = async (client, id, user) => {
  await updateEvent(client, id,
      (event) => {
        const responses = event.responses
        responses.delete(user)
      },
  )
}

/**l
 * @param client {BotClient}
 * @return {Promise<Event[]>}
 */
export const getEvents = async (client) => {
  const values = client.getValueStore(DBNAMESPACE).iterator()
  /** @type {Event[]} */
  const arr = []
  for await (const {1: value} of values) {
    arr.push(value)
  }
  return arr
}

class Response {
  static YES = new Response('yes')
  static NO = new Response('no')
  static MAYBE = new Response('maybe')

  constructor(name) {
    this.name = name
  }
}

class Event {
  /** @type {string} */
  id
  /** @type {import('discord.js').Snowflake} */
  threadID
  /** @type {string} */
  name
  /** @type {DateTime} */
  date
  /** @type {Map<string, Response>} */
  responses
  /** @type boolean */
  finished

  /**
   * @param id {string}
   * @param date {DateTime}
   * @param name {string}
   * @param thread {string}
   */
  constructor(id, name, date, thread) {
    this.id = id
    this.threadID = thread
    this.name = name
    this.date = date
    this.finished = false
    this.responses = new Map()
  }
}
