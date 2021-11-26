import localDatabase from '../../common/localDatabase.js'

const schema = new localDatabase.Schema({
  subdomain: String,
  displayName: String,
  companyName: String,
  companyVat: String,
  companyBillingAddress: String,
  companySdi: String,
  companyPec: String,
  companyPhone: String,
  companyEmail: String,
  privacyAccepted: {
    type: Boolean,
    default: false
  },
  marketingAccepted: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  stripeCustomerId: String,
  paymentFailed: {
    type: Boolean,
    default: false
  },
  paymentFailedFirstAt: Date,
  paymentFailedSubscriptionEndsAt: Date,
  manualPayment: {
    type: Boolean,
    default: false
  },
  trialPeriodEndsAt: Date,
  stripePlanId: String,
  subcriptionExpiresAt: Date
}, { timestamps: true })

const Account = localDatabase.model('Account', schema, 'account')

export default Account
