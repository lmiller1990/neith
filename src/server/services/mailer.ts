import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  from: "no-reply@neith.dev",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export function sendEmail(content: string) {
  const d = new Date();
  return transporter.sendMail({
    to: "hello@neith.dev",
    from: "no-reply@neith.dev",
    subject: "Testing the dep notifier app!",
    text: `Hi! This email was sent at #toISOString: ${d.toISOString()}. #toLocaleString: ${d.toLocaleString()}`,
  });
}