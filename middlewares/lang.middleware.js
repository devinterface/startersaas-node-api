import i18n from '../common/i18n.js'

const setLang = function (options) {
  return function (req, res, next) {
    const user = req.user
    if (user) {
      i18n.locale(user.language)
    } else {
      i18n.locale(process.env.DEFAULT_LOCALE)
    }
    next()
  }
}

export { setLang }
