import Joi from "@hapi/joi";

class TeamValidator {
  async onCreate(obj) {
    const schemaKeys = {
      name: Joi.string().required(),
      code: Joi.string().required(),
    };
    const schema = Joi.object().keys(schemaKeys);
    const { error } = schema.validate(obj, { abortEarly: false });
    return error;
  }

  async onUpdate(obj) {
    const schemaKeys = {
      name: Joi.string().required(),
    };
    const schema = Joi.object().keys(schemaKeys);
    const { error } = schema.validate(obj, { abortEarly: false });
    return error;
  }

  async onAddOrRemoveUser(obj) {
    const schemaKeys = {
      id: Joi.string().hex().length(24).required(),
      accountId: Joi.required(),
      userId: Joi.string().length(24).required(),
    };
    const schema = Joi.object().keys(schemaKeys);
    const { error } = schema.validate(obj, { abortEarly: false });
    return error;
  }
}

export default new TeamValidator();
