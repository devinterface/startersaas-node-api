import mongoose from "mongoose";
import localDatabase from "../../common/localDatabase.js";

const schema = new localDatabase.Schema(
  {
    name: String,
    surname: String,
    email: String,
    language: String,
    password: String,
    role: String,
    active: {
      type: Boolean,
      default: false,
    },
    confirmationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    sso: String,
    accountOwner: {
      type: Boolean,
      default: false,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

schema.virtual("id").get(function () {
  return this._id;
});

const User = localDatabase.model("User", schema, "user");

export default User;
