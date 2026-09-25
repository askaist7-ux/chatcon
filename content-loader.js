// 승인 회원에게만 Firestore 의 보호 콘텐츠(챗봇·도구·공지)를 렌더링합니다.
// 페이지에 아래 컨테이너를 두면 자동으로 채워집니다.
//   <div data-chatcon="notices"></div>
//   <input data-chatcon="search" placeholder="챗봇 검색">
//   <div data-chatcon="bots"></div>
//   <div data-chatcon="tools"></div>
// ※ 챗봇 링크를 HTML에 직접 두지 않고 Firestore에 넣어야 비회원이 소스보기로도 볼 수 없습니다.
import { collection, getDocs, query, where }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-init.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : "#";

async function loadActive(name) {
  const snap = await getDocs(query(collection(db, name), where("active", "==", true)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.categoryOrder ?? 0) - (b.categoryOrder ?? 0) || (a.order ?? 0) - (b.order ?? 0));
}

const STYLE = `
<style id="chatcon-content-style">
  .cc-cat{margin:28px 0 12px;font-size:18px;font-weight:700}
  .cc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
  .cc-card{display:block;padding:14px 16px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;color:#111827;
    text-decoration:none;transition:transform .12s, box-shadow .12s}
  .cc-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.08)}
  .cc-card b{display:block;font-size:15px;margin-bottom:4px}
  .cc-card span{font-size:13px;color:#6b7280}
  .cc-badge{display:inline-block;font-size:11px;padding:2px 8px;border-radius:999px;background:#eef2ff;color:#4338ca;margin-left:6px}
  .cc-notice{padding:12px 16px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;margin-bottom:8px}
  .cc-empty{color:#6b7280;padding:12px 0}
</style>`;

function renderBots(el, bots) {
  if (!bots.length) { el.innerHTML = `<p class="cc-empty">등록된 챗봇이 없습니다.</p>`; return; }
  const groups = {};
  bots.forEach(b => (groups[b.category || "기타"] ||= []).push(b));
  el.innerHTML = Object.entries(groups).map(([cat, list]) => `
    <section class="cc-section" data-cat="${esc(cat)}">
      <h3 class="cc-cat">${esc(cat)} <small>(${list.length})</small></h3>
      <div class="cc-grid">${list.map(b => `
        <a class="cc-card" href="${esc(safeUrl(b.url))}" target="_blank" rel="noopener"
           data-search="${esc((b.title + " " + (b.description || "") + " " + cat + " " + (b.tags || []).join(" ")).toLowerCase())}">
          <b>${esc(b.icon || "🤖")} ${esc(b.title)}${b.badge ? `<em class="cc-badge">${esc(b.badge)}</em>` : ""}</b>
          <span>${esc(b.description || "")}</span>
        </a>`).join("")}
      </div>
    </section>`).join("");
}

function renderTools(el, tools) {
  el.innerHTML = tools.length ? `<div class="cc-grid">${tools.map(t => `
    <a class="cc-card" href="${esc(safeUrl(t.url))}" target="_blank" rel="noopener">
      <b>${esc(t.icon || "🛠️")} ${esc(t.title)}</b><span>${esc(t.description || "")}</span>
    </a>`).join("")}</div>` : `<p class="cc-empty">등록된 도구가 없습니다.</p>`;
}

function renderNotices(el, list) {
  el.innerHTML = list.slice(0, 5).map(n =>
    `<div class="cc-notice">📢 <b>${esc(n.title)}</b>${n.body ? `<div>${esc(n.body)}</div>` : ""}</div>`).join("");
}

function bindSearch(input) {
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll("[data-chatcon='bots'] .cc-card").forEach(c => {
      c.style.display = !q || c.dataset.search.includes(q) ? "" : "none";
    });
    document.querySelectorAll("[data-chatcon='bots'] .cc-section").forEach(s => {
      s.style.display = [...s.querySelectorAll(".cc-card")].some(c => c.style.display !== "none") ? "" : "none";
    });
  });
}

async function loadAll() {
  if (!document.getElementById("chatcon-content-style")) document.head.insertAdjacentHTML("beforeend", STYLE);
  const botsEl = document.querySelector("[data-chatcon='bots']");
  const toolsEl = document.querySelector("[data-chatcon='tools']");
  const noticeEl = document.querySelector("[data-chatcon='notices']");
  const searchEl = document.querySelector("[data-chatcon='search']");
  try {
    if (botsEl) renderBots(botsEl, await loadActive("bots"));
    if (toolsEl) renderTools(toolsEl, await loadActive("tools"));
    if (noticeEl) {
      const n = await loadActive("notices");
      n.sort((a, b) => (b.pinned === true) - (a.pinned === true) || (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      renderNotices(noticeEl, n);
    }
    if (searchEl) bindSearch(searchEl);
    document.dispatchEvent(new CustomEvent("chatcon:content-loaded"));
  } catch (e) {
    console.error("[chatcon] 콘텐츠 로드 실패", e);
    if (botsEl) botsEl.innerHTML = `<p class="cc-empty">콘텐츠를 불러오지 못했습니다. 새로고침해 주세요.</p>`;
  }
}

if (window.chatconUser) loadAll();
else document.addEventListener("chatcon:ready", loadAll, { once: true });
