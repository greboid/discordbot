import {pino} from 'pino'

export const logger = new pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  },
  level: 'trace',
})
