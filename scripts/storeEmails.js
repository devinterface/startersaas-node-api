import * as fs from "fs";
import EmailService from "../api/emails/email.service.js";
import "../common/env.js";
import mongoose from "../common/localDatabase.js";
import l from "../common/logger.js";

(async function () {
  try {
    await EmailService.deleteMany({});
    for (const code of [
      ["activate", "Welcome"],
      ["activationLink", "Activation link"],
      ["forgotPassword", "Forgot password"],
      ["notification", "Notification"],
    ]) {
      const email = fs.readFileSync(
        `views/mailer/${code[0]}.email.liquid`,
        "utf8"
      );
      await EmailService.create({
        code: code[0],
        lang: "en",
        subject: `[StarterSaaS] ${code[1]}`,
        body: email,
      });
      l.info("Email was successfully stored on database");
    }
  } catch (error) {
    l.error("Email Error: ", error);
  } finally {
    await mongoose.connection.close();
  }
})();
