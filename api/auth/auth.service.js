'use strict'
import User from '../users/user.model'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import AccountService from '../accounts/account.service'
import UserService from '../users/user.service'
import EmailService from '../../services/email.service'
import ROLES from '../users/role.model'
import moment from 'moment'

class AuthService {
  async login(email, password, isRefresh = false) {
    const user = await User.findOne({ email: email, active: true }).exec()
    if (!user) {
      return
    }
    const authenticated = isRefresh || await bcrypt.compare(password, user.password)
    if (authenticated) {
      return this.generateToken(user.email)
    }
  }

  async signup(accountData, userData) {
    accountData.subdomain = accountData.subdomain.toLowerCase()
    accountData.periodEndsAt = moment().add(process.env.TRIAL_DAYS, 'days')
    accountData.firstSubscription = false
    const account = await AccountService.create(accountData)
    userData.accountId = account._id
    userData.email = userData.email.trim().toLowerCase()
    userData.role = ROLES.ADMIN
    const user = await UserService.create(userData)
    return { account: account, user: user }
  }

  async activate(token) {
    const user = await User.findOneAndUpdate({ confirmationToken: token, active: false }, { confirmationToken: null, active: true }, { new: true })
    if (user) {
      EmailService.activated(user)
    }
    return user
  }

  async resendActivation(email) {
    const user = await User.findOne({ email: email, active: false }).exec()
    if (user) {
      EmailService.sendActivationEmail(user)
    }
    return user
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email: email }).exec()
    if (user) {
      user.passwordResetToken = uuidv4()
      user.passwordResetExpires = new Date(Date.now() + 3600000)
      await user.save()
      EmailService.forgotPasswordLink(user)
      return user
    }
  }

  async resetPassword(passwordResetToken, password) {
    const user = await User.findOne({ passwordResetToken: passwordResetToken }).exec()
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
      EmailService.passwordChanged(user)
      return true
    }
    return false
  }

  async ssoLogin(sso) {
    const user = await User.findOne({ sso: sso, active: true }).exec()
    if (!user) {
      return
    }
    return this.generateToken(user.email)
  }

  async generateToken(email) {
    const user = await User.findOne({ email: email, active: true }).exec()
    const payload = { user: { email: user.email, role: user.role } }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
    return token
  }
}

export default new AuthService()
