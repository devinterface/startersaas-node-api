import {
  default as localDatabase,
  default as mongoose,
} from "../../common/localDatabase.js";

const schema = new localDatabase.Schema(
  {
    name: String,
    code: String,
    users: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        email: { type: String },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

schema.virtual("id").get(function () {
  return this._id;
});

schema.statics.maxTeamsPerPlan = function (plan) {
  if (plan == "starter") {
    return 5;
  } else if (plan == "basic") {
    return 10;
  } else if (plan == "pro") {
    return 20;
  } else {
    return 0;
  }
};

const Team = localDatabase.model("Team", schema, "team");

export default Team;
