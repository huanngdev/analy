import Redis from 'ioredis'
import env from '../../config/env'
import { logger } from '../../config/pino'

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

redis.on('connect', () => {
  logger.info('Redis connected')
})

redis.on('error', (err) => {
  logger.error('Redis connection error: %s', err)
})

export { redis }
