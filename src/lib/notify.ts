/**
 * Email notifications for new form responses.
 *
 * Uses Resend when RESEND_API_KEY + NOTIFY_FROM_EMAIL are set; otherwise
 * logs to the console (no-op in dev). Sending is always fire-and-forget: it
 * must never fail or slow down the response submission.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL;

interface NotifyArgs {
  formTitle: string;
  formSlug: string;
  responseId: string;
  answers: Array<{ label: string; value: string }>;
  createdAt: Date;
  notifyEmails: string[];
}

export async function notifyOnResponse(args: NotifyArgs): Promise<void> {
  const { notifyEmails, formTitle, formSlug, answers, createdAt } = args;

  if (notifyEmails.length === 0) return;

  const subject = `New response: ${formTitle}`;
  const text = [
    `You received a new response to "${formTitle}".`,
    "",
    `Time: ${createdAt.toISOString()}`,
    `Form: ${formSlug}`,
    "",
    "Answers:",
    ...answers.map((a) => `  • ${a.label}: ${a.value}`),
    "",
    `View all responses: ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/forms`,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px">New response: ${escapeHtml(formTitle)}</h2>
      <p style="color:#64748b;margin:0 0 16px;font-size:13px">
        ${escapeHtml(createdAt.toLocaleString())}
      </p>
      <h3 style="margin:16px 0 8px;font-size:14px">Answers</h3>
      <table style="width:100%;border-collapse:collapse">
        ${answers
          .map(
            (a) =>
              `<tr><td style="padding:6px 0;font-weight:600;vertical-align:top">${escapeHtml(a.label)}</td>` +
              `<td style="padding:6px 0 6px 12px">${escapeHtml(a.value)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin-top:24px">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard" style="color:#4f46e5">View in dashboard</a>
      </p>
    </div>
  `;

  if (!RESEND_API_KEY || !NOTIFY_FROM_EMAIL) {
    console.log(`[notify] (dev) would email ${notifyEmails.join(", ")}: ${subject}`);
    console.log(text);
    return;
  }

  // Fire-and-forget: never throw, never block the response.
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFY_FROM_EMAIL,
        to: notifyEmails,
        subject,
        text,
        html,
      }),
    });
  } catch (err) {
    console.error("[notify] failed to send email:", err);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
