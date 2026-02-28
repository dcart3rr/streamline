import { useState, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  bg:       "#090C11",
  surface:  "#0F1319",
  surface2: "#151B25",
  surface3: "#1C2333",
  border:   "rgba(255,255,255,0.07)",
  border2:  "rgba(255,255,255,0.11)",
  blue:     "#2563EB",
  blueL:    "#3B82F6",
  cyan:     "#06B6D4",
  white:    "#F8FAFC",
  offWhite: "#CBD5E1",
  muted:    "#64748B",
  green:    "#10B981",
  amber:    "#F59E0B",
  red:      "#EF4444",
  orange:   "#F97316",
};

// ─── FONTS ───────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: ${T.bg}; color: ${T.white}; font-family: 'DM Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.surface}; }
  ::-webkit-scrollbar-thumb { background: ${T.surface3}; border-radius: 3px; }
  input, select, textarea, button { font-family: inherit; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
  .fade-up { animation: fadeUp 0.5s ease forwards; }
`;
document.head.appendChild(globalStyle);

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
const KEYS = { users: "sl_users", leads: "sl_leads", session: "sl_session" };

const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  seed: () => {
    if (!store.get(KEYS.users)) {
      store.set(KEYS.users, [{
        id: "u1", email: "demo@streamline.com", password: "demo1234",
        company: "Apex Climate Control", industry: "HVAC", plan: "Growth",
      }]);
    }
    if (!store.get(KEYS.leads)) {
      store.set(KEYS.leads, generateDemoLeads());
    }
  }
};

// ─── SCORING ENGINE ──────────────────────────────────────────────────────────
function scoreLeadData(data) {
  let score = 0;
  const breakdown = {};

  // 1. Budget (0–20)
  const budgetMap = {
    "under_500": 2, "500_1000": 6, "1000_2000": 12,
    "2000_5000": 17, "5000_plus": 20
  };
  breakdown.budget = budgetMap[data.budget] ?? 0;
  score += breakdown.budget;

  // 2. Urgency (0–20)
  const urgencyMap = { "flexible": 5, "this_week": 13, "emergency": 20 };
  breakdown.urgency = urgencyMap[data.urgency] ?? 0;
  score += breakdown.urgency;

  // 3. Owner status (0–15)
  const ownerMap = { "renter_no": 2, "renter_yes": 8, "owner": 15 };
  breakdown.ownership = ownerMap[data.ownership] ?? 0;
  score += breakdown.ownership;

  // 4. Property size (0–15)
  const sizeMap = {
    "under_1000": 6, "1000_2000": 10, "2000_3500": 13, "3500_plus": 15
  };
  breakdown.size = sizeMap[data.propertySize] ?? 0;
  score += breakdown.size;

  // 5. Issue clarity (0–15)
  const descLen = (data.issueDescription || "").trim().length;
  breakdown.clarity = descLen > 80 ? 15 : descLen > 30 ? 10 : descLen > 5 ? 6 : 0;
  score += breakdown.clarity;

  // 6. Contact completeness (0–15)
  let contact = 0;
  if (data.phone?.length >= 10) contact += 7;
  if (data.preferredTime) contact += 4;
  if (data.zipCode?.length >= 5) contact += 4;
  breakdown.contact = contact;
  score += breakdown.contact;

  const pct = Math.round(score);
  const tier = pct >= 75 ? "hot" : pct >= 50 ? "warm" : "cold";
  return { score: pct, breakdown, tier };
}

// ─── DEMO DATA ───────────────────────────────────────────────────────────────
function generateDemoLeads() {
  const names = ["Marcus T.", "Jennifer K.", "David R.", "Sarah M.", "Robert B.", "Lisa H.", "Tom W.", "Emily C.", "James P.", "Karen N."];
  const issues = ["AC not cooling", "Furnace won't start", "Duct cleaning", "AC replacement needed", "Heat pump issue", "New AC install", "Thermostat replacement", "Emergency AC repair", "Annual HVAC tune-up", "Boiler service"];
  const issueTypes = ["ac_repair","furnace","duct_cleaning","ac_replacement","heat_pump","ac_install","thermostat","ac_repair","maintenance","boiler"];
  const cities = ["Columbus", "Dublin", "Westerville", "Gahanna", "Grove City", "Hilliard", "Powell", "Newark"];
  const budgets = ["500_1000","1000_2000","2000_5000","5000_plus","1000_2000","2000_5000","500_1000","5000_plus","1000_2000","2000_5000"];
  const urgencies = ["emergency","this_week","flexible","emergency","this_week","this_week","flexible","emergency","flexible","this_week"];
  const ownerships = ["owner","owner","renter_yes","owner","owner","renter_no","owner","owner","owner","renter_yes"];
  const sizes = ["2000_3500","1000_2000","3500_plus","1000_2000","2000_3500","under_1000","2000_3500","3500_plus","1000_2000","2000_3500"];
  const statuses = ["new","new","new","contacted","won","lost","new","new","contacted","new"];
  const phones = ["(614) 555-0192","(614) 555-0847","(614) 555-0234","(614) 555-0561","(614) 555-0923","(614) 555-0145","(614) 555-0678","(614) 555-0312","(614) 555-0789","(614) 555-0456"];
  const times = ["Morning (8am–12pm)","Afternoon (12pm–5pm)","Evening (5pm–8pm)","Anytime","Morning (8am–12pm)","Afternoon (12pm–5pm)","Anytime","Morning (8am–12pm)","Evening (5pm–8pm)","Afternoon (12pm–5pm)"];
  const zips = ["43201","43016","43081","43230","43123","43026","43065","43055","43201","43230"];
  const descs = [
    "AC has been running but blowing warm air for 3 days. House is 90°F inside. Have a baby so need urgent help.",
    "Furnace stopped working overnight. It clicks but won't ignite. Carbon monoxide detector has been going off.",
    "Want to get all ducts cleaned before winter. Previous owner may not have maintained them.",
    "13-year-old AC unit is dying. Getting quotes to replace before summer peak.",
    "Heat pump cycles on and off every few minutes and doesn't hold temp.",
    "Building a new addition and need AC extended to cover the new rooms.",
    "Smart thermostat install — bought a Nest and need professional setup.",
    "AC went out during heat wave. Family with elderly parent inside. URGENT.",
    "Annual service and filter change, want a 2-year maintenance contract.",
    "Old boiler making loud banging sounds. Heat is uneven across the house.",
  ];

  return names.map((name, i) => {
    const data = {
      name, phone: phones[i], issueType: issueTypes[i], issueDescription: descs[i],
      urgency: urgencies[i], budget: budgets[i], ownership: ownerships[i],
      propertySize: sizes[i], preferredTime: times[i], zipCode: zips[i],
      city: cities[i % cities.length], industry: "HVAC", businessId: "u1",
    };
    const { score, breakdown, tier } = scoreLeadData(data);
    const daysAgo = Math.floor(Math.random() * 7);
    const d = new Date(); d.setDate(d.getDate() - daysAgo);
    return {
      id: `lead_${i+1}`, ...data, score, breakdown, tier,
      status: statuses[i],
      issueName: issues[i],
      createdAt: d.toISOString(),
      estimateRange: getEstimateRange(issueTypes[i], budgets[i]),
    };
  });
}

function getEstimateRange(issueType, budget) {
  const ranges = {
    ac_repair: "$350–$1,200", furnace: "$200–$900", duct_cleaning: "$300–$700",
    ac_replacement: "$3,500–$7,500", heat_pump: "$800–$2,500", ac_install: "$3,000–$6,500",
    thermostat: "$150–$400", maintenance: "$100–$250", boiler: "$500–$2,000",
  };
  return ranges[issueType] || "$400–$2,000";
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

// Shared styled primitives
const css = (styles) => Object.entries(styles).reduce((a,[k,v]) => a + `${k.replace(/([A-Z])/g,'-$1').toLowerCase()}:${v};`, "");

function Pill({ color, children }) {
  const colors = {
    hot: { bg: "rgba(239,68,68,0.15)", text: "#F87171", border: "rgba(239,68,68,0.3)" },
    warm: { bg: "rgba(245,158,11,0.15)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
    cold: { bg: "rgba(100,116,139,0.2)", text: "#94A3B8", border: "rgba(100,116,139,0.3)" },
    new: { bg: "rgba(37,99,235,0.2)", text: "#93C5FD", border: "rgba(37,99,235,0.3)" },
    contacted: { bg: "rgba(245,158,11,0.15)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
    won: { bg: "rgba(16,185,129,0.15)", text: "#34D399", border: "rgba(16,185,129,0.3)" },
    lost: { bg: "rgba(239,68,68,0.12)", text: "#F87171", border: "rgba(239,68,68,0.25)" },
  };
  const c = colors[color] || colors.new;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: 4, padding: "2px 8px",
      fontSize: 10, fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>{children}</span>
  );
}

function ScoreBar({ score, showLabel = false }) {
  const color = score >= 75 ? T.green : score >= 50 ? T.amber : T.muted;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: `linear-gradient(90deg, ${T.blue}, ${color})`, borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
      {showLabel && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color, minWidth: 32 }}>{score}</span>}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required, options, hint }) {
  const base = {
    width: "100%", background: T.surface2,
    border: `1px solid ${T.border2}`, borderRadius: 8,
    padding: "11px 14px", color: T.white, fontSize: 14,
    outline: "none", transition: "border-color 0.2s",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.offWhite, letterSpacing: "0.04em" }}>
        {label}{required && <span style={{ color: T.blueL, marginLeft: 3 }}>*</span>}
      </label>}
      {hint && <span style={{ fontSize: 11, color: T.muted, marginTop: -4 }}>{hint}</span>}
      {type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: "pointer" }}>
          <option value="">Select one…</option>
          {options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3} style={{ ...base, resize: "vertical", lineHeight: 1.6 }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} style={base} />
      )}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", size = "md", disabled, fullWidth, style = {} }) {
  const sizes = { sm: { padding: "7px 14px", fontSize: 13 }, md: { padding: "11px 22px", fontSize: 14 }, lg: { padding: "14px 28px", fontSize: 15 } };
  const variants = {
    primary: { background: T.blue, color: "white", border: "none" },
    outline: { background: "none", color: T.offWhite, border: `1px solid ${T.border2}` },
    ghost: { background: "none", color: T.muted, border: "none" },
    danger: { background: "rgba(239,68,68,0.12)", color: "#F87171", border: "1px solid rgba(239,68,68,0.25)" },
    success: { background: "rgba(16,185,129,0.12)", color: T.green, border: `1px solid rgba(16,185,129,0.25)` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...sizes[size], ...variants[variant],
      borderRadius: 8, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1, transition: "all 0.2s",
      width: fullWidth ? "100%" : "auto", ...style,
    }}>{children}</button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border2}`,
      borderRadius: 12, padding: 24, ...style,
    }}>{children}</div>
  );
}

function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.surface, border: `1px solid ${T.border2}`,
        borderRadius: 16, width, maxWidth: "100%", maxHeight: "90vh",
        overflow: "auto", animation: "fadeUp 0.25s ease",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.surface, zIndex: 1,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: T.white }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  const colors = { success: T.green, error: T.red, info: T.blueL };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 2000,
      background: T.surface2, border: `1px solid ${colors[type]}40`,
      borderRadius: 10, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
      animation: "slideIn 0.3s ease",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[type] }} />
      <span style={{ fontSize: 14, color: T.offWhite }}>{message}</span>
    </div>
  );
}

// ─── INTAKE FORM ─────────────────────────────────────────────────────────────
function IntakeForm({ onSubmitted }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    issueType: "", issueDescription: "", urgency: "",
    budget: "", ownership: "", propertySize: "",
    preferredTime: "", zipCode: "", city: "",
  });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const steps = [
    {
      title: "What do you need help with?",
      subtitle: "Tell us about your service request",
      fields: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Issue Type" value={form.issueType} onChange={set("issueType")} type="select" required options={[
            { value: "ac_repair", label: "AC Repair / Not Cooling" },
            { value: "ac_replacement", label: "AC Replacement" },
            { value: "ac_install", label: "New AC Install" },
            { value: "furnace", label: "Furnace / Heating Issue" },
            { value: "heat_pump", label: "Heat Pump Service" },
            { value: "duct_cleaning", label: "Duct Cleaning" },
            { value: "thermostat", label: "Thermostat Install / Repair" },
            { value: "boiler", label: "Boiler Service" },
            { value: "maintenance", label: "Annual Maintenance / Tune-Up" },
            { value: "other", label: "Other HVAC Issue" },
          ]} />
          <Input label="Describe the issue" value={form.issueDescription} onChange={set("issueDescription")}
            type="textarea" placeholder="Tell us what's happening in as much detail as possible. The more you share, the better estimate we can provide…" required />
        </div>
      ),
      valid: form.issueType && form.issueDescription.trim().length > 5,
    },
    {
      title: "How urgent is this?",
      subtitle: "Help us prioritize your request",
      fields: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { value: "emergency", label: "🚨 Emergency", sub: "Right now — I need help today" },
            { value: "this_week", label: "📅 This week", sub: "Urgent but can schedule a few days out" },
            { value: "flexible", label: "🗓️ Flexible", sub: "Planning ahead, no immediate rush" },
          ].map(opt => (
            <div key={opt.value} onClick={() => set("urgency")(opt.value)} style={{
              padding: "16px 20px", borderRadius: 10, cursor: "pointer",
              background: form.urgency === opt.value ? "rgba(37,99,235,0.12)" : T.surface2,
              border: `1px solid ${form.urgency === opt.value ? T.blue : T.border2}`,
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.white }}>{opt.label}</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>{opt.sub}</div>
            </div>
          ))}
        </div>
      ),
      valid: !!form.urgency,
    },
    {
      title: "About your property",
      subtitle: "This helps us give an accurate estimate",
      fields: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Property Size" value={form.propertySize} onChange={set("propertySize")} type="select" required options={[
            { value: "under_1000", label: "Under 1,000 sq ft" },
            { value: "1000_2000", label: "1,000 – 2,000 sq ft" },
            { value: "2000_3500", label: "2,000 – 3,500 sq ft" },
            { value: "3500_plus", label: "3,500+ sq ft" },
          ]} />
          <Input label="Do you own or rent?" value={form.ownership} onChange={set("ownership")} type="select" required options={[
            { value: "owner", label: "I own this property" },
            { value: "renter_yes", label: "I rent — landlord has approved repairs" },
            { value: "renter_no", label: "I rent — not sure about approval" },
          ]} />
          <Input label="Zip Code" value={form.zipCode} onChange={set("zipCode")} placeholder="e.g. 43201" required />
        </div>
      ),
      valid: form.propertySize && form.ownership && form.zipCode.length >= 5,
    },
    {
      title: "What's your budget?",
      subtitle: "Approximate range for this service",
      fields: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { value: "under_500", label: "Under $500" },
            { value: "500_1000", label: "$500 – $1,000" },
            { value: "1000_2000", label: "$1,000 – $2,000" },
            { value: "2000_5000", label: "$2,000 – $5,000" },
            { value: "5000_plus", label: "$5,000+" },
          ].map(opt => (
            <div key={opt.value} onClick={() => set("budget")(opt.value)} style={{
              padding: "14px 20px", borderRadius: 10, cursor: "pointer",
              background: form.budget === opt.value ? "rgba(37,99,235,0.12)" : T.surface2,
              border: `1px solid ${form.budget === opt.value ? T.blue : T.border2}`,
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: T.white }}>{opt.label}</span>
              {form.budget === opt.value && <span style={{ color: T.blueL }}>✓</span>}
            </div>
          ))}
        </div>
      ),
      valid: !!form.budget,
    },
    {
      title: "How can we reach you?",
      subtitle: "A local professional will contact you shortly",
      fields: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Full Name" value={form.name} onChange={set("name")} placeholder="Jane Smith" required />
          <Input label="Phone Number" value={form.phone} onChange={set("phone")} type="tel" placeholder="(614) 555-0000" required />
          <Input label="Email Address" value={form.email} onChange={set("email")} type="email" placeholder="jane@email.com" />
          <Input label="Preferred Contact Time" value={form.preferredTime} onChange={set("preferredTime")} type="select" options={[
            { value: "Morning (8am–12pm)", label: "Morning (8am – 12pm)" },
            { value: "Afternoon (12pm–5pm)", label: "Afternoon (12pm – 5pm)" },
            { value: "Evening (5pm–8pm)", label: "Evening (5pm – 8pm)" },
            { value: "Anytime", label: "Anytime" },
          ]} />
        </div>
      ),
      valid: form.name.trim().length > 1 && form.phone.replace(/\D/g,"").length >= 10,
    },
  ];

  const current = steps[step];

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    const { score, breakdown, tier } = scoreLeadData(form);
    const lead = {
      id: `lead_${Date.now()}`,
      ...form,
      issueName: form.issueType.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()),
      score, breakdown, tier, status: "new",
      industry: "HVAC", businessId: "u1",
      createdAt: new Date().toISOString(),
      estimateRange: getEstimateRange(form.issueType, form.budget),
      city: form.zipCode,
    };
    const leads = store.get(KEYS.leads) || [];
    store.set(KEYS.leads, [lead, ...leads]);
    setSubmitting(false);
    setDone(true);
    onSubmitted?.();
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 480, animation: "fadeUp 0.5s ease" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: `2px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 24px" }}>✓</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, letterSpacing: -1, marginBottom: 16 }}>You're all set.</h2>
          <p style={{ color: T.offWhite, lineHeight: 1.7, marginBottom: 32, fontSize: 16 }}>
            Your request has been received and a qualified local professional will reach out within the hour at your preferred contact time.
          </p>
          <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 12, padding: 20, textAlign: "left" }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Your request summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["Issue", form.issueName || form.issueType], ["Urgency", form.urgency], ["Budget", form.budget?.replace(/_/g," ")], ["Contact", form.phone]].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: T.muted }}>{k}</span>
                  <span style={{ color: T.white, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "20px 32px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 28, height: 28, background: T.blue, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", width: 12, height: 2, background: "white", borderRadius: 1, boxShadow: "0 -4px 0 white, 0 4px 0 rgba(255,255,255,0.5)" }} />
        </div>
        <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: T.white }}>Streamline</span>
        <span style={{ color: T.muted, fontSize: 14, marginLeft: 4 }}>· HVAC Quote Request</span>
      </div>

      {/* Progress */}
      <div style={{ padding: "0 32px", paddingTop: 8 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 4, marginTop: 20, marginBottom: 8 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? T.blue : T.border, transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>Step {step + 1} of {steps.length}</div>
        </div>
      </div>

      {/* Form body */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <div style={{ width: "100%", maxWidth: 560, animation: "fadeUp 0.35s ease" }} key={step}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, letterSpacing: -0.8, marginBottom: 6 }}>{current.title}</h2>
          <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>{current.subtitle}</p>
          {current.fields}
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            {step > 0 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>← Back</Button>}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!current.valid} style={{ marginLeft: "auto" }}>Continue →</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!current.valid || submitting} style={{ marginLeft: "auto" }}>
                {submitting ? "Submitting…" : "Submit Request →"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN / SIGNUP ───────────────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("demo@streamline.com");
  const [password, setPassword] = useState("demo1234");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const users = store.get(KEYS.users) || [];
    if (mode === "login") {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) { setError("Invalid email or password."); setLoading(false); return; }
      store.set(KEYS.session, user);
      onAuth(user);
    } else {
      if (users.find(u => u.email === email)) { setError("An account with this email already exists."); setLoading(false); return; }
      const user = { id: `u_${Date.now()}`, email, password, company, industry: "HVAC", plan: "Starter" };
      store.set(KEYS.users, [...users, user]);
      store.set(KEYS.session, user);
      onAuth(user);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(37,99,235,0.1), transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1, animation: "fadeUp 0.45s ease" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, justifyContent: "center" }}>
          <div style={{ width: 36, height: 36, background: T.blue, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", width: 16, height: 2, background: "white", borderRadius: 2, boxShadow: "0 -5px 0 white, 0 5px 0 rgba(255,255,255,0.5)" }} />
          </div>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: T.white, letterSpacing: -0.5 }}>Streamline</span>
        </div>

        <Card style={{ padding: "36px 40px" }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, letterSpacing: -0.8, marginBottom: 6 }}>
            {mode === "login" ? "Welcome back." : "Create your account."}
          </h2>
          <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>
            {mode === "login" ? "Sign in to access your lead dashboard." : "Start receiving qualified leads today."}
          </p>

          {mode === "login" && (
            <div style={{ background: "rgba(37,99,235,0.08)", border: `1px solid rgba(37,99,235,0.2)`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: T.offWhite }}>
              <span style={{ color: T.blueL, fontWeight: 600 }}>Demo: </span>demo@streamline.com / demo1234
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && <Input label="Company Name" value={company} onChange={setCompany} placeholder="Apex Climate Control" required />}
            <Input label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@company.com" required />
            <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" required />
          </div>

          {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: 13, color: "#F87171" }}>{error}</div>}

          <Button onClick={handleSubmit} disabled={loading} fullWidth style={{ marginTop: 24 }}>
            {loading ? "Signing in…" : mode === "login" ? "Sign In →" : "Create Account →"}
          </Button>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: T.muted }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ color: T.blueL, cursor: "pointer", fontWeight: 500 }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── LEAD DETAIL MODAL ────────────────────────────────────────────────────────
function LeadDetail({ lead, onClose, onStatusChange }) {
  if (!lead) return null;
  const breakdownLabels = {
    budget: "Budget Match", urgency: "Urgency", ownership: "Owner Status",
    size: "Property Size", clarity: "Issue Clarity", contact: "Contact Quality"
  };
  const maxScores = { budget: 20, urgency: 20, ownership: 15, size: 15, clarity: 15, contact: 15 };

  return (
    <Modal open={!!lead} onClose={onClose} title="Lead Details" width={600}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.white }}>{lead.name}</h3>
            <Pill color={lead.tier}>{lead.tier}</Pill>
            <Pill color={lead.status}>{lead.status}</Pill>
          </div>
          <div style={{ color: T.muted, fontSize: 13 }}>{lead.issueName} · {lead.zipCode || lead.city}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, color: lead.tier === "hot" ? T.green : lead.tier === "warm" ? T.amber : T.muted, fontWeight: 700 }}>{lead.score}</div>
          <div style={{ fontSize: 11, color: T.muted }}>Lead Score</div>
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{ background: T.surface2, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Score Breakdown</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.entries(lead.breakdown || {}).map(([key, val]) => {
            const max = maxScores[key] || 20;
            const pct = (val / max) * 100;
            const color = pct >= 75 ? T.green : pct >= 40 ? T.amber : T.red;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 110, fontSize: 12, color: T.offWhite }}>{breakdownLabels[key]}</div>
                <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color, width: 40, textAlign: "right" }}>{val}/{max}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          ["Phone", lead.phone],
          ["Contact Time", lead.preferredTime],
          ["Budget", lead.budget?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())],
          ["Estimate", lead.estimateRange],
          ["Property Size", lead.propertySize?.replace(/_/g," ")],
          ["Ownership", lead.ownership === "owner" ? "Homeowner" : "Renter"],
          ["Zip Code", lead.zipCode],
          ["Submitted", new Date(lead.createdAt).toLocaleDateString()],
        ].map(([label, val]) => val && (
          <div key={label} style={{ background: T.surface2, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, color: T.white, fontWeight: 500 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Issue description */}
      {lead.issueDescription && (
        <div style={{ background: T.surface2, borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Issue Description</div>
          <p style={{ fontSize: 14, color: T.offWhite, lineHeight: 1.7 }}>{lead.issueDescription}</p>
        </div>
      )}

      {/* Actions */}
      {lead.status !== "won" && lead.status !== "lost" && (
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="success" onClick={() => { onStatusChange(lead.id, "won"); onClose(); }} style={{ flex: 1 }}>✓ Mark as Won</Button>
          <Button variant="danger" onClick={() => { onStatusChange(lead.id, "lost"); onClose(); }} style={{ flex: 1 }}>✗ Mark as Lost</Button>
          {lead.status === "new" && (
            <Button variant="outline" onClick={() => { onStatusChange(lead.id, "contacted"); onClose(); }} style={{ flex: 1 }}>📞 Mark Contacted</Button>
          )}
        </div>
      )}
    </Modal>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState("pipeline"); // pipeline | analytics
  const [filter, setFilter] = useState("all"); // all | new | contacted | won | lost
  const [sort, setSort] = useState("score"); // score | date | budget
  const [selectedLead, setSelectedLead] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const loadLeads = useCallback(() => {
    const all = store.get(KEYS.leads) || [];
    setLeads(all.filter(l => l.businessId === user.id || l.businessId === "u1"));
  }, [user.id]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const updateStatus = (id, status) => {
    const all = store.get(KEYS.leads) || [];
    const updated = all.map(l => l.id === id ? { ...l, status } : l);
    store.set(KEYS.leads, updated);
    setLeads(updated.filter(l => l.businessId === user.id || l.businessId === "u1"));
    setToast({ message: `Lead marked as ${status}`, type: status === "won" ? "success" : "info" });
  };

  const filtered = leads
    .filter(l => filter === "all" || l.status === filter)
    .filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.issueName?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "score") return b.score - a.score;
      if (sort === "date") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "budget") return b.score - a.score;
      return 0;
    });

  // Analytics
  const total = leads.length;
  const won = leads.filter(l => l.status === "won").length;
  const lost = leads.filter(l => l.status === "lost").length;
  const active = leads.filter(l => l.status === "new" || l.status === "contacted").length;
  const closeRate = total > 0 ? Math.round((won / total) * 100) : 0;
  const avgScore = total > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / total) : 0;

  const tierCounts = { hot: leads.filter(l=>l.tier==="hot").length, warm: leads.filter(l=>l.tier==="warm").length, cold: leads.filter(l=>l.tier==="cold").length };

  const statusCounts = { new: 0, contacted: 0, won: 0, lost: 0 };
  leads.forEach(l => { if (statusCounts[l.status] !== undefined) statusCounts[l.status]++; });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* NAV */}
      <nav style={{
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", borderBottom: `1px solid ${T.border}`,
        background: "rgba(9,12,17,0.9)", backdropFilter: "blur(16px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, background: T.blue, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", width: 13, height: 2, background: "white", borderRadius: 1, boxShadow: "0 -4px 0 white, 0 4px 0 rgba(255,255,255,0.5)" }} />
          </div>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: T.white }}>Streamline</span>
          <span style={{ color: T.border2, fontSize: 16 }}>|</span>
          <span style={{ fontSize: 13, color: T.muted }}>HVAC Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Nav tabs */}
          {[{ id: "pipeline", label: "Pipeline" }, { id: "analytics", label: "Analytics" }].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 500, padding: "6px 12px", borderRadius: 6,
              color: view === tab.id ? T.white : T.muted,
              background: view === tab.id ? T.surface2 : "none",
              transition: "all 0.2s",
            }}>{tab.label}</button>
          ))}
          <div style={{ width: 1, height: 24, background: T.border }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {user.company?.[0] || user.email[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: T.offWhite }}>{user.company || user.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>Sign Out</Button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: "32px", maxWidth: 1280, margin: "0 auto", width: "100%" }}>

        {/* ── PIPELINE VIEW ── */}
        {view === "pipeline" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Stats strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Total Leads", value: total, color: T.blueL, sub: "All time" },
                { label: "Active Pipeline", value: active, color: T.cyan, sub: "New + Contacted" },
                { label: "Closed Won", value: won, color: T.green, sub: `${closeRate}% close rate` },
                { label: "Avg Lead Score", value: avgScore, color: T.amber, sub: "Out of 100" },
              ].map(s => (
                <div key={s.label} style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.white, marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Filters + Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…" style={{
                  width: "100%", background: T.surface, border: `1px solid ${T.border2}`,
                  borderRadius: 8, padding: "9px 14px 9px 36px", color: T.white, fontSize: 14, outline: "none",
                }} />
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 14 }}>🔍</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["all","new","contacted","won","lost"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "7px 14px", borderRadius: 7, border: `1px solid ${filter===f ? T.blue : T.border2}`,
                    background: filter===f ? "rgba(37,99,235,0.15)" : "none",
                    color: filter===f ? T.blueL : T.muted,
                    cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.15s",
                  }}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                    <span style={{ marginLeft: 5, opacity: 0.6, fontSize: 11 }}>{f==="all" ? leads.length : statusCounts[f]}</span>
                  </button>
                ))}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{
                background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 8,
                padding: "9px 12px", color: T.offWhite, fontSize: 13, cursor: "pointer", outline: "none",
              }}>
                <option value="score">Sort: Score ↓</option>
                <option value="date">Sort: Newest</option>
              </select>
            </div>

            {/* Lead table */}
            <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 14, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 100px 120px",
                padding: "12px 20px", borderBottom: `1px solid ${T.border}`,
                fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: T.muted,
                textTransform: "uppercase", letterSpacing: "0.07em",
              }}>
                {["Lead", "Issue", "Budget", "Score", "Tier", "Status", "Actions"].map(h => <div key={h}>{h}</div>)}
              </div>

              {filtered.length === 0 ? (
                <div style={{ padding: "48px", textAlign: "center", color: T.muted }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 15, color: T.offWhite, marginBottom: 6 }}>No leads found</div>
                  <div style={{ fontSize: 13 }}>Try adjusting your filters or search</div>
                </div>
              ) : filtered.map((lead, i) => (
                <div key={lead.id} onClick={() => setSelectedLead(lead)} style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 100px 120px",
                  padding: "14px 20px", borderBottom: i < filtered.length-1 ? `1px solid ${T.border}` : "none",
                  cursor: "pointer", transition: "background 0.15s",
                  background: "transparent",
                  animation: `fadeUp 0.3s ease ${i*0.04}s both`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 2 }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{lead.phone} · {new Date(lead.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 13, color: T.offWhite, alignSelf: "center" }}>{lead.issueName}</div>
                  <div style={{ fontSize: 13, color: T.offWhite, alignSelf: "center" }}>{lead.budget?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</div>
                  <div style={{ alignSelf: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ScoreBar score={lead.score} />
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: lead.tier==="hot" ? T.green : lead.tier==="warm" ? T.amber : T.muted, minWidth: 28 }}>{lead.score}</span>
                    </div>
                  </div>
                  <div style={{ alignSelf: "center" }}><Pill color={lead.tier}>{lead.tier}</Pill></div>
                  <div style={{ alignSelf: "center" }}><Pill color={lead.status}>{lead.status}</Pill></div>
                  <div style={{ alignSelf: "center", display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    {lead.status === "new" && (
                      <button onClick={() => updateStatus(lead.id, "contacted")} title="Mark contacted" style={{ background: "none", border: `1px solid ${T.border2}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: T.muted, fontSize: 13, transition: "all 0.15s" }}>📞</button>
                    )}
                    {lead.status !== "won" && lead.status !== "lost" && (
                      <>
                        <button onClick={() => updateStatus(lead.id, "won")} title="Mark won" style={{ background: "none", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: T.green, fontSize: 13 }}>✓</button>
                        <button onClick={() => updateStatus(lead.id, "lost")} title="Mark lost" style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: T.red, fontSize: 13 }}>✗</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYTICS VIEW ── */}
        {view === "analytics" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, letterSpacing: -1, marginBottom: 8 }}>Analytics</h2>
            <p style={{ color: T.muted, fontSize: 14, marginBottom: 32 }}>Performance overview for your lead pipeline.</p>

            {/* KPI grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Close Rate", value: `${closeRate}%`, sub: `${won} won of ${total} total`, color: T.green },
                { label: "Avg Lead Score", value: avgScore, sub: "Quality of incoming leads", color: T.amber },
                { label: "Active Pipeline", value: active, sub: `${won + lost} resolved`, color: T.blueL },
              ].map(k => (
                <Card key={k.label}>
                  <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{k.label}</div>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 44, color: k.color, letterSpacing: -2, lineHeight: 1, marginBottom: 8 }}>{k.value}</div>
                  <div style={{ fontSize: 13, color: T.muted }}>{k.sub}</div>
                </Card>
              ))}
            </div>

            {/* Lead tier distribution */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <Card>
                <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Lead Quality Distribution</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { tier: "hot", label: "Hot (75–100)", color: T.green, count: tierCounts.hot },
                    { tier: "warm", label: "Warm (50–74)", color: T.amber, count: tierCounts.warm },
                    { tier: "cold", label: "Cold (0–49)", color: T.muted, count: tierCounts.cold },
                  ].map(({ label, color, count }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: T.offWhite }}>{label}</span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color }}>{count}</span>
                      </div>
                      <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: total > 0 ? `${(count/total)*100}%` : "0%", height: "100%", background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Pipeline Status</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "New", color: T.blueL, count: statusCounts.new },
                    { label: "Contacted", color: T.amber, count: statusCounts.contacted },
                    { label: "Won", color: T.green, count: statusCounts.won },
                    { label: "Lost", color: T.red, count: statusCounts.lost },
                  ].map(({ label, color, count }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: T.offWhite, flex: 1 }}>{label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color }}>{count}</span>
                      <div style={{ width: 80, height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: total > 0 ? `${(count/total)*100}%` : "0%", height: "100%", background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Top leads */}
            <Card>
              <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Top 5 Leads by Score</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...leads].sort((a,b) => b.score - a.score).slice(0, 5).map((lead, i) => (
                  <div key={lead.id} onClick={() => { setSelectedLead(lead); setView("pipeline"); }} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                    background: T.surface2, borderRadius: 8, border: `1px solid ${T.border}`,
                    cursor: "pointer", transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                  >
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: T.muted, width: 20 }}>#{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{lead.issueName}</div>
                    </div>
                    <Pill color={lead.tier}>{lead.tier}</Pill>
                    <Pill color={lead.status}>{lead.status}</Pill>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, color: lead.tier === "hot" ? T.green : lead.tier === "warm" ? T.amber : T.muted, minWidth: 36, textAlign: "right" }}>{lead.score}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} onStatusChange={(id, status) => { updateStatus(id, status); setSelectedLead(null); }} />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

// ─── MAIN LANDING PAGE WITH LOGIN MODAL ──────────────────────────────────────
function LandingPage({ onLogin, onIntakeForm }) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 68, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", background: "rgba(9,12,17,0.85)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: T.blue, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", width: 14, height: 2, background: "white", borderRadius: 2, boxShadow: "0 -5px 0 white, 0 5px 0 rgba(255,255,255,0.5)" }} />
          </div>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: T.white }}>Streamline</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="ghost" onClick={onIntakeForm}>Get a Quote</Button>
          <Button variant="outline" onClick={() => setShowAuth(true)}>Log In</Button>
          <Button onClick={() => setShowAuth(true)}>Request Access</Button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        paddingTop: 68, textAlign: "center", padding: "140px 48px 80px",
        background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(37,99,235,0.1), transparent 70%)",
        position: "relative",
      }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 100, padding: "7px 16px", fontSize: 12, fontWeight: 600, color: T.blueL, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, background: T.blueL, borderRadius: "50%", animation: "pulse 2s infinite" }} />
            Now accepting businesses — Columbus, OH
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(44px,6vw,72px)", lineHeight: 1.06, letterSpacing: -2, marginBottom: 24 }}>
            Stop chasing leads.<br />
            Start closing{" "}
            <em style={{ fontStyle: "italic", background: `linear-gradient(135deg, ${T.blueL}, ${T.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>jobs.</em>
          </h1>
          <p style={{ fontSize: 18, color: T.offWhite, lineHeight: 1.75, maxWidth: 520, margin: "0 auto 40px", fontWeight: 300 }}>
            Qualified, scored leads for service businesses — delivered directly to your dashboard. Built for HVAC, Roofing, Plumbing, and more.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Button size="lg" onClick={() => setShowAuth(true)}>Request Access →</Button>
            <Button variant="outline" size="lg" onClick={onIntakeForm}>Try the Intake Form</Button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28, flexWrap: "wrap" }}>
            {["🌬️ HVAC", "🏠 Roofing", "🔧 Plumbing", "⚡ Electrical"].map(tag => (
              <span key={tag} style={{ background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: 100, padding: "5px 14px", fontSize: 12, color: T.offWhite, fontWeight: 500 }}>{tag}</span>
            ))}
            <span style={{ background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: 100, padding: "5px 14px", fontSize: 12, color: T.muted, fontStyle: "italic" }}>+ more</span>
          </div>
        </div>
      </div>

      {/* Auth modal */}
      <Modal open={showAuth} onClose={() => setShowAuth(false)} title="Sign in to Streamline">
        <AuthPage onAuth={(user) => { setShowAuth(false); onLogin(user); }} />
      </Modal>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing"); // landing | intake | dashboard
  const [user, setUser] = useState(null);

  useEffect(() => {
    store.seed();
    const session = store.get(KEYS.session);
    if (session) { setUser(session); setPage("dashboard"); }
  }, []);

  const handleLogin = (u) => { setUser(u); setPage("dashboard"); };
  const handleLogout = () => { store.set(KEYS.session, null); setUser(null); setPage("landing"); };

  if (page === "intake") return <IntakeForm onSubmitted={() => {}} />;
  if (page === "dashboard" && user) return <Dashboard user={user} onLogout={handleLogout} />;
  return <LandingPage onLogin={handleLogin} onIntakeForm={() => setPage("intake")} />;
}
