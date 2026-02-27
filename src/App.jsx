import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://teixvcgtuqtclvvyfqat.supabase.co";
const SUPABASE_KEY = "sb_publishable_c8tvTyGmR0_IAWg6692bLg_tTwMPBYA";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:"#090C11", surface:"#0F1319", surface2:"#151B25", surface3:"#1C2333",
  border:"rgba(255,255,255,0.07)", border2:"rgba(255,255,255,0.11)",
  blue:"#2563EB", blueL:"#3B82F6", cyan:"#06B6D4",
  white:"#F8FAFC", offWhite:"#CBD5E1", muted:"#64748B",
  green:"#10B981", amber:"#F59E0B", red:"#EF4444", orange:"#F97316",
};

// ─── FONTS + STYLES ───────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);
const gs = document.createElement("style");
gs.textContent = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%}
  body{background:${T.bg};color:${T.white};font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${T.surface}}::-webkit-scrollbar-thumb{background:${T.surface3};border-radius:3px}
  input,select,textarea,button{font-family:inherit}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
  @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes chatPop{from{opacity:0;transform:translateY(12px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes typingDot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
  html{scroll-behavior:smooth}
`;
document.head.appendChild(gs);

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
function scoreLeadData(data) {
  let score = 0;
  const breakdown = {};
  const budgetMap = {"under_500":2,"500_1000":6,"1000_2000":12,"2000_5000":17,"5000_plus":20};
  breakdown.budget = budgetMap[data.budget] ?? 0; score += breakdown.budget;
  const urgencyMap = {"flexible":5,"this_week":13,"emergency":20};
  breakdown.urgency = urgencyMap[data.urgency] ?? 0; score += breakdown.urgency;
  const ownerMap = {"renter_no":2,"renter_yes":8,"owner":15};
  breakdown.ownership = ownerMap[data.ownership] ?? 0; score += breakdown.ownership;
  const sizeMap = {"under_1000":6,"1000_2000":10,"2000_3500":13,"3500_plus":15};
  breakdown.size = sizeMap[data.propertySize] ?? 0; score += breakdown.size;
  const descLen = (data.issueDescription||"").trim().length;
  breakdown.clarity = descLen>80?15:descLen>30?10:descLen>5?6:0; score += breakdown.clarity;
  let contact = 0;
  if(data.phone?.replace(/\D/g,"").length>=10) contact+=7;
  if(data.preferredTime) contact+=4;
  if(data.zipCode?.length>=5) contact+=4;
  breakdown.contact = contact; score += breakdown.contact;
  const pct = Math.round(score);
  return { score:pct, breakdown, tier:pct>=75?"hot":pct>=50?"warm":"cold" };
}

function getEstimateRange(issueType) {
  return {"ac_repair":"$350–$1,200","furnace":"$200–$900","duct_cleaning":"$300–$700","ac_replacement":"$3,500–$7,500","heat_pump":"$800–$2,500","ac_install":"$3,000–$6,500","thermostat":"$150–$400","maintenance":"$100–$250","boiler":"$500–$2,000"}[issueType]||"$400–$2,000";
}

// ─── SUPABASE DATA LAYER ──────────────────────────────────────────────────────
const db = {
  // AUTH
  signIn: async (email, password) => {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  signUp: async (email, password) => {
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
  signOut: async () => { await sb.auth.signOut(); },
  getSession: async () => {
    const { data } = await sb.auth.getSession();
    return data.session;
  },

  // BUSINESS PROFILE
  getBusiness: async (userId) => {
    const { data, error } = await sb.from("businesses").select("*").eq("id", userId).single();
    if (error) return null;
    return data;
  },
  upsertBusiness: async (profile) => {
    const { data, error } = await sb.from("businesses").upsert(profile).select().single();
    if (error) throw error;
    return data;
  },

  // LEADS
  getLeads: async (businessId) => {
    const { data, error } = await sb.from("leads").select("*")
      .eq("business_id", businessId)
      .order("score", { ascending: false });
    if (error) throw error;
    return data || [];
  },
  insertLead: async (lead) => {
    const { data, error } = await sb.from("leads").insert([lead]).select().single();
    if (error) throw error;
    return data;
  },
  updateLeadStatus: async (leadId, status) => {
    const { error } = await sb.from("leads").update({ status }).eq("id", leadId);
    if (error) throw error;
  },

  // NOTIFICATIONS
  getNotifications: async (businessId) => {
    const { data, error } = await sb.from("notifications").select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return [];
    return data || [];
  },
  insertNotification: async (notif) => {
    await sb.from("notifications").insert([notif]);
  },
  markNotifsRead: async (businessId) => {
    await sb.from("notifications").update({ read: true })
      .eq("business_id", businessId).eq("read", false);
  },

  // REALTIME — subscribe to new leads for a business
  subscribeToLeads: (businessId, onNewLead) => {
    return sb.channel("leads-channel")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "leads",
        filter: `business_id=eq.${businessId}`,
      }, payload => onNewLead(payload.new))
      .subscribe();
  },
};

// ─── NOTIFICATION HELPERS ─────────────────────────────────────────────────────
async function notifyNewLead(lead, businessId) {
  const tier = lead.tier==="hot"?"🔥 HOT":lead.tier==="warm"?"⚡ WARM":"❄️ COLD";
  await db.insertNotification({
    business_id: businessId,
    subject: `New ${tier} Lead — ${lead.name}`,
    body: `A new ${lead.tier} lead has been qualified.\n\nName: ${lead.name}\nIssue: ${lead.issue_type?.replace(/_/g," ")}\nScore: ${lead.score}/100\nBudget: ${lead.budget?.replace(/_/g," ")}\nPhone: ${lead.phone}\nPreferred time: ${lead.preferred_time||"Not specified"}`,
    type: "lead",
    read: false,
  });
}

async function notifyStatusChange(lead, status, businessId) {
  const icons = { won:"✅", lost:"❌", contacted:"📞" };
  await db.insertNotification({
    business_id: businessId,
    subject: `${icons[status]||""} Lead ${status} — ${lead.name}`,
    body: `Lead status updated to "${status}" for ${lead.name} (${lead.issue_type?.replace(/_/g," ")}).`,
    type: "status",
    read: false,
  });
}

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
function Pill({color,children}){
  const c={hot:{bg:"rgba(239,68,68,0.15)",text:"#F87171",border:"rgba(239,68,68,0.3)"},warm:{bg:"rgba(245,158,11,0.15)",text:"#FCD34D",border:"rgba(245,158,11,0.3)"},cold:{bg:"rgba(100,116,139,0.2)",text:"#94A3B8",border:"rgba(100,116,139,0.3)"},new:{bg:"rgba(37,99,235,0.2)",text:"#93C5FD",border:"rgba(37,99,235,0.3)"},contacted:{bg:"rgba(245,158,11,0.15)",text:"#FCD34D",border:"rgba(245,158,11,0.3)"},won:{bg:"rgba(16,185,129,0.15)",text:"#34D399",border:"rgba(16,185,129,0.3)"},lost:{bg:"rgba(239,68,68,0.12)",text:"#F87171",border:"rgba(239,68,68,0.25)"}};
  const s=c[color]||c.new;
  return <span style={{display:"inline-flex",alignItems:"center",background:s.bg,color:s.text,border:`1px solid ${s.border}`,borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.07em"}}>{children}</span>;
}

function ScoreBar({score}){
  const color=score>=75?T.green:score>=50?T.amber:T.muted;
  return(<div style={{display:"flex",alignItems:"center",gap:8}}>
    <div style={{flex:1,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}>
      <div style={{width:`${score}%`,height:"100%",background:`linear-gradient(90deg,${T.blue},${color})`,borderRadius:2,transition:"width 0.6s ease"}}/>
    </div>
    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color,minWidth:28}}>{score}</span>
  </div>);
}

function Input({label,value,onChange,type="text",placeholder,required,options,hint}){
  const base={width:"100%",background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"11px 14px",color:T.white,fontSize:14,outline:"none"};
  return(<div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label&&<label style={{fontSize:12,fontWeight:600,color:T.offWhite,letterSpacing:"0.04em"}}>{label}{required&&<span style={{color:T.blueL,marginLeft:3}}>*</span>}</label>}
    {hint&&<span style={{fontSize:11,color:T.muted,marginTop:-4}}>{hint}</span>}
    {type==="select"?<select value={value} onChange={e=>onChange(e.target.value)} style={{...base,cursor:"pointer"}}><option value="">Select one…</option>{options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
    :type==="textarea"?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{...base,resize:"vertical",lineHeight:1.6}}/>
    :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>}
  </div>);
}

function Button({children,onClick,variant="primary",size="md",disabled,fullWidth,style={}}){
  const sizes={sm:{padding:"7px 14px",fontSize:13},md:{padding:"11px 22px",fontSize:14},lg:{padding:"14px 28px",fontSize:15}};
  const variants={primary:{background:T.blue,color:"white",border:"none"},outline:{background:"none",color:T.offWhite,border:`1px solid ${T.border2}`},ghost:{background:"none",color:T.muted,border:"none"},danger:{background:"rgba(239,68,68,0.12)",color:"#F87171",border:"1px solid rgba(239,68,68,0.25)"},success:{background:"rgba(16,185,129,0.12)",color:T.green,border:`1px solid rgba(16,185,129,0.25)`}};
  return <button onClick={onClick} disabled={disabled} style={{...sizes[size],...variants[variant],borderRadius:8,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,transition:"all 0.2s",width:fullWidth?"100%":"auto",...style}}>{children}</button>;
}

function Card({children,style={}}){ return <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:24,...style}}>{children}</div>; }

function Modal({open,onClose,title,children,width=520}){
  if(!open) return null;
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:16,width,maxWidth:"100%",maxHeight:"90vh",overflow:"auto",animation:"fadeUp 0.25s ease"}}>
      {title&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,background:T.surface,zIndex:1}}>
        <span style={{fontSize:16,fontWeight:600,color:T.white}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
      </div>}
      <div style={{padding:24}}>{children}</div>
    </div>
  </div>);
}

function Toast({message,type="success",onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t)},[]);
  const colors={success:T.green,error:T.red,info:T.blueL};
  return(<div style={{position:"fixed",bottom:24,right:24,zIndex:2000,background:T.surface2,border:`1px solid ${colors[type]}40`,borderRadius:10,padding:"14px 20px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 16px 40px rgba(0,0,0,0.4)",animation:"slideIn 0.3s ease"}}>
    <div style={{width:8,height:8,borderRadius:"50%",background:colors[type]}}/>
    <span style={{fontSize:14,color:T.offWhite}}>{message}</span>
  </div>);
}

function Spinner(){
  return <div style={{width:20,height:20,border:`2px solid ${T.border2}`,borderTopColor:T.blueL,borderRadius:"50%",animation:"spin 0.7s linear infinite",margin:"0 auto"}}
    />;
}

// Add spin keyframe
const spinStyle = document.createElement("style");
spinStyle.textContent = `@keyframes spin{to{transform:rotate(360deg)}}`;
document.head.appendChild(spinStyle);

function LogoMark({size=32}){
  return(<div style={{width:size,height:size,background:T.blue,borderRadius:Math.round(size*0.25),display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
    <div style={{position:"absolute",width:size*0.44,height:2,background:"white",borderRadius:1,boxShadow:`0 ${-size*0.16}px 0 white, 0 ${size*0.16}px 0 rgba(255,255,255,0.5)`}}/>
  </div>);
}

// ─── AI CHATBOT ───────────────────────────────────────────────────────────────
const CHAT_KB = {
  greetings:["hi","hello","hey","good morning","good afternoon"],
  pricing:["price","pricing","cost","how much","subscription","fee","pay","plan","starter","growth"],
  how:["how","work","does it","explain","process","flow","step","qualify"],
  leads:["lead","leads","exclusive","shared","quality","score","qualify","ranking"],
  industries:["hvac","roofing","plumbing","electrical","industry","industries","trade","service"],
  intake:["intake","form","quote","homeowner","customer","submit","fill"],
  contact:["contact","call","email","support","help","talk","reach","human"],
  cancel:["cancel","pause","stop","quit","leave"],
  difference:["different","homeadvisor","angi","thumbtack","compare","vs","versus","competitor"],
};

function getAutoResponse(msg){
  const m=msg.toLowerCase();
  if(CHAT_KB.greetings.some(w=>m.includes(w))) return "Hey! Welcome to Streamline. I can answer questions about how the platform works, pricing, lead quality, or the industries we serve. What can I help you with?";
  if(CHAT_KB.difference.some(w=>m.includes(w))) return "Unlike HomeAdvisor or Angi, we never sell the same lead to multiple businesses. Every lead is exclusive to you, pre-scored before delivery, and we only charge a performance fee when *you* close the job. Our incentives are aligned with yours.";
  if(CHAT_KB.pricing.some(w=>m.includes(w))) return "We offer two plans:\n\n**Starter — $299/mo** + $150 per closed job (up to 20 leads/mo)\n**Growth — $499/mo** + $100 per closed job (up to 50 leads/mo)\n\nThe performance fee only kicks in when you mark a lead as Won.";
  if(CHAT_KB.how.some(w=>m.includes(w))) return "Here's how it works:\n\n1️⃣ Customer fills out our intake form\n2️⃣ We score them 0–100 across 6 dimensions\n3️⃣ Qualified leads get an instant estimate\n4️⃣ You receive the full lead in your dashboard within 60 seconds";
  if(CHAT_KB.leads.some(w=>m.includes(w))) return "Every lead is exclusive — once assigned to you, no other business sees it. Leads are scored Hot (75+), Warm (50–74), or Cold (under 50). Hot leads close at the highest rates.";
  if(CHAT_KB.industries.some(w=>m.includes(w))) return "We're live for **HVAC, Roofing, Plumbing, and Electrical** in Columbus, OH. Expanding to more trades and cities throughout 2026.";
  if(CHAT_KB.intake.some(w=>m.includes(w))) return "The intake form is a 5-step questionnaire your customers fill out from your ads or a direct link. It captures issue type, urgency, budget, property details, and contact info — then scores the lead in real-time.";
  if(CHAT_KB.cancel.some(w=>m.includes(w))) return "You can pause or cancel your subscription anytime from your dashboard — no penalty, no phone call required.";
  if(CHAT_KB.contact.some(w=>m.includes(w))) return "Reach our team at **hello@streamline.io** or click 'Request Access' to schedule a demo call.";
  return "Good question — I may not have every detail. Reach our team at hello@streamline.io or click **Request Access** to talk with someone directly. Can I help with anything else?";
}

function Chatbot(){
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([{role:"bot",text:"Hi! I'm the Streamline assistant. Ask me anything about how the platform works, pricing, or lead quality.",ts:Date.now()}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [unread,setUnread]=useState(0);
  const bottomRef=useRef(null);
  useEffect(()=>{if(open){setUnread(0);bottomRef.current?.scrollIntoView({behavior:"smooth"})}},[msgs,open]);
  const send=async()=>{
    const text=input.trim();if(!text)return;
    setInput("");
    setMsgs(m=>[...m,{role:"user",text,ts:Date.now()}]);
    setTyping(true);
    await new Promise(r=>setTimeout(r,800+Math.random()*600));
    const reply=getAutoResponse(text);
    setMsgs(m=>[...m,{role:"bot",text:reply,ts:Date.now()}]);
    setTyping(false);
    if(!open)setUnread(u=>u+1);
  };
  const fmt=text=>text.split(/(\*\*[^*]+\*\*)/).map((p,i)=>p.startsWith("**")&&p.endsWith("**")?<strong key={i} style={{color:T.white}}>{p.slice(2,-2)}</strong>:p.split("\n").map((l,j)=><span key={j}>{l}{j<p.split("\n").length-1&&<br/>}</span>));
  return(
    <div style={{position:"fixed",bottom:28,right:28,zIndex:500}}>
      {open&&(
        <div style={{position:"absolute",bottom:70,right:0,width:360,background:T.surface,border:`1px solid ${T.border2}`,borderRadius:16,boxShadow:"0 24px 60px rgba(0,0,0,0.5)",overflow:"hidden",animation:"chatPop 0.25s ease",display:"flex",flexDirection:"column",height:460}}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,background:T.surface2,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${T.blue},${T.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700}}>S</div>
              <div><div style={{fontSize:13,fontWeight:600,color:T.white}}>Streamline Assistant</div><div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.green}}><div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/>Online</div></div>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18}}>×</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",background:m.role==="user"?T.blue:T.surface2,fontSize:13,color:m.role==="user"?T.white:T.offWhite,lineHeight:1.6,border:m.role==="bot"?`1px solid ${T.border}`:"none"}}>
                  {m.role==="bot"?fmt(m.text):m.text}
                </div>
              </div>
            ))}
            {typing&&<div style={{display:"flex",gap:5,padding:"10px 14px",background:T.surface2,borderRadius:"12px 12px 12px 4px",width:"fit-content",border:`1px solid ${T.border}`}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.muted,animation:`typingDot 1.2s ${i*0.2}s infinite`}}/>)}</div>}
            <div ref={bottomRef}/>
          </div>
          <div style={{padding:"12px 14px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask a question…" style={{flex:1,background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"9px 12px",color:T.white,fontSize:13,outline:"none"}}/>
            <button onClick={send} disabled={!input.trim()} style={{background:T.blue,border:"none",borderRadius:8,width:36,height:36,cursor:"pointer",color:"white",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",opacity:input.trim()?1:0.4,transition:"opacity 0.2s"}}>→</button>
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(o=>!o)} style={{width:54,height:54,borderRadius:"50%",background:`linear-gradient(135deg,${T.blue},${T.cyan})`,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:"0 8px 24px rgba(37,99,235,0.4)",position:"relative"}}>
        {open?"×":"💬"}
        {!open&&unread>0&&<div style={{position:"absolute",top:-2,right:-2,width:18,height:18,borderRadius:"50%",background:T.red,fontSize:9,fontWeight:700,color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</div>}
      </button>
    </div>
  );
}

// ─── INTAKE FORM ──────────────────────────────────────────────────────────────
function IntakeForm({onBack}){
  const [step,setStep]=useState(0);
  const [submitting,setSubmitting]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");
  const [form,setForm]=useState({name:"",phone:"",email:"",issueType:"",issueDescription:"",urgency:"",budget:"",ownership:"",propertySize:"",preferredTime:"",zipCode:""});
  const set=k=>v=>setForm(f=>({...f,[k]:v}));

  const steps=[
    {title:"What do you need help with?",subtitle:"Tell us about your service request",
      fields:<div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Input label="Issue Type" value={form.issueType} onChange={set("issueType")} type="select" required options={[{value:"ac_repair",label:"AC Repair / Not Cooling"},{value:"ac_replacement",label:"AC Replacement"},{value:"ac_install",label:"New AC Install"},{value:"furnace",label:"Furnace / Heating Issue"},{value:"heat_pump",label:"Heat Pump Service"},{value:"duct_cleaning",label:"Duct Cleaning"},{value:"thermostat",label:"Thermostat Install / Repair"},{value:"boiler",label:"Boiler Service"},{value:"maintenance",label:"Annual Maintenance / Tune-Up"},{value:"other",label:"Other HVAC Issue"}]}/>
        <Input label="Describe the issue" value={form.issueDescription} onChange={set("issueDescription")} type="textarea" placeholder="Tell us what's happening in as much detail as possible…" required/>
      </div>,valid:form.issueType&&form.issueDescription.trim().length>5},
    {title:"How urgent is this?",subtitle:"Help us prioritize your request",
      fields:<div style={{display:"flex",flexDirection:"column",gap:12}}>
        {[{value:"emergency",label:"🚨 Emergency",sub:"Right now — I need help today"},{value:"this_week",label:"📅 This week",sub:"Urgent but can schedule a few days out"},{value:"flexible",label:"🗓️ Flexible",sub:"Planning ahead, no immediate rush"}].map(opt=>(
          <div key={opt.value} onClick={()=>set("urgency")(opt.value)} style={{padding:"16px 20px",borderRadius:10,cursor:"pointer",background:form.urgency===opt.value?"rgba(37,99,235,0.12)":T.surface2,border:`1px solid ${form.urgency===opt.value?T.blue:T.border2}`,transition:"all 0.2s"}}>
            <div style={{fontSize:15,fontWeight:600,color:T.white}}>{opt.label}</div>
            <div style={{fontSize:13,color:T.muted,marginTop:3}}>{opt.sub}</div>
          </div>
        ))}
      </div>,valid:!!form.urgency},
    {title:"About your property",subtitle:"This helps us give an accurate estimate",
      fields:<div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Input label="Property Size" value={form.propertySize} onChange={set("propertySize")} type="select" required options={[{value:"under_1000",label:"Under 1,000 sq ft"},{value:"1000_2000",label:"1,000 – 2,000 sq ft"},{value:"2000_3500",label:"2,000 – 3,500 sq ft"},{value:"3500_plus",label:"3,500+ sq ft"}]}/>
        <Input label="Do you own or rent?" value={form.ownership} onChange={set("ownership")} type="select" required options={[{value:"owner",label:"I own this property"},{value:"renter_yes",label:"I rent — landlord has approved repairs"},{value:"renter_no",label:"I rent — not sure about approval"}]}/>
        <Input label="Zip Code" value={form.zipCode} onChange={set("zipCode")} placeholder="e.g. 43201" required/>
      </div>,valid:form.propertySize&&form.ownership&&form.zipCode.length>=5},
    {title:"What's your budget?",subtitle:"Approximate range for this service",
      fields:<div style={{display:"flex",flexDirection:"column",gap:12}}>
        {[{value:"under_500",label:"Under $500"},{value:"500_1000",label:"$500 – $1,000"},{value:"1000_2000",label:"$1,000 – $2,000"},{value:"2000_5000",label:"$2,000 – $5,000"},{value:"5000_plus",label:"$5,000+"}].map(opt=>(
          <div key={opt.value} onClick={()=>set("budget")(opt.value)} style={{padding:"14px 20px",borderRadius:10,cursor:"pointer",background:form.budget===opt.value?"rgba(37,99,235,0.12)":T.surface2,border:`1px solid ${form.budget===opt.value?T.blue:T.border2}`,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:15,fontWeight:600,color:T.white}}>{opt.label}</span>
            {form.budget===opt.value&&<span style={{color:T.blueL}}>✓</span>}
          </div>
        ))}
      </div>,valid:!!form.budget},
    {title:"How can we reach you?",subtitle:"A local professional will contact you shortly",
      fields:<div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Input label="Full Name" value={form.name} onChange={set("name")} placeholder="Jane Smith" required/>
        <Input label="Phone Number" value={form.phone} onChange={set("phone")} type="tel" placeholder="(614) 555-0000" required/>
        <Input label="Email Address" value={form.email} onChange={set("email")} type="email" placeholder="jane@email.com"/>
        <Input label="Preferred Contact Time" value={form.preferredTime} onChange={set("preferredTime")} type="select" options={[{value:"Morning (8am–12pm)",label:"Morning (8am – 12pm)"},{value:"Afternoon (12pm–5pm)",label:"Afternoon (12pm – 5pm)"},{value:"Evening (5pm–8pm)",label:"Evening (5pm – 8pm)"},{value:"Anytime",label:"Anytime"}]}/>
      </div>,valid:form.name.trim().length>1&&form.phone.replace(/\D/g,"").length>=10},
  ];
  const cur=steps[step];

  const handleSubmit=async()=>{
    setSubmitting(true); setError("");
    try {
      const {score,breakdown,tier}=scoreLeadData(form);
      // business_id hardcoded to demo business — in production this comes from the ad campaign param
      const lead = {
        business_id: null, // public submission — RLS allows this
        name: form.name,
        phone: form.phone,
        email: form.email,
        issue_type: form.issueType,
        issue_description: form.issueDescription,
        urgency: form.urgency,
        budget: form.budget,
        ownership: form.ownership,
        property_size: form.propertySize,
        preferred_time: form.preferredTime,
        zip_code: form.zipCode,
        industry: "HVAC",
        score,
        tier,
        breakdown,
        status: "new",
        estimate_range: getEstimateRange(form.issueType),
        is_name: form.issueType.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()),
      };
      await db.insertLead(lead);
      setDone(true);
    } catch(e) {
      setError("Something went wrong submitting your request. Please try again.");
      console.error(e);
    }
    setSubmitting(false);
  };

  if(done) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,padding:24}}>
      <div style={{textAlign:"center",maxWidth:480,animation:"fadeUp 0.5s ease"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(16,185,129,0.15)",border:`2px solid ${T.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 24px"}}>✓</div>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:32,letterSpacing:-1,marginBottom:16}}>You're all set.</h2>
        <p style={{color:T.offWhite,lineHeight:1.7,marginBottom:32,fontSize:16}}>Your request has been received. A qualified local professional will reach out at your preferred contact time.</p>
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:20,textAlign:"left",marginBottom:24}}>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Your request summary</div>
          {[["Issue",form.issueType.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())],["Urgency",form.urgency],["Budget",form.budget?.replace(/_/g," ")],["Contact",form.phone]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:8}}><span style={{color:T.muted}}>{k}</span><span style={{color:T.white,fontWeight:500}}>{v}</span></div>
          ))}
        </div>
        {onBack&&<Button variant="outline" onClick={onBack}>← Back to Streamline</Button>}
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 28px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:12}}>
        <LogoMark size={28}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.white}}>Streamline</span>
        <span style={{color:T.muted,fontSize:14}}>· HVAC Quote Request</span>
        {onBack&&<button onClick={onBack} style={{marginLeft:"auto",background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:13}}>← Back to site</button>}
      </div>
      <div style={{padding:"0 28px"}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <div style={{display:"flex",gap:4,marginTop:20,marginBottom:6}}>{steps.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?T.blue:T.border,transition:"background 0.3s"}}/>)}</div>
          <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>Step {step+1} of {steps.length}</div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
        <div style={{width:"100%",maxWidth:560,animation:"fadeUp 0.35s ease"}} key={step}>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:28,letterSpacing:-0.8,marginBottom:6}}>{cur.title}</h2>
          <p style={{color:T.muted,fontSize:14,marginBottom:28}}>{cur.subtitle}</p>
          {cur.fields}
          {error&&<div style={{marginTop:12,padding:"10px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,fontSize:13,color:"#F87171"}}>{error}</div>}
          <div style={{display:"flex",gap:12,marginTop:32}}>
            {step>0&&<Button variant="outline" onClick={()=>setStep(s=>s-1)}>← Back</Button>}
            {step<steps.length-1
              ?<Button onClick={()=>setStep(s=>s+1)} disabled={!cur.valid} style={{marginLeft:"auto"}}>Continue →</Button>
              :<Button onClick={handleSubmit} disabled={!cur.valid||submitting} style={{marginLeft:"auto"}}>{submitting?"Submitting…":"Submit Request →"}</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({onAuth}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("demo@streamline.com");
  const [password,setPassword]=useState("demo1234");
  const [company,setCompany]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const handleSubmit=async()=>{
    setError(""); setLoading(true);
    try {
      if(mode==="login"){
        const { session } = await db.signIn(email, password);
        if(!session) throw new Error("No session returned");
        const business = await db.getBusiness(session.user.id);
        onAuth({ ...session.user, ...business });
      } else {
        const { session } = await db.signUp(email, password);
        if(!session) {
          setError("Account created! Check your email to confirm, then sign in.");
          setLoading(false); return;
        }
        // Create business profile row
        const business = await db.upsertBusiness({
          id: session.user.id, email, company, industry:"HVAC",
          plan:"Starter", notify_email: email,
        });
        onAuth({ ...session.user, ...business });
      }
    } catch(e) {
      setError(e.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28,justifyContent:"center"}}>
        <LogoMark size={36}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:T.white}}>Streamline</span>
      </div>
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24,letterSpacing:-0.8,marginBottom:6,textAlign:"center"}}>{mode==="login"?"Welcome back.":"Create your account."}</h2>
      <p style={{color:T.muted,fontSize:14,marginBottom:24,textAlign:"center"}}>{mode==="login"?"Sign in to access your lead dashboard.":"Start receiving qualified leads today."}</p>
      {mode==="login"&&<div style={{background:"rgba(37,99,235,0.08)",border:`1px solid rgba(37,99,235,0.2)`,borderRadius:8,padding:"10px 14px",marginBottom:20,fontSize:13,color:T.offWhite}}><span style={{color:T.blueL,fontWeight:600}}>Demo: </span>demo@streamline.com / demo1234</div>}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {mode==="signup"&&<Input label="Company Name" value={company} onChange={setCompany} placeholder="Apex Climate Control" required/>}
        <Input label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@company.com" required/>
        <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" required/>
      </div>
      {error&&<div style={{marginTop:12,padding:"10px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,fontSize:13,color:"#F87171"}}>{error}</div>}
      <Button onClick={handleSubmit} disabled={loading} fullWidth style={{marginTop:22}}>{loading?<Spinner/>:mode==="login"?"Sign In →":"Create Account →"}</Button>
      <div style={{textAlign:"center",marginTop:18,fontSize:13,color:T.muted}}>
        {mode==="login"?"Don't have an account? ":"Already have an account? "}
        <span onClick={()=>setMode(mode==="login"?"signup":"login")} style={{color:T.blueL,cursor:"pointer",fontWeight:500}}>{mode==="login"?"Sign up":"Sign in"}</span>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS PANEL ──────────────────────────────────────────────────────
function NotificationsPanel({userId}){
  const [notifs,setNotifs]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    db.getNotifications(userId).then(n=>{setNotifs(n);setLoading(false);});
    db.markNotifsRead(userId);
  },[userId]);
  if(loading) return <div style={{padding:32,textAlign:"center"}}><Spinner/></div>;
  if(notifs.length===0) return <div style={{padding:24,textAlign:"center",color:T.muted,fontSize:14}}>No notifications yet. They'll appear here when leads come in.</div>;
  return(<div style={{display:"flex",flexDirection:"column",gap:0,maxHeight:480,overflowY:"auto"}}>
    {notifs.map(n=>(
      <div key={n.id} style={{padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:13,fontWeight:600,color:n.read?T.offWhite:T.white}}>{n.subject}</span>
          <span style={{fontSize:11,color:T.muted,flexShrink:0,marginLeft:12}}>{new Date(n.created_at).toLocaleDateString()}</span>
        </div>
        <p style={{fontSize:12,color:T.muted,lineHeight:1.6,whiteSpace:"pre-line"}}>{n.body}</p>
      </div>
    ))}
  </div>);
}

// ─── LEAD DETAIL MODAL ────────────────────────────────────────────────────────
function LeadDetail({lead,onClose,onStatusChange}){
  if(!lead) return null;
  const bl={budget:"Budget Match",urgency:"Urgency",ownership:"Owner Status",size:"Property Size",clarity:"Issue Clarity",contact:"Contact Quality"};
  const mx={budget:20,urgency:20,ownership:15,size:15,clarity:15,contact:15};
  const breakdown = typeof lead.breakdown === "string" ? JSON.parse(lead.breakdown) : (lead.breakdown || {});
  return(
    <Modal open={!!lead} onClose={onClose} title="Lead Details" width={600}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
            <h3 style={{fontSize:20,fontWeight:700,color:T.white}}>{lead.name}</h3>
            <Pill color={lead.tier}>{lead.tier}</Pill><Pill color={lead.status}>{lead.status}</Pill>
          </div>
          <div style={{color:T.muted,fontSize:13}}>{lead.is_name||lead.issue_type} · {lead.zip_code}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,color:lead.tier==="hot"?T.green:lead.tier==="warm"?T.amber:T.muted,fontWeight:700}}>{lead.score}</div>
          <div style={{fontSize:11,color:T.muted}}>Lead Score</div>
        </div>
      </div>
      <div style={{background:T.surface2,borderRadius:10,padding:16,marginBottom:20}}>
        <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Score Breakdown</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {Object.entries(breakdown).map(([key,val])=>{
            const max=mx[key]||20;const pct=(val/max)*100;const color=pct>=75?T.green:pct>=40?T.amber:T.red;
            return(<div key={key} style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:110,fontSize:12,color:T.offWhite}}>{bl[key]||key}</div>
              <div style={{flex:1,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:2,transition:"width 0.6s ease"}}/></div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color,width:40,textAlign:"right"}}>{val}/{max}</div>
            </div>);
          })}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {[["Phone",lead.phone],["Contact Time",lead.preferred_time],["Budget",lead.budget?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())],["Estimate",lead.estimate_range],["Property Size",lead.property_size?.replace(/_/g," ")],["Ownership",lead.ownership==="owner"?"Homeowner":"Renter"],["Zip Code",lead.zip_code],["Submitted",new Date(lead.created_at).toLocaleDateString()]].map(([label,val])=>val&&(
          <div key={label} style={{background:T.surface2,borderRadius:8,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{label}</div>
            <div style={{fontSize:13,color:T.white,fontWeight:500}}>{val}</div>
          </div>
        ))}
      </div>
      {lead.issue_description&&(
        <div style={{background:T.surface2,borderRadius:10,padding:16,marginBottom:20}}>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Issue Description</div>
          <p style={{fontSize:14,color:T.offWhite,lineHeight:1.7}}>{lead.issue_description}</p>
        </div>
      )}
      {lead.status!=="won"&&lead.status!=="lost"&&(
        <div style={{display:"flex",gap:10}}>
          <Button variant="success" onClick={()=>{onStatusChange(lead.id,"won");onClose();}} style={{flex:1}}>✓ Mark as Won</Button>
          <Button variant="danger" onClick={()=>{onStatusChange(lead.id,"lost");onClose();}} style={{flex:1}}>✗ Mark as Lost</Button>
          {lead.status==="new"&&<Button variant="outline" onClick={()=>{onStatusChange(lead.id,"contacted");onClose();}} style={{flex:1}}>📞 Contacted</Button>}
        </div>
      )}
    </Modal>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({user,onLogout}){
  const [leads,setLeads]=useState([]);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("pipeline");
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("score");
  const [selectedLead,setSelectedLead]=useState(null);
  const [toast,setToast]=useState(null);
  const [search,setSearch]=useState("");
  const [showNotifs,setShowNotifs]=useState(false);
  const [unreadCount,setUnreadCount]=useState(0);

  const loadLeads=useCallback(async()=>{
    try {
      const data = await db.getLeads(user.id);
      setLeads(data);
    } catch(e){ console.error(e); }
    setLoading(false);
  },[user.id]);

  const loadUnread=useCallback(async()=>{
    const notifs = await db.getNotifications(user.id);
    setUnreadCount(notifs.filter(n=>!n.read).length);
  },[user.id]);

  useEffect(()=>{
    loadLeads();
    loadUnread();
    // Realtime subscription for new leads
    const channel = db.subscribeToLeads(user.id, (newLead)=>{
      setLeads(prev=>[newLead,...prev]);
      setToast({message:`🔥 New ${newLead.tier} lead: ${newLead.name}`,type:"success"});
      loadUnread();
    });
    return()=>{ sb.removeChannel(channel); };
  },[user.id]);

  const updateStatus=async(id,status)=>{
    try {
      await db.updateLeadStatus(id, status);
      const lead = leads.find(l=>l.id===id);
      setLeads(prev=>prev.map(l=>l.id===id?{...l,status}:l));
      if(lead) await notifyStatusChange(lead, status, user.id);
      setToast({message:`Lead marked as ${status}`,type:status==="won"?"success":"info"});
      loadUnread();
    } catch(e){ setToast({message:"Failed to update lead",type:"error"}); }
  };

  const filtered=leads
    .filter(l=>filter==="all"||l.status===filter)
    .filter(l=>!search||l.name?.toLowerCase().includes(search.toLowerCase())||l.issue_type?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="score"?b.score-a.score:new Date(b.created_at)-new Date(a.created_at));

  const total=leads.length,won=leads.filter(l=>l.status==="won").length,lost=leads.filter(l=>l.status==="lost").length;
  const active=leads.filter(l=>l.status==="new"||l.status==="contacted").length;
  const closeRate=total>0?Math.round((won/total)*100):0;
  const avgScore=total>0?Math.round(leads.reduce((s,l)=>s+l.score,0)/total):0;
  const tierCounts={hot:leads.filter(l=>l.tier==="hot").length,warm:leads.filter(l=>l.tier==="warm").length,cold:leads.filter(l=>l.tier==="cold").length};
  const statusCounts={new:0,contacted:0,won:0,lost:0};
  leads.forEach(l=>{if(statusCounts[l.status]!==undefined)statusCounts[l.status]++;});

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <nav style={{height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",borderBottom:`1px solid ${T.border}`,background:"rgba(9,12,17,0.9)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <LogoMark size={30}/>
          <span style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:T.white}}>Streamline</span>
          <span style={{color:T.border2,fontSize:16,margin:"0 4px"}}>|</span>
          <span style={{fontSize:13,color:T.muted}}>HVAC Dashboard</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {[{id:"pipeline",label:"Pipeline"},{id:"analytics",label:"Analytics"}].map(tab=>(
            <button key={tab.id} onClick={()=>setView(tab.id)} style={{background:view===tab.id?T.surface2:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:500,padding:"6px 14px",borderRadius:7,color:view===tab.id?T.white:T.muted,transition:"all 0.2s"}}>{tab.label}</button>
          ))}
          <div style={{width:1,height:24,background:T.border,margin:"0 4px"}}/>
          <button onClick={()=>{setShowNotifs(true);}} style={{position:"relative",background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:18,padding:"4px 8px",borderRadius:7}}>
            🔔{unreadCount>0&&<div style={{position:"absolute",top:0,right:2,width:16,height:16,borderRadius:"50%",background:T.red,fontSize:9,fontWeight:700,color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadCount}</div>}
          </button>
          <div style={{width:1,height:24,background:T.border,margin:"0 4px"}}/>
          <div style={{width:28,height:28,borderRadius:"50%",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>{user.company?.[0]||user.email?.[0]?.toUpperCase()||"U"}</div>
          <span style={{fontSize:13,color:T.offWhite,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.company||user.email}</span>
          <Button variant="outline" size="sm" onClick={onLogout}>Sign Out</Button>
        </div>
      </nav>

      <div style={{flex:1,padding:"28px",maxWidth:1320,margin:"0 auto",width:"100%"}}>
        {loading?(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,flexDirection:"column",gap:16}}>
            <Spinner/><span style={{color:T.muted,fontSize:14}}>Loading your pipeline…</span>
          </div>
        ) : view==="pipeline"?(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
              {[{label:"Total Leads",value:total,color:T.blueL,sub:"All time"},{label:"Active Pipeline",value:active,color:T.cyan,sub:"New + Contacted"},{label:"Closed Won",value:won,color:T.green,sub:`${closeRate}% close rate`},{label:"Avg Lead Score",value:avgScore,color:T.amber,sub:"Out of 100"}].map(s=>(
                <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"18px 20px"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:s.color,marginBottom:4}}>{s.value}</div>
                  <div style={{fontSize:13,fontWeight:600,color:T.white,marginBottom:2}}>{s.label}</div>
                  <div style={{fontSize:11,color:T.muted}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:180,position:"relative"}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads…" style={{width:"100%",background:T.surface,border:`1px solid ${T.border2}`,borderRadius:8,padding:"9px 14px 9px 34px",color:T.white,fontSize:14,outline:"none"}}/>
                <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:13}}>🔍</span>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["all","new","contacted","won","lost"].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 13px",borderRadius:7,border:`1px solid ${filter===f?T.blue:T.border2}`,background:filter===f?"rgba(37,99,235,0.15)":"none",color:filter===f?T.blueL:T.muted,cursor:"pointer",fontSize:13,fontWeight:500,transition:"all 0.15s"}}>
                    {f.charAt(0).toUpperCase()+f.slice(1)} <span style={{opacity:0.6,fontSize:11}}>{f==="all"?leads.length:statusCounts[f]}</span>
                  </button>
                ))}
              </div>
              <select value={sort} onChange={e=>setSort(e.target.value)} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:8,padding:"9px 12px",color:T.offWhite,fontSize:13,cursor:"pointer",outline:"none"}}>
                <option value="score">Sort: Score ↓</option>
                <option value="date">Sort: Newest</option>
              </select>
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 70px 90px 110px",padding:"11px 20px",borderBottom:`1px solid ${T.border}`,fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
                {["Lead","Issue","Budget","Score","Tier","Status","Actions"].map(h=><div key={h}>{h}</div>)}
              </div>
              {filtered.length===0?(
                <div style={{padding:48,textAlign:"center",color:T.muted}}>
                  <div style={{fontSize:32,marginBottom:12}}>📭</div>
                  <div style={{fontSize:15,color:T.offWhite,marginBottom:6}}>No leads yet</div>
                  <div style={{fontSize:13}}>Leads submitted via the intake form will appear here in real-time.</div>
                </div>
              ):filtered.map((lead,i)=>(
                <div key={lead.id} onClick={()=>setSelectedLead(lead)}
                  style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1.2fr 70px 90px 110px",padding:"13px 20px",borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",transition:"background 0.15s",animation:`fadeUp 0.3s ease ${Math.min(i*0.04,0.3)}s both`}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.surface2}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div><div style={{fontSize:14,fontWeight:600,color:T.white,marginBottom:2}}>{lead.name}</div><div style={{fontSize:11,color:T.muted}}>{lead.phone} · {new Date(lead.created_at).toLocaleDateString()}</div></div>
                  <div style={{fontSize:13,color:T.offWhite,alignSelf:"center"}}>{lead.is_name||lead.issue_type}</div>
                  <div style={{fontSize:13,color:T.offWhite,alignSelf:"center"}}>{lead.budget?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</div>
                  <div style={{alignSelf:"center"}}><ScoreBar score={lead.score}/></div>
                  <div style={{alignSelf:"center"}}><Pill color={lead.tier}>{lead.tier}</Pill></div>
                  <div style={{alignSelf:"center"}}><Pill color={lead.status}>{lead.status}</Pill></div>
                  <div style={{alignSelf:"center",display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                    {lead.status==="new"&&<button onClick={()=>updateStatus(lead.id,"contacted")} title="Mark contacted" style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:6,padding:"4px 7px",cursor:"pointer",color:T.muted,fontSize:12}}>📞</button>}
                    {lead.status!=="won"&&lead.status!=="lost"&&<>
                      <button onClick={()=>updateStatus(lead.id,"won")} title="Won" style={{background:"none",border:"1px solid rgba(16,185,129,0.3)",borderRadius:6,padding:"4px 7px",cursor:"pointer",color:T.green,fontSize:12}}>✓</button>
                      <button onClick={()=>updateStatus(lead.id,"lost")} title="Lost" style={{background:"none",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"4px 7px",cursor:"pointer",color:T.red,fontSize:12}}>✗</button>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ):(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:28,letterSpacing:-1,marginBottom:8}}>Analytics</h2>
            <p style={{color:T.muted,fontSize:14,marginBottom:28}}>Performance overview for your lead pipeline.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
              {[{label:"Close Rate",value:`${closeRate}%`,sub:`${won} won of ${total} total`,color:T.green},{label:"Avg Lead Score",value:avgScore,sub:"Quality of incoming leads",color:T.amber},{label:"Active Pipeline",value:active,sub:`${won+lost} resolved`,color:T.blueL}].map(k=>(
                <Card key={k.label}>
                  <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>{k.label}</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:44,color:k.color,letterSpacing:-2,lineHeight:1,marginBottom:8}}>{k.value}</div>
                  <div style={{fontSize:13,color:T.muted}}>{k.sub}</div>
                </Card>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <Card>
                <div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:20}}>Lead Quality Distribution</div>
                {[{label:"Hot (75–100)",color:T.green,count:tierCounts.hot},{label:"Warm (50–74)",color:T.amber,count:tierCounts.warm},{label:"Cold (0–49)",color:T.muted,count:tierCounts.cold}].map(({label,color,count})=>(
                  <div key={label} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,color:T.offWhite}}>{label}</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color}}>{count}</span></div>
                    <div style={{height:6,background:T.border,borderRadius:3,overflow:"hidden"}}><div style={{width:total>0?`${(count/total)*100}%`:"0%",height:"100%",background:color,borderRadius:3,transition:"width 0.8s ease"}}/></div>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:20}}>Pipeline Status</div>
                {[{label:"New",color:T.blueL,count:statusCounts.new},{label:"Contacted",color:T.amber,count:statusCounts.contacted},{label:"Won",color:T.green,count:statusCounts.won},{label:"Lost",color:T.red,count:statusCounts.lost}].map(({label,color,count})=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
                    <span style={{fontSize:13,color:T.offWhite,flex:1}}>{label}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color}}>{count}</span>
                    <div style={{width:80,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:total>0?`${(count/total)*100}%`:"0%",height:"100%",background:color,borderRadius:2,transition:"width 0.8s ease"}}/></div>
                  </div>
                ))}
              </Card>
            </div>
            <Card>
              <div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Top 5 Leads by Score</div>
              {[...leads].sort((a,b)=>b.score-a.score).slice(0,5).map((lead,i)=>(
                <div key={lead.id} onClick={()=>{setSelectedLead(lead);setView("pipeline");}} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",background:T.surface2,borderRadius:8,border:`1px solid ${T.border}`,cursor:"pointer",marginBottom:10,transition:"border-color 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(37,99,235,0.3)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted,width:20}}>#{i+1}</div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:T.white}}>{lead.name}</div><div style={{fontSize:11,color:T.muted}}>{lead.is_name||lead.issue_type}</div></div>
                  <Pill color={lead.tier}>{lead.tier}</Pill>
                  <Pill color={lead.status}>{lead.status}</Pill>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,color:lead.tier==="hot"?T.green:lead.tier==="warm"?T.amber:T.muted,minWidth:36,textAlign:"right"}}>{lead.score}</div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      <LeadDetail lead={selectedLead} onClose={()=>setSelectedLead(null)} onStatusChange={(id,status)=>{updateStatus(id,status);setSelectedLead(null);}}/>
      {toast&&<Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)}/>}
      <Modal open={showNotifs} onClose={()=>{setShowNotifs(false);setUnreadCount(0);}} title="Notifications">
        <NotificationsPanel userId={user.id}/>
      </Modal>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function FaqAccordion(){
  const [open,setOpen]=useState(0);
  const faqs=[
    {q:"How does the performance fee work?",a:"When you close a job sourced through Streamline, you mark it as \"Won\" in your dashboard. The performance fee is invoiced at month-end based on total closed jobs."},
    {q:"Are leads really exclusive?",a:"Yes. Once a lead is assigned to your account, it is removed from availability for any other business in our network. We never sell the same lead to multiple parties — ever."},
    {q:"What industries and areas do you serve?",a:"We currently serve HVAC, Roofing, Plumbing, and Electrical in the Columbus, Ohio metro area. Expanding to more trades and markets throughout 2026."},
    {q:"How is Streamline different from HomeAdvisor or Angi?",a:"HomeAdvisor and Angi sell the same lead to multiple businesses and charge you regardless of outcome. Streamline leads are exclusive, scored before delivery, and we only earn more when you do."},
    {q:"Can I pause or cancel my subscription?",a:"Yes. You can pause or cancel at any time from your dashboard — no penalty, no phone call required."},
  ];
  return(
    <div style={{maxWidth:720,margin:"48px auto 0",textAlign:"left"}}>
      {faqs.map((f,i)=>(
        <div key={i} style={{borderBottom:`1px solid ${T.border}`,padding:"22px 0",cursor:"pointer"}} onClick={()=>setOpen(open===i?-1:i)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:16,fontWeight:500,color:T.white}}>
            {f.q}<span style={{color:open===i?T.blueL:T.muted,fontSize:20,transition:"transform 0.3s",transform:open===i?"rotate(180deg)":"rotate(0deg)",flexShrink:0,marginLeft:16}}>⌄</span>
          </div>
          {open===i&&<p style={{fontSize:14,color:T.muted,lineHeight:1.7,marginTop:14,animation:"fadeUp 0.25s ease"}}>{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

function LandingPage({onLogin,onIntakeForm}){
  const [showAuth,setShowAuth]=useState(false);
  const scrollTo=id=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  const SE=({children})=><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:500,color:T.blueL,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:14}}>{children}</div>;
  const SH=({children})=><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(30px,3.5vw,44px)",lineHeight:1.1,letterSpacing:-1,color:T.white,marginBottom:18}}>{children}</h2>;

  return(
    <div style={{background:T.bg}}>
      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,height:68,zIndex:200,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 48px",background:"rgba(9,12,17,0.88)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={32}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:T.white}}>Streamline</span></div>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          {[["industries","Industries"],["how","How It Works"],["features","Features"],["pricing","Pricing"],["faq","FAQ"]].map(([id,label])=>(
            <button key={id} onClick={()=>scrollTo(id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:500,color:T.muted,padding:"6px 14px",borderRadius:7,transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=T.white} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>{label}</button>
          ))}
        </div>
        <Button variant="outline" onClick={()=>setShowAuth(true)}>Log In</Button>
      </nav>

      {/* HERO */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"140px 48px 80px",textAlign:"center",position:"relative",overflow:"hidden",background:"radial-gradient(ellipse 65% 60% at 50% 40%,rgba(37,99,235,0.1),transparent 70%)"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent 5%,rgba(37,99,235,0.45) 35%,rgba(6,182,212,0.55) 50%,rgba(37,99,235,0.45) 65%,transparent 95%)"}}/>
        <div style={{maxWidth:700,position:"relative",zIndex:1}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(37,99,235,0.1)",border:"1px solid rgba(37,99,235,0.25)",borderRadius:100,padding:"7px 16px",fontSize:12,fontWeight:600,color:T.blueL,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:28}}>
            <div style={{width:6,height:6,background:T.blueL,borderRadius:"50%",animation:"pulse 2s infinite"}}/>Now accepting businesses — Columbus, OH
          </div>
          <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(44px,6vw,72px)",lineHeight:1.06,letterSpacing:-2,marginBottom:24}}>Stop chasing leads.<br/>Start closing{" "}<em style={{fontStyle:"italic",background:`linear-gradient(135deg,${T.blueL},${T.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>jobs.</em></h1>
          <p style={{fontSize:18,color:T.offWhite,lineHeight:1.75,maxWidth:520,margin:"0 auto 40px",fontWeight:300}}>Your pipeline, <em style={{fontStyle:"italic",color:T.cyan}}>streamlined.</em> Qualified, scored leads delivered directly to your dashboard.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
            <Button size="lg" onClick={()=>setShowAuth(true)}>Request Access →</Button>
            <Button variant="outline" size="lg" onClick={onIntakeForm}>Try the Intake Form</Button>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
            {["🌬️ HVAC","🏠 Roofing","🔧 Plumbing","⚡ Electrical"].map(tag=>(
              <span key={tag} style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:100,padding:"5px 14px",fontSize:12,color:T.offWhite,fontWeight:500}}>{tag}</span>
            ))}
            <span style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:100,padding:"5px 14px",fontSize:12,color:T.muted,fontStyle:"italic"}}>+ more</span>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section id="industries" style={{padding:"80px 0",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}>
          <p style={{textAlign:"center",fontSize:12,fontWeight:500,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:44,fontFamily:"'JetBrains Mono',monospace"}}>Built for service businesses that run on booked jobs</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
            {[{icon:"🌬️",name:"HVAC",type:"Heating & Cooling"},{icon:"🏠",name:"Roofing",type:"Repair & Replacement"},{icon:"🔧",name:"Plumbing",type:"Residential & Commercial"},{icon:"⚡",name:"Electrical",type:"Install & Service"}].map(ind=>(
              <div key={ind.name} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"24px 18px",textAlign:"center",transition:"all 0.25s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(37,99,235,0.35)";e.currentTarget.style.transform="translateY(-3px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.transform="translateY(0)"}}>
                <div style={{fontSize:28,marginBottom:10}}>{ind.icon}</div>
                <div style={{fontSize:13,fontWeight:600,color:T.white,marginBottom:4}}>{ind.name}</div>
                <div style={{fontSize:11,color:T.muted}}>{ind.type}</div>
              </div>
            ))}
            <div style={{background:T.surface2,border:`1px dashed ${T.border2}`,borderRadius:12,padding:"24px 18px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
              <span style={{fontSize:22,color:T.muted}}>+</span><span style={{fontSize:13,color:T.muted,fontStyle:"italic"}}>More coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" style={{padding:"110px 0"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}>
          <SE>How It Works</SE><SH>From customer intent<br/>to your calendar.</SH>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,marginTop:56,alignItems:"start"}}>
            <div>
              {[{n:"01",title:"Customer requests a quote",desc:"A customer fills out our 5-step intake form from your ad or direct link. Issue type, urgency, budget, property details, and contact info — all captured precisely."},{n:"02",title:"We score and qualify",desc:"Our engine scores every lead 0–100 across budget, urgency, ownership, property size, issue clarity, and contact quality. Low-intent leads are filtered out automatically."},{n:"03",title:"An instant estimate is generated",desc:"Each qualified lead receives a scoped price range based on their job and location. They arrive pre-educated — no sticker shock, no lowball expectations."},{n:"04",title:"Lead delivered to your dashboard",desc:"You get the full lead package in real-time — contact, job type, score, estimate, and status. No sharing. Exclusively yours."}].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:20,padding:"24px 0",borderBottom:`1px solid ${T.border}`,borderTop:i===0?`1px solid ${T.border}`:"none"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted,minWidth:28,paddingTop:2}}>{s.n}</div>
                  <div><div style={{fontSize:16,fontWeight:600,color:T.white,marginBottom:8}}>{s.title}</div><div style={{fontSize:14,color:T.muted,lineHeight:1.65}}>{s.desc}</div></div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:16,overflow:"hidden",boxShadow:"0 40px 80px rgba(0,0,0,0.4)",position:"sticky",top:100}}>
              <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Lead Pipeline — Live</span>
                <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.green}}><div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/>Live</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderBottom:`1px solid ${T.border}`}}>
                {[{v:"18",label:"New Leads",color:T.blueL},{v:"7",label:"Booked",color:T.white},{v:"$16,800",label:"Pipeline",color:T.green}].map(s=>(
                  <div key={s.label} style={{padding:"14px 16px",borderRight:`1px solid ${T.border}`}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:500,color:s.color,marginBottom:2}}>{s.v}</div>
                    <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:10,display:"flex",flexDirection:"column",gap:6}}>
                {[{name:"Marcus T.",issue:"Roof Replacement",score:94,tier:"hot",budget:"$8,000+",badge:"HOT"},{name:"Jennifer K.",issue:"AC Installation",score:84,tier:"warm",budget:"$3,500+",badge:"NEW"},{name:"David R.",issue:"Electrical Panel",score:73,tier:"warm",budget:"$2,000+",badge:"BOOKED"}].map((l,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:T.surface2,borderRadius:8,border:`1px solid ${T.border}`}}>
                    <div><div style={{fontSize:12,fontWeight:600,color:T.white,marginBottom:1}}>{l.name} — {l.issue}</div><div style={{fontSize:10,color:T.muted}}>{l.budget} · Columbus, OH</div></div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:48,height:3,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${l.score}%`,height:"100%",background:`linear-gradient(90deg,${T.blue},${T.cyan})`,borderRadius:2}}/></div>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.blueL}}>{l.score}</span>
                      <Pill color={l.tier}>{l.badge}</Pill>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section style={{padding:"90px 0",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,background:T.surface}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}>
          <SE>By the numbers</SE><SH>Built for businesses<br/>that run lean.</SH>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:T.border,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",marginTop:48}}>
            {[{num:"87",unit:"%",label:"Lead qualification rate",desc:"Only high-scoring, high-intent customers reach your inbox."},{num:"34",unit:"%",label:"Average close rate lift",desc:"Pre-educated leads close at dramatically higher rates."},{num:"<60",unit:"s",label:"Lead delivery time",desc:"From qualification to your dashboard in under 60 seconds."},{num:"0",unit:"",label:"Shared leads",desc:"Every lead is exclusively yours. Never sold to anyone else."}].map(m=>(
              <div key={m.label} style={{background:T.surface,padding:"36px 28px",transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background=T.surface}>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:48,color:T.white,lineHeight:1,marginBottom:8,letterSpacing:-2}}>{m.num}<span style={{color:T.blueL}}>{m.unit}</span></div>
                <div style={{fontSize:14,fontWeight:500,color:T.offWhite,marginBottom:8}}>{m.label}</div>
                <div style={{fontSize:13,color:T.muted,lineHeight:1.5}}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:"110px 0"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,alignItems:"end",marginBottom:56}}>
            <div><SE>Platform Features</SE><SH>Everything you need.<br/>Nothing you don't.</SH></div>
            <p style={{fontSize:16,color:T.offWhite,lineHeight:1.7,fontWeight:300}}>Purpose-built for service businesses. No bloated CRM, no learning curve — just a clean pipeline of qualified opportunities.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:T.border,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
            {[{icon:"⚡",title:"Intelligent Lead Scoring",desc:"Scored across six dimensions before it reaches you — budget, urgency, job size, location, ownership, and issue clarity."},{icon:"📊",title:"Real-Time Dashboard",desc:"Live pipeline with score breakdowns, estimated values, customer notes, and booking status in one place."},{icon:"💬",title:"Pre-Built Estimates",desc:"Each lead arrives with a price range the customer has already seen. No sticker shock on first contact."},{icon:"📅",title:"Calendar Booking",desc:"Qualified customers book directly into your schedule. You control availability."},{icon:"🔔",title:"Instant Notifications",desc:"In-app alerts the moment a lead is assigned — plus email notifications so you never miss a hot lead."},{icon:"📈",title:"Win/Loss Tracking",desc:"Track your close rate by lead source, job type, and season to bid smarter over time."}].map(f=>(
              <div key={f.title} style={{background:T.surface,padding:"34px 30px",transition:"background 0.25s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background=T.surface}>
                <div style={{width:44,height:44,background:"rgba(37,99,235,0.12)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:18,border:"1px solid rgba(37,99,235,0.2)"}}>{f.icon}</div>
                <div style={{fontSize:15,fontWeight:600,color:T.white,marginBottom:10}}>{f.title}</div>
                <div style={{fontSize:13,color:T.muted,lineHeight:1.65}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:"110px 0",borderTop:`1px solid ${T.border}`}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px",textAlign:"center"}}>
          <SE>Pricing</SE><SH>Pay for what works.</SH>
          <p style={{fontSize:16,color:T.offWhite,lineHeight:1.7,fontWeight:300,maxWidth:500,margin:"0 auto 56px"}}>A low base keeps costs predictable. The performance fee means we only win when you win.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:840,margin:"0 auto"}}>
            {[{plan:"Starter",price:"299",perf:"$150",popular:false,features:["Up to 20 qualified leads / month","Intelligent intake + scoring","Instant estimate generation","In-app + email notifications","Dashboard + win/loss tracking","Exclusive leads, never shared"]},
              {plan:"Growth",price:"499",perf:"$100",popular:true,features:["Up to 50 qualified leads / month","Everything in Starter","Priority lead queue","Seasonal campaign boosts","CRM integrations (Jobber, ServiceTitan)","Dedicated account manager"]}].map(p=>(
              <div key={p.plan} style={{background:p.popular?`linear-gradient(135deg,rgba(37,99,235,0.08),${T.surface})`:T.surface,border:`1px solid ${p.popular?T.blue:T.border2}`,borderRadius:20,padding:40,position:"relative",transition:"transform 0.25s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                {p.popular&&<><div style={{display:"inline-flex",background:T.blue,color:"white",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16,fontFamily:"'JetBrains Mono',monospace"}}>Most Popular</div><div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${T.blue},transparent)`}}/></>}
                <div style={{fontSize:13,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10,fontFamily:"'JetBrains Mono',monospace"}}>{p.plan}</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:52,color:T.white,lineHeight:1,letterSpacing:-2,marginBottom:4}}><sub style={{fontSize:20,fontFamily:"'DM Sans',sans-serif",fontWeight:300,color:T.muted}}>$</sub>{p.price}</div>
                <div style={{fontSize:13,color:T.muted,marginBottom:8}}>per month</div>
                <div style={{fontSize:13,color:T.blueL,fontFamily:"'JetBrains Mono',monospace",marginBottom:28,padding:"8px 12px",background:"rgba(37,99,235,0.1)",borderRadius:6,border:"1px solid rgba(37,99,235,0.2)",display:"inline-block"}}>+ {p.perf} per closed job</div>
                <div style={{height:1,background:T.border,marginBottom:24}}/>
                <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32,textAlign:"left"}}>
                  {p.features.map(f=><div key={f} style={{display:"flex",alignItems:"flex-start",gap:10,fontSize:14,color:T.offWhite}}><span style={{color:T.blueL,flexShrink:0}}>›</span>{f}</div>)}
                </div>
                <button onClick={()=>setShowAuth(true)} style={{width:"100%",padding:14,borderRadius:10,fontSize:15,fontWeight:600,cursor:"pointer",background:p.popular?T.blue:"none",color:p.popular?"white":T.offWhite,border:p.popular?"none":`1px solid ${T.border2}`,transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background=p.popular?T.blueL:T.surface2} onMouseLeave={e=>e.currentTarget.style.background=p.popular?T.blue:"none"}>Get Started</button>
              </div>
            ))}
          </div>
          <p style={{fontSize:13,color:T.muted,marginTop:28}}>Need more than 50 leads/month? <span style={{color:T.blueL,cursor:"pointer"}} onClick={()=>setShowAuth(true)}>Talk to us about a custom plan →</span></p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:"110px 0",borderTop:`1px solid ${T.border}`,background:T.surface}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}>
          <SE>Client Reviews</SE><SH>What our clients say.</SH>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginTop:48}}>
            {[{initials:"MR",name:"Mike R.",company:"Roofing · Columbus, OH",quote:"The leads come in already knowing their budget range. That alone changed how our conversations go. Closing faster than ever."},{initials:"DL",name:"Dana L.",company:"Plumbing · Dublin, OH",quote:"I was spending $800/month sharing leads with four other companies. Streamline gives me exclusives at a lower cost per job."},{initials:"JT",name:"James T.",company:"Electrical · Westerville, OH",quote:"The dashboard is clean, the leads are real, and I've never received one that was obviously junk. Worth every dollar."}].map(t=>(
              <div key={t.name} style={{background:T.bg,border:`1px solid ${T.border2}`,borderRadius:16,padding:32,transition:"transform 0.2s,border-color 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor="rgba(37,99,235,0.3)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=T.border2}}>
                <div style={{color:T.amber,fontSize:14,marginBottom:16,letterSpacing:2}}>★★★★★</div>
                <p style={{fontSize:15,color:T.offWhite,lineHeight:1.7,fontStyle:"italic",marginBottom:24,fontFamily:"'DM Serif Display',serif"}}>"{t.quote}"</p>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:T.blueL,border:`1px solid ${T.border2}`,fontFamily:"'JetBrains Mono',monospace"}}>{t.initials}</div>
                  <div><div style={{fontSize:14,fontWeight:600,color:T.white}}>{t.name}</div><div style={{fontSize:12,color:T.muted}}>{t.company}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{padding:"110px 0",borderTop:`1px solid ${T.border}`}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px",textAlign:"center"}}>
          <SE>FAQ</SE><SH>Common questions.</SH><FaqAccordion/>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"110px 0",textAlign:"center",borderTop:`1px solid ${T.border}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(37,99,235,0.1),transparent 70%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:640,margin:"0 auto",padding:"0 48px",position:"relative",zIndex:1}}>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(34px,4vw,50px)",lineHeight:1.1,letterSpacing:-1.5,marginBottom:20}}>Ready to fill your<br/>calendar with real jobs?</h2>
          <p style={{fontSize:16,color:T.offWhite,marginBottom:40,fontWeight:300}}>Join service businesses across Columbus who've replaced cold leads with a qualified, exclusive pipeline.</p>
          <div style={{display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap"}}>
            <Button size="lg" onClick={()=>setShowAuth(true)}>Request Access →</Button>
            <Button variant="outline" size="lg" onClick={()=>setShowAuth(true)}>See a demo</Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:`1px solid ${T.border}`,padding:"60px 0 40px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 48px"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:60,marginBottom:56}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><LogoMark size={30}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:19,color:T.white}}>Streamline</span></div>
              <p style={{fontSize:14,color:T.muted,lineHeight:1.6,maxWidth:240}}>Qualified leads for service businesses that run on booked jobs.</p>
            </div>
            {[{title:"Product",links:["How It Works","Features","Pricing","Dashboard Login"]},{title:"Company",links:["About","Blog","Careers","Contact"]},{title:"Support",links:["Help Center","Client FAQ","Onboarding","Status"]}].map(col=>(
              <div key={col.title}>
                <div style={{fontSize:12,fontWeight:600,color:T.offWhite,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:18,fontFamily:"'JetBrains Mono',monospace"}}>{col.title}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {col.links.map(l=><a key={l} href="#" style={{fontSize:14,color:T.muted,textDecoration:"none"}} onMouseEnter={e=>e.currentTarget.style.color=T.white} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:28,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div style={{fontSize:13,color:T.muted}}>© 2026 Streamline. All rights reserved.</div>
            <div style={{display:"flex",gap:24}}>{["Privacy Policy","Terms of Service","Cookie Policy"].map(l=><a key={l} href="#" style={{fontSize:13,color:T.muted,textDecoration:"none"}}>{l}</a>)}</div>
          </div>
        </div>
      </footer>

      <Modal open={showAuth} onClose={()=>setShowAuth(false)} title="">
        <AuthPage onAuth={(user)=>{setShowAuth(false);onLogin(user);}}/>
      </Modal>
      <Chatbot/>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("loading");
  const [user,setUser]=useState(null);

  useEffect(()=>{
    db.getSession().then(async session=>{
      if(session){
        const business = await db.getBusiness(session.user.id);
        setUser({...session.user,...business});
        setPage("dashboard");
      } else {
        setPage("landing");
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = sb.auth.onAuthStateChange(async(event,session)=>{
      if(event==="SIGNED_OUT"){ setUser(null); setPage("landing"); }
    });
    return()=>subscription.unsubscribe();
  },[]);

  const handleLogin=(u)=>{ setUser(u); setPage("dashboard"); };
  const handleLogout=async()=>{ await db.signOut(); setUser(null); setPage("landing"); };
  const goIntake=()=>{ window.history.pushState({},"",window.location.pathname+"?form=hvac"); setPage("intake"); };
  const goBack=()=>{ window.history.pushState({},"",window.location.pathname); setPage("landing"); };

  if(page==="loading") return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,flexDirection:"column",gap:16}}>
      <LogoMark size={40}/><Spinner/><span style={{color:T.muted,fontSize:14}}>Loading…</span>
    </div>
  );
  if(page==="intake") return <IntakeForm onBack={goBack}/>;
  if(page==="dashboard"&&user) return <Dashboard user={user} onLogout={handleLogout}/>;
  return <LandingPage onLogin={handleLogin} onIntakeForm={goIntake}/>;
}