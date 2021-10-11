import Express from 'express'
import morgan from 'morgan'
import * as http from 'http'
import * as os from 'os'
import l from './common/logger.js'
import passport from 'passport'
import compression from 'compression'
import { handleException } from './common/exceptions.js'
import cors from 'cors'
import { setLang } from './middlewares/lang.middleware.js'

import './common/passport.js'

const app = new Express()

export default class ExpressServer {
  constructor () {
    if (process.env.ENABLE_HTTP_LOGGER === 'true') app.use(morgan('combined'))
    app.use(Express.urlencoded({ extended: false }))
    app.use(Express.json())
    app.use(cors())
    app.options('*', cors())
    app.use(compression())
    app.use(setLang())
    app.use(passport.initialize())
    app.use(function (req, res, next) {
      next()
    })
    app.use((err, req, res, next) => {
      handleException(req, res, err)
    })
  }

  router (routes) {
    routes(app)
    return this
  }

  listen (port = process.env.PORT) {
    const welcome = p => () => l.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port: ${p}}`)
    http.createServer(app).listen(port, welcome(port))
    return app
  }
}
