'use strict'
import UserService from './user.service'
import Joi from '@hapi/joi'

class UserValidator {
  async onLogin (obj) {
    const schema = Joi.object({
      password: Joi.string(),
      email: Joi.string().email()
    })
    const { error } = schema.validate(obj)
    return error
  }

  async onSso (obj) {
    const schema = Joi.object({
      sso: Joi.string()
    })
    const { error } = schema.validate(obj)
    return error
  }

  async onSignup (obj) {
    const emailExists = await UserService.oneBy({ email: obj.email })
    const schemaKeys = {
      password: Joi.string().min(8).required()
    }
    if (emailExists) {
      schemaKeys.email = Joi.string().invalid(obj.email).required()
    } else {
      schemaKeys.email = Joi.string().email().required()
    }
    const schema = Joi.object().keys(schemaKeys)
    const { error } = schema.validate(obj, { abortEarly: false })
    return error
  }

  async forgotPassword (obj) {
    const schema = Joi.object({
      email: Joi.string().email()
    })
    const { error } = schema.validate(obj)
    return error
  }

  async onResetPassword (obj) {
    const schema = Joi.object({
      password: Joi.string().min(8).required(),
      passwordResetToken: Joi.string().required()
    })
    const { error } = schema.validate(obj, { abortEarly: false })
    return error
  }

  async onResetMyPassword (obj) {
    const schema = Joi.object({
      password: Joi.string().min(8).required()
    })
    const { error } = schema.validate(obj, { abortEarly: false })
    return error
  }

  async onActivate (obj) {
    const schema = Joi.object({
      token: Joi.string().required()
    })
    const { error } = schema.validate(obj, { abortEarly: false })
    return error
  }

  async onResendActivation (obj) {
    const schema = Joi.object({
      email: Joi.string().email()
    })
    const { error } = schema.validate(obj)
    return error
  }

  async onUpdate (obj) {
    const schemaKeys = {
      name: Joi.string(),
      surname: Joi.string(),
      role: Joi.string(),
      active: Joi.boolean()
    }
    const schema = Joi.object().keys(schemaKeys)
    const { error } = schema.validate(obj, { abortEarly: false })
    return error
  }

  async onUpdateMe (obj) {
    const schemaKeys = {
      name: Joi.string(),
      surname: Joi.string(),
      language: Joi.string()
    }
    const schema = Joi.object().keys(schemaKeys)
    const { error } = schema.validate(obj, { abortEarly: false })
    return error
  }

  async onCreate (obj) {
    const emailExists = await UserService.oneBy({ email: obj.email })
    const schemaKeys = {
      name: Joi.string(),
      surname: Joi.string(),
      language: Joi.string(),
      role: Joi.string(),
      password: Joi.string(),
      active: Joi.boolean()
    }
    if (emailExists) {
      schemaKeys.email = Joi.string().invalid(obj.email).required()
    } else {
      schemaKeys.email = Joi.string().email().required()
    }
    const schema = Joi.object().keys(schemaKeys)
    const { error } = schema.validate(obj, { abortEarly: false })
    return error
  }
}

export default new UserValidator()
