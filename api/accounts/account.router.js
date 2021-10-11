import * as express from 'express'
import accountController from './account.controller.js'
import authorizeRequest from '../../middlewares/authorizeRequest.middleware.js'
import { wrap } from '../../common/exceptions.js'
import ROLE from '../users/role.model.js'

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
