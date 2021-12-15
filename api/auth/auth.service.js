import User from '../users/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import AccountService from '../accounts/account.service.js'
import UserService from '../users/user.service.js'
import EmailService from '../emails/email.service.js'
import ROLES from '../users/role.model.js'
import moment from 'moment'
import i18n from '../../common/i18n.js'

class AuthService {
  async login (email, password, isRefresh = false) {
    const user = await User.findOne({ email: email, active: true }).exec()
    if (!user) {
      return
    }
    const authenticated = isRefresh || await bcrypt.compare(password, user.password)
    if (authenticated) {
      return this.generateToken(user.email)
    }
  }

  async signup (accountData, userData) {
    accountData.subdomain = accountData.subdomain.toLowerCase()
    accountData.trialPeriodEndsAt = moment().add(process.env.TRIAL_DAYS, 'days')
    const account = await AccountService.create(accountData)
    userData.accountId = account._id
    userData.email = userData.email.trim().toLowerCase()
    userData.role = ROLES.ADMIN
    const user = await UserService.create(userData)
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, i18n.t('authService.signup.subject'), i18n.t('authService.signup.messageAdmin', { email: userData.email, subdomain: accountData.subdomain }))
    return { account: account, user: user }
  }

  async activate (token, email) {
    const user = await User.findOneAndUpdate({ confirmationToken: token, active: false }, { confirmationToken: null, active: true, email: email }, { new: true })
    if (user) {
      EmailService.activated(user)
    }
    return user
  }

  async signupWithActivate (accountData, userData) {
    accountData.subdomain = accountData.subdomain.toLowerCase()
    accountData.trialPeriodEndsAt = moment().add(process.env.TRIAL_DAYS, 'days')
    const account = await AccountService.create(accountData)
    userData.accountId = account._id
    userData.email = userData.email.trim().toLowerCase()
    userData.role = ROLES.ADMIN

    // signup and activate at the same time
    userData.active = true

    const user = await UserService.create(userData)

    EmailService.activated(user)
    EmailService.generalNotification(process.env.NOTIFIED_ADMIN_EMAIL, i18n.t('authService.signup.subject'), i18n.t('authService.signup.messageAdmin', { email: userData.email, subdomain: accountData.subdomain }))
    const token = await this.generateToken(user.email)
    return { account: account, user: user, token: token }
  }

  async resendActivation (email) {
    const user = await User.findOne({ email: email, active: false }).exec()
    if (user) {
      EmailService.sendActivationEmail(user)
    }
    return user
  }

  async forgotPassword (email) {
    const user = await User.findOne({ email: email }).exec()
    if (user) {
      user.passwordResetToken = (Math.floor(100000 + Math.random() * 900000)).toString()
      user.passwordResetExpires = new Date(Date.now() + 3600000)
      await user.save()
      EmailService.forgotPasswordLink(user)
      return user
    }
  }

  async resetPassword (passwordResetToken, password, email) {
    const user = await User.findOne({ passwordResetToken: passwordResetToken, email: email }).exec()
    if (user) {
      const currentDate = new Date()
      const tokenExpDate = user.passwordResetExpires
      if (currentDate > tokenExpDate) {
        return false
      }
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(password.trim(), salt)
      user.password = hash
      await user.save()
      return true
    }
    return false
  }

  async ssoLogin (sso) {
    const user = await User.findOne({ sso: sso, active: true }).exec()
    if (!user) {
      return
    }
    return this.generateToken(user.email)
  }

  async generateToken (email) {
    const user = await User.findOne({ email: email, active: true }).exec()
    const payload = { user: { email: user.email, role: user.role } }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
    return token
  }
}

export default new AuthService()
