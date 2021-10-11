import axios from 'axios'
import querystring from 'querystring'
import parser from 'xml2json'
const fattura24endpoint = 'https://www.app.fattura24.com/api/v0.3'
const TOKEN_VALIDITY_URL = 'TestKey'
const INVOICE_URL = 'SaveDocument'

class Fattura24Client {
  constructor () {
    this.axiosInstance = axios.create({
      baseURL: fattura24endpoint,
      timeout: 5000,
      headers: { 'X-Custom-Header': 'foobar' }
    })
  }

  checkAPITokenValidity () {
    return this.axiosInstance.post(TOKEN_VALIDITY_URL, querystring.stringify({
      apiKey: process.env.FATTURA24_KEY
    }))
  }

  async createInvoice (document) {
    const response = await this.axiosInstance.post(INVOICE_URL, querystring.stringify({
      apiKey: process.env.FATTURA24_KEY,
      xml: document
    }))
    const jsonData = parser.toJson(response.data)
    return JSON.parse(jsonData)
  }
}

module.exports = new Fattura24Client()
