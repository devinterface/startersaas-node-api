const en = {
  webhookService: {
    paymentSuccessful: {
      subject: "[StarterSaaS] Payment completed",
      message: "Congratulations, your subscription has been renewed.",
      messageAdmin: "%{email} - %{subdomain} paid a subscription.",
    },
    newSubscription: {
      subject: "[StarterSaaS] New subscription activated",
      message: "Congratulations, your subscription has been activated.",
      messageAdmin: "%{email} - %{subdomain} activated a subscription.",
    },
    subscriptionUpdated: {
      subject: "[StarterSaaS] Subscription updated",
      message: "Congratulations, your subscription has been updated.",
      messageAdmin: "%{email} - %{subdomain} updated a subscription.",
    },
    paymentFailed: {
      subject: "[StarterSaaS] Payment failed",
      message:
        'Dear user, your payment wasn\'t successful. Please go to this <a href="%{stripeHostedInvoiceUrl}" target="_blank">url</a> to pay your subscription, otherwise your subscription will be deactivated on %{date}.',
      messageAdmin:
        "%{email} - %{subdomain} has a failed payment. His subscription will be deactivated on %{date}.",
    },
  },
  authService: {
    signup: {
      subject: "[StarterSaaS] New subscriber",
      messageAdmin: "%{email} - %{subdomain} has been subscribed.",
    },
  },
  subscriptionService: {
    runNotifyExpiringTrials: {
      subject:
        "[StarterSaaS] Trial version is expiring in %{daysToExpire} day/s",
      message:
        "Dear user, your trial period is exipring in %{daysToExpire} day/s. Please login and subscribe to a plan.",
    },
    runNotifyPaymentFailed: {
      subject:
        "[StarterSaaS] Subscription will be deactivated in %{daysToExpire} day/s",
      message:
        "Dear user, due to a failed payment your subscription will be deactivated on %{date}. Please login and check your credit card.",
    },
  },
};

export default en;
