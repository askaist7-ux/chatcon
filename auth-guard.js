// ChatCon 회원 전용 페이지 보호 스크립트
// 사용법 (보호할 모든 페이지의 <head> 맨 위):
//   <style>html:not(.auth-ok) body{visibility:hidden}</style>
//   <script type="module" src="auth-guard.js"></script>
// 옵션: <html data-require="admin"> 이면 관리자만 접근
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, increment }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db, SITE } from "./firebase-init.js";

const requireAdmin = document.documentElement.dataset.require === "admin";

function goLogin(reason) {
  const next = encodeURIComponent(location.pathname.split("/").pop() + location.search + location.hash);
  location.replace(`${SITE.loginPage}?next=${next}${reason ? "&reason=" + reason : ""}`);
}

async function logAccess(user, action) {
  try {
    await addDoc(collection(db, "accessLogs"), {
      uid: user.uid, email: user.email || "", action,
      page: location.pathname + location.hash,
      userAgent: navigator.userAgent.slice(0, 200),
      at: serverTimestamp()
    });
  } catch (_) { /* 로그 실패는 무시 */ }
}

function mountUserBar(profile) {
  if (document.getElementById("chatcon-userbar")) return;
  const bar = document.createElement("div");
  bar.id = "chatcon-userbar";
  bar.innerHTML = `
    <style>
      #chatcon-userbar{position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;gap:8px;align-items:center;
        background:#111827;color:#fff;padding:8px 12px;border-radius:999px;font:13px/1.2 system-ui,sans-serif;
        box-shadow:0 6px 20px rgba(0,0,0,.25)}
      #chatcon-userbar a,#chatcon-userbar button{color:#fff;background:#374151;border:0;border-radius:999px;
        padding:5px 10px;font:inherit;cursor:pointer;text-decoration:none}
      #chatcon-userbar button:hover,#chatcon-userbar a:hover{background:#4b5563}
    </style>
    <span>👤 ${escapeHtml(profile.name || "회원")}님</span>
    ${profile.role === "admin" ? `<a href="${SITE.adminPage}">관리자</a>` : ""}
    <button type="button" id="chatcon-logout">로그아웃</button>`;
  document.body.appendChild(bar);
  document.getElementById("chatcon-logout").onclick = async () => {
    await logAccess(auth.currentUser, "logout");
    await signOut(auth);
    location.replace(SITE.loginPage);
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return goLogin();
  let snap;
  try { snap = await getDoc(doc(db, "users", user.uid)); }
  catch (e) { console.error(e); return goLogin("error"); }

  if (!snap.exists()) return goLogin("noprofile");
  const profile = snap.data();
  if (profile.status !== "approved") return goLogin(profile.status);
  if (requireAdmin && profile.role !== "admin") return location.replace(SITE.homePage);

  // 세션당 1회 로그인 기록
  const key = "chatcon_session_" + user.uid;
  let firstInSession = false;
  try { firstInSession = !sessionStorage.getItem(key); sessionStorage.setItem(key, "1"); } catch (_) {}
  if (firstInSession) {
    updateDoc(doc(db, "users", user.uid), { lastLoginAt: serverTimestamp(), loginCount: increment(1) }).catch(() => {});
    logAccess(user, "visit");
  }

  window.chatconUser = { uid: user.uid, email: user.email, ...profile };
  document.documentElement.classList.add("auth-ok");
  mountUserBar(profile);
  document.dispatchEvent(new CustomEvent("chatcon:ready", { detail: window.chatconUser }));
});
