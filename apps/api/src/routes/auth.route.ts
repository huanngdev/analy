import { Hono } from 'hono'
import { authController } from '../controllers/auth.controller'
import { authMiddleware, validate } from '../middlewares'
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
authRoute.post('/sign-out', authMiddleware, authController.signOut)
authRoute.get('/me', authMiddleware, authController.me)
authRoute.post('/rotate-access-token', authController.rotateAccessToken)
export default authRoute
