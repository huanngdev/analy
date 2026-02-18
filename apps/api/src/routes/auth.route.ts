import { Hono } from 'hono'
import { authController } from '../controllers/auth.controller'
import { validate } from '../middlewares'
import { signUpSchema } from '@repo/shared'

const authRoute = new Hono()

authRoute.post('/sign-up', validate('json', signUpSchema), authController.signUp)

export default authRoute
