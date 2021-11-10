import i18n from '../common/i18n.js'
import transporter from '../common/transporter.js'
import Mustache from 'mustache'
import * as fs from 'fs'

class EmailService {
  async forgotPasswordLink (user) {
    const data = fs.readFileSync('views/mailer/forgot_password.html', 'utf8')
    const emailText = await Mustache.render(data, {
      email: user.email,
      passwordResetToken: user.passwordResetToken,
      frontendForgotURL: process.env.FRONTEND_FORGOT_URL,
      t: i18n.t
    })
    const mailOptions = {
      to: user.email,
      from: process.env.DEFAULT_EMAIL_FROM,
      subject: 'Starter SAAS] Reset password code',
      html: emailText
    }
    const result = await transporter.sendMail(mailOptions)
    return result
  }

  async sendActivationEmail (user) {
    const data = fs.readFileSync('views/mailer/activation_email.html', 'utf8')
    const emailText = await Mustache.render(data, {
      email: user.email,
      confirmationToken: user.confirmationToken,
      frontendActivationURL: process.env.FRONTEND_ACTIVATION_URL,
      t: i18n.t
    })
    const mailOptions = {
      to: user.email,
      from: process.env.DEFAULT_EMAIL_FROM,
      subject: '[Starter SAAS] Activation code',
      html: emailText
    }
    const result = await transporter.sendMail(mailOptions)
    return result
  }

  async activated (user) {
    const data = fs.readFileSync('views/mailer/activate.html', 'utf8')
    const emailText = await Mustache.render(data, {
      email: user.email,
      frontendLoginURL: process.env.FRONTEND_LOGIN_URL,
      t: i18n.t
    })
    const mailOptions = {
      to: user.email,
      from: process.env.DEFAULT_EMAIL_FROM,
      subject: '[Starter SAAS] Account activated',
      html: emailText
    }
    const result = await transporter.sendMail(mailOptions)
    return result
  }

  async generalNotification (toEmail, subject, title, text) {
    const data = fs.readFileSync('views/mailer/notification.html', 'utf8')
    const emailText = Mustache.render(data, {
      email: toEmail,
      title: title,
      content: text,
      frontendLoginURL: process.env.FRONTEND_LOGIN_URL
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
