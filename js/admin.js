import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const C = window.PROFILE_FIREBASE_CONFIG || {};
const ADMIN = (window.PROFILE_ADMIN_EMAIL || "").toLowerCase();
const $ = (id) => document.getElementById(id);
const state = { history: [], future: [], html: "", selected: null, ready: false };
const localKey = "sadnan-personal-profile-draft-v2";

function msg(text, error = false) {
  $("message").textContent = text;
  $("message").className = error ? "error" : "ok";
}

function configured() {
  return Boolean(C.apiKey && C.authDomain && C.projectId && C.appId);
}

function stripUnsafeMarkup(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html || ""), "text/html");
  doc.querySelectorAll("script,object,embed,iframe:not(#preview),base,meta[http-equiv='refresh']").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (name.startsWith("on")) node.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && /^javascript:/i.test(value)) node.removeAttribute(attr.name);
    });
  });
  return "<!doctype html>\n" + doc.documentElement.outerHTML;
}

if (!configured()) {
  msg("Add your Firebase Web App config in config/firebase-config.js first.", true);
}

let app;
let auth;
let db;
let storage;
if (configured()) {
  app = initializeApp(C);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = C.storageBucket ? getStorage(app) : null;
  setPersistence(auth, browserLocalPersistence).catch(console.warn);
}

function cleanHtml() {
  const d = $("preview").contentDocument;
  if (!d) return "";
  const clone = d.documentElement.cloneNode(true);
  clone.querySelectorAll("#portfolioTools,script,style[data-admin]").forEach((node) => node.remove());
  clone.querySelectorAll("[contenteditable]").forEach((node) => node.removeAttribute("contenteditable"));
  clone.querySelectorAll(".cms-selected").forEach((node) => node.classList.remove("cms-selected"));
  clone.querySelector("body")?.classList.remove("cms-editing");
  return "<!doctype html>\n" + clone.outerHTML;
}

function persistLocal() {
  state.html = cleanHtml();
  localStorage.setItem(localKey, state.html);
  $("status").textContent = "Local draft saved";
}

function snapshot() {
  const html = cleanHtml();
  if (!html) return;
  if (state.history.at(-1) !== html) state.history.push(html);
  if (state.history.length > 40) state.history.shift();
  state.future = [];
}

function render(html, remember = true) {
  if (remember && state.ready) snapshot();
  const safeHtml = stripUnsafeMarkup(html);
  state.html = safeHtml;
  localStorage.setItem(localKey, safeHtml);
  $("preview").srcdoc = safeHtml;
}

async function loadContent() {
  let html = localStorage.getItem(localKey);
  if (!html) {
    const response = await fetch("index.html", { cache: "no-store" });
    html = await response.text();
  }
  if (configured()) {
    try {
      const snap = await getDoc(doc(db, "publicContent", "profile"));
      if (snap.exists() && snap.data().html) html = snap.data().html;
    } catch (error) {
      console.warn("Cloud profile could not be loaded.", error);
    }
  }
  render(html, false);
  state.ready = true;
}

function selectedElement() {
  return $("preview").contentDocument?.querySelector(".cms-selected") || null;
}

function selectFromPreview(event) {
  const el = event.target.closest(
    ".editable,.stat-card,.education-item,.kv-row,.section,.card,.skill-chip,.interest-chip,.book,.gallery-item,.contact-card,.social-card"
  );
  if (!el) return;
  event.stopPropagation();
  const d = $("preview").contentDocument;
  d.querySelectorAll(".cms-selected").forEach((node) => node.classList.remove("cms-selected"));
  el.classList.add("cms-selected");
  state.selected = el;
}

function handleEditableInput() {
  state.html = cleanHtml();
  localStorage.setItem(localKey, state.html);
  $("status").textContent = "Unsynced local changes";
}

function enableEditor() {
  const d = $("preview").contentDocument;
  if (!d) return;
  d.body.classList.add("cms-editing");
  d.querySelectorAll(".editable").forEach((el) => {
    el.setAttribute("contenteditable", "true");
    el.spellcheck = true;
    el.addEventListener("input", handleEditableInput);
    el.addEventListener("focus", snapshot, { once: true });
  });
  d.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
    link.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const next = prompt("Edit link URL:", link.getAttribute("href") || "");
      if (next === null) return;
      const value = next.trim();
      if (!value || /^javascript:/i.test(value)) return alert("Enter a safe URL, email, or phone link.");
      snapshot();
      link.setAttribute("href", value);
      persistLocal();
    });
  });
  d.addEventListener("click", selectFromPreview, true);
  const style = d.createElement("style");
  style.dataset.admin = "true";
  style.textContent = `
    .cms-selected{outline:2px solid #B8860B!important;outline-offset:3px!important}
    .editable{cursor:text!important}
    body.cms-editing [data-profile-hidden="true"]{display:block!important;opacity:.35!important;filter:saturate(.5)!important}
    body.cms-editing [data-profile-hidden="true"]::before{content:"Hidden";position:absolute;background:#0F3D2E;color:#fff;font:600 10px sans-serif;padding:4px 7px;border-radius:999px;z-index:30}
  `;
  d.head.appendChild(style);
}

$("preview").addEventListener("load", enableEditor);

$("login").onclick = async () => {
  if (!configured()) return msg("Firebase config is incomplete.", true);
  try {
    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;
    if (email !== ADMIN) throw new Error("Only the configured administrator email is allowed.");
    await signInWithEmailAndPassword(auth, email, password);
    $("password").value = "";
    msg("");
  } catch (error) {
    msg("Login failed: " + (error.code || error.message), true);
  }
};

$("reset").onclick = async () => {
  if (!configured()) return msg("Firebase config is incomplete.", true);
  const email = $("email").value.trim().toLowerCase();
  if (email !== ADMIN) return msg("Enter the configured administrator email first.", true);
  try {
    await sendPasswordResetEmail(auth, email);
    msg("Password reset email sent.");
  } catch (error) {
    msg(error.code || error.message, true);
  }
};

$("logout").onclick = () => auth && signOut(auth);

async function saveToCloud() {
  persistLocal();
  if (!configured()) return msg("Local draft saved. Firebase config is required for cloud publishing.", true);
  if (!auth.currentUser || auth.currentUser.email?.toLowerCase() !== ADMIN) return msg("Please sign in as the administrator.", true);
  try {
    await setDoc(doc(db, "publicContent", "profile"), {
      html: state.html,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.uid,
      contentType: "personal-profile",
      schemaVersion: 2
    });
    $("status").textContent = "Published to cloud";
    msg("Profile saved and published.");
  } catch (error) {
    msg("Cloud save failed: " + error.message, true);
  }
}

$("save").onclick = saveToCloud;
$("publish").onclick = saveToCloud;

$("undo").onclick = () => {
  if (!state.history.length) return;
  state.future.push(cleanHtml());
  const html = state.history.pop();
  render(html, false);
};

$("redo").onclick = () => {
  if (!state.future.length) return;
  state.history.push(cleanHtml());
  const html = state.future.pop();
  render(html, false);
};

$("removeSelected").onclick = () => {
  const el = selectedElement();
  if (!el) return alert("Select a section or card first.");
  if (!confirm("Remove the selected item?")) return;
  snapshot();
  el.remove();
  persistLocal();
};

$("duplicateSelected").onclick = () => {
  const el = selectedElement();
  if (!el) return alert("Select an item to duplicate.");
  snapshot();
  const clone = el.cloneNode(true);
  clone.classList.remove("cms-selected");
  if (clone.id) clone.removeAttribute("id");
  clone.querySelectorAll?.("[id]").forEach((node) => node.removeAttribute("id"));
  el.insertAdjacentElement("afterend", clone);
  persistLocal();
  enableEditor();
};

function moveSelected(direction) {
  const el = selectedElement();
  if (!el) return alert("Select an item to reorder.");
  const sibling = direction < 0 ? el.previousElementSibling : el.nextElementSibling;
  if (!sibling) return;
  snapshot();
  if (direction < 0) el.parentNode.insertBefore(el, sibling);
  else el.parentNode.insertBefore(sibling, el);
  persistLocal();
}

$("moveUp").onclick = () => moveSelected(-1);
$("moveDown").onclick = () => moveSelected(1);

$("toggleHidden").onclick = () => {
  const el = selectedElement();
  if (!el) return alert("Select an item to hide or show.");
  snapshot();
  const hidden = el.getAttribute("data-profile-hidden") === "true";
  if (hidden) el.removeAttribute("data-profile-hidden");
  else el.setAttribute("data-profile-hidden", "true");
  persistLocal();
};

$("addField").onclick = () => {
  const d = $("preview").contentDocument;
  const selected = selectedElement();
  let host = selected?.closest(".section,.card")?.querySelector("#statGrid,#familyList,#eduList,#skillsList,#galleryList") || null;
  if (!host) host = d?.querySelector("#statGrid,#familyList,#eduList,#skillsList,#galleryList");
  if (!host) return alert("No compatible editable list was found.");
  snapshot();
  const item = d.createElement("div");
  if (host.id === "statGrid") {
    item.className = "stat-card";
    item.innerHTML = '<div class="circ">◦</div><div><div class="label editable" contenteditable="true">Label</div><div class="value editable" contenteditable="true">Enter a value</div></div>';
  } else if (host.id === "eduList") {
    item.className = "education-item";
    item.innerHTML = '<strong class="editable" contenteditable="true">Education field</strong><span class="editable" contenteditable="true">Enter a value</span>';
  } else if (host.id === "skillsList") {
    item.className = "skill-chip editable";
    item.contentEditable = "true";
    item.textContent = "New skill";
  } else if (host.id === "galleryList") {
    alert("Use Replace image for the current gallery image. Duplicate the gallery item first to add another photo.");
    return;
  } else {
    item.className = "kv-row";
    item.innerHTML = '<span class="k editable" contenteditable="true">Label</span><span class="v editable" contenteditable="true">Enter a value</span>';
  }
  host.appendChild(item);
  persistLocal();
  enableEditor();
};

$("addSection").onclick = () => {
  const d = $("preview").contentDocument;
  const frame = d?.querySelector(".frame-inner");
  const footer = d?.querySelector(".footer");
  if (!frame) return;
  snapshot();
  const section = d.createElement("section");
  section.className = "block mt6 section cms-created";
  section.innerHTML = `
    <div class="card">
      <div class="section-title">
        <div class="icon-box"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg></div>
        <h3 class="editable" contenteditable="true">New Section</h3><div class="rule"></div>
      </div>
      <p class="body-text editable" contenteditable="true">Write your content here.</p>
    </div>`;
  if (footer) frame.insertBefore(section, footer);
  else frame.appendChild(section);
  persistLocal();
  enableEditor();
};

async function optimizeImage(file) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error("Image optimization failed.");
  return blob;
}

async function blobToDataUrl(blob) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

$("imageBtn").onclick = () => $("imageInput").click();
$("imageInput").onchange = async () => {
  const file = $("imageInput").files[0];
  if (!file) return;
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return alert("Use a JPEG, PNG, or WebP image.");
  if (file.size > 12 * 1024 * 1024) return alert("Please use an image smaller than 12 MB.");
  const d = $("preview").contentDocument;
  const selected = d?.querySelector(".cms-selected");
  const img = selected?.querySelector?.("img") || (selected?.matches?.("img") ? selected : null) || d?.querySelector(".photo-ring img");
  if (!img) return alert("Select an image card first.");
  try {
    $("status").textContent = "Optimizing image…";
    const optimized = await optimizeImage(file);
    let imageUrl = "";
    if (storage && auth?.currentUser?.email?.toLowerCase() === ADMIN) {
      $("status").textContent = "Uploading image…";
      const path = `profile-media/${auth.currentUser.uid}/${Date.now()}-${crypto.randomUUID()}.webp`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, optimized, { contentType: "image/webp", cacheControl: "public,max-age=31536000,immutable" });
      imageUrl = await getDownloadURL(ref);
    } else {
      if (optimized.size > 350 * 1024) throw new Error("Firebase Storage is not configured and the optimized image is too large for a safe inline fallback.");
      imageUrl = await blobToDataUrl(optimized);
    }
    snapshot();
    img.src = imageUrl;
    if (!img.alt) img.alt = "Sadnan Kabir";
    persistLocal();
    $("status").textContent = storage ? "Image uploaded" : "Image stored in local draft";
  } catch (error) {
    alert("Image update failed: " + error.message);
  } finally {
    $("imageInput").value = "";
  }
};

$("export").onclick = () => {
  const data = { version: 2, type: "personal-profile", createdAt: new Date().toISOString(), html: cleanHtml() };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "sadnan-personal-profile-backup.json";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

$("import").onchange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error("Backup file is too large.");
    const data = JSON.parse(await file.text());
    if (!data.html || typeof data.html !== "string") throw new Error("Invalid backup format.");
    snapshot();
    render(stripUnsafeMarkup(data.html), false);
    msg("Backup imported into the local editor. Review it before publishing.");
  } catch (error) {
    alert("Backup import failed: " + error.message);
  } finally {
    event.target.value = "";
  }
};

$("restore").onclick = () => {
  const html = localStorage.getItem(localKey);
  if (!html) return alert("No local draft is available.");
  snapshot();
  render(html, false);
};

window.addEventListener("keydown", (event) => {
  const cmd = event.ctrlKey || event.metaKey;
  if (cmd && event.key.toLowerCase() === "s") {
    event.preventDefault();
    $("save").click();
  }
  if (cmd && event.key.toLowerCase() === "z") {
    event.preventDefault();
    event.shiftKey ? $("redo").click() : $("undo").click();
  }
});

if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (user && user.email?.toLowerCase() === ADMIN) {
      $("loginBox").hidden = true;
      $("editorBox").hidden = false;
      $("status").textContent = user.email;
      loadContent();
    } else {
      if (user) signOut(auth).catch(console.warn);
      $("loginBox").hidden = false;
      $("editorBox").hidden = true;
      $("status").textContent = "Not signed in";
    }
  });
}
