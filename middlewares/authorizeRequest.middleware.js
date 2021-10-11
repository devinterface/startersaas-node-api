import ApplicationError from '../libs/errors/application.error'
import {
  StatusCodes,
  getStatusCode
} from 'http-status-codes'

export default (allowedRoles, condition) => {
  return async (req, res, next) => {
    const user = req.user

    if (!user) {
      throw new ApplicationError(
        getStatusCode(StatusCodes.UNAUTHORIZED),
        'Not authorized',
        StatusCodes.UNAUTHORIZED)
    }

    let isAllowed = Array.isArray(allowedRoles) ? allowedRoles.includes(user.role) : user.role === allowedRoles
    if (condition && typeof condition === 'function') {
      isAllowed = await condition(user, req)
    }

    if (isAllowed) {
      next()
    } else {
      throw new ApplicationError(
        getStatusCode(StatusCodes.FORBIDDEN),
        'Access is forbidden',
        StatusCodes.FORBIDDEN)
    }
  }
}
