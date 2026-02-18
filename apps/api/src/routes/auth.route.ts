import { Hono } from 'hono'
import { authController } from '../controllers/auth.controller'
import { validate } from '../middlewares'
import { signInSchema, signUpSchema } from '@repo/shared'

const authRoute = new Hono()

authRoute.post(
  '/sign-up',
  validate('json', signUpSchema),
  authController.signUp,
)
authRoute.post(
  '/sign-in',
  validate('json', signInSchema),
  authController.signIn,
)
export default authRoute
