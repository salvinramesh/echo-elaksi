// /var/www/echo-elaksi/email/sendMail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: "/var/www/echo-elaksi/.env" });

const {
  NODEMAILER_HOST,
  NODEMAILER_PORT,
  NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD,
} = process.env;

if (!NODEMAILER_HOST || !NODEMAILER_PORT || !NODEMAILER_EMAIL || !NODEMAILER_PASSWORD) {
  console.warn("sendMail: missing NODEMAILER env vars. Check .env");
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const port = Number(NODEMAILER_PORT) || 465;
  const isSecure = port === 465;

  transporter = nodemailer.createTransport({
    host: NODEMAILER_HOST || "smtp.gmail.com",
    port,
    secure: isSecure, // true for 465, false for 587
    auth: {
      user: NODEMAILER_EMAIL,
      pass: NODEMAILER_PASSWORD,
    },

    // pooling keeps connections alive and avoids connection churn
    pool: true,
    maxConnections: 5,
    maxMessages: 100,

    // sensible timeouts
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,

    // tune tls if you hit handshake issues (true is safer)
    tls: {
      rejectUnauthorized: true,
    },

    // set to true while debugging; can be noisy
    logger: false,
    debug: false,
  });

  // verify once and log result
  transporter.verify()
    .then(() => console.log("sendMail: transporter verified"))
    .catch(err => console.error("sendMail: transporter verify failed:", err && err.message ? err.message : err));

  return transporter;
}

/**
 * sendMail(subject, receiver, htmlBody)
 * returns { success: true, info } on success
 * throws on error (so route can respond accordingly)
 */
export const sendMail = async (subject, receiver, body) => {
  const t = getTransporter();

  const mailOptions = {
    from: `"elaksi.in" <${NODEMAILER_EMAIL}>`,
    to: receiver,
    subject,
    html: body,
  };

  console.log(`sendMail: attempt to=${receiver}`);

  try {
    const info = await t.sendMail(mailOptions);
    console.log("sendMail: sent OK", info.messageId, info.response);
    return { success: true, info };
  } catch (err) {
    // log useful debug information
    console.error("sendMail: ERROR", err && err.code ? `${err.code} - ${err.message}` : err && err.message ? err.message : err);
    // rethrow so caller can choose to return 500 or retry
    throw err;
  }
};
