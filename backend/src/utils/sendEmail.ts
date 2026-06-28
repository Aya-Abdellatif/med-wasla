import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (process.env.NODE_ENV === "test") return;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass)
    throw new Error("EMAIL_USER and EMAIL_PASS must be set");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  await transporter.sendMail({
    from: `"MedWasla" <${user}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export default sendEmail;