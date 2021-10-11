import mongoose from '../common/localDatabase'
import l from '../common/logger'
import UserService from '../api/users/user.service.js'

(async function () {
  try {
    const users = await UserService.all()
    for (const user of users) {
      user.accountId = user.account
      user.role = 'admin'
      user.language = 'it'
      await user.save()
    }
    l.info('User was successfully updated')
  } catch (error) {
    l.error('Update user Error: ', error)
  } finally {
    await mongoose.connection.close()
  }
}())
