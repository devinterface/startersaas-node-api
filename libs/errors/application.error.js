class ApplicationError extends Error {
  constructor (message, state = {}, status) {
    super()

    this.message = message
    this.state = state
    this.status = status
  }
}

export default ApplicationError
