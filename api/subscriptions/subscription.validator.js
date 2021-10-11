'use strict'
import Joi from '@hapi/joi'

class SubscriptionValidator {
  async onCreate (obj) {
    const schemaKeys = {
      sourceToken: Joi.string().required(),
      planId: Joi.string().required()
    }
    const schema = Joi.object().keys(schemaKeys)
    const { error } = schema.validate(obj, { abortEarly: false })
    return error
  }
}

export default new SubscriptionValidator()
