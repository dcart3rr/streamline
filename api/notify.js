export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "RESEND_API_KEY not set" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { to, contractorName, lead } = body;
    if (!to || !lead) return res.status(400).json({ error: "Missing to or lead" });

    const urgencyEmoji = { emergency: "🚨", this_week: "📅", flexible: "🗓️" }[lead.urgency] || "📋";
    const tierColor = { hot: "#10B981", warm: "#F59E0B", cold: "#64748B" }[lead.tier] || "#64748B";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#090C11;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="margin-bottom:24px">
      <div style="font-size:13px;color:#64748B;margin-bottom:4px">STREAMLINE</div>
      <h1 style="font-size:24px;font-weight:700;color:#F8FAFC;margin:0;line-height:1.2">
        ${urgencyEmoji} New ${lead.tier?.toUpperCase()} Lead
      </h1>
      <p style="color:#64748B;font-size:13px;margin:6px 0 0">Hi ${contractorName} — a new lead just came in.</p>
    </div>

    <div style="background:#0F1319;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:16px">
      <div style="font-size:18px;font-weight:700;color:#F8FAFC;margin-bottom:4px">${lead.name}</div>
      <div style="font-size:13px;color:#64748B;margin-bottom:16px">${lead.service} · ${lead.zip}</div>
      <div style="display:grid;gap:8px">
        ${[
          ["Phone", lead.phone],
          ["Email", lead.email],
          ["Budget", lead.budget],
          ["Urgency", lead.urgency],
        ].map(([k,v]) => v && v !== "—" ? `
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
          <span style="color:#64748B">${k}</span>
          <span style="color:#CBD5E1;font-weight:500">${v}</span>
        </div>` : "").join("")}
      </div>
    </div>

    <div style="background:#0F1319;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Lead Score</div>
        <div style="font-size:28px;font-weight:700;color:${tierColor};line-height:1">${lead.score}</div>
        <div style="font-size:10px;color:#64748B">/ 100 · ${lead.tier}</div>
      </div>
      <a href="https://streamline-ecru.vercel.app" style="background:#2563EB;color:white;text-decoration:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:600">
        Open Dashboard →
      </a>
    </div>

    ${lead.description ? `
    <div style="background:#0F1319;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">What They Said</div>
      <div style="font-size:13px;color:#CBD5E1;line-height:1.6;font-style:italic">"${lead.description}"</div>
    </div>` : ""}

    <div style="font-size:11px;color:#374151;text-align:center;margin-top:24px">
      Streamline Lead Management · <a href="https://streamline-ecru.vercel.app" style="color:#3B82F6;text-decoration:none">Log in to respond</a>
    </div>
  </div>
</body>
</html>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Streamline <leads@streamline-ecru.vercel.app>",
        to: [to],
        subject: `${urgencyEmoji} New ${lead.tier} lead: ${lead.name} (${lead.service})`,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Resend error:", data);
      return res.status(response.status).json({ error: data?.message || JSON.stringify(data) });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Notify error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
