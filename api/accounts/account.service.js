import Stripe from "stripe";
import BaseService from "../../services/base.service.js";
import Account from "./account.model.js";
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class AccountService extends BaseService {
  getModel() {
    return Account;
  }

  async activate(user) {
    const account = await this.findById(user.accountId);
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
          surname: user.surname,
        },
      });
      account.stripeCustomerId = sCustomer.id;
      account.save();
    } catch (error) {}
  }
}

export default new AccountService();
