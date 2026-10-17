type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Sends via the Resend HTTP API when RESEND_API_KEY is set.
 * Without a key it logs to the server console so local/dev still "works".
 */
export async function sendEmail({ to, subject, html, text }: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Mini ATS <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[email:skipped] To: ${to} | Subject: ${subject}\n${text ?? html}`);
    return { ok: true, skipped: true as const };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email:error] ${res.status} ${body}`);
      return { ok: false as const };
    }
    return { ok: true as const };
  } catch (e) {
    console.error("[email:error]", e);
    return { ok: false as const };
  }
}
