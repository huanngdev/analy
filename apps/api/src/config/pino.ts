import pino from 'pino'

const isProd = process.env.NODE_ENV === 'production'

export const logger = pino({
  level: 'info',
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'password', 'user.email', 'cookie'],
    censor: '***',
  },
})

export const customLogger = (...params: Parameters<typeof logger.info>) => {
  logger.info(...params)
}
