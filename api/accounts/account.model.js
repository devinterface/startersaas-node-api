'use strict'
import localDatabase from '../../common/localDatabase'

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

  active: {
    type: Boolean,
    default: false
  },
  stripeCustomerId: String,
  firstSubscription: {
    type: Boolean,
    default: true
  },
  paymentFailed: {
    type: Boolean,
    default: false
  },
  manualPayment: {
    type: Boolean,
    default: false
  },
  periodEndsAt: Date
}, { timestamps: true })

const Account = localDatabase.model('Account', schema, 'account')

export default Account
