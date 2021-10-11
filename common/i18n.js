import Polyglot from 'node-polyglot'

import en from '../locales/en.js'
import it from '../locales/it.js'

const defaultLocale = process.env.DEFAULT_LOCALE
const availableLocales = JSON.stringify(process.env.AVAILABLE_LOCALES.split(' '))

const phrases = {
  en: en,
  it: it
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
