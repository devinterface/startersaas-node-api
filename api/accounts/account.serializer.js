import BaseSerializer from "../../serializers/base.serializer.js";

class AccountSerializer extends BaseSerializer {
  constructor() {
    super();
    this.properties = [
      "_id",
      "subdomain",
      "companyName",
      "companyVat",
      "companyBillingAddress",
      "companySdi",
      "companyPec",
      "companyPhone",
      "companyEmail",
      "companyCountry",
      "paymentFailed",
      "paymentFailedFirstAt",
      "trialPeriodEndsAt",
      "paymentFailedSubscriptionEndsAt",
      "privacyAccepted",
      "marketingAccepted",
      "stripePlanId",
      "subscriptionExpiresAt",
      "planType",
      "createdAt",
      "updatedAt",
      "subscriptionStatus",
    ];
  }
}

export default new AccountSerializer();
