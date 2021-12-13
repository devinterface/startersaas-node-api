import Webhook from './webhook.model.js'
import BaseService from '../../services/base.service.js'
import EmailService from '../emails/email.service.js'
import AccountService from '../accounts/account.service.js'
import UserService from '../users/user.service.js'
import moment from 'moment'

class WebhookService extends BaseService {
  getModel() {
    return Webhook
  }

  async handleWebhook(data) {
    this.create({ payload: data })
    switch (data.type) {
      case 'customer.subscription.updated':
        this.subscriptionUpdated(data)
        break
      case 'customer.subscription.created':
        this.newSubscription(data)
        break
      case 'invoice.payment_succeeded':
        this.paymentSuccessful(data)
        break
      case 'invoice.payment_failed':
        this.paymentFailed(data)
        break
      default:
        console.log(`Webhook: ${data.type}: No handler`)
    }
  }

  async paymentSuccessful(data) {
    const stripeCustomerId = data.data.object.customer
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.generalNotification(user.email, '[Starter SAAS] Payment completed', 'Congratulations, your subscription has been renewed.')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Starter SAAS] Payment completed', `${user.email} - ${account.subdomain} paid a subscription`)
    AccountService.update(account.id, { paymentFailed: false, active: true, paymentFailedFirstAt: null, paymentFailedSubscriptionEndsAt: null, trialPeriodEndsAt: null })
    AccountService.generateInvoce(data, account, user)
  }

  async newSubscription(data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.status !== 'active') {
      return
    }
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.generalNotification(user.email, '[Starter SAAS] New subscription activated', 'Congratulations, your subscription has been activated.')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Starter SAAS] New subscription activated', `${user.email} - ${account.subdomain} activated a subscription.`)
  }

  async subscriptionUpdated(data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.status !== 'active') {
      return
    }
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    const expiresAt = data.data.object.cancel_at
    account.subcriptionExpiresAt = expiresAt ? moment.unix(expiresAt) : null
    account.stripePlanId = data.data.object.plan.id
    account.save()
    EmailService.generalNotification(user.email, '[Starter SAAS] Subscription updated', 'Congratulations, your subscription has been updated.')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Starter SAAS] Subscription updated', `${user.email} - ${account.subdomain} updated a subscription.`)
  }

  async paymentFailed(data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.payment_intent !== '' && data.data.object.payment_intent !== undefined) {
      return
    }
    let account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    if (!account.paymentFailedFirstAt) {
      const paymentFailedSubscriptionEndsAt = moment(Date.now()).add(process.env.PAYMENT_FAILED_RETRY_DAYS, 'days')
      account = await AccountService.update(account.id, { paymentFailed: true, paymentFailedFirstAt: Date.now(), paymentFailedSubscriptionEndsAt: paymentFailedSubscriptionEndsAt })
    } else {
      account = await AccountService.update(account.id, { paymentFailed: true })
    }
    EmailService.generalNotification(user.email, '[Starter SAAS] Payment failed', `Your payment wasn't successful. Please check your payment card and retry. Your subscription will be deactivated on ${moment(account.paymentFailedSubscriptionEndsAt).format('DD/MM/YYYY')}`)
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Starter SAAS] Payment failed', `${user.email} - ${account.subdomain} has a failed payment. His subscription will be deactivated on ${moment(account.paymentFailedSubscriptionEndsAt).format('DD/MM/YYYY')}.`)
  }
}

export default new WebhookService()
