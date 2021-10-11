'use strict'
import apicache from 'apicache'
import { redisCacheCommon } from '../common/redisInstances'

const cache = apicache
  .options({
    redisClient: redisCacheCommon,
    debug: process.env.DEBUG,
    appendKey: (req, res) => req.method + req.headers.authorization.trim()
  })
  .middleware

const onlyStatus200 = (req, res) => res.statusCode === 200

const cacheSuccesses = cache('5 minutes', onlyStatus200)

module.exports = { cacheSuccesses }
