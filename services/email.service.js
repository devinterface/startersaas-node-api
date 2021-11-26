import i18n from '../common/i18n.js'
import transporter from '../common/transporter.js'
import { Liquid } from 'liquidjs'
import * as fs from 'fs'

class EmailService {
  async forgotPasswordLink (user) {
    const data = fs.readFileSync('views/mailer/forgotPassword.email.liquid', 'utf8')
    const engine = new Liquid()
    const emailText = await engine
      .parseAndRender(data, {
        email: user.email,
        passwordResetToken: user.passwordResetToken,
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
    const data = fs.readFileSync('views/mailer/activationLink.email.liquid', 'utf8')
    const engine = new Liquid()
    const emailText = await engine
      .parseAndRender(data, {
        email: user.email,
        confirmationToken: user.confirmationToken
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
    const data = fs.readFileSync('views/mailer/activate.email.liquid', 'utf8')
    const engine = new Liquid()
    const emailText = await engine
      .parseAndRender(data, {
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

  async generalNotification (toEmail, subject, message) {
    const data = fs.readFileSync('views/mailer/notification.email.liquid', 'utf8')
    const engine = new Liquid()
    const emailText = await engine
      .parseAndRender(data, {
        email: toEmail,
        message: message,
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
