import './common/env.js'
import ExpressServer from './server.js'
import routes from './routes.js'

export default new ExpressServer()
  .router(routes)
  .listen(process.env.PORT)
