import Stripe from 'stripe'
import AccountService from '../accounts/account.service.js'
import UserService from '../users/user.service.js'
import moment from 'moment'
import ApplicationError from '../../libs/errors/application.error.js'
import EmailService from '../emails/email.service.js'
import i18n from '../../common/i18n.js'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

class SubscriptionService {
  async createCustomer (userId) {
    try {
      const user = await UserService.byId(userId)
      const account = await AccountService.findById(user.accountId)
      const sCustomer = await stripe.customers.create({
        email: user.email,
        name: account.companyName,
        metadata: {
          companyName: account.companyName,
          address: account.companyBillingAddress,
          vat: account.companyVat,
          subdomain: account.subdomain,
          sdi: account.companySdi,
          phone: account.companyPhone,
          name: user.name,
          surname: user.surname
        }
      })
      account.stripeCustomerId = sCustomer.id
      await account.save()
      return account
    } catch (error) {
      return new ApplicationError(error.message, {}, 500)
    }
  }

  async subscribe (userId, planId) {
    let sCustomer

    const user = await UserService.byId(userId)
    let account = await AccountService.findById(user.accountId)

    if (!account.stripeCustomerId) {
      account = await this.createCustomer(userId)
    }

    try {
      sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)

      const haveSubscription = sCustomer.subscriptions.data.filter(sub => sub.status === 'active').length > 0

      let subscription = null
      if (haveSubscription) {
        subscription = await stripe.subscriptions.update(
          sCustomer.subscriptions.data[0].id,
          {
            cancel_at_period_end: false,
            proration_behavior: 'always_invoice',
            expand: ['latest_invoice.payment_intent'],
            payment_behavior: 'default_incomplete',
            items: [{
              id: sCustomer.subscriptions.data[0].items.data[0].id,
              plan: planId
            }]
          }
        )
        return subscription
      } else {
        for (const sb of sCustomer.subscriptions.data.filter(sub => sub.status !== 'active')) {
          await stripe.subscriptions.del(sb.id)
        }

        subscription = await stripe.subscriptions.create({
          customer: sCustomer.id,
          items: [{ plan: planId }],
          expand: ['latest_invoice.payment_intent'],
          payment_behavior: 'default_incomplete'
        })

        await account.save()
        return subscription
      }
    } catch (e) {
      return new ApplicationError(e.message, {}, 500)
    }
  }

  async getCustomer (accountId) {
    try {
      const account = await AccountService.findById(accountId)
      if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
      const sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)
      return sCustomer
    } catch (error) {
      return new ApplicationError(error.message, {}, 500)
    }
  }

  async getCustomerInvoices (accountId) {
    try {
      const account = await AccountService.findById(accountId)
      if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
      const invoices = await stripe.invoices.list({ customer: account.stripeCustomerId })
      return invoices.data
    } catch (error) {
      return new ApplicationError(error.message, {}, 500)
    }
  }

  async getCustomerCards (accountId) {
    try {
      const account = await AccountService.findById(accountId)
      if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
      const paymentMethods = await stripe.paymentMethods.list({ customer: account.stripeCustomerId, type: 'card' })
      return paymentMethods.data
    } catch (error) {
      return new ApplicationError(error.message, {}, 500)
    }
  }

  async createSetupIntent (accountId) {
    try {
      const account = await AccountService.findById(accountId)
      if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
      const setupIntent = await stripe.setupIntents.create({
        customer: account.stripeCustomerId,
        payment_method_types: ['card']
      })
      return setupIntent
    } catch (error) {
      return new ApplicationError(error.message, {}, 500)
    }
  }

  async removeCreditCard (accountId, cardId) {
    try {
      const account = await AccountService.findById(accountId)
      if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
      await stripe.paymentMethods.detach(cardId)
      const sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)
      return sCustomer
    } catch (error) {
      return new ApplicationError(error.message, {}, 500)
    }
  }

  async setDefaultCreditCard (accountId, cardId) {
    try {
      const account = await AccountService.findById(accountId)
      if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
      await stripe.customers.update(account.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: cardId
        }
      })
      const sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)
      return sCustomer
    } catch (error) {
      return new ApplicationError(error.message, {}, 500)
    }
  }

  async cancelSubscription (accountId, subscriptionId) {
    try {
      const account = await AccountService.findById(accountId)
      if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
      await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
      const sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)
      return sCustomer
    } catch (error) {
      return new ApplicationError(error.message, {}, 500)
    }
  }

  async runNotifyExpiringTrials () {
    const accounts = await AccountService.find({ active: false, trialPeriodEndsAt: { $lt: moment(Date.now()).add(3, 'days'), $gt: Date.now() } })
    for (const account of accounts) {
      const user = await UserService.oneBy({ accountId: account.id })
      const daysToExpire = Math.round(moment(account.trialPeriodEndsAt).diff(Date.now(), 'days', true))
      EmailService.generalNotification(user.email, i18n.t('subscriptionService.runNotifyExpiringTrials.subject', { daysToExpire: daysToExpire }), i18n.t('subscriptionService.runNotifyExpiringTrials.message', { daysToExpire: daysToExpire }), user.language)
    }
  }

  async runNotifyPaymentFailed () {
    const accounts = await AccountService.find({ active: true, paymentFailed: true, paymentFailedSubscriptionEndsAt: { $lt: moment(Date.now()).add(3, 'days'), $gt: Date.now() } })
    for (const account of accounts) {
      const user = await UserService.oneBy({ accountId: account.id })
      const daysToExpire = Math.round(moment(account.paymentFailedSubscriptionEndsAt).diff(Date.now(), 'days', true))
      EmailService.generalNotification(user.email, i18n.t('subscriptionService.runNotifyPaymentFailed.subject', { daysToExpire: daysToExpire }), i18n.t('subscriptionService.runNotifyPaymentFailed.message', { date: moment(account.paymentFailedSubscriptionEndsAt).format('DD/MM/YYYY') }), user.language)
    }
  }
}

export default new SubscriptionService()
