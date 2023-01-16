import nodemailer from "nodemailer";
import debugLib from "debug";

const debug = debugLib("neith:server:services:mailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  from: "hello@neith.dev",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const Mailer = {
  sendEmail(text: string) {
    const d = new Date();
    debug("Sending email at %s", d.toISOString());
    return transporter.sendMail({
      to: "hello@neith.dev",
      from: "hello@neith.dev",
      subject: "Testing the dep notifier app!",
      text,
    });
  },
};
