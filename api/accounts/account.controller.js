import _ from "lodash";
import AccountService from "./account.service.js";
import AccountValidator from "./account.validator.js";

class Controller {
  async byId(req, res) {
    const account = await AccountService.byId(req.params.id);
    if (account) res.json(account);
    else res.status(404).end();
  }

  async update(req, res) {
    const accountData = _.pick(req.body, [
      "companyName",
      "companyVat",
      "companyBillingAddress",
      "companySdi",
      "companyPhone",
      "companyEmail",
      "companyPec",
      "companyCountry",
    ]);
    const accountErrors = await AccountValidator.onUpdate(accountData);
    if (accountErrors) {
      return res.status(422).json({
        success: false,
        errors: accountErrors.details,
      });
    }
    const result = await AccountService.update(req.params.id, accountData);
    if (result) {
      return res.json(result);
    } else {
      return res.status(422).json({
        success: false,
        message: "Failed to update account.",
      });
    }
  }
}
export default new Controller();
