export const ttlUtil = {
  fromTtlStringToSeconds: (ttl: string): number => {
    const match = ttl.trim().match(/^(\d+)([smhd])$/i)

    if (!match) {
      throw new Error(`Invalid TTL format: "${ttl}"`)
    }

    const value = Number(match[1])
    const unit = match[2].toLowerCase()

    switch (unit) {
      case 's':
        return value
      case 'm':
        return value * 60
      case 'h':
        return value * 60 * 60
      case 'd':
        return value * 60 * 60 * 24
      default:
        // unreachable but keeps TS happy
        throw new Error(`Unsupported TTL unit: "${unit}"`)
    }
  },
}
