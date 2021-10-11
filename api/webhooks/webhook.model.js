'use strict'
import localDatabase from '../../common/localDatabase'

const schema = new localDatabase.Schema({
  payload: {}
}, { timestamps: true })

const Webhook = localDatabase.model('Webhook', schema, 'webhook')

export default Webhook
