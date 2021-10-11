import mongoose from 'mongoose'

const options = {
  autoIndex: false, // Don't build indexes
  useNewUrlParser: true,
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useUnifiedTopology: true,
  useFindAndModify: false
}
mongoose.set('debug', process.env.DEBUG)
mongoose.connect(process.env.LOCAL_MONGO_CONNECTION, options)

export default mongoose
