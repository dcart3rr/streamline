export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({ error: "Twilio env vars not set (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { to, lead } = body;
    if (!to || !lead) return res.status(400).json({ error: "Missing to or lead" });

    const urgencyEmoji = { emergency: "🚨", this_week: "📅", flexible: "🗓️" }[lead.urgency] || "📋";
    const message = `${urgencyEmoji} New ${lead.tier?.toUpperCase()} lead on Streamline!\n\n${lead.name} · ${lead.service}\n📞 ${lead.phone}\n💰 ${lead.budget || "—"}\nScore: ${lead.score}/100\n\nLog in to respond: https://streamline-ecru.vercel.app`;

    // Clean phone number to E.164
    const cleaned = to.replace(/\D/g, "");
    const e164 = cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`;

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: e164,
          Body: message,
        }).toString(),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Twilio error:", data);
      return res.status(response.status).json({ error: data?.message || JSON.stringify(data) });
    }

    return res.status(200).json({ ok: true, sid: data.sid });
  } catch (err) {
    console.error("SMS error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
