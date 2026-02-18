import { describe, expect, it } from 'vitest'
import { Hono } from 'hono'
import healthRoute from '../../routes/health.route'
import type { HealthResponse } from '@repo/shared'

const app = new Hono()
app.route('/', healthRoute)

describe('GET /', () => {
  it('returns 200 with success true and status ok', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const body = (await res.json()) as HealthResponse
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('ok')
  })
})
