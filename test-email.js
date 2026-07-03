const nodemailer = require("nodemailer");
require("dotenv").config({ path: ".env.local" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

transporter.sendMail(
  {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER, // send to yourself for the test
    subject: "Test email from AlumniConnect",
    text: "If you got this, your app password works.",
  },
  (err, info) => {
    if (err) {
      console.error("FAILED:", err);
    } else {
      console.log("SUCCESS:", info.response);
    }
  }
);