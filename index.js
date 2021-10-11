'use strict'
import './common/env'
import Server from './server'
import routes from './routes'

export default new Server()
  .router(routes)
  .listen(process.env.PORT)
