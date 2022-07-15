import Joi from '@hapi/joi'
import AccountService from './account.service.js'

class AccountValidator {
  async onSignup(obj) {
    const subdomainExists = await AccountService.oneBy({
      subdomain: obj.subdomain,
    });
    const schemaKeys = {
      privacyAccepted: Joi.boolean().required(),
      marketingAccepted: Joi.boolean().optional(),
    };
    if (subdomainExists) {
      schemaKeys.subdomain = Joi.string().invalid(obj.subdomain).required();
    } else {
      schemaKeys.subdomain = Joi.string().required();
    }
    const schema = Joi.object().keys(schemaKeys);
    const { error } = schema.validate(obj, { abortEarly: false });
    return error;
  }

  async onUpdate(obj) {
    const schemaKeys = {
      companyName: Joi.string(),
      companyVat: Joi.string(),
      companyBillingAddress: Joi.string(),
      companySdi: Joi.string().allow("").optional(),
      companyPhone: Joi.string(),
      companyEmail: Joi.string(),
      companyCountry: Joi.string(),
      companyPec: Joi.string(),
      marketingAccepted: Joi.boolean().optional(),
    };
    const schema = Joi.object().keys(schemaKeys);
    const { error } = schema.validate(obj, { abortEarly: false });
    return error;
  }
}

export default new AccountValidator();
