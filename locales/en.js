module.exports = {
  errors: require('./it/errors.js'),
  models: require('./it/models.js'),
  email: require('./it/email.js'),
  labels: {
    loginViaFacebook: 'Login via Facebook',
    login: 'Login',
    orAccessWithEmail: 'or access with email',
    forgottenPassword: 'Forgot your password?',
    clickHere: 'Clicca qui',
    notRegistered: 'Non ancora registrato?',
    activationEmailNotReceived: 'Non hai ricevuto la mail di attivazione?',
    signup: 'Registrazione',
    orRegisterWithEmail: 'Oppure registrati con la email',
    performSignup: 'Registrati',
    resetPassword: 'Reset password',
    forgotPassword: 'Password dimenticata',
    resendActivationLink: 'Reinvia link di attivazione',
    activateAccount: 'Attiva account'
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
