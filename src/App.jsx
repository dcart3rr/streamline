import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://teixvcgtuqtclvvyfqat.supabase.co";
const SUPABASE_KEY = "sb_publishable_c8tvTyGmR0_IAWg6692bLg_tTwMPBYA";
const DEMO_BUSINESS_ID = "185446cc-87a1-4508-a1da-63117aeaa7f2";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const T = {
  bg:"#090C11", surface:"#0F1319", surface2:"#151B25", surface3:"#1C2333",
  border:"rgba(255,255,255,0.07)", border2:"rgba(255,255,255,0.11)",
  blue:"#2563EB", blueL:"#3B82F6", cyan:"#06B6D4",
  white:"#F8FAFC", offWhite:"#CBD5E1", muted:"#64748B",
  green:"#10B981", amber:"#F59E0B", red:"#EF4444",
};

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);
const gs = document.createElement("style");
gs.textContent = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;min-height:100%}
  body{background:${T.bg};color:${T.white};font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${T.surface}}::-webkit-scrollbar-thumb{background:${T.surface3};border-radius:2px}
  input,select,textarea,button{font-family:inherit;-webkit-appearance:none}
  a{color:inherit;text-decoration:none}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes chatPop{from{opacity:0;transform:translateY(12px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes typingDot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  html{scroll-behavior:smooth}
  @media(max-width:768px){
    .hide-mobile{display:none!important}
    .grid-1-mobile{grid-template-columns:1fr!important}
    .grid-2-mobile{grid-template-columns:1fr 1fr!important}
    .col-mobile{flex-direction:column!important}
    .center-mobile{text-align:center!important;justify-content:center!important}
    .full-mobile{width:100%!important}
  }
  select option{background:${T.surface2};color:${T.white}}
`;
document.head.appendChild(gs);

// ─── INDUSTRY CONFIG ──────────────────────────────────────────────────────────
const INDUSTRIES = {
  hvac:{
    label:"HVAC",icon:"🌬️",color:"#06B6D4",
    headline:"Get a Free HVAC Quote",
    subline:"AC repair, heating, duct work — we'll connect you with a local pro today.",
    issueTypes:[
      {value:"ac_repair",label:"AC Not Cooling / Warm Air"},
      {value:"ac_replacement",label:"AC Replacement"},
      {value:"ac_install",label:"New AC Installation"},
      {value:"furnace",label:"Furnace / Heating Issue"},
      {value:"heat_pump",label:"Heat Pump Service"},
      {value:"duct_cleaning",label:"Duct Cleaning"},
      {value:"thermostat",label:"Thermostat Install / Repair"},
      {value:"boiler",label:"Boiler Service"},
      {value:"maintenance",label:"Annual Tune-Up / Maintenance"},
      {value:"other",label:"Other HVAC Issue"},
    ],
    estimates:{"ac_repair":"$350–$1,200","furnace":"$200–$900","duct_cleaning":"$300–$700","ac_replacement":"$3,500–$7,500","heat_pump":"$800–$2,500","ac_install":"$3,000–$6,500","thermostat":"$150–$400","maintenance":"$100–$250","boiler":"$500–$2,000"},
  },
  roofing:{
    label:"Roofing",icon:"🏠",color:"#F59E0B",
    headline:"Get a Free Roofing Quote",
    subline:"Repair, replacement, or inspection — a local roofer will reach out today.",
    issueTypes:[
      {value:"leak_repair",label:"Roof Leak / Water Damage"},
      {value:"shingle_repair",label:"Missing / Damaged Shingles"},
      {value:"full_replacement",label:"Full Roof Replacement"},
      {value:"inspection",label:"Roof Inspection"},
      {value:"gutter_repair",label:"Gutter Repair / Replacement"},
      {value:"storm_damage",label:"Storm / Hail Damage"},
      {value:"flat_roof",label:"Flat Roof / Commercial"},
      {value:"skylight",label:"Skylight Install / Repair"},
      {value:"ventilation",label:"Attic Ventilation"},
      {value:"other",label:"Other Roofing Issue"},
    ],
    estimates:{"leak_repair":"$300–$1,500","shingle_repair":"$200–$800","full_replacement":"$8,000–$20,000","inspection":"$150–$400","gutter_repair":"$200–$1,200","storm_damage":"$500–$5,000","flat_roof":"$3,000–$12,000","skylight":"$800–$3,500","ventilation":"$300–$1,000"},
  },
  plumbing:{
    label:"Plumbing",icon:"🔧",color:"#10B981",
    headline:"Get a Free Plumbing Quote",
    subline:"Emergency or planned — a licensed plumber will contact you shortly.",
    issueTypes:[
      {value:"leak_repair",label:"Pipe Leak / Burst Pipe"},
      {value:"drain_clog",label:"Clogged Drain / Backup"},
      {value:"water_heater",label:"Water Heater Repair / Replace"},
      {value:"toilet",label:"Toilet Repair / Replace"},
      {value:"faucet",label:"Faucet / Fixture Install"},
      {value:"sewer",label:"Sewer Line Issue"},
      {value:"water_pressure",label:"Low Water Pressure"},
      {value:"garbage_disposal",label:"Garbage Disposal"},
      {value:"remodel",label:"Bathroom / Kitchen Remodel"},
      {value:"other",label:"Other Plumbing Issue"},
    ],
    estimates:{"leak_repair":"$150–$800","drain_clog":"$100–$500","water_heater":"$500–$2,000","toilet":"$150–$600","faucet":"$100–$400","sewer":"$1,000–$5,000","water_pressure":"$200–$800","garbage_disposal":"$150–$500","remodel":"$2,000–$15,000"},
  },
  electrical:{
    label:"Electrical",icon:"⚡",color:"#A78BFA",
    headline:"Get a Free Electrical Quote",
    subline:"Safe, licensed, and local — an electrician will reach out today.",
    issueTypes:[
      {value:"panel_upgrade",label:"Panel Upgrade / Replacement"},
      {value:"outlet_repair",label:"Outlet / Switch Repair"},
      {value:"wiring",label:"Wiring / Rewiring"},
      {value:"lighting",label:"Lighting Install / Repair"},
      {value:"ev_charger",label:"EV Charger Installation"},
      {value:"ceiling_fan",label:"Ceiling Fan Install"},
      {value:"generator",label:"Generator Install / Service"},
      {value:"safety_inspection",label:"Electrical Safety Inspection"},
      {value:"smart_home",label:"Smart Home / Automation"},
      {value:"other",label:"Other Electrical Issue"},
    ],
    estimates:{"panel_upgrade":"$1,500–$4,000","outlet_repair":"$100–$400","wiring":"$500–$3,000","lighting":"$150–$800","ev_charger":"$400–$1,200","ceiling_fan":"$100–$350","generator":"$3,000–$8,000","safety_inspection":"$150–$350","smart_home":"$500–$3,000"},
  },
};

function getIndustryFromURL(){
  const p=new URLSearchParams(window.location.search);
  const raw=(p.get("industry")||p.get("i")||p.get("trade")||"").toLowerCase();
  if(INDUSTRIES[raw]) return raw;
  if(raw.includes("roof")) return "roofing";
  if(raw.includes("plumb")) return "plumbing";
  if(raw.includes("elec")) return "electrical";
  if(raw.includes("hvac")||raw.includes("heat")||raw.includes("cool")||raw.includes("ac")) return "hvac";
  return null;
}

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const db={
  signIn:async(e,p)=>{const{data,error}=await sb.auth.signInWithPassword({email:e,password:p});if(error)throw error;return data;},
  signUp:async(e,p)=>{const{data,error}=await sb.auth.signUp({email:e,password:p});if(error)throw error;return data;},
  signOut:async()=>sb.auth.signOut(),
  getSession:async()=>{const{data}=await sb.auth.getSession();return data.session;},
  getBusiness:async(id)=>{const{data}=await sb.from("businesses").select("*").eq("id",id).single();return data;},
  upsertBusiness:async(b)=>{const{data,error}=await sb.from("businesses").upsert(b).select().single();if(error)throw error;return data;},
  getLeads:async(bid)=>{const{data,error}=await sb.from("leads").select("*").eq("business_id",bid).order("created_at",{ascending:false});if(error)throw error;return data||[];},
  insertLead:async(l)=>{const{data,error}=await sb.from("leads").insert([l]).select().single();if(error)throw error;return data;},
  updateLeadStatus:async(id,s)=>{const{error}=await sb.from("leads").update({status:s}).eq("id",id);if(error)throw error;},
  getNotifications:async(bid)=>{const{data}=await sb.from("notifications").select("*").eq("business_id",bid).order("created_at",{ascending:false}).limit(50);return data||[];},
  insertNotification:async(n)=>sb.from("notifications").insert([n]),
  markNotifsRead:async(bid)=>sb.from("notifications").update({read:true}).eq("business_id",bid).eq("read",false),
  subscribeToLeads:(bid,cb)=>sb.channel("leads-rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"leads",filter:`business_id=eq.${bid}`},p=>cb(p.new)).subscribe(),
};

function scoreLeadData(d){
  let s=0;const b={};
  b.budget={"under_500":2,"500_1000":6,"1000_2000":12,"2000_5000":17,"5000_plus":20}[d.budget]??0;s+=b.budget;
  b.urgency={"flexible":5,"this_week":13,"emergency":20}[d.urgency]??0;s+=b.urgency;
  b.ownership={"renter_no":2,"renter_yes":8,"owner":15}[d.ownership]??0;s+=b.ownership;
  b.size={"under_1000":6,"1000_2000":10,"2000_3500":13,"3500_plus":15}[d.propertySize]??0;s+=b.size;
  const dl=(d.issueDescription||"").trim().length;
  b.clarity=dl>80?15:dl>30?10:dl>5?6:0;s+=b.clarity;
  let c=0;if(d.phone?.replace(/\D/g,"").length>=10)c+=7;if(d.preferredTime)c+=4;if(d.zipCode?.length>=5)c+=4;
  b.contact=c;s+=c;
  return{score:Math.round(s),breakdown:b,tier:s>=75?"hot":s>=50?"warm":"cold"};
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function Pill({color,children}){
  const C={hot:{bg:"rgba(239,68,68,0.15)",text:"#F87171",bd:"rgba(239,68,68,0.3)"},warm:{bg:"rgba(245,158,11,0.15)",text:"#FCD34D",bd:"rgba(245,158,11,0.3)"},cold:{bg:"rgba(100,116,139,0.2)",text:"#94A3B8",bd:"rgba(100,116,139,0.3)"},new:{bg:"rgba(37,99,235,0.2)",text:"#93C5FD",bd:"rgba(37,99,235,0.3)"},contacted:{bg:"rgba(245,158,11,0.15)",text:"#FCD34D",bd:"rgba(245,158,11,0.3)"},won:{bg:"rgba(16,185,129,0.15)",text:"#34D399",bd:"rgba(16,185,129,0.3)"},lost:{bg:"rgba(239,68,68,0.12)",text:"#F87171",bd:"rgba(239,68,68,0.25)"}};
  const s=C[color]||C.new;
  return <span style={{display:"inline-flex",alignItems:"center",background:s.bg,color:s.text,border:`1px solid ${s.bd}`,borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.07em",whiteSpace:"nowrap"}}>{children}</span>;
}

function ScoreBar({score}){
  const c=score>=75?T.green:score>=50?T.amber:T.muted;
  return <div style={{display:"flex",alignItems:"center",gap:8}}>
    <div style={{flex:1,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${score}%`,height:"100%",background:`linear-gradient(90deg,${T.blue},${c})`,borderRadius:2}}/></div>
    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:c,minWidth:24}}>{score}</span>
  </div>;
}

function Inp({label,value,onChange,type="text",placeholder,required,options,hint}){
  const base={width:"100%",background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:10,padding:"13px 14px",color:T.white,fontSize:15,outline:"none",transition:"border-color 0.2s"};
  return <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label&&<label style={{fontSize:12,fontWeight:600,color:T.offWhite,letterSpacing:"0.04em"}}>{label}{required&&<span style={{color:T.blueL,marginLeft:3}}>*</span>}</label>}
    {hint&&<span style={{fontSize:11,color:T.muted,marginTop:-2}}>{hint}</span>}
    {type==="select"
      ?<select value={value} onChange={e=>onChange(e.target.value)} style={{...base,cursor:"pointer",color:value?T.white:T.muted,appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center",paddingRight:36}}>
        <option value="">Select one…</option>
        {options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      :type==="textarea"
      ?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={4} style={{...base,resize:"vertical",lineHeight:1.6}}/>
      :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>
    }
  </div>;
}

function Btn({children,onClick,variant="primary",size="md",disabled,fullWidth,style={}}){
  const sz={sm:{padding:"8px 16px",fontSize:13},md:{padding:"13px 22px",fontSize:14},lg:{padding:"15px 30px",fontSize:16}};
  const v={
    primary:{background:T.blue,color:"white",border:"none"},
    outline:{background:"none",color:T.offWhite,border:`1px solid ${T.border2}`},
    ghost:{background:"none",color:T.muted,border:"none"},
    danger:{background:"rgba(239,68,68,0.12)",color:"#F87171",border:"1px solid rgba(239,68,68,0.25)"},
    success:{background:"rgba(16,185,129,0.12)",color:T.green,border:`1px solid rgba(16,185,129,0.25)`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...sz[size],...v[variant],borderRadius:10,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,transition:"all 0.2s",width:fullWidth?"100%":"auto",touchAction:"manipulation",lineHeight:1,...style}}>{children}</button>;
}

function Card({children,style={}}){return <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,padding:20,...style}}>{children}</div>;}

function Modal({open,onClose,title,children,width=540}){
  useEffect(()=>{
    if(open)document.body.style.overflow="hidden";
    else document.body.style.overflow="";
    return()=>{document.body.style.overflow="";};
  },[open]);
  if(!open)return null;
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:"18px 18px 0 0",width:"100%",maxWidth:width,maxHeight:"92vh",overflow:"auto",animation:"slideUp 0.28s ease"}}>
      {title&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,background:T.surface,zIndex:1}}>
        <span style={{fontSize:16,fontWeight:600}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:22,lineHeight:1,padding:4}}>×</button>
      </div>}
      <div style={{padding:20}}>{children}</div>
    </div>
  </div>;
}

function Toast({message,type="success",onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t)},[]);
  const c={success:T.green,error:T.red,info:T.blueL};
  return <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:2000,background:T.surface2,border:`1px solid ${c[type]}50`,borderRadius:12,padding:"13px 20px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 16px 48px rgba(0,0,0,0.5)",animation:"fadeUp 0.3s ease",whiteSpace:"nowrap",maxWidth:"90vw"}}>
    <div style={{width:7,height:7,borderRadius:"50%",background:c[type],flexShrink:0}}/>
    <span style={{fontSize:14,color:T.offWhite}}>{message}</span>
  </div>;
}

function Spinner({size=20}){return <div style={{width:size,height:size,border:`2px solid ${T.border2}`,borderTopColor:T.blueL,borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>;}

function LogoMark({size=32}){
  return <div style={{width:size,height:size,background:T.blue,borderRadius:Math.round(size*0.28),display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
    <div style={{position:"absolute",width:size*0.44,height:2,background:"white",borderRadius:1,boxShadow:`0 ${-size*0.16}px 0 white, 0 ${size*0.16}px 0 rgba(255,255,255,0.5)`}}/>
  </div>;
}

// ─── CHATBOT ──────────────────────────────────────────────────────────────────
const KB={
  greetings:["hi","hello","hey"],pricing:["price","cost","how much","plan","fee","pay"],
  how:["how","work","explain","process"],leads:["lead","exclusive","shared","quality","score"],
  industries:["hvac","roofing","plumbing","electrical","industry"],intake:["intake","form","quote","submit"],
  contact:["contact","call","email","support","human"],cancel:["cancel","pause","stop"],
  difference:["different","homeadvisor","angi","thumbtack","vs"],
};
function autoReply(msg){
  const m=msg.toLowerCase();
  if(KB.greetings.some(w=>m.includes(w)))return "Hey! Welcome to Streamline. Ask me about pricing, how it works, or lead quality.";
  if(KB.difference.some(w=>m.includes(w)))return "Unlike HomeAdvisor or Angi, we never sell the same lead to multiple businesses. Leads are exclusive, pre-scored, and we only earn more when you close the job.";
  if(KB.pricing.some(w=>m.includes(w)))return "**Starter — $299/mo** + $150 per closed job (up to 20 leads/mo)\n**Growth — $499/mo** + $100 per closed job (up to 50 leads/mo)\n\nPerformance fee only when you win.";
  if(KB.how.some(w=>m.includes(w)))return "1️⃣ Customer fills out the intake form\n2️⃣ We score them 0–100\n3️⃣ They get an instant estimate\n4️⃣ Lead hits your dashboard in <60 seconds";
  if(KB.leads.some(w=>m.includes(w)))return "Every lead is exclusive — once assigned, no other business sees it. Scored Hot (75+), Warm (50–74), or Cold (<50).";
  if(KB.industries.some(w=>m.includes(w)))return "Live for **HVAC, Roofing, Plumbing, and Electrical** in Columbus, OH. Expanding in 2026.";
  if(KB.intake.some(w=>m.includes(w)))return "Each industry has its own intake form with tailored questions. Driven by URL param — one form per ad campaign.";
  if(KB.cancel.some(w=>m.includes(w)))return "Cancel or pause anytime from your dashboard — no penalties.";
  if(KB.contact.some(w=>m.includes(w)))return "Reach us at **hello@streamline.io** or click Request Access to schedule a demo.";
  return "I may not have that detail — reach us at hello@streamline.io or click **Request Access** to talk with someone.";
}

function Chatbot(){
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([{role:"bot",text:"Hi! I'm the Streamline assistant. Ask me anything about pricing, how we work, or lead quality.",ts:Date.now()}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [unread,setUnread]=useState(0);
  const bottomRef=useRef(null);
  useEffect(()=>{if(open){setUnread(0);setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),80)}},[msgs,open]);
  const send=async()=>{
    const text=input.trim();if(!text)return;
    setInput("");setMsgs(m=>[...m,{role:"user",text,ts:Date.now()}]);setTyping(true);
    await new Promise(r=>setTimeout(r,700+Math.random()*400));
    setMsgs(m=>[...m,{role:"bot",text:autoReply(text),ts:Date.now()}]);setTyping(false);
    if(!open)setUnread(u=>u+1);
  };
  const fmt=t=>t.split(/(\*\*[^*]+\*\*)/).map((p,i)=>p.startsWith("**")&&p.endsWith("**")?<strong key={i} style={{color:T.white}}>{p.slice(2,-2)}</strong>:p.split("\n").map((l,j,a)=><span key={j}>{l}{j<a.length-1&&<br/>}</span>));
  return <div style={{position:"fixed",bottom:20,right:16,zIndex:500}}>
    {open&&<div style={{position:"absolute",bottom:66,right:0,width:"min(360px,calc(100vw - 24px))",background:T.surface,border:`1px solid ${T.border2}`,borderRadius:16,boxShadow:"0 24px 64px rgba(0,0,0,0.6)",display:"flex",flexDirection:"column",height:440,animation:"chatPop 0.25s ease"}}>
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`,background:T.surface2,borderRadius:"16px 16px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${T.blue},${T.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white"}}>S</div>
          <div><div style={{fontSize:13,fontWeight:600}}>Streamline Assistant</div><div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.green}}><div style={{width:4,height:4,borderRadius:"50%",background:T.green}}/>Online</div></div>
        </div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20,padding:4}}>×</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
          <div style={{maxWidth:"85%",padding:"10px 12px",borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",background:m.role==="user"?T.blue:T.surface2,fontSize:13,color:m.role==="user"?T.white:T.offWhite,lineHeight:1.6,border:m.role==="bot"?`1px solid ${T.border}`:"none"}}>
            {m.role==="bot"?fmt(m.text):m.text}
          </div>
        </div>)}
        {typing&&<div style={{display:"flex",gap:4,padding:"10px 12px",background:T.surface2,borderRadius:"12px 12px 12px 4px",width:"fit-content",border:`1px solid ${T.border}`}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.muted,animation:`typingDot 1.2s ${i*0.2}s infinite`}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"10px 12px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask a question…" style={{flex:1,background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 12px",color:T.white,fontSize:13,outline:"none"}}/>
        <button onClick={send} disabled={!input.trim()} style={{background:T.blue,border:"none",borderRadius:8,width:38,height:38,cursor:"pointer",color:"white",display:"flex",alignItems:"center",justifyContent:"center",opacity:input.trim()?1:0.4,flexShrink:0}}>→</button>
      </div>
    </div>}
    <button onClick={()=>setOpen(o=>!o)} style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${T.blue},${T.cyan})`,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 8px 28px rgba(37,99,235,0.45)",position:"relative",touchAction:"manipulation"}}>
      {open?"✕":"💬"}
      {!open&&unread>0&&<div style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:T.red,fontSize:9,fontWeight:700,color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</div>}
    </button>
  </div>;
}

// ─── INTAKE FORM ──────────────────────────────────────────────────────────────
function IntakeForm({industryKey="hvac",onBack}){
  const ind=INDUSTRIES[industryKey]||INDUSTRIES.hvac;
  const [step,setStep]=useState(0);
  const [submitting,setSubmitting]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");
  const [form,setForm]=useState({name:"",phone:"",email:"",issueType:"",issueDescription:"",urgency:"",budget:"",ownership:"",propertySize:"",preferredTime:"",zipCode:""});
  const set=k=>v=>{setForm(f=>({...f,[k]:v}));setError("");};

  const STEPS=[
    {title:`What ${ind.label} help do you need?`,sub:"Tell us what's going on",
      body:<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Service Type" value={form.issueType} onChange={set("issueType")} type="select" required options={ind.issueTypes}/>
        <Inp label="Describe the issue" value={form.issueDescription} onChange={set("issueDescription")} type="textarea" placeholder="The more detail you provide, the better we can match you with the right pro…" required/>
      </div>,valid:form.issueType&&form.issueDescription.trim().length>5},
    {title:"How urgent is this?",sub:"Helps us prioritize your request",
      body:<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{v:"emergency",label:"🚨 Emergency",sub:"I need help today"},{v:"this_week",label:"📅 This week",sub:"Urgent, can schedule in a few days"},{v:"flexible",label:"🗓️ Flexible",sub:"Planning ahead, no rush"}].map(o=><div key={o.v} onClick={()=>set("urgency")(o.v)} style={{padding:"15px 18px",borderRadius:12,cursor:"pointer",background:form.urgency===o.v?"rgba(37,99,235,0.12)":T.surface2,border:`2px solid ${form.urgency===o.v?T.blue:T.border2}`,transition:"all 0.15s",touchAction:"manipulation"}}>
          <div style={{fontSize:15,fontWeight:600}}>{o.label}</div>
          <div style={{fontSize:13,color:T.muted,marginTop:2}}>{o.sub}</div>
        </div>)}
      </div>,valid:!!form.urgency},
    {title:"About your property",sub:"Helps us give an accurate estimate",
      body:<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Property Size" value={form.propertySize} onChange={set("propertySize")} type="select" required options={[{value:"under_1000",label:"Under 1,000 sq ft"},{value:"1000_2000",label:"1,000 – 2,000 sq ft"},{value:"2000_3500",label:"2,000 – 3,500 sq ft"},{value:"3500_plus",label:"3,500+ sq ft"}]}/>
        <Inp label="Do you own or rent?" value={form.ownership} onChange={set("ownership")} type="select" required options={[{value:"owner",label:"I own this property"},{value:"renter_yes",label:"I rent — landlord approved repairs"},{value:"renter_no",label:"I rent — not sure about approval"}]}/>
        <Inp label="Zip Code" value={form.zipCode} onChange={set("zipCode")} placeholder="e.g. 43201" required/>
      </div>,valid:form.propertySize&&form.ownership&&form.zipCode.length>=5},
    {title:"What's your budget range?",sub:"Approximate amount for this project",
      body:<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{v:"under_500",label:"Under $500"},{v:"500_1000",label:"$500 – $1,000"},{v:"1000_2000",label:"$1,000 – $2,000"},{v:"2000_5000",label:"$2,000 – $5,000"},{v:"5000_plus",label:"$5,000+"}].map(o=><div key={o.v} onClick={()=>set("budget")(o.v)} style={{padding:"14px 18px",borderRadius:12,cursor:"pointer",background:form.budget===o.v?"rgba(37,99,235,0.12)":T.surface2,border:`2px solid ${form.budget===o.v?T.blue:T.border2}`,transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"space-between",touchAction:"manipulation"}}>
          <span style={{fontSize:15,fontWeight:600}}>{o.label}</span>
          {form.budget===o.v&&<span style={{color:T.blueL,fontSize:18}}>✓</span>}
        </div>)}
      </div>,valid:!!form.budget},
    {title:"How can we reach you?",sub:"A local professional will contact you shortly",
      body:<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Full Name" value={form.name} onChange={set("name")} placeholder="Jane Smith" required/>
        <Inp label="Phone Number" value={form.phone} onChange={set("phone")} type="tel" placeholder="(614) 555-0000" required/>
        <Inp label="Email Address" value={form.email} onChange={set("email")} type="email" placeholder="jane@email.com"/>
        <Inp label="Best Time to Call" value={form.preferredTime} onChange={set("preferredTime")} type="select" options={[{value:"Morning (8am–12pm)",label:"Morning (8am – 12pm)"},{value:"Afternoon (12pm–5pm)",label:"Afternoon (12pm – 5pm)"},{value:"Evening (5pm–8pm)",label:"Evening (5pm – 8pm)"},{value:"Anytime",label:"Anytime"}]}/>
      </div>,valid:form.name.trim().length>1&&form.phone.replace(/\D/g,"").length>=10},
  ];
  const cur=STEPS[step];

  const handleSubmit=async()=>{
    setSubmitting(true);setError("");
    try{
      const{score,breakdown,tier}=scoreLeadData(form);
      await db.insertLead({
        business_id:DEMO_BUSINESS_ID,
        name:form.name,phone:form.phone,email:form.email,
        issue_type:form.issueType,issue_description:form.issueDescription,
        urgency:form.urgency,budget:form.budget,ownership:form.ownership,
        property_size:form.propertySize,preferred_time:form.preferredTime,
        zip_code:form.zipCode,industry:ind.label,score,tier,breakdown,status:"new",
        estimate_range:ind.estimates[form.issueType]||"$400–$2,000",
        is_name:form.issueType.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()),
      });
      setDone(true);
    }catch(e){setError("Something went wrong. Please try again.");console.error(e);}
    setSubmitting(false);
  };

  if(done)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,padding:20}}>
    <div style={{textAlign:"center",maxWidth:460,width:"100%",animation:"fadeUp 0.5s ease"}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(16,185,129,0.15)",border:`2px solid ${T.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 20px"}}>✓</div>
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(24px,5vw,34px)",letterSpacing:-1,marginBottom:14}}>You're all set.</h2>
      <p style={{color:T.offWhite,lineHeight:1.7,marginBottom:24,fontSize:15}}>Your request has been received. A qualified local {ind.label.toLowerCase()} professional will reach out at your preferred time.</p>
      <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:18,textAlign:"left",marginBottom:20}}>
        {[["Service",form.issueType.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())],["Urgency",{emergency:"🚨 Emergency",this_week:"📅 This Week",flexible:"🗓️ Flexible"}[form.urgency]||form.urgency],["Budget",form.budget?.replace(/_/g," ")],["Phone",form.phone]].map(([k,v])=>v&&<div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8,gap:12}}><span style={{color:T.muted}}>{k}</span><span style={{color:T.white,fontWeight:500,textAlign:"right"}}>{v}</span></div>)}
      </div>
      {onBack&&<Btn variant="outline" onClick={onBack} fullWidth>← Back to Streamline</Btn>}
    </div>
  </div>;

  return <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
    {/* Header */}
    <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0,background:T.surface}}>
      <div style={{width:32,height:32,borderRadius:"50%",background:`${ind.color}20`,border:`1px solid ${ind.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{ind.icon}</div>
      <div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.white,lineHeight:1.1}}>Streamline</div>
        <div style={{fontSize:11,color:T.muted}}>{ind.headline}</div>
      </div>
      {onBack&&<button onClick={onBack} style={{marginLeft:"auto",background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:13,padding:"4px 8px"}}>← Back</button>}
    </div>
    {/* Progress */}
    <div style={{padding:"0 20px",background:T.surface,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
      <div style={{maxWidth:540,margin:"0 auto"}}>
        <div style={{display:"flex",gap:3,paddingTop:14,paddingBottom:6}}>{STEPS.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?ind.color:T.border,transition:"background 0.3s"}}/>)}</div>
        <div style={{fontSize:11,color:T.muted,paddingBottom:10,fontFamily:"'JetBrains Mono',monospace"}}>Step {step+1} of {STEPS.length}</div>
      </div>
    </div>
    {/* Content */}
    <div style={{flex:1,display:"flex",justifyContent:"center",padding:"28px 20px 40px",overflowY:"auto"}}>
      <div style={{width:"100%",maxWidth:540,animation:"fadeUp 0.3s ease"}} key={step}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,4vw,26px)",letterSpacing:-0.5,marginBottom:5}}>{cur.title}</h2>
        <p style={{color:T.muted,fontSize:13,marginBottom:22}}>{cur.sub}</p>
        {cur.body}
        {error&&<div style={{marginTop:12,padding:"12px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,fontSize:13,color:"#F87171"}}>{error}</div>}
        <div style={{display:"flex",gap:10,marginTop:24,alignItems:"center"}}>
          {step>0&&<Btn variant="outline" onClick={()=>setStep(s=>s-1)}>← Back</Btn>}
          <div style={{flex:1}}/>
          {step<STEPS.length-1
            ?<Btn onClick={()=>setStep(s=>s+1)} disabled={!cur.valid}>Continue →</Btn>
            :<Btn onClick={handleSubmit} disabled={!cur.valid||submitting} style={{background:submitting?T.surface2:ind.color,border:"none",color:"white"}}>{submitting?<span style={{display:"flex",alignItems:"center",gap:8}}><Spinner size={15}/>Submitting…</span>:"Submit Request →"}</Btn>}
        </div>
        <p style={{fontSize:11,color:T.muted,marginTop:16,textAlign:"center"}}>🔒 Your info is private and will only be shared with a verified local pro.</p>
      </div>
    </div>
  </div>;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthPage({onAuth}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("demo@streamline.com");
  const [password,setPassword]=useState("demo1234");
  const [company,setCompany]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const submit=async()=>{
    setError("");setLoading(true);
    try{
      if(mode==="login"){
        const{session}=await db.signIn(email,password);
        if(!session)throw new Error("Login failed — check your credentials.");
        const business=await db.getBusiness(session.user.id);
        onAuth({...session.user,...business});
      }else{
        const{session}=await db.signUp(email,password);
        if(!session){setError("Account created! Check your email to confirm.");setLoading(false);return;}
        const business=await db.upsertBusiness({id:session.user.id,email,company,industry:"HVAC",plan:"Starter",notify_email:email});
        onAuth({...session.user,...business});
      }
    }catch(e){setError(e.message||"Something went wrong.");}
    setLoading(false);
  };

  return <div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22,justifyContent:"center"}}><LogoMark size={32}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:20}}>Streamline</span></div>
    <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22,letterSpacing:-0.5,marginBottom:5,textAlign:"center"}}>{mode==="login"?"Welcome back.":"Create your account."}</h2>
    <p style={{color:T.muted,fontSize:13,marginBottom:18,textAlign:"center"}}>{mode==="login"?"Sign in to your lead dashboard.":"Start receiving qualified leads today."}</p>
    {mode==="login"&&<div style={{background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13}}><span style={{color:T.blueL,fontWeight:600}}>Demo: </span>demo@streamline.com / demo1234</div>}
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {mode==="signup"&&<Inp label="Company Name" value={company} onChange={setCompany} placeholder="Apex Climate Control" required/>}
      <Inp label="Email" value={email} onChange={setEmail} type="email" placeholder="you@company.com" required/>
      <Inp label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" required/>
    </div>
    {error&&<div style={{marginTop:12,padding:"10px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,fontSize:13,color:"#F87171"}}>{error}</div>}
    <Btn onClick={submit} disabled={loading} fullWidth style={{marginTop:18}}>{loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={15}/>{mode==="login"?"Signing in…":"Creating…"}</span>:mode==="login"?"Sign In →":"Create Account →"}</Btn>
    <div style={{textAlign:"center",marginTop:14,fontSize:13,color:T.muted}}>
      {mode==="login"?"No account? ":"Have an account? "}
      <span onClick={()=>setMode(mode==="login"?"signup":"login")} style={{color:T.blueL,cursor:"pointer",fontWeight:500}}>{mode==="login"?"Sign up":"Sign in"}</span>
    </div>
  </div>;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NotificationsPanel({userId}){
  const [notifs,setNotifs]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{db.getNotifications(userId).then(n=>{setNotifs(n);setLoading(false);});db.markNotifsRead(userId);},[userId]);
  if(loading)return <div style={{padding:32,display:"flex",justifyContent:"center"}}><Spinner/></div>;
  if(!notifs.length)return <div style={{padding:24,textAlign:"center",color:T.muted,fontSize:14}}>No notifications yet.</div>;
  return <div style={{display:"flex",flexDirection:"column",maxHeight:420,overflowY:"auto"}}>
    {notifs.map(n=><div key={n.id} style={{padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4,gap:8}}>
        <span style={{fontSize:13,fontWeight:600,color:n.read?T.offWhite:T.white,flex:1}}>{n.subject}</span>
        <span style={{fontSize:10,color:T.muted,flexShrink:0}}>{new Date(n.created_at).toLocaleDateString()}</span>
      </div>
      <p style={{fontSize:12,color:T.muted,lineHeight:1.6,whiteSpace:"pre-line"}}>{n.body}</p>
    </div>)}
  </div>;
}

// ─── LEAD DETAIL ──────────────────────────────────────────────────────────────
function LeadDetail({lead,onClose,onStatusChange}){
  if(!lead)return null;
  const BL={budget:"Budget",urgency:"Urgency",ownership:"Ownership",size:"Property Size",clarity:"Issue Clarity",contact:"Contact Quality"};
  const MX={budget:20,urgency:20,ownership:15,size:15,clarity:15,contact:15};
  const breakdown=typeof lead.breakdown==="string"?JSON.parse(lead.breakdown):(lead.breakdown||{});
  return <Modal open={!!lead} onClose={onClose} title="Lead Details" width={580}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:18,gap:12,alignItems:"flex-start"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
          <h3 style={{fontSize:18,fontWeight:700}}>{lead.name}</h3>
          <Pill color={lead.tier}>{lead.tier}</Pill><Pill color={lead.status}>{lead.status}</Pill>
        </div>
        <div style={{color:T.muted,fontSize:13}}>{lead.is_name||lead.issue_type} · {lead.zip_code}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,color:lead.tier==="hot"?T.green:lead.tier==="warm"?T.amber:T.muted,fontWeight:700,lineHeight:1}}>{lead.score}</div>
        <div style={{fontSize:10,color:T.muted}}>/ 100</div>
      </div>
    </div>
    <div style={{background:T.surface2,borderRadius:10,padding:14,marginBottom:14}}>
      <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Score Breakdown</div>
      {Object.entries(breakdown).map(([k,v])=>{const max=MX[k]||20;const pct=(v/max)*100;const c=pct>=75?T.green:pct>=40?T.amber:T.red;return <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{width:96,fontSize:11,color:T.offWhite,flexShrink:0}}>{BL[k]||k}</div>
        <div style={{flex:1,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:c,borderRadius:2}}/></div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:c,width:32,textAlign:"right",flexShrink:0}}>{v}/{max}</div>
      </div>;})}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      {[["Phone",lead.phone],["Contact Time",lead.preferred_time],["Budget",lead.budget?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())],["Estimate",lead.estimate_range],["Property",lead.property_size?.replace(/_/g," ")],["Ownership",lead.ownership==="owner"?"Owner":"Renter"],["Zip",lead.zip_code],["Submitted",new Date(lead.created_at).toLocaleDateString()]].map(([label,val])=>val&&<div key={label} style={{background:T.surface2,borderRadius:8,padding:"10px 12px"}}>
        <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{label}</div>
        <div style={{fontSize:13,fontWeight:500}}>{val}</div>
      </div>)}
    </div>
    {lead.issue_description&&<div style={{background:T.surface2,borderRadius:10,padding:14,marginBottom:14}}>
      <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Issue Description</div>
      <p style={{fontSize:13,color:T.offWhite,lineHeight:1.7}}>{lead.issue_description}</p>
    </div>}
    {lead.status!=="won"&&lead.status!=="lost"&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn variant="success" onClick={()=>{onStatusChange(lead.id,"won");onClose();}} style={{flex:1,minWidth:110}}>✓ Won</Btn>
      <Btn variant="danger" onClick={()=>{onStatusChange(lead.id,"lost");onClose();}} style={{flex:1,minWidth:110}}>✗ Lost</Btn>
      {lead.status==="new"&&<Btn variant="outline" onClick={()=>{onStatusChange(lead.id,"contacted");onClose();}} style={{flex:1,minWidth:110}}>📞 Contacted</Btn>}
    </div>}
  </Modal>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({user,onLogout}){
  const [leads,setLeads]=useState([]);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("pipeline");
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("date");
  const [selected,setSelected]=useState(null);
  const [toast,setToast]=useState(null);
  const [search,setSearch]=useState("");
  const [showNotifs,setShowNotifs]=useState(false);
  const [unread,setUnread]=useState(0);

  const loadLeads=useCallback(async()=>{
    try{const d=await db.getLeads(user.id);setLeads(d);}catch(e){console.error(e);}
    setLoading(false);
  },[user.id]);
  const loadUnread=useCallback(async()=>{const n=await db.getNotifications(user.id);setUnread(n.filter(x=>!x.read).length);},[user.id]);

  useEffect(()=>{
    loadLeads();loadUnread();
    const ch=db.subscribeToLeads(user.id,(nl)=>{
      setLeads(p=>[nl,...p]);
      setToast({message:`🔥 New ${nl.tier} lead: ${nl.name}`,type:"success"});
      loadUnread();
    });
    return()=>sb.removeChannel(ch);
  },[user.id]);

  const updateStatus=async(id,status)=>{
    try{await db.updateLeadStatus(id,status);setLeads(p=>p.map(l=>l.id===id?{...l,status}:l));setToast({message:`Lead marked as ${status}`,type:status==="won"?"success":"info"});loadUnread();}
    catch(e){setToast({message:"Failed to update",type:"error"});}
  };

  const filtered=leads
    .filter(l=>filter==="all"||l.status===filter)
    .filter(l=>!search||l.name?.toLowerCase().includes(search.toLowerCase())||l.issue_type?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="score"?b.score-a.score:new Date(b.created_at)-new Date(a.created_at));

  const total=leads.length,won=leads.filter(l=>l.status==="won").length;
  const active=leads.filter(l=>l.status==="new"||l.status==="contacted").length;
  const closeRate=total>0?Math.round((won/total)*100):0;
  const avgScore=total>0?Math.round(leads.reduce((s,l)=>s+l.score,0)/total):0;
  const sc={new:0,contacted:0,won:0,lost:0};leads.forEach(l=>{if(sc[l.status]!==undefined)sc[l.status]++;});

  return <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
    <nav style={{height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",borderBottom:`1px solid ${T.border}`,background:"rgba(9,12,17,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <LogoMark size={26}/>
        <span style={{fontFamily:"'DM Serif Display',serif",fontSize:16}}>Streamline</span>
        <span style={{color:T.muted,fontSize:12,display:"none"}} className="hide-mobile"> · Dashboard</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        {[{id:"pipeline",label:"Pipeline"},{id:"analytics",label:"Analytics"}].map(tab=>(
          <button key={tab.id} onClick={()=>setView(tab.id)} style={{background:view===tab.id?T.surface2:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:500,padding:"5px 12px",borderRadius:7,color:view===tab.id?T.white:T.muted,transition:"all 0.2s"}}>{tab.label}</button>
        ))}
        <button onClick={()=>setShowNotifs(true)} style={{position:"relative",background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:17,padding:6,borderRadius:7,display:"flex",alignItems:"center"}}>
          🔔{unread>0&&<div style={{position:"absolute",top:0,right:0,width:14,height:14,borderRadius:"50%",background:T.red,fontSize:8,fontWeight:700,color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</div>}
        </button>
        <div style={{width:26,height:26,borderRadius:"50%",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{user.company?.[0]||user.email?.[0]?.toUpperCase()||"U"}</div>
        <Btn variant="outline" size="sm" onClick={onLogout} style={{fontSize:12,padding:"6px 10px"}}>Sign Out</Btn>
      </div>
    </nav>

    <div style={{flex:1,padding:16,maxWidth:1280,margin:"0 auto",width:"100%"}}>
      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:240,gap:12}}><Spinner/><span style={{color:T.muted,fontSize:14}}>Loading…</span></div>
      ):view==="pipeline"?(
        <div style={{animation:"fadeIn 0.3s ease"}}>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}} className="grid-2-mobile">
            {[{label:"Total",value:total,color:T.blueL},{label:"Active",value:active,color:T.cyan},{label:"Won",value:won,color:T.green},{label:"Avg Score",value:avgScore,color:T.amber}].map(s=>(
              <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 16px"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:24,fontWeight:700,color:s.color,marginBottom:2}}>{s.value}</div>
                <div style={{fontSize:12,color:T.muted}}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Filters */}
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{position:"relative",flex:1,minWidth:150}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads…" style={{width:"100%",background:T.surface,border:`1px solid ${T.border2}`,borderRadius:8,padding:"9px 12px 9px 30px",color:T.white,fontSize:13,outline:"none"}}/>
              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:12}}>🔍</span>
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {["all","new","contacted","won","lost"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 10px",borderRadius:7,border:`1px solid ${filter===f?T.blue:T.border2}`,background:filter===f?"rgba(37,99,235,0.15)":"none",color:filter===f?T.blueL:T.muted,cursor:"pointer",fontSize:12,fontWeight:500,transition:"all 0.15s"}}>
                  {f.charAt(0).toUpperCase()+f.slice(1)} <span style={{opacity:0.5,fontSize:10}}>{f==="all"?leads.length:sc[f]}</span>
                </button>
              ))}
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:8,padding:"8px 10px",color:T.offWhite,fontSize:12,cursor:"pointer",outline:"none"}}>
              <option value="date">Newest</option>
              <option value="score">Score ↓</option>
            </select>
          </div>
          {/* Desktop table */}
          <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}} className="hide-mobile">
            <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1fr 1.3fr 70px 90px 100px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
              {["Lead","Issue","Budget","Score","Tier","Status",""].map(h=><div key={h}>{h}</div>)}
            </div>
            {filtered.length===0?(
              <div style={{padding:40,textAlign:"center",color:T.muted}}>
                <div style={{fontSize:28,marginBottom:10}}>📭</div>
                <div style={{fontSize:14,color:T.offWhite,marginBottom:4}}>No leads yet</div>
                <div style={{fontSize:12}}>Leads from your intake form will appear here in real-time.</div>
              </div>
            ):filtered.map((lead,i)=>(
              <div key={lead.id} onClick={()=>setSelected(lead)}
                style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1fr 1.3fr 70px 90px 100px",padding:"12px 16px",borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.surface2}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div><div style={{fontSize:13,fontWeight:600,marginBottom:1}}>{lead.name}</div><div style={{fontSize:11,color:T.muted}}>{lead.phone}</div></div>
                <div style={{fontSize:12,color:T.offWhite,alignSelf:"center"}}>{lead.is_name||lead.issue_type}</div>
                <div style={{fontSize:12,color:T.offWhite,alignSelf:"center"}}>{lead.budget?.replace(/_/g," ")}</div>
                <div style={{alignSelf:"center"}}><ScoreBar score={lead.score}/></div>
                <div style={{alignSelf:"center"}}><Pill color={lead.tier}>{lead.tier}</Pill></div>
                <div style={{alignSelf:"center"}}><Pill color={lead.status}>{lead.status}</Pill></div>
                <div style={{alignSelf:"center",display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                  {lead.status==="new"&&<button onClick={()=>updateStatus(lead.id,"contacted")} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:5,padding:"4px 6px",cursor:"pointer",color:T.muted,fontSize:11}}>📞</button>}
                  {lead.status!=="won"&&lead.status!=="lost"&&<>
                    <button onClick={()=>updateStatus(lead.id,"won")} style={{background:"none",border:"1px solid rgba(16,185,129,0.3)",borderRadius:5,padding:"4px 6px",cursor:"pointer",color:T.green,fontSize:11}}>✓</button>
                    <button onClick={()=>updateStatus(lead.id,"lost")} style={{background:"none",border:"1px solid rgba(239,68,68,0.3)",borderRadius:5,padding:"4px 6px",cursor:"pointer",color:T.red,fontSize:11}}>✗</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
          {/* Mobile cards */}
          <div style={{display:"none",flexDirection:"column",gap:8}} id="mobile-cards">
            {filtered.map(lead=>(
              <div key={lead.id} onClick={()=>setSelected(lead)} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:14,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div><div style={{fontSize:14,fontWeight:600}}>{lead.name}</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>{lead.is_name||lead.issue_type}</div></div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:lead.tier==="hot"?T.green:lead.tier==="warm"?T.amber:T.muted}}>{lead.score}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <Pill color={lead.tier}>{lead.tier}</Pill><Pill color={lead.status}>{lead.status}</Pill>
                  <span style={{fontSize:11,color:T.muted,marginLeft:"auto"}}>{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <style>{`@media(max-width:768px){.hide-mobile{display:none!important}#mobile-cards{display:flex!important}}`}</style>
        </div>
      ):(
        <div style={{animation:"fadeIn 0.3s ease"}}>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,4vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Analytics</h2>
          <p style={{color:T.muted,fontSize:13,marginBottom:18}}>Performance overview for your lead pipeline.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}} className="grid-1-mobile">
            {[{label:"Close Rate",value:`${closeRate}%`,sub:`${won} won of ${total}`,color:T.green},{label:"Avg Score",value:avgScore,sub:"Lead quality",color:T.amber},{label:"Active",value:active,sub:`${sc.won+sc.lost} resolved`,color:T.blueL}].map(k=>(
              <Card key={k.label}>
                <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{k.label}</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:38,color:k.color,letterSpacing:-1.5,lineHeight:1,marginBottom:3}}>{k.value}</div>
                <div style={{fontSize:12,color:T.muted}}>{k.sub}</div>
              </Card>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} className="grid-1-mobile">
            <Card>
              <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Lead Quality</div>
              {[{label:"Hot",color:T.green,count:leads.filter(l=>l.tier==="hot").length},{label:"Warm",color:T.amber,count:leads.filter(l=>l.tier==="warm").length},{label:"Cold",color:T.muted,count:leads.filter(l=>l.tier==="cold").length}].map(({label,color,count})=>(
                <div key={label} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,color:T.offWhite}}>{label}</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color}}>{count}</span></div>
                  <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden"}}><div style={{width:total>0?`${(count/total)*100}%`:"0%",height:"100%",background:color,borderRadius:3,transition:"width 0.8s ease"}}/></div>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Pipeline Status</div>
              {[{label:"New",color:T.blueL,count:sc.new},{label:"Contacted",color:T.amber,count:sc.contacted},{label:"Won",color:T.green,count:sc.won},{label:"Lost",color:T.red,count:sc.lost}].map(({label,color,count})=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:color,flexShrink:0}}/>
                  <span style={{fontSize:13,color:T.offWhite,flex:1}}>{label}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color}}>{count}</span>
                  <div style={{width:70,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:total>0?`${(count/total)*100}%`:"0%",height:"100%",background:color,borderRadius:2}}/></div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
    </div>
    <LeadDetail lead={selected} onClose={()=>setSelected(null)} onStatusChange={(id,s)=>{updateStatus(id,s);setSelected(null);}}/>
    {toast&&<Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)}/>}
    <Modal open={showNotifs} onClose={()=>{setShowNotifs(false);setUnread(0);}} title="Notifications">
      <NotificationsPanel userId={user.id}/>
    </Modal>
  </div>;
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingFAQ(){
  const [open,setOpen]=useState(0);
  const faqs=[
    {q:"How does the performance fee work?",a:"When you close a job sourced through Streamline, mark it as 'Won' in your dashboard. The performance fee is invoiced at month-end based on total closed jobs."},
    {q:"Are leads really exclusive?",a:"Yes. Once assigned to you, that lead is removed from availability for all other businesses. We never sell the same lead twice."},
    {q:"What industries do you serve?",a:"HVAC, Roofing, Plumbing, and Electrical in the Columbus, Ohio metro area. Expanding in 2026."},
    {q:"How is Streamline different from HomeAdvisor?",a:"HomeAdvisor sells the same lead to multiple businesses regardless of outcome. Our leads are exclusive, pre-scored, and we only earn more when you close jobs."},
    {q:"Can I cancel anytime?",a:"Yes — cancel or pause from your dashboard. No penalties, no phone call required."},
  ];
  return <div style={{maxWidth:660,margin:"36px auto 0",textAlign:"left"}}>
    {faqs.map((f,i)=><div key={i} style={{borderBottom:`1px solid ${T.border}`,padding:"18px 0",cursor:"pointer"}} onClick={()=>setOpen(open===i?-1:i)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:15,fontWeight:500,gap:12}}>
        <span>{f.q}</span>
        <span style={{color:open===i?T.blueL:T.muted,fontSize:18,flexShrink:0,transition:"transform 0.25s",display:"inline-block",transform:open===i?"rotate(180deg)":"none"}}>⌄</span>
      </div>
      {open===i&&<p style={{fontSize:14,color:T.muted,lineHeight:1.7,marginTop:10,animation:"fadeUp 0.2s ease"}}>{f.a}</p>}
    </div>)}
  </div>;
}

function LandingPage({onLogin,onIntakeForm}){
  const [showAuth,setShowAuth]=useState(false);
  const [mobileNav,setMobileNav]=useState(false);
  const scrollTo=id=>{document.getElementById(id)?.scrollIntoView({behavior:"smooth"});setMobileNav(false);};
  const SE=({c})=><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:500,color:T.blueL,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:10}}>{c}</div>;
  const SH=({c,center})=><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(26px,4vw,40px)",lineHeight:1.1,letterSpacing:-1,marginBottom:14,textAlign:center?"center":"left"}}>{c}</h2>;

  const navLinks=[["industries","Industries"],["how","How It Works"],["features","Features"],["pricing","Pricing"],["faq","FAQ"]];

  return <div style={{background:T.bg,minHeight:"100vh"}}>
    {/* NAV */}
    <nav style={{position:"fixed",top:0,left:0,right:0,height:60,zIndex:200,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",background:"rgba(9,12,17,0.94)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <LogoMark size={28}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:18}}>Streamline</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:2}} className="hide-mobile">
        {navLinks.map(([id,label])=>(
          <button key={id} onClick={()=>scrollTo(id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:500,color:T.muted,padding:"6px 11px",borderRadius:7,transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=T.white} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>{label}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <Btn variant="outline" onClick={()=>setShowAuth(true)} style={{fontSize:13,padding:"8px 16px"}} className="hide-mobile">Log In</Btn>
        <Btn onClick={()=>setShowAuth(true)} style={{fontSize:13,padding:"8px 16px"}}>Get Started</Btn>
        <button onClick={()=>setMobileNav(o=>!o)} style={{background:"none",border:`1px solid ${T.border2}`,color:T.white,cursor:"pointer",fontSize:16,padding:"7px 10px",borderRadius:8,display:"none"}} id="burger">☰</button>
      </div>
    </nav>
    <style>{`@media(max-width:768px){#burger{display:flex!important}}`}</style>

    {/* Mobile nav drawer */}
    {mobileNav&&<div style={{position:"fixed",top:60,left:0,right:0,background:T.surface,borderBottom:`1px solid ${T.border}`,zIndex:199,padding:"8px 0",animation:"fadeUp 0.2s ease"}}>
      {navLinks.map(([id,label])=><button key={id} onClick={()=>scrollTo(id)} style={{display:"block",width:"100%",background:"none",border:"none",cursor:"pointer",fontSize:15,fontWeight:500,color:T.offWhite,padding:"13px 20px",textAlign:"left"}}>{label}</button>)}
      <div style={{padding:"10px 16px",borderTop:`1px solid ${T.border}`,marginTop:4}}>
        <Btn onClick={()=>{setShowAuth(true);setMobileNav(false);}} fullWidth>Log In / Sign Up</Btn>
      </div>
    </div>}

    {/* HERO */}
    <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(90px,14vw,150px) 20px 80px",textAlign:"center",position:"relative",overflow:"hidden",background:"radial-gradient(ellipse 80% 60% at 50% 40%,rgba(37,99,235,0.1),transparent 70%)"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent 5%,rgba(37,99,235,0.5) 35%,rgba(6,182,212,0.6) 50%,rgba(37,99,235,0.5) 65%,transparent 95%)"}}/>
      <div style={{maxWidth:660,position:"relative",zIndex:1,width:"100%"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(37,99,235,0.1)",border:"1px solid rgba(37,99,235,0.25)",borderRadius:100,padding:"6px 14px",fontSize:11,fontWeight:600,color:T.blueL,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:22}}>
          <div style={{width:5,height:5,background:T.blueL,borderRadius:"50%",animation:"pulse 2s infinite"}}/>Now accepting — Columbus, OH
        </div>
        <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(38px,7vw,70px)",lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:18}}>
          Stop chasing leads.<br/>Start closing{" "}
          <em style={{fontStyle:"italic",background:`linear-gradient(135deg,${T.blueL},${T.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>jobs.</em>
        </h1>
        <p style={{fontSize:"clamp(14px,2vw,17px)",color:T.offWhite,lineHeight:1.75,maxWidth:480,margin:"0 auto 32px",fontWeight:300}}>
          Qualified, scored leads delivered to your dashboard. <em style={{color:T.cyan,fontStyle:"italic"}}>Exclusive.</em> Always.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:22}}>
          <Btn size="lg" onClick={()=>setShowAuth(true)}>Request Access →</Btn>
          <Btn variant="outline" size="lg" onClick={()=>onIntakeForm("hvac")}>Try the Intake Form</Btn>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
          {Object.entries(INDUSTRIES).map(([k,v])=>(
            <span key={k} onClick={()=>onIntakeForm(k)} style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:100,padding:"5px 13px",fontSize:12,color:T.offWhite,fontWeight:500,cursor:"pointer",transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=v.color+"80"} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border2}>{v.icon} {v.label}</span>
          ))}
        </div>
      </div>
    </section>

    {/* INDUSTRIES */}
    <section id="industries" style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
      <div style={{maxWidth:1060,margin:"0 auto"}}>
        <p style={{textAlign:"center",fontSize:10,fontWeight:500,color:T.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:32,fontFamily:"'JetBrains Mono',monospace"}}>Built for service businesses that run on booked jobs</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
          {Object.entries(INDUSTRIES).map(([k,v])=>(
            <div key={k} onClick={()=>onIntakeForm(k)} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"20px 16px",textAlign:"center",cursor:"pointer",transition:"all 0.22s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=v.color+"60";e.currentTarget.style.transform="translateY(-3px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.transform="none";}}>
              <div style={{fontSize:26,marginBottom:8}}>{v.icon}</div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{v.label}</div>
              <div style={{fontSize:11,color:T.muted}}>Get a quote →</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section id="how" style={{padding:"clamp(48px,7vw,88px) 20px"}}>
      <div style={{maxWidth:1060,margin:"0 auto"}}>
        <SE c="How It Works"/>
        <SH c="From customer intent to your calendar."/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(20px,5vw,56px)",marginTop:36,alignItems:"start"}} className="grid-1-mobile">
          <div>
            {[{n:"01",title:"Customer requests a quote",desc:"Fills out the industry-specific intake form from your ad or direct link. Issue type, urgency, budget, property details — all captured."},{n:"02",title:"We score and qualify",desc:"Every lead scored 0–100 across six dimensions. Low-intent leads filtered automatically."},{n:"03",title:"Instant estimate generated",desc:"Each qualified lead gets a price range before you call — no sticker shock on first contact."},{n:"04",title:"Lead delivered in real-time",desc:"Full lead package in your dashboard in under 60 seconds. Exclusively yours."}].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:14,padding:"18px 0",borderBottom:`1px solid ${T.border}`,borderTop:i===0?`1px solid ${T.border}`:"none"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,minWidth:22,paddingTop:2,flexShrink:0}}>{s.n}</div>
                <div><div style={{fontSize:14,fontWeight:600,marginBottom:5}}>{s.title}</div><div style={{fontSize:13,color:T.muted,lineHeight:1.65}}>{s.desc}</div></div>
              </div>
            ))}
          </div>
          {/* Campaign URL card */}
          <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden",boxShadow:"0 20px 50px rgba(0,0,0,0.4)"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:T.surface2}}>
              <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Ad Campaign URLs</div>
              <div style={{fontSize:12,color:T.offWhite}}>One intake form per industry — driven by URL</div>
            </div>
            <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>
              {Object.entries(INDUSTRIES).map(([k,v])=>(
                <div key={k} style={{background:T.surface2,borderRadius:8,padding:"10px 12px",border:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                    <span style={{fontSize:14}}>{v.icon}</span>
                    <span style={{fontSize:12,fontWeight:600}}>{v.label}</span>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.blueL,wordBreak:"break-all"}}>streamline-ecru.vercel.app/?industry={k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* METRICS */}
    <section style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,background:T.surface}}>
      <div style={{maxWidth:1060,margin:"0 auto"}}>
        <SE c="By the Numbers"/>
        <SH c="Built for businesses that run lean."/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:1,background:T.border,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginTop:32}}>
          {[{num:"87",unit:"%",label:"Lead qualification rate",desc:"Only high-intent customers reach you."},{num:"34",unit:"%",label:"Avg close rate lift",desc:"Pre-educated leads close faster."},{num:"<60",unit:"s",label:"Lead delivery",desc:"Dashboard update in under 60 seconds."},{num:"0",unit:"",label:"Shared leads",desc:"Every lead is exclusively yours."}].map(m=>(
            <div key={m.label} style={{background:T.surface,padding:"clamp(18px,3vw,32px) clamp(14px,2vw,24px)",transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background=T.surface}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(32px,4vw,46px)",color:T.white,lineHeight:1,marginBottom:5,letterSpacing:-2}}>{m.num}<span style={{color:T.blueL}}>{m.unit}</span></div>
              <div style={{fontSize:13,fontWeight:500,color:T.offWhite,marginBottom:5}}>{m.label}</div>
              <div style={{fontSize:12,color:T.muted,lineHeight:1.5}}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FEATURES */}
    <section id="features" style={{padding:"clamp(48px,7vw,88px) 20px"}}>
      <div style={{maxWidth:1060,margin:"0 auto"}}>
        <SE c="Platform Features"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(16px,3vw,40px)",alignItems:"end",marginBottom:32}} className="grid-1-mobile">
          <SH c="Everything you need. Nothing you don't."/>
          <p style={{fontSize:14,color:T.offWhite,lineHeight:1.7,fontWeight:300}}>Purpose-built for service businesses. No bloated CRM, no learning curve.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:1,background:T.border,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
          {[{icon:"⚡",title:"Intelligent Lead Scoring",desc:"Scored across six dimensions before it reaches you."},{icon:"📊",title:"Real-Time Dashboard",desc:"Live pipeline with score breakdowns and booking status."},{icon:"🔗",title:"URL-Driven Campaigns",desc:"One link per ad. Each industry gets a custom intake flow."},{icon:"📋",title:"Industry-Specific Forms",desc:"HVAC, Roofing, Plumbing, Electrical — tailored questions."},{icon:"🔔",title:"Instant Notifications",desc:"In-app alert the moment a lead is assigned to you."},{icon:"📈",title:"Win/Loss Tracking",desc:"Track close rates by job type and season."}].map(f=>(
            <div key={f.title} style={{background:T.surface,padding:"clamp(18px,2vw,28px)",transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background=T.surface}>
              <div style={{width:38,height:38,background:"rgba(37,99,235,0.12)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,marginBottom:12,border:"1px solid rgba(37,99,235,0.2)"}}>{f.icon}</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>{f.title}</div>
              <div style={{fontSize:13,color:T.muted,lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* PRICING */}
    <section id="pricing" style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`}}>
      <div style={{maxWidth:1060,margin:"0 auto",textAlign:"center"}}>
        <SE c="Pricing"/>
        <SH c="Pay for what works." center/>
        <p style={{fontSize:14,color:T.offWhite,lineHeight:1.7,fontWeight:300,maxWidth:440,margin:"0 auto 36px"}}>Low base keeps costs predictable. Performance fee only when you close a job.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,maxWidth:740,margin:"0 auto"}} className="grid-1-mobile">
          {[{plan:"Starter",price:"299",perf:"$150",popular:false,features:["Up to 20 leads / month","Intelligent intake + scoring","Instant estimate generation","In-app notifications","Win/loss tracking","Exclusive leads always"]},
            {plan:"Growth",price:"499",perf:"$100",popular:true,features:["Up to 50 leads / month","Everything in Starter","Priority lead queue","CRM integrations","Dedicated account manager","Seasonal campaign boosts"]}].map(p=>(
            <div key={p.plan} style={{background:p.popular?`linear-gradient(135deg,rgba(37,99,235,0.08),${T.surface})`:T.surface,border:`1px solid ${p.popular?T.blue:T.border2}`,borderRadius:16,padding:"clamp(20px,3vw,32px)",position:"relative",transition:"transform 0.22s",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              {p.popular&&<><div style={{display:"inline-flex",background:T.blue,color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>Most Popular</div><div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${T.blue},transparent)`}}/></>}
              <div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,fontFamily:"'JetBrains Mono',monospace"}}>{p.plan}</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(36px,5vw,48px)",lineHeight:1,letterSpacing:-2,marginBottom:3}}><sub style={{fontSize:16,fontFamily:"'DM Sans',sans-serif",fontWeight:300,color:T.muted}}>$</sub>{p.price}</div>
              <div style={{fontSize:12,color:T.muted,marginBottom:5}}>per month</div>
              <div style={{fontSize:11,color:T.blueL,fontFamily:"'JetBrains Mono',monospace",marginBottom:20,padding:"5px 10px",background:"rgba(37,99,235,0.1)",borderRadius:6,border:"1px solid rgba(37,99,235,0.2)",display:"inline-block"}}>+ {p.perf} per closed job</div>
              <div style={{height:1,background:T.border,marginBottom:18}}/>
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
                {p.features.map(f=><div key={f} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:T.offWhite}}><span style={{color:T.blueL,flexShrink:0}}>›</span>{f}</div>)}
              </div>
              <button onClick={()=>setShowAuth(true)} style={{width:"100%",padding:"12px",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",background:p.popular?T.blue:"none",color:p.popular?"white":T.offWhite,border:p.popular?"none":`1px solid ${T.border2}`,transition:"all 0.2s",touchAction:"manipulation"}}>Get Started</button>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* TESTIMONIALS */}
    <section style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`,background:T.surface}}>
      <div style={{maxWidth:1060,margin:"0 auto"}}>
        <SE c="Reviews"/>
        <SH c="What our clients say."/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14,marginTop:32}}>
          {[{initials:"MR",name:"Mike R.",company:"Roofing · Columbus",quote:"The leads come in already knowing their budget. Closing faster than ever."},{initials:"DL",name:"Dana L.",company:"Plumbing · Dublin",quote:"Was paying $800/month sharing leads with four others. Streamline gives me exclusives at a lower cost."},{initials:"JT",name:"James T.",company:"Electrical · Westerville",quote:"Clean dashboard, real leads. I've never received one that was junk."}].map(t=>(
            <div key={t.name} style={{background:T.bg,border:`1px solid ${T.border2}`,borderRadius:14,padding:"clamp(18px,2vw,24px)",transition:"transform 0.2s,border-color 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor="rgba(37,99,235,0.3)"}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=T.border2}}>
              <div style={{color:T.amber,fontSize:12,marginBottom:10,letterSpacing:2}}>★★★★★</div>
              <p style={{fontSize:14,color:T.offWhite,lineHeight:1.7,fontStyle:"italic",marginBottom:18,fontFamily:"'DM Serif Display',serif"}}>"{t.quote}"</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:T.blueL,border:`1px solid ${T.border2}`,fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{t.initials}</div>
                <div><div style={{fontSize:13,fontWeight:600}}>{t.name}</div><div style={{fontSize:11,color:T.muted}}>{t.company}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section id="faq" style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`}}>
      <div style={{maxWidth:1060,margin:"0 auto",textAlign:"center"}}>
        <SE c="FAQ"/>
        <SH c="Common questions." center/>
        <LandingFAQ/>
      </div>
    </section>

    {/* CTA */}
    <section style={{padding:"clamp(48px,7vw,88px) 20px",textAlign:"center",borderTop:`1px solid ${T.border}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(37,99,235,0.1),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:520,margin:"0 auto",position:"relative",zIndex:1}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(26px,4vw,44px)",lineHeight:1.1,letterSpacing:-1.5,marginBottom:14}}>Ready to fill your calendar with real jobs?</h2>
        <p style={{fontSize:14,color:T.offWhite,marginBottom:28,fontWeight:300}}>Join service businesses across Columbus with a qualified, exclusive pipeline.</p>
        <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
          <Btn size="lg" onClick={()=>setShowAuth(true)}>Request Access →</Btn>
          <Btn variant="outline" size="lg" onClick={()=>setShowAuth(true)}>See a Demo</Btn>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer style={{borderTop:`1px solid ${T.border}`,padding:"clamp(28px,5vw,50px) 20px 28px"}}>
      <div style={{maxWidth:1060,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr repeat(3,1fr)",gap:"clamp(20px,4vw,48px)",marginBottom:36}} className="grid-2-mobile">
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><LogoMark size={26}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:17}}>Streamline</span></div>
            <p style={{fontSize:13,color:T.muted,lineHeight:1.6,maxWidth:200}}>Qualified leads for service businesses that run on booked jobs.</p>
          </div>
          {[{title:"Product",links:["How It Works","Features","Pricing","Log In"]},{title:"Company",links:["About","Blog","Careers","Contact"]},{title:"Support",links:["Help Center","FAQ","Onboarding","Status"]}].map(col=>(
            <div key={col.title}>
              <div style={{fontSize:10,fontWeight:600,color:T.offWhite,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>{col.title}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {col.links.map(l=><a key={l} href="#" style={{fontSize:13,color:T.muted,transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=T.white} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>{l}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${T.border}`,paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{fontSize:12,color:T.muted}}>© 2026 Streamline. All rights reserved.</div>
          <div style={{display:"flex",gap:18}}>{["Privacy","Terms","Cookies"].map(l=><a key={l} href="#" style={{fontSize:12,color:T.muted}}>{l}</a>)}</div>
        </div>
      </div>
    </footer>

    <Modal open={showAuth} onClose={()=>setShowAuth(false)} title="">
      <AuthPage onAuth={u=>{setShowAuth(false);onLogin(u);}}/>
    </Modal>
    <Chatbot/>
  </div>;
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("loading");
  const [user,setUser]=useState(null);
  const [intakeInd,setIntakeInd]=useState("hvac");

  useEffect(()=>{
    const urlInd=getIndustryFromURL();
    db.getSession().then(async session=>{
      if(session){
        const business=await db.getBusiness(session.user.id);
        setUser({...session.user,...business});
        setPage("dashboard");
      }else if(urlInd){
        setIntakeInd(urlInd);setPage("intake");
      }else{
        setPage("landing");
      }
    });
    const{data:{subscription}}=sb.auth.onAuthStateChange(async(event,session)=>{
      if(event==="SIGNED_OUT"){setUser(null);setPage("landing");}
    });
    return()=>subscription.unsubscribe();
  },[]);

  const goIntake=ind=>{setIntakeInd(ind||"hvac");setPage("intake");};

  if(page==="loading")return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,flexDirection:"column",gap:14}}>
    <LogoMark size={38}/><Spinner size={22}/><span style={{color:T.muted,fontSize:13,marginTop:4}}>Loading…</span>
  </div>;
  if(page==="intake")return <IntakeForm industryKey={intakeInd} onBack={()=>setPage("landing")}/>;
  if(page==="dashboard"&&user)return <Dashboard user={user} onLogout={async()=>{await db.signOut();setUser(null);setPage("landing");}}/>;
  return <LandingPage onLogin={u=>{setUser(u);setPage("dashboard");}} onIntakeForm={goIntake}/>;
}
