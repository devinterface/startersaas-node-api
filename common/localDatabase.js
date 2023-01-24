import mongoose from "mongoose";

const options = {
  autoIndex: false, // Don't build indexes
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.set("debug", process.env.DEBUG);
mongoose.connect(process.env.LOCAL_MONGO_CONNECTION, options);

export default mongoose;
