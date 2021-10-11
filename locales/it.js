module.exports = {
  errors: require('./it/errors.js'),
  models: require('./it/models.js'),
  email: require('./it/email.js'),
  labels: {
    loginViaFacebook: 'Login con Facebook',
    login: 'Login',
    orAccessWithEmail: 'oppure accedi con email',
    forgottenPassword: 'Password dimenticata?',
    clickHere: 'Clicca qui',
    notRegistered: 'Non ancora registrato?',
    activationEmailNotReceived: 'Non hai ricevuto la mail di attivazione?',
    signup: 'Registrazione',
    orRegisterWithEmail: 'Oppure registrati con la email',
    performSignup: 'Registrati',
    resetPassword: 'Resetta la password',
    forgotPassword: 'Password dimenticata',
    resendActivationLink: 'Reinvia link di attivazione',
    activateAccount: "Attiva l'account"
  },
  flashes: {
    userActivated: 'L\'utente è stato attivato',
    userCreatedSuccessfully: 'L\'utente è stato creato con successo.',
    activationEmailSent: "L'email di attivazione è stata inviata al tuo indirizzo. Controlla la tua casella di posta.",
    forgotEmailSent: "Un'email è stata inviata al tuo indirizzo. Controlla la tua casella di posta. Ti invito a controllare la tua casella di SPAM qualora non avessi ricevuto il messaggio.",
    api: {
      error: {
        forbidden: 'Accesso negato!',
        internalServerError: 'Internal server error!',
        unauthorized: 'Non autorizzato!',
        unknownError: 'Errore generico!',
        unprocessableEntity: 'Impossibile continuare!'
      }
    }
  }

}
