import Joi from '@hapi/joi'

class SubscriptionValidator {
  async onCreate (obj) {
    const schemaKeys = {
      planId: Joi.string().required()
    }
    const schema = Joi.object().keys(schemaKeys)
    const { error } = schema.validate(obj, { abortEarly: false })
    return error
  }
}

export default new SubscriptionValidator()
