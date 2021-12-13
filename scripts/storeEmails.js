import '../common/env.js'
import mongoose from '../common/localDatabase.js'
import l from '../common/logger.js'
import EmailService from '../api/emails/email.service.js'
import * as fs from 'fs'

(async function () {
  try {
    await EmailService.deleteMany({})
    for (const code of ['activate', 'activationLink', 'forgotPassword', 'notification']) {
      const email = fs.readFileSync(`views/mailer/${code}.email.liquid`, 'utf8')
      await EmailService.create({ code: code, lang: 'en', subject: `[Starter SaaS] ${code}`, body: email })
      l.info('Email was successfully stored on database')
    }
  } catch (error) {
    l.error('Email Error: ', error)
  } finally {
    await mongoose.connection.close()
  }
}())
