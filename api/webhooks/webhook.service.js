'use strict'
import Webhook from './webhook.model'
import BaseService from '../../services/base.service'
import EmailService from '../../services/email.service'
import AccountService from '../accounts/account.service'
import UserService from '../users/user.service'

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

  async paymentSuccessful (data) {
    const stripeCustomerId = data.data.object.customer
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.stripeNotification(user, '[Articoli e Social] Pagamento completato', 'Pagamento completato', 'Congratulazioni, il tuo abbonamento a Articoli e Social è stato rinnovato')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Articoli e Social] Pagamento completato', 'Pagamento completato', `${user.email} - ${account.subdomain} ha pagato un abbonamento`)
    AccountService.update(account.id, { paymentFailed: false, active: true })
    AccountService.generateInvoce(data, account, user)
  }

  async newSubscription (data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.status !== 'active') {
      return
    }
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.stripeNotification(user, '[Articoli e Social] Nuovo abbonamento attivato', 'Nuovo abbonamento attivato', 'Congratulazioni, il tuo abbonamento a Articoli e Social è stato attivato.')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Articoli e Social] Nuovo abbonamento attivato', 'Nuovo abbonamento attivato', `${user.email} - ${account.subdomain} ha attivato un abbonamento`)
  }

  async subscriptionUpdated (data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.status !== 'active') {
      return
    }
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.stripeNotification(user, '[Articoli e Social] Piano aggiornato', 'Piano aggiornato', 'Congratulazioni, la sottoscrizione è stata aggiornata al nuovo piano')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Articoli e Social] Piano aggiornato', 'Piano aggiornato', `${user.email} - ${account.subdomain} ha un aggiornato un piano`)
  }

  async paymentFailed (data) {
    const stripeCustomerId = data.data.object.customer
    if (data.data.object.payment_intent !== '' && data.data.object.payment_intent !== undefined) {
      return
    }
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    AccountService.update(account.id, { paymentFailed: true })
    EmailService.stripeNotification(user, '[Articoli e Social] Pagamento fallito, account sospeso', 'Pagamento fallito', 'Siamo spiacenti ma per qualche ragione il tuo pagamento non è andato a buon fine. Sei pregato di aggiornare le tue informazioni di pagamento ')
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, '[Articoli e Social] Pagamento fallito, Account sospeso', 'Pagamento fallito, Account sospeso', `${user.email} - ${account.subdomain} ha un pagamento fallito. Account sospeso.`)
  }

  async trialWillEnd (data) {
    const stripeCustomerId = data.data.object.customer
    const account = await AccountService.oneBy({ stripeCustomerId: stripeCustomerId })
    const user = await UserService.oneBy({ accountId: account.id })
    EmailService.stripeNotification(user, '[Articoli e Social] Il periodo di prova sta per finire', 'Il periodo di prova sta per finire', 'Il tuo periodo di prova finirà a breve.')
  }
}

export default new WebhookService()
