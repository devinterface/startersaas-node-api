import Webhook from './webhook.model.js'
import BaseService from '../../services/base.service.js'
import EmailService from '../../services/email.service.js'
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
      case 'customer.subscription.trial_will_end':
        this.trialWillEnd(data)
        break
      case 'customer.source.created':
        // TODO: check this
        // this.setSourceAsDefault(data)
        break
      default:
        console.log(`Webhook: ${data.type}: No handler`)
    }
  }

  async paymentSuccessful(data) {
    const stripeCustomerId = data.data.object.customer
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.generalNotification(user, '[Starter SAAS] Pagamento completato', 'Pagamento completato', 'Congratulazioni, il tuo abbonamento a Articoli e Social è stato rinnovato')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Starter SAAS] Pagamento completato', 'Pagamento completato', `${user.email} - ${account.subdomain} ha pagato un abbonamento`)
    AccountService.update(account.id, { paymentFailed: false, active: true, paymentFailedFirstAt: null, paymentFailedSubscriptionEndsAt: null })
    AccountService.generateInvoce(data, account, user)
  }

  async newSubscription(data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.status !== 'active') {
      return
    }
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.generalNotification(user, '[Starter SAAS] Nuovo abbonamento attivato', 'Nuovo abbonamento attivato', 'Congratulazioni, il tuo abbonamento a Articoli e Social è stato attivato.')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Starter SAAS] Nuovo abbonamento attivato', 'Nuovo abbonamento attivato', `${user.email} - ${account.subdomain} ha attivato un abbonamento`)
  }

  async subscriptionUpdated(data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.status !== 'active') {
      return
    }
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.generalNotification(user, '[Starter SAAS] Piano aggiornato', 'Piano aggiornato', 'Congratulazioni, la sottoscrizione è stata aggiornata al nuovo piano')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Starter SAAS] Piano aggiornato', 'Piano aggiornato', `${user.email} - ${account.subdomain} ha un aggiornato un piano`)
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
      account = AccountService.update(account.id, { paymentFailed: true, paymentFailedFirstAt: Date.now(), paymentFailedSubscriptionEndsAt: paymentFailedSubscriptionEndsAt })
    } else {
      account = AccountService.update(account.id, { paymentFailed: true })
    }
    EmailService.generalNotification(user, '[Starter SAAS] Pagamento fallito', 'Pagamento fallito', `Siamo spiacenti ma per qualche ragione il tuo pagamento non è andato a buon fine. Sei pregato di aggiornare le tue informazioni di pagamento. Il tuo account sarà sospeso il ${moment(account.paymentFailedSubscriptionEndsAt).format('DD/MM/YYYY')}`)
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Starter SAAS] Pagamento fallito', 'Pagamento fallito', `${user.email} - ${account.subdomain} ha un pagamento fallito. L'account sospeso il ${moment(account.paymentFailedSubscriptionEndsAt).format('DD/MM/YYYY')}.`)
  }

  async trialWillEnd(data) {
    const stripeCustomerId = data.data.object.customer
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.generalNotification(user, '[Starter SAAS] Il periodo di prova sta per finire', 'Il periodo di prova sta per finire', 'Il tuo periodo di prova finirà a breve.')
  }
}

export default new WebhookService()
