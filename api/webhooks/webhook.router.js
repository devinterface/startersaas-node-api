import * as express from 'express'
import webhookController from './webhook.controller.js'
import { wrap } from '../../common/exceptions.js'

export default express
  .Router()
  .post('/', wrap(webhookController.handleWebhook))
