import SubscriptionService from './subscription.service.js'
import SubscriptionValidator from './subscription.validator.js'

class Controller {
  async subscribe (req, res, next) {
    const subscriptionErrors = await SubscriptionValidator.onCreate(req.body)
    if (subscriptionErrors) {
      return res.status(422).json({
        success: false,
        errors: subscriptionErrors.details
      })
    }
    try {
      const subscription = await SubscriptionService.subscribe(req.user.id, req.body.sourceToken, req.body.planId)
      return res.status(200).json(subscription)
    } catch (error) {
      return res.status(error.status).json(error)
    }
  }

  async getCustomer (req, res, next) {
    try {
      const sCustomer = await SubscriptionService.getCustomer(req.user.accountId)
      return res.status(200).json(sCustomer)
    } catch (error) {
      return res.status(error.status).json(error)
    }
  }

  async getCustomerInvoices (req, res, next) {
    try {
      const invoices = await SubscriptionService.getCustomerInvoices(req.user.accountId)
      return res.status(200).json(invoices)
    } catch (error) {
      return res.status(error.status).json(error)
    }
  }

  async getCustomerCards (req, res, next) {
    try {
      const invoices = await SubscriptionService.getCustomerCards(req.user.accountId)
      return res.status(200).json(invoices)
    } catch (error) {
      return res.status(error.status).json(error)
    }
  }

  async addCreditCard (req, res, next) {
    try {
      const sCustomer = await SubscriptionService.addCreditCard(req.user.accountId, req.body.sourceToken)
      return res.status(200).json(sCustomer)
    } catch (error) {
      return res.status(error.status).json(error)
    }
  }

  async removeCreditCard (req, res, next) {
    try {
      const sCustomer = await SubscriptionService.removeCreditCard(req.user.accountId, req.body.cardId)
      return res.status(200).json(sCustomer)
    } catch (error) {
      return res.status(error.status).json(error)
    }
  }

  async setDefaultCreditCard (req, res, next) {
    try {
      const sCustomer = await SubscriptionService.setDefaultCreditCard(req.user.accountId, req.body.cardId)
      return res.status(200).json(sCustomer)
    } catch (error) {
      return res.status(error.status).json(error)
    }
  }

  async cancelSubscription (req, res, next) {
    try {
      const sCustomer = await SubscriptionService.cancelSubscription(req.user.accountId, req.body.subscriptionId)
      return res.status(200).json(sCustomer)
    } catch (error) {
      return res.status(error.status).json(error)
    }
  }
}

export default new Controller()
