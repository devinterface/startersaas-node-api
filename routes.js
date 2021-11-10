import passport from 'passport'

import authRouter from './api/auth/auth.router.js'
import userRouter from './api/users/user.router.js'
import accountRouter from './api/accounts/account.router.js'
import subscriptionRouter from './api/subscriptions/subscription.router.js'
import webhookRouter from './api/webhooks/webhook.router.js'

import authorizeRequest from './middlewares/authorizeRequest.middleware.js'
import ROLE from './api/users/role.model.js'

// APP ROUTES

export default function routes (app) {
  // API ROUTES
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/users', passport.authenticate('jwt', { session: false }), userRouter)
  app.use('/api/v1/accounts', passport.authenticate('jwt', { session: false }), authorizeRequest([ROLE.ADMIN]), accountRouter)
  app.use('/api/v1/stripe/webhook', webhookRouter)
  app.use('/api/v1/stripe', subscriptionRouter)
}
