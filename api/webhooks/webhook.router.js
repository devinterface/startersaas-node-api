import * as express from "express";
import { wrap } from "../../common/exceptions.js";
import webhookController from "./webhook.controller.js";

export default express
  .Router()
  .post("/", wrap(webhookController.handleWebhook));
