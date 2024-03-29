import _ from "lodash";
import AccountSerializer from "../accounts/account.serializer.js";
import AccountService from "../accounts/account.service.js";
import UserSerializer from "./user.serializer.js";
import UserService from "./user.service.js";
import UserValidator from "./user.validator.js";

class Controller {
  async byId(req, res) {
    const user = await UserService.oneBy({
      _id: req.params.id,
      accountId: req.user.accountId,
    });
    if (user) res.json(UserSerializer.show(user));
    else res.status(404).end();
  }

  async me(req, res) {
    const me = req.user;
    if (req.query.withAccount === "true") {
      const account = await AccountService.findById(me.accountId);
      me.account = AccountSerializer.show(account);
    }
    res.json(UserSerializer.show(me));
  }

  async updateMe(req, res) {
    const errors = await UserValidator.onUpdateMe(req.body);
    if (errors) {
      return res.status(422).json({
        success: false,
        errors: errors.details,
      });
    }
    const me = req.user.toObject();
    const userData = _.pick(req.body, ["name", "surname", "language"]);
    const result = await UserService.update(
      req.user.id,
      me.accountId,
      userData
    );
    if (result) {
      return res.json(UserSerializer.show(result));
    } else {
      return res.status(422).json({
        success: false,
        message: "Failed to update profile.",
      });
    }
  }

  async create(req, res) {
    const errors = await UserValidator.onCreate(req.body);
    if (errors) {
      return res.status(422).json({
        success: false,
        errors: errors.details,
      });
    }
    const userData = _.pick(req.body, [
      "email",
      "password",
      "name",
      "surname",
      "language",
      "role",
    ]);
    userData.email = userData.email.trim();
    userData.accountId = req.user.accountId;
    const user = await UserService.create(userData);
    if (user) {
      return res.json(UserSerializer.show(user));
    } else {
      return res.status(422).json({
        message: "Failed to save the user.",
      });
    }
  }

  async index(req, res) {
    const users = await UserService.find({ accountId: req.user.accountId });
    return res.json(UserSerializer.index(users));
  }

  async update(req, res) {
    const errors = await UserValidator.onUpdate(req.body);
    if (errors) {
      return res.status(422).json({
        success: false,
        errors: errors.details,
      });
    }
    const userData = _.pick(req.body, ["name", "surname", "role", "language"]);
    const result = await UserService.update(
      req.params.id,
      req.user.accountId,
      userData
    );
    if (result) {
      return res.json(UserSerializer.show(result.toObject()));
    } else {
      return res.status(422).json({
        success: false,
        message: "Failed to update user.",
      });
    }
  }

  async delete(req, res) {
    if (req.params.id !== req.user.id) {
      await UserService.delete(req.params.id, req.user.accountId);
      return res.json({
        success: true,
        message: "User delete successfully.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Failed to delete user.",
    });
  }

  async changeMyPassword(req, res) {
    const errors = await UserValidator.onResetMyPassword(req.body);
    if (errors) {
      return res.status(422).json({
        success: false,
        message: "Failed to update password",
        errors: errors.details,
      });
    }
    const data = _.pick(req.body, ["password"]);
    UserService.updatePassword(req.user.id, data.password.trim());
    return res.json({
      success: true,
      message: "Successfully changed password!",
    });
  }

  async generateSso(req, res) {
    // const userData = { sso: uuidv4() }
    // const result = await UserService.update(req.user.id, userData)
    // if (result) {
    //   return res.json({ sso: result.sso })
    // } else {
    //   return res.status(422).json({
    //     success: false,
    //     message: 'Failed to update profile.'
    //   })
    // }
    return res.json({ sso: req.user.sso });
  }
}
export default new Controller();
