import moment from "moment";
import i18n from "../../common/i18n.js";
import BaseService from "../../services/base.service.js";
import stripeConf from "../../stripe.conf.js";
import AccountService from "../accounts/account.service.js";
import EmailService from "../emails/email.service.js";
import UserService from "../users/user.service.js";
import Webhook from "./webhook.model.js";

class WebhookService extends BaseService {
  getModel() {
    return Webhook;
  }

  async handleWebhook(data) {
    this.create({ payload: data });
    switch (data.type) {
      case "customer.subscription.updated":
        this.subscriptionUpdated(data);
        break;
      case "customer.subscription.created":
        this.subscriptionUpdated(data);
        break;
      case "invoice.paid":
        this.paymentSuccessful(data);
        break;
      case "invoice.payment_failed":
        this.paymentFailed(data);
        break;
      default:
        console.log(`Webhook: ${data.type}: No handler`);
    }
  }

  async paymentSuccessful(data) {
    const stripeCustomerId = data.data.object.customer;
    const account = await AccountService.oneBy({
      stripeCustomerId: stripeCustomerId,
    });
    if (!account) {
      return;
    }
    const user = await UserService.oneBy({
      accountId: account.id,
      accountOwner: true,
    });

    if (data.data.object.billing_reason === "subscription_create") {
      EmailService.generalNotification(
        user.email,
        i18n.t("webhookService.newSubscription.subject"),
        i18n.t("webhookService.newSubscription.message"),
        user.language
      );
      EmailService.generalNotification(
        process.env.NOTIFIED_ADMIN_EMAIL,
        i18n.t("webhookService.newSubscription.subject"),
        i18n.t("webhookService.newSubscription.messageAdmin", {
          email: user.email,
          subdomain: account.subdomain,
        })
      );
    }
    if (data.data.object.billing_reason === "subscription_update") {
      EmailService.generalNotification(
        user.email,
        i18n.t("webhookService.subscriptionUpdated.subject"),
        i18n.t("webhookService.subscriptionUpdated.message"),
        user.language
      );
      EmailService.generalNotification(
        process.env.NOTIFIED_ADMIN_EMAIL,
        i18n.t("webhookService.subscriptionUpdated.subject"),
        i18n.t("webhookService.subscriptionUpdated.messageAdmin", {
          email: user.email,
          subdomain: account.subdomain,
        })
      );
    }
    if (data.data.object.billing_reason === "subscription_cycle") {
      EmailService.generalNotification(
        user.email,
        i18n.t("webhookService.paymentSuccessful.subject"),
        i18n.t("webhookService.paymentSuccessful.message"),
        user.language
      );
      EmailService.generalNotification(
        process.env.NOTIFIED_ADMIN_EMAIL,
        i18n.t("webhookService.paymentSuccessful.subject"),
        i18n.t("webhookService.paymentSuccessful.messageAdmin", {
          email: user.email,
          subdomain: account.subdomain,
        })
      );
    }

    AccountService.update(account.id, {
      paymentFailed: false,
      active: true,
      paymentFailedFirstAt: null,
      paymentFailedSubscriptionEndsAt: null,
      trialPeriodEndsAt: null,
    });
    AccountService.generateInvoce(data, account, user);
  }

  async subscriptionUpdated(data) {
    const stripeCustomerId = data.data.object.customer;
    if (data.data.object.status !== "active") {
      return;
    }
    const account = await AccountService.oneBy({
      stripeCustomerId: stripeCustomerId,
    });
    if (!account) {
      return;
    }
    const user = await UserService.oneBy({
      accountId: account.id,
      accountOwner: true,
    });
    const expiresAt = data.data.object.cancel_at;
    account.subscriptionExpiresAt = expiresAt ? moment.unix(expiresAt) : null;
    account.stripePlanId = data.data.object.plan.id;
    account.planType = stripeConf.plans.find(
      (p) => p.id === data.data.object.plan.id
    ).planType;
    account.save();
  }

  async paymentFailed(data) {
    const stripeCustomerId = data.data.object.customer;
    if (
      data.data.object.billing_reason === "subscription_create" ||
      data.data.object.billing_reason === "subscription_update"
    ) {
      return;
    }
    // if (data.data.object.attempt_count >= 1) {
    let account = await AccountService.oneBy({
      stripeCustomerId: stripeCustomerId,
    });
    if (!account) {
      return;
    }
    const user = await UserService.oneBy({
      accountId: account.id,
      accountOwner: true,
    });
    if (!account.paymentFailedFirstAt) {
      const paymentFailedSubscriptionEndsAt = moment(Date.now()).add(
        process.env.PAYMENT_FAILED_RETRY_DAYS,
        "days"
      );
      account = await AccountService.update(account.id, {
        paymentFailed: true,
        paymentFailedFirstAt: Date.now(),
        paymentFailedSubscriptionEndsAt: paymentFailedSubscriptionEndsAt,
      });
    } else {
      account = await AccountService.update(account.id, {
        paymentFailed: true,
      });
    }
    const stripeHostedInvoiceUrl = data.data.object.hosted_invoice_url;
    EmailService.generalNotification(
      user.email,
      i18n.t("webhookService.paymentFailed.subject"),
      i18n.t("webhookService.paymentFailed.message", {
        date: moment(account.paymentFailedSubscriptionEndsAt).format(
          "DD/MM/YYYY"
        ),
        stripeHostedInvoiceUrl: stripeHostedInvoiceUrl,
      }),
      user.language
    );
    EmailService.generalNotification(
      process.env.NOTIFIED_ADMIN_EMAIL,
      i18n.t("webhookService.paymentFailed.subject"),
      i18n.t("webhookService.paymentFailed.messageAdmin", {
        email: user.email,
        subdomain: account.subdomain,
        date: moment(account.paymentFailedSubscriptionEndsAt).format(
          "DD/MM/YYYY"
        ),
      })
    );
    // }
  }
}

export default new WebhookService();
