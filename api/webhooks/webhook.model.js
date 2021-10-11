import localDatabase from '../../common/localDatabase.js'

const schema = new localDatabase.Schema({
  payload: {}
}, { timestamps: true })

const Webhook = localDatabase.model('Webhook', schema, 'webhook')

export default Webhook
