const it = {
  webhookService: {
    paymentSuccessful: {
      subject: "[StarterSaaS] Pagamento completato",
      message: "Congratulazioni, il tuo abbonamento è stato rinnovato.",
      messageAdmin: "%{email} - %{subdomain} ha pagato un abbonamento.",
    },
    newSubscription: {
      subject: "[StarterSaaS] Un nuovo abbonamento è stato attivato",
      message: "Congratulazioni, il tuo abbonamento è stato attivato.",
      messageAdmin: "%{email} - %{subdomain} ha attivato un abbonamento.",
    },
    subscriptionUpdated: {
      subject: "[StarterSaaS] Un abbonamento è stato aggiornato",
      message: "Congratulazioni, il tuo abbonamento è stato aggiornato.",
      messageAdmin: "%{email} - %{subdomain} ha aggiornato un abbonamento.",
    },
    paymentFailed: {
      subject: "[StarterSaaS] Un pagamento è fallito",
      message:
        'Caro utente, un tuo pagamento non è andato a buon fine. Se pregato di andare al più presto <a href="%{stripeHostedInvoiceUrl}" target="_blank">qui</a> per pagare la rata, altrimenti il tuo abbonamento sarà disattivato il %{date}.',
      messageAdmin:
        "%{email} - %{subdomain} ha un pagamento fallito. Il suo abbonamento sarà disattivato il %{date}.",
    },
  },
  authService: {
    signup: {
      subject: "[StarterSaaS] Nuovo iscritto",
      messageAdmin: "%{email} - %{subdomain} si è iscritto.",
    },
  },
  subscriptionService: {
    runNotifyExpiringTrials: {
      subject:
        "[StarterSaaS] Il periodo di prova scadrà in %{daysToExpire} giorno/i",
      message:
        "Caro utente, il tuo periodo di prova scadrà in %{daysToExpire} giorno/i. Sei pregato di accedere alla piattaforma e sottoscrivere un abbonamento per poter continuare.",
    },
    runNotifyPaymentFailed: {
      subject:
        "[StarterSaaS] L'abbonamento sarà disattivato in %{daysToExpire} giorno/i",
      message:
        "Caro utente, a causa di un pagamento fallito, il tuo abbonamento sarà disattivato il %{date}. Sei pregato di accedere e sistemare il metodo di pagamento.",
    },
  },
};

export default it;
