import WebhookService from "./webhook.service.js";

class Controller {
  async handleWebhook(req, res, next) {
    WebhookService.handleWebhook(req.body);
    return res.json({});
  }
}

export default new Controller();
