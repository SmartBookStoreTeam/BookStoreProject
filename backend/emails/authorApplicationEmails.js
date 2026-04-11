import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const send = (options) =>
  transporter.sendMail({
    from: process.env.EMAIL_FROM || "Online Bookstore <noreply@Online.com>",
    ...options,
  });

// ── Email 1: Application received ─────────────────────────────────────────────
export const sendApplicationReceivedEmail = async (user, application) => {
  await send({
    to: user.email,
    subject: `✍️ Author Application Received — Online Bookstore`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937">
        <h2 style="color:#2563eb">✍️ Application Received!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for applying to become an author on <strong>Online Bookstore</strong>.</p>
        <p>Our team will review your application and get back to you within <strong>3–5 business days</strong>.</p>

        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0"><strong>👤 Name:</strong> ${application.fullName}</p>
          <p style="margin:8px 0 0"><strong>🆔 Application ID:</strong> <code>${application._id}</code></p>
          <p style="margin:8px 0 0"><strong>📅 Submitted:</strong> ${new Date(application.createdAt).toLocaleDateString()}</p>
          <p style="margin:8px 0 0"><strong>📌 Status:</strong> Pending Review</p>
        </div>

        <p>You will receive an email once a decision has been made.</p>
        <p style="margin-top:24px;color:#6b7280;font-size:13px">Online Bookstore Team</p>
      </div>
    `,
  });
};

// ── Email 2: Application status update ────────────────────────────────────────
export const sendApplicationStatusEmail = async (user, application) => {
  const config = {
    approved: {
      emoji: "✅",
      color: "#16a34a",
      subject: `✅ Congratulations! You are now an Author — Online Bookstore`,
      heading: "You're Now an Author!",
      body: `Great news! Your author application has been <strong>approved</strong>. You can now log in and start uploading your books to Online Bookstore.`,
    },
    rejected: {
      emoji: "❌",
      color: "#dc2626",
      subject: `❌ Author Application Update — Online Bookstore`,
      heading: "Application Not Approved",
      body: `Unfortunately, your author application was not approved at this time.`,
    },
    under_review: {
      emoji: "🔍",
      color: "#2563eb",
      subject: `🔍 Your Application Is Under Review — Online Bookstore`,
      heading: "Under Review",
      body: `Good news! Your author application is currently being reviewed by our team.`,
    },
  };

  const c = config[application.status];
  if (!c) return;

  await send({
    to: user.email,
    subject: c.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937">
        <h2 style="color:${c.color}">${c.emoji} ${c.heading}</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>${c.body}</p>

        ${
          application.adminFeedback
            ? `
          <div style="border-left:4px solid ${c.color};background:#fef9c3;padding:14px 16px;border-radius:6px;margin:20px 0">
            <strong>Admin Feedback:</strong>
            <p style="margin:8px 0 0">${application.adminFeedback}</p>
          </div>
        `
            : ""
        }

        ${
          application.status === "approved"
            ? `
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="display:inline-block;background:#16a34a;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;margin-top:8px">
            Go to Dashboard
          </a>
        `
            : ""
        }

        <p style="margin-top:24px;color:#6b7280;font-size:13px">Online Bookstore Team</p>
      </div>
    `,
  });
};
