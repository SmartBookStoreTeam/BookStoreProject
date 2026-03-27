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
    from: process.env.EMAIL_FROM || "Online Bookstore <noreply@online.com>",
    ...options,
  });

// ── Email 1: Sent to user right after submission ───────────────────────────────
export const sendBookRequestReceivedEmail = async (user, request) => {
  await send({
    to: user.email,
    subject: `📚 We received your book request — "${request.title}"`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937">
        <h2 style="color:#2563eb">Book Request Received!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for submitting your book to <strong>Online Bookstore</strong>. We've received your request and our team will review it within <strong>3–5 business days</strong>.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0"><strong>📖 Title:</strong> ${request.title}</p>
          <p style="margin:8px 0 0"><strong>🆔 Request ID:</strong> <code>${request._id}</code></p>
          <p style="margin:8px 0 0"><strong>📅 Submitted:</strong> ${new Date(request.createdAt).toLocaleDateString()}</p>
        </div>
        <p>You can track your request status anytime from your dashboard.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard/my-requests"
           style="display:inline-block;background:#2563eb;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;margin-top:8px">
          View My Requests
        </a>
        <p style="margin-top:24px;color:#6b7280;font-size:13px">Online Bookstore Team</p>
      </div>
    `,
  });
};

// ── Email 2: Sent whenever admin changes the status ────────────────────────────
export const sendBookRequestStatusEmail = async (user, request) => {
  const config = {
    approved: {
      emoji: "✅",
      color: "#16a34a",
      subject: `✅ Your book has been approved — "${request.title}"`,
      heading: "Your Book Is Live!",
      body: `Great news! <strong>"${request.title}"</strong> has been approved and is now available on Online Bookstore.`,
    },
    rejected: {
      emoji: "❌",
      color: "#dc2626",
      subject: `❌ Book request update — "${request.title}"`,
      heading: "Request Not Approved",
      body: `Unfortunately, your request for <strong>"${request.title}"</strong> was not approved at this time.`,
    },
    revision_requested: {
      emoji: "📝",
      color: "#d97706",
      subject: `📝 Revision needed — "${request.title}"`,
      heading: "Revision Requested",
      body: `Our team has reviewed <strong>"${request.title}"</strong> and needs some changes before we can approve it.`,
    },
    under_review: {
      emoji: "🔍",
      color: "#2563eb",
      subject: `🔍 Your book is under review — "${request.title}"`,
      heading: "Under Review",
      body: `Good news! <strong>"${request.title}"</strong> is now being reviewed by our editorial team.`,
    },
  };

  const c = config[request.status];
  if (!c) return; // unknown status — skip email

  await send({
    to: user.email,
    subject: c.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937">
        <h2 style="color:${c.color}">${c.emoji} ${c.heading}</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>${c.body}</p>

        ${
          request.adminFeedback
            ? `
          <div style="border-left:4px solid ${c.color};background:#fefce8;padding:14px 16px;border-radius:6px;margin:20px 0">
            <strong>Admin Feedback:</strong>
            <p style="margin:8px 0 0">${request.adminFeedback}</p>
          </div>
        `
            : ""
        }

        <a href="${process.env.CLIENT_URL}/dashboard/my-requests/${request._id}"
           style="display:inline-block;background:${c.color};color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;margin-top:8px">
          View Request
        </a>
        <p style="margin-top:24px;color:#6b7280;font-size:13px">Online Bookstore Team</p>
      </div>
    `,
  });
};
