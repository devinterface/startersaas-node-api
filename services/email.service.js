import pug from 'pug'
import i18n from '../common/i18n.js'
import transporter from '../common/transporter.js'

class EmailService {
  async forgotPasswordLink(user) {
    const emailText = pug.renderFile('views/mailer/modify_password.pug', {
      email: user.email,
      passwordResetToken: user.passwordResetToken,
      frontendForgotURL: process.env.FRONTEND_FORGOT_URL,
      t: i18n.t
    })
    const mailOptions = {
      to: user.email,
      from: process.env.DEFAULT_EMAIL_FROM,
      subject: '[Starter SAAS] Istruzioni di recupero password',
      html: emailText
    }
    const result = await transporter.sendMail(mailOptions)
    return result
  }

  async sendActivationEmail(user) {
    const emailText = await pug.renderFile('views/mailer/confirm_account.pug', {
      email: user.email,
      confirmationToken: user.confirmationToken,
      frontendActivationURL: process.env.FRONTEND_ACTIVATION_URL,
      t: i18n.t
    })
    const mailOptions = {
      to: user.email,
      from: process.env.DEFAULT_EMAIL_FROM,
      subject: '[Starter SAAS] Istruzioni di attivazione account',
      html: emailText
    }
    const result = await transporter.sendMail(mailOptions)
    return result
  }

  async activated(user) {
    const emailText = await pug.renderFile('views/mailer/account_activated.pug', {
      email: user.email,
      frontendLoginURL: process.env.FRONTEND_LOGIN_URL,
      t: i18n.t
    })
    const mailOptions = {
      to: user.email,
      from: process.env.DEFAULT_EMAIL_FROM,
      subject: '[Starter SAAS] Attivazione completata!',
      html: emailText
    }
    const result = await transporter.sendMail(mailOptions)
    return result
  }

  async passwordChanged(user) {
    const emailText = await pug.renderFile('views/mailer/password_changed.pug', {
      email: user.email,
      frontendLoginURL: process.env.FRONTEND_LOGIN_URL,
      t: i18n.t
    })
    const mailOptions = {
      to: user.email,
      from: process.env.DEFAULT_EMAIL_FROM,
      subject: '[Starter SAAS] Password modificata con successo!',
      html: emailText
    }
    const result = await transporter.sendMail(mailOptions)
    return result
  }

  async stripeNotification(user, subject, title, text) {
    const emailText = pug.renderFile('views/mailer/generic.pug', {
      title: title,
      content: text
    })
    const mailOptions = {
      to: user.email,
      from: process.env.DEFAULT_EMAIL_FROM,
      subject: subject,
      html: emailText
    }
    const result = await transporter.sendMail(mailOptions)
    return result
  }

  async generalNotification(toEmail, subject, title, text) {
    const emailText = pug.renderFile('views/mailer/generic.pug', {
      title: title,
      content: text
    })
    const mailOptions = {
      to: toEmail,
      from: process.env.DEFAULT_EMAIL_FROM,
      subject: subject,
      html: emailText
    }
    const result = await transporter.sendMail(mailOptions)
    return result
  }
}

export default new EmailService()
