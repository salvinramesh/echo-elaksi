import nodemailer from "nodemailer";

export const sendMail = async (subject, receiver, body) => {
  try {
    // 1️⃣ Create reusable transporter
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: parseInt(process.env.NODEMAILER_PORT || "587"),
      secure: false, // Mailtrap uses STARTTLS, not SSL
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // avoid self-signed cert errors
      },
    });

    // 2️⃣ Define mail options
    const options = {
      from: `"Elaksi.in" <${process.env.FROM_EMAIL || "noreply@elaksi.in"}>`,
      to: receiver,
      subject: subject,
      html: body,
    };

    // 3️⃣ Send email
    const info = await transporter.sendMail(options);
    console.log(`✅ Email sent to ${receiver}: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed to ${receiver}:`, error.message);
    return { success: false, message: error.message };
  }
};
