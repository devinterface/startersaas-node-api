'use strict'
import * as express from 'express'
import accountController from './account.controller'
import authorizeRequest from '../../middlewares/authorizeRequest.middleware'
import { wrap } from '../../common/exceptions'
import ROLE from '../users/role.model'

export default express
  .Router()
  .get('/:id', [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(accountController.byId)
  ])
  .put('/:id', [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(accountController.update)
  ])
