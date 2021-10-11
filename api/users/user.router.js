import * as express from 'express'
import userController from './user.controller.js'
import { wrap } from '../../common/exceptions.js'
import authorizeRequest from '../../middlewares/authorizeRequest.middleware.js'
import ROLE from './role.model.js'

export default express
  .Router()
  .get('/me', wrap(userController.me))
  .put('/me', wrap(userController.updateMe))
  .put('/me/change-password', wrap(userController.changeMyPassword))
  .put('/me/generate-sso', wrap(userController.generateSso))
  .post('/', [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(userController.create)
  ])
  .get('/', [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(userController.index)
  ])
  .get('/:id', [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(userController.byId)
  ])
  .put('/:id', [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(userController.update)
  ])
  .delete('/:id', [
    wrap(authorizeRequest([ROLE.ADMIN])),
    wrap(userController.delete)
  ])
