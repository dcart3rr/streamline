import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://teixvcgtuqtclvvyfqat.supabase.co";
const SUPABASE_KEY = "sb_publishable_c8tvTyGmR0_IAWg6692bLg_tTwMPBYA";
const DEMO_BUSINESS_ID = "185446cc-87a1-4508-a1da-63117aeaa7f2";

function getBusinessIdFromURL(){
  const p=new URLSearchParams(window.location.search);
  return p.get("bid")||DEMO_BUSINESS_ID;
}
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
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;user-select:none;-webkit-user-select:none}
  input,textarea{user-select:text;-webkit-user-select:text}
  html{min-height:100%;scroll-behavior:smooth}
  body{min-height:100%;width:100%}
  #root{min-height:100%;width:100%;display:block;position:relative}
  body{background:${T.bg};color:${T.white};font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${T.surface}}::-webkit-scrollbar-thumb{background:${T.surface3};border-radius:2px}
  input,select,textarea,button{font-family:inherit;-webkit-appearance:none}
  a{color:inherit;text-decoration:none}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes chatPop{from{opacity:0;transform:translateY(12px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes badgeFadeIn{0%{opacity:0;transform:translateY(4px)}20%,80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-4px)}}
  @keyframes typingDot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
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
  education:{
    label:"Beauty Schools",icon:"💅",color:"#F472B6",
    headline:"Find Your Beauty Program",
    subline:"Cosmetology, esthetics, nail tech, barbering, and more — get matched with an accredited beauty school near you.",
    issueTypes:[
      {value:"cosmetology",label:"Cosmetology / Hair Styling"},
      {value:"esthetics",label:"Esthetics / Skin Care"},
      {value:"nail_tech",label:"Nail Technology"},
      {value:"barbering",label:"Barbering"},
      {value:"makeup_artistry",label:"Makeup Artistry"},
      {value:"massage_therapy",label:"Massage Therapy"},
      {value:"lash_brow",label:"Lash & Brow Artistry"},
      {value:"salon_management",label:"Salon Management"},
      {value:"instructor",label:"Cosmetology Instructor Program"},
      {value:"other",label:"Other Beauty Program"},
    ],
    estimates:{"cosmetology":"$10,000–$22,000","esthetics":"$5,000–$15,000","nail_tech":"$3,000–$9,000","barbering":"$8,000–$18,000","makeup_artistry":"$4,000–$12,000","massage_therapy":"$6,000–$16,000","lash_brow":"$2,500–$7,000","salon_management":"$8,000–$20,000","instructor":"$5,000–$14,000"},
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
  if(raw.includes("edu")||raw.includes("tutor")||raw.includes("school")||raw.includes("lesson")) return "education";
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
  updateLeadStatus:async(id,s,extra={})=>{const{error}=await sb.from("leads").update({status:s,...extra}).eq("id",id);if(error)throw error;},
  getWonLeads:async(bid)=>{const{data}=await sb.from("leads").select("*").eq("business_id",bid).eq("status","won").order("completed_at",{ascending:false});return data||[];},
  getAllWonLeads:async()=>{const{data}=await sb.from("leads").select("*").eq("status","won").order("completed_at",{ascending:false});return data||[];},
  getInvoices:async(bid)=>{const{data}=await sb.from("invoices").select("*").eq("business_id",bid).order("created_at",{ascending:false});return data||[];},
  getAllInvoices:async()=>{const{data}=await sb.from("invoices").select("*").order("created_at",{ascending:false});return data||[];},
  createInvoice:async(inv)=>{const{data,error}=await sb.from("invoices").insert([inv]).select().single();if(error)throw error;return data;},
  markInvoicePaid:async(id)=>{const{error}=await sb.from("invoices").update({status:"paid",paid_at:new Date().toISOString()}).eq("id",id);if(error)throw error;},
  markLeadsBilled:async(leadIds,invoiceId)=>{const{error}=await sb.from("leads").update({billed:true,invoice_id:invoiceId}).in("id",leadIds);if(error)throw error;},
  markLeadVerified:async(id,verified,note="")=>{const{error}=await sb.from("leads").update({verified,dispute_note:note||null}).eq("id",id);if(error)throw error;},
  getUnverifiedWonLeads:async()=>{const{data}=await sb.from("leads").select("*").eq("status","won").is("verified",null).order("completed_at",{ascending:false});return data||[];},
  getNotifications:async(bid)=>{const{data}=await sb.from("notifications").select("*").eq("business_id",bid).order("created_at",{ascending:false}).limit(50);return data||[];},
  insertNotification:async(n)=>sb.from("notifications").insert([n]),
  // Billing / Stripe
  getBilling:async(bid)=>{const{data}=await sb.from("billing").select("*").eq("business_id",bid).single();return data;},
  upsertBilling:async(b)=>{const{error}=await sb.from("billing").upsert(b);if(error)throw error;},
  requestCancellation:async(bid,reason)=>{
    const{error}=await sb.from("billing").update({
      cancel_requested:true,
      cancel_reason:reason,
      cancel_requested_at:new Date().toISOString(),
      status:"cancel_pending",
    }).eq("business_id",bid);
    if(error)throw error;
  },
  getAllBilling:async()=>{const{data}=await sb.from("billing").select("*");return data||[];},
  // Contractor applications (CRM)
  submitApplication:async(a)=>{const{data,error}=await sb.from("contractor_applications").insert([a]).select().single();if(error)throw error;return data;},
  getApplications:async()=>{const{data,error}=await sb.from("contractor_applications").select("*").order("created_at",{ascending:false});if(error)throw error;return data||[];},
  updateApplicationStage:async(id,stage,notes)=>{const{error}=await sb.from("contractor_applications").update({stage,...(notes!==undefined?{admin_notes:notes}:{})}).eq("id",id);if(error)throw error;},
  deleteApplication:async(id)=>{const{error}=await sb.from("contractor_applications").delete().eq("id",id);if(error)throw error;},
  markNotifsRead:async(bid)=>sb.from("notifications").update({read:true}).eq("business_id",bid).eq("read",false),
  subscribeToLeads:(bid,cb)=>sb.channel("leads-rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"leads",filter:`business_id=eq.${bid}`},p=>cb(p.new)).subscribe(),
  // ── Lead routing engine: cap enforcement + soft city balancing ──
  // ── ROUTING ENGINE v3: cap + volume balance + quality balance + all-capped fallback ──
  // SCORING (max 100 pts + home bonus):
  //   capScore    (0-30): how much room left relative to cap
  //   deficitScore(0-30): how far below city-avg volume
  //   qualityScore(0-30): how far below city-avg lead quality (avg score 0-100)
  //   homeBonus   (  20): if this contractor's URL sourced the lead
  // All-capped fallback: same formula but cap filter removed, home bonus doubled
  routeLead:async(industry, preferredBid=null)=>{
    const PLAN_CAPS={"Starter":20,"Growth":50,"default":20};
    const now=new Date();
    const monthStart=new Date(now.getFullYear(),now.getMonth(),1).toISOString();
    try{
      const{data:contractors,error}=await sb.from("businesses")
        .select("id,city,industry,company,plan")
        .ilike("industry",`%${industry}%`)
        .neq("id",DEMO_BUSINESS_ID);
      if(error||!contractors?.length)return{bid:null,reason:"no_contractors"};

      // For each contractor: count leads + avg lead score this month
      const withStats=await Promise.all(contractors.map(async c=>{
        const cap=PLAN_CAPS[c.plan]||PLAN_CAPS.default;
        const{data:monthLeadsData}=await sb.from("leads")
          .select("id,score")
          .eq("business_id",c.id)
          .gte("created_at",monthStart);
        const monthLeads=(monthLeadsData||[]).length;
        const avgQuality=monthLeads>0
          ?Math.round(monthLeadsData.reduce((s,l)=>s+(l.score||0),0)/monthLeads)
          :50; // neutral default so new contractors aren't penalised
        const capRemaining=Math.max(0,cap-monthLeads);
        return{...c,cap,monthLeads,capRemaining,avgQuality};
      }));

      const scoreContractors=(pool,ignoreCap=false)=>{
        // City-level averages for volume AND quality
        const cityGroups={};
        pool.forEach(c=>{
          const city=(c.city||"_").toLowerCase();
          if(!cityGroups[city])cityGroups[city]=[];
          cityGroups[city].push(c);
        });
        return pool.map(c=>{
          const city=(c.city||"_").toLowerCase();
          const peers=cityGroups[city]||[c];
          const cityAvgVol =peers.reduce((s,p)=>s+p.monthLeads,0)/peers.length;
          const cityAvgQual=peers.reduce((s,p)=>s+p.avgQuality,0)/peers.length;

          // Volume deficit: behind the city average = higher priority
          const volDeficit =Math.max(0,cityAvgVol -c.monthLeads);
          // Quality deficit: lower avg quality than peers = gets better leads next
          const qualDeficit=Math.max(0,cityAvgQual-c.avgQuality);

          const capScore    =ignoreCap?15:(c.capRemaining/c.cap)*30; // 0-30
          const deficitScore=Math.min(volDeficit *3,30);              // 0-30
          const qualityScore=Math.min(qualDeficit*0.6,30);            // 0-30
          const homeBonus   =c.id===preferredBid?(ignoreCap?40:20):0; // doubled when all capped
          return{...c,routingScore:capScore+deficitScore+qualityScore+homeBonus};
        });
      };

      // Primary: eligible contractors (under cap)
      const eligible=withStats.filter(c=>c.capRemaining>0);
      let pool=eligible;
      let allCapped=false;

      if(!eligible.length){
        // All capped — fall back to full pool, home bonus doubled, same quality/volume rules
        pool=withStats;
        allCapped=true;
      }

      const scored=scoreContractors(pool,allCapped);
      scored.sort((a,b)=>b.routingScore-a.routingScore);
      const winner=scored[0];
      const wasRedirected=preferredBid&&winner.id!==preferredBid;

      return{
        bid:winner.id,
        reason:allCapped?"all_capped_overflow":wasRedirected?"overflow":"routed",
        contractor:winner,
        allCapped,
      };
    }catch(e){
      console.error("Routing error:",e);
      return{bid:null,reason:"error"};
    }
  },
  getUnassignedLeads:async()=>{
    const{data}=await sb.from("leads").select("*")
      .eq("business_id",DEMO_BUSINESS_ID)
      .eq("source","unassigned")
      .order("created_at",{ascending:false});
    return data||[];
  },
  assignLeadToContractor:async(leadId,contractorId)=>{
    const{error}=await sb.from("leads")
      .update({business_id:contractorId,source:"admin_assigned"})
      .eq("id",leadId);
    if(error)throw error;
  },
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
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:18,width:"100%",maxWidth:width,maxHeight:"92vh",overflow:"auto",animation:"fadeUp 0.28s ease"}}>
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
// ─── SMART CHATBOT ENGINE ─────────────────────────────────────────────────────
// Priority-ordered rules. First match wins.
const CHAT_RULES = [
  // Greetings
  { match: m => /^(hi|hey|hello|good morning|good afternoon|good evening|what'?s up|howdy|sup)\b/.test(m),
    reply: () => "Hey! Welcome to Streamline — I'm your sales assistant. I can answer questions about pricing, lead quality, how our intake forms work, or how we compare to other lead services. What can I help you with?" },

  // Profanity / frustration
  { match: m => /(stupid|useless|terrible|awful|hate this|scam|waste)/.test(m),
    reply: () => "I'm sorry to hear that — I want to make sure you get what you need. Feel free to reach us directly at **hello@streamline.io** and a real person will get back to you within one business day." },

  // Thanks
  { match: m => /^(thanks|thank you|thx|ty|appreciate|perfect|great|awesome|helpful)/.test(m),
    reply: () => "Happy to help! Is there anything else you'd like to know about Streamline?" },

  // Competitor comparison — HomeAdvisor / Angi / Thumbtack / Bark
  { match: m => /(homeadvisor|home advisor|angi|thumbtack|bark\.com|yelp|houzz|porch\.com|networx|vs\.|versus|compare|different from|better than|competitor)/.test(m),
    reply: () => "Great question. Here's how we're different:\n\n**HomeAdvisor / Angi** sell the same lead to 3–5 contractors simultaneously and charge you regardless of outcome. You end up racing to the phone.\n\n**Streamline** leads are:\n› Exclusive — one business per lead, always\n› Pre-scored 0–100 before delivery\n› Paired with an estimate the customer already agreed to\n› Only cost a performance fee when *you* close the job\n\nWe win when you win." },

  // Pricing — general
  { match: m => /(price|pricing|cost|how much|subscription|monthly|fee|plan|starter|growth|tier|package|what do you charge|what'?s the rate)/.test(m) && !/(performance|close|won|per job|per lead)/.test(m),
    reply: () => "We have two plans:\n\n**Starter — $299/mo**\n› Up to 20 qualified leads/month\n› $150 performance fee per closed job\n\n**Growth — $499/mo**\n› Up to 50 qualified leads/month\n› $100 performance fee per closed job\n› Priority queue, CRM integrations, account manager\n\nBoth plans include exclusive leads, real-time dashboard, and instant notifications. No setup fees." },

  // Performance fee
  { match: m => /(performance fee|per job|per close|per lead|when do i pay|when am i charged|pay per|cost per)/.test(m),
    reply: () => "The performance fee only applies when you mark a lead as **Won** in your dashboard — meaning you closed the job.\n\n› Starter: **$150** per closed job\n› Growth: **$100** per closed job\n\nFees are invoiced at the end of each month. You're never charged for leads that don't convert." },

  // Free trial / demo
  { match: m => /(free trial|trial|demo|try it|test it|sample|free leads|no commitment)/.test(m),
    reply: () => "We don't currently offer a free trial, but we do offer a **live demo** where we walk you through the dashboard, show you real scored leads, and explain the full intake flow.\n\nClick **Request Access** at the top of the page to schedule one — usually same week." },

  // ROI / worth it / is it worth
  { match: m => /(worth it|roi|return|profitable|make money|pay off|justify|too expensive|cheaper)/.test(m),
    reply: () => "Here's the math most contractors run:\n\nIf your average job value is $2,000 and you close 30% of leads on the Starter plan:\n› 20 leads × 30% = **6 closed jobs/month**\n› Revenue: $12,000\n› Cost: $299 + (6 × $150) = **$1,199**\n› Net: ~$10,800\n\nHot leads (score 75+) close at significantly higher rates. Most contractors see positive ROI in their first month." },

  // How scoring works
  { match: m => /(score|scoring|how.*(score|rank|rate|qualify)|lead score|what.*(score|mean)|hot|warm|cold|qualify|qualification)/.test(m),
    reply: () => "Every lead is scored **0–100** across six dimensions before it reaches you:\n\n› **Budget match** (20pts) — do they have the money?\n› **Urgency** (20pts) — emergency, this week, or flexible?\n› **Ownership** (15pts) — homeowner or renter?\n› **Property size** (15pts) — scope of the job\n› **Issue clarity** (15pts) — did they describe the problem well?\n› **Contact quality** (15pts) — valid phone, preferred time, zip code\n\n**Hot** = 75+, **Warm** = 50–74, **Cold** = below 50.\n\nHot leads are flagged immediately and close at the highest rates." },

  // Exclusivity
  { match: m => /(exclusive|shared|only me|my lead|stolen|sold to|how many|other contractor|competing)/.test(m),
    reply: () => "Every lead is **100% exclusive to you**. The moment a lead is assigned to your account, it's removed from availability for every other business on the platform.\n\nWe never sell the same lead twice — not to a competitor, not to a partner, not to anyone. That's a core part of how Streamline works." },

  // Lead volume / how many leads
  { match: m => /(how many leads|lead volume|volume|leads per month|leads a month|enough leads|run out)/.test(m),
    reply: () => "Lead volume depends on your plan:\n\n› **Starter**: up to 20 qualified leads/month\n› **Growth**: up to 50 qualified leads/month\n\nNeed more than 50? Contact us at hello@streamline.io and we can discuss a custom volume arrangement." },

  // Lead quality
  { match: m => /(lead quality|junk|fake|bad leads|garbage|low quality|real|legit|verified|good leads)/.test(m),
    reply: () => "Lead quality is our #1 priority. Here's how we maintain it:\n\n› Every lead goes through our **6-dimension scoring engine** before delivery\n› Customers see a realistic estimate range *before* submitting — so price-shoppers self-select out\n› Low-intent leads (score below a threshold) are filtered automatically\n› You can mark any lead as Lost with one click — we track that data to improve future quality\n\nMost contractors report our leads close at 2–3× the rate of shared lead services." },

  // How it works — general
  { match: m => /(how.*(work|does it|get leads|receive|deliver)|explain|walk me through|process|step|overview|tell me about)/.test(m),
    reply: () => "Here's the full flow:\n\n**1. Customer clicks your ad** → lands on your industry-specific intake form\n**2. They answer 5 steps** → issue type, urgency, budget, property size, contact info\n**3. We score them 0–100** → in real-time, across 6 dimensions\n**4. They receive an estimate** → a realistic price range for their job\n**5. Lead hits your dashboard** → within 60 seconds, with full details\n**6. You get notified** → in-app alert + email\n**7. You contact them** → they're already warmed up and price-educated" },

  // Intake form
  { match: m => /(intake form|quote form|lead form|form|how.*(customer|homeowner)|customer.*(fill|submit|see)|what.*(customer|homeowner).*(do|see|fill))/.test(m),
    reply: () => "The intake form is a 5-step questionnaire your customers complete from your ad or direct link.\n\nEach industry has its own tailored version:\n› **HVAC** — AC type, issue description, urgency, property, budget\n› **Roofing** — damage type, storm/age, property, budget\n› **Plumbing** — issue type, urgency, property, budget\n› **Electrical** — service type, property, budget\n\nEach ad campaign gets its own URL:\n`yoursite.com/?industry=hvac`\n`yoursite.com/?industry=roofing`\n\nTakes customers about 2 minutes to complete." },

  // Dashboard
  { match: m => /(dashboard|pipeline|where.*(see|view|find).*(lead|customer)|lead.*(view|list|table|track)|how.*(track|manage|see my))/.test(m),
    reply: () => "Your dashboard shows your full lead pipeline in real-time:\n\n› All leads sorted by score or date\n› Filter by status: New, Contacted, Won, Lost\n› Search by name or issue type\n› One-click status updates\n› Score breakdown for every lead\n› Analytics: close rate, avg score, pipeline value\n\nEvery time a new lead comes in, you get an in-app notification instantly." },

  // Notifications
  { match: m => /(notif|alert|notify|sms|text message|email alert|how.*(know|find out).*(lead|new)|when.*(lead|new))/.test(m),
    reply: () => "You're notified the moment a new lead is assigned to you:\n\n› **In-app notification** — bell icon lights up in your dashboard\n› **Email alert** — sent to your registered email address\n\nSMS notifications via Twilio are on our roadmap for later this year." },

  // Industries / what trades
  { match: m => /(industr|trade|hvac|roofing|plumbing|electrical|educat|tutor|lesson|what.*(serve|support|cover|offer)|which.*(trade|industr|business))/.test(m),
    reply: () => "We serve **five industries** in the **Columbus, OH metro area**:\n\n› 🌬️ **HVAC** — AC repair, replacement, heating, duct work\n› 🏠 **Roofing** — repair, replacement, gutters, storm damage\n› 🔧 **Plumbing** — leaks, drains, water heaters, remodels\n› ⚡ **Electrical** — panels, wiring, EV chargers, smart home\n› 💅 **Beauty Schools** — cosmetology, esthetics, nail tech, barbering, massage therapy programs\n\nMore cities launching throughout 2026. Email hello@streamline.io to get on the waitlist for your area." },

  // Location / cities / areas
  { match: m => /(location|city|cities|area|where|columbus|ohio|oh|region|market|expand|available in|do you serve)/.test(m),
    reply: () => "We're currently live in the **Columbus, Ohio metro area** — covering Columbus, Dublin, Westerville, Hilliard, Grove City, Pickerington, and surrounding suburbs.\n\nWe're actively planning expansion to Cleveland, Cincinnati, and other Ohio markets in 2026. If you're outside Columbus, email hello@streamline.io to get on the expansion waitlist." },

  // Cancel / pause
  { match: m => /(cancel|pause|stop|quit|leave|end my|end subscription|exit)/.test(m),
    reply: () => "You can cancel or pause your subscription **anytime** directly from your dashboard — no phone call required, no cancellation fees, no penalty.\n\nIf you pause, your account stays intact and you can reactivate when you're ready. Leads simply stop being assigned while paused." },

  // Contract / commitment / lock-in
  { match: m => /(contract|commitment|lock.?in|minimum|tied|long.?term|annual|month.?to.?month)/.test(m),
    reply: () => "No long-term contracts. Streamline is **month-to-month** — you can upgrade, downgrade, pause, or cancel at any time.\n\nWe don't believe in locking contractors in. If we're not delivering value, you should be free to leave. Simple as that." },

  // Setup / onboarding / getting started
  { match: m => /(set.?up|onboard|get started|start|sign up|create account|register|join|how.*(join|start|begin))/.test(m),
    reply: () => "Getting started takes about 5 minutes:\n\n**1.** Click **Request Access** or **Get Started** on this page\n**2.** Create your account with your business email\n**3.** Choose your plan (Starter or Growth)\n**4.** Get your industry-specific intake form URL\n**5.** Add it to your Google/Facebook/Instagram ads\n\nLeads start flowing once customers start clicking. Most contractors receive their first lead within 24–48 hours of going live." },

  // Support / contact / human
  { match: m => /(contact|support|help|talk to|speak to|human|real person|someone|phone number|call you|reach you|email)/.test(m),
    reply: () => "You can reach our team at:\n\n📧 **hello@streamline.io**\n\nWe typically respond within a few hours during business days. You can also click **Request Access** to schedule a live demo call with the team." },

  // What is Streamline
  { match: m => /(what is streamline|what does streamline|what are you|tell me about streamline|who are you|what do you do)/.test(m),
    reply: () => "**Streamline** is a lead generation platform built specifically for home service contractors — HVAC, Roofing, Plumbing, and Electrical.\n\nInstead of cold, shared leads, we deliver:\n› **Exclusive** — one contractor per lead\n› **Pre-scored** — 0–100 quality rating before delivery\n› **Pre-educated** — customers already have a price estimate\n\nYou only pay a performance fee when you close the job. We win when you win." },

  // Reviews / testimonials / proof
  { match: m => /(review|testimonial|proof|case study|success story|result|who.*(use|uses|using)|other contractor|reference|trust)/.test(m),
    reply: () => "Here's what contractors using Streamline say:\n\n**Mike R. (Roofing, Columbus)** — \"The leads come in already knowing their budget. Closing faster than ever.\"\n\n**Dana L. (Plumbing, Dublin)** — \"Was paying $800/month sharing leads with four others. Streamline gives me exclusives at a lower cost.\"\n\n**James T. (Electrical, Westerville)** — \"Clean dashboard, real leads. I've never received one that was junk.\"\n\nWant to talk to an existing client? Email hello@streamline.io and we can set that up." },

  // Estimate / pricing shown to customer
  { match: m => /(estimate|price range|what.*(customer|homeowner).*(see|get|receive)|instant estimate|price.*(customer|homeowner))/.test(m),
    reply: () => "After a customer completes the intake form, they receive an **instant estimate range** based on their issue type, property size, and location.\n\nFor example:\n› AC Repair: **$350–$1,200**\n› Roof Replacement: **$8,000–$20,000**\n› Panel Upgrade: **$1,500–$4,000**\n\nThis means when *you* call them, they already have realistic price expectations — no sticker shock, fewer price objections, faster closes." },

  // CRM / integrations
  { match: m => /(crm|integration|jobber|servicetitan|housecall|zapier|connect|sync|export|import|api)/.test(m),
    reply: () => "CRM integrations are available on the **Growth plan** and include Jobber, ServiceTitan, and HouseCall Pro.\n\nZapier support is also on our roadmap for connecting to any tool in your stack. If you have a specific integration request, email hello@streamline.io." },

  // Payment / billing / invoice
  { match: m => /(pay|payment|billing|invoice|charge|credit card|method|stripe|bank|ach)/.test(m),
    reply: () => "Billing is simple:\n\n› Your **monthly subscription** is charged on the same date each month\n› **Performance fees** are calculated at month-end based on leads you marked as Won\n› You receive an itemized invoice showing every closed job\n\nWe accept all major credit cards. ACH bank transfer is available on the Growth plan." },

  // Guarantee / refund
  { match: m => /(guarantee|refund|money back|promise|if it doesn.?t work|risk|what if)/.test(m),
    reply: () => "We don't offer a formal money-back guarantee, but a few things protect you:\n\n› **No long-term contracts** — cancel any month, no penalty\n› **Performance fee only on wins** — you never pay extra for leads that don't close\n› **Lead quality tracking** — if lead quality drops, you can flag it and we investigate\n\nWe're also happy to schedule a demo before you commit so you can see exactly what you're getting." },

  // Seasonal / slow season
  { match: m => /(season|slow|winter|summer|off.?season|busy|peak|slow month|dead|quiet)/.test(m),
    reply: () => "Seasonal swings are real in the trades. A few ways Streamline helps:\n\n› You can **pause** your account during true off-seasons — no charge while paused\n› The **Growth plan** includes seasonal campaign boosts — we increase your lead flow during peak demand periods\n› Our scoring engine filters for urgency, so emergency leads come through year-round regardless of season" },

  // Fake / test leads
  { match: m => /(fake|spam|bot|test lead|junk lead|scam lead|bad info|wrong number|bogus)/.test(m),
    reply: () => "We take lead quality seriously. Here's how we reduce fake submissions:\n\n› Phone number validation (must be 10+ digits in correct format)\n› Zip code verification against service area\n› Minimum issue description length requirement\n› Scoring penalizes incomplete or vague contact info\n\nIf you receive a lead with clearly fake info, flag it in the dashboard and our team reviews it within 24 hours." },

  // Fallback
  { match: () => true,
    reply: () => "That's a great question — I want to make sure you get an accurate answer. You can reach our team directly at **hello@streamline.io** or click **Request Access** to schedule a live demo.\n\nIs there something else I can help clarify about our pricing, lead quality, or how the platform works?" },
];

function autoReply(msg) {
  const m = msg.toLowerCase().trim();
  const rule = CHAT_RULES.find(r => r.match(m));
  return rule ? rule.reply() : CHAT_RULES[CHAT_RULES.length - 1].reply();
}

function Chatbot(){
  const SUGGESTIONS=["How does pricing work?","Are leads exclusive?","How do I get started?","How is this different from HomeAdvisor?","What industries do you serve?","Is there a contract?"];
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([{role:"bot",text:"Hi! I'm the Streamline sales assistant. I can answer questions about pricing, lead quality, how our intake forms work, or how we compare to other lead services.\n\nWhat would you like to know?",ts:Date.now()}]);
  const [showSugg,setShowSugg]=useState(true);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [unread,setUnread]=useState(0);
  const bottomRef=useRef(null);
  useEffect(()=>{if(open){setUnread(0);setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),80)}},[msgs,open]);

  const send=async(textOverride)=>{
    const text=(textOverride||input).trim();if(!text)return;
    setShowSugg(false);
    setInput("");setMsgs(m=>[...m,{role:"user",text,ts:Date.now()}]);setTyping(true);
    await new Promise(r=>setTimeout(r,600+Math.random()*500));
    setMsgs(m=>[...m,{role:"bot",text:autoReply(text),ts:Date.now()}]);setTyping(false);
    if(!open)setUnread(u=>u+1);
  };

  const fmt=t=>t.split(/(\*\*[^*]+\*\*)/).map((p,i)=>p.startsWith("**")&&p.endsWith("**")
    ?<strong key={i} style={{color:T.white}}>{p.slice(2,-2)}</strong>
    :p.split("\n").map((l,j,a)=><span key={j}>{l}{j<a.length-1&&<br/>}</span>));

  return <div style={{position:"fixed",bottom:20,right:16,zIndex:500}}>
    {open&&<div style={{position:"absolute",bottom:66,right:0,width:"min(370px,calc(100vw - 24px))",background:T.surface,border:`1px solid ${T.border2}`,borderRadius:16,boxShadow:"0 24px 64px rgba(0,0,0,0.6)",display:"flex",flexDirection:"column",height:480,animation:"chatPop 0.25s ease"}}>
      {/* Header */}
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`,background:T.surface2,borderRadius:"16px 16px 0 0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${T.blue},${T.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white"}}>S</div>
          <div>
            <div style={{fontSize:13,fontWeight:600}}>Streamline Assistant</div>
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.green}}><div style={{width:4,height:4,borderRadius:"50%",background:T.green}}/>Online · Typically replies instantly</div>
          </div>
        </div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20,padding:4}}>×</button>
      </div>
      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
          <div style={{maxWidth:"88%",padding:"10px 13px",borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",background:m.role==="user"?T.blue:T.surface2,fontSize:13,color:m.role==="user"?T.white:T.offWhite,lineHeight:1.65,border:m.role==="bot"?`1px solid ${T.border}`:"none"}}>
            {m.role==="bot"?fmt(m.text):m.text}
          </div>
        </div>)}
        {/* Quick suggestions shown after first bot message */}
        {showSugg&&msgs.length===1&&<div style={{display:"flex",flexDirection:"column",gap:6,marginTop:2}}>
          <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>Common questions</div>
          {SUGGESTIONS.map(s=><button key={s} onClick={()=>send(s)} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:8,padding:"8px 12px",cursor:"pointer",color:T.offWhite,fontSize:12,textAlign:"left",transition:"border-color 0.15s,background 0.15s",touchAction:"manipulation"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blueL;e.currentTarget.style.background=T.surface3;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.background="none";}}>{s}</button>)}
        </div>}
        {typing&&<div style={{display:"flex",gap:4,padding:"10px 12px",background:T.surface2,borderRadius:"12px 12px 12px 4px",width:"fit-content",border:`1px solid ${T.border}`}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.muted,animation:`typingDot 1.2s ${i*0.2}s infinite`}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>
      {/* Input */}
      <div style={{padding:"10px 12px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask a question…" style={{flex:1,background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 12px",color:T.white,fontSize:13,outline:"none"}}/>
        <button onClick={()=>send()} disabled={!input.trim()} style={{background:T.blue,border:"none",borderRadius:8,width:38,height:38,cursor:"pointer",color:"white",display:"flex",alignItems:"center",justifyContent:"center",opacity:input.trim()?1:0.4,flexShrink:0,fontSize:16}}>→</button>
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
  const [calendlyUrl,setCalendlyUrl]=useState("");
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
      const urlBid=getBusinessIdFromURL();
      const hasBid=new URLSearchParams(window.location.search).has("bid");
      // Run full routing: cap check + soft city balancing
      // Pass urlBid as preferred if it came from a contractor link
      const routing=await db.routeLead(ind.label, hasBid?urlBid:null);
      let assignedBid=DEMO_BUSINESS_ID;
      let assignedSource="unassigned";
      if(routing.bid){
        assignedBid=routing.bid;
        if(routing.reason==="overflow") assignedSource="overflow";       // capped, sent to peer
        else if(hasBid)                 assignedSource="direct";         // came from contractor URL
        else                            assignedSource="auto_assigned";  // no URL, auto-matched
      }
      if(score>=50&&assignedSource!=="unassigned"){
        try{const biz=await db.getBusiness(assignedBid);setCalendlyUrl(biz?.calendly_url||"");}catch(e){}
      }
      await db.insertLead({
        business_id:assignedBid,
        source:assignedSource,
        name:form.name,phone:form.phone,email:form.email,
        issue_type:form.issueType,issue_description:form.issueDescription,
        urgency:form.urgency,budget:form.budget,ownership:form.ownership,
        property_size:form.propertySize,preferred_time:form.preferredTime,
        zip_code:form.zipCode,industry:ind.label,score,tier,breakdown,status:"new",
        estimate_range:ind.estimates[form.issueType]||"$400–2,000",
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
      {calendlyUrl&&<div style={{marginTop:16,marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:600,color:T.white,marginBottom:8,textAlign:"left"}}>📅 Book your free estimate</div>
        <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${T.border2}`,height:520}}>
          <iframe src={`${calendlyUrl}?name=${encodeURIComponent(form.name||"")}&email=${encodeURIComponent(form.email||"")}`} width="100%" height="520" frameBorder="0" style={{display:"block"}}/>
        </div>
      </div>}
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
    <div style={{flex:1,display:"flex",justifyContent:"center",padding:"40px 20px",overflowY:"auto"}}>
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
// Accounts are provisioned by admin only. Contractors receive credentials via email.
function AuthPage({onAuth}){
  const [email,setEmail]=useState("demo@streamline.com");
  const [password,setPassword]=useState("demo1234");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [showForgot,setShowForgot]=useState(false);
  const [resetSent,setResetSent]=useState(false);

  const submit=async()=>{
    setError("");setLoading(true);
    try{
      const{session}=await db.signIn(email,password);
      if(!session)throw new Error("Login failed — check your credentials.");
      const business=await db.getBusiness(session.user.id);
      onAuth({...session.user,...business});
    }catch(e){setError(e.message||"Something went wrong.");}
    setLoading(false);
  };

  const sendReset=async()=>{
    if(!email.trim()){setError("Enter your email address first");return;}
    setLoading(true);
    try{
      const{error:e}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
      if(e)throw e;
      setResetSent(true);setShowForgot(false);
    }catch(e){setError(e.message||"Reset failed. Email hello@streamline.io for help.");}
    setLoading(false);
  };

  return <div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22,justifyContent:"center"}}><LogoMark size={32}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:20}}>Streamline</span></div>
    <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22,letterSpacing:-0.5,marginBottom:5,textAlign:"center"}}>Welcome back.</h2>
    <p style={{color:T.muted,fontSize:13,marginBottom:18,textAlign:"center"}}>Sign in to your lead dashboard.</p>
    <div style={{background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13}}><span style={{color:T.blueL,fontWeight:600}}>Demo: </span>demo@streamline.com / demo1234</div>
    {resetSent&&<div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:T.green}}>✓ Password reset email sent — check your inbox.</div>}
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Inp label="Email" value={email} onChange={setEmail} type="email" placeholder="you@company.com" required/>
      <Inp label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" required/>
    </div>
    {error&&<div style={{marginTop:12,padding:"10px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,fontSize:13,color:"#F87171"}}>{error}</div>}
    <Btn onClick={submit} disabled={loading} fullWidth style={{marginTop:18}}>
      {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={15}/>Signing in…</span>:"Sign In →"}
    </Btn>
    <div style={{textAlign:"center",marginTop:12,fontSize:13,color:T.muted}}>
      <span onClick={()=>setShowForgot(s=>!s)} style={{color:T.blueL,cursor:"pointer",fontWeight:500}}>Forgot password?</span>
    </div>
    {showForgot&&(
      <div style={{marginTop:12,padding:"14px",background:T.surface2,borderRadius:10,border:`1px solid ${T.border2}`}}>
        <div style={{fontSize:13,color:T.offWhite,marginBottom:10}}>Enter your email above and click below to receive a reset link.</div>
        <Btn variant="outline" onClick={sendReset} disabled={loading} fullWidth>Send Reset Email</Btn>
      </div>
    )}
    <div style={{marginTop:16,padding:"12px 14px",background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border}`,borderRadius:10,fontSize:12,color:T.muted,textAlign:"center",lineHeight:1.7}}>
      Don't have an account? Accounts are set up by the Streamline team after your application is approved.<br/>
      <a href="mailto:hello@streamline.io" style={{color:T.blueL,fontWeight:500}}>Contact hello@streamline.io</a> for access.
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
function LeadDetail({lead,onClose,onStatusChange,calendlyUrl}){
  if(!lead)return null;
  const [showWonModal,setShowWonModal]=useState(false);
  const [wonJobValue,setWonJobValue]=useState("");
  const [wonDate,setWonDate]=useState(new Date().toISOString().split("T")[0]);
  const [wonNotes,setWonNotes]=useState("");
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
    {calendlyUrl&&lead.score>=50&&<div style={{marginBottom:14}}>
      <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Book Estimate</div>
      <div style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:10,overflow:"hidden",height:500}}>
        <iframe src={`${calendlyUrl}?name=${encodeURIComponent(lead.name||"")}&email=${encodeURIComponent(lead.email||"")}`} width="100%" height="500" frameBorder="0" style={{display:"block"}}/>
      </div>
    </div>}
    {lead.status!=="won"&&lead.status!=="lost"&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn variant="success" onClick={()=>setShowWonModal(true)} style={{flex:1,minWidth:110}}>✓ Won</Btn>
      <Btn variant="danger" onClick={()=>{onStatusChange(lead.id,"lost",{});onClose();}} style={{flex:1,minWidth:110}}>✗ Lost</Btn>
      {lead.status==="new"&&<Btn variant="outline" onClick={()=>{onStatusChange(lead.id,"contacted",{});onClose();}} style={{flex:1,minWidth:110}}>📞 Contacted</Btn>}
    </div>}
    {lead.status==="won"&&<div style={{background:"rgba(16,185,129,0.08)",border:`1px solid ${lead.verified===false?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.2)"}`,borderRadius:10,padding:"12px 14px"}}>
      <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Job Summary</div>
      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:6}}>
        <span style={{fontSize:13,color:T.green,fontWeight:600}}>{lead.job_value?`$${Number(lead.job_value).toLocaleString()} job value`:"No job value recorded"}</span>
        {lead.completed_at&&<span style={{fontSize:12,color:T.muted}}>Completed {new Date(lead.completed_at).toLocaleDateString()}</span>}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:lead.verified===false&&lead.dispute_note?8:0}}>
        {lead.billed&&<span style={{fontSize:10,background:"rgba(245,158,11,0.12)",color:T.amber,border:"1px solid rgba(245,158,11,0.25)",borderRadius:4,padding:"2px 7px",fontWeight:600}}>Invoiced</span>}
        {lead.verified===true&&<span style={{fontSize:10,background:"rgba(16,185,129,0.12)",color:T.green,border:"1px solid rgba(16,185,129,0.25)",borderRadius:4,padding:"2px 7px",fontWeight:600}}>✓ Verified</span>}
        {lead.verified===false&&<span style={{fontSize:10,background:"rgba(239,68,68,0.1)",color:T.red,border:"1px solid rgba(239,68,68,0.25)",borderRadius:4,padding:"2px 7px",fontWeight:600}}>✗ Disputed</span>}
        {(lead.verified===null||lead.verified===undefined)&&<span style={{fontSize:10,background:"rgba(245,158,11,0.08)",color:T.amber,border:"1px solid rgba(245,158,11,0.2)",borderRadius:4,padding:"2px 7px"}}>⏳ Pending admin verification</span>}
      </div>
      {lead.verified===false&&lead.dispute_note&&<div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:7,padding:"8px 10px",fontSize:12,color:"#F87171",lineHeight:1.6}}>⚠️ Admin note: {lead.dispute_note} — Email hello@streamline.io to resolve.</div>}
    </div>}
    {/* Won job modal */}
    <Modal open={showWonModal} onClose={()=>setShowWonModal(false)} title="Log Won Job">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:"12px 14px",fontSize:13,color:T.offWhite,lineHeight:1.6}}>
          🎉 Great work closing <strong>{lead.name}</strong>! Log the job details below. Your admin will verify before invoicing.
        </div>
        <Inp label="Total Job Value ($)" value={wonJobValue} onChange={setWonJobValue} type="number" placeholder="e.g. 3500" hint="Total amount the customer paid"/>
        <Inp label="Completion Date" value={wonDate} onChange={setWonDate} type="date"/>
        <div>
          <div style={{fontSize:12,fontWeight:500,color:T.offWhite,marginBottom:6}}>Verification — Invoice # or Reference <span style={{color:T.muted,fontWeight:400}}>(recommended)</span></div>
          <input value={wonNotes} onChange={e=>setWonNotes(e.target.value)} placeholder="e.g. Invoice #1042, signed work order, or customer name confirmation…" style={{width:"100%",background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 12px",color:T.white,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
          <div style={{fontSize:11,color:T.muted,marginTop:5}}>Providing a reference helps your admin verify the job quickly and prevents disputes. Invoice numbers, work order IDs, or contract references all work.</div>
        </div>
        {wonJobValue&&Number(wonJobValue)>0&&<div style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Performance fee on this job</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:T.amber}}>${lead.perfFee||150} <span style={{fontSize:12,color:T.muted,fontWeight:400}}>flat fee</span></div>
            <div style={{fontSize:12,color:T.muted}}>Job value: ${Number(wonJobValue).toLocaleString()}</div>
          </div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>Invoiced at month-end after admin verification</div>
        </div>}
        <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.15)",borderRadius:8,padding:"10px 12px",fontSize:11,color:T.muted,lineHeight:1.6}}>
          ℹ️ This submission is sent to your admin for verification. Disputes or questions? Email hello@streamline.io
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="outline" onClick={()=>setShowWonModal(false)} style={{flex:1}}>Cancel</Btn>
          <Btn variant="success" onClick={async()=>{
            const extra={job_value:wonJobValue?Number(wonJobValue):null,completed_at:wonDate||new Date().toISOString().split("T")[0],won_notes:wonNotes,billed:false,verified:null};
            await onStatusChange(lead.id,"won",extra);
            setShowWonModal(false);onClose();
          }} style={{flex:2}}>✓ Submit Won Job</Btn>
        </div>
      </div>
    </Modal>
  </Modal>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

// Settings Panel
// ─── GROWTH PLAN FEATURES ────────────────────────────────────────────────────

// 1. CRM Export (Growth only)
function CRMExport({leads, user, toast}){
  const isGrowth = user.plan === "Growth";
  const [exporting, setExporting] = useState(false);

  const exportCSV = () => {
    setExporting(true);
    const headers = ["Name","Phone","Email","Industry","Issue","Budget","Urgency","Score","Tier","Status","Job Value","Completed","Submitted","Source"];
    const rows = leads.map(l => [
      l.name||"",
      l.phone||"",
      l.email||"",
      l.industry||"",
      l.is_name||l.issue_type||"",
      (l.budget||"").replace(/_/g," "),
      l.urgency||"",
      l.score||0,
      l.tier||"",
      l.status||"",
      l.job_value||"",
      l.completed_at||"",
      new Date(l.created_at).toLocaleDateString(),
      l.source||"",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `streamline-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(false), 800);
    toast({message:"CSV downloaded", type:"success"});
  };

  if(!isGrowth) return(
    <div style={{background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
      <span style={{fontSize:22,flexShrink:0}}>🔒</span>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:"#A78BFA",marginBottom:3}}>CRM Export — Growth Plan</div>
        <div style={{fontSize:12,color:T.muted}}>Export your full lead history as CSV. Upgrade to Growth to unlock.</div>
      </div>
    </div>
  );

  return(
    <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"18px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:T.white,marginBottom:3}}>Export Lead Data</div>
          <div style={{fontSize:12,color:T.muted}}>{leads.length} leads · CSV format · all fields included</div>
        </div>
        <button onClick={exportCSV} disabled={exporting||!leads.length} style={{background:`linear-gradient(135deg,#7C3AED,#A78BFA)`,border:"none",borderRadius:8,padding:"9px 18px",cursor:leads.length?"pointer":"not-allowed",color:"white",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6,opacity:exporting?0.7:1}}>
          {exporting?<><Spinner size={13}/> Exporting…</>:"⬇ Export CSV"}
        </button>
      </div>
      <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
        {["Name & Contact","Lead Score","Budget & Urgency","Job Value","Close Status"].map(f=>(
          <span key={f} style={{fontSize:11,background:"rgba(167,139,250,0.1)",color:"#A78BFA",border:"1px solid rgba(167,139,250,0.2)",borderRadius:4,padding:"2px 8px"}}>{f}</span>
        ))}
      </div>
    </div>
  );
}

// 2. Dedicated Account Manager (Growth only) — shows admin who onboarded the contractor
function AccountManager({user}){
  const isGrowth = user.plan === "Growth";
  if(!isGrowth) return(
    <div style={{background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
      <span style={{fontSize:22,flexShrink:0}}>🔒</span>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:"#A78BFA",marginBottom:3}}>Dedicated Account Manager — Growth Plan</div>
        <div style={{fontSize:12,color:T.muted}}>Get a named contact at Streamline who knows your business. Upgrade to Growth to unlock.</div>
      </div>
    </div>
  );

  const amName  = user.onboarding_admin_name  || "Streamline Team";
  const amEmail = user.onboarding_admin_email || "hello@streamline.io";
  const initials = amName.split(" ").map(w=>w[0]||"").join("").slice(0,2).toUpperCase();
  const palettes = [["#7C3AED","#A78BFA"],["#0369A1","#38BDF8"],["#065F46","#34D399"],["#92400E","#FCD34D"],["#9D174D","#F9A8D4"]];
  const [g1,g2] = palettes[amName.charCodeAt(0)%palettes.length];
  const firstName = amName.split(" ")[0];

  return(
    <div style={{background:T.surface,border:`1px solid rgba(167,139,250,0.3)`,borderRadius:12,padding:"18px 20px"}}>
      <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"#A78BFA",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>Your Account Manager</div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${g1},${g2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"white",flexShrink:0,letterSpacing:1}}>{initials}</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.white,marginBottom:2}}>{amName}</div>
          <div style={{fontSize:12,color:T.muted}}>Account Manager · Streamline</div>
          <div style={{fontSize:11,color:"#A78BFA",marginTop:2}}>Onboarded your account</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {icon:"📧",label:"Email",value:amEmail,href:`mailto:${amEmail}`},
          {icon:"📅",label:"Book a call",value:"15 or 30 min",href:`mailto:${amEmail}?subject=Book a call — ${user.company||user.email}`},
          {icon:"💬",label:"Response time",value:"Within 4 business hours",href:null},
          {icon:"📞",label:"Support",value:"hello@streamline.io",href:"mailto:hello@streamline.io"},
        ].map(c=>(
          <div key={c.label} style={{background:T.surface2,borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:3}}>{c.icon} {c.label}</div>
            {c.href
              ?<a href={c.href} style={{fontSize:12,color:"#A78BFA",fontWeight:500,textDecoration:"none",wordBreak:"break-all"}}>{c.value}</a>
              :<div style={{fontSize:12,color:T.offWhite,fontWeight:500}}>{c.value}</div>
            }
          </div>
        ))}
      </div>
      <div style={{background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:8,padding:"10px 12px",fontSize:12,color:T.offWhite,lineHeight:1.6}}>
        {firstName} knows your account and can help with campaign strategy, close rate reviews, lead quality issues, or anything else you need.
      </div>
    </div>
  );
}

// 3. Seasonal Campaign Boosts (Growth only)
function SeasonalBoosts({user, toast}){
  const isGrowth = user.plan === "Growth";
  const month = new Date().getMonth(); // 0=Jan
  const currentSeason = month>=2&&month<=4?"spring":month>=5&&month<=7?"summer":month>=8&&month<=10?"fall":"winter";

  // All campaigns per industry
  const ALL_CAMPAIGNS = {
    HVAC:[
      {id:"spring_hvac",season:"spring",name:"Spring AC Tune-Up Rush",months:"Mar–May",icon:"🌸",desc:"Pre-season AC checkups and system replacements surge. Boosted placement in routing queue.",active:currentSeason==="spring"},
      {id:"summer_hvac",season:"summer",name:"Summer Emergency AC",months:"Jun–Aug",icon:"☀️",desc:"Emergency AC repair leads peak in summer heat. Priority emergency routing enabled.",active:currentSeason==="summer"},
      {id:"fall_hvac",season:"fall",name:"Fall Furnace Prep Season",months:"Sep–Nov",icon:"🍂",desc:"Heating system checkups and furnace replacements before winter. High close-rate window.",active:currentSeason==="fall"},
      {id:"winter_hvac",season:"winter",name:"Winter Heating Emergencies",months:"Dec–Feb",icon:"❄️",desc:"Furnace failures and emergency heating calls spike in cold months.",active:currentSeason==="winter"},
    ],
    Roofing:[
      {id:"spring_roof",season:"spring",name:"Spring Storm Damage Push",months:"Mar–May",icon:"🌸",desc:"Post-winter inspection and storm damage claims drive high-value roofing leads.",active:currentSeason==="spring"},
      {id:"summer_roof",season:"summer",name:"Summer Replacement Season",months:"Jun–Aug",icon:"☀️",desc:"Peak season for full roof replacements. Longer days mean faster installs.",active:currentSeason==="summer"},
      {id:"fall_roof",season:"fall",name:"Fall Roof & Gutter Season",months:"Sep–Nov",icon:"🍂",desc:"Gutter cleaning, pre-winter inspections, and storm-season prep.",active:currentSeason==="fall"},
      {id:"winter_roof",season:"winter",name:"Winter Emergency Repairs",months:"Dec–Feb",icon:"❄️",desc:"Ice damming, leak emergencies, and storm damage keep demand active.",active:currentSeason==="winter"},
    ],
    Plumbing:[
      {id:"spring_plumb",season:"spring",name:"Spring Remodel Season",months:"Mar–May",icon:"🌸",desc:"Kitchen and bathroom remodel leads surge as homeowners plan spring projects.",active:currentSeason==="spring"},
      {id:"summer_plumb",season:"summer",name:"Summer Water & Drain Push",months:"Jun–Aug",icon:"☀️",desc:"Outdoor faucets, irrigation, and slow drain issues peak in summer.",active:currentSeason==="summer"},
      {id:"fall_plumb",season:"fall",name:"Fall Drain & Water Heater",months:"Sep–Nov",icon:"🍂",desc:"Water heater replacements and pre-winter drain prep drive fall volume.",active:currentSeason==="fall"},
      {id:"winter_plumb",season:"winter",name:"Winter Pipe & Heating",months:"Dec–Feb",icon:"❄️",desc:"Frozen pipes, burst emergencies, and heating failures surge in cold months.",active:currentSeason==="winter"},
    ],
    Electrical:[
      {id:"spring_elec",season:"spring",name:"Spring Smart Home Installs",months:"Mar–May",icon:"🌸",desc:"EV charger installs and smart home upgrades spike as homeowners plan improvements.",active:currentSeason==="spring"},
      {id:"summer_elec",season:"summer",name:"Summer Panel & AC Load",months:"Jun–Aug",icon:"☀️",desc:"Panel upgrades to support new AC and high-demand appliances peak in summer.",active:currentSeason==="summer"},
      {id:"fall_elec",season:"fall",name:"Fall Safety Inspection Push",months:"Sep–Nov",icon:"🍂",desc:"Pre-winter safety inspections, panel audits, and outdoor lighting installs.",active:currentSeason==="fall"},
      {id:"winter_elec",season:"winter",name:"Winter Holiday Lighting",months:"Dec–Feb",icon:"❄️",desc:"Dedicated circuits, generator installs, and holiday lighting wiring jobs surge.",active:currentSeason==="winter"},
    ],
    "Beauty Schools":[
      {id:"spring_beauty",season:"spring",name:"Spring Enrollment Push",months:"Mar–May",icon:"🌸",desc:"High school seniors making post-graduation plans. Prime window for cosmetology and esthetics program inquiries.",active:currentSeason==="spring"},
      {id:"summer_beauty",season:"summer",name:"Summer Start Surge",months:"Jun–Aug",icon:"☀️",desc:"Biggest enrollment window of the year. Recent graduates and career changers actively seeking program starts.",active:currentSeason==="summer"},
      {id:"fall_beauty",season:"fall",name:"Fall New Cohort Season",months:"Sep–Nov",icon:"🍂",desc:"Many schools launch new cohorts in fall. Strong inquiry volume from students who missed summer start.",active:currentSeason==="fall"},
      {id:"winter_beauty",season:"winter",name:"New Year Career Changers",months:"Dec–Feb",icon:"❄️",desc:"Career change inquiries peak in January. Students setting new year goals and researching programs seriously.",active:currentSeason==="winter"},
    ],
  };
  const ind = user.industry || "HVAC";
  // Match industry to key (case-insensitive prefix match)
  const indKey = Object.keys(ALL_CAMPAIGNS).find(k=>ind.toLowerCase().startsWith(k.toLowerCase())) || "HVAC";
  const campaigns = ALL_CAMPAIGNS[indKey];

  if(!isGrowth) return(
    <div style={{background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
      <span style={{fontSize:22,flexShrink:0}}>🔒</span>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:"#A78BFA",marginBottom:3}}>Seasonal Campaign Boosts — Growth Plan</div>
        <div style={{fontSize:12,color:T.muted}}>Automatic volume increases during peak demand seasons for your industry. Upgrade to Growth to unlock.</div>
      </div>
    </div>
  );

  const activeCampaign = campaigns.find(c=>c.active);

  return(
    <div style={{background:T.surface,border:`1px solid rgba(167,139,250,0.3)`,borderRadius:12,padding:"18px 20px"}}>
      <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"#A78BFA",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>Seasonal Campaign Boosts</div>
      {activeCampaign&&(
        <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:10,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>{activeCampaign.icon}</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:T.green,marginBottom:2}}>🟢 Active Now: {activeCampaign.name}</div>
            <div style={{fontSize:12,color:T.muted}}>{activeCampaign.desc}</div>
          </div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {campaigns.map(c=>(
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:c.active?`rgba(16,185,129,0.06)`:T.surface2,borderRadius:8,border:`1px solid ${c.active?"rgba(16,185,129,0.2)":T.border}`}}>
            <span style={{fontSize:18,flexShrink:0}}>{c.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:c.active?T.green:T.offWhite,marginBottom:1}}>{c.name}</div>
              <div style={{fontSize:11,color:T.muted}}>{c.months}</div>
            </div>
            <div>
              {c.active
                ?<span style={{fontSize:10,background:"rgba(16,185,129,0.15)",color:T.green,border:"1px solid rgba(16,185,129,0.3)",borderRadius:4,padding:"2px 8px",fontWeight:600}}>ACTIVE</span>
                :<span style={{fontSize:10,background:T.surface3,color:T.muted,borderRadius:4,padding:"2px 8px"}}>{c.months}</span>
              }
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:12,fontSize:11,color:T.muted,lineHeight:1.6}}>Boosts are automatic — no action needed. During your industry's peak season, your account is moved to the front of the routing queue for that lead type. Contact your account manager to customize timing.</div>
    </div>
  );
}

function SettingsPanel({user,onSave,toast}){
  const [form,setForm]=useState({
    company:user.company||"",
    notify_email:user.notify_email||user.email||"",
    calendly_url:user.calendly_url||"",
    phone:user.phone||"",
    city:user.city||"",
  });
  const [saving,setSaving]=useState(false);
  const [billing,setBilling]=useState(null);
  const [showCancel,setShowCancel]=useState(false);
  const [cancelReason,setCancelReason]=useState("");
  const [cancelling,setCancelling]=useState(false);
  const [showPlanChange,setShowPlanChange]=useState(false);
  const [showReactivate,setShowReactivate]=useState(false);
  const [selectedPlan,setSelectedPlan]=useState(null);
  const set=k=>v=>setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    db.getBilling(user.id).then(b=>setBilling(b)).catch(()=>{});
  },[user.id]);

  const save=async()=>{
    setSaving(true);
    try{
      await db.upsertBusiness({id:user.id,...form});
      onSave({...user,...form});
      toast({message:"Settings saved",type:"success"});
    }catch(e){toast({message:"Save failed",type:"error"});}
    setSaving(false);
  };

  const requestCancel=async()=>{
    if(!cancelReason.trim()){toast({message:"Please tell us why you're cancelling",type:"error"});return;}
    setCancelling(true);
    try{
      await db.requestCancellation(user.id,cancelReason);
      setBilling(b=>({...b,cancel_requested:true,status:"cancel_pending"}));
      setShowCancel(false);
      toast({message:"Cancellation requested — you'll keep access until the end of your billing period",type:"info"});
    }catch(e){toast({message:"Request failed. Email hello@streamline.io",type:"error"});}
    setCancelling(false);
  };

  const intakeUrl=`${window.location.origin}/?industry=${(user.industry||"hvac").toLowerCase()}&bid=${user.id}`;
  const planCap=user.plan==="Growth"?50:20;
  const now=new Date();
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  const daysLeft=new Date(now.getFullYear(),now.getMonth()+1,0).getDate()-now.getDate();

  // Billing status display
  const billingStatus=billing?.status||"active";
  const statusConfig={
    active:{color:T.green,label:"Active",icon:"✅"},
    cancel_pending:{color:T.amber,label:"Cancels at period end",icon:"⏳"},
    cancelled:{color:T.red,label:"Cancelled",icon:"❌"},
    trial:{color:T.cyan,label:"Trial",icon:"🧪"},
    past_due:{color:T.red,label:"Payment past due",icon:"⚠️"},
  };
  const sc=statusConfig[billingStatus]||statusConfig.active;

  return <div style={{display:"flex",flexDirection:"column",gap:24,maxWidth:700}}>

    {/* ── Billing Status Banner ── */}
    <div style={{background:billingStatus==="active"?"rgba(16,185,129,0.06)":billingStatus==="cancel_pending"?"rgba(245,158,11,0.06)":"rgba(239,68,68,0.06)",border:`1px solid ${sc.color}30`,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:22}}>{sc.icon}</span>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:T.white,marginBottom:2}}>{user.plan||"Starter"} Plan · <span style={{color:sc.color}}>{sc.label}</span></div>
          <div style={{fontSize:12,color:T.muted}}>
            {billingStatus==="active"&&`${user.plan==="Growth"?"$499":"$299"}/mo · ${planCap} leads/month · ${daysLeft} days until next billing`}
            {billingStatus==="cancel_pending"&&"Your plan will cancel at the end of the current billing period"}
            {billingStatus==="cancelled"&&"Your plan has been cancelled. Contact us to reactivate."}
            {billingStatus==="past_due"&&"Your last payment failed. Please update your payment method."}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {billingStatus==="active"&&<button onClick={()=>setShowPlanChange(true)} style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",color:T.offWhite,fontSize:12,fontWeight:500}}>Change Plan</button>}
        {(billingStatus==="active"||billingStatus==="past_due")&&<button onClick={()=>setShowCancel(true)} style={{background:"none",border:`1px solid rgba(239,68,68,0.3)`,borderRadius:8,padding:"7px 14px",cursor:"pointer",color:T.red,fontSize:12}}>Cancel Plan</button>}
        {(billingStatus==="cancel_pending"||billingStatus==="cancelled")&&<button onClick={()=>setShowReactivate(true)} style={{background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:8,padding:"7px 14px",cursor:"pointer",color:T.green,fontSize:12,fontWeight:500}}>Re-activate Plan →</button>}
      </div>
    </div>

    {/* ── Payment Method ── */}
    <div>
      <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Payment Method</div>
      {billing?.card_last4?(
        <div style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:28,background:"linear-gradient(135deg,#1a1f2e,#2d3748)",borderRadius:5,border:`1px solid ${T.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>💳</div>
            <div>
              <div style={{fontSize:13,fontWeight:500,color:T.white}}>{billing.card_brand||"Card"} ending in {billing.card_last4}</div>
              <div style={{fontSize:11,color:T.muted}}>Expires {billing.card_exp_month}/{billing.card_exp_year}</div>
            </div>
          </div>
          <button onClick={()=>toast({message:"To update your card, contact hello@streamline.io",type:"info"})} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",color:T.muted,fontSize:12}}>Update Card</button>
        </div>
      ):(
        <div style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:12,padding:"20px 16px",textAlign:"center"}}>
          <div style={{fontSize:13,color:T.muted,marginBottom:10}}>No payment method on file — contact us to set up billing</div>
          <Btn size="sm" variant="outline" onClick={()=>toast({message:"Contact hello@streamline.io to add a payment method",type:"info"})}>Add Payment Method</Btn>
        </div>
      )}
    </div>

    <div style={{height:1,background:T.border}}/>

    {/* ── Business Profile ── */}
    <div>
      <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Business Profile</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} className="grid-1-mobile">
        <Inp label="Company Name" value={form.company} onChange={set("company")} placeholder="Apex Climate Control"/>
        <Inp label="Phone Number" value={form.phone} onChange={set("phone")} type="tel" placeholder="(614) 555-0000"/>
        <Inp label="City / Market" value={form.city} onChange={set("city")} placeholder="Columbus, OH"/>
        {/* Industry LOCKED — read only */}
        <div>
          <div style={{fontSize:12,fontWeight:500,color:T.offWhite,marginBottom:6}}>Primary Industry</div>
          <div style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,color:T.white,fontWeight:500}}>{user.industry||"HVAC"}</span>
            <span style={{fontSize:10,color:T.muted,background:T.surface3,border:`1px solid ${T.border}`,borderRadius:4,padding:"2px 7px",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.05em"}}>LOCKED</span>
          </div>
          <div style={{fontSize:11,color:T.muted,marginTop:4}}>Industry can only be changed by Streamline. Contact hello@streamline.io</div>
        </div>
        <Inp label="Notification Email" value={form.notify_email} onChange={set("notify_email")} type="email" placeholder="alerts@yourcompany.com"/>
      </div>
    </div>

    <div style={{height:1,background:T.border}}/>

    {/* ── Calendly ── */}
    <div>
      <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Calendly Link</div>
      <div style={{fontSize:12,color:T.muted,marginBottom:12}}>Qualified leads (score 50+) will see a booking option after submitting the intake form.</div>
      <Inp label="Your Calendly URL" value={form.calendly_url} onChange={set("calendly_url")} placeholder="https://calendly.com/yourname/estimate" hint="Go to calendly.com → copy your event link"/>
      {form.calendly_url&&<div style={{marginTop:10,padding:"10px 14px",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,fontSize:12,color:T.green}}>✓ Qualified leads will see a booking widget after submitting their intake form</div>}
    </div>

    <div style={{height:1,background:T.border}}/>

    {/* ── Intake URL ── */}
    <div>
      <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Your Intake Form URL</div>
      <div style={{fontSize:12,color:T.muted,marginBottom:10}}>Use this URL in your ads. Leads submitted here go directly to your account.</div>
      <div style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <code style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.blueL,flex:1,wordBreak:"break-all"}}>{intakeUrl}</code>
        <button onClick={()=>{navigator.clipboard.writeText(intakeUrl);toast({message:"Copied!",type:"success"});}} style={{background:T.blue,border:"none",borderRadius:7,padding:"7px 14px",cursor:"pointer",color:"white",fontSize:12,fontWeight:600,flexShrink:0}}>Copy</button>
      </div>
    </div>

    <Btn onClick={save} disabled={saving}>{saving?<span style={{display:"flex",alignItems:"center",gap:8}}><Spinner size={14}/>Saving…</span>:"Save Settings"}</Btn>

    {/* Growth Plan Features */}
    <div style={{height:1,background:T.border}}/>
    <div>
      <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Growth Plan Features</div>
      <div style={{fontSize:12,color:T.muted,marginBottom:14}}>{user.plan==="Growth"?"Features included with your Growth plan.":"Upgrade to Growth to unlock these features."}</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <AccountManager user={user}/>
        <SeasonalBoosts user={user} toast={toast}/>
      </div>
    </div>

    {/* ── Plan Change Modal ── */}
    <Modal open={showPlanChange} onClose={()=>{setShowPlanChange(false);setSelectedPlan(null);}} title="Change Plan">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:13,fontWeight:600,color:T.blueL,marginBottom:3}}>📅 Changes take effect at end of billing period</div>
          <div style={{fontSize:12,color:T.muted}}>You'll stay on your current plan until {new Date(new Date().getFullYear(),new Date().getMonth()+1,0).toLocaleDateString('en-US',{month:'long',day:'numeric'})}. The new plan starts on your next billing date.</div>
        </div>
        {["Starter","Growth"].map(p=>{
          const isCurrent=user.plan===p;
          const isSelected=selectedPlan===p;
          return(
            <div key={p} onClick={()=>!isCurrent&&setSelectedPlan(p)}
              style={{padding:"18px",borderRadius:12,border:`2px solid ${isCurrent?T.blue:isSelected?"rgba(16,185,129,0.6)":T.border2}`,background:isCurrent?"rgba(37,99,235,0.08)":isSelected?"rgba(16,185,129,0.06)":T.surface2,cursor:isCurrent?"default":"pointer",transition:"all 0.15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:15,fontWeight:600,color:T.white}}>{p}</div>
                  {isCurrent&&<span style={{fontSize:10,background:"rgba(37,99,235,0.2)",color:T.blueL,borderRadius:4,padding:"2px 7px",fontWeight:600}}>CURRENT</span>}
                  {isSelected&&<span style={{fontSize:10,background:"rgba(16,185,129,0.2)",color:T.green,borderRadius:4,padding:"2px 7px",fontWeight:600}}>SELECTED</span>}
                </div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:700,color:isCurrent?T.blueL:isSelected?T.green:T.offWhite}}>${p==="Starter"?"299":"499"}<span style={{fontSize:11,color:T.muted,fontWeight:400}}>/mo</span></div>
              </div>
              <div style={{fontSize:12,color:T.muted,marginBottom:8}}>{p==="Starter"?"Exclusive leads · $150 performance fee per closed job":"Exclusive leads · $100 performance fee per closed job · Priority queue · Account manager"}</div>
              {!isCurrent&&<div style={{fontSize:11,color:isSelected?T.green:T.muted}}>{isSelected?"✓ Click 'Confirm Change' below to schedule this":"Click to select"}</div>}
            </div>
          );
        })}
        <div style={{display:"flex",gap:8}}>
          <Btn variant="outline" onClick={()=>{setShowPlanChange(false);setSelectedPlan(null);}} style={{flex:1}}>Cancel</Btn>
          <Btn onClick={async()=>{
            if(!selectedPlan||selectedPlan===user.plan){toast({message:"Please select a different plan",type:"error"});return;}
            try{
              await db.upsertBusiness({id:user.id,plan:selectedPlan});
              onSave({...user,plan:selectedPlan});
              setShowPlanChange(false);setSelectedPlan(null);
              toast({message:`Plan change to ${selectedPlan} scheduled — takes effect at end of billing period`,type:"success"});
            }catch(e){toast({message:"Failed to update plan. Email hello@streamline.io",type:"error"});}
          }} disabled={!selectedPlan||selectedPlan===user.plan} style={{flex:2,opacity:(!selectedPlan||selectedPlan===user.plan)?0.5:1}}>
            {selectedPlan&&selectedPlan!==user.plan?`Confirm Change to ${selectedPlan}`:"Select a Plan Above"}
          </Btn>
        </div>
      </div>
    </Modal>

    {/* ── Re-activate Modal ── */}
    <Modal open={showReactivate} onClose={()=>{setShowReactivate(false);setSelectedPlan(null);}} title="Re-activate Your Plan">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:13,fontWeight:600,color:T.green,marginBottom:4}}>👋 Welcome back</div>
          <div style={{fontSize:12,color:T.muted}}>Re-activating restores your lead pipeline immediately. Choose the plan that works best for your current volume.</div>
        </div>
        {["Starter","Growth"].map(p=>{
          const isSelected=selectedPlan===p;
          return(
            <div key={p} onClick={()=>setSelectedPlan(p)}
              style={{padding:"18px",borderRadius:12,border:`2px solid ${isSelected?"rgba(16,185,129,0.6)":T.border2}`,background:isSelected?"rgba(16,185,129,0.06)":T.surface2,cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:15,fontWeight:600,color:T.white}}>{p}</div>
                  {p==="Growth"&&<span style={{fontSize:10,background:"rgba(37,99,235,0.15)",color:T.blueL,borderRadius:4,padding:"2px 7px",fontWeight:600}}>POPULAR</span>}
                  {isSelected&&<span style={{fontSize:10,background:"rgba(16,185,129,0.2)",color:T.green,borderRadius:4,padding:"2px 7px",fontWeight:600}}>✓ SELECTED</span>}
                </div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:700,color:isSelected?T.green:T.offWhite}}>${p==="Starter"?"299":"499"}<span style={{fontSize:11,color:T.muted,fontWeight:400}}>/mo</span></div>
              </div>
              <div style={{fontSize:12,color:T.muted}}>{p==="Starter"?"Exclusive leads · $150 performance fee per closed job":"Exclusive leads · $100 performance fee per closed job · Priority queue · Account manager"}</div>
            </div>
          );
        })}
        <div style={{display:"flex",gap:8}}>
          <Btn variant="outline" onClick={()=>{setShowReactivate(false);setSelectedPlan(null);}} style={{flex:1}}>Not Yet</Btn>
          <Btn onClick={async()=>{
            if(!selectedPlan){toast({message:"Please select a plan",type:"error"});return;}
            try{
              await db.upsertBusiness({id:user.id,plan:selectedPlan});
              await db.upsertBilling({business_id:user.id,status:"active",cancel_requested:false,cancel_reason:null,cancel_requested_at:null});
              onSave({...user,plan:selectedPlan});
              setBilling(b=>({...b,status:"active",cancel_requested:false}));
              setShowReactivate(false);setSelectedPlan(null);
              toast({message:`Welcome back! Your ${selectedPlan} plan is now active.`,type:"success"});
            }catch(e){toast({message:"Failed to re-activate. Email hello@streamline.io",type:"error"});}
          }} disabled={!selectedPlan} style={{flex:2,opacity:!selectedPlan?0.5:1}}>
            {selectedPlan?`Re-activate ${selectedPlan} Plan →`:"Select a Plan"}
          </Btn>
        </div>
        <div style={{fontSize:11,color:T.muted,textAlign:"center"}}>Secure payment via Stripe · Cancel anytime</div>
      </div>
    </Modal>

    {/* ── Cancellation Modal ── */}
    <Modal open={showCancel} onClose={()=>setShowCancel(false)} title="Cancel Your Plan">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:13,fontWeight:600,color:T.amber,marginBottom:4}}>⏳ Access until end of billing period</div>
          <div style={{fontSize:12,color:T.muted}}>You'll keep full access to your dashboard and continue receiving leads until the end of the current month. After that, your account will be deactivated.</div>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:500,color:T.offWhite,marginBottom:8}}>Why are you cancelling? <span style={{color:T.red}}>*</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
            {["Lead quality wasn't what I expected","Too expensive for my budget","Not enough leads in my area","Switching to a different service","Business is slowing down","Other"].map(r=>(
              <button key={r} onClick={()=>setCancelReason(r)} style={{padding:"9px 12px",borderRadius:8,border:`1px solid ${cancelReason===r?T.red:T.border2}`,background:cancelReason===r?"rgba(239,68,68,0.08)":"none",color:cancelReason===r?"#F87171":T.offWhite,cursor:"pointer",fontSize:13,textAlign:"left",transition:"all 0.15s"}}>
                {cancelReason===r?"● ":"○ "}{r}
              </button>
            ))}
          </div>
          <textarea value={cancelReason.startsWith("Other")||!["Lead quality wasn't what I expected","Too expensive for my budget","Not enough leads in my area","Switching to a different service","Business is slowing down","Other"].includes(cancelReason)?cancelReason:""} onChange={e=>setCancelReason(e.target.value)} placeholder="Tell us more (optional)…" style={{width:"100%",background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 12px",color:T.white,fontSize:13,outline:"none",minHeight:60,resize:"vertical",fontFamily:"inherit"}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="outline" onClick={()=>setShowCancel(false)} style={{flex:1}}>Keep My Plan</Btn>
          <Btn variant="danger" onClick={requestCancel} disabled={cancelling||!cancelReason} style={{flex:1}}>
            {cancelling?<span style={{display:"flex",alignItems:"center",gap:8}}><Spinner size={13}/>Processing…</span>:"Confirm Cancellation"}
          </Btn>
        </div>
      </div>
    </Modal>
  </div>;
}

// Analytics View
function AnalyticsView({leads, user}){
  const total=leads.length;
  const won=leads.filter(l=>l.status==="won").length;
  const lost=leads.filter(l=>l.status==="lost").length;
  const active=leads.filter(l=>l.status==="new"||l.status==="contacted").length;
  const closeRate=total>0?Math.round((won/total)*100):0;
  const isGrowth=user?.plan==="Growth";
  const avgScore=total>0?Math.round(leads.reduce((s,l)=>s+l.score,0)/total):0;
  const hotLeads=leads.filter(l=>l.tier==="hot");
  const warmLeads=leads.filter(l=>l.tier==="warm");
  const coldLeads=leads.filter(l=>l.tier==="cold");
  const hotCloseRate=hotLeads.length>0?Math.round((hotLeads.filter(l=>l.status==="won").length/hotLeads.length)*100):0;
  const sc={new:leads.filter(l=>l.status==="new").length,contacted:leads.filter(l=>l.status==="contacted").length,won,lost};
  const totalRevenue=leads.filter(l=>l.status==="won").reduce((sum,l)=>{
    const r=l.estimate_range||"";const m=r.match(/\$([0-9,]+)/g);
    if(m&&m.length>=2){const avg=(parseInt(m[0].replace(/[$,]/g,""))+parseInt(m[1].replace(/[$,]/g,"")))/2;return sum+avg;}
    return sum;
  },0);
  const perfFee=won*(50); // simplified
  const budgetDist={"under_500":0,"500_1000":0,"1000_2000":0,"2000_5000":0,"5000_plus":0};
  leads.forEach(l=>{if(l.budget&&budgetDist[l.budget]!==undefined)budgetDist[l.budget]++;});
  const urgencyDist={"emergency":0,"this_week":0,"flexible":0};
  leads.forEach(l=>{if(l.urgency&&urgencyDist[l.urgency]!==undefined)urgencyDist[l.urgency]++;});

  // Group leads by week for trend
  const byWeek={};
  leads.forEach(l=>{
    const d=new Date(l.created_at);
    const week=`${d.getFullYear()}-W${Math.ceil(d.getDate()/7)}`;
    if(!byWeek[week])byWeek[week]={week,total:0,won:0};
    byWeek[week].total++;
    if(l.status==="won")byWeek[week].won++;
  });
  const weekData=Object.values(byWeek).slice(-8);

  const MCard=({label,value,sub,color,large})=><Card style={{padding:"18px 20px"}}>
    <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{label}</div>
    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:large?48:36,color:color||T.white,letterSpacing:-2,lineHeight:1,marginBottom:4}}>{value}</div>
    {sub&&<div style={{fontSize:12,color:T.muted}}>{sub}</div>}
  </Card>;

  const Bar=({label,count,max,color})=><div style={{marginBottom:10}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
      <span style={{fontSize:12,color:T.offWhite}}>{label}</span>
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:color||T.muted}}>{count}</span>
    </div>
    <div style={{height:6,background:T.border,borderRadius:3,overflow:"hidden"}}>
      <div style={{width:max>0?`${(count/max)*100}%`:"0%",height:"100%",background:color||T.blueL,borderRadius:3,transition:"width 0.8s ease"}}/>
    </div>
  </div>;

  return <div style={{animation:"fadeIn 0.3s ease"}}>
    <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:20}}>
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(22px,3vw,28px)",letterSpacing:-1}}>Analytics</h2>
      <span style={{fontSize:12,color:T.muted}}>All time · {total} leads</span>
    </div>

    {/* CRM Export — Growth feature */}
    {user&&<div style={{marginBottom:20}}><CRMExport leads={leads} user={user} toast={()=>{}}/></div>}

    {/* Top KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}} className="grid-2-mobile">
      <MCard label="Close Rate" value={`${closeRate}%`} sub={`${won} won / ${total} total`} color={T.green} large/>
      <MCard label="Avg Lead Score" value={avgScore} sub="Out of 100" color={T.amber} large/>
      <MCard label="Est. Revenue" value={`$${Math.round(totalRevenue/1000)}k`} sub="From won leads" color={T.cyan} large/>
      <MCard label="Hot Close Rate" value={`${hotCloseRate}%`} sub={`${hotLeads.length} hot leads`} color={T.red} large/>
    </div>

    {/* Pipeline + Quality row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}} className="grid-1-mobile">
      <Card>
        <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Pipeline Status</div>
        {[{label:"New",color:T.blueL,count:sc.new},{label:"Contacted",color:T.amber,count:sc.contacted},{label:"Won",color:T.green,count:sc.won},{label:"Lost",color:T.red,count:sc.lost}].map(r=><Bar key={r.label} label={r.label} count={r.count} max={total} color={r.color}/>)}
      </Card>
      <Card>
        <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Lead Quality Tiers</div>
        {[{label:`🔥 Hot (75+)`,color:T.green,count:hotLeads.length},{label:`☀️ Warm (50–74)`,color:T.amber,count:warmLeads.length},{label:`❄️ Cold (<50)`,color:T.muted,count:coldLeads.length}].map(r=><Bar key={r.label} label={r.label} count={r.count} max={total} color={r.color}/>)}
        <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:6}}>Hot lead close rate vs overall</div>
          <div style={{display:"flex",gap:12}}>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,color:T.green,fontWeight:700}}>{hotCloseRate}%</div><div style={{fontSize:10,color:T.muted}}>Hot</div></div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,color:T.amber,fontWeight:700}}>{closeRate}%</div><div style={{fontSize:10,color:T.muted}}>Overall</div></div>
          </div>
        </div>
      </Card>
      <Card>
        <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Urgency Breakdown</div>
        {[{label:"🚨 Emergency",key:"emergency",color:T.red},{label:"📅 This Week",key:"this_week",color:T.amber},{label:"🗓️ Flexible",key:"flexible",color:T.muted}].map(r=><Bar key={r.key} label={r.label} count={urgencyDist[r.key]} max={total} color={r.color}/>)}
        <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`,fontSize:11,color:T.muted}}>Emergency leads score 20pts on urgency — highest priority</div>
      </Card>
    </div>

    {/* Budget + Weekly trend row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}} className="grid-1-mobile">
      <Card>
        <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Budget Distribution</div>
        {[{label:"Under $500",key:"under_500"},{label:"$500–$1,000",key:"500_1000"},{label:"$1,000–$2,000",key:"1000_2000"},{label:"$2,000–$5,000",key:"2000_5000"},{label:"$5,000+",key:"5000_plus"}].map(r=>(
          <div key={r.key} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:T.offWhite}}>{r.label}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>{budgetDist[r.key]}</span>
            </div>
            <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden"}}>
              <div style={{width:total>0?`${(budgetDist[r.key]/total)*100}%`:"0%",height:"100%",background:`linear-gradient(90deg,${T.blue},${T.blueL})`,borderRadius:3,transition:"width 0.8s ease"}}/>
            </div>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Weekly Lead Volume</div>
        {weekData.length===0
          ?<div style={{color:T.muted,fontSize:13,padding:"20px 0",textAlign:"center"}}>No weekly data yet</div>
          :<div style={{display:"flex",alignItems:"flex-end",gap:6,height:100}}>
            {weekData.map((w,i)=>{
              const maxTotal=Math.max(...weekData.map(x=>x.total),1);
              const h=Math.round((w.total/maxTotal)*100);
              return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:9,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{w.total}</div>
                <div style={{width:"100%",background:`linear-gradient(180deg,${T.blue},${T.blueL})`,borderRadius:"3px 3px 0 0",height:`${h}%`,minHeight:3,transition:"height 0.8s ease",position:"relative"}}>
                  {w.won>0&&<div style={{position:"absolute",top:0,left:0,right:0,height:`${Math.round((w.won/w.total)*100)}%`,background:`linear-gradient(180deg,${T.green},${T.green}90)`,borderRadius:"3px 3px 0 0"}}/>}
                </div>
                <div style={{fontSize:8,color:T.muted,fontFamily:"'JetBrains Mono',monospace",whiteSpace:"nowrap"}}>W{i+1}</div>
              </div>;
            })}
          </div>
        }
        <div style={{marginTop:10,display:"flex",gap:14,fontSize:10,color:T.muted}}>
          <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:T.blue,flexShrink:0}}/>Total</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:T.green,flexShrink:0}}/>Won</span>
        </div>
      </Card>
    </div>

    {/* Revenue + Performance fee */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}} className="grid-1-mobile">
      <Card>
        <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Est. Job Revenue Won</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,color:T.green,letterSpacing:-1,lineHeight:1,marginBottom:4}}>${Math.round(totalRevenue).toLocaleString()}</div>
        <div style={{fontSize:12,color:T.muted}}>Based on avg of estimate ranges</div>
      </Card>
      <Card>
        <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Avg Days to Close</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,color:T.amber,letterSpacing:-1,lineHeight:1,marginBottom:4}}>{leads.filter(l=>l.status==="won").length>0?"3.2":"—"}</div>
        <div style={{fontSize:12,color:T.muted}}>From lead to marked Won</div>
      </Card>
      <Card>
        <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Contact Rate</div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,color:T.blueL,letterSpacing:-1,lineHeight:1,marginBottom:4}}>{total>0?Math.round(((sc.contacted+sc.won+sc.lost)/total)*100):0}%</div>
        <div style={{fontSize:12,color:T.muted}}>Leads moved past "New"</div>
      </Card>
    </div>
  </div>;
}

function Dashboard({user,onLogout}){
  const [leads,setLeads]=useState([]);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("pipeline");
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("date");
  const [selected,setSelected]=useState(null);
  const [toastMsg,setToastMsg]=useState(null);
  const [search,setSearch]=useState("");
  const [showNotifs,setShowNotifs]=useState(false);
  const [unread,setUnread]=useState(0);
  const [currentUser,setCurrentUser]=useState(user);
  const [tierFilter,setTierFilter]=useState("all");

  const showToast=(t)=>setToastMsg(t);

  const loadLeads=useCallback(async()=>{
    try{const d=await db.getLeads(currentUser.id);setLeads(d);}catch(e){console.error(e);}
    setLoading(false);
  },[currentUser.id]);
  const loadUnread=useCallback(async()=>{
    const n=await db.getNotifications(currentUser.id);
    setUnread(n.filter(x=>!x.read).length);
  },[currentUser.id]);

  useEffect(()=>{
    loadLeads();loadUnread();
    const ch=db.subscribeToLeads(currentUser.id,(nl)=>{
      setLeads(p=>[nl,...p]);
      showToast({message:`🔥 New ${nl.tier} lead: ${nl.name}`,type:"success"});
      loadUnread();
    });
    return()=>sb.removeChannel(ch);
  },[currentUser.id]);

  const updateStatus=async(id,status,extra={})=>{
    try{
      await db.updateLeadStatus(id,status,extra);
      setLeads(p=>p.map(l=>l.id===id?{...l,status}:l));
      showToast({message:`Lead marked as ${status}`,type:status==="won"?"success":"info"});
    }catch(e){showToast({message:"Failed to update",type:"error"});}
  };

  const filtered=leads
    .filter(l=>filter==="all"||l.status===filter)
    .filter(l=>tierFilter==="all"||l.tier===tierFilter)
    .filter(l=>!search||l.name?.toLowerCase().includes(search.toLowerCase())||l.issue_type?.toLowerCase().includes(search.toLowerCase())||l.zip_code?.includes(search))
    .sort((a,b)=>sort==="score"?b.score-a.score:sort==="name"?a.name?.localeCompare(b.name):new Date(b.created_at)-new Date(a.created_at));

  const total=leads.length,won=leads.filter(l=>l.status==="won").length;
  const active=leads.filter(l=>l.status==="new"||l.status==="contacted").length;
  const avgScore=total>0?Math.round(leads.reduce((s,l)=>s+l.score,0)/total):0;
  const sc={new:leads.filter(l=>l.status==="new").length,contacted:leads.filter(l=>l.status==="contacted").length,won,lost:leads.filter(l=>l.status==="lost").length};
  const hotCount=leads.filter(l=>l.tier==="hot").length;

  const TABS=[{id:"pipeline",label:"Pipeline",icon:"⚡"},{id:"analytics",label:"Analytics",icon:"📊"},{id:"earnings",label:"Earnings",icon:"💰"},{id:"goals",label:"Goals",icon:"🎯"},{id:"market",label:"Market Data",icon:"🌐"},{id:"industry",label:"Industry",icon:"📈"},{id:"advisor",label:"AI Advisor",icon:"✦"},{id:"photos",label:"Photos",icon:"📷"},{id:"referrals",label:"Referrals",icon:"🤝"},{id:"replay",label:"Lead Replay",icon:"↺"},{id:"resources",label:"Resources",icon:"📚"},{id:"settings",label:"Settings",icon:"⚙️"}];

  return <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",width:"100%"}}>
    {/* NAV */}
    <nav style={{height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",borderBottom:`1px solid ${T.border}`,background:"rgba(9,12,17,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100,flexShrink:0,width:"100%"}}>
      <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer"}} title="Back to homepage">
        <LogoMark size={26}/>
        <span style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.white}}>Streamline</span>
      </button>
      <div style={{display:"flex",alignItems:"center",gap:2}}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setView(tab.id)} style={{background:view===tab.id?T.surface2:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:500,padding:"6px 13px",borderRadius:7,color:view===tab.id?T.white:T.muted,transition:"all 0.2s",display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:12}}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={()=>setShowNotifs(true)} style={{position:"relative",background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:17,padding:6,borderRadius:7,display:"flex",alignItems:"center"}}>
          🔔{unread>0&&<div style={{position:"absolute",top:0,right:0,width:14,height:14,borderRadius:"50%",background:T.red,fontSize:8,fontWeight:700,color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</div>}
        </button>
        <button onClick={()=>setView("settings")} title="Go to Settings" style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:"4px 6px",borderRadius:8,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background="none"}>
          <div style={{width:28,height:28,borderRadius:"50%",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{currentUser.company?.[0]||currentUser.email?.[0]?.toUpperCase()||"U"}</div>
          <div className="hide-mobile">
            <div style={{fontSize:12,fontWeight:500,color:T.white,lineHeight:1.2}}>{currentUser.company||"My Business"}</div>
            <div style={{fontSize:10,color:T.muted}}>{currentUser.plan||"Starter"} plan</div>
          </div>
        </button>
        <Btn variant="outline" size="sm" onClick={onLogout} style={{fontSize:12,padding:"6px 10px"}}>Sign Out</Btn>
      </div>
    </nav>

    <div style={{flex:1,padding:"20px 24px",width:"100%",maxWidth:1400,margin:"0 auto"}}>
      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,gap:12}}><Spinner/><span style={{color:T.muted,fontSize:14}}>Loading your pipeline…</span></div>
      ):view==="pipeline"?(
        <div style={{animation:"fadeIn 0.3s ease"}}>
          {/* Top stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}} className="grid-2-mobile">
            {[
              {label:"Total Leads",value:total,color:T.blueL,icon:"📋"},
              {label:"Active",value:active,color:T.cyan,icon:"⚡"},
              {label:"Hot Leads",value:hotCount,color:T.red,icon:"🔥"},
              {label:"Won",value:won,color:T.green,icon:"✅"},
              {label:"Avg Score",value:avgScore,color:T.amber,icon:"⭐"},
            ].map(s=>(
              <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 16px"}}>
                <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:s.color,marginBottom:2}}>{s.value}</div>
                <div style={{fontSize:11,color:T.muted}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Live Lead Preview — top new/hot lead */}
          {leads.filter(l=>l.status==="new").length>0&&(()=>{
            const preview=[...leads].filter(l=>l.status==="new").sort((a,b)=>b.score-a.score)[0];
            const BL={budget:"Budget",urgency:"Urgency",ownership:"Ownership",size:"Property Size",clarity:"Issue Clarity",contact:"Contact Quality"};
            const MX={budget:20,urgency:20,ownership:15,size:15,clarity:15,contact:15};
            const bd=typeof preview.breakdown==="string"?JSON.parse(preview.breakdown||"{}"):preview.breakdown||{};
            return(
              <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,marginBottom:14,overflow:"hidden",cursor:"pointer"}} onClick={()=>setSelected(preview)}>
                <div style={{padding:"10px 16px",borderBottom:`1px solid ${T.border}`,background:T.surface2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:T.green,animation:"pulse 2s infinite"}}/>
                    <span style={{fontSize:12,fontWeight:600}}>Latest Lead</span>
                    <Pill color={preview.tier}>{preview.tier}</Pill>
                  </div>
                  <span style={{fontSize:11,color:T.muted}}>Click to open full details →</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:0}}>
                  <div style={{padding:"14px 16px"}}>
                    <div style={{fontSize:15,fontWeight:700,marginBottom:2,color:T.white}}>{preview.name}</div>
                    <div style={{fontSize:12,color:T.muted,marginBottom:12}}>{preview.is_name||preview.issue_type} · {preview.zip_code}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:7}}>
                      {Object.entries(bd).slice(0,4).map(([k,v])=>{
                        const max=MX[k]||15;const pct=(v/max)*100;const c=pct>=75?T.green:pct>=40?T.amber:T.red;
                        return <div key={k}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                            <span style={{color:T.muted}}>{BL[k]||k}</span>
                            <span style={{color:c,fontFamily:"'JetBrains Mono',monospace"}}>{v}/{max}</span>
                          </div>
                          <div style={{height:3,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:c,transition:"width 0.5s ease",borderRadius:2}}/></div>
                        </div>;
                      })}
                    </div>
                    {preview.estimate_range&&<div style={{marginTop:12,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:7,padding:"6px 10px",fontSize:11,color:T.green}}>Est: {preview.estimate_range} · Ready to contact</div>}
                  </div>
                  <div style={{padding:"14px 16px",borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:80}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:36,fontWeight:700,color:preview.tier==="hot"?T.green:preview.tier==="warm"?T.amber:T.muted,lineHeight:1}}>{preview.score}</div>
                    <div style={{fontSize:10,color:T.muted,marginTop:3}}>/ 100</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Monthly performance summary */}
          {(()=>{
            const now=new Date();
            const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
            const monthName=now.toLocaleString("default",{month:"long"});
            const monthLeads=leads.filter(l=>new Date(l.created_at)>=monthStart);
            const monthWon=monthLeads.filter(l=>l.status==="won").length;
            const monthContacted=monthLeads.filter(l=>l.status==="contacted"||l.status==="won").length;
            const monthAvgScore=monthLeads.length>0?Math.round(monthLeads.reduce((s,l)=>s+(l.score||0),0)/monthLeads.length):0;
            const monthCloseRate=monthLeads.length>0?Math.round((monthWon/monthLeads.length)*100):0;
            const contactRate=monthLeads.length>0?Math.round((monthContacted/monthLeads.length)*100):0;
            return <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,marginBottom:14,overflow:"hidden",width:"100%",display:"grid",gridTemplateColumns:"120px repeat(6,1fr)"}}>
              <div style={{padding:"16px 20px",borderRight:`1px solid ${T.border}`,display:"flex",alignItems:"center",background:T.surface2}}>
                <span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.07em",whiteSpace:"nowrap"}}>{monthName.toUpperCase()}</span>
              </div>
              {[
                {label:"New Leads",value:monthLeads.length,color:T.blueL},
                {label:"Contacted",value:monthContacted,color:T.cyan},
                {label:"Won",value:monthWon,color:T.green},
                {label:"Close Rate",value:`${monthCloseRate}%`,color:T.green},
                {label:"Contact Rate",value:`${contactRate}%`,color:T.amber},
                {label:"Avg Score",value:monthAvgScore,color:T.amber},
              ].map((s,i)=>(
                <div key={s.label} style={{padding:"14px 16px",borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",justifyContent:"center"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:s.color,lineHeight:1}}>{s.value}</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:4,whiteSpace:"nowrap"}}>{s.label}</div>
                </div>
              ))}
            </div>;
          })()}
          {/* Filters row */}
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{position:"relative",flex:1,minWidth:180}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, issue, zip…" style={{width:"100%",background:T.surface,border:`1px solid ${T.border2}`,borderRadius:8,padding:"9px 12px 9px 32px",color:T.white,fontSize:13,outline:"none"}}/>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:12}}>🔍</span>
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {["all","new","contacted","won","lost"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 10px",borderRadius:7,border:`1px solid ${filter===f?T.blue:T.border2}`,background:filter===f?"rgba(37,99,235,0.15)":"none",color:filter===f?T.blueL:T.muted,cursor:"pointer",fontSize:12,fontWeight:500,transition:"all 0.15s"}}>
                  {f.charAt(0).toUpperCase()+f.slice(1)} <span style={{opacity:0.5,fontSize:10}}>{f==="all"?total:sc[f]}</span>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:4}}>
              {["all","hot","warm","cold"].map(t=>(
                <button key={t} onClick={()=>setTierFilter(t)} style={{padding:"6px 10px",borderRadius:7,border:`1px solid ${tierFilter===t?(t==="hot"?T.red:t==="warm"?T.amber:t==="cold"?T.muted:T.blue):T.border2}`,background:tierFilter===t?"rgba(37,99,235,0.1)":"none",color:tierFilter===t?T.white:T.muted,cursor:"pointer",fontSize:12,fontWeight:500}}>
                  {t==="hot"?"🔥":t==="warm"?"☀️":t==="cold"?"❄️":"All"} {t!=="all"&&t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:8,padding:"8px 10px",color:T.offWhite,fontSize:12,cursor:"pointer",outline:"none"}}>
              <option value="date">Newest First</option>
              <option value="score">Highest Score</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {/* Desktop table */}
          <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}} className="hide-mobile">
            <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1fr 1fr 1.4fr 70px 90px 110px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
              {["Lead","Issue","Budget","Zip","Score","Tier","Status",""].map(h=><div key={h}>{h}</div>)}
            </div>
            {filtered.length===0?(
              <div style={{padding:56,textAlign:"center",color:T.muted}}>
                <div style={{fontSize:32,marginBottom:12}}>📭</div>
                <div style={{fontSize:15,color:T.offWhite,marginBottom:6}}>No leads yet</div>
                <div style={{fontSize:13}}>Share your intake form URL to start receiving qualified leads in real-time.</div>
                <div style={{marginTop:16}}><Btn variant="outline" size="sm" onClick={()=>setView("settings")}>View my intake URL →</Btn></div>
              </div>
            ):filtered.map((lead,i)=>(
              <div key={lead.id} onClick={()=>setSelected(lead)}
                style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1fr 1fr 1.4fr 70px 90px 110px",padding:"12px 16px",borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.surface2}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:1}}>{lead.name}</div>
                  <div style={{fontSize:11,color:T.muted}}>{lead.phone} · {new Date(lead.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{fontSize:12,color:T.offWhite,alignSelf:"center"}}>{lead.is_name||lead.issue_type}</div>
                <div style={{fontSize:12,color:T.offWhite,alignSelf:"center",textTransform:"capitalize"}}>{lead.budget?.replace(/_/g," ")}</div>
                <div style={{fontSize:12,color:T.offWhite,alignSelf:"center"}}>{lead.zip_code||"—"}</div>
                <div style={{alignSelf:"center"}}><ScoreBar score={lead.score}/></div>
                <div style={{alignSelf:"center"}}><Pill color={lead.tier}>{lead.tier}</Pill></div>
                <div style={{alignSelf:"center"}}><Pill color={lead.status}>{lead.status}</Pill></div>
                <div style={{alignSelf:"center",display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                  {lead.status==="new"&&<button title="Mark Contacted" onClick={()=>updateStatus(lead.id,"contacted")} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:5,padding:"4px 7px",cursor:"pointer",color:T.muted,fontSize:12}}>📞</button>}
                  {lead.status!=="won"&&lead.status!=="lost"&&<>
                    <button title="Mark Won" onClick={()=>setSelected(lead)} style={{background:"none",border:"1px solid rgba(16,185,129,0.3)",borderRadius:5,padding:"4px 7px",cursor:"pointer",color:T.green,fontSize:12}}>✓</button>
                    <button title="Mark Lost" onClick={()=>updateStatus(lead.id,"lost")} style={{background:"none",border:"1px solid rgba(239,68,68,0.3)",borderRadius:5,padding:"4px 7px",cursor:"pointer",color:T.red,fontSize:12}}>✗</button>
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
                  <div>
                    <div style={{fontSize:14,fontWeight:600}}>{lead.name}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:1}}>{lead.is_name||lead.issue_type} · {lead.zip_code}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:lead.tier==="hot"?T.green:lead.tier==="warm"?T.amber:T.muted}}>{lead.score}</div>
                    <div style={{fontSize:10,color:T.muted}}>score</div>
                  </div>
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
      ):view==="analytics"?(
        <AnalyticsView leads={leads} user={currentUser}/>
      ):view==="earnings"?(
        <EarningsView leads={leads} user={currentUser}/>
      ):view==="goals"?(
        <GoalsView leads={leads} user={currentUser} toast={showToast}/>
      ):view==="market"?(
        <MarketIntelligenceView user={currentUser}/>
      ):view==="industry"?(
        <IndustryInsightsView user={currentUser}/>
      ):view==="advisor"?(
        <AIAdvisorView user={currentUser} leads={leads}/>
      ):view==="photos"?(
        <JobPhotoGallery user={currentUser} leads={leads} toast={showToast}/>
      ):view==="referrals"?(
        <ReferralView user={currentUser} toast={showToast}/>
      ):view==="replay"?(
        <LeadReplayView user={currentUser} leads={leads} toast={showToast}/>
      ):view==="resources"?(
        <ResourcesView user={currentUser}/>
      ):(
        <div style={{animation:"fadeIn 0.3s ease"}}>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Settings</h2>
          <p style={{color:T.muted,fontSize:13,marginBottom:24}}>Manage your business profile, intake URL, Calendly link, and plan.</p>
          <SettingsPanel user={currentUser} onSave={u=>setCurrentUser(u)} toast={showToast}/>
        </div>
      )}
    </div>

    <LeadDetail lead={selected} onClose={()=>setSelected(null)} onStatusChange={(id,s,extra={})=>{updateStatus(id,s,extra);setSelected(null);}} calendlyUrl={currentUser.calendly_url}/>
    {toastMsg&&<Toast message={toastMsg.message} type={toastMsg.type} onDone={()=>setToastMsg(null)}/>}
    <Modal open={showNotifs} onClose={()=>{setShowNotifs(false);setUnread(0);}} title="Notifications">
      <NotificationsPanel userId={currentUser.id}/>
    </Modal>
  </div>;
}

// ─── CONTRACTOR APPLICATION FORM ──────────────────────────────────────────────
const ADMIN_NOTIFY_EMAIL = "admin@streamline.io"; // change to your real email

function ContractorApplicationForm({onBack}){
  const [step,setStep]=useState(0);
  const [submitting,setSubmitting]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");
  const [form,setForm]=useState({
    // Step 0 — Business basics
    contact_name:"",company:"",email:"",phone:"",city:"",website:"",
    // Step 1 — Trade + experience
    industry:"",other_industry:"",years_in_business:"",team_size:"",
    // Step 2 — Current situation
    current_lead_sources:[],monthly_revenue:"",
    // Step 3 — Fit + motivation
    why_interested:"",social_instagram:"",social_facebook:"",social_other:"",
  });
  const set=k=>v=>setForm(f=>({...f,[k]:v}));
  const toggleSource=s=>setForm(f=>({...f,current_lead_sources:
    f.current_lead_sources.includes(s)
      ?f.current_lead_sources.filter(x=>x!==s)
      :[...f.current_lead_sources,s]
  }));

  const LEAD_SOURCES=["HomeAdvisor","Angi","Thumbtack","Bark.com","Google Ads","Facebook Ads","Referrals","Door knocking","Yard signs","Nextdoor","Yelp","Other"];
  const INDUSTRIES=["HVAC","Roofing","Plumbing","Electrical","Beauty Schools","Landscaping"];
  const REVENUE_BANDS=["$0–$5k/mo","$5k–$10k/mo","$10k–$25k/mo","$25k–$50k/mo","$50k–$100k/mo","$100k+/mo","Prefer not to say"];
  const TEAM_SIZES=["Just me","2–5","6–10","11–25","25+"];
  const YEARS=["Less than 1 year","1–3 years","3–5 years","5–10 years","10+ years"];

  const STEPS=[
    {
      title:"Tell us about your business",
      sub:"Basic info so we can look you up and reach out",
      valid:form.contact_name.trim().length>1&&form.company.trim().length>1&&form.email.includes("@")&&form.phone.replace(/\D/g,"").length>=10&&form.city.trim().length>1,
      body:<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} className="grid-1-mobile">
          <Inp label="Your Name" value={form.contact_name} onChange={set("contact_name")} placeholder="Mike Reynolds" required/>
          <Inp label="Company Name" value={form.company} onChange={set("company")} placeholder="Apex Climate Control" required/>
          <Inp label="Email Address" value={form.email} onChange={set("email")} type="email" placeholder="mike@apexclimate.com" required/>
          <Inp label="Phone Number" value={form.phone} onChange={set("phone")} type="tel" placeholder="(614) 555-0000" required/>
          <Inp label="City / Market" value={form.city} onChange={set("city")} placeholder="Columbus, OH" required/>
          <Inp label="Website (optional)" value={form.website} onChange={set("website")} placeholder="https://apexclimate.com"/>
        </div>
      </div>
    },
    {
      title:"Your trade & experience",
      sub:"Help us understand your business scope",
      valid:!!form.industry&&!!form.years_in_business&&!!form.team_size,
      body:<div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div>
          <div style={{fontSize:13,fontWeight:500,color:T.offWhite,marginBottom:10}}>Primary Trade <span style={{color:T.red}}>*</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}} className="grid-2-mobile">
            {INDUSTRIES.map(ind=>(
              <button key={ind} onClick={()=>set("industry")(ind)} style={{padding:"12px 8px",borderRadius:10,border:`2px solid ${form.industry===ind?T.blue:T.border2}`,background:form.industry===ind?"rgba(37,99,235,0.12)":T.surface2,color:form.industry===ind?T.white:T.offWhite,cursor:"pointer",fontSize:13,fontWeight:form.industry===ind?600:400,transition:"all 0.15s",touchAction:"manipulation"}}>
                {ind==="HVAC"?"🌬️":ind==="Roofing"?"🏠":ind==="Plumbing"?"🔧":ind==="Electrical"?"⚡":ind==="Landscaping"?"🌿":ind==="Beauty Schools"?"💅":"🔨"} {ind}
              </button>
            ))}
          </div>

        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} className="grid-1-mobile">
          <div>
            <div style={{fontSize:13,fontWeight:500,color:T.offWhite,marginBottom:8}}>Years in Business <span style={{color:T.red}}>*</span></div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {YEARS.map(y=>(
                <button key={y} onClick={()=>set("years_in_business")(y)} style={{padding:"10px 14px",borderRadius:8,border:`1px solid ${form.years_in_business===y?T.blue:T.border2}`,background:form.years_in_business===y?"rgba(37,99,235,0.12)":"none",color:form.years_in_business===y?T.white:T.offWhite,cursor:"pointer",fontSize:13,textAlign:"left",transition:"all 0.15s"}}>
                  {form.years_in_business===y?"● ":"○ "}{y}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:500,color:T.offWhite,marginBottom:8}}>Team Size <span style={{color:T.red}}>*</span></div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {TEAM_SIZES.map(t=>(
                <button key={t} onClick={()=>set("team_size")(t)} style={{padding:"10px 14px",borderRadius:8,border:`1px solid ${form.team_size===t?T.blue:T.border2}`,background:form.team_size===t?"rgba(37,99,235,0.12)":"none",color:form.team_size===t?T.white:T.offWhite,cursor:"pointer",fontSize:13,textAlign:"left",transition:"all 0.15s"}}>
                  {form.team_size===t?"● ":"○ "}{t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    },
    {
      title:"Where do your leads come from?",
      sub:"Select all current sources — be honest, this helps us show the gap",
      valid:form.current_lead_sources.length>0&&!!form.monthly_revenue,
      body:<div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div>
          <div style={{fontSize:13,fontWeight:500,color:T.offWhite,marginBottom:10}}>Current Lead Sources <span style={{color:T.red}}>*</span> <span style={{fontSize:11,color:T.muted}}>(select all that apply)</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}} className="grid-2-mobile">
            {LEAD_SOURCES.map(s=>{
              const active=form.current_lead_sources.includes(s);
              return <button key={s} onClick={()=>toggleSource(s)} style={{padding:"10px 12px",borderRadius:8,border:`1px solid ${active?T.blue:T.border2}`,background:active?"rgba(37,99,235,0.12)":T.surface2,color:active?T.white:T.offWhite,cursor:"pointer",fontSize:12,textAlign:"left",transition:"all 0.15s",display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:14,height:14,borderRadius:3,border:`1px solid ${active?T.blue:T.border2}`,background:active?T.blue:"none",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"white"}}>{active&&"✓"}</div>
                {s}
              </button>;
            })}
          </div>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:500,color:T.offWhite,marginBottom:8}}>Monthly Revenue Range <span style={{color:T.red}}>*</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}} className="grid-2-mobile">
            {REVENUE_BANDS.map(r=>(
              <button key={r} onClick={()=>set("monthly_revenue")(r)} style={{padding:"10px 12px",borderRadius:8,border:`1px solid ${form.monthly_revenue===r?T.blue:T.border2}`,background:form.monthly_revenue===r?"rgba(37,99,235,0.12)":"none",color:form.monthly_revenue===r?T.white:T.offWhite,cursor:"pointer",fontSize:12,textAlign:"left",transition:"all 0.15s"}}>
                {form.monthly_revenue===r?"● ":"○ "}{r}
              </button>
            ))}
          </div>
        </div>
      </div>
    },
    {
      title:"Why Streamline?",
      sub:"Tell us what you're looking to get out of this — helps us qualify the fit",
      valid:form.why_interested.trim().length>=150,
      body:<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <Inp label="What's your biggest challenge with lead generation right now, and what made you reach out to Streamline?" value={form.why_interested} onChange={set("why_interested")} type="textarea" placeholder="e.g. We're spending $800/month on HomeAdvisor and closing maybe 1 in 10 leads. Half the time we're racing against 4 other contractors for the same job…" required hint="Be specific — this helps us tailor our pitch to your situation"/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:11}}>
            <span style={{color:form.why_interested.trim().length>=150?T.green:T.amber}}>
              {form.why_interested.trim().length>=150?"✓ Minimum met":"Minimum 150 characters required"}
            </span>
            <span style={{color:form.why_interested.trim().length>=150?T.green:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>
              {form.why_interested.trim().length}/150
            </span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} className="grid-1-mobile">
          <Inp label="Instagram (optional)" value={form.social_instagram} onChange={set("social_instagram")} placeholder="@apexclimate"/>
          <Inp label="Facebook (optional)" value={form.social_facebook} onChange={set("social_facebook")} placeholder="facebook.com/apexclimate"/>
        </div>
        <Inp label="Other social / Google Business / Yelp (optional)" value={form.social_other} onChange={set("social_other")} placeholder="Any other online presence"/>
      </div>
    },
  ];

  const cur=STEPS[step];
  const progress=((step)/STEPS.length)*100;

  const handleSubmit=async()=>{
    setSubmitting(true);setError("");
    try{
      const application={
        contact_name:form.contact_name,
        company:form.company,
        email:form.email,
        phone:form.phone,
        city:form.city,
        website:form.website,
        industry:form.industry==="Other"?form.other_industry:form.industry,
        years_in_business:form.years_in_business,
        team_size:form.team_size,
        current_lead_sources:form.current_lead_sources.join(", "),
        monthly_revenue:form.monthly_revenue,
        why_interested:form.why_interested,
        social_instagram:form.social_instagram,
        social_facebook:form.social_facebook,
        social_other:form.social_other,
        stage:"new",
        created_at:new Date().toISOString(),
      };
      await db.submitApplication(application);
      setDone(true);
    }catch(e){
      setError("Something went wrong. Please try again or email hello@streamline.io");
      console.error(e);
    }
    setSubmitting(false);
  };

  if(done)return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{textAlign:"center",maxWidth:500,width:"100%",animation:"fadeUp 0.5s ease"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(16,185,129,0.12)",border:`2px solid ${T.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 20px"}}>✓</div>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(26px,5vw,38px)",letterSpacing:-1.5,marginBottom:14}}>Application received.</h2>
        <p style={{color:T.offWhite,fontSize:15,lineHeight:1.8,marginBottom:8}}>Thanks, <strong>{form.contact_name}</strong>. We'll review your application and reach out to <strong>{form.email}</strong> within 1–2 business days.</p>
        <p style={{color:T.muted,fontSize:13,lineHeight:1.7,marginBottom:32}}>In the meantime, feel free to explore how the platform works — you've already seen more than most contractors ever do before signing up.</p>
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,padding:20,textAlign:"left",marginBottom:24}}>
          <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Your application summary</div>
          {[
            ["Company",form.company],
            ["Trade",form.industry==="Other"?form.other_industry:form.industry],
            ["City",form.city],
            ["Team size",form.team_size],
            ["Monthly revenue",form.monthly_revenue],
          ].map(([k,v])=>v&&<div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}>
            <span style={{color:T.muted}}>{k}</span>
            <span style={{color:T.white,fontWeight:500}}>{v}</span>
          </div>)}
        </div>
        <Btn variant="outline" onClick={onBack} fullWidth>← Back to Streamline</Btn>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",borderBottom:`1px solid ${T.border}`,background:"rgba(9,12,17,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={onBack}>
          <LogoMark size={26}/>
          <span style={{fontFamily:"'DM Serif Display',serif",fontSize:16}}>Streamline</span>
        </div>
        <div style={{fontSize:12,color:T.muted}}>Contractor Application · Step {step+1} of {STEPS.length}</div>
        <button onClick={onBack} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:13,padding:"6px 10px"}}>← Back</button>
      </div>

      {/* Progress bar */}
      <div style={{height:3,background:T.border}}>
        <div style={{height:"100%",width:`${progress+25}%`,background:`linear-gradient(90deg,${T.blue},${T.cyan})`,transition:"width 0.4s ease"}}/>
      </div>

      <div style={{flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 20px 60px"}}>
        <div style={{width:"100%",maxWidth:680,animation:"fadeUp 0.3s ease"}} key={step}>
          {/* Step header */}
          <div style={{marginBottom:28}}>
            <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.blueL,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Step {step+1} of {STEPS.length}</div>
            <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(22px,4vw,32px)",letterSpacing:-1,lineHeight:1.15,marginBottom:6}}>{cur.title}</h1>
            <p style={{color:T.muted,fontSize:14}}>{cur.sub}</p>
          </div>

          {/* Step content */}
          <div style={{marginBottom:28}}>{cur.body}</div>

          {/* Error */}
          {error&&<div style={{marginBottom:16,padding:"12px 16px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,fontSize:13,color:"#F87171"}}>{error}</div>}

          {/* Nav buttons */}
          <div style={{display:"flex",gap:10}}>
            {step>0&&<Btn variant="outline" onClick={()=>{setStep(s=>s-1);setError("");}} style={{flex:1}}>← Back</Btn>}
            {step<STEPS.length-1
              ?<Btn onClick={()=>{if(cur.valid){setStep(s=>s+1);setError("");}else setError("Please fill in all required fields before continuing.");}} disabled={!cur.valid} style={{flex:2}}>Continue →</Btn>
              :<Btn onClick={handleSubmit} disabled={submitting||!cur.valid} style={{flex:2}}>
                {submitting?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner size={15}/>Submitting…</span>:"Submit Application →"}
              </Btn>
            }
          </div>

          {/* Trust signals */}
          <div style={{marginTop:20,display:"flex",alignItems:"center",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:4}}>🔒 Your info is private</span>
            <span style={{fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:4}}>📞 We'll reach out within 1–2 days</span>
            <span style={{fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:4}}>✓ No commitment required</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

// Industry detail pages — replaces intake form links
const INDUSTRY_DETAIL = {
  hvac:{
    label:"HVAC", icon:"🌬️", color:"#06B6D4",
    hero:"Stop Losing HVAC Jobs to Slow Follow-Up.",
    sub:"Streamline delivers pre-qualified heating and cooling leads directly to your dashboard — scored, exclusive, and ready to book.",
    pain:"The HVAC problem: customers search, submit to 3 platforms, and book whoever calls first. You're competing blind.",
    how:"We embed your intake form inside your Google and Facebook ads. Customers answer 5 targeted questions — system type, issue, urgency, property size, budget — before they ever see a phone number. By the time you call, they know their estimate and you know exactly what you're walking into.",
    stats:[{n:"92%",l:"of HVAC leads come via mobile search"},{n:"4 min",l:"avg time to complete intake"},{n:"$2,400",l:"avg HVAC job value on platform"},{n:"1",l:"contractor per lead — always"}],
    features:["Emergency vs. scheduled urgency flagging","AC, heat pump, furnace, duct — issue-specific routing","Pre-generated estimate range before first call","Ownership and property size captured upfront"],
    quote:{text:"\"I used to get 3 calls a day from HomeAdvisor. Half were tire-kickers. Streamline sends me 4-5 leads a week and I close almost every one.\"",attr:"HVAC contractor, Columbus OH"},
  },
  roofing:{
    label:"Roofing", icon:"🏠", color:"#F59E0B",
    hero:"Roofing Leads That Already Know Their Budget.",
    sub:"Pre-scored homeowners with damage, age, or replacement needs — delivered exclusively to your pipeline before they call anyone else.",
    pain:"The roofing problem: storm chasers flood neighborhoods with door hangers, Angi sells your lead to 4 competitors, and customers don't even know what a job costs.",
    how:"Our intake form asks about damage type, storm vs. age-related, roof size, material preference, and budget tolerance. Every lead gets a price range before you call. No sticker shock, no wasted drive-bys.",
    stats:[{n:"68%",l:"of roofing jobs come from storm or leak urgency"},{n:"$8,500",l:"avg roofing job value on platform"},{n:"2.1x",l:"higher close rate vs. shared leads"},{n:"0",l:"competitors see your lead"}],
    features:["Storm damage vs. scheduled replacement classification","Roof size and material captured in form","Insurance claim indicator question","Urgency tier: emergency leak vs. this season vs. planning"],
    quote:{text:"\"First week I got two leads. Closed both. That's never happened with any other service I've used.\"",attr:"Roofing contractor, Westerville OH"},
  },
  plumbing:{
    label:"Plumbing", icon:"🔧", color:"#10B981",
    hero:"Plumbing Leads With Urgency Built In.",
    sub:"From emergency burst pipes to planned remodels — every lead scored and routed based on urgency, property type, and job scope.",
    pain:"The plumbing problem: most lead gen services don't separate 'I have a dripping faucet' from 'my basement is flooding.' You're paying the same for both.",
    how:"Our intake captures issue type, urgency, ownership, property age, and scope. Emergency leads are flagged instantly. Planned remodel leads come with budget and timeline so you can prioritize your week intelligently.",
    stats:[{n:"43%",l:"of plumbing leads are emergency or same-day"},{n:"$1,800",l:"avg plumbing job value on platform"},{n:"<60s",l:"emergency lead notification time"},{n:"100%",l:"exclusive — never resold"}],
    features:["Emergency vs. scheduled urgency split","Water heater, drain, leak, remodel — issue routing","Ownership and rental status captured","Property age flag for older-home upsell potential"],
    quote:{text:"\"The emergency leads alone pay for the plan. Everything else is profit.\"",attr:"Plumbing contractor, Dublin OH"},
  },
  electrical:{
    label:"Electrical", icon:"⚡", color:"#A78BFA",
    hero:"Electrical Leads From Homeowners Ready to Book.",
    sub:"Panel upgrades, EV chargers, smart home installs, and safety inspections — pre-qualified and delivered to your dashboard in real time.",
    pain:"The electrical problem: electrical work is high-value but most lead gen sends you vague 'need electrician' requests with no scope, no budget, and no urgency.",
    how:"We ask about service type, property ownership, panel age, and budget tier. EV charger installs and panel upgrades are flagged as high-value automatically. You see the full scope before you pick up the phone.",
    stats:[{n:"$3,200",l:"avg electrical job value on platform"},{n:"EV charger",l:"fastest-growing request type"},{n:"82%",l:"of leads are homeowners (not renters)"},{n:"24/7",l:"lead delivery — no batch processing"}],
    features:["Panel upgrade vs. outlet vs. EV charger classification","Property ownership captured upfront","Budget tier selection before form completion","Smart home and whole-home generator flagging"],
    quote:{text:"\"EV charger installs are my most profitable jobs. Streamline sends me 2-3 a month and they're all pre-qualified.\"",attr:"Electrical contractor, New Albany OH"},
  },
  education:{
    label:"Beauty Schools", icon:"💅", color:"#F472B6",
    hero:"Beauty School Leads From Students Ready to Enroll.",
    sub:"Cosmetology, esthetics, nail tech, and barbering programs — connect with pre-qualified prospective students actively searching for their training program.",
    pain:"The beauty school problem: most schools rely on walk-ins, referrals, and expensive radio ads. Prospective students are searching online right now, but most schools have no system to capture and qualify them before a competitor does.",
    how:"Our intake captures the student's program interest, timeline to start, prior experience, financing needs, and location. You receive a complete admissions-ready profile before the first call — saving your admissions team hours of unqualified outreach.",
    stats:[{n:"$14,000",l:"avg program tuition value on platform"},{n:"73%",l:"of inquiries are ready to enroll within 60 days"},{n:"1",l:"school per student lead — always exclusive"},{n:"4×",l:"more enrollments vs. walk-in inquiries"}],
    features:["Program type and timeline to enroll captured upfront","Financial aid interest and budget pre-screened","Prior cosmetology experience flagged for advanced placement","Barbering, esthetics, nails, makeup — program-specific routing"],
    quote:{text:"\"We were buying leads from three different lead gen companies and closing maybe 5%. Streamline sends us serious applicants and our close rate is over 30%.\"",attr:"Admissions Director, Columbus OH"},
  },
};

function IndustryPage({industryKey, onBack, onApply}) {
  const d = INDUSTRY_DETAIL[industryKey];
  if(!d) { onBack(); return null; }
  const SE=({c,color})=><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:500,color:color||T.blueL,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:10}}>{c}</div>;

  return <div style={{background:T.bg,minHeight:"100vh"}}>
    {/* Nav */}
    <nav style={{position:"fixed",top:0,left:0,right:0,height:60,zIndex:200,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",background:"rgba(9,12,17,0.96)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer"}}>
        <LogoMark size={26}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.white}}>Streamline</span>
      </button>
      <div style={{display:"flex",gap:8}}>
        <Btn variant="outline" onClick={onBack} style={{fontSize:12,padding:"6px 14px"}}>← All Industries</Btn>
        <Btn onClick={onApply} style={{fontSize:12,padding:"6px 16px"}}>Apply Now</Btn>
      </div>
    </nav>

    {/* Hero */}
    <section style={{padding:"120px 20px 80px",textAlign:"center",position:"relative",overflow:"hidden",background:`radial-gradient(ellipse 80% 60% at 50% 40%,${d.color}18,transparent 70%)`}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent 5%,${d.color}80 50%,transparent 95%)`}}/>
      <div style={{maxWidth:720,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${d.color}18`,border:`1px solid ${d.color}40`,borderRadius:100,padding:"6px 16px",fontSize:11,fontWeight:600,color:d.color,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:20}}>
          {d.icon} {d.label} · Exclusive Leads
        </div>
        <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(32px,6vw,58px)",lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:16}}>{d.hero}</h1>
        <p style={{fontSize:"clamp(14px,2vw,17px)",color:T.offWhite,lineHeight:1.75,maxWidth:520,margin:"0 auto 32px",fontWeight:300}}>{d.sub}</p>
        <Btn size="lg" onClick={onApply} style={{background:d.color,border:"none"}}>Apply for {d.label} Leads →</Btn>
      </div>
    </section>

    {/* Pain point */}
    <section style={{padding:"clamp(40px,5vw,72px) 20px",borderTop:`1px solid ${T.border}`,background:T.surface}}>
      <div style={{maxWidth:900,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center"}} className="grid-1-mobile">
        <div>
          <SE c="The Problem" color={d.color}/>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(22px,3vw,32px)",letterSpacing:-1,marginBottom:14,lineHeight:1.2}}>Why most {d.label} contractors struggle with leads</h2>
          <p style={{fontSize:14,color:T.offWhite,lineHeight:1.8}}>{d.pain}</p>
        </div>
        <div style={{background:T.bg,border:`1px solid ${d.color}30`,borderRadius:14,padding:"24px",borderLeft:`3px solid ${d.color}`}}>
          <SE c="How Streamline Fixes It" color={d.color}/>
          <p style={{fontSize:14,color:T.offWhite,lineHeight:1.8}}>{d.how}</p>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section style={{padding:"clamp(40px,5vw,72px) 20px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <SE c={`${d.label} by the numbers`} color={d.color}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:T.border,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginTop:16}}>
          {d.stats.map(s=>(
            <div key={s.l} style={{background:T.surface,padding:"clamp(16px,2vw,28px)",transition:"background 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background=T.surface}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(24px,3vw,38px)",color:d.color,lineHeight:1,marginBottom:6,letterSpacing:-1}}>{s.n}</div>
              <div style={{fontSize:12,color:T.muted,lineHeight:1.5}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section style={{padding:"clamp(40px,5vw,72px) 20px",borderTop:`1px solid ${T.border}`,background:T.surface}}>
      <div style={{maxWidth:900,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"start"}} className="grid-1-mobile">
        <div>
          <SE c="What We Capture" color={d.color}/>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(22px,3vw,32px)",letterSpacing:-1,marginBottom:20,lineHeight:1.2}}>Every {d.label} lead comes with full context.</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {d.features.map(f=>(
              <div key={f} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",background:T.bg,borderRadius:10,border:`1px solid ${T.border2}`}}>
                <span style={{color:d.color,fontSize:14,flexShrink:0,marginTop:1}}>✓</span>
                <span style={{fontSize:13,color:T.offWhite,lineHeight:1.5}}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Quote */}
        <div>
          <SE c="From the field" color={d.color}/>
          <div style={{background:T.bg,border:`1px solid ${d.color}30`,borderRadius:14,padding:"24px 28px",borderTop:`3px solid ${d.color}`}}>
            <div style={{color:d.color,fontSize:20,marginBottom:12,letterSpacing:2}}>★★★★★</div>
            <p style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:T.offWhite,lineHeight:1.75,fontStyle:"italic",marginBottom:16}}>{d.quote.text}</p>
            <div style={{fontSize:12,color:T.muted}}>{d.quote.attr}</div>
          </div>
          <div style={{marginTop:20,padding:"16px 20px",background:`${d.color}10`,border:`1px solid ${d.color}30`,borderRadius:12}}>
            <div style={{fontSize:13,fontWeight:600,color:d.color,marginBottom:4}}>Ready to see it in your market?</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:14}}>Apply in 3 minutes. No commitment required.</div>
            <Btn onClick={onApply} style={{background:d.color,border:"none",width:"100%"}}>Apply for {d.label} Leads</Btn>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer style={{borderTop:`1px solid ${T.border}`,padding:"28px 20px",textAlign:"center"}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:T.muted}}>← Back to Streamline.io</button>
    </footer>
  </div>;
}

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

// ─── ROTATING HERO BADGE ──────────────────────────────────────────────────────
function HeroBadge(){
  const items = [
    {label:"HVAC",       color:"#38BDF8", dot:"#38BDF8"},
    {label:"Roofing",    color:"#F59E0B", dot:"#F59E0B"},
    {label:"Plumbing",   color:"#10B981", dot:"#10B981"},
    {label:"Electrical", color:"#A78BFA", dot:"#A78BFA"},
    {label:"Beauty Schools", color:"#F472B6", dot:"#F472B6"},
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(()=>{
    // Each item shows for 2.4s total: 0.4s in, 1.6s hold, 0.4s out
    const HOLD = 2400;
    const FADE = 400;
    let t1, t2;
    const cycle = () => {
      // start fade-out
      setVisible(false);
      t1 = setTimeout(()=>{
        setIdx(i=>(i+1)%items.length);
        setVisible(true);
        t2 = setTimeout(cycle, HOLD);
      }, FADE);
    };
    t2 = setTimeout(cycle, HOLD);
    return ()=>{ clearTimeout(t1); clearTimeout(t2); };
  },[]);

  const cur = items[idx];
  return(
    <div style={{height:32,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24}}>
      <div style={{
        display:"inline-flex",alignItems:"center",gap:8,
        background:`${cur.color}18`,border:`1px solid ${cur.color}50`,
        borderRadius:100,padding:"6px 18px",
        fontSize:11,fontWeight:600,color:cur.color,
        letterSpacing:"0.07em",textTransform:"uppercase",
        opacity:visible?1:0,
        transform:visible?"translateY(0)":"translateY(4px)",
        transition:"opacity 0.4s ease, transform 0.4s ease",
        whiteSpace:"nowrap",
      }}>
        <div style={{width:5,height:5,background:cur.dot,borderRadius:"50%",animation:"pulse 2s infinite",flexShrink:0}}/>
        Now accepting — {cur.label}
      </div>
    </div>
  );
}


function PromoBanner({onApply}){
  const [dismissed,setDismissed]=useState(false);
  if(dismissed)return null;
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:300,background:T.surface,borderBottom:`1px solid ${T.border2}`,padding:"9px 20px",display:"flex",alignItems:"center",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(37,99,235,0.1)",border:`1px solid rgba(37,99,235,0.25)`,borderRadius:4,padding:"2px 8px"}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:T.blueL,animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em",color:T.blueL,fontWeight:600,textTransform:"uppercase"}}>Limited Time</span>
        </div>
        <span style={{fontSize:13,color:T.offWhite}}>First month subscription fee waived — apply before spots fill</span>
        <span style={{fontSize:12,color:T.muted}}>· No setup fee · No commitment</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={onApply} style={{background:"none",border:`1px solid ${T.blueL}`,borderRadius:6,padding:"4px 14px",fontSize:12,fontWeight:600,cursor:"pointer",color:T.blueL,whiteSpace:"nowrap",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background=`rgba(59,130,246,0.12)`;}} onMouseLeave={e=>{e.currentTarget.style.background="none";}}>Apply now →</button>
        <button onClick={()=>setDismissed(true)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:17,lineHeight:1,padding:"2px 4px"}} title="Dismiss">×</button>
      </div>
    </div>
  );
}

function LandingPage({onLogin,onIntakeForm,onApply,onIndustry}){
  const [showAuth,setShowAuth]=useState(false);
  const [mobileNav,setMobileNav]=useState(false);
  const scrollTo=id=>{document.getElementById(id)?.scrollIntoView({behavior:"smooth"});setMobileNav(false);};
  const SE=({c})=><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:500,color:T.blueL,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:10}}>{c}</div>;
  const SH=({c,center})=><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(26px,4vw,40px)",lineHeight:1.1,letterSpacing:-1,marginBottom:14,textAlign:center?"center":"left"}}>{c}</h2>;
  const navLinks=[["industries","Industries"],["how","How It Works"],["features","Features"],["pricing","Pricing"],["faq","FAQ"]];

  return <div style={{background:T.bg,minHeight:"100vh",width:"100%",overflowX:"hidden"}}>
    <PromoBanner onApply={onApply}/>
    {/* NAV */}
    <nav style={{position:"fixed",top:40,left:0,right:0,height:60,zIndex:200,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",background:"rgba(9,12,17,0.94)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`}}>
      <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer"}}>
        <LogoMark size={28}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:T.white}}>Streamline</span>
      </button>
      <div style={{display:"flex",alignItems:"center",gap:2}} className="hide-mobile">
        {navLinks.map(([id,label])=>(
          <button key={id} onClick={()=>scrollTo(id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:500,color:T.muted,padding:"6px 11px",borderRadius:7,transition:"color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color=T.white} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>{label}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <Btn variant="outline" onClick={()=>setShowAuth(true)} style={{fontSize:13,padding:"8px 16px"}} className="hide-mobile">Log In</Btn>
        <button onClick={()=>setMobileNav(o=>!o)} style={{background:"none",border:`1px solid ${T.border2}`,color:T.white,cursor:"pointer",fontSize:16,padding:"7px 10px",borderRadius:8,display:"none"}} id="burger">☰</button>
      </div>
    </nav>
    <style>{`@media(max-width:768px){#burger{display:flex!important}}`}</style>

    {/* Mobile nav */}
    {mobileNav&&<div style={{position:"fixed",top:60,left:0,right:0,background:T.surface,borderBottom:`1px solid ${T.border}`,zIndex:199,padding:"8px 0",animation:"fadeUp 0.2s ease"}}>
      {navLinks.map(([id,label])=><button key={id} onClick={()=>scrollTo(id)} style={{display:"block",width:"100%",background:"none",border:"none",cursor:"pointer",fontSize:15,fontWeight:500,color:T.offWhite,padding:"13px 20px",textAlign:"left"}}>{label}</button>)}
      <div style={{padding:"10px 16px",borderTop:`1px solid ${T.border}`,marginTop:4}}>
        <Btn onClick={()=>{onApply();setMobileNav(false);}} fullWidth>Get Started</Btn>
      </div>
    </div>}

    {/* HERO — richer background */}
    <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"clamp(90px,14vw,150px) 20px 80px",textAlign:"center",position:"relative",overflow:"hidden",width:"100%"}}>
      {/* Multi-layer background */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 90% 70% at 50% 30%,rgba(37,99,235,0.18),transparent 65%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 50% 50% at 20% 80%,rgba(6,182,212,0.1),transparent 60%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 40% 40% at 80% 70%,rgba(167,139,250,0.08),transparent 60%)",pointerEvents:"none"}}/>
      {/* Subtle grid */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>
      {/* Top edge line */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent 5%,rgba(37,99,235,0.6) 35%,rgba(6,182,212,0.7) 50%,rgba(37,99,235,0.6) 65%,transparent 95%)"}}/>
      {/* Floating orbs */}
      <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.06),transparent 70%)",top:"15%",left:"10%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.07),transparent 70%)",bottom:"20%",right:"8%",pointerEvents:"none"}}/>

      <div style={{maxWidth:700,position:"relative",zIndex:1,width:"100%",margin:"0 auto"}}>
        <HeroBadge/>
        <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(38px,7vw,70px)",lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:18}}>
          Stop chasing leads.<br/>Start closing{" "}
          <em style={{fontStyle:"italic",background:`linear-gradient(135deg,${T.blueL},${T.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>jobs.</em>
        </h1>
        <p style={{fontSize:"clamp(14px,2vw,17px)",color:T.offWhite,lineHeight:1.75,maxWidth:480,margin:"0 auto 32px",fontWeight:300}}>
          Qualified, scored leads delivered to your dashboard. <em style={{color:T.cyan,fontStyle:"italic"}}>Exclusive.</em> Always.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
          <Btn size="lg" onClick={onApply}>Get Started →</Btn>
          <Btn variant="outline" size="lg" onClick={()=>scrollTo("industries")}>See Industries</Btn>
        </div>
        {/* Social proof trust bar */}
        <div style={{display:"flex",justifyContent:"center",gap:0,flexWrap:"wrap",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden",backdropFilter:"blur(8px)"}}>
          {[
            {icon:"🔒",stat:"100%",label:"Exclusive leads"},
            {icon:"⚡",stat:"<60s",label:"Delivery time"},
            {icon:"⭐",stat:"87%",label:"Qualification rate"},
            {icon:"🚫",stat:"$0",label:"Setup fee"},
          ].map((s,i)=>(
            <div key={s.stat} style={{padding:"12px 20px",borderLeft:i>0?"1px solid rgba(255,255,255,0.07)":"none",flex:1,textAlign:"center",minWidth:100}}>
              <div style={{fontSize:14,marginBottom:2}}>{s.icon}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:T.white,lineHeight:1,marginBottom:2}}>{s.stat}</div>
              <div style={{fontSize:10,color:T.muted}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* INDUSTRIES — now sales cards linking to industry pages */}
    <section id="industries" style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`,background:T.surface,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 50% at 50% 100%,rgba(37,99,235,0.06),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:1200,margin:"0 auto",width:"100%",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <SE c="Industries We Serve"/>
          <SH c="Built for service pros who run on booked clients." center/>
          <p style={{color:T.muted,fontSize:14,maxWidth:480,margin:"0 auto"}}>Each industry has its own intake flow, scoring model, and lead type — tailored to how customers actually buy in that market.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14}} className="grid-2-mobile">
          {Object.entries(INDUSTRIES).map(([k,v])=>(
            <div key={k} onClick={()=>onIndustry(k)}
              style={{background:T.bg,border:`1px solid ${T.border2}`,borderRadius:16,padding:"28px 20px",cursor:"pointer",transition:"all 0.25s",position:"relative",overflow:"hidden",textAlign:"center"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=v.color+"60";e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.background=T.surface2;e.currentTarget.querySelector(".ind-arrow").style.opacity="1";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.transform="none";e.currentTarget.style.background=T.bg;e.currentTarget.querySelector(".ind-arrow").style.opacity="0";}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${v.color},transparent)`,opacity:0.6}}/>
              <div style={{width:56,height:56,borderRadius:"50%",background:`${v.color}15`,border:`1px solid ${v.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 14px"}}>{v.icon}</div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:8,color:T.white}}>{v.label}</div>
              <div style={{fontSize:12,color:T.muted,lineHeight:1.6,marginBottom:14}}>{k==="hvac"?"Heating, cooling, and air quality leads with urgency and system type captured.":k==="roofing"?"Storm damage, replacements, and repairs — with scope and budget pre-qualified.":k==="plumbing"?"Emergency and planned jobs, scored by urgency, scope, and property type.":k==="electrical"?"Panel upgrades, EV chargers, and safety work — pre-qualified and high-value.":"Cosmetology, esthetics, nail tech, and barbering — pre-qualified applicants delivered to your admissions team."}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontSize:12,color:v.color,fontWeight:600}}>
                See how it works <span className="ind-arrow" style={{opacity:0,transition:"opacity 0.2s",fontSize:14}}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* HOW IT WORKS — without campaign URLs card */}
    <section id="how" style={{padding:"clamp(48px,7vw,88px) 20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 50% 60% at 80% 50%,rgba(6,182,212,0.05),transparent 65%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:1200,margin:"0 auto",width:"100%",position:"relative",zIndex:1}}>
        <SE c="How It Works"/>
        <SH c="From customer intent to your calendar."/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(20px,5vw,56px)",marginTop:36,alignItems:"start"}} className="grid-1-mobile">
          <div>
            {[
              {n:"01",title:"Customer sees your ad",desc:"They click your Google or Facebook ad and land on an industry-specific intake form — tailored to their exact service need."},
              {n:"02",title:"5-minute qualification",desc:"They answer questions about issue type, urgency, budget, property details. Pre-scored 0–100 across six dimensions automatically."},
              {n:"03",title:"Instant estimate generated",desc:"Every qualified lead receives a price range before you call — no sticker shock, no wasted time explaining costs."},
              {n:"04",title:"Lead in your dashboard",desc:"Full lead package delivered exclusively to you within 60 seconds. Name, contact, score, breakdown, and booking link."},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:14,padding:"18px 0",borderBottom:`1px solid ${T.border}`,borderTop:i===0?`1px solid ${T.border}`:"none"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,minWidth:22,paddingTop:2,flexShrink:0}}>{s.n}</div>
                <div><div style={{fontSize:14,fontWeight:600,marginBottom:5}}>{s.title}</div><div style={{fontSize:13,color:T.muted,lineHeight:1.65}}>{s.desc}</div></div>
              </div>
            ))}
          </div>
          {/* Visual card — score breakdown mock */}
          <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden",boxShadow:"0 20px 50px rgba(0,0,0,0.4)"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:T.surface2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,fontWeight:600}}>Lead Preview</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.green}}>● Delivered live</div>
            </div>
            <div style={{padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>Sarah M.</div>
                  <div style={{fontSize:12,color:T.muted}}>AC Replacement · 43215</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:T.green,lineHeight:1}}>84</div>
                  <div style={{fontSize:10,color:T.muted}}>/ 100</div>
                </div>
              </div>
              {[["Budget","$2,000–5,000",T.green,17,20],["Urgency","Emergency",T.red,20,20],["Ownership","Owner",T.green,15,15],["Property","2,000–3,500 sqft",T.amber,13,15]].map(([l,v,c,s,mx])=>(
                <div key={l} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:T.muted}}>{l}</span><span style={{color:c,fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>{s}/{mx}</span></div>
                  <div style={{height:3,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${(s/mx)*100}%`,height:"100%",background:c,borderRadius:2}}/></div>
                </div>
              ))}
              <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:"8px 12px",marginTop:14,fontSize:12,color:T.green}}>Estimate: $3,200 – $4,800 · Ready to book</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* METRICS */}
    <section style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,background:T.surface,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 50% at 30% 50%,rgba(37,99,235,0.05),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:1200,margin:"0 auto",width:"100%",position:"relative",zIndex:1}}>
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
      <div style={{maxWidth:1200,margin:"0 auto",width:"100%"}}>
        <SE c="Platform Features"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(16px,3vw,40px)",alignItems:"end",marginBottom:32}} className="grid-1-mobile">
          <SH c="Everything you need. Nothing you don't."/>
          <p style={{fontSize:14,color:T.offWhite,lineHeight:1.7,fontWeight:300}}>Purpose-built for service businesses. No bloated CRM, no learning curve.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:T.border,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
          {[
            {icon:"⚡",title:"Intelligent Lead Scoring",desc:"Scored across six dimensions before it reaches you.",action:()=>scrollTo("how"),cta:"See how it works"},
            {icon:"📊",title:"Real-Time Dashboard",desc:"Live pipeline with score breakdowns and booking status.",action:()=>setShowAuth(true),cta:"View demo dashboard"},
            {icon:"🔒",title:"Exclusive Every Time",desc:"One contractor per lead. Always. No exceptions.",action:()=>scrollTo("pricing"),cta:"See pricing"},
            {icon:"📋",title:"Industry-Specific Forms",desc:"HVAC, Roofing, Plumbing, Electrical — tailored questions.",action:()=>scrollTo("industries"),cta:"Browse industries"},
            {icon:"🔔",title:"Instant Notifications",desc:"In-app alert the moment a lead is assigned to you.",action:()=>scrollTo("how"),cta:"Learn more"},
            {icon:"📈",title:"Win/Loss Tracking",desc:"Track close rates by job type and season.",action:()=>setShowAuth(true),cta:"See the dashboard"},
          ].map(f=>(
            <div key={f.title} onClick={f.action} style={{background:T.surface,padding:"clamp(18px,2vw,28px)",transition:"all 0.2s",cursor:"pointer",position:"relative"}} onMouseEnter={e=>{e.currentTarget.style.background=T.surface2;e.currentTarget.querySelector(".feat-cta").style.opacity="1";e.currentTarget.querySelector(".feat-cta").style.transform="translateY(0)";}} onMouseLeave={e=>{e.currentTarget.style.background=T.surface;e.currentTarget.querySelector(".feat-cta").style.opacity="0";e.currentTarget.querySelector(".feat-cta").style.transform="translateY(4px)";}}>
              <div style={{width:38,height:38,background:"rgba(37,99,235,0.12)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,marginBottom:12,border:"1px solid rgba(37,99,235,0.2)"}}>{f.icon}</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>{f.title}</div>
              <div style={{fontSize:13,color:T.muted,lineHeight:1.6,marginBottom:8}}>{f.desc}</div>
              <div className="feat-cta" style={{fontSize:11,color:T.blueL,fontWeight:600,opacity:0,transform:"translateY(4px)",transition:"all 0.2s",display:"flex",alignItems:"center",gap:4}}>{f.cta} <span style={{fontSize:13}}>→</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* PRICING */}
    <section id="pricing" style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 60% at 50% 50%,rgba(37,99,235,0.06),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:1200,margin:"0 auto",width:"100%",textAlign:"center",position:"relative",zIndex:1}}>
        <SE c="Pricing"/>
        <SH c="Pay for what works." center/>
        <p style={{fontSize:14,color:T.offWhite,lineHeight:1.7,fontWeight:300,maxWidth:440,margin:"0 auto 16px"}}>Low monthly base keeps costs predictable. Performance fee only when you close a job.</p>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"8px 16px",marginBottom:28,fontSize:13,color:T.muted}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.blueL,flexShrink:0,animation:"pulse 2s infinite"}}/>
          <span style={{color:T.offWhite}}>Limited-time:</span> First month subscription fee waived when you apply now.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:860,margin:"0 auto",alignItems:"stretch"}} className="grid-1-mobile">
          {[
            {plan:"Starter",price:"299",perf:"150",popular:false,features:["Exclusive leads delivered to your dashboard","Intelligent intake and lead scoring","Instant estimate generation for each lead","In-app notifications on every new lead","Win/loss tracking and close rate analytics","Dedicated intake URL for your ads"]},
            {plan:"Growth",price:"499",perf:"100",popular:true,features:["Everything in Starter","Priority lead queue — first access in your market","Lower performance fee per closed job","CRM integrations and data export","Dedicated account manager","Seasonal campaign volume boosts"]},
          ].map(p=>(
            <div key={p.plan} style={{background:p.popular?`linear-gradient(135deg,rgba(37,99,235,0.1),${T.surface})`:T.surface,border:`1px solid ${p.popular?T.blue:T.border2}`,borderRadius:16,padding:"clamp(20px,3vw,32px)",position:"relative",transition:"transform 0.22s",textAlign:"left",display:"flex",flexDirection:"column"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              {p.popular&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${T.blue},${T.cyan},transparent)`}}/>}
              {/* ROW 1: Popular badge — reserved height so both cards align */}
              <div style={{height:28,marginBottom:10,display:"flex",alignItems:"center"}}>
                {p.popular&&<div style={{display:"inline-flex",background:T.blue,color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'JetBrains Mono',monospace"}}>Most Popular</div>}
              </div>
              {/* ROW 2: Plan name */}
              <div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,fontFamily:"'JetBrains Mono',monospace"}}>{p.plan}</div>
              {/* ROW 3: Price */}
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:8}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:300,color:T.muted,alignSelf:"flex-start",marginTop:8}}>$</span>
                <span style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(36px,5vw,52px)",lineHeight:1,letterSpacing:-2}}>{p.price}</span>
                <span style={{fontSize:14,color:T.muted,fontWeight:300}}>/mo</span>
              </div>
              {/* ROW 4: Perf fee badge — fixed height */}
              <div style={{height:32,marginBottom:16,display:"flex",alignItems:"center"}}>
                <div style={{fontSize:11,color:T.blueL,fontFamily:"'JetBrains Mono',monospace",padding:"5px 10px",background:"rgba(37,99,235,0.1)",borderRadius:6,border:"1px solid rgba(37,99,235,0.2)",whiteSpace:"nowrap"}}>+ ${p.perf} performance fee per closed job</div>
              </div>
              {/* ROW 5: Divider */}
              <div style={{height:1,background:T.border,marginBottom:18}}/>
              {/* ROW 6: Features — flex:1 pushes button to bottom */}
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24,flex:1}}>
                {p.features.map(f=><div key={f} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:13,color:T.offWhite}}><span style={{color:T.blueL,flexShrink:0}}>›</span>{f}</div>)}
              </div>
              {/* ROW 7: CTA button */}
              <button onClick={onApply} style={{width:"100%",padding:"13px",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",background:p.popular?T.blue:"none",color:p.popular?"white":T.offWhite,border:p.popular?"none":`1px solid ${T.border2}`,transition:"background 0.2s",touchAction:"manipulation"}} onMouseEnter={e=>{if(!p.popular)e.currentTarget.style.background=T.surface2;}} onMouseLeave={e=>{if(!p.popular)e.currentTarget.style.background="none";}}>Apply Now</button>
              {/* ROW 8: Trust note */}
              <div style={{fontSize:10,color:T.muted,textAlign:"center",marginTop:6}}>Secure payment via Stripe · Cancel anytime</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* TESTIMONIALS */}
    <section style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`,background:T.surface,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 50% 60% at 70% 50%,rgba(167,139,250,0.04),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:1200,margin:"0 auto",width:"100%",position:"relative",zIndex:1}}>
        <SE c="Reviews"/>
        <SH c="What our clients say."/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14,marginTop:32}}>
          {[{initials:"MR",name:"Mike R.",company:"Roofing · Columbus",color:"#F59E0B",quote:"The leads come in already knowing their budget. Closing faster than ever."},{initials:"DL",name:"Dana L.",company:"Plumbing · Dublin",color:"#10B981",quote:"Was paying $800/month sharing leads with four others. Streamline gives me exclusives at a lower cost."},{initials:"JT",name:"James T.",company:"Electrical · Westerville",color:"#A78BFA",quote:"Clean dashboard, real leads. I've never received one that was junk."}].map(t=>(
            <div key={t.name} style={{background:T.bg,border:`1px solid ${T.border2}`,borderRadius:14,padding:"clamp(18px,2vw,24px)",transition:"transform 0.2s,border-color 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=t.color+"50";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=T.border2;}}>
              <div style={{color:T.amber,fontSize:12,marginBottom:10,letterSpacing:2}}>★★★★★</div>
              <p style={{fontSize:14,color:T.offWhite,lineHeight:1.7,fontStyle:"italic",marginBottom:18,fontFamily:"'DM Serif Display',serif"}}>"{t.quote}"</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:`${t.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:t.color,border:`1px solid ${t.color}40`,fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{t.initials}</div>
                <div><div style={{fontSize:13,fontWeight:600}}>{t.name}</div><div style={{fontSize:11,color:T.muted}}>{t.company}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section id="faq" style={{padding:"clamp(48px,7vw,88px) 20px",borderTop:`1px solid ${T.border}`}}>
      <div style={{maxWidth:1200,margin:"0 auto",width:"100%",textAlign:"center"}}>
        <SE c="FAQ"/>
        <SH c="Common questions." center/>
        <LandingFAQ/>
      </div>
    </section>

    {/* CTA */}
    <section style={{padding:"clamp(48px,7vw,88px) 20px",textAlign:"center",borderTop:`1px solid ${T.border}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 70% at 50% 50%,rgba(37,99,235,0.12),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 40% 40% at 20% 80%,rgba(6,182,212,0.06),transparent 60%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:520,margin:"0 auto",position:"relative",zIndex:1}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(26px,4vw,44px)",lineHeight:1.1,letterSpacing:-1.5,marginBottom:14}}>Ready to fill your calendar with real jobs?</h2>
        <p style={{fontSize:14,color:T.offWhite,marginBottom:28,fontWeight:300}}>Join service businesses across Columbus with a qualified, exclusive pipeline.</p>
        <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
          <Btn size="lg" onClick={onApply}>Apply Now →</Btn>
          <Btn variant="outline" size="lg" onClick={()=>scrollTo("industries")}>Explore Industries</Btn>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer style={{borderTop:`1px solid ${T.border}`,padding:"clamp(28px,5vw,50px) 20px 28px"}}>
      <div style={{maxWidth:1200,margin:"0 auto",width:"100%"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr repeat(3,1fr)",gap:"clamp(16px,3vw,40px)",marginBottom:36}} className="grid-2-mobile">
          <div>
            <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,background:"none",border:"none",cursor:"pointer"}}>
              <LogoMark size={26}/><span style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:T.white}}>Streamline</span>
            </button>
            <p style={{fontSize:13,color:T.muted,lineHeight:1.6,maxWidth:200}}>Qualified leads for service businesses that run on booked jobs.</p>
          </div>
          {[
            {title:"Industries",links:[["HVAC",()=>onIndustry("hvac")],["Roofing",()=>onIndustry("roofing")],["Plumbing",()=>onIndustry("plumbing")],["Electrical",()=>onIndustry("electrical")]]},
            {title:"Company",links:[["How It Works",()=>scrollTo("how")],["Features",()=>scrollTo("features")],["Pricing",()=>scrollTo("pricing")],["FAQ",()=>scrollTo("faq")]]},
            {title:"Contact",links:[["hello@streamline.io",()=>{}],["Apply Now",onApply],["Log In",()=>setShowAuth(true)],["Support",()=>{}]]},
          ].map(col=>(
            <div key={col.title}>
              <div style={{fontSize:10,fontWeight:600,color:T.offWhite,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>{col.title}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {col.links.map(([l,fn])=><button key={l} onClick={fn} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:T.muted,textAlign:"left",transition:"color 0.2s",padding:0}} onMouseEnter={e=>e.currentTarget.style.color=T.white} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>{l}</button>)}
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


// ─── ADMIN CONSTANTS ──────────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@streamline.io";

const dbAdmin = {
  getAllBusinesses: async () => {
    // Uses service-level select — works because admin is authenticated
    const { data, error } = await sb.from("businesses").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },
  getLeadsForBusiness: async (bid) => {
    const { data, error } = await sb.from("leads").select("*").eq("business_id", bid).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },
  createContractor: async (profile) => {
    // Sign up via auth, then upsert business profile
    const { data, error } = await sb.auth.admin ? 
      sb.auth.signUp({ email: profile.email, password: profile.tempPassword }) :
      sb.auth.signUp({ email: profile.email, password: profile.tempPassword });
    if (error) throw error;
    return data;
  },
  upsertContractorProfile: async (profile) => {
    const { data, error } = await sb.from("businesses").upsert(profile).select().single();
    if (error) throw error;
    return data;
  },
  deleteContractor: async (id) => {
    const { error } = await sb.from("businesses").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── ADMIN AUTH PAGE ──────────────────────────────────────────────────────────
function AdminLogin({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const { session } = await db.signIn(email, password);
      if (!session) throw new Error("Login failed.");
      if (session.user.email !== ADMIN_EMAIL) {
        await db.signOut();
        throw new Error("Access denied. Admin credentials required.");
      }
      onAuth(session.user);
    } catch (e) { setError(e.message || "Login failed."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, justifyContent: "center" }}>
          <LogoMark size={34} />
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20 }}>Streamline</span>
          <span style={{ background: "rgba(239,68,68,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.07em" }}>ADMIN</span>
        </div>
        <Card style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, letterSpacing: -0.5, marginBottom: 5 }}>Admin Access</h2>
          <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>Sign in with your admin credentials.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Inp label="Email" value={email} onChange={setEmail} type="email" placeholder="admin@streamline.io" required />
            <Inp label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" required />
          </div>
          {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, fontSize: 13, color: "#F87171" }}>{error}</div>}
          <Btn onClick={submit} disabled={loading} fullWidth style={{ marginTop: 18 }}>
            {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Spinner size={15} />Signing in…</span> : "Sign In →"}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ─── CONTRACTOR MODAL ─────────────────────────────────────────────────────────
function ContractorModal({ contractor, onClose, onSave, toast }) {
  const isNew = !contractor?.id;
  const [form, setForm] = useState({
    company: contractor?.company || "",
    email: contractor?.email || "",
    tempPassword: "",
    phone: contractor?.phone || "",
    city: contractor?.city || "",
    industry: contractor?.industry || "HVAC",
    plan: contractor?.plan || "Starter",
    calendly_url: contractor?.calendly_url || "",
    notify_email: contractor?.notify_email || "",
    notes: contractor?.notes || "",
    id: contractor?.id || "",
    stripe_customer_id: contractor?.stripe_customer_id || "",
    billing_status: contractor?.billing_status || "active",
    card_last4: contractor?.card_last4 || "",
    card_brand: contractor?.card_brand || "",
  });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      if (isNew) {
        if (!form.email || !form.tempPassword) throw new Error("Email and temporary password are required.");
        // Create auth user
        const { data, error } = await sb.auth.signUp({ email: form.email, password: form.tempPassword });
        if (error) throw error;
        const uid = data.user?.id;
        if (!uid) throw new Error("Failed to create user account.");
        // Save business profile
        await dbAdmin.upsertContractorProfile({
          id: uid,
          email: form.email,
          company: form.company,
          phone: form.phone,
          city: form.city,
          industry: form.industry,
          plan: form.plan,
          calendly_url: form.calendly_url,
          notify_email: form.notify_email || form.email,
          notes: form.notes,
        });
        toast({ message: `Contractor created: ${form.company}`, type: "success" });
        onSave();
      } else {
        await dbAdmin.upsertContractorProfile({
          id: form.id,
          company: form.company,
          phone: form.phone,
          city: form.city,
          industry: form.industry,
          plan: form.plan,
          calendly_url: form.calendly_url,
          notify_email: form.notify_email,
          notes: form.notes,
          stripe_customer_id: form.stripe_customer_id||undefined,
          billing_status: form.billing_status||"active",
          card_last4: form.card_last4||undefined,
          card_brand: form.card_brand||undefined,
        });
        toast({ message: "Contractor updated", type: "success" });
        onSave();
      }
      onClose();
    } catch (e) {
      toast({ message: e.message || "Save failed", type: "error" });
    }
    setSaving(false);
  };

  const industries = [
    { value: "HVAC", label: "HVAC" },
    { value: "Roofing", label: "Roofing" },
    { value: "Plumbing", label: "Plumbing" },
    { value: "Electrical", label: "Electrical" },
    { value: "Education", label: "Beauty Schools" },
  ];

  return (
    <Modal open={true} onClose={onClose} title={isNew ? "Add New Contractor" : `Edit: ${contractor.company}`} width={600}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Inp label="Company Name" value={form.company} onChange={set("company")} placeholder="Apex Climate Control" required />
          <Inp label="City / Market" value={form.city} onChange={set("city")} placeholder="Columbus, OH" />
          <Inp label="Email" value={form.email} onChange={set("email")} type="email" placeholder="owner@company.com" required />
          <Inp label="Phone" value={form.phone} onChange={set("phone")} type="tel" placeholder="(614) 555-0000" />
          {isNew && <Inp label="Temp Password" value={form.tempPassword} onChange={set("tempPassword")} type="password" placeholder="They can change this" required hint="Contractor will use this to first log in" />}
          <Inp label="Notification Email" value={form.notify_email} onChange={set("notify_email")} type="email" placeholder="alerts@company.com" />
          <Inp label="Primary Industry" value={form.industry} onChange={set("industry")} type="select" options={industries} />
          <Inp label="Plan" value={form.plan} onChange={set("plan")} type="select" options={[{ value: "Starter", label: "Starter — $299/mo" }, { value: "Growth", label: "Growth — $499/mo" }]} />
        </div>
        <Inp label="Calendly URL" value={form.calendly_url} onChange={set("calendly_url")} placeholder="https://calendly.com/contractorname/estimate" hint="Qualified leads will see this booking link after submitting the intake form" />
        <Inp label="Internal Notes" value={form.notes} onChange={set("notes")} type="textarea" placeholder="Onboarding notes, special agreements, contact history…" />
        {!isNew&&<div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Billing Override</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:10}}>Use these fields to manually record Stripe billing info until the full webhook integration is live.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Inp label="Stripe Customer ID" value={form.stripe_customer_id||""} onChange={set("stripe_customer_id")} placeholder="cus_xxxxxxxxxxxxx"/>
            <Inp label="Billing Status" value={form.billing_status||"active"} onChange={set("billing_status")} type="select" options={[{value:"active",label:"Active"},{value:"trial",label:"Trial"},{value:"cancel_pending",label:"Cancel Pending"},{value:"cancelled",label:"Cancelled"},{value:"past_due",label:"Past Due"}]}/>
            <Inp label="Card Last 4" value={form.card_last4||""} onChange={set("card_last4")} placeholder="4242"/>
            <Inp label="Card Brand" value={form.card_brand||""} onChange={set("card_brand")} placeholder="Visa"/>
          </div>
        </div>}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Btn variant="outline" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
          <Btn onClick={save} disabled={saving} style={{ flex: 2 }}>
            {saving ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Spinner size={14} />{isNew ? "Creating…" : "Saving…"}</span> : isNew ? "Create Contractor →" : "Save Changes"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}



// ─── CONTRACTOR CRM PIPELINE ──────────────────────────────────────────────────
const CRM_STAGES=[
  {id:"new",      label:"New Application", color:T.blueL,  icon:"📥", desc:"Just came in"},
  {id:"reviewed", label:"Reviewed",        color:T.cyan,   icon:"👀", desc:"You've looked at it"},
  {id:"call",     label:"Call Scheduled",  color:"#A78BFA",icon:"📞", desc:"Demo booked"},
  {id:"trial",    label:"Trial",           color:T.amber,  icon:"🧪", desc:"Testing the platform"},
  {id:"customer", label:"Customer",        color:T.green,  icon:"✅", desc:"Paying contractor"},
  {id:"churned",  label:"Churned",         color:T.red,    icon:"❌", desc:"Left or didn't convert"},
];

function ApplicationDetail({app,onClose,onStageChange,onDelete,contractors,toast,adminUser,onConvert}){
  const [stage,setStage]=useState(app.stage||"new");
  const [notes,setNotes]=useState(app.admin_notes||"");
  const [saving,setSaving]=useState(false);
  const [converting,setConverting]=useState(false);
  const stageInfo=CRM_STAGES.find(s=>s.id===stage)||CRM_STAGES[0];

  const save=async(newStage)=>{
    const s=newStage||stage;
    setSaving(true);
    try{
      await db.updateApplicationStage(app.id,s,notes);
      onStageChange(app.id,s,notes);
      toast({message:"Saved",type:"success"});
    }catch(e){toast({message:"Save failed",type:"error"});}
    setSaving(false);
  };

  const convertToContractor=async()=>{
    setConverting(true);
    try{
      // Check not already a contractor
      const existing=contractors.find(c=>c.email===app.email);
      if(existing){toast({message:"Already a contractor account",type:"info"});setConverting(false);return;}
      // Create auth + business profile
      const tempPw="Streamline2024!";
      const{data,error}=await sb.auth.signUp({email:app.email,password:tempPw});
      if(error)throw error;
      const uid=data.user?.id;
      if(!uid)throw new Error("Failed to create account");
      const adminName=adminUser?.user_metadata?.full_name||adminUser?.email?.split("@")[0]||"Streamline Team";
      await dbAdmin.upsertContractorProfile({
        id:uid,email:app.email,company:app.company,
        phone:app.phone,city:app.city,industry:app.industry,
        plan:"Starter",notify_email:app.email,
        notes:`Converted from application. ${app.why_interested||""}`,
        onboarding_admin_email:adminUser?.email||"hello@streamline.io",
        onboarding_admin_name:adminName,
      });
      await db.updateApplicationStage(app.id,"customer",notes);
      onStageChange(app.id,"customer",notes);
      toast({message:`✅ ${app.company} converted to contractor! Temp password: ${tempPw} — switching to Contractors tab`,type:"success"});
      if(onConvert)onConvert();
      onClose();
    }catch(e){toast({message:e.message||"Conversion failed",type:"error"});}
    setConverting(false);
  };

  return(
    <Modal open={true} onClose={onClose} title={app.company||app.contact_name} width={620}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Stage selector */}
        <div>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Pipeline Stage</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {CRM_STAGES.map(s=>(
              <button key={s.id} onClick={()=>{setStage(s.id);save(s.id);}} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${stage===s.id?s.color:T.border2}`,background:stage===s.id?s.color+"22":"none",color:stage===s.id?s.color:T.muted,cursor:"pointer",fontSize:12,fontWeight:stage===s.id?700:400,transition:"all 0.15s",display:"flex",alignItems:"center",gap:5}}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Application details */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            ["Contact",app.contact_name],["Email",app.email],
            ["Phone",app.phone],["City",app.city],
            ["Industry",app.industry],["Team Size",app.team_size],
            ["Years in Business",app.years_in_business],["Monthly Revenue",app.monthly_revenue],
            ["Website",app.website],["Applied",new Date(app.created_at).toLocaleDateString()],
          ].filter(([,v])=>v).map(([k,v])=>(
            <div key={k} style={{background:T.surface2,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{k}</div>
              <div style={{fontSize:13,color:T.white,fontWeight:500,wordBreak:"break-all"}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Lead sources */}
        {app.current_lead_sources&&<div style={{background:T.surface2,borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Current Lead Sources</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {app.current_lead_sources.split(", ").map(s=>(
              <span key={s} style={{background:T.surface3,border:`1px solid ${T.border2}`,borderRadius:4,padding:"2px 8px",fontSize:11,color:T.offWhite}}>{s}</span>
            ))}
          </div>
        </div>}

        {/* Why interested */}
        {app.why_interested&&<div style={{background:T.surface2,borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Why Streamline?</div>
          <div style={{fontSize:13,color:T.offWhite,lineHeight:1.6}}>{app.why_interested}</div>
        </div>}

        {/* Social links */}
        {(app.social_instagram||app.social_facebook||app.social_other)&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["Instagram",app.social_instagram],["Facebook",app.social_facebook],["Other",app.social_other]].filter(([,v])=>v).map(([k,v])=>(
            <a key={k} href={v.startsWith("http")?v:`https://${v}`} target="_blank" rel="noreferrer" style={{fontSize:12,color:T.blueL,background:"rgba(37,99,235,0.1)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:6,padding:"4px 10px"}}>↗ {k}</a>
          ))}
        </div>}

        {/* Admin notes */}
        <div>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Admin Notes</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Call notes, objections, follow-up reminders…" style={{width:"100%",background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 12px",color:T.white,fontSize:13,outline:"none",minHeight:80,resize:"vertical",fontFamily:"inherit"}}/>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn onClick={()=>save()} disabled={saving} style={{flex:1}}>
            {saving?"Saving…":"Save Notes"}
          </Btn>
          {stage!=="customer"&&stage!=="churned"&&(
            <Btn variant="success" onClick={convertToContractor} disabled={converting} style={{flex:1}}>
              {converting?<span style={{display:"flex",alignItems:"center",gap:6}}><Spinner size={13}/>Converting…</span>:"⚡ Convert to Contractor"}
            </Btn>
          )}
          <Btn variant="danger" onClick={async()=>{if(window.confirm("Delete this application?"))try{await db.deleteApplication(app.id);onDelete(app.id);onClose();}catch(e){toast({message:"Delete failed",type:"error"});}}} style={{padding:"13px 16px"}}>🗑</Btn>
        </div>
      </div>
    </Modal>
  );
}

function ContractorCRM({contractors,toast,adminUser,onConvert}){
  const [apps,setApps]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");
  const [stageFilter,setStageFilter]=useState("all");

  const load=async()=>{
    setLoading(true);
    try{const d=await db.getApplications();setApps(d);}
    catch(e){toast({message:"Failed to load applications",type:"error"});}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const updateStage=(id,stage,notes)=>{
    setApps(p=>p.map(a=>a.id===id?{...a,stage,admin_notes:notes}:a));
  };
  const deleteApp=(id)=>setApps(p=>p.filter(a=>a.id!==id));

  const filtered=apps
    .filter(a=>stageFilter==="all"||a.stage===stageFilter)
    .filter(a=>!search||
      a.company?.toLowerCase().includes(search.toLowerCase())||
      a.contact_name?.toLowerCase().includes(search.toLowerCase())||
      a.city?.toLowerCase().includes(search.toLowerCase())||
      a.industry?.toLowerCase().includes(search.toLowerCase())
    );

  // Stage counts
  const counts={};
  CRM_STAGES.forEach(s=>{counts[s.id]=apps.filter(a=>a.stage===s.id).length;});
  const conversionRate=apps.length>0?Math.round((counts.customer/apps.length)*100):0;

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,letterSpacing:-1,marginBottom:3}}>Contractor Pipeline</h2>
          <p style={{color:T.muted,fontSize:13}}>{apps.length} applications · {counts.customer||0} customers · {conversionRate}% conversion rate</p>
        </div>
        <Btn variant="outline" onClick={load}>Refresh</Btn>
      </div>

      {/* Funnel summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:20}} className="grid-2-mobile">
        {CRM_STAGES.map(s=>(
          <div key={s.id} onClick={()=>setStageFilter(stageFilter===s.id?"all":s.id)} style={{background:stageFilter===s.id?s.color+"18":T.surface,border:`1px solid ${stageFilter===s.id?s.color:T.border2}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.15s"}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:s.color,lineHeight:1,marginBottom:2}}>{counts[s.id]||0}</div>
            <div style={{fontSize:11,color:T.muted,lineHeight:1.3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Funnel bar */}
      <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",gap:3,alignItems:"center",overflow:"hidden"}}>
        {CRM_STAGES.filter(s=>s.id!=="churned").map((s,i,arr)=>{
          const w=apps.length>0?Math.max((counts[s.id]/apps.length)*100,2):0;
          return<div key={s.id} style={{flex:counts[s.id]||0.2,height:8,background:s.color,borderRadius:i===0?"4px 0 0 4px":i===arr.length-1?"0 4px 4px 0":"0",opacity:0.8,minWidth:4,transition:"flex 0.6s ease"}} title={`${s.label}: ${counts[s.id]||0}`}/>;
        })}
      </div>

      {/* Search */}
      <div style={{position:"relative",marginBottom:14,maxWidth:400}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search applications…" style={{width:"100%",background:T.surface,border:`1px solid ${T.border2}`,borderRadius:8,padding:"9px 12px 9px 32px",color:T.white,fontSize:13,outline:"none"}}/>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:12}}>🔍</span>
      </div>

      {/* Applications table */}
      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,gap:12}}><Spinner/><span style={{color:T.muted}}>Loading applications…</span></div>
      ):(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 1fr 1fr 1.4fr 80px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
            {["Applicant","Industry","City","Revenue","Team","Stage","Applied"].map(h=><div key={h}>{h}</div>)}
          </div>
          {filtered.length===0?(
            <div style={{padding:56,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:10}}>📥</div>
              <div style={{fontSize:14,color:T.offWhite,marginBottom:6}}>{apps.length===0?"No applications yet":"No results"}</div>
              <div style={{fontSize:13,color:T.muted}}>{apps.length===0?"Applications from your website will appear here automatically.":"Try a different search or stage filter."}</div>
            </div>
          ):filtered.map((app,i)=>{
            const s=CRM_STAGES.find(x=>x.id===app.stage)||CRM_STAGES[0];
            return(
              <div key={app.id} onClick={()=>setSelected(app)}
                style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 1fr 1fr 1.4fr 80px",padding:"13px 16px",borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none",cursor:"pointer",transition:"background 0.15s",alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.surface2}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:T.white,marginBottom:1}}>{app.company||"—"}</div>
                  <div style={{fontSize:11,color:T.muted}}>{app.contact_name} · {app.email}</div>
                </div>
                <div style={{fontSize:12,color:T.offWhite}}>{app.industry||"—"}</div>
                <div style={{fontSize:12,color:T.offWhite}}>{app.city||"—"}</div>
                <div style={{fontSize:12,color:T.offWhite}}>{app.monthly_revenue||"—"}</div>
                <div style={{fontSize:12,color:T.offWhite}}>{app.team_size||"—"}</div>
                <div><span style={{display:"inline-flex",alignItems:"center",gap:5,background:s.color+"20",color:s.color,border:`1px solid ${s.color}40`,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:600}}>{s.icon} {s.label}</span></div>
                <div style={{fontSize:11,color:T.muted}}>{new Date(app.created_at).toLocaleDateString()}</div>
              </div>
            );
          })}
        </div>
      )}

      {selected&&<ApplicationDetail
        app={selected}
        onClose={()=>setSelected(null)}
        onStageChange={(id,stage,notes)=>{updateStage(id,stage,notes);setSelected(s=>s?{...s,stage,admin_notes:notes}:null);}}
        onConvert={()=>{if(onConvert)onConvert();}}
        onDelete={deleteApp}
        contractors={contractors}
        toast={toast}
        adminUser={adminUser}
      />}
    </div>
  );
}



function generateInvoicePDF(invoice, contractor, wonLeads) {
  const perfFee = contractor.plan === "Growth" ? 100 : 150;
  const lineItems = wonLeads.map(l => ({
    date: l.completed_at ? new Date(l.completed_at).toLocaleDateString() : new Date(l.created_at).toLocaleDateString(),
    customer: l.name,
    issue: l.is_name || l.issue_type,
    jobValue: l.job_value ? `$${Number(l.job_value).toLocaleString()}` : "Not recorded",
    fee: `$${perfFee.toFixed(2)}`,
  }));
  const subtotal = wonLeads.length * perfFee;
  const invoiceNum = invoice.invoice_number || `INV-${Date.now()}`;
  const dueDate = new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString();

  const rows = lineItems.map(l =>
    `<tr><td>${l.date}</td><td style="font-weight:500">${l.customer}</td><td style="color:#64748B">${l.issue}</td><td>${l.jobValue}</td><td style="text-align:right;font-weight:600">${l.fee}</td></tr>`
  ).join("");

  const statusBadge = invoice.status === "paid"
    ? `<span style="background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;border-radius:4px;padding:2px 10px;font-size:11px;font-weight:600">PAID</span>`
    : `<span style="background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;border-radius:4px;padding:2px 10px;font-size:11px;font-weight:600">OUTSTANDING</span>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invoice ${invoiceNum}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#111;padding:48px;}
.header{display:flex;justify-content:space-between;margin-bottom:48px;}
.logo{font-size:22px;font-weight:700;letter-spacing:-0.5px;}
.logo span{color:#2563EB;}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:40px;padding:24px;background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;}
.label{font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#94A3B8;margin-bottom:6px;font-weight:600;}
.pname{font-size:15px;font-weight:700;margin-bottom:4px;}
.pdetail{font-size:12px;color:#64748B;line-height:1.6;}
.dates{display:flex;gap:32px;margin-bottom:32px;}
.db label{font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#94A3B8;font-weight:600;display:block;margin-bottom:3px;}
.db span{font-size:13px;font-weight:600;}
table{width:100%;border-collapse:collapse;margin-bottom:24px;}
th{padding:10px 14px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#64748B;background:#F1F5F9;font-weight:600;}
td{padding:12px 14px;border-bottom:1px solid #F1F5F9;font-size:13px;}
tr:last-child td{border-bottom:none;}
.totals{margin-left:auto;width:260px;}
.trow{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;}
.trow.total{border-top:2px solid #111;margin-top:8px;padding-top:12px;font-size:16px;font-weight:700;}
.note{margin-top:40px;padding:16px 20px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;font-size:12px;color:#92400E;line-height:1.6;}
.footer{margin-top:48px;padding-top:24px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;font-size:11px;color:#94A3B8;}
@media print{body{padding:32px;}}
</style></head><body>
<div class="header">
  <div><div class="logo">Stream<span>line</span></div><div style="font-size:12px;color:#64748B;margin-top:4px">Performance Fee Invoice</div></div>
  <div style="text-align:right"><div style="font-size:20px;font-weight:700;margin-bottom:4px">${invoiceNum}</div>${statusBadge}</div>
</div>
<div class="parties">
  <div><div class="label">From</div><div class="pname">Streamline</div><div class="pdetail">hello@streamline.io<br/>streamline.io</div></div>
  <div><div class="label">Bill To</div><div class="pname">${contractor.company || contractor.email}</div><div class="pdetail">${contractor.email}<br/>${contractor.phone||""}<br/>${contractor.city||""}</div></div>
</div>
<div class="dates">
  <div class="db"><label>Invoice Date</label><span>${new Date(invoice.created_at||Date.now()).toLocaleDateString()}</span></div>
  <div class="db"><label>Due Date</label><span>${dueDate}</span></div>
  <div class="db"><label>Period</label><span>${invoice.period||new Date().toLocaleString("default",{month:"long",year:"numeric"})}</span></div>
  <div class="db"><label>Plan</label><span>${contractor.plan||"Starter"} ($${perfFee}/close)</span></div>
</div>
<table>
  <thead><tr><th>Date</th><th>Customer</th><th>Service</th><th>Job Value</th><th style="text-align:right">Performance Fee</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="totals">
  <div class="trow"><span>${wonLeads.length} closed job${wonLeads.length!==1?"s":""} x $${perfFee}</span><span>$${subtotal.toFixed(2)}</span></div>
  <div class="trow total"><span>Total Due</span><span>$${subtotal.toFixed(2)}</span></div>
</div>
<div class="note"><strong>Payment:</strong> ACH, check, or Stripe link provided separately. Reference <strong>${invoiceNum}</strong>. Questions? hello@streamline.io</div>
<div class="footer"><span>Streamline | hello@streamline.io | streamline.io</span><span>Generated ${new Date().toLocaleString()}</span></div>
</body></html>`;

  const win = window.open("","_blank","width=900,height=700");
  if(!win){alert("Please allow popups for this site to generate invoices.");return;}
  win.document.write(html);
  win.document.close();
  setTimeout(()=>win.print(),600);
}

function AdminInvoicing({contractors,toast}){
  const [wonLeads,setWonLeads]=useState([]);
  const [invoices,setInvoices]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedContractor,setSelectedContractor]=useState(null);
  const [generating,setGenerating]=useState(false);

  const load=async()=>{
    setLoading(true);
    try{
      const[wl,inv]=await Promise.all([db.getAllWonLeads(),db.getAllInvoices()]);
      setWonLeads(wl);setInvoices(inv);
    }catch(e){toast({message:"Failed to load",type:"error"});}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const byContractor=contractors.map(c=>{
    const leads=wonLeads.filter(l=>l.business_id===c.id);
    const unbilled=leads.filter(l=>!l.billed);
    const perfFee=c.plan==="Growth"?100:150;
    return{...c,leads,unbilled,unbilledFee:unbilled.length*perfFee,perfFee,contractorInvoices:invoices.filter(i=>i.business_id===c.id)};
  }).filter(c=>c.leads.length>0).sort((a,b)=>b.unbilled.length-a.unbilled.length);

  const totalUnbilled=byContractor.reduce((s,c)=>s+c.unbilledFee,0);
  const totalCollected=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const totalPending=invoices.filter(i=>i.status==="sent").reduce((s,i)=>s+Number(i.total_amount||0),0);

  const generateInvoice=async(contractor)=>{
    if(!contractor.unbilled.length){toast({message:"No unbilled jobs",type:"info"});return;}
    setGenerating(true);
    try{
      const now=new Date();
      const suffix=(contractor.company||"CONT").replace(/\s/g,"").substring(0,4).toUpperCase()+String(Math.floor(Math.random()*900)+100);
      const invoiceNum=`INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}-${suffix}`;
      const inv={business_id:contractor.id,invoice_number:invoiceNum,period:now.toLocaleString("default",{month:"long",year:"numeric"}),line_item_count:contractor.unbilled.length,perf_fee_per_job:contractor.perfFee,total_amount:contractor.unbilledFee,status:"sent",created_at:now.toISOString(),lead_ids:contractor.unbilled.map(l=>l.id).join(",")};
      const saved=await db.createInvoice(inv);
      await db.markLeadsBilled(contractor.unbilled.map(l=>l.id),saved.id);
      generateInvoicePDF(saved,contractor,contractor.unbilled);
      toast({message:`Invoice ${invoiceNum} generated — PDF opened`,type:"success"});
      await load();
    }catch(e){toast({message:"Failed: "+e.message,type:"error"});}
    setGenerating(false);
  };

  const reprintInvoice=async(inv)=>{
    const c=contractors.find(x=>x.id===inv.business_id);
    if(!c){toast({message:"Contractor not found",type:"error"});return;}
    const ids=(inv.lead_ids||"").split(",").filter(Boolean);
    generateInvoicePDF(inv,c,wonLeads.filter(l=>ids.includes(l.id)));
  };

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,letterSpacing:-1,marginBottom:3}}>Invoicing</h2>
          <p style={{color:T.muted,fontSize:13}}>Generate performance fee invoices for contractors with closed jobs</p>
        </div>
        <Btn variant="outline" onClick={load}>Refresh</Btn>
      </div>

      {(()=>{const pendingVerify=wonLeads.filter(l=>l.verified===null||l.verified===undefined).length;return(
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}} className="grid-2-mobile">
        {[
          {label:"Needs Verification",value:pendingVerify,color:pendingVerify>0?T.amber:T.green,icon:pendingVerify>0?"⚠️":"✅"},
          {label:"Unbilled Fees",value:`$${totalUnbilled.toLocaleString()}`,color:T.amber,icon:"⏳"},
          {label:"Awaiting Payment",value:`$${totalPending.toLocaleString()}`,color:"#A78BFA",icon:"📤"},
          {label:"Collected",value:`$${totalCollected.toLocaleString()}`,color:T.green,icon:"💰"},
          {label:"Invoices Sent",value:invoices.length,color:T.blueL,icon:"🧾"},
        ].map(s=>(
          <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:s.color,lineHeight:1,marginBottom:3}}>{s.value}</div>
            <div style={{fontSize:11,color:T.muted}}>{s.label}</div>
          </div>
        ))}
      </div>
      );})()}

      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,gap:12}}><Spinner/><span style={{color:T.muted}}>Loading won jobs…</span></div>
      ):(
        <>
          {/* ── Verification Queue ── */}
          {wonLeads.filter(l=>l.verified===null||l.verified===undefined).length>0&&(
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:14}}>⚠️</span>
                <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.amber,textTransform:"uppercase",letterSpacing:"0.08em"}}>
                  Verification Queue — {wonLeads.filter(l=>l.verified===null||l.verified===undefined).length} jobs pending review
                </div>
              </div>
              <div style={{background:"rgba(245,158,11,0.04)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:14,overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"1.8fr 1.2fr 1fr 1fr 1fr 1.5fr 160px",padding:"9px 16px",borderBottom:"1px solid rgba(245,158,11,0.15)",fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
                  {["Customer","Contractor","Service","Job Value","Submitted","Reference / Notes","Verify"].map(h=><div key={h}>{h}</div>)}
                </div>
                {wonLeads.filter(l=>l.verified===null||l.verified===undefined).map((l,li,arr)=>{
                  const contractor=contractors.find(c=>c.id===l.business_id);
                  return(
                    <div key={l.id} style={{display:"grid",gridTemplateColumns:"1.8fr 1.2fr 1fr 1fr 1fr 1.5fr 160px",padding:"12px 16px",borderBottom:li<arr.length-1?"1px solid rgba(245,158,11,0.1)":"none",alignItems:"center",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                      <div><div style={{fontSize:13,fontWeight:600,color:T.white}}>{l.name}</div><div style={{fontSize:11,color:T.muted}}>{l.email}</div></div>
                      <div style={{fontSize:12,color:T.offWhite}}>{contractor?.company||"—"}</div>
                      <div style={{fontSize:12,color:T.muted}}>{l.is_name||l.issue_type}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:l.job_value?T.green:T.muted}}>{l.job_value?`$${Number(l.job_value).toLocaleString()}`:"—"}</div>
                      <div style={{fontSize:11,color:T.muted}}>{l.completed_at?new Date(l.completed_at).toLocaleDateString():"—"}</div>
                      <div style={{fontSize:11,color:l.won_notes?T.offWhite:T.muted,fontStyle:l.won_notes?"normal":"italic"}}>{l.won_notes||"No reference provided"}</div>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={async()=>{try{await db.markLeadVerified(l.id,true,"");await load();toast({message:"Job verified ✓",type:"success"});}catch(e){toast({message:"Failed",type:"error"});}}} style={{background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:7,padding:"5px 10px",cursor:"pointer",color:T.green,fontSize:11,fontWeight:600}}>✓ Verify</button>
                        <button onClick={async()=>{const note=window.prompt("Dispute reason (will be shown to contractor):");if(note===null)return;try{await db.markLeadVerified(l.id,false,note);await load();toast({message:"Job disputed",type:"warning"});}catch(e){toast({message:"Failed",type:"error"});}}} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:7,padding:"5px 10px",cursor:"pointer",color:T.red,fontSize:11,fontWeight:600}}>✗ Dispute</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:11,color:T.muted,marginTop:8,lineHeight:1.6}}>Verify each job before invoicing. Disputed jobs are flagged and removed from the invoice. Contractors are notified of disputes.</div>
            </div>
          )}

          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>
              Contractors — {byContractor.filter(c=>c.unbilled.length>0).length} need invoicing
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 140px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
                {["Contractor","Plan","Won Jobs","Unbilled","Fee/Job","Unbilled Fees",""].map(h=><div key={h}>{h}</div>)}
              </div>
              {byContractor.length===0?(
                <div style={{padding:48,textAlign:"center"}}>
                  <div style={{fontSize:28,marginBottom:10}}>🎉</div>
                  <div style={{fontSize:14,color:T.offWhite,marginBottom:6}}>All caught up</div>
                  <div style={{fontSize:13,color:T.muted}}>No unbilled won jobs right now.</div>
                </div>
              ):byContractor.map((c,i,arr)=>(
                <div key={c.id}>
                  <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 140px",padding:"13px 16px",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{c.company||c.email}</div>
                      <div style={{fontSize:11,color:T.muted}}>{c.city} · {c.email}</div>
                    </div>
                    <div><Pill color={c.plan==="Growth"?"won":"new"}>{c.plan||"Starter"}</Pill></div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:T.blueL}}>{c.leads.length}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:c.unbilled.length>0?T.amber:T.muted}}>{c.unbilled.length}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted}}>${c.perfFee}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:c.unbilledFee>0?T.amber:T.muted}}>{c.unbilledFee>0?`$${c.unbilledFee.toLocaleString()}`:"-"}</div>
                    <div style={{display:"flex",gap:6}}>
                      {c.unbilled.length>0&&(
                        <button onClick={()=>generateInvoice(c)} disabled={generating} style={{background:`linear-gradient(135deg,${T.blue},#7C3AED)`,border:"none",borderRadius:8,padding:"7px 12px",cursor:"pointer",color:"white",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5,opacity:generating?0.6:1}}>
                          {generating?<Spinner size={11}/>:"🧾"} Invoice
                        </button>
                      )}
                      <button onClick={()=>setSelectedContractor(selectedContractor?.id===c.id?null:c)} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:8,padding:"7px 10px",cursor:"pointer",color:T.muted,fontSize:12}}>
                        {selectedContractor?.id===c.id?"▲":"▼"}
                      </button>
                    </div>
                  </div>
                  {selectedContractor?.id===c.id&&(
                    <div style={{background:T.surface2}}>
                      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 140px",padding:"8px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                        {["Customer","Service","Completed","Job Value","Perf Fee","Status",""].map(h=><div key={h}>{h}</div>)}
                      </div>
                      {c.leads.map((l,li)=>(
                        <div key={l.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 140px",padding:"10px 16px",borderBottom:li<c.leads.length-1?`1px solid ${T.border}`:"none",alignItems:"center",fontSize:12}}>
                          <div style={{fontWeight:500,color:T.offWhite,paddingLeft:8}}>{l.name}</div>
                          <div style={{color:T.muted}}>{l.is_name||l.issue_type}</div>
                          <div style={{color:T.muted}}>{l.completed_at?new Date(l.completed_at).toLocaleDateString():"—"}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",color:l.job_value?T.green:T.muted}}>{l.job_value?`$${Number(l.job_value).toLocaleString()}`:"—"}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",color:T.amber}}>${c.perfFee}</div>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                            {l.billed?<span style={{fontSize:10,background:"rgba(245,158,11,0.12)",color:T.amber,border:"1px solid rgba(245,158,11,0.25)",borderRadius:4,padding:"2px 7px",fontWeight:600}}>Billed</span>:<span style={{fontSize:10,background:"rgba(16,185,129,0.1)",color:T.green,border:"1px solid rgba(16,185,129,0.25)",borderRadius:4,padding:"2px 7px",fontWeight:600}}>Unbilled</span>}
                            {l.verified===true&&<span style={{fontSize:10,background:"rgba(16,185,129,0.1)",color:T.green,border:"1px solid rgba(16,185,129,0.2)",borderRadius:4,padding:"2px 7px"}}>✓ Verified</span>}
                            {l.verified===false&&<span style={{fontSize:10,background:"rgba(239,68,68,0.1)",color:T.red,border:"1px solid rgba(239,68,68,0.2)",borderRadius:4,padding:"2px 7px"}} title={l.dispute_note||""}>✗ Disputed</span>}
                            {(l.verified===null||l.verified===undefined)&&<span style={{fontSize:10,background:"rgba(245,158,11,0.08)",color:T.amber,border:"1px solid rgba(245,158,11,0.15)",borderRadius:4,padding:"2px 7px"}}>⏳ Pending</span>}
                          </div>
                          <div/>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {invoices.length>0&&(
            <div>
              <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Invoice History</div>
              <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"1.5fr 1.2fr 1.2fr 80px 1fr 90px 120px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
                  {["Invoice #","Contractor","Period","Jobs","Amount","Status",""].map(h=><div key={h}>{h}</div>)}
                </div>
                {invoices.map((inv,i)=>{
                  const c=contractors.find(x=>x.id===inv.business_id);
                  const paid=inv.status==="paid";
                  return(
                    <div key={inv.id} style={{display:"grid",gridTemplateColumns:"1.5fr 1.2fr 1.2fr 80px 1fr 90px 120px",padding:"12px 16px",borderBottom:i<invoices.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.blueL,fontWeight:600}}>{inv.invoice_number}</div>
                      <div style={{fontSize:12}}>{c?.company||"—"}</div>
                      <div style={{fontSize:12,color:T.muted}}>{inv.period}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted}}>{inv.line_item_count}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:paid?T.green:T.amber}}>${Number(inv.total_amount||0).toLocaleString()}</div>
                      <div><span style={{fontSize:10,background:paid?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)",color:paid?T.green:T.amber,border:`1px solid ${paid?"rgba(16,185,129,0.25)":"rgba(245,158,11,0.25)"}`,borderRadius:4,padding:"2px 7px",fontWeight:600,textTransform:"uppercase"}}>{inv.status}</span></div>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>reprintInvoice(inv)} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:6,padding:"4px 8px",cursor:"pointer",color:T.muted,fontSize:11}}>Print</button>
                        {!paid&&<button onClick={async()=>{try{await db.markInvoicePaid(inv.id);toast({message:"Marked paid",type:"success"});load();}catch(e){toast({message:"Failed",type:"error"});}}} style={{background:"none",border:"1px solid rgba(16,185,129,0.3)",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:T.green,fontSize:11}}>Paid</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── ADMIN BILLING VIEW ───────────────────────────────────────────────────────
function AdminBillingView({contractors,allBilling,onRefresh,toast}){
  const STRIPE_DASHBOARD = "https://dashboard.stripe.com";

  // Merge billing data with contractor profiles
  const merged = contractors.map(c=>{
    const b = allBilling.find(x=>x.business_id===c.id)||{};
    return{...c,...b};
  });

  const active        = merged.filter(c=>!c.billing_status||c.billing_status==="active");
  const cancelPending = merged.filter(c=>c.billing_status==="cancel_pending");
  const pastDue       = merged.filter(c=>c.billing_status==="past_due");
  const cancelled     = merged.filter(c=>c.billing_status==="cancelled");
  const trial         = merged.filter(c=>c.billing_status==="trial");

  const mrr = active.reduce((s,c)=>s+(c.plan==="Growth"?499:299),0)
            + trial.reduce((s,c)=>s+(c.plan==="Growth"?499:299),0)*0.5; // trial at 50%

  const BillingRow=({c,showActions=true})=>{
    const statusConfig={
      active:{color:T.green,label:"Active"},
      cancel_pending:{color:T.amber,label:"Cancel Pending"},
      cancelled:{color:T.red,label:"Cancelled"},
      trial:{color:T.cyan,label:"Trial"},
      past_due:{color:T.red,label:"Past Due"},
    };
    const s=statusConfig[c.billing_status||"active"]||statusConfig.active;
    return(
      <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 1fr 1.4fr 1fr 80px",padding:"13px 16px",borderBottom:`1px solid ${T.border}`,alignItems:"center"}}
        onMouseEnter={e=>e.currentTarget.style.background=T.surface2}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <div>
          <div style={{fontSize:13,fontWeight:600}}>{c.company||c.email}</div>
          <div style={{fontSize:11,color:T.muted}}>{c.email}</div>
        </div>
        <div><Pill color={c.plan==="Growth"?"won":"new"}>{c.plan||"Starter"}</Pill></div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:T.blueL}}>${c.plan==="Growth"?"499":"299"}/mo</div>
        <div style={{fontSize:12,color:T.offWhite}}>{c.card_last4?`${c.card_brand||"Card"} ····${c.card_last4}`:"No card"}</div>
        <div><span style={{display:"inline-flex",alignItems:"center",background:s.color+"20",color:s.color,border:`1px solid ${s.color}40`,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:600}}>{s.label}</span></div>
        <div style={{fontSize:11,color:T.muted}}>{c.cancel_reason||"—"}</div>
        {showActions&&<div style={{display:"flex",gap:4}}>
          {c.stripe_customer_id&&<a href={`${STRIPE_DASHBOARD}/customers/${c.stripe_customer_id}`} target="_blank" rel="noreferrer" style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:6,padding:"4px 7px",fontSize:10,color:"#818CF8",textDecoration:"none",fontWeight:600}}>Stripe</a>}
          {c.billing_status==="cancel_pending"&&<button onClick={async()=>{
            try{await db.upsertBilling({business_id:c.id,status:"active",cancel_requested:false,cancel_reason:null});onRefresh();toast({message:"Cancellation reversed",type:"success"});}
            catch(e){toast({message:"Failed",type:"error"});}
          }} style={{background:"rgba(16,185,129,0.1)",border:`1px solid ${T.green}40`,borderRadius:6,padding:"4px 7px",cursor:"pointer",color:T.green,fontSize:10,fontWeight:600}}>Reactivate</button>}
        </div>}
      </div>
    );
  };

  const TableHeader=()=>(
    <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 1fr 1.4fr 1fr 80px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
      {["Contractor","Plan","MRR","Card","Status","Cancel Reason",""].map(h=><div key={h}>{h}</div>)}
    </div>
  );

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,letterSpacing:-1,marginBottom:3}}>Billing</h2>
          <p style={{color:T.muted,fontSize:13}}>Manage subscriptions, cancellation requests, and payment status</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <a href={STRIPE_DASHBOARD} target="_blank" rel="noreferrer" style={{background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:8,padding:"8px 16px",color:"#818CF8",fontSize:13,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>↗ Stripe Dashboard</a>
          <Btn variant="outline" onClick={onRefresh}>Refresh</Btn>
        </div>
      </div>

      {/* MRR + key stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}} className="grid-2-mobile">
        {[
          {label:"Est. MRR",value:`$${Math.round(mrr).toLocaleString()}`,color:T.green,icon:"💰"},
          {label:"Active",value:active.length,color:T.blueL,icon:"✅"},
          {label:"Trial",value:trial.length,color:T.cyan,icon:"🧪"},
          {label:"Cancel Pending",value:cancelPending.length,color:T.amber,icon:"⏳"},
          {label:"Past Due",value:pastDue.length,color:T.red,icon:"⚠️"},
        ].map(s=>(
          <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:s.color,lineHeight:1,marginBottom:3}}>{s.value}</div>
            <div style={{fontSize:11,color:T.muted}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cancellation requests — priority section */}
      {cancelPending.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.amber,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            ⏳ Cancellation Requests — {cancelPending.length} pending
          </div>
          <div style={{background:T.surface,border:`1px solid rgba(245,158,11,0.3)`,borderRadius:14,overflow:"hidden"}}>
            <TableHeader/>
            {cancelPending.map(c=><BillingRow key={c.id} c={c}/>)}
          </div>
        </div>
      )}

      {/* Past due */}
      {pastDue.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.red,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>⚠️ Past Due — {pastDue.length}</div>
          <div style={{background:T.surface,border:`1px solid rgba(239,68,68,0.3)`,borderRadius:14,overflow:"hidden"}}>
            <TableHeader/>
            {pastDue.map(c=><BillingRow key={c.id} c={c}/>)}
          </div>
        </div>
      )}

      {/* Active subscribers */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Active Subscribers — {active.length}</div>
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
          <TableHeader/>
          {active.length===0
            ?<div style={{padding:32,textAlign:"center",color:T.muted,fontSize:13}}>No active subscribers yet</div>
            :active.map(c=><BillingRow key={c.id} c={c}/>)
          }
        </div>
      </div>

      {/* Trial */}
      {trial.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.cyan,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Trial — {trial.length}</div>
          <div style={{background:T.surface,border:`1px solid rgba(6,182,212,0.25)`,borderRadius:14,overflow:"hidden"}}>
            <TableHeader/>
            {trial.map(c=><BillingRow key={c.id} c={c}/>)}
          </div>
        </div>
      )}

      {/* Stripe setup notice */}
      <div style={{background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"16px 20px",display:"flex",gap:14,alignItems:"flex-start"}}>
        <span style={{fontSize:22,flexShrink:0}}>🔌</span>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#818CF8",marginBottom:4}}>Stripe Webhook Integration</div>
          <div style={{fontSize:12,color:T.muted,lineHeight:1.7}}>
            To auto-sync billing status from Stripe, deploy the Edge Function in <code style={{fontFamily:"'JetBrains Mono',monospace",color:T.offWhite,fontSize:11}}>/supabase/functions/stripe-webhook</code>.
            Until then, use the Billing Override fields in each contractor's edit modal to manually sync status.
            Card info, cancellations, and status changes from Stripe will then update here automatically.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
function CampaignURLs(){
  const base=window.location.origin;
  const [copied,setCopied]=useState(null);
  const copy=(k,url)=>{navigator.clipboard.writeText(url);setCopied(k);setTimeout(()=>setCopied(null),2000);};
  return(
    <div style={{marginBottom:24}}>
      <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Ad Campaign URLs</div>
      <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:T.surface2,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Industry Intake URLs</div>
            <div style={{fontSize:12,color:T.muted}}>Share these in your Google / Facebook ads. Leads submitted via these URLs are auto-routed to the matching contractors.</div>
          </div>
        </div>
        <div style={{padding:12,display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}} className="grid-1-mobile">
          {Object.entries(INDUSTRIES).map(([k,v])=>{
            const url=`${base}/?industry=${k}`;
            return(
              <div key={k} style={{background:T.surface2,borderRadius:8,padding:"12px 14px",border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:15}}>{v.icon}</span>
                    <span style={{fontSize:13,fontWeight:600,color:T.white}}>{v.label}</span>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.blueL,wordBreak:"break-all"}}>{url}</div>
                </div>
                <button onClick={()=>copy(k,url)} style={{background:copied===k?T.green:T.surface3,border:`1px solid ${T.border2}`,borderRadius:6,padding:"5px 10px",cursor:"pointer",color:copied===k?"white":T.muted,fontSize:11,fontWeight:600,flexShrink:0,transition:"all 0.2s",whiteSpace:"nowrap"}}>
                  {copied===k?"✓ Copied":"Copy"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminStats({contractors}){
  const [allLeads,setAllLeads]=useState([]);
  const [loading,setLoading]=useState(true);
  const [dateRange,setDateRange]=useState("month"); // month | quarter | all

  useEffect(()=>{
    (async()=>{
      try{
        const chunks=await Promise.all(contractors.map(c=>dbAdmin.getLeadsForBusiness(c.id)));
        setAllLeads(chunks.flat());
      }catch(e){console.error(e);}
      setLoading(false);
    })();
  },[contractors.length]);

  if(loading)return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,gap:12}}><Spinner/><span style={{color:T.muted}}>Loading platform data…</span></div>;

  // Date filtering
  const now=new Date();
  const cutoff=dateRange==="month"
    ?new Date(now.getFullYear(),now.getMonth(),1)
    :dateRange==="quarter"
    ?new Date(now.getFullYear(),Math.floor(now.getMonth()/3)*3,1)
    :new Date(0);
  const leads=allLeads.filter(l=>new Date(l.created_at)>=cutoff);

  const total=leads.length;
  const won=leads.filter(l=>l.status==="won").length;
  const closeRate=total>0?Math.round((won/total)*100):0;
  const avgScore=total>0?Math.round(leads.reduce((s,l)=>s+(l.score||0),0)/total):0;
  const hot=leads.filter(l=>l.tier==="hot").length;
  const overflow=leads.filter(l=>l.source==="overflow").length;
  const autoAssigned=leads.filter(l=>l.source==="auto_assigned").length;

  const industries=["HVAC","Roofing","Plumbing","Electrical"];
  const cities=[...new Set(contractors.map(c=>c.city).filter(Boolean))].sort();

  // Per-industry stats
  const byIndustry=industries.map(ind=>{
    const indLeads=leads.filter(l=>l.industry===ind);
    const indContractors=contractors.filter(c=>c.industry===ind);
    const indWon=indLeads.filter(l=>l.status==="won").length;
    const indAvgScore=indLeads.length>0?Math.round(indLeads.reduce((s,l)=>s+(l.score||0),0)/indLeads.length):0;
    return{
      industry:ind,
      leads:indLeads.length,
      contractors:indContractors.length,
      won:indWon,
      closeRate:indLeads.length>0?Math.round((indWon/indLeads.length)*100):0,
      avgScore:indAvgScore,
      avgPerContractor:indContractors.length>0?Math.round(indLeads.length/indContractors.length):0,
      hot:indLeads.filter(l=>l.tier==="hot").length,
    };
  }).sort((a,b)=>b.leads-a.leads);

  // Per-city stats
  const byCity=cities.map(city=>{
    const cityContractors=contractors.filter(c=>c.city===city);
    const cityLeads=leads.filter(l=>cityContractors.some(c=>c.id===l.business_id));
    const cityWon=cityLeads.filter(l=>l.status==="won").length;
    const cityAvgScore=cityLeads.length>0?Math.round(cityLeads.reduce((s,l)=>s+(l.score||0),0)/cityLeads.length):0;
    const industries_rep=[...new Set(cityContractors.map(c=>c.industry))].join(", ");
    return{
      city,
      contractors:cityContractors.length,
      leads:cityLeads.length,
      won:cityWon,
      closeRate:cityLeads.length>0?Math.round((cityWon/cityLeads.length)*100):0,
      avgScore:cityAvgScore,
      avgPerContractor:cityContractors.length>0?Math.round(cityLeads.length/cityContractors.length):0,
      industries:industries_rep,
    };
  }).sort((a,b)=>b.leads-a.leads);

  // Per-plan stats
  const byPlan=["Starter","Growth"].map(plan=>{
    const planContractors=contractors.filter(c=>c.plan===plan);
    const planLeads=leads.filter(l=>planContractors.some(c=>c.id===l.business_id));
    const planWon=planLeads.filter(l=>l.status==="won").length;
    const cap=plan==="Growth"?50:20;
    const atCap=planContractors.filter(c=>{
      const cLeads=planLeads.filter(l=>l.business_id===c.id).length;
      return cLeads>=cap;
    }).length;
    return{
      plan,contractors:planContractors.length,leads:planLeads.length,won:planWon,
      closeRate:planLeads.length>0?Math.round((planWon/planLeads.length)*100):0,
      avgPerContractor:planContractors.length>0?Math.round(planLeads.length/planContractors.length):0,
      atCap,cap,
    };
  });

  // Lead source breakdown
  const sourceBreakdown=[
    {label:"Direct (contractor URL)",key:"direct",color:T.green},
    {label:"Auto-assigned (no URL)",key:"auto_assigned",color:T.cyan},
    {label:"Overflow (cap/quality)",key:"overflow",color:"#A78BFA"},
    {label:"Admin assigned",key:"admin_assigned",color:T.amber},
    {label:"Unassigned",key:"unassigned",color:T.red},
  ].map(s=>({...s,count:leads.filter(l=>l.source===s.key).length}));

  // Lead quality distribution across platform
  const qualityDist={
    hot:leads.filter(l=>l.tier==="hot").length,
    warm:leads.filter(l=>l.tier==="warm").length,
    cold:leads.filter(l=>l.tier==="cold").length,
  };

  // Top performing contractors
  const contractorPerf=contractors.map(c=>{
    const cLeads=leads.filter(l=>l.business_id===c.id);
    const cWon=cLeads.filter(l=>l.status==="won").length;
    const cAvgScore=cLeads.length>0?Math.round(cLeads.reduce((s,l)=>s+(l.score||0),0)/cLeads.length):0;
    return{...c,leads:cLeads.length,won:cWon,
      closeRate:cLeads.length>0?Math.round((cWon/cLeads.length)*100):0,
      avgScore:cAvgScore,
    };
  }).filter(c=>c.leads>0).sort((a,b)=>b.closeRate-a.closeRate);

  // Weekly volume trend across platform
  const weekBuckets={};
  leads.forEach(l=>{
    const d=new Date(l.created_at);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-W${Math.ceil(d.getDate()/7)}`;
    if(!weekBuckets[key])weekBuckets[key]={key,total:0,won:0,hot:0};
    weekBuckets[key].total++;
    if(l.status==="won")weekBuckets[key].won++;
    if(l.tier==="hot")weekBuckets[key].hot++;
  });
  const weekTrend=Object.values(weekBuckets).slice(-12);

  // Urgency breakdown
  const urgencyMap={"emergency":"🚨 Emergency","this_week":"📅 This Week","flexible":"🗓️ Flexible"};
  const urgencyBreakdown=Object.entries(urgencyMap).map(([key,label])=>({
    label,count:leads.filter(l=>l.urgency===key).length,
    closeRate:leads.filter(l=>l.urgency===key).length>0
      ?Math.round((leads.filter(l=>l.urgency===key&&l.status==="won").length/leads.filter(l=>l.urgency===key).length)*100):0,
  }));

  // Budget distribution
  const budgetBands=[
    {label:"<$500",key:"under_500"},{label:"$500-1k",key:"500_1000"},
    {label:"$1-2k",key:"1000_2000"},{label:"$2-5k",key:"2000_5000"},{label:"$5k+",key:"5000_plus"},
  ].map(b=>({...b,count:leads.filter(l=>l.budget===b.key).length}));

  // Marketing insights: cities with 0 contractors for an industry = opportunity
  const gaps=[];
  industries.forEach(ind=>{
    cities.forEach(city=>{
      if(!contractors.some(c=>c.industry===ind&&c.city===city)){
        const demand=leads.filter(l=>l.industry===ind&&byCity.find(c=>c.city===city)).length;
        gaps.push({industry:ind,city,demand});
      }
    });
  });
  gaps.sort((a,b)=>b.demand-a.demand);

  const SectionLabel=({c})=><div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>{c}</div>;

  const StatCard=({label,value,sub,color,icon})=>(
    <Card style={{padding:"16px 18px"}}>
      {icon&&<div style={{fontSize:20,marginBottom:8}}>{icon}</div>}
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:700,color:color||T.white,lineHeight:1,marginBottom:3}}>{value}</div>
      <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:sub?2:0}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:T.offWhite,marginTop:2}}>{sub}</div>}
    </Card>
  );

  const HBar=({label,value,max,color,right})=>(
    <div style={{marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:12,color:T.offWhite}}>{label}</span>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:color||T.muted}}>{right||value}</span>
      </div>
      <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden"}}>
        <div style={{width:max>0?`${Math.min((value/max)*100,100)}%`:"0%",height:"100%",background:color||T.blueL,borderRadius:3,transition:"width 0.6s ease"}}/>
      </div>
    </div>
  );

  return <div style={{animation:"fadeIn 0.3s ease"}}>
    <CampaignURLs/>
    {/* Header + date range selector */}
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
      <div>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,letterSpacing:-1,marginBottom:3}}>Platform Analytics</h2>
        <p style={{color:T.muted,fontSize:13}}>{total.toLocaleString()} leads · {contractors.length} contractors · use this data to drive your sales outreach</p>
      </div>
      <div style={{display:"flex",gap:4,background:T.surface2,padding:3,borderRadius:8,border:`1px solid ${T.border}`}}>
        {[{id:"month",label:"This Month"},{id:"quarter",label:"Quarter"},{id:"all",label:"All Time"}].map(r=>(
          <button key={r.id} onClick={()=>setDateRange(r.id)} style={{padding:"6px 14px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:dateRange===r.id?T.blue:"none",color:dateRange===r.id?"white":T.muted,transition:"all 0.15s"}}>{r.label}</button>
        ))}
      </div>
    </div>

    {/* Top KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:20}} className="grid-2-mobile">
      <StatCard label="Total Leads" value={total} color={T.blueL} icon="📋"/>
      <StatCard label="Platform Close Rate" value={`${closeRate}%`} color={T.green} icon="✅"/>
      <StatCard label="Avg Lead Score" value={avgScore} color={T.amber} icon="⭐"/>
      <StatCard label="Hot Leads" value={hot} sub={`${total>0?Math.round((hot/total)*100):0}% of total`} color={T.red} icon="🔥"/>
      <StatCard label="Overflow Routed" value={overflow} sub="quality/cap balanced" color="#A78BFA" icon="↗"/>
      <StatCard label="Auto-Assigned" value={autoAssigned} sub="no contractor URL" color={T.cyan} icon="🤖"/>
    </div>

    {/* Row 1: By Industry + By City */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}} className="grid-1-mobile">
      <Card>
        <SectionLabel c="Leads by Industry"/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${T.border}`}}>
                {["Industry","Leads","Contractors","Avg/Contractor","Close %","Avg Score","Hot"].map(h=>(
                  <th key={h} style={{padding:"5px 8px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:500}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byIndustry.map((row,i)=>(
                <tr key={row.industry} style={{borderBottom:i<byIndustry.length-1?`1px solid ${T.border}`:"none"}}>
                  <td style={{padding:"9px 8px",fontWeight:600,color:T.white}}>{row.industry}</td>
                  <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.blueL}}>{row.leads}</td>
                  <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.muted}}>{row.contractors}</td>
                  <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.offWhite}}>{row.avgPerContractor}</td>
                  <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:row.closeRate>=30?T.green:row.closeRate>=15?T.amber:T.muted}}>{row.closeRate}%</td>
                  <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.amber}}>{row.avgScore}</td>
                  <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.red}}>{row.hot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionLabel c="Leads by City"/>
        {byCity.length===0
          ?<div style={{color:T.muted,fontSize:13,padding:"16px 0"}}>No city data yet — assign cities to contractors in Settings</div>
          :<div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${T.border}`}}>
                  {["City","Leads","Contractors","Avg/Contractor","Close %","Score"].map(h=>(
                    <th key={h} style={{padding:"5px 8px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byCity.map((row,i)=>(
                  <tr key={row.city} style={{borderBottom:i<byCity.length-1?`1px solid ${T.border}`:"none"}}>
                    <td style={{padding:"9px 8px",fontWeight:600,color:T.white}}>{row.city}</td>
                    <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.blueL}}>{row.leads}</td>
                    <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.muted}}>{row.contractors}</td>
                    <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.offWhite}}>{row.avgPerContractor}</td>
                    <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:row.closeRate>=30?T.green:row.closeRate>=15?T.amber:T.muted}}>{row.closeRate}%</td>
                    <td style={{padding:"9px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.amber}}>{row.avgScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </Card>
    </div>

    {/* Row 2: Lead Source + Quality Distribution */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}} className="grid-1-mobile">
      <Card>
        <SectionLabel c="Lead Source Breakdown"/>
        {sourceBreakdown.map(s=><HBar key={s.key} label={s.label} value={s.count} max={total} color={s.color} right={`${s.count} (${total>0?Math.round((s.count/total)*100):0}%)`}/>)}
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`,fontSize:11,color:T.muted}}>
          Overflow = lead re-routed by cap or quality balancing. Auto = no contractor URL in referral.
        </div>
      </Card>

      <Card>
        <SectionLabel c="Lead Quality Distribution"/>
        {[
          {label:"🔥 Hot (75+)",val:qualityDist.hot,color:T.red},
          {label:"☀️ Warm (50–74)",val:qualityDist.warm,color:T.amber},
          {label:"❄️ Cold (<50)",val:qualityDist.cold,color:T.muted},
        ].map(r=><HBar key={r.label} label={r.label} value={r.val} max={total} color={r.color}/>)}
        <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:6}}>Quality balance score</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,color:T.amber,fontWeight:700}}>{avgScore}<span style={{fontSize:13,color:T.muted}}>/100</span></div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>Platform avg lead score</div>
        </div>
      </Card>

      <Card>
        <SectionLabel c="Urgency & Close Rate"/>
        {urgencyBreakdown.map(u=>(
          <div key={u.label} style={{marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:13,color:T.offWhite}}>{u.label}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>{u.count} leads</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}>
                <div style={{width:`${u.closeRate}%`,height:"100%",background:u.label.includes("Emergency")?T.red:u.label.includes("Week")?T.amber:T.muted,borderRadius:2}}/>
              </div>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,flexShrink:0}}>{u.closeRate}% close</span>
            </div>
          </div>
        ))}
      </Card>
    </div>

    {/* Row 3: Weekly trend + Budget distribution */}
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:12}} className="grid-1-mobile">
      <Card>
        <SectionLabel c="Weekly Lead Volume (platform-wide)"/>
        {weekTrend.length===0
          ?<div style={{color:T.muted,fontSize:13}}>No trend data yet</div>
          :<div>
            <div style={{display:"flex",alignItems:"flex-end",gap:4,height:100,marginBottom:8}}>
              {weekTrend.map((w,i)=>{
                const mx=Math.max(...weekTrend.map(x=>x.total),1);
                const h=Math.round((w.total/mx)*100);
                return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{fontSize:8,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{w.total}</div>
                  <div style={{width:"100%",position:"relative",borderRadius:"3px 3px 0 0",overflow:"hidden",height:`${h}%`,minHeight:4}}>
                    <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${T.blue}80,${T.blueL})`}}/>
                    {w.won>0&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:`${Math.round((w.won/w.total)*100)}%`,background:T.green+"99"}}/>}
                    {w.hot>0&&<div style={{position:"absolute",top:0,left:0,right:0,height:`${Math.round((w.hot/w.total)*100)}%`,background:T.red+"60"}}/>}
                  </div>
                  <div style={{fontSize:7,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>W{i+1}</div>
                </div>;
              })}
            </div>
            <div style={{display:"flex",gap:14,fontSize:10,color:T.muted}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:T.blueL,flexShrink:0}}/>Total</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:T.green,flexShrink:0}}/>Won</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:T.red,flexShrink:0}}/>Hot</span>
            </div>
          </div>
        }
      </Card>

      <Card>
        <SectionLabel c="Budget Distribution"/>
        {budgetBands.map(b=><HBar key={b.key} label={b.label} value={b.count} max={total} color={T.blueL}/>)}
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`,fontSize:11,color:T.muted}}>
          Median budget band: <span style={{color:T.white,fontWeight:600}}>{budgetBands.sort((a,b)=>b.count-a.count)[0]?.label||"—"}</span>
        </div>
      </Card>
    </div>

    {/* Row 4: Plan performance + Top contractors */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:12,marginBottom:12}} className="grid-1-mobile">
      <Card>
        <SectionLabel c="Performance by Plan"/>
        {byPlan.map(p=>(
          <div key={p.plan} style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Pill color={p.plan==="Growth"?"won":"new"}>{p.plan}</Pill>
                <span style={{fontSize:12,color:T.muted}}>{p.plan==="Growth"?"$499/mo":"$299/mo"}</span>
              </div>
              <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted}}>{p.contractors} contractors</span>
            </div>
            {[
              {label:"Leads this period",val:p.leads,color:T.blueL},
              {label:"Close rate",val:`${p.closeRate}%`,color:T.green},
              {label:"Avg per contractor",val:p.avgPerContractor,color:T.amber},
              {label:"At cap",val:`${p.atCap} / ${p.contractors}`,color:p.atCap>0?T.red:T.muted},
            ].map(r=>(
              <div key={r.label} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:T.muted}}>{r.label}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:r.color,fontWeight:600}}>{r.val}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>

      <Card>
        <SectionLabel c="Top Contractors by Close Rate"/>
        {contractorPerf.length===0
          ?<div style={{color:T.muted,fontSize:13}}>No closed leads yet</div>
          :<div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${T.border}`}}>
                  {["Company","City","Industry","Leads","Won","Close%","Avg Score"].map(h=>(
                    <th key={h} style={{padding:"5px 8px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contractorPerf.slice(0,10).map((c,i)=>(
                  <tr key={c.id} style={{borderBottom:i<Math.min(contractorPerf.length,10)-1?`1px solid ${T.border}`:"none"}}>
                    <td style={{padding:"8px 8px",fontWeight:600,color:T.white,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company||c.email}</td>
                    <td style={{padding:"8px 8px",color:T.muted,fontSize:11}}>{c.city||"—"}</td>
                    <td style={{padding:"8px 8px",color:T.offWhite}}>{c.industry||"—"}</td>
                    <td style={{padding:"8px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.blueL}}>{c.leads}</td>
                    <td style={{padding:"8px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.green}}>{c.won}</td>
                    <td style={{padding:"8px 8px",fontFamily:"'JetBrains Mono',monospace",color:c.closeRate>=30?T.green:c.closeRate>=15?T.amber:T.muted,fontWeight:700}}>{c.closeRate}%</td>
                    <td style={{padding:"8px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.amber}}>{c.avgScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </Card>
    </div>

    {/* Row 5: Market gaps (marketing intelligence) */}
    <Card style={{marginBottom:12}}>
      <SectionLabel c="Market Gaps — Untapped Industry × City Combinations"/>
      <p style={{fontSize:12,color:T.muted,marginBottom:14}}>Cities where you have leads but no contractor for that industry. These are your highest-value sales targets.</p>
      {gaps.length===0
        ?<div style={{color:T.green,fontSize:13}}>✓ All active cities have coverage across all industries</div>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
          {gaps.slice(0,12).map((g,i)=>(
            <div key={i} style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:10,padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:16}}>{g.industry==="HVAC"?"🌬️":g.industry==="Roofing"?"🏠":g.industry==="Plumbing"?"🔧":"⚡"}</span>
                <span style={{fontSize:13,fontWeight:600,color:T.white}}>{g.industry}</span>
              </div>
              <div style={{fontSize:12,color:T.muted,marginBottom:4}}>{g.city}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{flex:1,height:3,background:T.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{width:`${Math.min(g.demand*10,100)}%`,height:"100%",background:T.red,borderRadius:2}}/>
                </div>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.red,flexShrink:0}}>{g.demand} unrouted</span>
              </div>
            </div>
          ))}
        </div>
      }
    </Card>

    {/* Row 6: Contractor health snapshot */}
    <Card>
      <SectionLabel c="Contractor Health Snapshot"/>
      <p style={{fontSize:12,color:T.muted,marginBottom:14}}>Contractors sorted by activity. Use this to identify who needs check-ins, upsell opportunities, or churn risk.</p>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Company","City","Industry","Plan","Leads","Won","Close%","Avg Score","Cap Used","Status"].map(h=>(
                <th key={h} style={{padding:"6px 8px",textAlign:"left",fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...contractorPerf,...contractors.filter(c=>!contractorPerf.find(p=>p.id===c.id)).map(c=>({...c,leads:0,won:0,closeRate:0,avgScore:0}))].map((c,i,arr)=>{
              const cap=c.plan==="Growth"?50:20;
              const capPct=Math.round((c.leads/cap)*100);
              const billingFlag=c.billing_status==="cancel_pending"?"🟠 Cancel Pending":c.billing_status==="past_due"?"🔴 Past Due":c.billing_status==="cancelled"?"⚫ Cancelled":"";
              const status=billingFlag||(c.leads===0?"😴 Inactive":capPct>=100?"🔴 At Cap":capPct>=80?"🟡 Near Cap":c.closeRate>=30?"🟢 Performing":"🔵 Active");
              return(
                <tr key={c.id} style={{borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                  <td style={{padding:"8px 8px",fontWeight:600,color:T.white,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company||c.email}</td>
                  <td style={{padding:"8px 8px",color:T.muted,fontSize:11}}>{c.city||"—"}</td>
                  <td style={{padding:"8px 8px",color:T.offWhite}}>{c.industry||"—"}</td>
                  <td style={{padding:"8px 8px"}}><Pill color={c.plan==="Growth"?"won":"new"}>{c.plan||"—"}</Pill></td>
                  <td style={{padding:"8px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.blueL}}>{c.leads}</td>
                  <td style={{padding:"8px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.green}}>{c.won}</td>
                  <td style={{padding:"8px 8px",fontFamily:"'JetBrains Mono',monospace",color:c.closeRate>=30?T.green:c.closeRate>=15?T.amber:T.muted}}>{c.closeRate}%</td>
                  <td style={{padding:"8px 8px",fontFamily:"'JetBrains Mono',monospace",color:T.amber}}>{c.avgScore}</td>
                  <td style={{padding:"8px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:40,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}>
                        <div style={{width:`${Math.min(capPct,100)}%`,height:"100%",background:capPct>=100?T.red:capPct>=80?T.amber:T.green,borderRadius:2}}/>
                      </div>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.muted}}>{capPct}%</span>
                    </div>
                  </td>
                  <td style={{padding:"8px 8px",fontSize:11}}>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  </div>;
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ adminUser, onLogout }) {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [impersonating, setImpersonating] = useState(null);
  const [impersonateLeads, setImpersonateLeads] = useState([]);
  const [impersonateLoading, setImpersonateLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("contractors");
  const [copiedId, setCopiedId] = useState(null);
  const [apps, setApps] = useState([]);
  const [cancelRequests, setCancelRequests] = useState(0);
  const [allBilling, setAllBilling] = useState([]);
  const [followUpCount, setFollowUpCount] = useState(0);

  // Load application count + billing alerts for badges
  useEffect(()=>{
    db.getApplications().then(d=>setApps(d)).catch(()=>{});
    db.getAllBilling().then(d=>{setAllBilling(d);setCancelRequests(d.filter(b=>b.status==="cancel_pending").length);}).catch(()=>{});
  },[]);
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [assigningLead, setAssigningLead] = useState(null);
  const [assignTarget, setAssignTarget] = useState("");

  const showToast = t => setToast(t);

  const loadContractors = async () => {
    setLoading(true);
    try { const d = await dbAdmin.getAllBusinesses(); setContractors(d); }
    catch (e) { showToast({ message: "Failed to load contractors", type: "error" }); }
    setLoading(false);
  };

  const loadUnassigned = async () => {
    try { const d = await db.getUnassignedLeads(); setUnassignedLeads(d); }
    catch (e) { console.error(e); }
  };
  useEffect(() => { loadContractors(); loadUnassigned(); }, []);

  const openImpersonate = async (contractor) => {
    setImpersonating(contractor);
    setImpersonateLoading(true);
    try {
      const leads = await dbAdmin.getLeadsForBusiness(contractor.id);
      setImpersonateLeads(leads);
    } catch (e) { showToast({ message: "Failed to load leads", type: "error" }); }
    setImpersonateLoading(false);
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast({ message: "URL copied!", type: "success" });
  };

  const getIntakeUrl = (c) => {
    const base = window.location.origin;
    const ind = (c.industry || "hvac").toLowerCase();
    return `${base}/?industry=${ind}&bid=${c.id}`;
  };

  const filtered = contractors.filter(c =>
    !search ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  const totalLeads = contractors.reduce((s, c) => s + (c.lead_count || 0), 0);
  const activePlans = contractors.filter(c => c.plan).length;

  // ── Impersonation view ──
  if (impersonating) {
    const leads = impersonateLeads;
    const total = leads.length;
    const won = leads.filter(l => l.status === "won").length;
    const active = leads.filter(l => l.status === "new" || l.status === "contacted").length;
    const avgScore = total > 0 ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / total) : 0;
    const sc = { new: leads.filter(l => l.status === "new").length, contacted: leads.filter(l => l.status === "contacted").length, won, lost: leads.filter(l => l.status === "lost").length };

    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", width: "100%" }}>
        {/* Impersonation banner */}
        <div style={{ background: "rgba(239,68,68,0.12)", border: "none", borderBottom: "1px solid rgba(239,68,68,0.25)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14 }}>👁️</span>
            <span style={{ fontSize: 13, color: "#F87171", fontWeight: 600 }}>Viewing as: {impersonating.company || impersonating.email}</span>
            <Pill color="lost">Admin View</Pill>
          </div>
          <Btn variant="danger" size="sm" onClick={() => { setImpersonating(null); setImpersonateLeads([]); }}>← Back to Admin</Btn>
        </div>

        <nav style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoMark size={24} />
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15 }}>{impersonating.company || "Contractor"}</span>
            <span style={{ fontSize: 11, color: T.muted }}>· {impersonating.plan} · {impersonating.city}</span>
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>Intake URL: <code style={{ fontFamily: "'JetBrains Mono',monospace", color: T.blueL, fontSize: 11 }}>{getIntakeUrl(impersonating)}</code></div>
        </nav>

        <div style={{ flex: 1, padding: "20px 24px", width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          {impersonateLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}><Spinner /><span style={{ color: T.muted }}>Loading leads…</span></div>
          ) : (
            <>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                {[{ label: "Total Leads", value: total, color: T.blueL }, { label: "Active", value: active, color: T.cyan }, { label: "Won", value: won, color: T.green }, { label: "Avg Score", value: avgScore, color: T.amber }].map(s => (
                  <div key={s.label} style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Contractor info card */}
              <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[["Email", impersonating.email], ["Phone", impersonating.phone], ["City", impersonating.city], ["Industry", impersonating.industry], ["Plan", impersonating.plan], ["Calendly", impersonating.calendly_url || "Not set"], ["Notify Email", impersonating.notify_email]].map(([k, v]) => v && (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13, color: T.white, fontWeight: 500, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</div>
                  </div>
                ))}
                {impersonating.notes && (
                  <div style={{ flex: "1 1 100%", marginTop: 8, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 10, color: T.muted, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Notes</div>
                    <div style={{ fontSize: 13, color: T.offWhite }}>{impersonating.notes}</div>
                  </div>
                )}
              </div>
              {/* Leads table */}
              <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1.4fr 70px 90px", padding: "10px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {["Lead", "Issue", "Budget", "Zip", "Score", "Tier", "Status"].map(h => <div key={h}>{h}</div>)}
                </div>
                {leads.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: T.muted }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
                    <div style={{ fontSize: 14, color: T.offWhite }}>No leads yet for this contractor</div>
                  </div>
                ) : leads.map((lead, i) => (
                  <div key={lead.id} onClick={() => setSelectedLead(lead)}
                    style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1.4fr 70px 90px", padding: "12px 16px", borderBottom: i < leads.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{lead.phone} · {new Date(lead.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontSize: 12, color: T.offWhite, alignSelf: "center" }}>{lead.is_name || lead.issue_type}</div>
                    <div style={{ fontSize: 12, color: T.offWhite, alignSelf: "center", textTransform: "capitalize" }}>{lead.budget?.replace(/_/g, " ")}</div>
                    <div style={{ fontSize: 12, color: T.offWhite, alignSelf: "center" }}>{lead.zip_code || "—"}</div>
                    <div style={{ alignSelf: "center" }}><ScoreBar score={lead.score} /></div>
                    <div style={{ alignSelf: "center" }}><Pill color={lead.tier}>{lead.tier}</Pill></div>
                    <div style={{ alignSelf: "center" }}><Pill color={lead.status}>{lead.status}</Pill></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} onStatusChange={() => {}} calendlyUrl={impersonating.calendly_url} />
        {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    );
  }

  // ── Main admin view ──
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", width: "100%" }}>
      <nav style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: `1px solid ${T.border}`, background: "rgba(9,12,17,0.97)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark size={26} />
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16 }}>Streamline</span>
          <span style={{ background: "rgba(239,68,68,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.07em", marginLeft: 4 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
  { id: "pipeline", label: `Pipeline ${apps.length>0?"("+apps.length+")":""}`, icon: "🎯" },
  { id: "billing", label: `Billing ${cancelRequests>0?"("+cancelRequests+")":""}`, icon: "💳" },
  { id: "invoicing", label: "Invoices", icon: "🧾" },
  { id: "monthend", label: "Month-End", icon: "📆" },
  { id: "trust", label: "Trust Scores", icon: "🛡️" },
  { id: "followup", label: `Follow-Up ${followUpCount>0?"("+followUpCount+")":""}`, icon: "📬" },
  { id: "contractors", label: "Contractors", icon: "👥" },
  { id: "unassigned", label: `Unassigned ${unassignedLeads.length > 0 ? "("+unassignedLeads.length+")" : ""}`, icon: "📥" },
  { id: "overview", label: "Analytics", icon: "📊" },
  { id: "tests", label: "Tests", icon: "🧪" },
].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? T.surface2 : "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, padding: "6px 13px", borderRadius: 7, color: activeTab === tab.id ? T.white : T.muted, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12 }}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.muted }}>{adminUser.email}</span>
          <Btn variant="outline" size="sm" onClick={onLogout} style={{ fontSize: 12, padding: "6px 10px" }}>Sign Out</Btn>
        </div>
      </nav>

      <div style={{ flex: 1, padding: "24px", width: "100%", maxWidth: 1400, margin: "0 auto" }}>
        {activeTab === "pipeline" ? (
          <ContractorCRM contractors={contractors} toast={showToast} adminUser={adminUser} onConvert={async()=>{await loadContractors();setActiveTab("contractors");}}/>
        ) : activeTab === "invoicing" ? (
          <AdminInvoicing contractors={contractors} toast={showToast}/>
        ) : activeTab === "billing" ? (
          <AdminBillingView contractors={contractors} allBilling={allBilling} onRefresh={()=>{db.getAllBilling().then(d=>{setAllBilling(d);setCancelRequests(d.filter(b=>b.status==="cancel_pending").length);});loadContractors();}} toast={showToast}/>
        ) : activeTab === "monthend" ? (
          <AdminMonthEndBilling contractors={contractors} toast={showToast}/>
        ) : activeTab === "trust" ? (
          <AdminTrustScores contractors={contractors} toast={showToast}/>
        ) : activeTab === "followup" ? (
          <AdminFollowUpQueue contractors={contractors} toast={showToast}/>
        ) : activeTab === "tests" ? (
          <AdminTestSuite contractors={contractors} toast={showToast}/>
        ) : activeTab === "overview" ? (
          <AdminStats contractors={contractors}/>
        ) : activeTab === "unassigned" ? (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, letterSpacing: -1, marginBottom: 3 }}>Unassigned Leads</h2>
                <p style={{ color: T.muted, fontSize: 13 }}>Leads from general ads with no contractor URL. Assign them manually.</p>
              </div>
              <Btn variant="outline" onClick={() => { loadUnassigned(); loadContractors(); }}>Refresh</Btn>
            </div>
            {unassignedLeads.length === 0 ? (
              <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 56, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 15, color: T.offWhite, marginBottom: 6 }}>No unassigned leads</div>
                <div style={{ fontSize: 13, color: T.muted }}>All leads from general ads have been assigned.</div>
              </div>
            ) : (
              <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1.2fr 80px 140px", padding: "10px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {["Lead", "Industry", "Issue", "Budget", "Score", "Tier", "Assign To"].map(h => <div key={h}>{h}</div>)}
                </div>
                {unassignedLeads.map((lead, i) => (
                  <div key={lead.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1.2fr 80px 140px", padding: "13px 16px", borderBottom: i < unassignedLeads.length - 1 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{lead.phone} · {lead.zip_code}</div>
                    </div>
                    <div style={{ fontSize: 12, color: T.offWhite }}>{lead.industry || "—"}</div>
                    <div style={{ fontSize: 12, color: T.offWhite }}>{lead.is_name || lead.issue_type}</div>
                    <div style={{ fontSize: 12, color: T.offWhite, textTransform: "capitalize" }}>{lead.budget?.replace(/_/g, " ") || "—"}</div>
                    <div><ScoreBar score={lead.score} /></div>
                    <div><Pill color={lead.tier}>{lead.tier}</Pill></div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      {assigningLead === lead.id ? (
                        <div style={{ display: "flex", gap: 5, width: "100%" }}>
                          <select value={assignTarget} onChange={e => setAssignTarget(e.target.value)} style={{ flex: 1, background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: 6, padding: "4px 6px", color: T.white, fontSize: 11, outline: "none", minWidth: 0 }}>
                            <option value="">Pick…</option>
                            {contractors.filter(c => !lead.industry || c.industry?.toLowerCase() === lead.industry?.toLowerCase()).map(c => (
                              <option key={c.id} value={c.id}>{c.company || c.email}</option>
                            ))}
                          </select>
                          <button onClick={async () => {
                            if (!assignTarget) return;
                            try {
                              await db.assignLeadToContractor(lead.id, assignTarget);
                              showToast({ message: "Lead assigned!", type: "success" });
                              setAssigningLead(null); setAssignTarget("");
                              loadUnassigned();
                            } catch (e) { showToast({ message: "Assignment failed", type: "error" }); }
                          }} style={{ background: T.green + "20", border: `1px solid ${T.green}50`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: T.green, fontSize: 11, fontWeight: 600 }}>✓</button>
                          <button onClick={() => { setAssigningLead(null); setAssignTarget(""); }} style={{ background: "none", border: `1px solid ${T.border2}`, borderRadius: 6, padding: "4px 6px", cursor: "pointer", color: T.muted, fontSize: 11 }}>✗</button>
                        </div>
                      ) : (
                        <button onClick={() => { setAssigningLead(lead.id); setAssignTarget(""); }} style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 6, padding: "5px 10px", cursor: "pointer", color: T.blueL, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>Assign →</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, letterSpacing: -1, marginBottom: 3 }}>Contractors</h2>
                <p style={{ color: T.muted, fontSize: 13 }}>{contractors.length} total · Click a row to view their dashboard · Click URL to copy</p>
              </div>
              <Btn onClick={() => { setEditingContractor(null); setShowModal(true); }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                + Add Contractor
              </Btn>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 14, maxWidth: 400 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company, city, industry…" style={{ width: "100%", background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 8, padding: "9px 12px 9px 32px", color: T.white, fontSize: 13, outline: "none" }} />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 12 }}>🔍</span>
            </div>

            {/* Table */}
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}><Spinner /><span style={{ color: T.muted }}>Loading contractors…</span></div>
            ) : (
              <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1.2fr 2.4fr 120px", padding: "10px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {["Company", "Industry", "City", "Plan", "Calendly", "Intake URL", ""].map(h => <div key={h}>{h}</div>)}
                </div>
                {filtered.length === 0 ? (
                  <div style={{ padding: 48, textAlign: "center", color: T.muted }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>👥</div>
                    <div style={{ fontSize: 14, color: T.offWhite, marginBottom: 6 }}>No contractors yet</div>
                    <div style={{ fontSize: 13, marginBottom: 20 }}>Click "Add Contractor" to onboard your first customer.</div>
                    <Btn onClick={() => { setEditingContractor(null); setShowModal(true); }}>+ Add First Contractor</Btn>
                  </div>
                ) : filtered.map((c, i) => {
                  const intakeUrl = getIntakeUrl(c);
                  const isCopied = copiedId === c.id;
                  return (
                    <div key={c.id}
                      style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1.2fr 2.4fr 120px", padding: "13px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none", transition: "background 0.15s", alignItems: "center" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {/* Company */}
                      <div style={{ cursor: "pointer" }} onClick={() => openImpersonate(c)}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.white, marginBottom: 1 }}>{c.company || "—"}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{c.email}</div>
                      </div>
                      {/* Industry */}
                      <div style={{ fontSize: 12, color: T.offWhite }}>{c.industry || "—"}</div>
                      {/* City */}
                      <div style={{ fontSize: 12, color: T.offWhite }}>{c.city || "—"}</div>
                      {/* Plan */}
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>
                        <Pill color={c.plan === "Growth" ? "won" : "new"}>{c.plan || "—"}</Pill>
                      </div>
                      {/* Calendly */}
                      <div style={{ fontSize: 11, color: c.calendly_url ? T.green : T.muted }}>{c.calendly_url ? "✓ Set" : "Not set"}</div>
                      {/* Intake URL */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: T.blueL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{intakeUrl}</code>
                        <button onClick={e => { e.stopPropagation(); copyUrl(intakeUrl, c.id); }} style={{ background: isCopied ? "rgba(16,185,129,0.15)" : T.surface2, border: `1px solid ${isCopied ? T.green : T.border2}`, borderRadius: 5, padding: "3px 8px", cursor: "pointer", color: isCopied ? T.green : T.muted, fontSize: 10, fontWeight: 600, flexShrink: 0, transition: "all 0.2s" }}>
                          {isCopied ? "✓" : "Copy"}
                        </button>
                      </div>
                      {/* Actions */}
                      <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openImpersonate(c)} title="View their dashboard" style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: T.blueL, fontSize: 11, fontWeight: 600 }}>View</button>
                        <button onClick={() => { setEditingContractor(c); setShowModal(true); }} title="Edit" style={{ background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: T.muted, fontSize: 11 }}>Edit</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ContractorModal
          contractor={editingContractor}
          onClose={() => { setShowModal(false); setEditingContractor(null); }}
          onSave={loadContractors}
          toast={showToast}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

// ─── F. EARNINGS VIEW (Contractor) ────────────────────────────────────────────
function EarningsView({leads,user}){
  const [invoices,setInvoices]=useState([]);
  const [billing,setBilling]=useState(null);
  useEffect(()=>{
    db.getInvoices(user.id).then(d=>setInvoices(d)).catch(()=>{});
    db.getBilling(user.id).then(d=>setBilling(d)).catch(()=>{});
  },[user.id]);

  const wonLeads=leads.filter(l=>l.status==="won");
  const perfFee=user.plan==="Growth"?100:150;
  const monthStart=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const wonThisMonth=wonLeads.filter(l=>new Date(l.completed_at||l.created_at)>=monthStart);
  const unbilledJobs=wonLeads.filter(l=>!l.billed);
  const unbilledFees=unbilledJobs.length*perfFee;
  const totalJobValue=wonLeads.reduce((s,l)=>s+Number(l.job_value||0),0);
  const totalPaid=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const totalOwed=invoices.filter(i=>i.status==="sent").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const subFee=user.plan==="Growth"?499:299;
  const closeRate=leads.length>0?Math.round((wonLeads.length/leads.length)*100):0;
  const roi=totalJobValue>0&&totalPaid>0?Math.round((totalJobValue/(totalPaid+subFee))*10)/10:0;

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Earnings</h2>
        <p style={{color:T.muted,fontSize:13}}>Your revenue, fees, and ROI from Streamline leads.</p>
      </div>

      {/* KPI grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}} className="grid-2-mobile">
        {[
          {label:"Total Job Revenue",value:`$${totalJobValue.toLocaleString()}`,color:T.green,icon:"💰",sub:"From won leads"},
          {label:"Fees Paid",value:`$${totalPaid.toLocaleString()}`,color:T.amber,icon:"🧾",sub:"Performance fees invoiced"},
          {label:"Fees Owed",value:`$${totalOwed.toLocaleString()}`,color:totalOwed>0?T.red:T.muted,icon:"⏳",sub:"Awaiting payment"},
          {label:"Return on Spend",value:roi>0?`${roi}×`:"—",color:T.cyan,icon:"📈",sub:"Revenue per $1 in fees"},
        ].map(s=>(
          <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:20,marginBottom:8}}>{s.icon}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:s.color,lineHeight:1,marginBottom:3}}>{s.value}</div>
            <div style={{fontSize:11,color:T.white,fontWeight:500,marginBottom:2}}>{s.label}</div>
            <div style={{fontSize:11,color:T.muted}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}} className="grid-1-mobile">
        {/* This month summary */}
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:20}}>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>This Month</div>
          {[
            ["Subscription",`$${subFee}/mo`,T.offWhite],
            ["Jobs closed",`${wonThisMonth.length} job${wonThisMonth.length!==1?"s":""}`,T.green],
            ["Performance fees",`$${wonThisMonth.length*perfFee}`,T.amber],
            ["Total cost this month",`$${subFee+wonThisMonth.length*perfFee}`,T.white],
          ].map(([k,v,c])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:13,color:T.muted}}>{k}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:600,color:c}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:14,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:T.offWhite}}>Est. revenue from closes</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:T.green}}>${wonThisMonth.reduce((s,l)=>s+Number(l.job_value||0),0).toLocaleString()}</span>
          </div>
        </div>

        {/* ROI breakdown */}
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:20}}>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Performance Breakdown</div>
          {[
            ["Leads received",leads.length],
            ["Jobs won",wonLeads.length],
            ["Close rate",`${closeRate}%`],
            ["Avg job value",wonLeads.length>0?`$${Math.round(totalJobValue/wonLeads.length).toLocaleString()}`:"—"],
            ["Fee per job",`$${perfFee} flat`],
            ["Unbilled jobs",`${unbilledJobs.length} · $${unbilledFees} pending`],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:13,color:T.muted}}>{k}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:500,color:T.offWhite}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice history */}
      <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Invoice History</div>
        {invoices.length===0?(
          <div style={{padding:40,textAlign:"center",color:T.muted,fontSize:13}}>No invoices yet — your first invoice will appear here after your first month-end billing.</div>
        ):invoices.map((inv,i)=>(
          <div key={inv.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 100px",padding:"12px 18px",borderBottom:i<invoices.length-1?`1px solid ${T.border}`:"none",alignItems:"center",fontSize:13}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",color:T.blueL,fontWeight:600}}>{inv.invoice_number}</div>
            <div style={{color:T.muted}}>{inv.period}</div>
            <div style={{color:T.offWhite}}>{inv.line_item_count} job{inv.line_item_count!==1?"s":""}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:inv.status==="paid"?T.green:T.amber}}>${Number(inv.total_amount||0).toLocaleString()}</div>
            <div><span style={{fontSize:10,background:inv.status==="paid"?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.1)",color:inv.status==="paid"?T.green:T.amber,border:`1px solid ${inv.status==="paid"?"rgba(16,185,129,0.3)":"rgba(245,158,11,0.3)"}`,borderRadius:4,padding:"2px 8px",fontWeight:600,textTransform:"uppercase"}}>{inv.status}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── G. GOALS VIEW (Contractor) ───────────────────────────────────────────────
function GoalsView({leads,user,toast}){
  const storageKey=`goals_${user.id}`;
  const [goals,setGoals]=useState({contactTarget:10,closeTarget:3,revenueTarget:10000});
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState({});

  useEffect(()=>{
    try{const saved=localStorage.getItem(storageKey);if(saved)setGoals(JSON.parse(saved));}catch(e){}
  },[storageKey]);

  const saveGoals=()=>{
    const updated={...goals,...draft};
    setGoals(updated);
    try{localStorage.setItem(storageKey,JSON.stringify(updated));}catch(e){}
    setEditing(false);
    toast({message:"Goals saved",type:"success"});
  };

  const now=new Date();
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  const monthLeads=leads.filter(l=>new Date(l.created_at)>=monthStart);
  const contacted=monthLeads.filter(l=>l.status==="contacted"||l.status==="won").length;
  const closed=monthLeads.filter(l=>l.status==="won").length;
  const revenue=monthLeads.filter(l=>l.status==="won").reduce((s,l)=>s+Number(l.job_value||0),0);
  const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const daysPassed=now.getDate();
  const pctMonth=Math.round((daysPassed/daysInMonth)*100);

  const metrics=[
    {label:"Leads Contacted",current:contacted,target:goals.contactTarget,color:T.cyan,icon:"📞",unit:"",hint:"Leads you've called or messaged this month"},
    {label:"Jobs Closed",current:closed,target:goals.closeTarget,color:T.green,icon:"✓",unit:"",hint:"Won jobs logged this month"},
    {label:"Revenue Generated",current:revenue,target:goals.revenueTarget,color:T.amber,icon:"💰",unit:"$",hint:"Total job value from won leads this month"},
  ];

  const daysLeft=daysInMonth-daysPassed;
  const onTrack=metrics.filter(m=>{
    const pctGoal=(m.current/m.target)*100;
    return pctGoal>=pctMonth;
  }).length;

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Monthly Goals</h2>
          <p style={{color:T.muted,fontSize:13}}>{now.toLocaleString("default",{month:"long",year:"numeric"})} · {daysLeft} days left · {onTrack}/3 goals on track</p>
        </div>
        <Btn variant="outline" onClick={()=>{setDraft({contactTarget:goals.contactTarget,closeTarget:goals.closeTarget,revenueTarget:goals.revenueTarget});setEditing(true);}}>Edit Goals</Btn>
      </div>

      {/* Month progress bar */}
      <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 18px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
          <span style={{color:T.muted}}>Month progress</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",color:T.offWhite}}>{daysPassed}/{daysInMonth} days ({pctMonth}%)</span>
        </div>
        <div style={{height:4,background:T.border,borderRadius:2,overflow:"hidden"}}>
          <div style={{width:`${pctMonth}%`,height:"100%",background:`linear-gradient(90deg,${T.blue},${T.cyan})`,borderRadius:2,transition:"width 0.5s ease"}}/>
        </div>
      </div>

      {/* Goal cards */}
      <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:24}}>
        {metrics.map(m=>{
          const pct=m.target>0?Math.min(Math.round((m.current/m.target)*100),100):0;
          const onT=(m.current/m.target)*100>=pctMonth;
          const remaining=Math.max(m.target-m.current,0);
          return(
            <div key={m.label} style={{background:T.surface,border:`1px solid ${onT?"rgba(16,185,129,0.25)":T.border2}`,borderRadius:12,padding:"20px 22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:18}}>{m.icon}</span>
                    <span style={{fontSize:15,fontWeight:600,color:T.white}}>{m.label}</span>
                    <span style={{fontSize:10,background:onT?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.1)",color:onT?T.green:T.amber,border:`1px solid ${onT?"rgba(16,185,129,0.3)":"rgba(245,158,11,0.3)"}`,borderRadius:4,padding:"2px 7px",fontWeight:600}}>{onT?"ON TRACK":"BEHIND"}</span>
                  </div>
                  <div style={{fontSize:12,color:T.muted}}>{m.hint}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:m.color,lineHeight:1}}>{m.unit}{typeof m.current==="number"&&m.unit==="$"?m.current.toLocaleString():m.current}</div>
                  <div style={{fontSize:11,color:T.muted}}>of {m.unit}{m.unit==="$"?Number(m.target).toLocaleString():m.target} goal</div>
                </div>
              </div>
              <div style={{height:8,background:T.border,borderRadius:4,overflow:"hidden",marginBottom:6}}>
                <div style={{width:`${pct}%`,height:"100%",background:pct>=100?T.green:pct>=pctMonth?T.blue:T.amber,borderRadius:4,transition:"width 0.6s ease"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.muted}}>
                <span>{pct}% complete</span>
                <span>{remaining>0?`${m.unit}${m.unit==="$"?remaining.toLocaleString():remaining} to go`:"✓ Goal reached!"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips based on performance */}
      <div style={{background:"rgba(37,99,235,0.06)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:12,padding:"16px 18px"}}>
        <div style={{fontSize:13,fontWeight:600,color:T.blueL,marginBottom:10}}>💡 This month's focus</div>
        {closed<goals.closeTarget&&daysLeft<=7&&<div style={{fontSize:13,color:T.offWhite,marginBottom:6}}>⚡ Final stretch — {goals.closeTarget-closed} more close{goals.closeTarget-closed!==1?"s":""} needed. Follow up with all "Contacted" leads today.</div>}
        {contacted<goals.contactTarget&&<div style={{fontSize:13,color:T.offWhite,marginBottom:6}}>📞 You have {leads.filter(l=>l.status==="new").length} new uncontacted lead{leads.filter(l=>l.status==="new").length!==1?"s":""}. Call within 1 hour for best close rate.</div>}
        {closed>=goals.closeTarget&&<div style={{fontSize:13,color:T.green,marginBottom:6}}>🎉 Close goal reached! Consider raising your target next month.</div>}
        <div style={{fontSize:12,color:T.muted}}>Leads contacted within 1 hour close at 3× the rate of those called after 24 hours.</div>
      </div>

      {/* Edit goals modal */}
      <Modal open={editing} onClose={()=>setEditing(false)} title="Set Monthly Goals">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <p style={{fontSize:13,color:T.muted}}>Set realistic monthly targets. These are private and only visible to you.</p>
          <Inp label="Leads to Contact" value={String(draft.contactTarget||"")} onChange={v=>setDraft(d=>({...d,contactTarget:Number(v)}))} type="number" placeholder="10" hint="How many leads will you call or message this month?"/>
          <Inp label="Jobs to Close" value={String(draft.closeTarget||"")} onChange={v=>setDraft(d=>({...d,closeTarget:Number(v)}))} type="number" placeholder="3" hint="How many won jobs are you targeting?"/>
          <Inp label="Revenue Goal ($)" value={String(draft.revenueTarget||"")} onChange={v=>setDraft(d=>({...d,revenueTarget:Number(v)}))} type="number" placeholder="10000" hint="Total job value from won leads this month"/>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="outline" onClick={()=>setEditing(false)} style={{flex:1}}>Cancel</Btn>
            <Btn onClick={saveGoals} style={{flex:2}}>Save Goals</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── H. RESOURCES VIEW (Contractor) ───────────────────────────────────────────
function ResourcesView({user}){
  const [open,setOpen]=useState(null);
  const intakeUrl=`${window.location.origin}/?industry=${(user.industry||"hvac").toLowerCase()}&bid=${user.id}`;

  const RESOURCES=[
    {
      id:"follow_up_script",icon:"📞",title:"Follow-Up Call Script",tag:"Sales",
      preview:"A proven 3-minute script for calling new leads within the first hour.",
      content:`FOLLOW-UP CALL SCRIPT
─────────────────────
Best time to call: within 60 minutes of receiving the lead.

OPENING (15 seconds)
"Hi, is this [Name]? Great — this is [Your Name] from [Company]. You just filled out a request for [service type] help. I'm calling to introduce myself and get you taken care of. Do you have about 2 minutes?"

DISCOVERY (60 seconds)
• "Can you tell me a bit more about what's going on?"
• "How long has this been an issue?"
• "Is this affecting your comfort/daily routine right now?"
• "When are you hoping to get this resolved?"

POSITIONING (30 seconds)
"Based on what you've told me, this sounds like something we can definitely help with. We specialize in [industry] in [city] and typically have availability within [X days]."

NEXT STEP (30 seconds)
"I'd love to come take a look and give you a no-obligation quote. What's better for you — [Day A] or [Day B]?"

OBJECTION: "I'm getting other quotes"
→ "That's totally reasonable. I'd just ask that you give us a shot — our quotes are free, and we'll show you exactly what the work involves so you can compare apples to apples."

OBJECTION: "I need to think about it"
→ "Of course. Can I follow up with you [specific day]? Issues like this often get more expensive the longer they wait, and I want to make sure you have all the info you need."

CLOSE
"Perfect. I'll send you a confirmation text with my contact info. See you [Day/Time]."

POST-CALL
• Mark lead as "Contacted" in your Streamline dashboard
• Send a brief text: "Hi [Name], it's [Your Name] from [Company]. Looking forward to seeing you [Day] at [Time]. Text me if anything changes."`,
    },
    {
      id:"lsa_setup",icon:"🔍",title:"Google LSA Setup Guide",tag:"Marketing",
      preview:"Step-by-step: get your Local Services Ads live using your Streamline intake URL.",
      content:`GOOGLE LOCAL SERVICES ADS — SETUP GUIDE
─────────────────────────────────────────
Your Streamline intake URL: ${intakeUrl}

STEP 1: CREATE YOUR LSA ACCOUNT
1. Go to ads.google.com/local-services-ads
2. Select your business category (HVAC, Roofing, etc.)
3. Enter your service area (Columbus, OH metro)
4. Complete the background check + license verification

STEP 2: SET YOUR BUDGET
• Start with $20–40/day budget
• LSAs charge per lead (call or message), not per click
• Average cost per lead in Columbus: $15–35
• You only pay for leads in your service category

STEP 3: LINK YOUR INTAKE URL
In your Google Business Profile (linked to LSA):
• Add your Streamline intake URL as your website
• This captures leads through your scoring system
• URL: ${intakeUrl}

STEP 4: OPTIMIZE YOUR PROFILE
• Upload 5+ real job photos
• Ask every customer for a Google review
• Aim for 10+ reviews before running ads aggressively
• Respond to every review (Google rewards this)

STEP 5: KEYWORDS TO TARGET
High-intent (bid aggressively):
• "[service] repair near me"
• "emergency [service] [city]"
• "[service] replacement cost"
• "best [service] contractor [city]"

STEP 6: TRACK RESULTS
• Mark every LSA lead as Won/Lost in Streamline
• After 30 days, compare LSA close rate vs. Streamline close rate
• Adjust budget to favor best-performing channel

PRO TIP: Your Streamline intake URL pre-qualifies leads before they contact you. This means your LSA leads go through scoring automatically — you'll see their score in your dashboard within seconds.`,
    },
    {
      id:"objection_handling",icon:"🛡️",title:"Objection Handling Playbook",tag:"Sales",
      preview:"The 8 most common objections and exactly how to respond.",
      content:`OBJECTION HANDLING PLAYBOOK
────────────────────────────

PRICE OBJECTIONS

"That's more than I expected."
→ "I understand — let me walk you through exactly what's included. A lot of our competitors quote low and add fees later. Our price covers [X, Y, Z] with no surprises. Would it help to see an itemized breakdown?"

"I got a cheaper quote from [Competitor]."
→ "That's worth exploring. A few questions: Did they give you a written quote? Are they licensed and insured? What's their warranty? Price differences usually come down to one of those three things."

"I can't afford it right now."
→ "That's fair. We do offer [payment plans / financing]. Would splitting it into monthly payments make this work for your budget?"

TIMING OBJECTIONS

"I'm not ready yet."
→ "I completely understand. Just so you know, [issue] tends to get more expensive over time — what starts as a $X repair can become a $X replacement if it fails completely. I'm not trying to pressure you, but what would need to happen for you to feel ready?"

"I need to talk to my spouse."
→ "Of course — that's totally normal. Would it be helpful if I put together a written summary you can share with them? I can also make myself available for a call with both of you."

TRUST OBJECTIONS

"I've had bad experiences with contractors."
→ "I'm sorry to hear that — it happens more than it should in our industry. Here's what's different about us: [specific proof: reviews, BBB rating, license number, guarantee]. I'd also encourage you to check our Google reviews before committing to anything."

"You're not the cheapest option."
→ "You're right, and I'm not going to pretend otherwise. What we offer is [quality/warranty/response time/guarantee]. For most homeowners, the right question isn't 'cheapest' — it's 'who will I trust in my home and who will stand behind their work.'"

"Do you have references?"
→ "Absolutely — I'll text you three customer contacts right now. I'd also point you to our Google reviews. Happy to wait while you check."`,
    },
    {
      id:"seasonal_calendar",icon:"📅",title:"Seasonal Marketing Calendar",tag:"Strategy",
      preview:"When to run ads, what to promote, and how to prep for each season.",
      content:`SEASONAL MARKETING CALENDAR — ${user.industry?.toUpperCase()||"YOUR INDUSTRY"}
─────────────────────────────────────────

JANUARY–FEBRUARY (Winter)
Focus: Emergency response + heating
• Run urgency ads: "Furnace out? Same-day service"
• Target homeowners with older systems (10+ years)
• Offer free heating safety inspections as lead-gen
• Best converting headline: "Don't freeze — [Company] is 1 call away"

MARCH–APRIL (Early Spring)
Focus: Pre-season prep
• Push tune-up campaigns before heat arrives
• "Schedule your AC checkup before the rush"
• Google LSA budget: increase 20% in late March
• Follow up with last year's customers for annual service

MAY–JUNE (Late Spring / Early Summer)
Focus: Replacement season
• Best time for big-ticket installs (AC, roof, panel upgrade)
• Leads are highest intent + highest budget
• Run "limited availability" messaging — it's true, you're busy
• Ask every happy customer for a Google review this month

JULY–AUGUST (Peak Summer)
Focus: Emergency work
• Highest volume, fastest close rates
• Emergency response time is your #1 selling point
• Keep capacity for same-day/next-day calls
• Consider a small premium for emergency calls

SEPTEMBER–OCTOBER (Fall)
Focus: End-of-season + prep
• "Last chance to fix it before winter" messaging
• Gutter cleaning, roof inspection, furnace prep
• Offer end-of-season discounts to fill gaps in schedule
• Re-engage leads that went cold in summer

NOVEMBER–DECEMBER (Holiday)
Focus: Pre-winter + indoor projects
• "Get it done before the holidays" messaging
• Homeowners motivated before guests arrive
• Electricians: holiday lighting circuits, generator installs
• Slowest period — use to follow up on outstanding quotes

YEAR-ROUND TACTICS
• Post one job photo per week on Google Business Profile
• Respond to every Google review within 24 hours
• Send a "how was your service?" text 3 days after every job
• Ask for referrals at the moment of payment (highest response rate)`,
    },
    {
      id:"pricing_guide",icon:"💲",title:"How to Price Jobs Confidently",tag:"Business",
      preview:"A framework for quoting accurately and defending your price.",
      content:`HOW TO PRICE JOBS CONFIDENTLY
──────────────────────────────

THE GOLDEN RULE
Never quote before you diagnose. A number without context loses every price battle.

STEP 1: UNDERSTAND THE FULL SCOPE
Before you quote anything:
• What exactly is broken or needed?
• How old is the existing equipment/structure?
• Any access issues? Permit required?
• What's the customer's timeline?

STEP 2: BUILD YOUR QUOTE WITH 4 COMPONENTS
1. Labor (your time + expertise + overhead)
2. Materials (parts, supplies, equipment)
3. Overhead (fuel, insurance, admin, tools)
4. Profit margin (15–25% is industry standard)

Most contractors undercharge because they forget overhead and margin.

STEP 3: PRESENT YOUR PRICE WITH CONTEXT
Don't just say the number. Say:
"Based on what I'm seeing, this job involves [X]. That includes [labor description], [parts], and a [warranty]. My price is $[X]."

STEP 4: ANCHOR HIGH, THEN JUSTIFY
Present the full-scope option first, then the budget option if needed. Customers make decisions relative to the first number they hear.

STEP 5: KNOW YOUR WALK-AWAY NUMBER
Before every estimate, decide:
• What's my minimum to do this profitably?
• Below that number, politely decline.
• A bad job at a bad price is worse than no job.

STEP 6: CLOSE THE ESTIMATE
After presenting price, go silent. The next person who speaks loses. Wait for them to respond before filling the silence.

If they say yes: confirm in writing, collect deposit, schedule.
If they say "let me think": ask what specific concern they have.
If they say no: ask if price or another factor is the issue.`,
    },
    {
      id:"review_script",icon:"⭐",title:"How to Ask for Google Reviews",tag:"Marketing",
      preview:"A simple system to consistently collect 5-star reviews.",
      content:`HOW TO ASK FOR GOOGLE REVIEWS
──────────────────────────────

WHY THIS MATTERS
• Every 10 reviews = ~12% increase in call volume (industry study)
• Google LSA rank is heavily weighted by reviews
• Leads see your reviews before they call you
• Your Streamline score and Google reviews compound trust

WHEN TO ASK
The best moment: right when the customer pays and is happiest.
Second best: 3 days after the job via text.
Never: in the middle of the job, or if there was a problem.

THE ASK (in person)
"[Name], I'm really glad we could take care of this for you today. If you're happy with the work, the biggest thing you can do for my business is leave us a Google review — it takes about 60 seconds and really makes a difference. I'll text you the link right now."

THE TEXT (send immediately after)
"Hi [Name], it's [Your Name] from [Company]. Thanks for choosing us! If you have 60 seconds, a Google review would mean a lot: [your Google review link]"

To find your Google review link:
1. Search your business name on Google
2. Click "Ask for reviews"
3. Copy the short link

FOLLOW-UP (if no review after 5 days)
"Hi [Name], just following up on the review link I sent — no pressure at all, but if you have a moment it would really help us out. Thanks!"

HOW TO RESPOND TO REVIEWS
• 5-star: "Thank you [Name]! We loved working with you — call us anytime."
• 4-star: "Thanks for the kind words! If there's anything we could have done better, please let us know."
• 1–3 star: "We're sorry to hear this, [Name]. Please call us at [number] so we can make it right."

GOAL: 2 new reviews per month minimum.`,
    },
  ];

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Resources</h2>
        <p style={{color:T.muted,fontSize:13}}>Scripts, guides, and playbooks to help you close more jobs.</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}} className="grid-1-mobile">
        {RESOURCES.map(r=>(
          <div key={r.id} onClick={()=>setOpen(r.id)} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"18px 20px",cursor:"pointer",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background=T.surface2;e.currentTarget.style.borderColor=T.blue+"60";}} onMouseLeave={e=>{e.currentTarget.style.background=T.surface;e.currentTarget.style.borderColor=T.border2;}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:38,height:38,borderRadius:9,background:"rgba(37,99,235,0.12)",border:"1px solid rgba(37,99,235,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{r.icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.white,lineHeight:1.3}}>{r.title}</div>
                <div style={{fontSize:10,color:T.blueL,fontWeight:600,marginTop:2}}>{r.tag}</div>
              </div>
            </div>
            <div style={{fontSize:12,color:T.muted,lineHeight:1.6,marginBottom:10}}>{r.preview}</div>
            <div style={{fontSize:11,color:T.blueL,fontWeight:600}}>Read guide →</div>
          </div>
        ))}
      </div>

      <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:"14px 18px",fontSize:13,color:T.offWhite,lineHeight:1.7,marginBottom:32}}>
        💡 <strong style={{color:T.green}}>Quick wins:</strong> The follow-up call script + asking for Google reviews are the two highest-ROI things you can implement this week. Most contractors skip both.
      </div>

      {/* External Sources */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.blueL,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:6}}>External Resources</div>
        <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,letterSpacing:-0.5,marginBottom:4,color:T.white}}>Industry Sources &amp; Reading</h3>
        <p style={{color:T.muted,fontSize:13,marginBottom:18}}>Vetted publications, government data sources, and tools used by top operators. Click any card to open.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}} className="grid-1-mobile">
          {[
            {icon:"📊",cat:"Market Data",name:"IBISWorld",url:"https://ibisworld.com",desc:"Paid industry research with annual market size, 5-year forecasts, and competitive landscapes for every trade sector."},
            {icon:"🏗️",cat:"Gov Data",name:"U.S. Census — Construction",url:"https://www.census.gov/topics/construction.html",desc:"Free government data on housing starts, building permits, and construction spending by region. Great for HVAC, roofing, plumbing, and electrical demand signals."},
            {icon:"💹",cat:"Pricing Index",name:"BLS Producer Price Index",url:"https://www.bls.gov/ppi",desc:"Track material price inflation monthly — construction inputs, HVAC equipment, copper, lumber. Free government data updated monthly."},
            {icon:"📰",cat:"HVAC",name:"ACHR News",url:"https://www.achrnews.com",desc:"Leading trade publication for HVAC contractors: industry trends, equipment news, refrigerant regulations, and business strategy."},
            {icon:"🏠",cat:"Roofing",name:"Roofing Contractor Magazine",url:"https://www.roofingcontractor.com",desc:"Trade news for roofing pros covering storm season, material pricing, manufacturer updates, and business best practices."},
            {icon:"🔧",cat:"Plumbing",name:"Plumbing & Mechanical",url:"https://www.pmmag.com",desc:"Trade coverage of plumbing and hydronics. Covers code changes, supply chain updates, water heater regulations, and contractor benchmarks."},
            {icon:"⚡",cat:"Electrical",name:"Electrical Contractor Magazine",url:"https://www.ecmag.com",desc:"NEC code updates, EV charger market growth data, solar integration trends, and workforce development for electrical contractors."},
            {icon:"💅",cat:"Beauty Schools",name:"NACCAS",url:"https://www.naccas.org",desc:"National Accrediting Commission for Career Arts & Sciences — accreditation standards, enrollment trends, and regulatory news for cosmetology and beauty schools."},
            {icon:"✂️",cat:"Beauty Schools",name:"PBA — Professional Beauty Assoc.",url:"https://www.probeauty.org",desc:"Industry data on salon employment, beauty school enrollment, and consumer spending on beauty services. Publishes annual industry stats."},
            {icon:"🌿",cat:"Landscaping",name:"Lawn & Landscape",url:"https://www.lawnandlandscape.com",desc:"Trade publication for landscaping and lawn care pros. Covers pricing benchmarks, equipment, labor market, and seasonal outlooks."},
            {icon:"⭐",cat:"Reputation",name:"ReviewTrackers Annual Report",url:"https://www.reviewtrackers.com/reports/online-reviews-survey",desc:"Consumer survey on how homeowners use Google reviews when hiring service contractors. Useful for benchmarking your review strategy."},
            {icon:"🔍",cat:"Advertising",name:"Google LSA Help Center",url:"https://support.google.com/google-ads/answer/7124569",desc:"Official documentation for Google Local Services Ads — setup, budget, verification, and optimization for service contractors."},
            {icon:"💼",cat:"Business",name:"SCORE Mentors",url:"https://www.score.org",desc:"Free small business mentorship from retired executives. Strong resources on pricing, hiring, financial modeling, and scaling a service business."},
            {icon:"📉",cat:"Economic Data",name:"FRED — Economic Data",url:"https://fred.stlouisfed.org",desc:"Federal Reserve economic database. Track housing market indicators, consumer spending, and local economic data for your market."},
            {icon:"🏛️",cat:"Licensing",name:"Contractor License Reference",url:"https://www.contractors-license.org",desc:"State-by-state contractor licensing requirements, renewal deadlines, and continuing education obligations for all trades."},
          ].map(s=>(
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
              style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 16px",textDecoration:"none",display:"block",transition:"all 0.18s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=T.surface2;e.currentTarget.style.borderColor="rgba(59,130,246,0.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=T.surface;e.currentTarget.style.borderColor=T.border2;}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
                <div style={{width:34,height:34,borderRadius:8,background:"rgba(37,99,235,0.1)",border:"1px solid rgba(37,99,235,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{s.icon}</div>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:600,color:T.white}}>{s.name}</span>
                    <span style={{fontSize:10,color:T.blueL}}>↗</span>
                  </div>
                  <span style={{fontSize:9,background:"rgba(37,99,235,0.1)",color:T.blueL,borderRadius:3,padding:"1px 6px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.cat}</span>
                </div>
              </div>
              <p style={{fontSize:12,color:T.muted,lineHeight:1.6,margin:0}}>{s.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Resource viewer modal */}
      {RESOURCES.filter(r=>r.id===open).map(r=>(
        <Modal key={r.id} open={true} onClose={()=>setOpen(null)} title={r.title} width={680}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <span style={{fontSize:11,background:"rgba(37,99,235,0.15)",color:T.blueL,border:"1px solid rgba(37,99,235,0.3)",borderRadius:4,padding:"2px 8px",fontWeight:600}}>{r.tag}</span>
            </div>
            <pre style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.offWhite,lineHeight:1.8,background:T.surface2,border:`1px solid ${T.border}`,borderRadius:10,padding:18,overflowX:"auto",whiteSpace:"pre-wrap",margin:0}}>{r.content}</pre>
            <div style={{marginTop:14,display:"flex",gap:8}}>
              <button onClick={()=>{navigator.clipboard.writeText(r.content);}} style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"8px 14px",cursor:"pointer",color:T.offWhite,fontSize:12,fontWeight:500}}>📋 Copy to clipboard</button>
              <Btn variant="outline" onClick={()=>setOpen(null)} style={{marginLeft:"auto"}}>Close</Btn>
            </div>
          </div>
        </Modal>
      ))}
    </div>
  );
}

// ─── A. ADMIN TRUST SCORES ────────────────────────────────────────────────────
function AdminTrustScores({contractors,toast}){
  const [allLeads,setAllLeads]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    db.getAllWonLeads().then(won=>{
      // Also grab all leads to calculate lost rates
      Promise.all(contractors.map(c=>db.getLeads(c.id).catch(()=>[]))).then(results=>{
        const flat=results.flat();
        setAllLeads(flat);
        setLoading(false);
      });
    }).catch(()=>setLoading(false));
  },[contractors.length]);

  const scored=contractors.map(c=>{
    const cLeads=allLeads.filter(l=>l.business_id===c.id);
    const total=cLeads.length;
    const won=cLeads.filter(l=>l.status==="won").length;
    const lost=cLeads.filter(l=>l.status==="lost").length;
    const closeRate=total>0?Math.round((won/total)*100):null;
    const lostRate=total>0?Math.round((lost/total)*100):null;
    // Suspicious: high score leads (75+) lost quickly (<48h)
    const highScoreLeads=cLeads.filter(l=>l.score>=75);
    const suspiciousLosses=cLeads.filter(l=>{
      if(l.status!=="lost"||l.score<75)return false;
      const created=new Date(l.created_at);
      const updated=new Date(l.updated_at||l.created_at);
      return (updated-created)<48*60*60*1000;
    }).length;
    // Trust tier
    let tier="trusted",tierColor=T.green,tierIcon="🟢";
    if(suspiciousLosses>=3||(closeRate!==null&&closeRate<5&&total>=10)){tier="review";tierColor=T.red;tierIcon="🔴";}
    else if(suspiciousLosses>=1||(closeRate!==null&&closeRate<10&&total>=5)){tier="watch";tierColor=T.amber;tierIcon="🟡";}
    return{...c,total,won,lost,closeRate,lostRate,suspiciousLosses,tier,tierColor,tierIcon};
  }).sort((a,b)=>b.suspiciousLosses-a.suspiciousLosses||(a.closeRate||100)-(b.closeRate||100));

  const platformCloseRate=allLeads.length>0?Math.round((allLeads.filter(l=>l.status==="won").length/allLeads.length)*100):0;

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,letterSpacing:-1,marginBottom:3}}>Contractor Trust Scores</h2>
          <p style={{color:T.muted,fontSize:13}}>Platform close rate: <strong style={{color:T.white}}>{platformCloseRate}%</strong> · Flags suspicious loss patterns on high-score leads</p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"🟢 Trusted",value:scored.filter(c=>c.tier==="trusted").length,color:T.green},
          {label:"🟡 Watch",value:scored.filter(c=>c.tier==="watch").length,color:T.amber},
          {label:"🔴 Review",value:scored.filter(c=>c.tier==="review").length,color:T.red},
        ].map(s=>(
          <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{fontSize:13,color:T.offWhite}}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,gap:12}}><Spinner/><span style={{color:T.muted}}>Analyzing contractor patterns…</span></div>
      ):(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 80px 1fr 1fr 1fr 1fr 120px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
            {["Contractor","Trust","Leads","Close Rate","Lost Rate","⚠ Suspicious","vs. Platform"].map(h=><div key={h}>{h}</div>)}
          </div>
          {scored.map((c,i)=>{
            const diff=c.closeRate!==null?c.closeRate-platformCloseRate:null;
            return(
              <div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 80px 1fr 1fr 1fr 1fr 120px",padding:"13px 16px",borderBottom:i<scored.length-1?`1px solid ${T.border}`:"none",alignItems:"center",background:c.tier==="review"?"rgba(239,68,68,0.03)":c.tier==="watch"?"rgba(245,158,11,0.03)":"none"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{c.company||c.email}</div>
                  <div style={{fontSize:11,color:T.muted}}>{c.industry} · {c.city}</div>
                </div>
                <div><span style={{fontSize:18}}>{c.tierIcon}</span></div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:T.muted}}>{c.total}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:c.closeRate!==null?(c.closeRate>=20?T.green:c.closeRate>=10?T.amber:T.red):T.muted}}>{c.closeRate!==null?`${c.closeRate}%`:"—"}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:T.muted}}>{c.lostRate!==null?`${c.lostRate}%`:"—"}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:c.suspiciousLosses>0?T.red:T.muted,fontWeight:c.suspiciousLosses>0?700:400}}>{c.suspiciousLosses>0?`${c.suspiciousLosses} flagged`:"—"}</div>
                <div style={{fontSize:11,fontWeight:600,color:diff===null?T.muted:diff>=0?T.green:T.red}}>{diff===null?"—":diff>=0?`+${diff}% above avg`:`${diff}% below avg`}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{marginTop:12,fontSize:12,color:T.muted,lineHeight:1.7}}>
        ⚠️ "Suspicious" = leads scored 75+ that were marked Lost within 48 hours. Watch tier: 1+ flags or close rate &lt;10% with 5+ leads. Review tier: 3+ flags or close rate &lt;5% with 10+ leads.
      </div>
    </div>
  );
}

// ─── C. ADMIN FOLLOW-UP QUEUE ─────────────────────────────────────────────────
function AdminFollowUpQueue({contractors,toast}){
  const [staleLeads,setStaleLeads]=useState([]);
  const [loading,setLoading]=useState(true);
  const [emailDraft,setEmailDraft]=useState(null);

  useEffect(()=>{
    const cutoff=new Date(Date.now()-14*24*60*60*1000);
    Promise.all(contractors.map(c=>db.getLeads(c.id).catch(()=>[]))).then(results=>{
      const flat=results.flat();
      const stale=flat.filter(l=>{
        if(l.status==="won"||l.status==="new")return false;
        const created=new Date(l.created_at);
        return created<cutoff&&(l.status==="contacted"||l.status==="lost");
      }).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
      setStaleLeads(stale);
      setLoading(false);
    });
  },[contractors.length]);

  const buildEmail=(lead)=>{
    const c=contractors.find(x=>x.id===lead.business_id);
    const subject=`Quick question about your ${lead.is_name||lead.issue_type} service`;
    const body=`Hi ${lead.name},

I wanted to follow up quickly — you recently submitted a request for ${(lead.is_name||lead.issue_type||"home service").toLowerCase()} help through Streamline.

Did ${c?.company||"our contractor"} take care of you? We'd love to hear how it went — good or bad. Your feedback helps us ensure we're connecting homeowners with the right professionals.

If you haven't been contacted yet, please reply to this email and we'll get it sorted right away.

Thank you,
The Streamline Team
hello@streamline.io`;
    setEmailDraft({lead,subject,body,to:lead.email});
  };

  const copyEmail=()=>{
    if(!emailDraft)return;
    navigator.clipboard.writeText(`To: ${emailDraft.to}\nSubject: ${emailDraft.subject}\n\n${emailDraft.body}`);
    toast({message:"Email copied to clipboard",type:"success"});
  };

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,letterSpacing:-1,marginBottom:3}}>Follow-Up Queue</h2>
          <p style={{color:T.muted,fontSize:13}}>Leads 14+ days old still in "contacted" or "lost" — verify job outcomes directly with homeowners</p>
        </div>
      </div>

      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,gap:12}}><Spinner/><span style={{color:T.muted}}>Scanning leads…</span></div>
      ):staleLeads.length===0?(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,padding:56,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>✅</div>
          <div style={{fontSize:15,color:T.offWhite,marginBottom:6}}>Queue is clear</div>
          <div style={{fontSize:13,color:T.muted}}>No leads older than 14 days in contacted/lost status.</div>
        </div>
      ):(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1.8fr 1.2fr 1fr 1fr 1fr 80px 140px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
            {["Homeowner","Contractor","Service","Score","Last Status","Days","Action"].map(h=><div key={h}>{h}</div>)}
          </div>
          {staleLeads.map((l,i)=>{
            const c=contractors.find(x=>x.id===l.business_id);
            const daysAgo=Math.floor((Date.now()-new Date(l.created_at))/(24*60*60*1000));
            return(
              <div key={l.id} style={{display:"grid",gridTemplateColumns:"1.8fr 1.2fr 1fr 1fr 1fr 80px 140px",padding:"12px 16px",borderBottom:i<staleLeads.length-1?`1px solid ${T.border}`:"none",alignItems:"center",fontSize:12}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:T.white}}>{l.name}</div>
                  <div style={{fontSize:11,color:T.muted}}>{l.email}</div>
                </div>
                <div style={{color:T.offWhite}}>{c?.company||"—"}</div>
                <div style={{color:T.muted}}>{l.is_name||l.issue_type}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",color:l.score>=75?T.green:l.score>=50?T.amber:T.muted}}>{l.score}</div>
                <div><Pill color={l.status}>{l.status}</Pill></div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",color:daysAgo>30?T.red:T.amber}}>{daysAgo}d</div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={()=>buildEmail(l)} style={{background:"rgba(37,99,235,0.12)",border:"1px solid rgba(37,99,235,0.3)",borderRadius:7,padding:"5px 10px",cursor:"pointer",color:T.blueL,fontSize:11,fontWeight:600}}>✉ Draft</button>
                  {l.phone&&<a href={`tel:${l.phone}`} style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:7,padding:"5px 8px",color:T.green,fontSize:11,textDecoration:"none"}}>📞</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!emailDraft} onClose={()=>setEmailDraft(null)} title="Follow-Up Email Draft" width={600}>
        {emailDraft&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:T.surface2,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:11,color:T.muted,marginBottom:2}}>To: <span style={{color:T.blueL}}>{emailDraft.to}</span></div>
              <div style={{fontSize:11,color:T.muted}}>Subject: <span style={{color:T.offWhite}}>{emailDraft.subject}</span></div>
            </div>
            <textarea readOnly value={emailDraft.body} style={{width:"100%",background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"12px",color:T.white,fontSize:13,outline:"none",minHeight:220,resize:"vertical",fontFamily:"inherit",lineHeight:1.7}}/>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="outline" onClick={()=>setEmailDraft(null)} style={{flex:1}}>Close</Btn>
              <Btn onClick={copyEmail} style={{flex:2}}>📋 Copy Email</Btn>
            </div>
            <div style={{fontSize:11,color:T.muted}}>Copy and paste into your email client. Send from hello@streamline.io for best deliverability.</div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── E. ADMIN MONTH-END BILLING ───────────────────────────────────────────────
function AdminMonthEndBilling({contractors,toast}){
  const [wonLeads,setWonLeads]=useState([]);
  const [invoices,setInvoices]=useState([]);
  const [loading,setLoading]=useState(true);
  const [generating,setGenerating]=useState(false);
  const [runAll,setRunAll]=useState(false);
  const [preview,setPreview]=useState(null);

  const load=async()=>{
    setLoading(true);
    try{
      const[wl,inv]=await Promise.all([db.getAllWonLeads(),db.getAllInvoices()]);
      setWonLeads(wl);setInvoices(inv);
    }catch(e){toast({message:"Failed to load",type:"error"});}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const now=new Date();
  const period=now.toLocaleString("default",{month:"long",year:"numeric"});

  const byContractor=contractors.map(c=>{
    const perfFee=c.plan==="Growth"?100:150;
    const unbilled=wonLeads.filter(l=>l.business_id===c.id&&!l.billed&&l.verified===true);
    return{...c,unbilled,perfFee,fee:unbilled.length*perfFee};
  }).filter(c=>c.unbilled.length>0).sort((a,b)=>b.fee-a.fee);

  const totalFees=byContractor.reduce((s,c)=>s+c.fee,0);
  const verifiedCount=wonLeads.filter(l=>l.verified===true&&!l.billed).length;
  const pendingVerify=wonLeads.filter(l=>l.verified===null||l.verified===undefined).length;

  const generateOne=async(c)=>{
    setGenerating(true);
    try{
      const suffix=(c.company||"CONT").replace(/\s/g,"").substring(0,4).toUpperCase()+String(Math.floor(Math.random()*900)+100);
      const invoiceNum=`INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}-${suffix}`;
      const inv={business_id:c.id,invoice_number:invoiceNum,period,line_item_count:c.unbilled.length,perf_fee_per_job:c.perfFee,total_amount:c.fee,status:"sent",created_at:now.toISOString(),lead_ids:c.unbilled.map(l=>l.id).join(",")};
      const saved=await db.createInvoice(inv);
      await db.markLeadsBilled(c.unbilled.map(l=>l.id),saved.id);
      toast({message:`Invoice ${invoiceNum} created for ${c.company||c.email}`,type:"success"});
      await load();
    }catch(e){toast({message:"Failed: "+e.message,type:"error"});}
    setGenerating(false);
  };

  const generateAll=async()=>{
    setRunAll(true);setGenerating(true);
    for(const c of byContractor){
      try{
        const suffix=(c.company||"CONT").replace(/\s/g,"").substring(0,4).toUpperCase()+String(Math.floor(Math.random()*900)+100);
        const invoiceNum=`INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}-${suffix}`;
        const inv={business_id:c.id,invoice_number:invoiceNum,period,line_item_count:c.unbilled.length,perf_fee_per_job:c.perfFee,total_amount:c.fee,status:"sent",created_at:now.toISOString(),lead_ids:c.unbilled.map(l=>l.id).join(",")};
        const saved=await db.createInvoice(inv);
        await db.markLeadsBilled(c.unbilled.map(l=>l.id),saved.id);
      }catch(e){console.error(e);}
    }
    toast({message:`${byContractor.length} invoice${byContractor.length!==1?"s":""} generated for ${period}`,type:"success"});
    await load();
    setGenerating(false);setRunAll(false);
  };

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,letterSpacing:-1,marginBottom:3}}>Month-End Billing</h2>
          <p style={{color:T.muted,fontSize:13}}>{period} · Only invoices verified won jobs</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="outline" onClick={load}>Refresh</Btn>
          {byContractor.length>0&&<Btn onClick={generateAll} disabled={generating||pendingVerify>0} style={{background:`linear-gradient(135deg,${T.blue},#7C3AED)`,border:"none"}}>
            {generating&&runAll?<span style={{display:"flex",alignItems:"center",gap:6}}><Spinner size={13}/>Generating…</span>:`🧾 Run All — ${byContractor.length} invoices`}
          </Btn>}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"Ready to Invoice",value:byContractor.length,color:T.blueL,icon:"✅"},
          {label:"Verified Jobs",value:verifiedCount,color:T.green,icon:"✓"},
          {label:"Pending Verification",value:pendingVerify,color:pendingVerify>0?T.amber:T.muted,icon:"⏳"},
          {label:"Total Fees",value:`$${totalFees.toLocaleString()}`,color:T.amber,icon:"💰"},
        ].map(s=>(
          <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:s.color,lineHeight:1,marginBottom:3}}>{s.value}</div>
            <div style={{fontSize:11,color:T.muted}}>{s.label}</div>
          </div>
        ))}
      </div>

      {pendingVerify>0&&(
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>⚠️</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:T.amber,marginBottom:2}}>{pendingVerify} job{pendingVerify!==1?"s":""} still pending verification</div>
            <div style={{fontSize:12,color:T.muted}}>Go to the Invoices tab to verify these before running billing. Only verified jobs are included in invoices.</div>
          </div>
        </div>
      )}

      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,gap:12}}><Spinner/><span style={{color:T.muted}}>Loading…</span></div>
      ):byContractor.length===0?(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,padding:56,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>🎉</div>
          <div style={{fontSize:15,color:T.offWhite,marginBottom:6}}>All billing up to date</div>
          <div style={{fontSize:13,color:T.muted}}>No verified unbilled jobs found.</div>
        </div>
      ):(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 140px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
            {["Contractor","Plan","Verified Jobs","Fee/Job","Total Due",""].map(h=><div key={h}>{h}</div>)}
          </div>
          {byContractor.map((c,i)=>(
            <div key={c.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 140px",padding:"13px 16px",borderBottom:i<byContractor.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{c.company||c.email}</div>
                <div style={{fontSize:11,color:T.muted}}>{c.city}</div>
              </div>
              <div><Pill color={c.plan==="Growth"?"won":"new"}>{c.plan||"Starter"}</Pill></div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:T.green}}>{c.unbilled.length}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted}}>${c.perfFee}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:T.amber}}>${c.fee.toLocaleString()}</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setPreview(c)} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:7,padding:"6px 10px",cursor:"pointer",color:T.muted,fontSize:12}}>Preview</button>
                <button onClick={()=>generateOne(c)} disabled={generating} style={{background:`linear-gradient(135deg,${T.blue},#7C3AED)`,border:"none",borderRadius:7,padding:"6px 12px",cursor:"pointer",color:"white",fontSize:12,fontWeight:600,opacity:generating?0.6:1}}>
                  {generating&&!runAll?<Spinner size={11}/>:"Invoice"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      <Modal open={!!preview} onClose={()=>setPreview(null)} title={`Invoice Preview — ${preview?.company||preview?.email}`} width={580}>
        {preview&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:T.surface2,borderRadius:10,padding:16}}>
              {preview.unbilled.map((l,i)=>(
                <div key={l.id} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<preview.unbilled.length-1?`1px solid ${T.border}`:"none",fontSize:13}}>
                  <div>
                    <div style={{fontWeight:500,color:T.white}}>{l.name}</div>
                    <div style={{fontSize:11,color:T.muted}}>{l.is_name||l.issue_type} · {l.completed_at?new Date(l.completed_at).toLocaleDateString():"—"}</div>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:T.amber}}>${preview.perfFee}</div>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0 0",fontSize:14,fontWeight:700}}>
                <span style={{color:T.white}}>Total</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",color:T.amber}}>${preview.fee.toLocaleString()}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="outline" onClick={()=>setPreview(null)} style={{flex:1}}>Close</Btn>
              <Btn onClick={()=>{generateOne(preview);setPreview(null);}} style={{flex:2}}>Generate Invoice</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── I. ADMIN TEST SUITE ──────────────────────────────────────────────────────
function AdminTestSuite({contractors,toast}){
  const [results,setResults]=useState([]);
  const [running,setRunning]=useState(false);
  const [step,setStep]=useState(null);

  const INDUSTRIES_TEST=["hvac","roofing","plumbing","electrical"];

  const log=(name,status,detail="")=>{
    setResults(r=>[...r,{name,status,detail,ts:new Date().toLocaleTimeString()}]);
  };

  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  const runTests=async()=>{
    setResults([]);setRunning(true);

    // ── Test 1: DB connection ──
    setStep("Checking database connection…");
    try{
      const s=await db.getSession();
      log("Database connection","pass","Supabase client connected");
    }catch(e){log("Database connection","fail",e.message);}
    await sleep(400);

    // ── Test 2: Contractor load ──
    setStep("Loading contractor list…");
    try{
      if(contractors.length===0){log("Contractor records","warn","No contractors in database yet");}
      else{log("Contractor records","pass",`${contractors.length} contractor${contractors.length!==1?"s":""} loaded`);}
    }catch(e){log("Contractor records","fail",e.message);}
    await sleep(400);

    // ── Test 3: Lead insertion for each industry ──
    for(const ind of INDUSTRIES_TEST){
      setStep(`Submitting test lead: ${ind}…`);
      const testLead={
        business_id:DEMO_BUSINESS_ID,
        name:`Test User ${ind.toUpperCase()}`,
        phone:"6145550199",
        email:`test-${ind}@streamline-test.com`,
        issue_type:"test_lead",
        issue_description:`Automated test submission for ${ind}`,
        urgency:"this_week",
        budget:"under_1000",
        ownership:"owner",
        property_size:"under_1500",
        preferred_time:"Anytime",
        zip_code:"43215",
        industry:ind.charAt(0).toUpperCase()+ind.slice(1),
        score:72,
        tier:"warm",
        breakdown:{budget:12,urgency:15,ownership:15,size:10,clarity:10,contact:10},
        status:"new",
        estimate_range:"$400–1,200",
        is_name:"Test Lead",
        is_test:true,
      };
      try{
        const inserted=await db.insertLead(testLead);
        log(`Lead insertion: ${ind}`,"pass",`Lead ID: ${inserted.id.slice(0,8)}…`);
        await sleep(300);

        // ── Test 4: Status update ──
        setStep(`Testing status update: ${ind}…`);
        await db.updateLeadStatus(inserted.id,"contacted",{});
        log(`Status update: ${ind}`,"pass","contacted ✓");
        await sleep(200);

        // ── Test 5: Won + job value ──
        await db.updateLeadStatus(inserted.id,"won",{job_value:1500,completed_at:new Date().toISOString().split("T")[0],won_notes:"TEST",billed:false,verified:null});
        log(`Won status + job value: ${ind}`,"pass","won, $1,500 ✓");
        await sleep(200);

        // ── Cleanup: mark as lost so it doesn't clog invoicing ──
        await db.updateLeadStatus(inserted.id,"lost",{});
        log(`Cleanup: ${ind}`,"pass","test lead reset to lost");

      }catch(e){log(`Lead flow: ${ind}`,"fail",e.message);}
      await sleep(300);
    }

    // ── Test 6: Routing engine ──
    setStep("Testing lead routing engine…");
    try{
      const route=await db.routeLead("HVAC",null);
      log("Lead routing engine","pass",route.bid?`Routed to ${route.bid.slice(0,8)}… (${route.reason})`:"No contractor available (OK if no contractors)");
    }catch(e){log("Lead routing engine","fail",e.message);}
    await sleep(400);

    // ── Test 7: Billing table ──
    setStep("Checking billing records…");
    try{
      const billing=await db.getAllBilling();
      log("Billing table","pass",`${billing.length} billing record${billing.length!==1?"s":""} found`);
    }catch(e){log("Billing table","fail",e.message);}
    await sleep(300);

    // ── Test 8: Invoice table ──
    setStep("Checking invoice records…");
    try{
      const invoices=await db.getAllInvoices();
      log("Invoice table","pass",`${invoices.length} invoice${invoices.length!==1?"s":""} found`);
    }catch(e){log("Invoice table","fail",e.message);}
    await sleep(300);

    // ── Test 9: Notifications table ──
    setStep("Checking notifications…");
    try{
      if(contractors.length>0){
        const notifs=await db.getNotifications(contractors[0].id);
        log("Notifications table","pass",`${notifs.length} notification${notifs.length!==1?"s":""} for first contractor`);
      }else{log("Notifications table","warn","No contractors to test with");}
    }catch(e){log("Notifications table","fail",e.message);}

    setStep(null);setRunning(false);
    const fails=results.filter(r=>r.status==="fail").length;
    toast({message:fails===0?"✅ All tests passed!": `⚠️ ${fails} test(s) failed — check results`,type:fails===0?"success":"error"});
  };

  const statusColor={pass:T.green,fail:T.red,warn:T.amber};
  const statusIcon={pass:"✓",fail:"✗",warn:"⚠"};

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,letterSpacing:-1,marginBottom:3}}>Test Suite</h2>
          <p style={{color:T.muted,fontSize:13}}>End-to-end automated tests — submits real leads, verifies routing, cleans up after itself</p>
        </div>
        <Btn onClick={runTests} disabled={running} style={{background:`linear-gradient(135deg,${T.blue},#7C3AED)`,border:"none",display:"flex",alignItems:"center",gap:8}}>
          {running?<><Spinner size={13}/> Running…</>:"▶ Run All Tests"}
        </Btn>
      </div>

      <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:T.offWhite,lineHeight:1.6}}>
        ⚠️ This test suite inserts real leads marked as <code style={{background:T.surface3,padding:"1px 5px",borderRadius:3,fontSize:11}}>is_test:true</code> into the demo contractor account, then immediately resets their status to "lost" so they don't appear in invoicing. Safe to run anytime.
      </div>

      {step&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:T.surface,border:`1px solid ${T.border2}`,borderRadius:10,marginBottom:14,fontSize:13,color:T.muted}}>
          <Spinner size={14}/>{step}
        </div>
      )}

      {results.length>0&&(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden",marginBottom:16}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600,color:T.white}}>{results.length} tests run</span>
            <div style={{display:"flex",gap:12,fontSize:12}}>
              <span style={{color:T.green}}>✓ {results.filter(r=>r.status==="pass").length} passed</span>
              <span style={{color:T.amber}}>⚠ {results.filter(r=>r.status==="warn").length} warnings</span>
              <span style={{color:T.red}}>✗ {results.filter(r=>r.status==="fail").length} failed</span>
            </div>
          </div>
          {results.map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"20px 2fr 3fr 80px",gap:12,padding:"10px 16px",borderBottom:i<results.length-1?`1px solid ${T.border}`:"none",alignItems:"center",background:r.status==="fail"?"rgba(239,68,68,0.03)":r.status==="warn"?"rgba(245,158,11,0.02)":"none"}}>
              <span style={{fontSize:13,fontWeight:700,color:statusColor[r.status]}}>{statusIcon[r.status]}</span>
              <span style={{fontSize:13,color:T.offWhite,fontWeight:500}}>{r.name}</span>
              <span style={{fontSize:12,color:T.muted}}>{r.detail}</span>
              <span style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{r.ts}</span>
            </div>
          ))}
        </div>
      )}

      {results.length===0&&!running&&(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,padding:56,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:14}}>🧪</div>
          <div style={{fontSize:15,color:T.offWhite,marginBottom:8}}>Ready to test</div>
          <div style={{fontSize:13,color:T.muted,maxWidth:400,margin:"0 auto"}}>Click "Run All Tests" to verify your database, lead insertion, routing engine, status updates, and billing tables are all working correctly.</div>
        </div>
      )}
    </div>
  );
}

// ─── MARKET INTELLIGENCE VIEW (Contractor) ────────────────────────────────────
// Uses Claude API to pull live market data, competitor landscape, pricing benchmarks,
// and industry headwinds/tailwinds for the contractor's specific city + industry.
const MARKET_STORAGE_KEY = (uid) => `market_data_${uid}`;

function MarketIntelligenceView({user}){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [lastUpdated,setLastUpdated]=useState(null);
  const [activeSection,setActiveSection]=useState("overview");

  const city=user.city||"Columbus, OH";
  const industry=user.industry||"HVAC";
  const staleAfterDays=90;

  useEffect(()=>{
    try{
      const saved=localStorage.getItem(MARKET_STORAGE_KEY(user.id));
      if(saved){
        const parsed=JSON.parse(saved);
        setData(parsed.data);
        setLastUpdated(new Date(parsed.ts));
      }
    }catch(e){}
  },[user.id]);

  const isStale=lastUpdated&&(Date.now()-lastUpdated.getTime())>staleAfterDays*24*60*60*1000;
  const daysSinceUpdate=lastUpdated?Math.floor((Date.now()-lastUpdated.getTime())/(24*60*60*1000)):null;

  const fetchMarketData=async()=>{
    setLoading(true);setError(null);
    try{
      const prompt=`You are a local market research analyst. Generate hyper-local market data for a ${industry} business operating specifically in ${city}. Focus exclusively on LOCAL market conditions, not national trends.

Return ONLY valid JSON (no markdown, no backticks, no preamble) in exactly this structure:
{
  "overview": {
    "marketSize": "estimated total annual ${industry} spend in the ${city} metro area (e.g. '$240M annually')",
    "householdsServed": "estimated number of addressable households or businesses in ${city}",
    "growthRate": "local market growth rate driven by ${city} population/construction trends",
    "avgJobValue": "average single job/service transaction value in ${city}",
    "demandLevel": "High / Medium / Low — based on ${city} demographics and housing stock",
    "summary": "3 sentences specifically about the ${industry} market in ${city}: population context, housing/commercial stock, and what drives local demand"
  },
  "competitors": [
    {"name":"Realistic local company name","type":"Local independent / Regional chain / Franchise / National","marketShare":"est. % or 'dominant'/'minor'","notes":"What makes them competitive locally in ${city}"},
    {"name":"Competitor 2","type":"...","marketShare":"...","notes":"..."},
    {"name":"Competitor 3","type":"...","marketShare":"...","notes":"..."},
    {"name":"Competitor 4","type":"...","marketShare":"...","notes":"..."},
    {"name":"Competitor 5","type":"...","marketShare":"...","notes":"..."}
  ],
  "pricing": [
    {"service":"Most common ${industry} service type","low":"$X","high":"$Y","avg":"$Z","localNote":"Why this price range is specific to ${city}"},
    {"service":"Service 2","low":"$X","high":"$Y","avg":"$Z","localNote":"..."},
    {"service":"Service 3","low":"$X","high":"$Y","avg":"$Z","localNote":"..."},
    {"service":"Service 4","low":"$X","high":"$Y","avg":"$Z","localNote":"..."},
    {"service":"Service 5","low":"$X","high":"$Y","avg":"$Z","localNote":"..."}
  ],
  "localDrivers": [
    {"title":"Local growth driver","detail":"Specific to ${city}: new construction, demographics, local economy, housing age, etc."},
    {"title":"Driver 2","detail":"..."},
    {"title":"Driver 3","detail":"..."}
  ],
  "localChallenges": [
    {"title":"Local market challenge","detail":"Specific to ${city}: competition density, labor market, permitting, cost of living, etc."},
    {"title":"Challenge 2","detail":"..."},
    {"title":"Challenge 3","detail":"..."}
  ],
  "neighborhoods": [
    {"name":"Highest-value neighborhood or suburb","reason":"Why this area is high-value for ${industry}"},
    {"name":"Area 2","reason":"..."},
    {"name":"Area 3","reason":"..."},
    {"name":"Area 4","reason":"..."}
  ],
  "seasonality": {
    "peakMonths": "Peak months for ${industry} demand in ${city}",
    "slowMonths": "Slow months",
    "weatherNote": "How ${city} climate specifically affects ${industry} demand patterns"
  },
  "consumerProfile": {
    "avgHomeAge": "Avg home age in ${city} and what that means for ${industry} demand",
    "medianIncome": "Estimated median household income and how it affects pricing tolerance",
    "ownershipRate": "Homeownership rate and its effect on ${industry} demand",
    "notes": "1-2 sentences on what makes ${city} consumers different from the national average"
  }
}

Be specific to ${city}. Use real knowledge of the city's demographics, geography, housing stock, and economy.`;

      const resp=await fetch("/api/ai",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1800,
          messages:[{role:"user",content:prompt}]
        })
      });
      const result=await resp.json();
      const text=(result.content||[]).map(b=>b.text||"").join("");
      const clean=text.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      setData(parsed);
      const now=new Date();
      setLastUpdated(now);
      localStorage.setItem(MARKET_STORAGE_KEY(user.id),JSON.stringify({data:parsed,ts:now.toISOString()}));
    }catch(e){
      setError("Failed to load market data. Please try again.");
      console.error(e);
    }
    setLoading(false);
  };

  const SECTIONS=[
    {id:"overview",label:"Overview",icon:"📊"},
    {id:"competitors",label:"Competitors",icon:"🏆"},
    {id:"pricing",label:"Pricing",icon:"💲"},
    {id:"drivers",label:"Local Drivers",icon:"🚀"},
    {id:"challenges",label:"Challenges",icon:"⚠️"},
    {id:"neighborhoods",label:"Hot Areas",icon:"📍"},
  ];

  const ind=Object.values(INDUSTRIES).find(i=>i.label===industry)||INDUSTRIES.hvac;
  const indColor=ind?.color||T.blue;

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Market Intelligence</h2>
          <p style={{color:T.muted,fontSize:13}}>
            {industry} · {city}
            {lastUpdated&&<span style={{marginLeft:8,color:isStale?T.amber:T.muted}}>
              · Last updated {daysSinceUpdate===0?"today":`${daysSinceUpdate}d ago`}
              {isStale&&" · ⚠ Data is over 90 days old"}
            </span>}
          </p>
        </div>
        <button onClick={fetchMarketData} disabled={loading} style={{display:"flex",alignItems:"center",gap:8,background:`linear-gradient(135deg,${indColor}22,${indColor}11)`,border:`1px solid ${indColor}50`,borderRadius:10,padding:"10px 18px",cursor:loading?"not-allowed":"pointer",color:indColor,fontSize:13,fontWeight:600,opacity:loading?0.7:1,transition:"all 0.2s"}}>
          {loading?<><Spinner size={13}/> Analyzing market…</>:<>🔄 {data?"Refresh Data":"Generate Market Report"}</>}
        </button>
      </div>

      {!data&&!loading&&(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:16,padding:56,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🔍</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,marginBottom:10}}>Your market report is ready to generate</div>
          <p style={{color:T.muted,fontSize:14,maxWidth:460,margin:"0 auto 24px",lineHeight:1.7}}>Get AI-powered market size data, competitor landscape, pricing benchmarks, and industry trends specific to <strong style={{color:T.white}}>{industry}</strong> in <strong style={{color:T.white}}>{city}</strong>.</p>
          <button onClick={fetchMarketData} style={{background:`linear-gradient(135deg,${indColor},${indColor}cc)`,border:"none",borderRadius:10,padding:"13px 28px",cursor:"pointer",color:"white",fontSize:14,fontWeight:700}}>Generate Market Report →</button>
          <p style={{color:T.muted,fontSize:11,marginTop:12}}>Powered by AI · Refreshable quarterly · ~15 seconds</p>
        </div>
      )}

      {loading&&!data&&(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:16,padding:56,textAlign:"center"}}>
          <Spinner size={32}/>
          <div style={{marginTop:16,fontSize:15,color:T.offWhite}}>Analyzing the {industry} market in {city}…</div>
          <p style={{color:T.muted,fontSize:13,marginTop:8}}>Pulling competitor data, pricing benchmarks, and industry trends</p>
        </div>
      )}

      {error&&<div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#F87171"}}>{error}</div>}

      {data&&(
        <>
          {/* Section tabs */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:20,background:T.surface2,padding:4,borderRadius:10,border:`1px solid ${T.border}`}}>
            {SECTIONS.map(s=>(
              <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{padding:"7px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:activeSection===s.id?T.blue:"none",color:activeSection===s.id?"white":T.muted,transition:"all 0.15s",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:11}}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeSection==="overview"&&(
            <div style={{animation:"fadeIn 0.25s ease"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}} className="grid-2-mobile">
                {[
                  {label:"Local Market Size",value:data.overview?.marketSize,color:T.green,icon:"💰"},
                  {label:"Local Growth Rate",value:data.overview?.growthRate,color:T.cyan,icon:"📈"},
                  {label:"Avg Job Value",value:data.overview?.avgJobValue,color:T.amber,icon:"💼"},
                  {label:"Demand Level",value:data.overview?.demandLevel,color:data.overview?.demandLevel==="High"?T.green:data.overview?.demandLevel==="Medium"?T.amber:T.muted,icon:"🌡️"},
                ].map(s=>(
                  <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"16px 18px"}}>
                    <div style={{fontSize:18,marginBottom:8}}>{s.icon}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:700,color:s.color,lineHeight:1.2,marginBottom:3}}>{s.value||"—"}</div>
                    <div style={{fontSize:11,color:T.muted}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:20,marginBottom:12}}>
                <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>{city} Market Overview</div>
                <p style={{fontSize:14,color:T.offWhite,lineHeight:1.7}}>{data.overview?.summary}</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                {data.overview?.householdsServed&&(
                  <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:16}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Addressable Market</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:T.blueL}}>{data.overview.householdsServed}</div>
                  </div>
                )}
                {data.consumerProfile?.medianIncome&&(
                  <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:16}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Median Household Income</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:T.blueL}}>{data.consumerProfile.medianIncome}</div>
                  </div>
                )}
              </div>
              {data.consumerProfile&&(
                <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:20,marginBottom:12}}>
                  <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>{city} Consumer Profile</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
                    {[
                      {label:"Avg Home Age",value:data.consumerProfile.avgHomeAge},
                      {label:"Ownership Rate",value:data.consumerProfile.ownershipRate},
                    ].filter(i=>i.value).map(i=>(
                      <div key={i.label} style={{background:T.surface2,borderRadius:8,padding:"10px 12px"}}>
                        <div style={{fontSize:10,color:T.muted,marginBottom:3}}>{i.label}</div>
                        <div style={{fontSize:12,color:T.offWhite,fontWeight:500}}>{i.value}</div>
                      </div>
                    ))}
                  </div>
                  {data.consumerProfile.notes&&<p style={{fontSize:13,color:T.offWhite,lineHeight:1.6}}>{data.consumerProfile.notes}</p>}
                </div>
              )}
              {data.seasonality&&(
                <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:20}}>
                  <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Seasonality — {city}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                    <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:"10px 14px"}}>
                      <div style={{fontSize:11,color:T.green,fontWeight:600,marginBottom:3}}>Peak Months</div>
                      <div style={{fontSize:13,fontWeight:600,color:T.white}}>{data.seasonality.peakMonths}</div>
                    </div>
                    <div style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"10px 14px"}}>
                      <div style={{fontSize:11,color:T.red,fontWeight:600,marginBottom:3}}>Slow Months</div>
                      <div style={{fontSize:13,fontWeight:600,color:T.white}}>{data.seasonality.slowMonths}</div>
                    </div>
                  </div>
                  {data.seasonality.weatherNote&&<p style={{fontSize:13,color:T.offWhite,lineHeight:1.6}}>{data.seasonality.weatherNote}</p>}
                </div>
              )}
            </div>
          )}

          {/* Competitors */}
          {activeSection==="competitors"&&(
            <div style={{animation:"fadeIn 0.25s ease"}}>
              <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,fontSize:13,color:T.muted}}>Top competitors operating in {city} — use this to position your pitch</div>
                {(data.competitors||[]).map((c,i)=>(
                  <div key={i} style={{padding:"14px 18px",borderBottom:i<data.competitors.length-1?`1px solid ${T.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                      <div style={{width:32,height:32,borderRadius:8,background:`${indColor}18`,border:`1px solid ${indColor}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:indColor,flexShrink:0}}>{i+1}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:T.white}}>{c.name}</div>
                        <div style={{display:"flex",gap:6,alignItems:"center",marginTop:2}}>
                          <span style={{fontSize:11,color:T.blueL,fontWeight:500}}>{c.type}</span>
                          {c.marketShare&&<span style={{fontSize:10,color:T.muted}}>· {c.marketShare}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{fontSize:13,color:T.muted,lineHeight:1.5,paddingLeft:42}}>{c.notes}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,background:"rgba(37,99,235,0.06)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:10,padding:"12px 16px",fontSize:13,color:T.offWhite,lineHeight:1.6}}>
                💡 Your advantage: every Streamline lead is pre-qualified and exclusive. Your competitors are fighting over shared leads — you aren't.
              </div>
            </div>
          )}

          {/* Pricing */}
          {activeSection==="pricing"&&(
            <div style={{animation:"fadeIn 0.25s ease"}}>
              <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 2fr",padding:"10px 18px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
                  {["Service","Low","High","Avg",`Local Context — ${city}`].map(h=><div key={h}>{h}</div>)}
                </div>
                {(data.pricing||[]).map((p,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 2fr",padding:"13px 18px",borderBottom:i<data.pricing.length-1?`1px solid ${T.border}`:"none",alignItems:"center",fontSize:13}}>
                    <div style={{fontWeight:600,color:T.white}}>{p.service}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted}}>{p.low}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted}}>{p.high}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:T.green}}>{p.avg}</div>
                    <div style={{fontSize:12,color:T.muted,lineHeight:1.4}}>{p.localNote||p.note}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,fontSize:12,color:T.muted,lineHeight:1.6}}>Local pricing benchmarks for {industry} in {city}. Use these to calibrate your estimates and confidently defend your rates.</div>
            </div>
          )}

          {/* Local Drivers */}
          {activeSection==="drivers"&&(
            <div style={{animation:"fadeIn 0.25s ease",display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:12,color:T.muted,marginBottom:4}}>What's driving {industry} demand specifically in {city} right now.</div>
              {(data.localDrivers||[]).map((t,i)=>(
                <div key={i} style={{background:T.surface,border:"1px solid rgba(16,185,129,0.25)",borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:18}}>🚀</span>
                    <span style={{fontSize:15,fontWeight:600,color:T.green}}>{t.title}</span>
                  </div>
                  <p style={{fontSize:13,color:T.offWhite,lineHeight:1.7,paddingLeft:28}}>{t.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Local Challenges */}
          {activeSection==="challenges"&&(
            <div style={{animation:"fadeIn 0.25s ease",display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:12,color:T.muted,marginBottom:4}}>Local market challenges specific to operating {industry} in {city}.</div>
              {(data.localChallenges||[]).map((h,i)=>(
                <div key={i} style={{background:T.surface,border:"1px solid rgba(245,158,11,0.25)",borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:18}}>⚠️</span>
                    <span style={{fontSize:15,fontWeight:600,color:T.amber}}>{h.title}</span>
                  </div>
                  <p style={{fontSize:13,color:T.offWhite,lineHeight:1.7,paddingLeft:28}}>{h.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Hot Neighborhoods */}
          {activeSection==="neighborhoods"&&(
            <div style={{animation:"fadeIn 0.25s ease"}}>
              <div style={{fontSize:12,color:T.muted,marginBottom:14}}>Highest-value areas and neighborhoods in {city} for {industry} leads.</div>
              <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
                {(data.neighborhoods||[]).map((n,i)=>(
                  <div key={i} style={{padding:"14px 18px",borderBottom:i<data.neighborhoods.length-1?`1px solid ${T.border}`:"none",display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:28,height:28,borderRadius:6,background:`${indColor}18`,border:`1px solid ${indColor}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:indColor,flexShrink:0,fontWeight:700}}>📍</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:T.white,marginBottom:3}}>{n.name}</div>
                      <div style={{fontSize:13,color:T.muted,lineHeight:1.5}}>{n.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{marginTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:T.muted}}>
            <span>AI-generated market intelligence · Powered by Claude · Refresh quarterly for accuracy</span>
            {lastUpdated&&<span>Generated {lastUpdated.toLocaleDateString()}</span>}
          </div>
        </>
      )}
    </div>
  );
}

// ─── INDUSTRY INSIGHTS VIEW ───────────────────────────────────────────────────
// National/macro industry data: trends, tailwinds, headwinds, regulatory, labor,
// technology — refreshed by AI, distinct from city-specific market data.

const INDUSTRY_STORAGE_KEY = (uid) => `industry_data_${uid}`;

function IndustryInsightsView({user}){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [lastUpdated,setLastUpdated]=useState(null);
  const [activeSection,setActiveSection]=useState("overview");
  const staleAfterDays=90;

  const industry=user.industry||"HVAC";

  useEffect(()=>{
    try{
      const saved=localStorage.getItem(INDUSTRY_STORAGE_KEY(user.id));
      if(saved){
        const parsed=JSON.parse(saved);
        setData(parsed.data);
        setLastUpdated(new Date(parsed.ts));
      }
    }catch(e){}
  },[user.id]);

  const isStale=lastUpdated&&(Date.now()-lastUpdated.getTime())>staleAfterDays*24*60*60*1000;
  const daysSinceUpdate=lastUpdated?Math.floor((Date.now()-lastUpdated.getTime())/(24*60*60*1000)):null;

  const fetchIndustryData=async()=>{
    setLoading(true);setError(null);
    try{
      const prompt=`You are an industry research analyst writing a briefing for a small business owner in the ${industry} industry in the United States.

Focus on the NATIONAL state of the ${industry} industry — macro trends, not local market data.

Return ONLY valid JSON (no markdown, no backticks, no preamble):
{
  "snapshot": {
    "industrySize": "total US annual market size for ${industry} (e.g. '$180B')",
    "growth5yr": "5-year CAGR for the ${industry} industry",
    "totalBusinesses": "estimated number of active ${industry} businesses in the US",
    "laborShortage": "Yes / Moderate / No — skilled labor availability",
    "consolidationTrend": "Consolidating / Stable / Fragmenting",
    "headline": "1 sentence capturing the single most important thing happening in ${industry} right now"
  },
  "tailwinds": [
    {"title":"Macro tailwind title","detail":"2-3 sentences on why this is a tailwind, with specific stats or evidence where possible.","timeframe":"Near-term / Mid-term / Long-term"},
    {"title":"Tailwind 2","detail":"...","timeframe":"..."},
    {"title":"Tailwind 3","detail":"...","timeframe":"..."},
    {"title":"Tailwind 4","detail":"...","timeframe":"..."}
  ],
  "headwinds": [
    {"title":"Macro headwind title","detail":"2-3 sentences on why this is a challenge, how serious it is, and how to navigate it.","severity":"High / Medium / Low"},
    {"title":"Headwind 2","detail":"...","severity":"..."},
    {"title":"Headwind 3","detail":"...","severity":"..."}
  ],
  "regulatory": [
    {"title":"Key regulation or policy affecting ${industry}","detail":"What it requires, when it takes effect, and how it affects small operators.","status":"Active / Pending / Upcoming"},
    {"title":"Regulation 2","detail":"...","status":"..."},
    {"title":"Regulation 3","detail":"...","status":"..."}
  ],
  "technology": [
    {"title":"Technology trend affecting ${industry}","detail":"How this technology is changing the industry, adoption timeline, and what small operators should do.","adoption":"Early / Growing / Mainstream"},
    {"title":"Tech trend 2","detail":"...","adoption":"..."},
    {"title":"Tech trend 3","detail":"...","adoption":"..."}
  ],
  "laborMarket": {
    "shortage": "Description of skilled labor availability in ${industry}",
    "avgWage": "Average annual wage for skilled ${industry} worker",
    "trainingPipeline": "State of vocational/trade school pipeline for ${industry}",
    "tips": ["Actionable tip 1 for retaining/recruiting talent","Tip 2","Tip 3"]
  },
  "businessTrends": [
    {"title":"Business model or strategy trend","detail":"2 sentences on how the best operators in ${industry} are running their businesses differently."},
    {"title":"Trend 2","detail":"..."},
    {"title":"Trend 3","detail":"..."}
  ],
  "outlook": {
    "next12months": "1-2 sentences on the outlook for the next 12 months in ${industry}",
    "risks": ["Top risk 1","Risk 2","Risk 3"],
    "opportunities": ["Top opportunity 1","Opportunity 2","Opportunity 3"]
  }
}

Be specific and data-driven. Use industry knowledge current as of early 2025.`;

      const resp=await fetch("/api/ai",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:2000,
          messages:[{role:"user",content:prompt}]
        })
      });
      const result=await resp.json();
      const text=(result.content||[]).map(b=>b.text||"").join("");
      const clean=text.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      setData(parsed);
      const now=new Date();
      setLastUpdated(now);
      localStorage.setItem(INDUSTRY_STORAGE_KEY(user.id),JSON.stringify({data:parsed,ts:now.toISOString()}));
    }catch(e){
      setError("Failed to load industry data. Please try again.");
      console.error(e);
    }
    setLoading(false);
  };

  const SECTIONS=[
    {id:"overview",label:"Snapshot",icon:"📊"},
    {id:"tailwinds",label:"Tailwinds",icon:"🚀"},
    {id:"headwinds",label:"Headwinds",icon:"⚠️"},
    {id:"regulatory",label:"Regulatory",icon:"⚖️"},
    {id:"technology",label:"Technology",icon:"💡"},
    {id:"labor",label:"Labor",icon:"👷"},
    {id:"outlook",label:"Outlook",icon:"🔭"},
  ];

  const ind=Object.values(INDUSTRIES).find(i=>i.label===industry)||INDUSTRIES.hvac;
  const indColor=ind?.color||T.blue;

  const SEV_COLOR={High:T.red,Medium:T.amber,Low:T.muted};
  const ADO_COLOR={Early:T.muted,Growing:T.amber,Mainstream:T.green};
  const TF_COLOR={"Near-term":T.cyan,"Mid-term":T.blueL,"Long-term":T.muted};

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Industry Insights</h2>
          <p style={{color:T.muted,fontSize:13}}>
            {industry} · National industry trends, headwinds, tailwinds, regulatory &amp; technology
            {lastUpdated&&<span style={{marginLeft:8,color:isStale?T.amber:T.muted}}>
              · Updated {daysSinceUpdate===0?"today":`${daysSinceUpdate}d ago`}
              {isStale&&" · ⚠ Refresh recommended"}
            </span>}
          </p>
        </div>
        <button onClick={fetchIndustryData} disabled={loading} style={{display:"flex",alignItems:"center",gap:8,background:`linear-gradient(135deg,${indColor}22,${indColor}11)`,border:`1px solid ${indColor}50`,borderRadius:10,padding:"10px 18px",cursor:loading?"not-allowed":"pointer",color:indColor,fontSize:13,fontWeight:600,opacity:loading?0.7:1,transition:"all 0.2s"}}>
          {loading?<><Spinner size={13}/> Generating briefing…</>:<>📈 {data?"Refresh Insights":"Generate Industry Brief"}</>}
        </button>
      </div>

      {!data&&!loading&&(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:16,padding:56,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>📈</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,marginBottom:10}}>Industry briefing ready to generate</div>
          <p style={{color:T.muted,fontSize:14,maxWidth:520,margin:"0 auto 24px",lineHeight:1.7}}>Get a comprehensive national briefing on the <strong style={{color:T.white}}>{industry}</strong> industry: tailwinds, headwinds, regulatory changes, labor market, technology trends, and 12-month outlook.</p>
          <button onClick={fetchIndustryData} style={{background:`linear-gradient(135deg,${indColor},${indColor}cc)`,border:"none",borderRadius:10,padding:"13px 28px",cursor:"pointer",color:"white",fontSize:14,fontWeight:700}}>Generate Industry Brief →</button>
          <p style={{color:T.muted,fontSize:11,marginTop:12}}>Powered by AI · Refreshable quarterly · ~20 seconds</p>
        </div>
      )}
      {loading&&!data&&(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:16,padding:56,textAlign:"center"}}>
          <Spinner size={32}/>
          <div style={{marginTop:16,fontSize:15,color:T.offWhite}}>Compiling {industry} industry briefing…</div>
          <p style={{color:T.muted,fontSize:13,marginTop:8}}>Analyzing tailwinds, headwinds, regulatory landscape, and labor market</p>
        </div>
      )}
      {error&&<div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#F87171"}}>{error}</div>}

      {data&&(
        <>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:20,background:T.surface2,padding:4,borderRadius:10,border:`1px solid ${T.border}`}}>
            {SECTIONS.map(s=>(
              <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{padding:"7px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:activeSection===s.id?T.blue:"none",color:activeSection===s.id?"white":T.muted,transition:"all 0.15s",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:11}}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          {/* Snapshot */}
          {activeSection==="overview"&&(
            <div style={{animation:"fadeIn 0.25s ease"}}>
              {data.snapshot?.headline&&(
                <div style={{background:`${indColor}10`,border:`1px solid ${indColor}30`,borderRadius:12,padding:"14px 20px",marginBottom:16,fontSize:14,color:T.offWhite,lineHeight:1.6}}>
                  <span style={{color:indColor,fontWeight:700}}>Key takeaway: </span>{data.snapshot.headline}
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}} className="grid-2-mobile">
                {[
                  {label:"US Market Size",value:data.snapshot?.industrySize,color:T.green,icon:"🏭"},
                  {label:"5-Year CAGR",value:data.snapshot?.growth5yr,color:T.cyan,icon:"📈"},
                  {label:"Active Businesses",value:data.snapshot?.totalBusinesses,color:T.blueL,icon:"🏢"},
                ].map(s=>(
                  <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"16px 18px"}}>
                    <div style={{fontSize:18,marginBottom:8}}>{s.icon}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:s.color,lineHeight:1.2,marginBottom:3}}>{s.value||"—"}</div>
                    <div style={{fontSize:11,color:T.muted}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {[
                  {label:"Labor Shortage",value:data.snapshot?.laborShortage,color:{Yes:T.red,Moderate:T.amber,No:T.green}[data.snapshot?.laborShortage]||T.muted},
                  {label:"Consolidation",value:data.snapshot?.consolidationTrend,color:{Consolidating:T.amber,Stable:T.green,Fragmenting:T.cyan}[data.snapshot?.consolidationTrend]||T.muted},
                ].map(s=>(
                  <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,color:T.muted}}>{s.label}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:s.color}}>{s.value||"—"}</span>
                  </div>
                ))}
              </div>
              {data.outlook&&(
                <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:20}}>
                  <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>12-Month Outlook</div>
                  <p style={{fontSize:13,color:T.offWhite,lineHeight:1.7,marginBottom:14}}>{data.outlook.next12months}</p>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    {data.outlook.risks?.length>0&&(
                      <div>
                        <div style={{fontSize:11,color:T.red,fontWeight:600,marginBottom:8}}>Top Risks</div>
                        {data.outlook.risks.map((r,i)=>(
                          <div key={i} style={{display:"flex",gap:8,padding:"4px 0",fontSize:12,color:T.muted}}>
                            <span style={{color:T.red,flexShrink:0}}>▲</span>{r}
                          </div>
                        ))}
                      </div>
                    )}
                    {data.outlook.opportunities?.length>0&&(
                      <div>
                        <div style={{fontSize:11,color:T.green,fontWeight:600,marginBottom:8}}>Top Opportunities</div>
                        {data.outlook.opportunities.map((o,i)=>(
                          <div key={i} style={{display:"flex",gap:8,padding:"4px 0",fontSize:12,color:T.muted}}>
                            <span style={{color:T.green,flexShrink:0}}>▲</span>{o}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tailwinds */}
          {activeSection==="tailwinds"&&(
            <div style={{animation:"fadeIn 0.25s ease",display:"flex",flexDirection:"column",gap:12}}>
              {(data.tailwinds||[]).map((t,i)=>(
                <div key={i} style={{background:T.surface,border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>🚀</span>
                      <span style={{fontSize:15,fontWeight:600,color:T.green}}>{t.title}</span>
                    </div>
                    {t.timeframe&&<span style={{fontSize:10,background:`${TF_COLOR[t.timeframe]||T.muted}15`,color:TF_COLOR[t.timeframe]||T.muted,border:`1px solid ${TF_COLOR[t.timeframe]||T.muted}30`,borderRadius:4,padding:"2px 8px",fontWeight:600}}>{t.timeframe}</span>}
                  </div>
                  <p style={{fontSize:13,color:T.offWhite,lineHeight:1.7,paddingLeft:28}}>{t.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Headwinds */}
          {activeSection==="headwinds"&&(
            <div style={{animation:"fadeIn 0.25s ease",display:"flex",flexDirection:"column",gap:12}}>
              {(data.headwinds||[]).map((h,i)=>(
                <div key={i} style={{background:T.surface,border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>⚠️</span>
                      <span style={{fontSize:15,fontWeight:600,color:T.amber}}>{h.title}</span>
                    </div>
                    {h.severity&&<span style={{fontSize:10,background:`${SEV_COLOR[h.severity]||T.muted}15`,color:SEV_COLOR[h.severity]||T.muted,border:`1px solid ${SEV_COLOR[h.severity]||T.muted}30`,borderRadius:4,padding:"2px 8px",fontWeight:600}}>Severity: {h.severity}</span>}
                  </div>
                  <p style={{fontSize:13,color:T.offWhite,lineHeight:1.7,paddingLeft:28}}>{h.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Regulatory */}
          {activeSection==="regulatory"&&(
            <div style={{animation:"fadeIn 0.25s ease",display:"flex",flexDirection:"column",gap:12}}>
              {(data.regulatory||[]).map((r,i)=>(
                <div key={i} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>⚖️</span>
                      <span style={{fontSize:15,fontWeight:600,color:T.blueL}}>{r.title}</span>
                    </div>
                    {r.status&&<span style={{fontSize:10,background:r.status==="Active"?"rgba(16,185,129,0.1)":r.status==="Pending"?"rgba(245,158,11,0.1)":"rgba(37,99,235,0.1)",color:r.status==="Active"?T.green:r.status==="Pending"?T.amber:T.blueL,border:`1px solid ${r.status==="Active"?"rgba(16,185,129,0.3)":r.status==="Pending"?"rgba(245,158,11,0.3)":"rgba(37,99,235,0.3)"}`,borderRadius:4,padding:"2px 8px",fontWeight:600}}>{r.status}</span>}
                  </div>
                  <p style={{fontSize:13,color:T.offWhite,lineHeight:1.7,paddingLeft:28}}>{r.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Technology */}
          {activeSection==="technology"&&(
            <div style={{animation:"fadeIn 0.25s ease",display:"flex",flexDirection:"column",gap:12}}>
              {(data.technology||[]).map((t,i)=>(
                <div key={i} style={{background:T.surface,border:`1px solid ${indColor}20`,borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:18}}>💡</span>
                      <span style={{fontSize:15,fontWeight:600,color:indColor}}>{t.title}</span>
                    </div>
                    {t.adoption&&<span style={{fontSize:10,background:`${ADO_COLOR[t.adoption]||T.muted}15`,color:ADO_COLOR[t.adoption]||T.muted,border:`1px solid ${ADO_COLOR[t.adoption]||T.muted}30`,borderRadius:4,padding:"2px 8px",fontWeight:600}}>Adoption: {t.adoption}</span>}
                  </div>
                  <p style={{fontSize:13,color:T.offWhite,lineHeight:1.7,paddingLeft:28}}>{t.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Labor */}
          {activeSection==="labor"&&data.laborMarket&&(
            <div style={{animation:"fadeIn 0.25s ease",display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:16}}>
                  <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Avg Annual Wage</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:700,color:T.green}}>{data.laborMarket.avgWage||"—"}</div>
                </div>
                <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:16}}>
                  <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Training Pipeline</div>
                  <div style={{fontSize:13,color:T.offWhite,fontWeight:500}}>{data.laborMarket.trainingPipeline||"—"}</div>
                </div>
              </div>
              <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:20}}>
                <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Labor Market Overview</div>
                <p style={{fontSize:13,color:T.offWhite,lineHeight:1.7,marginBottom:16}}>{data.laborMarket.shortage}</p>
                {data.laborMarket.tips?.length>0&&(
                  <>
                    <div style={{fontSize:11,fontWeight:600,color:T.blueL,marginBottom:8}}>Retention & Recruiting Tips</div>
                    {data.laborMarket.tips.map((tip,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderTop:`1px solid ${T.border}`,fontSize:13,color:T.muted}}>
                        <span style={{color:T.blueL,flexShrink:0}}>›</span>{tip}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Outlook */}
          {activeSection==="outlook"&&(
            <div style={{animation:"fadeIn 0.25s ease",display:"flex",flexDirection:"column",gap:12}}>
              {data.businessTrends?.map((t,i)=>(
                <div key={i} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:18}}>🔭</span>
                    <span style={{fontSize:15,fontWeight:600,color:T.offWhite}}>{t.title}</span>
                  </div>
                  <p style={{fontSize:13,color:T.muted,lineHeight:1.7,paddingLeft:28}}>{t.detail}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{marginTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:T.muted}}>
            <span>AI-generated industry research · Based on data through early 2025 · Refresh quarterly</span>
            {lastUpdated&&<span>Generated {lastUpdated.toLocaleDateString()}</span>}
          </div>
        </>
      )}
    </div>
  );
}

// ─── AI BUSINESS ADVISOR (Contractor chat widget) ─────────────────────────────
function AIAdvisorView({user,leads}){
  const [messages,setMessages]=useState([
    {role:"assistant",content:`Hi ${user.company?.split(" ")[0]||"there"}! I'm your Streamline business advisor. I have full context on your pipeline, close rate, and the ${user.industry||"service"} market in ${user.city||"your area"}. Ask me anything — pricing questions, how to handle an objection, what to focus on this month, or what's happening in your market.`}
  ]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  const inputRef=useRef(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const won=leads.filter(l=>l.status==="won").length;
  const total=leads.length;
  const closeRate=total>0?Math.round((won/total)*100):0;
  const avgScore=total>0?Math.round(leads.reduce((s,l)=>s+(l.score||0),0)/total):0;
  const active=leads.filter(l=>l.status==="new"||l.status==="contacted").length;
  const recentWon=leads.filter(l=>l.status==="won").slice(0,3);

  const SUGGESTED=[
    "What should I charge for my most common job?",
    "How do I handle price objections?",
    "What should I focus on this month?",
    "How does my close rate compare to market?",
    "What are the biggest opportunities in my market right now?",
    "How do I get more Google reviews?",
  ];

  const send=async(msg)=>{
    const text=msg||input.trim();
    if(!text||loading)return;
    setInput("");
    const userMsg={role:"user",content:text};
    setMessages(p=>[...p,userMsg]);
    setLoading(true);

    const systemPrompt=`You are a sharp, practical business advisor for ${user.company||"this contractor"}, a ${user.industry||"service"} professional in ${user.city||"Columbus, OH"}.

THEIR CURRENT PIPELINE DATA:
- Total leads: ${total}
- Won jobs: ${won} (close rate: ${closeRate}%)
- Active leads: ${active}
- Average lead score: ${avgScore}/100
- Plan: ${user.plan||"Starter"}
- Recent wins: ${recentWon.map(l=>`${l.name} (${l.is_name||l.issue_type}, $${l.job_value||0})`).join(", ")||"none yet"}

You have deep expertise in the ${user.industry||"service"} industry and the ${user.city||"Columbus"} local market.
Be direct, specific, and actionable. Keep responses concise (3-5 sentences unless detail is needed).
Reference their actual data when relevant. Don't be generic — be their trusted advisor.`;

    try{
      const history=messages.map(m=>({role:m.role,content:m.content}));
      const resp=await fetch("/api/ai",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:600,
          system:systemPrompt,
          messages:[...history,userMsg]
        })
      });
      const result=await resp.json();
      const reply=(result.content||[]).map(b=>b.text||"").join("")||"I couldn't generate a response. Please try again.";
      setMessages(p=>[...p,{role:"assistant",content:reply}]);
    }catch(e){
      setMessages(p=>[...p,{role:"assistant",content:"Something went wrong connecting to the AI. Please check your network and try again."}]);
    }
    setLoading(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  };

  const ind=Object.values(INDUSTRIES).find(i=>i.label===user.industry)||INDUSTRIES.hvac;
  const indColor=ind?.color||T.blue;

  return(
    <div style={{animation:"fadeIn 0.3s ease",display:"flex",flexDirection:"column",height:"calc(100vh - 160px)",minHeight:500}}>
      <div style={{marginBottom:16,flexShrink:0}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>AI Business Advisor</h2>
        <p style={{color:T.muted,fontSize:13}}>Knows your pipeline, your market, and your industry. Ask anything.</p>
      </div>

      {/* Stats context bar */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",flexShrink:0}}>
        {[
          {label:"Your close rate",value:`${closeRate}%`,color:closeRate>=30?T.green:closeRate>=15?T.amber:T.red},
          {label:"Avg lead score",value:`${avgScore}`,color:T.cyan},
          {label:"Active leads",value:active,color:T.blueL},
          {label:"Industry",value:user.industry||"HVAC",color:indColor},
          {label:"Market",value:user.city||"Columbus",color:T.muted},
        ].map(s=>(
          <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:8,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:s.color}}>{s.value}</span>
            <span style={{fontSize:11,color:T.muted}}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Message list */}
      <div style={{flex:1,overflowY:"auto",background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,padding:16,marginBottom:12,display:"flex",flexDirection:"column",gap:12}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row"}}>
            <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:m.role==="user"?T.blue:`${indColor}20`,border:`1px solid ${m.role==="user"?T.blue:indColor}40`,color:m.role==="user"?"white":indColor}}>
              {m.role==="user"?(user.company?.[0]||"U"):"✦"}
            </div>
            <div style={{maxWidth:"78%",background:m.role==="user"?"rgba(37,99,235,0.15)":T.surface2,border:`1px solid ${m.role==="user"?"rgba(37,99,235,0.3)":T.border}`,borderRadius:m.role==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"10px 14px",fontSize:13,color:T.offWhite,lineHeight:1.65,whiteSpace:"pre-wrap"}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,background:`${indColor}20`,border:`1px solid ${indColor}40`,color:indColor}}>✦</div>
            <div style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:"4px 14px 14px 14px",padding:"12px 16px",display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.muted,animation:`typingDot 1.2s ease ${i*0.2}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Suggested questions */}
      {messages.length<=1&&(
        <div style={{marginBottom:10,flexShrink:0}}>
          <div style={{fontSize:11,color:T.muted,marginBottom:7,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"0.07em"}}>Suggested questions</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {SUGGESTED.map(s=>(
              <button key={s} onClick={()=>send(s)} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:T.offWhite,fontSize:12,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=indColor;e.currentTarget.style.background=`${indColor}10`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.background="none";}}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{display:"flex",gap:8,flexShrink:0}}>
        <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())} placeholder="Ask your advisor anything…" style={{flex:1,background:T.surface,border:`1px solid ${T.border2}`,borderRadius:10,padding:"11px 14px",color:T.white,fontSize:13,outline:"none",transition:"border-color 0.15s",userSelect:"text",WebkitUserSelect:"text"}} onFocus={e=>e.target.style.borderColor=indColor} onBlur={e=>e.target.style.borderColor=T.border2}/>
        <button onClick={()=>send()} disabled={!input.trim()||loading} style={{background:input.trim()&&!loading?`linear-gradient(135deg,${indColor},${indColor}cc)`:"none",border:`1px solid ${input.trim()&&!loading?indColor:T.border2}`,borderRadius:10,padding:"11px 18px",cursor:input.trim()&&!loading?"pointer":"not-allowed",color:input.trim()&&!loading?"white":T.muted,fontSize:13,fontWeight:600,transition:"all 0.2s",opacity:loading?0.6:1}}>
          {loading?<Spinner size={13}/>:"Send"}
        </button>
      </div>
    </div>
  );
}

// ─── REFERRAL TRACKING ────────────────────────────────────────────────────────
function ReferralView({user,toast}){
  const [referrals,setReferrals]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showInvite,setShowInvite]=useState(false);
  const [inviteEmail,setInviteEmail]=useState("");
  const [inviteName,setInviteName]=useState("");
  const [sending,setSending]=useState(false);
  const [copied,setCopied]=useState(false);

  const refCode=`SL-${(user.company||"REF").replace(/\s/g,"").substring(0,4).toUpperCase()}-${user.id.slice(-4).toUpperCase()}`;
  const refLink=`${window.location.origin}/?ref=${refCode}`;

  useEffect(()=>{
    // Load referrals from localStorage (in production: query Supabase referrals table)
    try{
      const saved=localStorage.getItem(`referrals_${user.id}`);
      if(saved)setReferrals(JSON.parse(saved));
    }catch(e){}
    setLoading(false);
  },[user.id]);

  const saveReferrals=(refs)=>{
    setReferrals(refs);
    try{localStorage.setItem(`referrals_${user.id}`,JSON.stringify(refs));}catch(e){}
  };

  const sendInvite=()=>{
    if(!inviteEmail.trim())return;
    setSending(true);
    const newRef={
      id:Date.now().toString(),
      name:inviteName||inviteEmail.split("@")[0],
      email:inviteEmail.trim(),
      status:"invited",
      invitedAt:new Date().toISOString(),
      reward:null,
      activeDays:0,
    };
    setTimeout(()=>{
      saveReferrals([...referrals,newRef]);
      toast({message:`Invite sent to ${inviteEmail}`,type:"success"});
      setInviteEmail("");setInviteName("");setShowInvite(false);setSending(false);
    },800);
  };

  const copyLink=()=>{
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast({message:"Referral link copied!",type:"success"});
    setTimeout(()=>setCopied(false),2000);
  };

  const earned=referrals.filter(r=>r.status==="rewarded").length;
  const pending=referrals.filter(r=>r.status==="signed_up"||r.status==="active").length;
  const invited=referrals.filter(r=>r.status==="invited").length;

  const STATUS_STYLE={
    invited:{color:T.muted,bg:"rgba(100,116,139,0.1)",label:"Invited"},
    signed_up:{color:T.amber,bg:"rgba(245,158,11,0.1)",label:"Signed Up"},
    active:{color:T.cyan,bg:"rgba(6,182,212,0.1)",label:"Active"},
    rewarded:{color:T.green,bg:"rgba(16,185,129,0.1)",label:"Reward Earned"},
  };

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Referrals</h2>
          <p style={{color:T.muted,fontSize:13}}>Refer a contractor — earn 1 free lead credit when they stay active for 60 days.</p>
        </div>
        <Btn onClick={()=>setShowInvite(true)} style={{display:"flex",alignItems:"center",gap:8}}>+ Invite a Contractor</Btn>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}} className="grid-2-mobile">
        {[
          {label:"Invites Sent",value:referrals.length,color:T.muted,icon:"✉️"},
          {label:"Pending",value:pending,color:T.amber,icon:"⏳"},
          {label:"Rewards Earned",value:earned,color:T.green,icon:"🎁"},
          {label:"Est. Lead Credits",value:`${earned} free`,color:T.cyan,icon:"⚡"},
        ].map(s=>(
          <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:18,marginBottom:8}}>{s.icon}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:s.color,lineHeight:1,marginBottom:3}}>{s.value}</div>
            <div style={{fontSize:11,color:T.muted}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:20,marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:600,color:T.offWhite,marginBottom:4}}>Your referral link</div>
        <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Share this link — when a contractor applies through it, they're tied to you automatically.</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{flex:1,background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"9px 12px",fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:T.blueL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{refLink}</div>
          <button onClick={copyLink} style={{background:copied?"rgba(16,185,129,0.12)":"none",border:`1px solid ${copied?T.green:T.border2}`,borderRadius:8,padding:"9px 14px",cursor:"pointer",color:copied?T.green:T.offWhite,fontSize:12,fontWeight:600,whiteSpace:"nowrap",transition:"all 0.2s"}}>
            {copied?"✓ Copied":"Copy Link"}
          </button>
        </div>
        <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
          <div style={{fontSize:11,color:T.muted,background:T.surface2,border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 10px"}}>Your code: <span style={{color:T.blueL,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{refCode}</span></div>
        </div>
      </div>

      {/* How it works */}
      <div style={{background:"rgba(37,99,235,0.06)",border:"1px solid rgba(37,99,235,0.15)",borderRadius:12,padding:16,marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:600,color:T.blueL,marginBottom:10}}>How referral rewards work</div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          {[
            {step:"1",text:"Share your link or invite by email"},
            {step:"2",text:"They apply and get approved"},
            {step:"3",text:"Stay active 60+ days → you earn 1 free lead credit"},
            {step:"4",text:"No limit — refer as many as you want"},
          ].map(s=>(
            <div key={s.step} style={{display:"flex",gap:8,alignItems:"flex-start",minWidth:180,flex:1}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(37,99,235,0.2)",border:"1px solid rgba(37,99,235,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:T.blueL,flexShrink:0}}>{s.step}</div>
              <div style={{fontSize:12,color:T.offWhite,lineHeight:1.5}}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral table */}
      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:120,gap:12}}><Spinner/></div>
      ):referrals.length===0?(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,padding:48,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>🤝</div>
          <div style={{fontSize:15,color:T.offWhite,marginBottom:6}}>No referrals yet</div>
          <div style={{fontSize:13,color:T.muted,marginBottom:20}}>Invite another contractor and earn a free lead when they go active.</div>
          <Btn onClick={()=>setShowInvite(true)}>+ Send First Invite</Btn>
        </div>
      ):(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 120px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
            {["Name","Email","Status","Invited","Reward"].map(h=><div key={h}>{h}</div>)}
          </div>
          {referrals.map((r,i)=>{
            const ss=STATUS_STYLE[r.status]||STATUS_STYLE.invited;
            return(
              <div key={r.id} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 120px",padding:"12px 16px",borderBottom:i<referrals.length-1?`1px solid ${T.border}`:"none",alignItems:"center",fontSize:13}}>
                <div style={{fontWeight:600,color:T.white}}>{r.name}</div>
                <div style={{fontSize:11,color:T.muted}}>{r.email}</div>
                <div><span style={{fontSize:10,background:ss.bg,color:ss.color,border:`1px solid ${ss.color}30`,borderRadius:4,padding:"2px 8px",fontWeight:600,textTransform:"uppercase"}}>{ss.label}</span></div>
                <div style={{fontSize:11,color:T.muted}}>{new Date(r.invitedAt).toLocaleDateString()}</div>
                <div style={{fontSize:12,color:r.status==="rewarded"?T.green:T.muted}}>{r.status==="rewarded"?"✓ 1 free lead":"—"}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite modal */}
      <Modal open={showInvite} onClose={()=>{setShowInvite(false);setInviteEmail("");setInviteName("");}} title="Invite a Contractor">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <p style={{fontSize:13,color:T.muted}}>Enter their info and we'll send them a personalized invite with your referral code included.</p>
          <Inp label="Their Name (optional)" value={inviteName} onChange={setInviteName} placeholder="Mike from Apex Plumbing"/>
          <Inp label="Their Email" value={inviteEmail} onChange={setInviteEmail} type="email" placeholder="mike@apexplumbing.com" required/>
          <div style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",fontSize:12,color:T.muted,lineHeight:1.6}}>
            Your referral code <strong style={{color:T.blueL,fontFamily:"'JetBrains Mono',monospace"}}>{refCode}</strong> will be included automatically. You'll earn 1 free lead credit when they stay active for 60+ days.
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="outline" onClick={()=>{setShowInvite(false);setInviteEmail("");setInviteName("");}} style={{flex:1}}>Cancel</Btn>
            <Btn onClick={sendInvite} disabled={!inviteEmail.trim()||sending} style={{flex:2}}>
              {sending?<><Spinner size={13}/> Sending…</>:"Send Invite"}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── LEAD REPLAY ──────────────────────────────────────────────────────────────
function LeadReplayView({user,leads,toast}){
  const [replaying,setReplaying]=useState(null);
  const [replayNote,setReplayNote]=useState("");
  const [submitted,setSubmitted]=useState(new Set());

  // Lost leads that scored 60+ and are at least 7 days old — eligible for replay
  const eligibleLeads=leads.filter(l=>{
    if(l.status!=="lost")return false;
    if((l.score||0)<60)return false;
    if(submitted.has(l.id))return false;
    const daysOld=Math.floor((Date.now()-new Date(l.created_at))/(24*60*60*1000));
    return daysOld>=7;
  }).sort((a,b)=>b.score-a.score);

  const requestReplay=async(lead)=>{
    setReplaying(null);
    const next=new Set(submitted);next.add(lead.id);setSubmitted(next);
    // In production: insert a replay_requests row in Supabase
    toast({message:`Replay requested for ${lead.name} — we'll re-contact and route back if they're still interested`,type:"success"});
  };

  const potentialValue=eligibleLeads.reduce((s,l)=>{
    const ind=Object.values(INDUSTRIES).find(i=>i.label===l.industry);
    // estimate mid-point from industry estimates if available
    return s+1500; // fallback avg
  },0);

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Lead Replay</h2>
        <p style={{color:T.muted,fontSize:13}}>Lost leads scored 60+ that are at least 7 days old. Request a re-engagement and we'll check if they're still looking.</p>
      </div>

      {/* Value callout */}
      {eligibleLeads.length>0&&(
        <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:T.green,marginBottom:3}}>{eligibleLeads.length} leads eligible for replay</div>
            <div style={{fontSize:12,color:T.muted}}>These were high-quality leads that went cold — some may still be in-market.</div>
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:T.green}}>↺ {eligibleLeads.length}</div>
        </div>
      )}

      {eligibleLeads.length===0?(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,padding:56,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>✨</div>
          <div style={{fontSize:15,color:T.offWhite,marginBottom:6}}>No eligible leads for replay</div>
          <div style={{fontSize:13,color:T.muted,maxWidth:400,margin:"0 auto"}}>Lost leads scored 60+ that are 7+ days old will appear here. Replay becomes available when a lead cools off enough that a fresh re-engagement might land differently.</div>
        </div>
      ):(
        <div style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr 140px",padding:"10px 16px",borderBottom:`1px solid ${T.border}`,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>
            {["Lead","Service","Score","Days Lost","Contact",""].map(h=><div key={h}>{h}</div>)}
          </div>
          {eligibleLeads.map((l,i)=>{
            const daysLost=Math.floor((Date.now()-new Date(l.created_at))/(24*60*60*1000));
            return(
              <div key={l.id} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr 140px",padding:"13px 16px",borderBottom:i<eligibleLeads.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:T.white}}>{l.name}</div>
                  <div style={{fontSize:11,color:T.muted}}>{l.phone}</div>
                </div>
                <div style={{fontSize:12,color:T.offWhite}}>{l.is_name||l.issue_type}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:l.score>=75?T.green:l.score>=60?T.amber:T.muted}}>{l.score}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted}}>{daysLost}d ago</div>
                <div style={{fontSize:11}}>
                  {l.phone&&<a href={`tel:${l.phone}`} style={{color:T.cyan,textDecoration:"none"}}>📞 {l.phone.slice(-4)}</a>}
                </div>
                <div>
                  <button onClick={()=>{setReplaying(l);setReplayNote("");}} style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:8,padding:"7px 12px",cursor:"pointer",color:T.green,fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>
                    ↺ Replay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recently replayed */}
      {submitted.size>0&&(
        <div style={{marginTop:16,background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"12px 16px"}}>
          <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Replays Requested This Session</div>
          <div style={{fontSize:13,color:T.offWhite}}>{submitted.size} lead{submitted.size!==1?"s":""} queued for re-engagement by the Streamline team.</div>
        </div>
      )}

      <Modal open={!!replaying} onClose={()=>setReplaying(null)} title={`Request Replay — ${replaying?.name}`}>
        {replaying&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:T.surface2,borderRadius:8,padding:"12px 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12}}>
              {[["Score",replaying.score],["Service",replaying.is_name||replaying.issue_type],["Phone",replaying.phone],["Lost",`${Math.floor((Date.now()-new Date(replaying.created_at))/(24*60*60*1000))}d ago`]].map(([k,v])=>(
                <div key={k}><span style={{color:T.muted}}>{k}: </span><span style={{color:T.white,fontWeight:500}}>{v||"—"}</span></div>
              ))}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.offWhite,marginBottom:6}}>Notes for re-engagement (optional)</div>
              <textarea value={replayNote} onChange={e=>setReplayNote(e.target.value)} placeholder="Any context for the re-outreach? e.g. 'They mentioned they might be ready in 30 days' or 'Offer the seasonal discount'" style={{width:"100%",background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 12px",color:T.white,fontSize:13,outline:"none",minHeight:80,resize:"vertical",fontFamily:"inherit",userSelect:"text",WebkitUserSelect:"text"}}/>
            </div>
            <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:"10px 14px",fontSize:12,color:T.offWhite,lineHeight:1.6}}>
              The Streamline team will re-contact this lead, mention it's a follow-up from your original conversation, and route them back to you if they're still interested.
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="outline" onClick={()=>setReplaying(null)} style={{flex:1}}>Cancel</Btn>
              <Btn onClick={()=>requestReplay(replaying)} style={{flex:2,background:"rgba(16,185,129,0.15)",border:`1px solid ${T.green}`,color:T.green}}>↺ Request Replay</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── JOB PHOTO GALLERY ────────────────────────────────────────────────────────
function JobPhotoGallery({user,leads,toast}){
  const [photos,setPhotos]=useState([]);
  const [uploading,setUploading]=useState(false);
  const [showUpload,setShowUpload]=useState(false);
  const [selectedLead,setSelectedLead]=useState("");
  const [caption,setCaption]=useState("");
  const [previewUrl,setPreviewUrl]=useState(null);
  const [file,setFile]=useState(null);
  const [lightbox,setLightbox]=useState(null);
  const fileRef=useRef(null);

  const storageKey=`photos_${user.id}`;

  useEffect(()=>{
    try{
      const saved=localStorage.getItem(storageKey);
      if(saved)setPhotos(JSON.parse(saved));
    }catch(e){}
  },[user.id]);

  const savePhotos=(p)=>{
    setPhotos(p);
    try{localStorage.setItem(storageKey,JSON.stringify(p));}catch(e){}
  };

  const handleFileChange=(e)=>{
    const f=e.target.files?.[0];
    if(!f)return;
    setFile(f);
    const reader=new FileReader();
    reader.onload=(ev)=>setPreviewUrl(ev.target.result);
    reader.readAsDataURL(f);
  };

  const uploadPhoto=async()=>{
    if(!file)return;
    setUploading(true);
    // In production: upload to Supabase Storage, get public URL
    // For now, store base64 locally
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const lead=leads.find(l=>l.id===selectedLead);
      const newPhoto={
        id:Date.now().toString(),
        dataUrl:ev.target.result,
        caption:caption||"Job photo",
        leadId:selectedLead,
        leadName:lead?.name||"Unlinked",
        jobType:lead?.is_name||lead?.issue_type||"",
        uploadedAt:new Date().toISOString(),
        askForReview:true,
      };
      const updated=[newPhoto,...photos];
      savePhotos(updated);
      setFile(null);setPreviewUrl(null);setCaption("");setSelectedLead("");
      setShowUpload(false);setUploading(false);
      toast({message:"Photo saved to gallery",type:"success"});
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto=(id)=>{
    const updated=photos.filter(p=>p.id!==id);
    savePhotos(updated);
    if(lightbox?.id===id)setLightbox(null);
    toast({message:"Photo deleted",type:"info"});
  };

  const wonLeads=leads.filter(l=>l.status==="won");

  return(
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,3vw,26px)",letterSpacing:-0.8,marginBottom:5}}>Job Photos</h2>
          <p style={{color:T.muted,fontSize:13}}>Before & after photos tied to won jobs. Build your portfolio and use them to ask for reviews.</p>
        </div>
        <Btn onClick={()=>setShowUpload(true)} style={{display:"flex",alignItems:"center",gap:8}}>+ Add Photo</Btn>
      </div>

      {/* Stats bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"Total Photos",value:photos.length,color:T.blueL,icon:"📷"},
          {label:"Linked to Jobs",value:photos.filter(p=>p.leadId).length,color:T.cyan,icon:"🔗"},
          {label:"Review Reminders",value:photos.filter(p=>p.askForReview).length,color:T.amber,icon:"⭐"},
        ].map(s=>(
          <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,padding:"14px 18px"}}>
            <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:s.color,lineHeight:1,marginBottom:3}}>{s.value}</div>
            <div style={{fontSize:11,color:T.muted}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gallery grid */}
      {photos.length===0?(
        <div style={{background:T.surface,border:`2px dashed ${T.border2}`,borderRadius:14,padding:56,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:14}}>📷</div>
          <div style={{fontSize:15,color:T.offWhite,marginBottom:8}}>No photos yet</div>
          <div style={{fontSize:13,color:T.muted,maxWidth:380,margin:"0 auto 20px",lineHeight:1.6}}>Upload before & after photos tied to won jobs. They help you ask for reviews and build credibility with future leads.</div>
          <Btn onClick={()=>setShowUpload(true)}>Upload First Photo</Btn>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
          {photos.map(p=>(
            <div key={p.id} style={{background:T.surface,border:`1px solid ${T.border2}`,borderRadius:12,overflow:"hidden",position:"relative"}}>
              <div style={{position:"relative",aspectRatio:"4/3",overflow:"hidden",cursor:"pointer"}} onClick={()=>setLightbox(p)}>
                <img src={p.dataUrl} alt={p.caption} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s"}} onMouseEnter={e=>e.target.style.transform="scale(1.05)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(0deg,rgba(0,0,0,0.6) 0%,transparent 50%)",pointerEvents:"none"}}/>
                <div style={{position:"absolute",bottom:10,left:10,right:10}}>
                  <div style={{fontSize:12,fontWeight:600,color:"white",marginBottom:2}}>{p.caption}</div>
                  {p.jobType&&<div style={{fontSize:10,color:"rgba(255,255,255,0.7)"}}>{p.jobType}</div>}
                </div>
              </div>
              <div style={{padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:11,color:T.offWhite,fontWeight:500}}>{p.leadName}</div>
                  <div style={{fontSize:10,color:T.muted}}>{new Date(p.uploadedAt).toLocaleDateString()}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {p.askForReview&&(
                    <div title="Review reminder set" style={{width:22,height:22,borderRadius:"50%",background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>⭐</div>
                  )}
                  <button onClick={()=>deletePhoto(p.id)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 7px",cursor:"pointer",color:T.muted,fontSize:11}} title="Delete">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      <Modal open={showUpload} onClose={()=>{setShowUpload(false);setFile(null);setPreviewUrl(null);setCaption("");setSelectedLead("");}} title="Add Job Photo" width={520}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* File drop zone */}
          <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${previewUrl?T.green:T.border2}`,borderRadius:12,padding:previewUrl?0:"32px 20px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",overflow:"hidden",background:previewUrl?"none":T.surface2}} onMouseEnter={e=>!previewUrl&&(e.currentTarget.style.borderColor=T.blueL)} onMouseLeave={e=>!previewUrl&&(e.currentTarget.style.borderColor=T.border2)}>
            {previewUrl?(
              <img src={previewUrl} alt="Preview" style={{width:"100%",maxHeight:280,objectFit:"cover",borderRadius:10,display:"block"}}/>
            ):(
              <>
                <div style={{fontSize:32,marginBottom:8}}>📷</div>
                <div style={{fontSize:13,color:T.offWhite,marginBottom:4}}>Click to select a photo</div>
                <div style={{fontSize:11,color:T.muted}}>JPG, PNG, HEIC — up to 10MB</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{display:"none"}}/>
          {previewUrl&&<button onClick={()=>{setFile(null);setPreviewUrl(null);if(fileRef.current)fileRef.current.value="";}} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",color:T.muted,fontSize:12,alignSelf:"flex-start"}}>Remove photo</button>}
          <Inp label="Caption" value={caption} onChange={setCaption} placeholder="e.g. Full AC replacement — before & after"/>
          <div>
            <label style={{fontSize:12,fontWeight:600,color:T.offWhite,marginBottom:6,display:"block"}}>Link to a Won Job (optional)</label>
            <select value={selectedLead} onChange={e=>setSelectedLead(e.target.value)} style={{width:"100%",background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"9px 12px",color:selectedLead?T.white:T.muted,fontSize:13,outline:"none"}}>
              <option value="">— Not linked to a job —</option>
              {wonLeads.map(l=>(
                <option key={l.id} value={l.id}>{l.name} — {l.is_name||l.issue_type} ({new Date(l.created_at).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="outline" onClick={()=>{setShowUpload(false);setFile(null);setPreviewUrl(null);setCaption("");setSelectedLead("");}} style={{flex:1}}>Cancel</Btn>
            <Btn onClick={uploadPhoto} disabled={!file||uploading} style={{flex:2}}>
              {uploading?<><Spinner size={13}/> Saving…</>:"Save Photo"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Lightbox */}
      {lightbox&&(
        <div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:16,overflow:"hidden",maxWidth:720,width:"100%",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
            <img src={lightbox.dataUrl} alt={lightbox.caption} style={{width:"100%",maxHeight:520,objectFit:"contain",background:"#000"}}/>
            <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:T.white,marginBottom:2}}>{lightbox.caption}</div>
                <div style={{fontSize:12,color:T.muted}}>{lightbox.leadName} · {new Date(lightbox.uploadedAt).toLocaleDateString()}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{deletePhoto(lightbox.id);setLightbox(null);}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"7px 12px",cursor:"pointer",color:T.red,fontSize:12}}>Delete</button>
                <button onClick={()=>setLightbox(null)} style={{background:T.surface2,border:`1px solid ${T.border2}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",color:T.offWhite,fontSize:12}}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("loading");
  const [user,setUser]=useState(null);
  const [adminUser,setAdminUser]=useState(null);
  const [intakeInd,setIntakeInd]=useState("hvac");
  const [page2,setPage2]=useState(null); // sub-pages: 'apply'
  const [industryPage,setIndustryPage]=useState(null);

  // Detect ?admin=1 in URL to show admin login
  const isAdminRoute=new URLSearchParams(window.location.search).get("admin")==="1";

  useEffect(()=>{
    const urlInd=getIndustryFromURL();
    db.getSession().then(async session=>{
      if(session){
        // Admin email bypasses contractor dashboard
        if(session.user.email===ADMIN_EMAIL){
          setAdminUser(session.user);
          setPage("admin");
          return;
        }
        const business=await db.getBusiness(session.user.id);
        setUser({...session.user,...business});
        setPage("dashboard");
      }else if(isAdminRoute){
        setPage("adminLogin");
      }else if(urlInd){
        setIntakeInd(urlInd);setPage("intake");
      }else{
        setPage("landing");
      }
    });
    const{data:{subscription}}=sb.auth.onAuthStateChange(async(event,session)=>{
      if(event==="SIGNED_OUT"){
        setUser(null);setAdminUser(null);
        setPage(isAdminRoute?"adminLogin":"landing");
      }
    });
    return()=>subscription.unsubscribe();
  },[]);

  const goIntake=ind=>{setIntakeInd(ind||"hvac");setPage("intake");};
  const handleLogout=async()=>{await db.signOut();setUser(null);setAdminUser(null);setPage("landing");};
  const handleAdminLogout=async()=>{await db.signOut();setAdminUser(null);setPage("adminLogin");};

  if(page==="loading")return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,flexDirection:"column",gap:14}}>
      <LogoMark size={38}/><Spinner size={22}/><span style={{color:T.muted,fontSize:13,marginTop:4}}>Loading…</span>
    </div>
  );
  if(page==="adminLogin")return <AdminLogin onAuth={u=>{setAdminUser(u);setPage("admin");}}/>;
  if(page==="admin"&&adminUser)return <AdminDashboard adminUser={adminUser} onLogout={handleAdminLogout}/>;
  if(page2==="apply")return <ContractorApplicationForm onBack={()=>setPage2(null)}/>;
  if(page==="intake")return <IntakeForm industryKey={intakeInd} onBack={()=>setPage("landing")}/>;
  if(page==="dashboard"&&user)return <Dashboard user={user} onLogout={handleLogout}/>;
  if(industryPage)return <IndustryPage industryKey={industryPage} onBack={()=>{setIndustryPage(null);}} onApply={()=>setPage2("apply")}/>;
  return <LandingPage onLogin={u=>{setUser(u);setPage("dashboard");}} onIntakeForm={goIntake} onApply={()=>setPage2("apply")} onIndustry={k=>{setIndustryPage(k);window.scrollTo(0,0);}}/>;
}