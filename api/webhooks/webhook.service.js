import Webhook from './webhook.model.js'
import BaseService from '../../services/base.service.js'
import EmailService from '../emails/email.service.js'
import AccountService from '../accounts/account.service.js'
import UserService from '../users/user.service.js'
import moment from 'moment'
import stripeConf from '../../stripe.conf.js'
import i18n from '../../common/i18n.js'

class WebhookService extends BaseService {
  getModel () {
    return Webhook
  }

  async handleWebhook (data) {
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

  async paymentSuccessful (data) {
    const stripeCustomerId = data.data.object.customer
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.generalNotification(user.email, i18n.t('webhookService.paymentSuccessful.subject'), i18n.t('webhookService.paymentSuccessful.message'))
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, i18n.t('webhookService.paymentSuccessful.subject'), i18n.t('webhookService.paymentSuccessful.messageAdmin', { email: user.email, subdomain: account.subdomain }))
    AccountService.update(account.id, { paymentFailed: false, active: true, paymentFailedFirstAt: null, paymentFailedSubscriptionEndsAt: null, trialPeriodEndsAt: null })
    AccountService.generateInvoce(data, account, user)
  }

  async newSubscription (data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.status !== 'active') {
      return
    }
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    const expiresAt = data.data.object.cancel_at
    account.subscriptionExpiresAt = expiresAt ? moment.unix(expiresAt) : null
    account.stripePlanId = data.data.object.plan.id
    account.planType = stripeConf.plans.find(p => p.id === data.data.object.plan.id).planType
    account.save()
    EmailService.generalNotification(user.email, i18n.t('webhookService.newSubscription.subject'), i18n.t('webhookService.newSubscription.message'))
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, i18n.t('webhookService.newSubscription.subject'), i18n.t('webhookService.newSubscription.messageAdmin', { email: user.email, subdomain: account.subdomain }))
  }

  async subscriptionUpdated (data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.status !== 'active') {
      return
    }
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    const expiresAt = data.data.object.cancel_at
    account.subscriptionExpiresAt = expiresAt ? moment.unix(expiresAt) : null
    account.stripePlanId = data.data.object.plan.id
    account.planType = stripeConf.plans.find(p => p.id === data.data.object.plan.id).planType
    account.save()
    EmailService.generalNotification(user.email, i18n.t('webhookService.subscriptionUpdated.subject'), i18n.t('webhookService.subscriptionUpdated.message'))
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, i18n.t('webhookService.subscriptionUpdated.subject'), i18n.t('webhookService.subscriptionUpdated.messageAdmin', { email: user.email, subdomain: account.subdomain }))
  }

  async paymentFailed (data) {
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
    EmailService.generalNotification(user.email, i18n.t('webhookService.paymentFailed.subject'), i18n.t('webhookService.paymentFailed.message', { date: moment(account.paymentFailedSubscriptionEndsAt).format('DD/MM/YYYY') }))
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, i18n.t('webhookService.paymentFailed.subject'), i18n.t('webhookService.paymentFailed.messageAdmin', { email: user.email, subdomain: account.subdomain, date: moment(account.paymentFailedSubscriptionEndsAt).format('DD/MM/YYYY') }))
  }
}

export default new WebhookService()
