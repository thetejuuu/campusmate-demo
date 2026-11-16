import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bell, BookOpen, BriefcaseBusiness, Check, CheckCircle2,
  ChevronDown, CircleHelp, Clock3, Coffee, GraduationCap, MapPin,
  MessageCircle, Plus, Search, Send, ShieldCheck, ShoppingBag,
  Sparkles, Wallet, X, Zap
} from "lucide-react";

type TaskStatus = "Open" | "Awaiting payment" | "Assigned" | "Completed";
type Task = {
  id: string; title: string; description: string; category: string;
  location: string; reward: number; posted: string; requester: string;
  status: TaskStatus; interested: string[]; assignedTo?: string;
};
type ChatMessage = { id: string; taskId: string; from: string; body: string; time: string };

const seedTasks: Task[] = [
  { id:"t1", title:"Pick up a parcel from the faculty office", description:"A small parcel is ready for collection. Please bring it to the COHS common room.", category:"Pickup & delivery", location:"COHS · Faculty office", reward:800, posted:"12 min ago", requester:"Aisha A.", status:"Open", interested:["You"] },
  { id:"t2", title:"Help me get lunch from the cafeteria", description:"Please get jollof rice and water. I'll send the exact order in chat.", category:"Food & groceries", location:"COHS · Cafeteria", reward:1200, posted:"25 min ago", requester:"Mubarak M.", status:"Open", interested:[] },
  { id:"t3", title:"Print and bind lecture notes", description:"About 35 pages, black and white. Deliver to the library entrance.", category:"Academic support", location:"Main library", reward:1000, posted:"40 min ago", requester:"Zainab O.", status:"Open", interested:["You","Tobi K."] },
  { id:"t4", title:"Buy a phone charger", description:"Need a Type-C cable from a nearby shop. Message me before buying.", category:"Shopping", location:"COHS · Student area", reward:1500, posted:"1 hr ago", requester:"Faruq S.", status:"Assigned", interested:["You"], assignedTo:"You" }
];

const categories = ["All tasks","Pickup & delivery","Food & groceries","Academic support","Shopping","Other"];
const money = (n:number) => `₦${n.toLocaleString("en-NG")}`;
const readStore = <T,>(key:string, fallback:T):T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
};

export default function App() {
  const [tasks,setTasks] = useState<Task[]>(() => readStore("cm_tasks_v1", seedTasks));
  const [messages,setMessages] = useState<ChatMessage[]>(() => readStore("cm_messages_v1", [
    {id:"m1",taskId:"t4",from:"You",body:"Hi! I can help with this. Which shop do you prefer?",time:"10:42 AM"},
    {id:"m2",taskId:"t4",from:"Faruq S.",body:"The one beside the student centre, please.",time:"10:44 AM"}
  ]));
  const [tab,setTab] = useState<"discover"|"activity"|"messages">("discover");
  const [role,setRole] = useState<"Requester"|"Tasker">("Tasker");
  const [category,setCategory] = useState("All tasks");
  const [query,setQuery] = useState("");
  const [modal,setModal] = useState<"create"|"payment"|"manage"|"help"|null>(null);
  const [activeTask,setActiveTask] = useState<string>("t4");
  const [newTitle,setNewTitle] = useState("");
  const [newDescription,setNewDescription] = useState("");
  const [newCategory,setNewCategory] = useState("Pickup & delivery");
  const [newLocation,setNewLocation] = useState("COHS");
  const [newReward,setNewReward] = useState("1000");
  const [chatDraft,setChatDraft] = useState("");
  const [notice,setNotice] = useState("");
  const [paymentOutcome,setPaymentOutcome] = useState<"success"|"failed"|"cancelled">("success");

  useEffect(()=>{ localStorage.setItem("cm_tasks_v1",JSON.stringify(tasks)); },[tasks]);
  useEffect(()=>{ localStorage.setItem("cm_messages_v1",JSON.stringify(messages)); },[messages]);

  const filtered = useMemo(()=>tasks.filter(t =>
    t.status === "Open" &&
    (category === "All tasks" || t.category === category) &&
    `${t.title} ${t.description} ${t.location}`.toLowerCase().includes(query.toLowerCase())
  ),[tasks,category,query]);
  const currentTask = tasks.find(t=>t.id===activeTask);
  const myTasks = tasks.filter(t=>t.requester==="You" || t.interested.includes("You") || t.assignedTo==="You");
  const activeMessages = messages.filter(m=>m.taskId===activeTask);

  function flash(text:string) { setNotice(text); window.setTimeout(()=>setNotice(""),2800); }
  function expressInterest(id:string) {
    setTasks(prev=>prev.map(t=>t.id===id && !t.interested.includes("You") ? {...t,interested:[...t.interested,"You"]}:t));
    flash("Interest sent. The requester can now review your profile.");
  }
  function createTask(e:React.FormEvent) {
    e.preventDefault();
    if(!newTitle.trim() || !newDescription.trim() || Number(newReward)<100) return;
    const task:Task={id:`t${Date.now()}`,title:newTitle.trim(),description:newDescription.trim(),category:newCategory,location:newLocation.trim()||"Campus",reward:Number(newReward),posted:"Just now",requester:"You",status:"Open",interested:[]};
    setTasks(prev=>[task,...prev]); setModal(null); setTab("discover");
    setNewTitle("");setNewDescription("");setNewReward("1000");flash("Your task is now live on the campus board.");
  }
  function startPayment() {
    if(!currentTask) return;
    setModal("payment");
  }
  function processPayment() {
    if(!currentTask) return;
    if(paymentOutcome==="success") {
      setTasks(prev=>prev.map(t=>t.id===currentTask.id?{...t,status:"Assigned"}:t));
      setModal(null);flash("Demo payment successful. Task assigned!");
    } else {
      setModal(null);flash(paymentOutcome==="failed"?"Demo payment failed. No money was moved.":"Payment cancelled. No money was moved.");
    }
  }
  function sendMessage(e:React.FormEvent) {
    e.preventDefault(); if(!chatDraft.trim()) return;
    setMessages(prev=>[...prev,{id:`m${Date.now()}`,taskId:activeTask,from:"You",body:chatDraft.trim(),time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}]);
    setChatDraft("");
  }
  function completeTask(id:string) {
    setTasks(prev=>prev.map(t=>t.id===id?{...t,status:"Completed"}:t));flash("Marked as completed in this demo.");
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Zap size={19}/></div><div><b>CampusMate</b><small>Campus errands, made easy</small></div></div>
      <div className="campus-pill"><span className="pulse"/> UNILORIN · COHS</div>
      <div className="side-label">WORKSPACE</div>
      <button className={`nav-item ${tab==="discover"?"active":""}`} onClick={()=>setTab("discover")}><Search size={18}/> Discover tasks</button>
      <button className={`nav-item ${tab==="activity"?"active":""}`} onClick={()=>setTab("activity")}><BriefcaseBusiness size={18}/> My activity</button>
      <button className={`nav-item ${tab==="messages"?"active":""}`} onClick={()=>setTab("messages")}><MessageCircle size={18}/> Messages <span className="nav-count">2</span></button>
      <div className="side-spacer"/>
      <div className="sidebar-card"><div className="mini-icon"><GraduationCap size={19}/></div><b>Made for campus life.</b><p>Get small tasks done by people who are already around you.</p><button onClick={()=>setModal("help")}>How it works <ArrowRight size={14}/></button></div>
      <div className="profile"><div className="avatar">HI</div><div><b>Habeeb Issa</b><small>Demo student account</small></div><ChevronDown size={16}/></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div className="mobile-brand"><div className="brand-mark"><Zap size={17}/></div><b>CampusMate</b></div>
        <div className="crumb">Workspace <span>/</span> {tab==="discover"?"Discover tasks":tab==="activity"?"My activity":"Messages"}</div>
        <div className="top-actions"><span className="demo-tag"><span/> DEMO MODE</span><button className="icon-button" onClick={()=>flash("You're all caught up!") } aria-label="Notifications"><Bell size={18}/></button><div className="avatar small-avatar">HI</div></div>
      </header>
      <div className="demo-banner"><ShieldCheck size={16}/><span><b>Prototype environment.</b> Payments and accounts are simulated. No real money moves.</span><button onClick={()=>setModal("help")}>Learn more</button></div>

      <section className="content">
        {tab==="discover" && <>
          <div className="welcome-row"><div><div className="eyebrow">MONDAY, NOVEMBER 16, 2026</div><h1>Good morning, Habeeb <span>✦</span></h1><p className="subheading">A little help goes a long way. What can you get done today?</p></div><button className="primary-button" onClick={()=>setModal("create")}><Plus size={17}/> Post a task</button></div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon lilac"><ShoppingBag size={18}/></div><div><small>Open tasks</small><strong>{tasks.filter(t=>t.status==="Open").length}</strong></div><span className="stat-note">Around campus</span></div>
            <div className="stat-card"><div className="stat-icon mint"><CheckCircle2 size={18}/></div><div><small>Tasks completed</small><strong>{tasks.filter(t=>t.status==="Completed").length}</strong></div><span className="stat-note">In this demo</span></div>
            <div className="stat-card"><div className="stat-icon amber"><Wallet size={18}/></div><div><small>Typical reward</small><strong>₦1,125</strong></div><span className="stat-note">Across sample tasks</span></div>
          </div>
          <div className="section-heading"><div><h2>Find a task</h2><p>Explore what students around you need help with.</p></div><div className="role-switch"><button className={role==="Tasker"?"selected":""} onClick={()=>setRole("Tasker")}>I want to earn</button><button className={role==="Requester"?"selected":""} onClick={()=>setRole("Requester")}>I need help</button></div></div>
          <div className="search-row"><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks, places or keywords..."/>{query&&<button onClick={()=>setQuery("")}><X size={15}/></button>}</div><button className="filter-button" onClick={()=>setCategory("All tasks")}>Reset filters</button></div>
          <div className="category-row">{categories.map(c=><button key={c} className={`category-chip ${category===c?"chosen":""}`} onClick={()=>setCategory(c)}>{c}</button>)}</div>
          <div className="task-grid">{filtered.map(task=><article className="task-card" key={task.id}>
            <div className="task-top"><span className="category-label">{task.category}</span><span className="posted">{task.posted}</span></div>
            <h3>{task.title}</h3><p className="task-desc">{task.description}</p>
            <div className="task-meta"><span><MapPin size={14}/>{task.location}</span><span><Clock3 size={14}/>Flexible</span></div>
            <div className="task-bottom"><div><small>OFFERED REWARD</small><strong>{money(task.reward)}</strong></div><button className="outline-button" onClick={()=>{setActiveTask(task.id); if(role==="Tasker") expressInterest(task.id); else setModal("manage");}}>{role==="Tasker"?(task.interested.includes("You")?"Interest sent":"I'm interested"):"View applicants"} <ArrowRight size={14}/></button></div>
          </article>)}
          {filtered.length===0&&<div className="empty-state"><Search size={24}/><b>No tasks found</b><p>Try another keyword or category.</p><button onClick={()=>{setQuery("");setCategory("All tasks")}}>Clear filters</button></div>}</div>
          <div className="tip-strip"><Sparkles size={18}/><div><b>Good campus etiquette</b><span>Agree on the details in chat before spending money or starting an errand.</span></div></div>
        </>}

        {tab==="activity" && <><div className="page-heading"><div className="eyebrow">YOUR CAMPUS WORKSPACE</div><h1>My activity</h1><p className="subheading">Keep track of tasks you've posted, joined or completed.</p></div>
          <div className="activity-list">{myTasks.length?myTasks.map(t=><div className="activity-item" key={t.id}><div className="activity-icon"><BriefcaseBusiness size={19}/></div><div className="activity-main"><b>{t.title}</b><small>{t.requester==="You"?"Posted by you":`Requested by ${t.requester}`} · {t.location}</small></div><span className={`status ${t.status.toLowerCase().replace(" ","-")}`}>{t.status}</span><strong className="activity-price">{money(t.reward)}</strong>{t.status==="Assigned"&&<button className="tiny-button" onClick={()=>completeTask(t.id)}>Complete</button>}</div>):<div className="empty-state"><BookOpen size={25}/><b>Your activity will appear here</b><p>Post a task or express interest in one to get started.</p><button onClick={()=>setTab("discover")}>Explore tasks</button></div>}</div>
        </>}

        {tab==="messages" && <><div className="page-heading"><div className="eyebrow">STAY IN THE LOOP</div><h1>Messages</h1><p className="subheading">Coordinate task details before getting started.</p></div>
          <div className="chat-layout"><div className="chat-list"><b className="chat-list-title">CONVERSATIONS</b>{tasks.filter(t=>messages.some(m=>m.taskId===t.id)).map(t=><button key={t.id} className={`chat-preview ${activeTask===t.id?"chat-selected":""}`} onClick={()=>setActiveTask(t.id)}><div className="avatar chat-avatar">{t.requester.slice(0,2).toUpperCase()}</div><div><b>{t.requester==="You"?"Task conversation":t.requester}</b><small>{t.title}</small></div></button>)}</div>
          <div className="chat-panel"><div className="chat-header"><div className="avatar chat-avatar">FA</div><div><b>{currentTask?.requester==="You"?"Task conversation":currentTask?.requester||"CampusMate chat"}</b><small>{currentTask?.title||"Select a conversation"}</small></div></div><div className="chat-body">{activeMessages.map(m=><div className={`message ${m.from==="You"?"mine":""}`} key={m.id}><div>{m.body}</div><small>{m.from} · {m.time}</small></div>)}{activeMessages.length===0&&<p className="chat-empty">No messages yet. Start the conversation.</p>}</div><form className="chat-compose" onSubmit={sendMessage}><input value={chatDraft} onChange={e=>setChatDraft(e.target.value)} placeholder="Write a message..."/><button type="submit" aria-label="Send message"><Send size={17}/></button></form></div></div>
        </>}
      </section>
      <footer className="footer"><span>CampusMate <span className="dot">·</span> A campus errands marketplace concept</span><span>Built for the UNILORIN community</span></footer>
    </main>

    {notice&&<div className="toast"><CheckCircle2 size={17}/>{notice}</div>}

    {modal==="create"&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal"><div className="modal-head"><div><span className="eyebrow">CREATE A REQUEST</span><h2>Post a campus task</h2><p>Tell the community what you need help with.</p></div><button className="icon-button" onClick={()=>setModal(null)}><X/></button></div><form onSubmit={createTask} className="modal-form"><label>Task title<input required value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. Pick up my package"/></label><label>Description<textarea required value={newDescription} onChange={e=>setNewDescription(e.target.value)} placeholder="Add useful details so someone can help you..." rows={3}/></label><div className="form-two"><label>Category<select value={newCategory} onChange={e=>setNewCategory(e.target.value)}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><label>Campus location<input value={newLocation} onChange={e=>setNewLocation(e.target.value)} placeholder="e.g. COHS"/></label></div><label>Reward (₦)<input type="number" min="100" step="50" required value={newReward} onChange={e=>setNewReward(e.target.value)}/></label><div className="modal-note"><ShieldCheck size={16}/> Your task will be visible to students in this demo.</div><button className="primary-button full-button" type="submit">Publish task <ArrowRight size={16}/></button></form></div></div>}

    {modal==="manage"&&<div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><span className="eyebrow">REQUESTER WORKFLOW</span><h2>Review task interest</h2><p>{currentTask?.title}</p></div><button className="icon-button" onClick={()=>setModal(null)}><X/></button></div><div className="applicant-box"><div className="avatar">HI</div><div><b>You</b><small>Interested tasker · Demo profile</small></div><span className="status open">Interested</span></div><div className="modal-note"><CircleHelp size={16}/> In the full product, the requester reviews multiple interested taskers and selects one. This demo uses a sample applicant.</div><button className="primary-button full-button" onClick={startPayment}>Select tasker & continue <ArrowRight size={16}/></button></div></div>}

    {modal==="payment"&&<div className="modal-backdrop"><div className="modal payment-modal"><div className="modal-head"><div><span className="eyebrow">SECURE CHECKOUT · SIMULATED</span><h2>Confirm task payment</h2><p>This is a demonstration checkout. No real payment is processed.</p></div><button className="icon-button" onClick={()=>setModal(null)}><X/></button></div><div className="checkout-summary"><span>Task reward</span><b>{money(currentTask?.reward||0)}</b><small>{currentTask?.title}</small></div><div className="payment-method"><div className="payment-symbol"><Wallet size={19}/></div><div><b>CampusMate demo payment</b><small>Test transaction · No money moves</small></div><CheckCircle2 size={18} className="green-check"/></div><label className="outcome-label">Choose a test outcome</label><div className="outcome-options"><button className={paymentOutcome==="success"?"outcome-selected":""} onClick={()=>setPaymentOutcome("success")}><Check size={15}/> Successful</button><button className={paymentOutcome==="failed"?"outcome-selected":""} onClick={()=>setPaymentOutcome("failed")}><X size={15}/> Failed</button><button className={paymentOutcome==="cancelled"?"outcome-selected":""} onClick={()=>setPaymentOutcome("cancelled")}>Cancel</button></div><button className="primary-button full-button" onClick={processPayment}>{paymentOutcome==="success"?"Confirm demo payment":paymentOutcome==="failed"?"Simulate failed payment":"Cancel checkout"} <ArrowRight size={16}/></button><p className="fine-print">DEMO ONLY · This does not connect to Paystack or any bank.</p></div></div>}

    {modal==="help"&&<div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><span className="eyebrow">A QUICK TOUR</span><h2>How CampusMate works</h2><p>Simple help, from students already around you.</p></div><button className="icon-button" onClick={()=>setModal(null)}><X/></button></div><div className="how-step"><span>01</span><div><b>Post or discover a task</b><p>Request a small errand or browse tasks around your campus.</p></div></div><div className="how-step"><span>02</span><div><b>Express interest and choose</b><p>Taskers can show interest. The requester chooses who to work with.</p></div></div><div className="how-step"><span>03</span><div><b>Confirm payment and coordinate</b><p>For this demo, checkout is simulated. Use chat to agree on details.</p></div></div><div className="modal-note"><ShieldCheck size={16}/> This is a prototype. Identity checks, live payments, refunds and dispute handling are not enabled.</div><button className="primary-button full-button" onClick={()=>setModal(null)}>Got it</button></div></div>}
  </div>;
}
