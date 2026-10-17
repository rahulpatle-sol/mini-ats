function layout(title: string, body: string) {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#111;line-height:1.6;max-width:560px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 12px">${title}</h2>
${body}
<p style="margin-top:28px;color:#666;font-size:13px">— Mini ATS</p>
</body></html>`;
}

export function newCandidateEmail({ name, jobTitle, url }: { name: string; jobTitle: string; url: string }) {
  return {
    subject: `New candidate: ${name} for ${jobTitle}`,
    html: layout(
      "New candidate added",
      `<p><strong>${name}</strong> was added to the pipeline for <strong>${jobTitle}</strong>.</p>
       <p><a href="${url}">View candidate</a></p>`,
    ),
    text: `New candidate: ${name} applied for ${jobTitle}.\n${url}`,
  };
}

export function stageEmail({
  name,
  jobTitle,
  stage,
  note,
}: {
  name: string;
  jobTitle: string;
  stage: string;
  note?: string | null;
}) {
  const label = stage.charAt(0).toUpperCase() + stage.slice(1);
  return {
    subject: `Update on your application for ${jobTitle}`,
    html: layout(
      `You're now in the <strong>${label}</strong> stage`,
      `<p>Hi ${name},</p>
       <p>Your application for <strong>${jobTitle}</strong> has moved to the <strong>${label}</strong> stage.</p>
       ${note ? `<blockquote style="border-left:3px solid #ddd;margin:16px 0;padding:4px 16px;color:#444">${note}</blockquote>` : ""}
       <p>We will be in touch with next steps soon.</p>`,
    ),
    text: `Hi ${name}, your application for ${jobTitle} is now in the ${label} stage.${note ? `\nNote: ${note}` : ""}`,
  };
}
