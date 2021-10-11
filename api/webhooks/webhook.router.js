'use strict'
import * as express from 'express'
import webhookController from './webhook.controller'
import { wrap } from '../../common/exceptions'

export default express
  .Router()
  .post('/', wrap(webhookController.handleWebhook))
