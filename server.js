'use strict'
import Express from 'express'
import morgan from 'morgan' // used to log HTTP Requests
import * as bodyParser from 'body-parser'
import * as http from 'http'
import * as os from 'os'
import * as path from 'path'
import l from './common/logger'
import passport from 'passport'
import compression from 'compression'
import { handleException } from './common/exceptions'
import cors from 'cors'
import staticAsset from 'static-asset'
import setLang from './middlewares/lang.middleware'

// Passport OAuth strategies
require('./common/passport.js')

const app = new Express()

export default class ExpressServer {
  constructor () {
    if (process.env.ENABLE_HTTP_LOGGER === 'true') app.use(morgan('combined'))
    const root = path.normalize(`${__dirname}/../..`)
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use(cors())
    app.options('*', cors())
    app.use(compression())
    app.use(setLang())
    app.use(passport.initialize())
    app.use(staticAsset(`${root}/apidoc`))
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
