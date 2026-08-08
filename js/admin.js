import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,onAuthStateChanged,signInWithEmailAndPassword,sendPasswordResetEmail,signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,doc,getDoc,setDoc,serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const C=window.BIODATA_FIREBASE_CONFIG||{};
const ADMIN=(window.BIODATA_ADMIN_EMAIL||"").toLowerCase();
const $=id=>document.getElementById(id);
const state={history:[],future:[],html:"",selected:null,ready:false};

function msg(t,err=false){$("message").textContent=t; $("message").className=err?"error":"ok";}
function configured(){return C.apiKey&&C.authDomain&&C.projectId&&C.appId;}
if(!configured()){msg("প্রথমে config/firebase-config.js-এ Firebase Web App config বসাও।",true);}

let app,auth,db;
if(configured()){
  app=initializeApp(C); auth=getAuth(app); db=getFirestore(app);
}

const localKey="sadnan-biodata-draft-v1";
function cleanHtml(){
  const iframe=$("preview"), d=iframe.contentDocument;
  if(!d) return "";
  const clone=d.documentElement.cloneNode(true);
  clone.querySelectorAll("#portfolioTools,script,style[data-admin]").forEach(x=>x.remove());
  clone.querySelectorAll("[contenteditable]").forEach(x=>x.removeAttribute("contenteditable"));
  return "<!doctype html>\n"+clone.outerHTML;
}
function snapshot(){
  state.history.push(cleanHtml());
  if(state.history.length>30) state.history.shift();
  state.future=[];
}
function render(html,remember=true){
  if(remember && state.ready) snapshot();
  state.html=html;
  localStorage.setItem(localKey,html);
  $("preview").srcdoc=html;
}
async function loadContent(){
  let html=localStorage.getItem(localKey);
  if(!html){
    const r=await fetch("index.html",{cache:"no-store"});
    html=await r.text();
  }
  if(configured()){
    try{
      const s=await getDoc(doc(db,"publicContent","biodata"));
      if(s.exists() && s.data().html) html=s.data().html;
    }catch(e){console.warn(e);}
  }
  render(html,false); state.ready=true;
}
function selectFromPreview(ev){
  const el=ev.target.closest(".editable,.stat-card,.timeline-item,.kv-row,.section,.box,.card");
  if(!el) return;
  ev.preventDefault(); ev.stopPropagation();
  $("preview").contentDocument.querySelectorAll(".cms-selected").forEach(x=>x.classList.remove("cms-selected"));
  el.classList.add("cms-selected"); state.selected=el;
}
function enableEditor(){
  const d=$("preview").contentDocument;
  d.querySelectorAll(".editable").forEach(el=>{
    el.setAttribute("contenteditable","true");
    el.addEventListener("input",()=>{state.html=cleanHtml();localStorage.setItem(localKey,state.html);});
    el.addEventListener("dblclick",()=>snapshot());
  });
  d.addEventListener("click",selectFromPreview,true);
  const st=d.createElement("style");st.dataset.admin="true";st.textContent=".cms-selected{outline:2px solid #B8860B!important;outline-offset:3px}.editable{cursor:text!important}";
  d.head.appendChild(st);
}
$("preview").addEventListener("load",enableEditor);

$("login").onclick=async()=>{
  if(!configured()) return msg("Firebase config incomplete.",true);
  try{
    const email=$("email").value.trim().toLowerCase(), pass=$("password").value;
    if(email!==ADMIN) throw new Error("Only the configured admin email is allowed.");
    await signInWithEmailAndPassword(auth,email,pass); msg("");
  }catch(e){msg("Login failed: "+(e.code||e.message),true);}
};
$("reset").onclick=async()=>{
  if(!configured()) return msg("Firebase config incomplete.",true);
  try{await sendPasswordResetEmail(auth,$("email").value.trim());msg("Password reset email sent.");}catch(e){msg(e.code||e.message,true);}
};
$("logout").onclick=()=>auth&&signOut(auth);
$("save").onclick=async()=>{
  state.html=cleanHtml(); localStorage.setItem(localKey,state.html);
  if(!configured()) return msg("Local draft saved. Firebase config is required for cloud save.",true);
  try{
    await setDoc(doc(db,"publicContent","biodata"),{html:state.html,updatedAt:serverTimestamp(),updatedBy:auth.currentUser.uid});
    $("status").textContent="Saved to cloud";
  }catch(e){msg("Cloud save failed: "+e.message,true);}
};
$("publish").onclick=$("save").onclick;
$("undo").onclick=()=>{
  if(!state.history.length)return;
  state.future.push(cleanHtml()); const h=state.history.pop(); $("preview").srcdoc=h; state.html=h;
};
$("redo").onclick=()=>{
  if(!state.future.length)return;
  state.history.push(cleanHtml()); const h=state.future.pop(); $("preview").srcdoc=h; state.html=h;
};
$("removeSelected").onclick=()=>{
  const d=$("preview").contentDocument, el=d?.querySelector(".cms-selected");
  if(!el)return alert("আগে একটি section/card select করো.");
  if(!confirm("Selected item মুছে ফেলবে?"))return;
  snapshot();el.remove();state.html=cleanHtml();localStorage.setItem(localKey,state.html);
};
$("addField").onclick=()=>{
  const d=$("preview").contentDocument, host=d?.querySelector("#statGrid,#familyList,#eduList");
  if(!host)return alert("Editable list পাওয়া যায়নি.");
  snapshot();
  const item=d.createElement("div"); item.className=host.id==="statGrid"?"stat-card":"kv-row";
  item.innerHTML='<span class="label editable" contenteditable="true">নতুন তথ্য</span><span class="value editable" contenteditable="true">মান লিখুন</span><button class="remove-btn" type="button">×</button>';
  host.appendChild(item); enableEditor();
};
$("addSection").onclick=()=>{
  const d=$("preview").contentDocument, wrap=d?.querySelector(".wrap"); if(!wrap)return;
  snapshot();
  const sec=d.createElement("section"); sec.className="section cms-created";
  sec.innerHTML='<h2 class="editable" contenteditable="true">নতুন সেকশন</h2><div class="box"><p class="editable" contenteditable="true">এখানে তথ্য লিখুন।</p></div>';
  wrap.appendChild(sec); enableEditor();
};
$("imageBtn").onclick=()=>$("imageInput").click();
$("imageInput").onchange=()=>{
  const file=$("imageInput").files[0]; if(!file)return;
  const reader=new FileReader(); reader.onload=()=>{
    const d=$("preview").contentDocument, img=d?.querySelector(".cms-selected img, img");
    if(!img)return alert("আগে একটি image select করো.");
    snapshot(); img.src=reader.result; state.html=cleanHtml(); localStorage.setItem(localKey,state.html);
  }; reader.readAsDataURL(file);
};
$("export").onclick=()=>{
  const data={version:1,createdAt:new Date().toISOString(),html:cleanHtml()};
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="sadnan-biodata-backup.json";a.click();
};
$("import").onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{const data=JSON.parse(await f.text());if(!data.html)throw Error("Invalid backup");snapshot();render(data.html,false);enableEditor();}
  catch(err){alert("Backup import failed: "+err.message);}
};
$("restore").onclick=()=>{const h=localStorage.getItem(localKey);if(h){snapshot();render(h,false);enableEditor();}};
window.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();$("save").click();}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?$("redo").click():$("undo").click();}
});
if(auth){
 onAuthStateChanged(auth,user=>{
   if(user && user.email?.toLowerCase()===ADMIN){
     $("loginBox").hidden=true;$("editorBox").hidden=false;$("status").textContent=user.email;loadContent();
   }else{
     $("loginBox").hidden=false;$("editorBox").hidden=true;$("status").textContent="Not signed in";
   }
 });
}