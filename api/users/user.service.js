import User from './user.model.js'
import bcrypt from 'bcrypt'
import BaseService from '../../services/base.service.js'
import EmailService from '../../services/email.service.js'
import { v4 as uuidv4 } from 'uuid'

class UsersService extends BaseService {
  getModel () {
    return User
  }

  async create (data) {
    let sendForgot = false
    let sendConfirm = false
    if (data.password && data.password !== '') {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(data.password, salt)
      data.password = hash
    } else {
      data.passwordResetToken = (Math.floor(100000 + Math.random() * 900000)).toString()
      data.passwordResetExpires = new Date(Date.now() + 3600000)
      sendForgot = true
    }
    if (!data.active) {
      data.confirmationToken = (Math.floor(100000 + Math.random() * 900000)).toString()
      sendConfirm = true
    }
    data.sso = uuidv4()
    data.language = 'it'
    const user = new User(data)
    await user.save()
    if (sendForgot) { EmailService.forgotPasswordLink(data) }
    if (sendConfirm) { EmailService.sendActivationEmail(data) }
    return user
  }

  async updatePassword (userId, password) {
    const user = await this.byId(userId, {})
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)
    user.password = hash
    await user.save()
  }
}

export default new UsersService()
