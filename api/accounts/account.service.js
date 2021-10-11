import Account from './account.model.js'
import BaseService from '../../services/base.service.js'
import Stripe from 'stripe'
import makeInvoiceDocument from '../../libs/fattura24/document.js'
import Fattura24Client from '../../libs/fattura24/client.js'
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

class AccountService extends BaseService {
  getModel () {
    return Account
  }

  async activate (user) {
    const account = await this.findById(user.accountId)
    try {
      const sCustomer = await stripe.customers.create({
        email: user.email,
        name: account.displayName,
        metadata: {
          companyName: account.companyName,
          address: account.companyBillingAddress,
          vat: account.companyVat,
          subdomain: account.subdomain,
          sdi: account.companySdi,
          pec: account.companyPec,
          phone: account.companyPhone,
          email: account.companyEmail,
          name: user.name,
          surname: user.surname
        }
      })
      account.stripeCustomerId = sCustomer.id
      account.save()
    } catch (error) {
    }
  }

  async generateInvoce (payload, account, user) {
    if (payload.data.object.amount_paid > 0) {
      const document = makeInvoiceDocument(payload, account, user)
      Fattura24Client.createInvoice(document)
    }
  }
}

export default new AccountService()
