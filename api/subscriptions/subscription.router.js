import * as express from 'express'
import subscriptionController from './subscription.controller.js'
import { wrap } from '../../common/exceptions.js'

export default express
  .Router()
  .post('/subscriptions', wrap(subscriptionController.subscribe))
  .delete('/subscriptions', wrap(subscriptionController.cancelSubscription))
  .get('/customers/me', wrap(subscriptionController.getCustomer))
  .get('/customers/me/invoices', wrap(subscriptionController.getCustomerInvoices))
  .get('/customers/me/cards', wrap(subscriptionController.getCustomerCards))
  .post('/cards', wrap(subscriptionController.addCreditCard))
  .delete('/cards', wrap(subscriptionController.removeCreditCard))
  .put('/cards', wrap(subscriptionController.setDefaultCreditCard))
