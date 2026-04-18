import { useState, useEffect, useRef, useCallback, useReducer } from "react";

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  bg:"#09090b", s1:"#111113", s2:"#18181b", s3:"#1e1e22", s4:"#27272c",
  b1:"#2a2a30", b2:"#363640", b3:"#454550",
  t1:"#f4f4f5", t2:"#a1a1aa", t3:"#52525b", t4:"#3f3f46",
  a:"#e8684a", aH:"#d4573b", aG:"rgba(232,104,74,0.12)", aR:"rgba(232,104,74,0.22)",
  green:"#4ade80", gBg:"rgba(74,222,128,0.08)", gBd:"rgba(74,222,128,0.18)",
  yellow:"#fbbf24", yBg:"rgba(251,191,36,0.08)",
  red:"#f87171", rBg:"rgba(248,113,113,0.08)", rBd:"rgba(248,113,113,0.18)",
  blue:"#60a5fa",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@300;400&display=swap');`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const USERS = {
  u1:{ id:"u1", name:"Alex Rivera",  initials:"AR", color:"#e8684a", age:26, gender:"they/them", rating:4.8, verified:true,  bio:"Trail running & specialty coffee. Always up for new adventures.", activities:14, joined:8  },
  u2:{ id:"u2", name:"Mia Chen",     initials:"MC", color:"#60a5fa", age:24, gender:"she/her",   rating:4.6, verified:true,  bio:"Climber, reads too many books, perpetually coffee-seeking.",    activities:22, joined:19 },
  u3:{ id:"u3", name:"Jordan Park",  initials:"JP", color:"#4ade80", age:29, gender:"he/him",    rating:4.9, verified:false, bio:"Basketball, jazz, late-night ramen runs across the city.",      activities:31, joined:27 },
  u4:{ id:"u4", name:"Sam Torres",   initials:"ST", color:"#fbbf24", age:27, gender:"they/them", rating:4.3, verified:true,  bio:"Yoga mornings & park sketching sessions — slow living.",        activities:9,  joined:7  },
  u5:{ id:"u5", name:"Priya Nair",   initials:"PN", color:"#c084fc", age:23, gender:"she/her",   rating:4.7, verified:true,  bio:"Chess, cycling, chasing sunsets. Also: exceptional at ramen.", activities:18, joined:15 },
};
const ME = { id:"me", name:"Jordan Lee", initials:"JL", color:T.a, age:25, gender:"he/him", rating:4.5, verified:false, bio:"New to the city — looking for people to explore with.", activities:3, joined:2 };

const ACT = {
  coffee: { sym:"○", label:"Coffee",  color:"#e8684a", desc:"Cafes, matcha, conversations" },
  sports: { sym:"◈", label:"Sports",  color:"#60a5fa", desc:"Basketball, tennis, runs"     },
  walk:   { sym:"◎", label:"Walk",    color:"#4ade80", desc:"Parks, strolls, sketching"    },
  study:  { sym:"□", label:"Study",   color:"#c084fc", desc:"Libraries, cowork, focus"     },
  food:   { sym:"◆", label:"Food",    color:"#fbbf24", desc:"Restaurants, street food"     },
  outdoor:{ sym:"△", label:"Outdoor", color:"#67e8f9", desc:"Hikes, cycling, nature"       },
};

const INIT_REQS = [
  { id:"r1", userId:"u2", title:"Matcha latte & good convo",    type:"coffee",  dist:0.3, ttl:85,  slots:[1,2], x:36,y:31 },
  { id:"r2", userId:"u3", title:"3v3 basketball @ Riverside",   type:"sports",  dist:0.7, ttl:140, slots:[2,6], x:61,y:47 },
  { id:"r3", userId:"u4", title:"Sketching in Meridian Park",   type:"walk",    dist:0.5, ttl:60,  slots:[1,3], x:23,y:57 },
  { id:"r4", userId:"u5", title:"Ramen + studying algorithms",  type:"study",   dist:1.1, ttl:200, slots:[1,2], x:73,y:21 },
  { id:"r5", userId:"u2", title:"Sunset hike — Lookout Trail",  type:"outdoor", dist:1.8, ttl:95,  slots:[1,4], x:49,y:71 },
  { id:"r6", userId:"u3", title:"Phở spot, anyone?",            type:"food",    dist:0.4, ttl:45,  slots:[1,2], x:80,y:61 },
];

const INIT_CHATS = {
  c1:{ id:"c1", reqTitle:"Sunset hike — Lookout Trail", otherId:"u2",
    messages:[
      { id:"m1", from:"u2", text:"Hey! So excited for this hike 🏔", ts:"2:14 PM" },
      { id:"m2", from:"me", text:"Same! Meet at the trailhead entrance?", ts:"2:15 PM" },
      { id:"m3", from:"u2", text:"Perfect — I'll bring snacks and water", ts:"2:17 PM" },
    ], last:"Perfect — I'll bring snacks", lastTs:"2:17 PM", unread:0 },
};

const INIT_NOTIFS = [
  { id:"n1", type:"join",  title:"Mia wants to join",       body:"Your sunset hike has a new join request",    ts:5,   read:false, reqId:"r5" },
  { id:"n2", type:"check", title:"Join accepted",           body:"Jordan accepted your basketball request",    ts:12,  read:false, userId:"u3" },
  { id:"n3", type:"msg",   title:"New message from Mia",   body:"Perfect — I'll bring snacks",                ts:18,  read:true,  chatId:"c1" },
  { id:"n4", type:"join",  title:"Sam wants to join",       body:"Your coffee request has a new join request", ts:60,  read:true,  reqId:"r1" },
  { id:"n5", type:"star",  title:"New review",              body:"Jordan gave you 5 stars ★★★★★",              ts:120, read:true,  userId:"u3" },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%}
body{background:${T.bg};color:${T.t1};font-family:'Geist',-apple-system,sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;overflow:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.b2};border-radius:3px}
.shell{width:100%;height:100vh;display:flex;flex-direction:column;overflow:hidden;position:relative}
.screen{flex:1;display:flex;flex-direction:column;overflow:hidden}
.scroll{flex:1;overflow-y:auto}
.mono{font-family:'Geist Mono',monospace}

/* animations */
.fade-in{animation:fadeIn 0.22s ease both}
@keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.scale-in{animation:scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both}
@keyframes scaleIn{from{transform:scale(0.93);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes sheetUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes dotPop{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}

/* topbar */
.topbar{height:52px;flex-shrink:0;background:${T.s1};border-bottom:1px solid ${T.b1};display:flex;align-items:center;padding:0 16px;gap:10px}
.topbar-title{flex:1;font-size:15px;font-weight:600;letter-spacing:-.02em;color:${T.t1}}
.topbar-sub{font-size:11px;color:${T.t3};margin-top:1px}
.back-btn{width:32px;height:32px;border-radius:10px;background:${T.s2};border:1px solid ${T.b1};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;flex-shrink:0}
.back-btn:hover{background:${T.s3}}
.back-svg{width:16px;height:16px;stroke:${T.t2};fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}

/* bottom nav */
.nav{height:60px;flex-shrink:0;background:${T.s1};border-top:1px solid ${T.b1};display:flex;align-items:center;padding:0 4px}
.nav-item{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;border-radius:12px;background:none;border:none;outline:none;color:${T.t3};font-family:'Geist',sans-serif;transition:color .15s,background .15s;position:relative}
.nav-item:hover{color:${T.t2};background:${T.s2}}
.nav-item.on{color:${T.t1}}
.nav-icon-wrap{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:background .15s}
.nav-item.on .nav-icon-wrap{background:${T.s3}}
.nav-svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.nav-label{font-size:10px;font-weight:500;letter-spacing:.02em}
.nav-badge{position:absolute;top:7px;right:calc(50% - 18px);min-width:16px;height:16px;border-radius:8px;background:${T.a};color:#fff;font-size:9px;font-weight:600;display:flex;align-items:center;justify-content:center;padding:0 4px;animation:dotPop .25s cubic-bezier(.34,1.56,.64,1)}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;font-family:'Geist',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border:none;outline:none;transition:all .15s;white-space:nowrap;letter-spacing:-.01em;padding:9px 16px}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.38;cursor:not-allowed;pointer-events:none}
.btn-primary{background:${T.a};color:#fff}
.btn-primary:hover{background:${T.aH}}
.btn-secondary{background:${T.s3};color:${T.t2};border:1px solid ${T.b1}}
.btn-secondary:hover{background:${T.s4};color:${T.t1};border-color:${T.b2}}
.btn-ghost{background:transparent;color:${T.t2};border:1px solid ${T.b1}}
.btn-ghost:hover{background:${T.s2};color:${T.t1}}
.btn-green{background:${T.gBg};color:${T.green};border:1px solid ${T.gBd}}
.btn-green:hover{background:rgba(74,222,128,.14)}
.btn-danger{background:${T.rBg};color:${T.red};border:1px solid ${T.rBd}}
.btn-danger:hover{background:rgba(248,113,113,.14)}
.btn-full{width:100%}
.btn-sm{padding:7px 13px;font-size:12px;border-radius:8px}
.btn-xs{padding:4px 10px;font-size:11px;border-radius:6px}

/* inputs */
.field{margin-bottom:14px}
.label{display:block;font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:${T.t3};margin-bottom:5px}
input,textarea,select{width:100%;background:${T.s2};border:1px solid ${T.b1};border-radius:10px;color:${T.t1};font-family:'Geist',sans-serif;font-size:14px;padding:10px 12px;outline:none;transition:border-color .15s,background .15s}
input:focus,textarea:focus,select:focus{border-color:${T.a};background:${T.s3};box-shadow:0 0 0 3px ${T.aR}}
input::placeholder,textarea::placeholder{color:${T.t3}}
textarea{resize:none}
select{cursor:pointer;-webkit-appearance:none}
input[type=range]{padding:0;height:4px;accent-color:${T.a};cursor:pointer;background:transparent}

/* pills */
.pill{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;padding:3px 8px;border-radius:20px;letter-spacing:.01em}
.pill-active{background:rgba(74,222,128,.09);color:${T.green};border:1px solid rgba(74,222,128,.18)}
.pill-pending{background:rgba(251,191,36,.09);color:${T.yellow};border:1px solid rgba(251,191,36,.2)}
.pill-expired{background:${T.s3};color:${T.t3};border:1px solid ${T.b1}}
.pill-neutral{background:${T.s3};color:${T.t2};border:1px solid ${T.b1}}

/* avatar */
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;flex-shrink:0;letter-spacing:-.02em;font-family:'Geist Mono',monospace}

/* toast */
.toast{position:absolute;top:60px;left:50%;transform:translateX(-50%);background:${T.s4};border:1px solid ${T.b3};border-radius:100px;padding:8px 18px;font-size:13px;font-weight:500;color:${T.t1};white-space:nowrap;pointer-events:none;z-index:300;box-shadow:0 8px 32px rgba(0,0,0,.45);animation:toastLife 2.8s ease both}
@keyframes toastLife{0%{opacity:0;transform:translate(-50%,-6px)}10%{opacity:1;transform:translate(-50%,0)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-4px)}}

/* overlay / modal */
.overlay{position:absolute;inset:0;z-index:80;background:rgba(0,0,0,.6);backdrop-filter:blur(3px);display:flex;align-items:flex-end}
.modal{width:100%;background:${T.s1};border-radius:22px 22px 0 0;padding:0 20px 32px;max-height:90vh;overflow-y:auto;animation:sheetUp .3s cubic-bezier(.16,1,.3,1) both}
.modal-grip{width:32px;height:3px;border-radius:2px;background:${T.b2};margin:12px auto 20px}
.modal-title{font-size:18px;font-weight:600;letter-spacing:-.02em;margin-bottom:4px}
.modal-sub{font-size:13px;color:${T.t3};margin-bottom:22px;line-height:1.6}

/* bottom sheet */
.sheet{position:absolute;bottom:0;left:0;right:0;background:${T.s1};border-top:1px solid ${T.b1};border-radius:20px 20px 0 0;padding:0 0 20px;z-index:30;max-height:74vh;overflow-y:auto;animation:sheetUp .3s cubic-bezier(.16,1,.3,1) both}
.sheet-grip{width:32px;height:3px;border-radius:2px;background:${T.b2};margin:12px auto 4px}

/* empty */
.empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;gap:8px;text-align:center}
.empty-sym{font-family:'Geist Mono',monospace;font-size:36px;color:${T.t3};opacity:.35;margin-bottom:4px}
.empty-title{font-size:16px;font-weight:500;color:${T.t2}}
.empty-sub{font-size:13px;color:${T.t3};max-width:220px;line-height:1.6}

/* map */
.map-wrap{flex:1;position:relative;overflow:hidden;background:${T.bg}}
.map-ctrl{position:absolute;top:12px;right:12px;z-index:10;background:${T.s2};border:1px solid ${T.b1};border-radius:10px;overflow:hidden}
.map-ctrl-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:${T.t2};font-size:18px;font-weight:300;transition:background .12s,color .12s}
.map-ctrl-btn:hover{background:${T.s3};color:${T.t1}}
.map-ctrl-btn+.map-ctrl-btn{border-top:1px solid ${T.b1}}
.map-count{position:absolute;top:12px;left:12px;z-index:10;background:${T.s2};border:1px solid ${T.b1};border-radius:100px;padding:5px 12px;font-size:11px;font-weight:500;color:${T.t2};font-family:'Geist Mono',monospace;letter-spacing:.04em}
.user-pos{position:absolute;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:${T.a};border:2px solid ${T.bg};box-shadow:0 0 0 6px rgba(232,104,74,.18);animation:posRing 2.5s ease infinite;z-index:8}
@keyframes posRing{0%,100%{box-shadow:0 0 0 6px rgba(232,104,74,.18)}50%{box-shadow:0 0 0 12px rgba(232,104,74,.04)}}
.map-pin{position:absolute;transform:translate(-50%,-100%);cursor:pointer;z-index:5;transition:transform .22s cubic-bezier(.34,1.56,.64,1)}
.map-pin:hover,.map-pin.active{transform:translate(-50%,-112%);z-index:20}
.pin-inner{display:flex;align-items:center;gap:6px;background:${T.s2};border:1px solid ${T.b2};border-radius:12px;padding:7px 11px;box-shadow:0 2px 14px rgba(0,0,0,.45);transition:all .18s;white-space:nowrap;position:relative}
.map-pin.active .pin-inner{background:${T.s3}}
.pin-inner::after{content:'';position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${T.b2}}
.map-pin.active .pin-inner::after{border-top-color:${T.a}}
.pin-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.pin-label{font-size:12px;font-weight:500;color:${T.t1};max-width:120px;overflow:hidden;text-overflow:ellipsis}
.pin-sub{font-size:10px;color:${T.t3};font-family:'Geist Mono',monospace}

/* filter bar */
.filter-bar{display:flex;gap:6px;padding:10px 14px;overflow-x:auto;background:${T.s1};border-bottom:1px solid ${T.b1};flex-shrink:0}
.filter-bar::-webkit-scrollbar{display:none}
.fchip{padding:5px 12px;border-radius:100px;background:${T.s2};border:1px solid ${T.b1};font-size:12px;font-weight:500;color:${T.t3};cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0}
.fchip:hover{color:${T.t2};border-color:${T.b2}}
.fchip.on{border-color:rgba(232,104,74,.4);background:${T.aG};color:${T.a}}

/* map search row */
.map-search-row{display:flex;gap:8px;align-items:center;padding:10px 14px;background:${T.s1};border-bottom:1px solid ${T.b1};flex-shrink:0}
.search-wrap{position:relative;flex:1}
.search-input{width:100%;padding:9px 12px 9px 34px;background:${T.s2};border:1px solid ${T.b1};border-radius:10px;color:${T.t1};font-family:'Geist',sans-serif;font-size:14px;outline:none;transition:border-color .15s}
.search-input:focus{border-color:${T.a};box-shadow:0 0 0 3px ${T.aR}}
.search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none}
.post-btn{height:36px;padding:0 14px;border-radius:10px;background:${T.a};color:#fff;font-family:'Geist',sans-serif;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:background .15s;flex-shrink:0;display:flex;align-items:center;gap:5px}
.post-btn:hover{background:${T.aH}}

/* act badge */
.act-badge{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;flex-shrink:0;font-family:'Geist Mono',monospace}

/* ttl */
.ttl-wrap{margin:12px 0}
.ttl-row{display:flex;justify-content:space-between;font-size:11px;color:${T.t3};margin-bottom:5px}
.ttl-track{height:3px;background:${T.s3};border-radius:2px;overflow:hidden}
.ttl-fill{height:100%;border-radius:2px;transition:width .4s}

/* user row inside sheet */
.user-row{display:flex;align-items:center;gap:10px;padding:11px 12px;background:${T.s2};border:1px solid ${T.b1};border-radius:12px;margin:12px 0;cursor:pointer;transition:background .15s}
.user-row:hover{background:${T.s3}}
.u-name{font-size:13px;font-weight:500}
.u-bio{font-size:12px;color:${T.t3}}
.v-badge{font-size:10px;font-weight:500;padding:2px 6px;background:rgba(74,222,128,.08);color:${T.green};border:1px solid rgba(74,222,128,.15);border-radius:4px;flex-shrink:0}

/* tabs */
.tabs{display:flex;border-bottom:1px solid ${T.b1};background:${T.s1};flex-shrink:0}
.tab{flex:1;padding:11px 4px;text-align:center;font-size:12px;font-weight:500;color:${T.t3};cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;background:none;border-top:none;border-left:none;border-right:none;font-family:'Geist',sans-serif;letter-spacing:-.01em}
.tab:hover{color:${T.t2}}
.tab.on{color:${T.t1};border-bottom-color:${T.a}}

/* req list row */
.req-row{padding:14px 16px;border-bottom:1px solid ${T.b1};cursor:pointer;transition:background .15s}
.req-row:hover{background:${T.s2}}

/* join card */
.join-card{background:${T.s2};border:1px solid ${T.b1};border-radius:14px;padding:14px;margin-bottom:10px}

/* chat */
.chat-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid ${T.b1};cursor:pointer;transition:background .15s}
.chat-row:hover{background:${T.s2}}
.chat-name{font-size:14px;font-weight:500}
.chat-prev{font-size:12px;color:${T.t3};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chat-ts{font-size:11px;color:${T.t4};flex-shrink:0;font-family:'Geist Mono',monospace}
.typing-dot{width:5px;height:5px;border-radius:50%;background:${T.t3};animation:pulse 1.2s ease infinite}
.typing-dot:nth-child(2){animation-delay:.2s}
.typing-dot:nth-child(3){animation-delay:.4s}

/* messages */
.msg-wrap{display:flex;gap:8px;max-width:80%}
.msg-wrap.me{flex-direction:row-reverse;align-self:flex-end}
.bubble{padding:9px 13px;border-radius:16px;font-size:14px;line-height:1.55;background:${T.s3};color:${T.t1};border:1px solid ${T.b1}}
.msg-wrap.me .bubble{background:${T.a};color:#fff;border:1px solid ${T.aH};border-bottom-right-radius:4px}
.msg-wrap:not(.me) .bubble{border-bottom-left-radius:4px}
.msg-ts{font-size:10px;color:${T.t3};align-self:flex-end;padding-bottom:2px;font-family:'Geist Mono',monospace}

/* profile */
.prof-hero{padding:24px 20px 20px;border-bottom:1px solid ${T.b1};display:flex;align-items:flex-start;gap:14px}
.prof-stat{flex:1;padding:14px 0;text-align:center;border-right:1px solid ${T.b1}}
.prof-stat:last-child{border-right:none}
.stat-num{font-size:22px;font-weight:600;letter-spacing:-.03em}
.stat-lbl{font-size:10px;color:${T.t3};text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
.prow{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid ${T.b1};cursor:pointer;transition:background .15s}
.prow:hover{background:${T.s2}}
.prow-icon{width:32px;height:32px;border-radius:9px;background:${T.s3};display:flex;align-items:center;justify-content:center;flex-shrink:0}
.prow-label{flex:1;font-size:14px}
.prow-val{font-size:12px;color:${T.t3};font-family:'Geist Mono',monospace}
.prow-arrow{color:${T.t4};font-size:14px}

/* notifs */
.notif-row{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-bottom:1px solid ${T.b1};transition:background .15s;cursor:pointer}
.notif-row:hover{background:${T.s2}}
.notif-row.unread{background:rgba(232,104,74,.04)}
.notif-icon-wrap{width:36px;height:36px;border-radius:50%;background:${T.s3};border:1px solid ${T.b1};display:flex;align-items:center;justify-content:center;flex-shrink:0}
.notif-title{font-size:13px;font-weight:500}
.notif-body{font-size:12px;color:${T.t3};margin-top:1px;line-height:1.5}
.notif-ts{font-size:11px;color:${T.t4};margin-top:3px;font-family:'Geist Mono',monospace}
.unread-ring{width:6px;height:6px;border-radius:50%;background:${T.a};flex-shrink:0;margin-top:5px}

/* create */
.act-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.act-opt{padding:13px 8px;border-radius:12px;border:1px solid ${T.b1};background:${T.s2};text-align:center;cursor:pointer;transition:all .15s}
.act-opt:hover{border-color:${T.b2};background:${T.s3}}
.act-opt.on{border-width:1.5px}
.act-sym{font-size:18px;font-family:'Geist Mono',monospace;margin-bottom:4px}
.act-name{font-size:11px;font-weight:500;color:${T.t3}}
.act-opt.on .act-name{color:inherit}
.ttl-opts{display:flex;gap:6px;flex-wrap:wrap}
.ttl-opt{padding:7px 13px;border-radius:8px;background:${T.s2};border:1px solid ${T.b1};font-size:12px;font-weight:500;color:${T.t3};cursor:pointer;transition:all .15s}
.ttl-opt:hover{border-color:${T.b2};color:${T.t2}}
.ttl-opt.on{background:${T.aG};border-color:rgba(232,104,74,.4);color:${T.a}}
.lim-opts{display:flex;gap:6px}
.lim-opt{flex:1;padding:9px;border-radius:8px;background:${T.s2};border:1px solid ${T.b1};font-size:13px;font-weight:500;color:${T.t3};cursor:pointer;text-align:center;transition:all .15s}
.lim-opt:hover{border-color:${T.b2};color:${T.t2}}
.lim-opt.on{background:${T.aG};border-color:rgba(232,104,74,.4);color:${T.a}}
.preview{background:${T.s2};border:1px solid ${T.b1};border-radius:12px;padding:14px;display:flex;gap:12px;align-items:center;margin-top:8px}
.sec-label{font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:${T.t3};margin:20px 0 10px}
.slider-row{display:flex;align-items:center;gap:10px}
.slider-row input[type=range]{flex:1}
.slider-val{font-family:'Geist Mono',monospace;font-size:12px;color:${T.t2};min-width:36px;text-align:right}

/* auth */
.auth-shell{flex:1;display:flex;align-items:center;justify-content:center;background:${T.bg};position:relative;overflow:hidden}
.auth-glow-1{position:absolute;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(232,104,74,.07) 0%,transparent 70%);top:-100px;right:-100px;pointer-events:none}
.auth-glow-2{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(96,165,250,.05) 0%,transparent 70%);bottom:-80px;left:-80px;pointer-events:none}
.auth-card{width:340px;position:relative;z-index:1;background:${T.s1};border:1px solid ${T.b1};border-radius:20px;padding:36px 28px;box-shadow:0 24px 60px rgba(0,0,0,.5)}
.auth-wordmark{font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:.22em;color:${T.a};margin-bottom:22px;display:flex;align-items:center;gap:8px}
.auth-ring{width:6px;height:6px;border-radius:50%;background:${T.a};animation:pulse 1.8s ease infinite}
.auth-h{font-size:28px;font-weight:600;letter-spacing:-.03em;line-height:1.15;margin-bottom:4px}
.auth-sub{font-size:14px;color:${T.t3};margin-bottom:28px;line-height:1.6}
.auth-divider{display:flex;align-items:center;gap:12px;margin:20px 0}
.auth-divider-line{flex:1;height:1px;background:${T.b1}}
.auth-divider-text{font-size:11px;color:${T.t4};letter-spacing:.08em;text-transform:uppercase}

/* user profile sub-screen */
.user-profile{display:flex;flex-direction:column;flex:1;overflow:hidden}
.user-prof-hero{background:${T.s1};padding:24px 20px;border-bottom:1px solid ${T.b1};display:flex;gap:14px;align-items:flex-start}
.user-prof-reviews{display:flex;flex-direction:column;gap:0}
.review-row{padding:14px 16px;border-bottom:1px solid ${T.b1}}
.review-author{font-size:13px;font-weight:500;margin-bottom:2px}
.review-text{font-size:13px;color:${T.t2};line-height:1.55}
.review-ts{font-size:11px;color:${T.t3};margin-top:3px;font-family:'Geist Mono',monospace}

/* settings sub-screens */
.setting-row{display:flex;align-items:center;justify-content:space-between;padding:15px 20px;border-bottom:1px solid ${T.b1}}
.setting-label{font-size:14px}
.setting-sub{font-size:12px;color:${T.t3};margin-top:1px}
.toggle{width:44px;height:26px;border-radius:13px;border:none;cursor:pointer;transition:background .2s;position:relative;flex-shrink:0}
.toggle-thumb{width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.3)}
.toggle.on{background:${T.a}}
.toggle.off{background:${T.b2}}
.toggle.on .toggle-thumb{left:21px}
.toggle.off .toggle-thumb{left:3px}

/* loading spinner */
.spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Avatar({ u, size = 36 }) {
  const fs = Math.round(size * 0.33);
  return (
    <div className="av" style={{ width: size, height: size, background: u.color + "22", color: u.color, fontSize: fs }}>
      {u.initials}
    </div>
  );
}

function StarRating({ val, size = 11 }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: size, color: T.t3 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill={T.yellow} stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span style={{ color: T.t2, fontWeight: 500, fontFamily: "'Geist Mono',monospace" }}>{val}</span>
    </span>
  );
}

function TtlBar({ ttl }) {
  const max = 240;
  const pct = Math.min(100, (ttl / max) * 100);
  const c = pct > 55 ? T.green : pct > 25 ? T.yellow : T.red;
  const fmt = ttl <= 0 ? "Expired" : ttl >= 60 ? `${Math.floor(ttl / 60)}h ${ttl % 60}m` : `${ttl}m`;
  return (
    <div className="ttl-wrap">
      <div className="ttl-row">
        <span>Expires in</span>
        <span style={{ color: c, fontFamily: "'Geist Mono',monospace" }}>{fmt}</span>
      </div>
      <div className="ttl-track">
        <div className="ttl-fill" style={{ width: `${Math.max(0, pct)}%`, background: c }} />
      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <div className="back-btn" onClick={onClick}>
      <svg className="back-svg" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button className={`toggle ${on ? "on" : "off"}`} onClick={onToggle}>
      <div className="toggle-thumb" />
    </button>
  );
}

function useToast() {
  const [msg, setMsg] = useState(null);
  const t = useRef(null);
  const show = useCallback((m) => {
    if (t.current) clearTimeout(t.current);
    setMsg(null);
    requestAnimationFrame(() => {
      setMsg(m);
      t.current = setTimeout(() => setMsg(null), 2900);
    });
  }, []);
  return [msg, show];
}

function fmtTs(mins) {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState("auth");
  const [tab, setTab]             = useState("discover");
  const [sub, setSub]             = useState(null);   // "create"|"chat"|"user-profile"|"req-detail"|"settings-*"
  const [subData, setSubData]     = useState(null);

  const [reqs, setReqs]           = useState(INIT_REQS);
  const [joins, setJoins]         = useState({});   // reqId -> "pending"|"accepted"|"rejected"
  const [chats, setChats]         = useState(INIT_CHATS);
  const [notifs, setNotifs]       = useState(INIT_NOTIFS);
  const [blocked, setBlocked]     = useState([]);
  const [selPin, setSelPin]       = useState(null);
  const [filter, setFilter]       = useState("all");
  const [joinModal, setJoinModal] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [toastMsg, showToast]     = useToast();

  // Live TTL countdown — tick every 30s
  useEffect(() => {
    const id = setInterval(() => {
      setReqs(prev => prev.map(r => {
        const next = r.ttl - 1;
        return { ...r, ttl: Math.max(0, next), status: next <= 0 ? "expired" : "active" };
      }));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const unreadNotifs = notifs.filter(n => !n.read).length;
  const unreadChats  = Object.values(chats).filter(c => c.unread > 0).length;

  function doJoin(req) { setJoinModal(req); }

  function confirmJoin() {
    const req = joinModal;
    setJoins(j => ({ ...j, [req.id]: "pending" }));
    addNotif({ type: "pending", title: "Request sent", body: `Waiting for ${USERS[req.userId].name} to respond`, reqId: req.id });
    showToast("Join request sent");
    setJoinModal(null); setSelPin(null);
    // simulate accept after 3.5s
    setTimeout(() => {
      setJoins(j => ({ ...j, [req.id]: "accepted" }));
      const cid = "c_" + req.id;
      const host = USERS[req.userId];
      setChats(c => ({
        ...c,
        [cid]: {
          id: cid, reqTitle: req.title, otherId: req.userId, unread: 1,
          messages: [{ id: "m_a0", from: req.userId, text: `Hey! Glad you're joining — see you there 👋`, ts: "now" }],
          last: "Glad you're joining — see you there 👋", lastTs: "now",
        }
      }));
      addNotif({ type: "check", title: "Accepted!", body: `${host.name} accepted your join request`, reqId: req.id, userId: req.userId });
      showToast("Accepted — chat unlocked");
    }, 3500);
  }

  function addNotif(n) {
    setNotifs(prev => [{ id: "n" + Date.now(), ts: 0, read: false, ...n }, ...prev]);
  }

  function acceptIncoming(reqId, fromUserId) {
    const cid = "c_in_" + reqId;
    const req = reqs.find(r => r.id === reqId);
    setChats(c => ({
      ...c,
      [cid]: {
        id: cid, reqTitle: req?.title || "Activity", otherId: fromUserId, unread: 0,
        messages: [{ id: "m_b0", from: "me", text: "Hey! Looking forward to it 🙌", ts: "now" }],
        last: "Looking forward to it 🙌", lastTs: "now",
      }
    }));
    addNotif({ type: "check", title: "You accepted", body: `${USERS[fromUserId].name} has been notified`, userId: fromUserId });
    showToast("Accepted — chat started");
  }

  function declineIncoming(reqId) {
    showToast("Request declined");
  }

  function createReq(data) {
    const nr = {
      id: "r_" + Date.now(), userId: "me",
      title: data.title, type: data.type,
      dist: 0, ttl: data.ttl, status: "active",
      slots: [1, data.limit],
      x: 46 + (Math.random() - 0.5) * 18,
      y: 40 + (Math.random() - 0.5) * 16,
    };
    setReqs(r => [nr, ...r]);
    setSub(null); setTab("discover");
    showToast("Request posted");
  }

  function sendMsg(cid, text) {
    setChats(c => ({
      ...c,
      [cid]: { ...c[cid], messages: [...c[cid].messages, { id: "m" + Date.now(), from: "me", text, ts: "now" }], last: text, lastTs: "now", unread: 0 }
    }));
  }

  function openChat(chat) {
    setChats(c => ({ ...c, [chat.id]: { ...c[chat.id], unread: 0 } }));
    setSub("chat"); setSubData(chat);
  }

  function openUserProfile(userId) { setSub("user-profile"); setSubData(userId); }
  function openReqDetail(req) { setSub("req-detail"); setSubData(req); }

  function doReport(userId) { setReportModal(userId); }

  function submitReport(userId, reason) {
    setReportModal(null);
    showToast("Report submitted");
  }

  function blockUser(userId) {
    setBlocked(b => [...b, userId]);
    showToast("User blocked");
  }

  // Derive visible requests
  const activeReqs = reqs.filter(r => r.status === "active" && !blocked.includes(r.userId));
  const filteredReqs = activeReqs.filter(r => filter === "all" || r.type === filter);

  // ── AUTH GATE ──
  if (page === "auth") return <AuthScreen css={CSS} onLogin={() => setPage("main")} />;

  // ── FULL-SCREEN SUB-SCREENS ──
  const sharedSubProps = { onBack: () => setSub(null), showToast };

  if (sub === "create") return (
    <div className="shell"><style>{CSS}</style>
      {toastMsg && <div className="toast">{toastMsg}</div>}
      <CreateScreen {...sharedSubProps} onCreate={createReq} />
    </div>
  );

  if (sub === "chat") return (
    <div className="shell"><style>{CSS}</style>
      {toastMsg && <div className="toast">{toastMsg}</div>}
      <ChatRoom chat={subData} {...sharedSubProps} onSend={sendMsg} onViewProfile={openUserProfile} />
    </div>
  );

  if (sub === "user-profile") return (
    <div className="shell"><style>{CSS}</style>
      {toastMsg && <div className="toast">{toastMsg}</div>}
      <UserProfileScreen userId={subData} {...sharedSubProps} onReport={doReport} onBlock={blockUser} />
    </div>
  );

  if (sub === "req-detail") return (
    <div className="shell"><style>{CSS}</style>
      {toastMsg && <div className="toast">{toastMsg}</div>}
      <ReqDetailScreen req={subData} join={joins[subData?.id]} onJoin={doJoin} {...sharedSubProps} onViewUser={openUserProfile} />
    </div>
  );

  if (sub && sub.startsWith("settings-")) return (
    <div className="shell"><style>{CSS}</style>
      {toastMsg && <div className="toast">{toastMsg}</div>}
      <SettingsScreen type={sub.replace("settings-", "")} {...sharedSubProps} blocked={blocked} onUnblock={uid => setBlocked(b => b.filter(x => x !== uid))} />
    </div>
  );

  // ── MAIN SHELL ──
  return (
    <div className="shell">
      <style>{CSS}</style>
      {toastMsg && <div className="toast">{toastMsg}</div>}

      {/* JOIN CONFIRM MODAL */}
      {joinModal && (
        <div className="overlay" onClick={() => setJoinModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-grip" />
            <div className="modal-title">Request to join</div>
            <div className="modal-sub">The host will be notified and can accept or decline your request.</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", background: T.s2, border: `1px solid ${T.b1}`, borderRadius: 12, padding: 14, marginBottom: 22 }}>
              <div className="act-badge" style={{ background: ACT[joinModal.type].color + "18", color: ACT[joinModal.type].color }}>{ACT[joinModal.type].sym}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{joinModal.title}</div>
                <div style={{ fontSize: 12, color: T.t3, marginTop: 2, fontFamily: "'Geist Mono',monospace" }}>
                  by {USERS[joinModal.userId]?.name} · {joinModal.dist}km · {joinModal.ttl}m left
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setJoinModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={confirmJoin}>Send request</button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportModal && (
        <ReportModal userId={reportModal} onClose={() => setReportModal(null)} onSubmit={submitReport} />
      )}

      <div className="screen fade-in">
        {tab === "discover" && (
          <DiscoverScreen reqs={filteredReqs} allReqs={activeReqs} joins={joins} filter={filter}
            setFilter={setFilter} selPin={selPin} setSelPin={setSelPin}
            onJoin={doJoin} onPost={() => setSub("create")}
            onViewUser={openUserProfile} onViewReq={openReqDetail} />
        )}
        {tab === "requests" && (
          <RequestsScreen reqs={reqs} joins={joins} onJoin={doJoin}
            onPost={() => setSub("create")} onAccept={acceptIncoming}
            onDecline={declineIncoming} onViewUser={openUserProfile}
            onViewReq={openReqDetail} blocked={blocked} />
        )}
        {tab === "chats" && (
          <ChatsScreen chats={chats} onOpen={openChat} onViewUser={openUserProfile} />
        )}
        {tab === "notifs" && (
          <NotifsScreen notifs={notifs}
            onMarkAll={() => setNotifs(n => n.map(x => ({ ...x, read: true })))}
            onTap={(n) => {
              setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
              if (n.chatId && chats[n.chatId]) { openChat(chats[n.chatId]); }
              else if (n.userId) { openUserProfile(n.userId); }
            }}
          />
        )}
        {tab === "me" && (
          <ProfileScreen joins={joins} reqs={reqs} showToast={showToast}
            onOpenSettings={(s) => { setSub("settings-" + s); }}
            onReport={() => doReport("me")} />
        )}
      </div>

      <nav className="nav">
        {[
          { id: "discover", lbl: "Discover", badge: 0, svg: <svg className="nav-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg> },
          { id: "requests", lbl: "Requests", badge: 0, svg: <svg className="nav-svg" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
          { id: "chats",    lbl: "Chats",    badge: unreadChats, svg: <svg className="nav-svg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
          { id: "notifs",   lbl: "Alerts",   badge: unreadNotifs, svg: <svg className="nav-svg" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
          { id: "me",       lbl: "Me",       badge: 0, svg: <svg className="nav-svg" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
        ].map(item => (
          <button key={item.id} className={`nav-item${tab === item.id ? " on" : ""}`} onClick={() => setTab(item.id)}>
            {item.badge > 0 && tab !== item.id && <span className="nav-badge">{item.badge}</span>}
            <div className="nav-icon-wrap">{item.svg}</div>
            <span className="nav-label">{item.lbl}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen({ css, onLogin }) {
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [vals, setVals] = useState({ email: "jordan@example.com", password: "••••••••", name: "", age: "" });
  function go() {
    setBusy(true);
    setTimeout(() => { setBusy(false); onLogin(); }, 1200);
  }
  const set = k => e => setVals(v => ({ ...v, [k]: e.target.value }));
  return (
    <div className="shell">
      <style>{css}</style>
      <div className="auth-shell">
        <div className="auth-glow-1" /><div className="auth-glow-2" />
        <div className="auth-card scale-in">
          <div className="auth-wordmark"><div className="auth-ring" />COMPANION</div>
          <div className="auth-h">{mode === "login" ? "Welcome\nback." : "Join\ntoday."}</div>
          <div className="auth-sub">{mode === "login" ? "Sign in to discover activities near you." : "Create an account to get started."}</div>
          {mode === "signup" && (
            <div className="field"><label className="label">Full name</label>
              <input value={vals.name} onChange={set("name")} placeholder="Your name" />
            </div>
          )}
          <div className="field"><label className="label">Email</label>
            <input type="email" value={vals.email} onChange={set("email")} />
          </div>
          <div className="field"><label className="label">Password</label>
            <input type="password" value={vals.password} onChange={set("password")} />
          </div>
          {mode === "signup" && (
            <div className="field"><label className="label">Age</label>
              <input type="number" value={vals.age} onChange={set("age")} placeholder="Must be 18+" min="18" />
            </div>
          )}
          <button className="btn btn-primary btn-full" style={{ marginTop: 4 }} onClick={go} disabled={busy}>
            {busy ? <><div className="spinner" />{mode === "login" ? "Signing in…" : "Creating account…"}</> : mode === "login" ? "Sign in" : "Create account"}
          </button>
          <div className="auth-divider"><div className="auth-divider-line" /><div className="auth-divider-text">or</div><div className="auth-divider-line" /></div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Phone", "Google"].map(s => <button key={s} className="btn btn-ghost btn-full btn-sm" onClick={go}>{s}</button>)}
          </div>
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: T.t3 }}>
            {mode === "login" ? "No account? " : "Have one? "}
            <span style={{ color: T.a, cursor: "pointer", fontWeight: 500 }} onClick={() => setMode(m => m === "login" ? "signup" : "login")}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DISCOVER ─────────────────────────────────────────────────────────────────
function DiscoverScreen({ reqs, allReqs, joins, filter, setFilter, selPin, setSelPin, onJoin, onPost, onViewUser, onViewReq }) {
  const [zoom, setZoom] = useState(1);
  const sel = selPin ? reqs.find(r => r.id === selPin) : null;

  return (
    <div className="screen">
      <div className="map-search-row">
        <div className="search-wrap">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input className="search-input" placeholder="Search activities nearby…" readOnly />
        </div>
        <button className="post-btn" onClick={onPost}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Post
        </button>
      </div>

      <div className="filter-bar">
        <div className={`fchip${filter === "all" ? " on" : ""}`} onClick={() => setFilter("all")}>All · {allReqs.length}</div>
        {Object.entries(ACT).map(([id, m]) => {
          const cnt = allReqs.filter(r => r.type === id).length;
          return cnt > 0 ? (
            <div key={id} className={`fchip${filter === id ? " on" : ""}`}
              style={filter === id ? { color: m.color, borderColor: m.color + "44", background: m.color + "0f" } : {}}
              onClick={() => setFilter(id)}>
              {m.label} · {cnt}
            </div>
          ) : null;
        })}
      </div>

      <div className="map-wrap" onClick={() => setSelPin(null)}>
        {/* Grid + roads SVG */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={T.b1} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path d="M0,35% Q28%,28% 58%,38% T100%,32%" fill="none" stroke={T.b2} strokeWidth="2" opacity=".45" />
          <path d="M0,63% Q26%,57% 57%,64% T100%,59%" fill="none" stroke={T.b2} strokeWidth="1.2" opacity=".35" />
          <path d="M22%,0 Q24%,38% 26%,68% T28%,100%" fill="none" stroke={T.b2} strokeWidth="1.2" opacity=".35" />
          <path d="M67%,0 Q65%,28% 67%,58% T69%,100%" fill="none" stroke={T.b2} strokeWidth="1" opacity=".28" />
          {/* Place labels */}
          <text x="34%" y="24%" fontFamily="'Geist Mono',monospace" fontSize="9" fill={T.t4} textAnchor="middle">Meridian Park</text>
          <text x="66%" y="38%" fontFamily="'Geist Mono',monospace" fontSize="9" fill={T.t4} textAnchor="middle">Riverside Court</text>
          <text x="50%" y="80%" fontFamily="'Geist Mono',monospace" fontSize="9" fill={T.t4} textAnchor="middle">Lookout Trail</text>
          <text x="80%" y="70%" fontFamily="'Geist Mono',monospace" fontSize="9" fill={T.t4} textAnchor="middle">Old Town</text>
          {/* Radius ring */}
          <ellipse cx="48%" cy="44%" rx="20%" ry="18%" fill="none" stroke={T.a} strokeWidth="0.8" strokeDasharray="5 7" opacity=".2" />
        </svg>

        {/* User dot */}
        <div className="user-pos" style={{ left: "48%", top: "44%" }} />

        {/* Pins */}
        {reqs.map(r => {
          const m = ACT[r.type];
          const active = selPin === r.id;
          const joined = joins[r.id];
          return (
            <div key={r.id} className={`map-pin${active ? " active" : ""}`}
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
              onClick={e => { e.stopPropagation(); setSelPin(active ? null : r.id); }}>
              <div className="pin-inner" style={active ? { borderColor: m.color } : {}}>
                <div className="pin-dot" style={{ background: joined === "accepted" ? T.green : m.color }} />
                <div>
                  <div className="pin-label">{r.title}</div>
                  <div className="pin-sub">{r.dist}km · {r.ttl}m · {r.slots.join("/")}</div>
                </div>
                {joined === "accepted" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, marginLeft: 2 }} />}
                {joined === "pending"  && <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.yellow, marginLeft: 2 }} />}
              </div>
            </div>
          );
        })}

        {/* Count + zoom */}
        <div className="map-count">{reqs.length} nearby</div>
        <div className="map-ctrl">
          <button className="map-ctrl-btn" onClick={() => setZoom(z => Math.min(z + 0.25, 2))}>+</button>
          <button className="map-ctrl-btn" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}>−</button>
        </div>

        {/* Zoom label */}
        <div style={{ position: "absolute", bottom: sel ? "auto" : 12, top: sel ? "auto" : "auto", right: 12, bottom: 12, zIndex: 10, background: T.s2, border: `1px solid ${T.b1}`, borderRadius: 8, padding: "4px 9px", fontSize: 10, fontFamily: "'Geist Mono',monospace", color: T.t3, display: sel ? "none" : "block" }}>
          {Math.round(zoom * 100)}%
        </div>

        {/* Selected sheet */}
        {sel && (
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-grip" />
            <div style={{ padding: "8px 18px 0" }}>
              <ReqCard req={sel} join={joins[sel.id]} onJoin={onJoin} onViewUser={onViewUser}
                onExpand={() => { onViewReq(sel); setSelPin(null); }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REQ CARD (reusable) ──────────────────────────────────────────────────────
function ReqCard({ req, join, onJoin, onViewUser, onExpand, compact = false }) {
  const m = ACT[req.type];
  const host = USERS[req.userId] || ME;
  const free = req.slots[1] - req.slots[0];
  const isMine = req.userId === "me";

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
        <div className="act-badge" style={{ background: m.color + "18", color: m.color }}>{m.sym}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.01em", marginBottom: 4, cursor: onExpand ? "pointer" : "default" }}
            onClick={onExpand}>{req.title}</div>
          <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
            <span className={`pill ${req.status === "active" ? "pill-active" : "pill-expired"}`}>
              {req.status}
            </span>
            <span style={{ fontSize: 11, color: T.t3, fontFamily: "'Geist Mono',monospace" }}>
              {req.dist > 0 ? `${req.dist}km · ` : ""}{req.slots.join("/")} joined
            </span>
          </div>
        </div>
        {onExpand && <button className="btn btn-ghost btn-xs" onClick={onExpand} style={{ flexShrink: 0 }}>Details</button>}
      </div>

      {!compact && (
        <>
          <div className="user-row" onClick={() => onViewUser?.(req.userId)}>
            <Avatar u={host} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span className="u-name">{host.name}</span>
                {host.verified && <span className="v-badge">✓</span>}
              </div>
              <div className="u-bio">{host.bio}</div>
            </div>
            <StarRating val={host.rating} />
          </div>
          <TtlBar ttl={req.ttl} />
        </>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: compact ? 8 : 0 }}>
        {isMine ? (
          <button className="btn btn-ghost btn-full btn-sm" disabled>Your request</button>
        ) : join === "accepted" ? (
          <button className="btn btn-green btn-full btn-sm">✓ Joined</button>
        ) : join === "pending" ? (
          <button className="btn btn-ghost btn-full btn-sm" disabled>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="spinner" style={{ borderTopColor: T.t2, borderColor: T.b2 }} />
              Pending…
            </span>
          </button>
        ) : req.status === "expired" ? (
          <button className="btn btn-ghost btn-full btn-sm" disabled>Expired</button>
        ) : free <= 0 ? (
          <button className="btn btn-ghost btn-full btn-sm" disabled>Full</button>
        ) : (
          <button className="btn btn-primary btn-full btn-sm" onClick={() => onJoin(req)}>Request to join</button>
        )}
      </div>
    </div>
  );
}

// ─── REQUEST DETAIL (full-screen) ─────────────────────────────────────────────
function ReqDetailScreen({ req, join, onJoin, onBack, onViewUser, showToast }) {
  if (!req) return null;
  const m = ACT[req.type];
  const host = USERS[req.userId] || ME;

  return (
    <div className="screen">
      <div className="topbar">
        <BackBtn onClick={onBack} />
        <div style={{ flex: 1 }}>
          <div className="topbar-title">{req.title}</div>
          <div className="topbar-sub">{m.label} · {req.dist}km away</div>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={() => showToast("Link copied")}>Share</button>
      </div>
      <div className="scroll" style={{ padding: "20px 18px 40px" }}>
        {/* Activity banner */}
        <div style={{ background: m.color + "10", border: `1px solid ${m.color}28`, borderRadius: 16, padding: "20px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 40, fontFamily: "'Geist Mono',monospace", color: m.color }}>{m.sym}</div>
          <div>
            <div style={{ fontSize: 11, color: m.color, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{req.title}</div>
            <div style={{ fontSize: 12, color: T.t3, marginTop: 3, fontFamily: "'Geist Mono',monospace" }}>
              {req.dist}km · {req.slots.join("/")} joined · limit {req.slots[1]}
            </div>
          </div>
        </div>

        {/* Host */}
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: T.t3, marginBottom: 10 }}>Host</div>
        <div className="user-row" style={{ cursor: "pointer" }} onClick={() => onViewUser(req.userId)}>
          <Avatar u={host} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{host.name}</span>
              {host.verified && <span className="v-badge">✓ Verified</span>}
            </div>
            <div style={{ fontSize: 12, color: T.t3, marginTop: 2 }}>{host.bio}</div>
            <div style={{ marginTop: 5 }}><StarRating val={host.rating} size={12} /></div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </div>

        {/* TTL */}
        <TtlBar ttl={req.ttl} />

        {/* Details grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Distance", val: `${req.dist} km` },
            { label: "Spots left", val: `${req.slots[1] - req.slots[0]} / ${req.slots[1]}` },
            { label: "Activity", val: m.label },
            { label: "Status", val: req.status },
          ].map(d => (
            <div key={d.label} style={{ background: T.s2, border: `1px solid ${T.b1}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{d.label}</div>
              <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 14, fontWeight: 500 }}>{d.val}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <ReqCard req={req} join={join} onJoin={onJoin} onViewUser={onViewUser} compact />
      </div>
    </div>
  );
}

// ─── REQUESTS SCREEN ──────────────────────────────────────────────────────────
function RequestsScreen({ reqs, joins, onJoin, onPost, onAccept, onDecline, onViewUser, onViewReq, blocked }) {
  const [tab, setTab] = useState("nearby");
  const mine   = reqs.filter(r => r.userId === "me");
  const nearby = reqs.filter(r => r.userId !== "me" && r.status === "active" && !blocked.includes(r.userId));
  const incoming = mine.length > 0 ? [
    { id: "ij1", reqId: mine[0]?.id, u: USERS.u2, title: mine[0]?.title },
    { id: "ij2", reqId: mine[0]?.id, u: USERS.u4, title: mine[0]?.title },
  ] : [];

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-title">Requests</span>
        <button className="btn btn-primary btn-sm" onClick={onPost}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New
        </button>
      </div>
      <div className="tabs">
        {[["nearby", `Nearby (${nearby.length})`], ["mine", `Mine (${mine.length})`], ["incoming", `Incoming (${incoming.length})`]].map(([id, lbl]) => (
          <button key={id} className={`tab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>{lbl}</button>
        ))}
      </div>
      <div className="scroll">
        {tab === "nearby" && (nearby.length === 0
          ? <div className="empty"><div className="empty-sym">◎</div><div className="empty-title">No nearby requests</div><div className="empty-sub">Try removing filters or come back later</div></div>
          : nearby.map(r => (
            <div key={r.id} className="req-row">
              <ReqCard req={r} join={joins[r.id]} onJoin={onJoin} onViewUser={onViewUser} onExpand={() => onViewReq(r)} compact />
            </div>
          ))
        )}

        {tab === "mine" && (mine.length === 0
          ? <div className="empty"><div className="empty-sym">○</div><div className="empty-title">No active requests</div><div className="empty-sub">Post an activity to find companions nearby</div><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={onPost}>Post request</button></div>
          : mine.map(r => (
            <div key={r.id} className="req-row">
              <ReqCard req={r} join={joins[r.id]} onJoin={onJoin} onViewUser={onViewUser} onExpand={() => onViewReq(r)} compact />
            </div>
          ))
        )}

        {tab === "incoming" && (incoming.length === 0
          ? <div className="empty"><div className="empty-sym">◈</div><div className="empty-title">No incoming requests</div><div className="empty-sub">When someone wants to join your activity, they'll appear here</div></div>
          : incoming.map(ij => (
            <div key={ij.id} className="join-card" style={{ margin: "12px 14px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <Avatar u={ij.u} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{ij.u.name}</span>
                    {ij.u.verified && <span className="v-badge">✓</span>}
                  </div>
                  <div style={{ fontSize: 12, color: T.t3 }}>{ij.u.bio}</div>
                  <div style={{ fontSize: 11, color: T.t4, marginTop: 3, fontFamily: "'Geist Mono',monospace" }}>→ {ij.title}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <StarRating val={ij.u.rating} />
                  <span style={{ fontSize: 10, color: T.t3, fontFamily: "'Geist Mono',monospace" }}>{ij.u.activities} activities</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-danger btn-sm btn-full" onClick={() => onDecline(ij.reqId)}>Decline</button>
                <button className="btn btn-green btn-sm btn-full" onClick={() => onAccept(ij.reqId, ij.u.id)}>Accept</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
function CreateScreen({ onBack, onCreate }) {
  const [title, setTitle]   = useState("");
  const [type, setType]     = useState("coffee");
  const [radius, setRadius] = useState(1);
  const [ttl, setTtl]       = useState(60);
  const [limit, setLimit]   = useState(2);
  const [error, setError]   = useState("");

  function submit() {
    if (!title.trim()) { setError("Please add a title"); return; }
    onCreate({ title: title.trim(), type, radius, ttl, limit });
  }

  return (
    <div className="screen">
      <div className="topbar">
        <BackBtn onClick={onBack} />
        <span className="topbar-title">New request</span>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={!title.trim()}>Post</button>
      </div>
      <div className="scroll" style={{ padding: "16px 18px 80px" }}>
        <div className="field">
          <label className="label">What do you want to do?</label>
          <input value={title} onChange={e => { setTitle(e.target.value); setError(""); }}
            placeholder={`e.g. "${ACT[type].desc}"`} autoFocus />
          {error && <div style={{ fontSize: 12, color: T.red, marginTop: 5 }}>{error}</div>}
        </div>

        <div className="sec-label">Activity type</div>
        <div className="act-grid">
          {Object.entries(ACT).map(([id, m]) => (
            <div key={id} className={`act-opt${type === id ? " on" : ""}`}
              style={type === id ? { borderColor: m.color, color: m.color } : {}}
              onClick={() => { setType(id); if (!title) setTitle(""); }}>
              <div className="act-sym" style={{ color: type === id ? m.color : T.t3 }}>{m.sym}</div>
              <div className="act-name">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="sec-label" style={{ marginTop: 22 }}>Discovery radius</div>
        <div className="slider-row">
          <input type="range" min={0.5} max={5} step={0.5} value={radius} onChange={e => setRadius(+e.target.value)} />
          <span className="slider-val">{radius} km</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.t4, marginTop: 4, fontFamily: "'Geist Mono',monospace" }}>
          <span>0.5 km</span><span>5.0 km</span>
        </div>

        <div className="sec-label" style={{ marginTop: 22 }}>Expires in</div>
        <div className="ttl-opts">
          {[30, 60, 90, 120, 180, 240].map(v => (
            <div key={v} className={`ttl-opt${ttl === v ? " on" : ""}`} onClick={() => setTtl(v)}>
              {v >= 60 ? `${v / 60}h` : `${v}m`}
            </div>
          ))}
        </div>

        <div className="sec-label" style={{ marginTop: 22 }}>Max participants</div>
        <div className="lim-opts">
          {[2, 3, 4, 6, 8, 10].map(n => (
            <div key={n} className={`lim-opt${limit === n ? " on" : ""}`} onClick={() => setLimit(n)}>{n}</div>
          ))}
        </div>

        {title.trim() && (
          <>
            <div className="sec-label" style={{ marginTop: 24 }}>Preview</div>
            <div className="preview">
              <div className="act-badge" style={{ background: ACT[type].color + "18", color: ACT[type].color }}>{ACT[type].sym}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{title}</div>
                <div style={{ fontSize: 11, color: T.t3, fontFamily: "'Geist Mono',monospace", marginTop: 3 }}>
                  {radius}km · {ttl >= 60 ? `${ttl / 60}h` : `${ttl}m`} · 1/{limit} joined
                </div>
              </div>
            </div>
          </>
        )}

        <button className="btn btn-primary btn-full" style={{ marginTop: 24 }} onClick={submit} disabled={!title.trim()}>
          Post request
        </button>
      </div>
    </div>
  );
}

// ─── CHATS ────────────────────────────────────────────────────────────────────
function ChatsScreen({ chats, onOpen, onViewUser }) {
  const list = Object.values(chats);
  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-title">Messages</span>
        <span className="mono" style={{ fontSize: 11, color: T.t3 }}>{list.length} active</span>
      </div>
      {list.length === 0
        ? <div className="empty"><div className="empty-sym">□</div><div className="empty-title">No messages yet</div><div className="empty-sub">Accept a join request to unlock a chat</div></div>
        : <div className="scroll">
          {list.map(c => {
            const other = USERS[c.otherId] || ME;
            const lastMsg = c.messages[c.messages.length - 1];
            return (
              <div key={c.id} className="chat-row" onClick={() => onOpen(c)}>
                <div style={{ position: "relative" }}>
                  <Avatar u={other} size={44} />
                  {c.unread > 0 && (
                    <div style={{ position: "absolute", top: -1, right: -1, width: 14, height: 14, borderRadius: "50%", background: T.a, border: `2px solid ${T.s1}`, fontSize: 8, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {c.unread}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                    <span className="chat-name" style={c.unread > 0 ? { color: T.t1 } : {}}>{other.name}</span>
                    <span className="chat-ts">{c.lastTs}</span>
                  </div>
                  <div className="chat-prev" style={c.unread > 0 ? { color: T.t2 } : {}}>{c.last}</div>
                  <div style={{ fontSize: 10, color: T.t4, marginTop: 2 }}>{c.reqTitle}</div>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

// ─── CHAT ROOM ────────────────────────────────────────────────────────────────
function ChatRoom({ chat, onBack, onSend, onViewProfile, showToast }) {
  const [text, setText]     = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef           = useRef(null);
  const other               = USERS[chat.otherId] || ME;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Simulate typing indicator after user sends
  function send() {
    if (!text.trim()) return;
    onSend(chat.id, text.trim());
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = [
        "Sounds great!",
        "Perfect, see you there 👋",
        "Can't wait!",
        "On my way!",
        "That works for me 👍",
      ];
      onSend(chat.id, replies[Math.floor(Math.random() * replies.length)]);
    }, 1800);
  }

  return (
    <div className="screen">
      <div className="topbar">
        <BackBtn onClick={onBack} />
        <div style={{ cursor: "pointer" }} onClick={() => onViewProfile(chat.otherId)}>
          <Avatar u={other} size={30} />
        </div>
        <div style={{ flex: 1, marginLeft: 8, cursor: "pointer" }} onClick={() => onViewProfile(chat.otherId)}>
          <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-.01em" }}>{other.name}</div>
          <div style={{ fontSize: 11, color: T.green, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.green }} />Active now
          </div>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={() => showToast("Chat info coming soon")}>Info</button>
      </div>

      {/* Activity context bar */}
      {chat.reqTitle && (
        <div style={{ padding: "7px 16px", background: T.s2, borderBottom: `1px solid ${T.b1}`, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.t3 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          {chat.reqTitle}
        </div>
      )}

      <div className="scroll" style={{ padding: "14px 14px 4px", display: "flex", flexDirection: "column", gap: 8 }}>
        {chat.messages.map(m => (
          <div key={m.id} className={`msg-wrap${m.from === "me" ? " me" : ""}`}>
            {m.from !== "me" && <Avatar u={other} size={26} />}
            <div>
              <div className="bubble">{m.text}</div>
              <div className="msg-ts" style={{ textAlign: m.from === "me" ? "right" : "left" }}>{m.ts}</div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="msg-wrap" style={{ alignSelf: "flex-start" }}>
            <Avatar u={other} size={26} />
            <div>
              <div className="bubble" style={{ padding: "11px 14px" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 14px 16px", display: "flex", gap: 8, background: T.s1, borderTop: `1px solid ${T.b1}`, flexShrink: 0 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Message…"
          style={{ flex: 1, borderRadius: 100, padding: "9px 16px" }}
        />
        <button
          onClick={send}
          disabled={!text.trim()}
          style={{ width: 40, height: 40, borderRadius: "50%", background: text.trim() ? T.a : T.s3, border: "none", cursor: text.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={text.trim() ? "#fff" : T.t3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NotifsScreen({ notifs, onMarkAll, onTap }) {
  const hasUnread = notifs.some(n => !n.read);
  const iconMap = {
    join:    { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.a} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, bg: T.aG },
    check:   { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, bg: T.gBg },
    msg:     { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, bg: "rgba(96,165,250,.08)" },
    star:    { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill={T.yellow} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, bg: T.yBg },
    pending: { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.yellow} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, bg: T.yBg },
  };

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-title">Notifications</span>
        {hasUnread && <button className="btn btn-ghost btn-sm" onClick={onMarkAll}>Mark all read</button>}
      </div>
      {notifs.length === 0
        ? <div className="empty"><div className="empty-sym">△</div><div className="empty-title">No notifications</div><div className="empty-sub">Activity updates will appear here</div></div>
        : <div className="scroll">
          {notifs.map(n => {
            const ic = iconMap[n.type] || iconMap.msg;
            return (
              <div key={n.id} className={`notif-row${n.read ? "" : " unread"}`} onClick={() => onTap(n)}>
                <div className="notif-icon-wrap" style={{ background: ic.bg }}>{ic.svg}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="notif-title" style={!n.read ? { color: T.t1 } : {}}>{n.title}</div>
                  <div className="notif-body">{n.body}</div>
                  <div className="notif-ts">{fmtTs(n.ts)}</div>
                </div>
                {!n.read && <div className="unread-ring" />}
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function ProfileScreen({ joins, reqs, showToast, onOpenSettings }) {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(ME.name);
  const [bio, setBio]         = useState(ME.bio);
  const [gender, setGender]   = useState(ME.gender);
  const accepted = Object.values(joins).filter(v => v === "accepted").length;
  const posted   = reqs.filter(r => r.userId === "me").length;

  function save() {
    setEditing(false);
    showToast("Profile saved");
  }

  return (
    <div className="screen">
      <div className="topbar">
        <span className="topbar-title">Profile</span>
        {editing
          ? <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
          : <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
        }
      </div>
      <div className="scroll">
        <div className="prof-hero">
          <Avatar u={{ ...ME, name }} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing
              ? <input value={name} onChange={e => setName(e.target.value)} style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, padding: "6px 10px" }} />
              : <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", marginBottom: 4 }}>{name}</div>
            }
            {editing
              ? <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ fontSize: 13, minHeight: 60, marginBottom: 8, padding: "7px 10px" }} />
              : <div style={{ fontSize: 13, color: T.t3, lineHeight: 1.6, marginBottom: 8 }}>{bio}</div>
            }
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {editing
                ? <select value={gender} onChange={e => setGender(e.target.value)} style={{ fontSize: 12, padding: "4px 8px", width: "auto", borderRadius: 20 }}>
                  {["he/him", "she/her", "they/them", "prefer not to say"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                : <>
                  <span className="pill pill-neutral mono">{ME.age}</span>
                  <span className="pill pill-neutral">{gender}</span>
                  {ME.verified && <span className="pill" style={{ background: T.gBg, color: T.green, border: `1px solid ${T.gBd}` }}>Verified</span>}
                </>
              }
            </div>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: `1px solid ${T.b1}` }}>
          {[{ val: ME.rating, lbl: "Rating" }, { val: accepted, lbl: "Activities" }, { val: posted, lbl: "Posted" }].map(s => (
            <div key={s.lbl} className="prof-stat">
              <div className="stat-num">{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 4 }}>
          {[
            { icon: "🔔", label: "Notifications",    val: "All on",    key: "notifications" },
            { icon: "📍", label: "Location",          val: "On",        key: "location" },
            { icon: "🔒", label: "Privacy",           val: "Friends",   key: "privacy" },
            { icon: "🛡️", label: "Blocked users",    val: "0",         key: "blocked" },
            { icon: "⭐", label: "My reviews",        val: `${ME.rating} avg`, key: "reviews" },
            { icon: "📋", label: "Activity history",  val: "12 total",  key: "history" },
            { icon: "❓", label: "Help & support",    val: "",          key: "help" },
            { icon: "⚠️", label: "Sign out",          val: "",          key: "signout", danger: true },
          ].map(row => (
            <div key={row.label} className="prow" onClick={() => onOpenSettings(row.key)}>
              <div className="prow-icon"><span style={{ fontSize: 14 }}>{row.icon}</span></div>
              <span className="prow-label" style={row.danger ? { color: T.red } : {}}>{row.label}</span>
              {row.val && <span className="prow-val">{row.val}</span>}
              <span className="prow-arrow">›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS SUB-SCREENS ────────────────────────────────────────────────────
function SettingsScreen({ type, onBack, showToast, blocked, onUnblock }) {
  const titles = { notifications: "Notifications", location: "Location", privacy: "Privacy", blocked: "Blocked users", reviews: "My reviews", history: "Activity history", help: "Help & support", signout: "Sign out" };

  const [toggles, setToggles] = useState({ pushJoin: true, pushAccept: true, pushMsg: true, pushMarketing: false, locAlways: true, locApprox: true, showAge: true, showGender: true });
  const tog = k => setToggles(t => ({ ...t, [k]: !t[k] }));

  const REVIEWS = [
    { from: USERS.u3, text: "Great company on the basketball court — punctual and easy-going.", ts: "3d ago" },
    { from: USERS.u5, text: "Really enjoyed our coffee chat. Would definitely meet again!", ts: "1w ago" },
  ];

  const HISTORY = [
    { title: "Matcha latte & good convo", type: "coffee",  date: "Yesterday",   status: "completed" },
    { title: "3v3 basketball @ Riverside", type: "sports", date: "3 days ago",  status: "completed" },
    { title: "Sunset hike — Lookout Trail", type: "outdoor", date: "1 week ago", status: "completed" },
  ];

  function ToggleRow({ label, sub, k }) {
    return (
      <div className="setting-row">
        <div>
          <div className="setting-label">{label}</div>
          {sub && <div className="setting-sub">{sub}</div>}
        </div>
        <Toggle on={toggles[k]} onToggle={() => tog(k)} />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="topbar">
        <BackBtn onClick={onBack} />
        <span className="topbar-title">{titles[type] || type}</span>
      </div>
      <div className="scroll">
        {type === "notifications" && (
          <>
            <div style={{ padding: "14px 20px 8px", fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>Activity</div>
            <ToggleRow label="Join requests" sub="Someone wants to join your activity" k="pushJoin" />
            <ToggleRow label="Join accepted" sub="Your request to join was accepted" k="pushAccept" />
            <ToggleRow label="New messages" sub="Messages in your chats" k="pushMsg" />
            <div style={{ padding: "18px 20px 8px", fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>Other</div>
            <ToggleRow label="Tips & updates" sub="Product news and suggestions" k="pushMarketing" />
          </>
        )}

        {type === "location" && (
          <>
            <div style={{ padding: "14px 20px 8px", fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>Sharing</div>
            <ToggleRow label="Location access" sub="Required for discovery" k="locAlways" />
            <ToggleRow label="Approximate only" sub="Show nearby area, not exact position" k="locApprox" />
            <div style={{ margin: "16px 20px", padding: "12px 14px", background: T.aG, border: `1px solid ${T.aR}`, borderRadius: 12, fontSize: 12, color: T.t2, lineHeight: 1.6 }}>
              Your exact coordinates are never shared. Other users see only a general area.
            </div>
          </>
        )}

        {type === "privacy" && (
          <>
            <div style={{ padding: "14px 20px 8px", fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>Profile visibility</div>
            <ToggleRow label="Show age" sub="Visible to others on your profile" k="showAge" />
            <ToggleRow label="Show gender" sub="Visible on your profile" k="showGender" />
            <div className="prow" onClick={() => showToast("Account deletion requested")}>
              <div className="prow-icon"><span style={{ fontSize: 14 }}>🗑️</span></div>
              <span className="prow-label" style={{ color: T.red }}>Delete account</span>
              <span className="prow-arrow">›</span>
            </div>
          </>
        )}

        {type === "blocked" && (
          blocked.length === 0
            ? <div className="empty"><div className="empty-sym">◎</div><div className="empty-title">No blocked users</div><div className="empty-sub">Users you block won't be able to see your requests</div></div>
            : blocked.map(uid => {
              const u = USERS[uid];
              if (!u) return null;
              return (
                <div key={uid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${T.b1}` }}>
                  <Avatar u={u} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: T.t3 }}>Blocked</div>
                  </div>
                  <button className="btn btn-ghost btn-xs" onClick={() => { onUnblock(uid); showToast("Unblocked"); }}>Unblock</button>
                </div>
              );
            })
        )}

        {type === "reviews" && (
          <div className="user-prof-reviews">
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.b1}` }}>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.03em" }}>{ME.rating}</div>
              <div><StarRating val={ME.rating} size={14} /></div>
              <div style={{ fontSize: 13, color: T.t3, fontFamily: "'Geist Mono',monospace" }}>{REVIEWS.length} reviews</div>
            </div>
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-row">
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <Avatar u={r.from} size={28} />
                  <span className="review-author">{r.from.name}</span>
                  <StarRating val={r.from.rating} />
                  <span className="review-ts" style={{ marginLeft: "auto" }}>{r.ts}</span>
                </div>
                <div className="review-text">{r.text}</div>
              </div>
            ))}
          </div>
        )}

        {type === "history" && (
          HISTORY.map((h, i) => {
            const m = ACT[h.type];
            return (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${T.b1}` }}>
                <div className="act-badge" style={{ background: m.color + "18", color: m.color }}>{m.sym}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{h.title}</div>
                  <div style={{ fontSize: 12, color: T.t3, fontFamily: "'Geist Mono',monospace", marginTop: 2 }}>{h.date}</div>
                </div>
                <span className="pill pill-active" style={{ fontSize: 10 }}>✓ {h.status}</span>
              </div>
            );
          })
        )}

        {type === "help" && (
          <div style={{ padding: "20px 18px" }}>
            {[
              { q: "How does matching work?", a: "Companion shows activity requests from people nearby. You can filter by type, join requests, and chat once accepted." },
              { q: "Is my location private?", a: "Only an approximate area is shown to other users. Exact coordinates are never exposed or stored beyond your session." },
              { q: "How do I report someone?", a: "Tap on a user's profile and select 'Report'. We review all reports within 24 hours." },
              { q: "Can I delete my account?", a: "Go to Privacy → Delete account. All data is permanently removed within 30 days." },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>{item.q}</div>
                <div style={{ fontSize: 13, color: T.t3, lineHeight: 1.7 }}>{item.a}</div>
                {i < 3 && <div style={{ height: 1, background: T.b1, marginTop: 20 }} />}
              </div>
            ))}
            <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => showToast("Support email copied")}>Contact support</button>
          </div>
        )}

        {type === "signout" && (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Sign out of Companion?</div>
            <div style={{ fontSize: 13, color: T.t3, marginBottom: 28, lineHeight: 1.6 }}>You'll need to sign back in to discover activities and chat with companions.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={onBack}>Cancel</button>
              <button className="btn btn-danger btn-full" onClick={() => showToast("Signed out")}>Sign out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── USER PROFILE (viewing another user) ─────────────────────────────────────
function UserProfileScreen({ userId, onBack, onReport, onBlock, showToast }) {
  const user = USERS[userId];
  if (!user) return null;

  const SAMPLE_REVIEWS = [
    { from: USERS.u1, text: "Great energy — really easy to connect with.", ts: "2d ago" },
    { from: USERS.u5, text: "Super punctual and friendly. Would join again!", ts: "5d ago" },
  ];

  return (
    <div className="screen">
      <div className="topbar">
        <BackBtn onClick={onBack} />
        <span className="topbar-title">{user.name}</span>
        <button className="btn btn-ghost btn-xs" onClick={() => showToast("More options")}>•••</button>
      </div>
      <div className="scroll">
        <div className="user-prof-hero">
          <Avatar u={user} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em" }}>{user.name}</span>
              {user.verified && <span className="v-badge">✓ Verified</span>}
            </div>
            <div style={{ fontSize: 13, color: T.t3, lineHeight: 1.6, marginBottom: 10 }}>{user.bio}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <span className="pill pill-neutral mono">{user.age}</span>
              <span className="pill pill-neutral">{user.gender}</span>
              <StarRating val={user.rating} size={12} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.b1}` }}>
          {[{ val: user.rating, lbl: "Rating" }, { val: user.activities, lbl: "Activities" }, { val: user.joined, lbl: "Joined" }].map(s => (
            <div key={s.lbl} className="prof-stat">
              <div className="stat-num">{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div style={{ padding: "14px 16px 8px", fontSize: 11, color: T.t3, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>Reviews</div>
        <div className="user-prof-reviews">
          {SAMPLE_REVIEWS.map((r, i) => (
            <div key={i} className="review-row">
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <Avatar u={r.from} size={26} />
                <span className="review-author">{r.from.name}</span>
                <span className="review-ts" style={{ marginLeft: "auto" }}>{r.ts}</span>
              </div>
              <div className="review-text">{r.text}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn btn-danger btn-full" onClick={() => onReport(userId)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Report {user.name}
          </button>
          <button className="btn btn-ghost btn-full" onClick={() => { onBlock(userId); onBack(); }}>
            Block {user.name}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REPORT MODAL ─────────────────────────────────────────────────────────────
function ReportModal({ userId, onClose, onSubmit }) {
  const user = USERS[userId] || ME;
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const reasons = ["Inappropriate behavior", "Harassment", "Fake profile", "No-show", "Spam", "Other"];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-grip" />
        <div className="modal-title">Report {user.name}</div>
        <div className="modal-sub">Reports are reviewed within 24 hours. This will not notify the user.</div>
        <div style={{ marginBottom: 16 }}>
          {reasons.map(r => (
            <div key={r} onClick={() => setReason(r)}
              style={{ padding: "11px 14px", marginBottom: 6, borderRadius: 10, background: reason === r ? T.aG : T.s2, border: `1px solid ${reason === r ? T.aR : T.b1}`, cursor: "pointer", fontSize: 14, color: reason === r ? T.a : T.t2, transition: "all .15s" }}>
              {r}
            </div>
          ))}
        </div>
        {reason && (
          <div className="field">
            <label className="label">Additional detail (optional)</label>
            <textarea value={detail} onChange={e => setDetail(e.target.value)} placeholder="Tell us what happened…" style={{ minHeight: 72 }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-full" disabled={!reason} onClick={() => onSubmit(userId, reason)}>Submit report</button>
        </div>
      </div>
    </div>
  );
}
