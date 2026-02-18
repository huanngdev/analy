import { describe, expect, it } from 'vitest'
import { Hono } from 'hono'
import { z } from 'zod'
import { validate } from '../../middlewares/validator.middleware'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().positive('Age must be positive'),
})

const app = new Hono()
app.post('/test', validate('json', schema), (c) => {
  return c.json({ success: true, data: c.req.valid('json' as never) })
})

describe('validate middleware', () => {
  it('passes valid input to the handler', async () => {
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', age: 30 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ name: 'Alice', age: 30 })
  })

  it('returns 400 for invalid field values', async () => {
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', age: -1 }),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.message).toBe('Invalid input')
    expect(body.errors).toBeDefined()
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.errors.fieldErrors).toBeDefined()
  })

  it('includes field-level error details', async () => {
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', age: 0 }),
    })
    const body = await res.json()
    expect(body.errors.fieldErrors.name).toBeDefined()
    expect(body.errors.fieldErrors.age).toBeDefined()
  })
})
