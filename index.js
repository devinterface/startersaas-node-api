import "./common/env.js";
import routes from "./routes.js";
import ExpressServer from "./server.js";

export default new ExpressServer()
  .router(routes)
  .listen(process.env.PORT)
  .initCron();
