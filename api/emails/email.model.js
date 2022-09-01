import localDatabase from "../../common/localDatabase.js";

const schema = new localDatabase.Schema(
  {
    code: String,
    lang: String,
    subject: String,
    body: String,
  },
  { timestamps: true }
);

const Email = localDatabase.model("Email", schema, "email");

export default Email;
