'use strict'
import i18n from '../common/i18n'

module.exports = function (options) {
  return function (req, res, next) {
    const lang = req.acceptsLanguages('en', 'it', 'fr', 'es', 'de')
    if (lang) {
      i18n.locale(lang)
    } else {
      i18n.locale('en')
    }
    next()
  }
}
