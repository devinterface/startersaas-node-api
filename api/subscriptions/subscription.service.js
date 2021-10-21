import Stripe from 'stripe'
import AccountService from '../accounts/account.service.js'
import UserService from '../users/user.service.js'
import moment from 'moment'
import ApplicationError from '../../libs/errors/application.error.js'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

class SubscriptionService {
  async createCustomer(userId) {
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
  }

  async subscribe(userId, sourceToken, planId) {
    let sCustomer

    const user = await UserService.byId(userId)
    let account = await AccountService.findById(user.accountId)

    if (!account.stripeCustomerId) {
      account = await this.createCustomer(userId)
    }

    try {
      sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)

      const haveCreditCard = sCustomer.sources.data.length > 0
      const haveSubscription = sCustomer.subscriptions.data.filter(sub => sub.status === 'active').length > 0

      if (!haveCreditCard) {
        if (!sourceToken) {
          return new ApplicationError('Request should contain a Credit Card source', {}, 500)
        }

        const source = await stripe.customers.createSource(account.stripeCustomerId, { source: sourceToken })
        sCustomer = await stripe.customers
          .update(account.stripeCustomerId, {
            default_source: source.id
          })
      }

      let subscription = null
      if (haveSubscription) {
        subscription = await stripe.subscriptions.update(
          sCustomer.subscriptions.data[0].id,
          {
            cancel_at_period_end: false,
            items: [{
              id: sCustomer.subscriptions.data[0].items.data[0].id,
              plan: planId
            }]
          }
        )
        return subscription
      } else {
        const sPlan = await stripe.plans.retrieve(planId)

        for (const sb of sCustomer.subscriptions.data.filter(sub => sub.status !== 'active')) {
          await stripe.subscriptions.del(sb.id)
        }

        if (account.firstSubscription === true) {
          subscription = await stripe.subscriptions.create({
            customer: sCustomer.id,
            items: [{ plan: planId }],
            expand: ['latest_invoice.payment_intent'],
            trial_end: moment().add(sPlan.trial_period_days ? sPlan.trial_period_days : 0, 'days').unix()
          })
        } else {
          subscription = await stripe.subscriptions.create({
            customer: sCustomer.id,
            items: [{ plan: planId }],
            expand: ['latest_invoice.payment_intent']
          })
        }
        account.firstSubscription = false
        await account.save()
        return subscription
      }
    } catch (e) {
      return new ApplicationError(e.message, {}, 500)
    }
  }

  async getCustomer(accountId) {
    const account = await AccountService.findById(accountId)
    if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
    const sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)
    return sCustomer
  }

  async getCustomerInvoices(accountId) {
    const account = await AccountService.findById(accountId)
    if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
    const invoices = await stripe.invoices.list({ customer: account.stripeCustomerId })
    return invoices.data
  }

  async getCustomerCards(accountId) {
    const account = await AccountService.findById(accountId)
    if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
    const paymentMethods = await stripe.paymentMethods.list({ customer: account.stripeCustomerId, type: 'card' })
    return paymentMethods.data
  }

  async addCreditCard(accountId, sourceToken) {
    const account = await AccountService.findById(accountId)
    if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
    const source = await stripe.customers.createSource(account.stripeCustomerId, { source: sourceToken })
    await stripe.customers.update(account.stripeCustomerId, { default_source: source.id })
    const sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)
    return sCustomer
  }

  async removeCreditCard(accountId, cardId) {
    const account = await AccountService.findById(accountId)
    if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
    await stripe.customers.deleteSource(account.stripeCustomerId, cardId)
    const sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)
    return sCustomer
  }

  async setDefaultCreditCard(accountId, cardId) {
    const account = await AccountService.findById(accountId)
    if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
    await stripe.customers.update(account.stripeCustomerId, { default_source: cardId })
    const sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)
    return sCustomer
  }

  async cancelSubscription(accountId, subscriptionId) {
    const account = await AccountService.findById(accountId)
    if (!account.stripeCustomerId) { return new ApplicationError('User is not a stripe USER', {}, 500) }
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
    const sCustomer = await stripe.customers.retrieve(account.stripeCustomerId)
    return sCustomer
  }
}

export default new SubscriptionService()
