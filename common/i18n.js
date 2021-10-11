'use strict'
import Polyglot from 'node-polyglot'

const defaultLocale = process.env.DEFAULT_LOCALE
const availableLocales = JSON.stringify(process.env.AVAILABLE_LOCALES.split(' '))

const phrases = {
  en: require('../locales/en.js'),
  it: require('../locales/it.js'),
  fr: require('../locales/fr.js'),
  de: require('../locales/de.js'),
  es: require('../locales/es.js')
}

const polyglot = new Polyglot({ defaultLocale, phrases })

class I18n {
  availableLocales () {
    return availableLocales
  }

  t (key, interpolationOptions) {
    if (!interpolationOptions) interpolationOptions = {}
    return polyglot.t(`${polyglot.locale()}.${key}`, interpolationOptions)
  }

  __ (key, interpolationOptions) {
    return this.t(key, interpolationOptions)
  }

  locale (lang) {
    if (lang) {
      polyglot.locale(lang)
    }
    return polyglot.locale()
  }

  phrases () {
    return phrases
  }
}

export default new I18n()
