// ChatCon 이모티콘 프롬프트 챗봇 허브 — 렌더링 & 필터 로직
// 데이터는 모두 Firestore 에서 불러옵니다.
//  - categories (공개): 카테고리 이름·순서·아이콘 → 아코디언 구성
//  - tools      (공개): 실무 도구·마켓 링크
//  - settings/site (공개): 비회원용 개수 통계, 원격지원 링크
//  - bots (승인 회원 전용): 챗봇 링크 — 비회원은 소스 보기로도 볼 수 없음
// 카테고리·챗봇·도구 추가/수정은 관리자 페이지(admin.html)에서 하면 개수와 그룹이 자동 반영됩니다.
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, addDoc, serverTimestamp, increment }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db, SITE } from "../firebase-init.js";
import { categoryIcon, toolIcon } from "../icons.js";

const DEFAULT_REMOTE_URL = "https://remotedesktop.google.com/home?pli=1";
const LOGIN_URL = SITE.loginPage;
const SIGNUP_URL = `${SITE.loginPage}#signup`;
const OPEN_KEY = "chatcon_open_categories";

// access: loading | guest | pending | rejected | suspended | noprofile | error | member
const state = { access: "loading", profile: null, query: "", open: loadOpenState() };
let CATEGORIES = []; // { id, name, icon, description, order, pinned }
let TOOLS = [];
let SETTINGS = {};
let BOTS = []; // { id, title, categoryId, category, order, url, description, badge, tags }

const $ = (id) => document.getElementById(id);
const ic = (inner, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const externalLinkIcon = ic(`<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/>`);
const chevronIcon = ic(`<path d="M6 9l6 6 6-6"/>`, 20);
const lockIcon = ic(`<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 018 0v3"/>`);

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "#");

function loadOpenState() {
  try { return new Set(JSON.parse(localStorage.getItem(OPEN_KEY) || "[]")); } catch (_) { return new Set(); }
}
function saveOpenState() {
  try { localStorage.setItem(OPEN_KEY, JSON.stringify([...state.open])); } catch (_) {}
}

// ===== 회원 상태별 안내 =====
const LOCK = {
  loading: { title: "챗봇 목록을 불러오는 중…", desc: "", actions: "" },
  guest: {
    title: "회원 전용 챗봇입니다",
    desc: "로그인하면 컨셉별 이모티콘 프롬프트 챗봇을 바로 이용할 수 있어요.",
    actions: `<a class="btn btn-primary" href="${LOGIN_URL}">로그인</a><a class="btn btn-outline" href="${SIGNUP_URL}">회원가입</a>`,
  },
  pending: {
    title: "승인 대기 중입니다",
    desc: "관리자 승인 후 챗봇을 이용할 수 있어요. 조금만 기다려 주세요.",
    actions: `<a class="btn btn-outline" href="${LOGIN_URL}">승인 상태 확인</a>`,
  },
  rejected: {
    title: "가입이 반려되었습니다",
    desc: "자세한 사유는 운영자에게 문의해 주세요.",
    actions: `<a class="btn btn-outline" href="${LOGIN_URL}">자세히 보기</a>`,
  },
  suspended: {
    title: "이용이 정지된 계정입니다",
    desc: "이용 정지 사유는 운영자에게 문의해 주세요.",
    actions: `<a class="btn btn-outline" href="${LOGIN_URL}">자세히 보기</a>`,
  },
  noprofile: {
    title: "가입 정보 입력이 필요합니다",
    desc: "회원가입을 마무리하면 승인 후 이용할 수 있어요.",
    actions: `<a class="btn btn-primary" href="${LOGIN_URL}">가입 마무리하기</a>`,
  },
  error: {
    title: "챗봇 목록을 불러오지 못했습니다",
    desc: "잠시 후 새로고침해 주세요.",
    actions: `<button type="button" class="btn btn-outline" onclick="location.reload()">새로고침</button>`,
  },
};

function lockPanel(compact = false) {
  const l = LOCK[state.access] || LOCK.guest;
  return `<div class="member-lock${compact ? " compact" : ""}">
    <span class="member-lock-icon">${lockIcon}</span>
    <h3>${l.title}</h3>
    ${l.desc ? `<p>${l.desc}</p>` : ""}
    ${l.actions ? `<div class="member-lock-actions">${l.actions}</div>` : ""}
  </div>`;
}

// ===== 헤더 로그인 영역 =====
function renderAuthNav() {
  const nav = $("authNav");
  if (!nav) return;
  if (state.access === "loading") { nav.innerHTML = ""; return; }
  if (!auth.currentUser) {
    nav.innerHTML = `<a class="auth-btn" href="${LOGIN_URL}">로그인</a>
      <a class="auth-btn auth-btn-primary" href="${SIGNUP_URL}">회원가입</a>`;
    return;
  }
  const p = state.profile;
  const isAdmin = p?.role === "admin" && p?.status === "approved";
  nav.innerHTML = `<span class="auth-name">${escapeHtml(p?.name || "회원")}님</span>
    ${isAdmin ? `<a class="auth-btn auth-btn-admin" href="${SITE.adminPage}">관리자</a>` : ""}
    <button type="button" class="auth-btn" id="logoutBtn">로그아웃</button>`;
  $("logoutBtn").addEventListener("click", async () => {
    await logAccess("logout");
    await signOut(auth);
    location.reload();
  });
}

// ===== 카테고리별 그룹 =====
const isMember = () => state.access === "member";

// 챗봇 → 카테고리 매칭 (categoryId 우선, 없으면 이름, 그래도 없으면 '기타')
function groupBots() {
  const byName = new Map(CATEGORIES.map((c) => [c.name, c.id]));
  const groups = new Map(CATEGORIES.map((c) => [c.id, []]));
  const etc = [];
  BOTS.forEach((b) => {
    const cid = groups.has(b.categoryId) ? b.categoryId : byName.get(b.category);
    (cid ? groups.get(cid) : etc).push(b);
  });
  const list = CATEGORIES.map((c) => ({ ...c, bots: groups.get(c.id) }));
  if (etc.length) list.push({ id: "_etc", name: "기타", icon: "star", description: "", bots: etc });
  return list;
}

function categoryCount(c) {
  if (isMember()) return c.bots.length;
  return SETTINGS.stats?.perCategory?.[c.id] ?? null;
}

function matches(b, c, q) {
  return [b.title, b.description, c.name, ...(b.tags || [])].join(" ").toLowerCase().includes(q);
}

function botCard(b) {
  return `
    <a class="bot-card" href="${escapeHtml(safeUrl(b.url))}" target="_blank" rel="noopener noreferrer">
      <div class="bot-card-top">
        <h3 class="bot-title">${escapeHtml(b.title)}</h3>
        ${b.badge ? `<span class="bot-badge">${escapeHtml(b.badge)}</span>` : ""}
      </div>
      ${b.description ? `<p class="bot-desc">${escapeHtml(b.description)}</p>` : ""}
      <span class="bot-open-btn">챗봇 열기 ${externalLinkIcon}</span>
    </a>`;
}

function renderAccordion() {
  const wrap = $("botAccordion");
  const empty = $("emptyState");
  const countEl = $("resultCount");
  const q = state.query.trim().toLowerCase();
  const groups = groupBots().filter((c) => c.bots.length || !isMember());

  if (!CATEGORIES.length && !isMember()) {
    wrap.innerHTML = lockPanel();
    countEl.textContent = "";
    empty.classList.remove("show");
    return;
  }

  let shownBots = 0;
  const html = groups.map((c) => {
    const found = isMember() && q ? c.bots.filter((b) => matches(b, c, q)) : c.bots;
    const nameHit = q && c.name.toLowerCase().includes(q);
    if (q && !found.length && !nameHit) return "";
    const bots = q && nameHit && !found.length ? c.bots : found;
    shownBots += bots.length;
    const total = categoryCount(c);
    const open = q ? true : state.open.has(c.id);
    const preview = isMember() ? bots.slice(0, 3).map((b) => b.title).join(" · ") : "";
    const countLabel = total == null ? "" : q && isMember() && bots.length !== total ? `${bots.length}/${total}` : `${total}`;
    return `
    <section class="acc${open ? " open" : ""}${c.pinned ? " pinned" : ""}" id="cat-${escapeHtml(c.id)}" data-cat="${escapeHtml(c.id)}">
      <button type="button" class="acc-head" aria-expanded="${open}" aria-controls="panel-${escapeHtml(c.id)}">
        <span class="acc-icon">${categoryIcon(c.icon)}</span>
        <span class="acc-text">
          <span class="acc-title">${escapeHtml(c.name)}${c.pinned ? `<em class="acc-pin">먼저 사용</em>` : ""}</span>
          <span class="acc-sub">${escapeHtml(c.description || preview || "")}</span>
        </span>
        ${countLabel ? `<span class="acc-count">${countLabel}<small>개</small></span>` : ""}
        <span class="acc-chevron">${chevronIcon}</span>
      </button>
      <div class="acc-panel" id="panel-${escapeHtml(c.id)}" role="region">
        <div class="acc-inner">
          ${isMember() ? `<div class="acc-grid">${bots.map(botCard).join("")}</div>` : lockPanel(true)}
        </div>
      </div>
    </section>`;
  }).join("");

  wrap.innerHTML = html;
  const allBots = BOTS.length || SETTINGS.stats?.bots || 0;
  countEl.textContent = isMember() ? (q ? `${shownBots}개 검색됨` : `${allBots}개`) : allBots ? `${allBots}개` : "";
  empty.classList.toggle("show", !html.trim());

  wrap.querySelectorAll(".acc-head").forEach((head) => {
    head.addEventListener("click", () => toggleCategory(head.closest(".acc").dataset.cat));
  });
  updateToggleAllBtn();
}

function toggleCategory(id, force) {
  const el = $(`cat-${id}`);
  if (!el) return;
  const open = force ?? !el.classList.contains("open");
  el.classList.toggle("open", open);
  el.querySelector(".acc-head").setAttribute("aria-expanded", String(open));
  if (!state.query) { open ? state.open.add(id) : state.open.delete(id); saveOpenState(); }
  updateToggleAllBtn();
}

function updateToggleAllBtn() {
  const btn = $("toggleAllBtn");
  if (!btn) return;
  const items = [...document.querySelectorAll("#botAccordion .acc")];
  const allOpen = items.length && items.every((x) => x.classList.contains("open"));
  btn.dataset.mode = allOpen ? "close" : "open";
  btn.querySelector("span").textContent = allOpen ? "모두 접기" : "모두 펼치기";
  btn.hidden = !items.length || !!state.query;
}

// ===== 왼쪽 메뉴: 카테고리 바로가기 + 고정 카테고리 챗봇 =====
function renderDrawer() {
  const nav = $("drawerNav");
  const groups = groupBots().filter((c) => c.bots.length || !isMember());
  const pinned = groups.filter((c) => c.pinned);

  const pinnedHtml = pinned.map((c) => `
    <div class="drawer-section">
      <h3 class="drawer-section-title">${escapeHtml(c.name)} <span class="drawer-count">먼저 사용</span></h3>
      <ul class="drawer-list">${isMember()
        ? c.bots.map((b) => `
        <li><a class="drawer-link" href="${escapeHtml(safeUrl(b.url))}" target="_blank" rel="noopener noreferrer">
          <span class="drawer-link-icon">${categoryIcon(c.icon)}</span>
          <span class="drawer-link-text">${escapeHtml(b.title)}</span>
          <span class="drawer-external-icon">${externalLinkIcon}</span></a></li>`).join("")
        : `<li><a class="drawer-link" href="#cat-${escapeHtml(c.id)}" data-jump="${escapeHtml(c.id)}">
          <span class="drawer-link-icon">${lockIcon}</span><span class="drawer-link-text">로그인 후 이용</span></a></li>`}
      </ul>
    </div>`).join("");

  const catLinks = groups.map((c) => {
    const n = categoryCount(c);
    return `<li><a class="drawer-cat" href="#cat-${escapeHtml(c.id)}" data-jump="${escapeHtml(c.id)}">
      <span class="drawer-link-icon">${categoryIcon(c.icon)}</span>
      <span class="drawer-link-text">${escapeHtml(c.name)}</span>
      ${n == null ? "" : `<span class="drawer-count">${n}</span>`}</a></li>`;
  }).join("");

  nav.innerHTML = (pinnedHtml ? `<div class="drawer-pinned">${pinnedHtml}</div>` : "") + `
    <div class="drawer-section">
      <h3 class="drawer-section-title">카테고리 <span class="drawer-count">${groups.length}</span></h3>
      <ul class="drawer-list">${catLinks}</ul>
    </div>`;

  nav.querySelectorAll("[data-jump]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    jumpToCategory(a.dataset.jump);
  }));
}

function jumpToCategory(id) {
  if (state.query) { state.query = ""; $("botSearch").value = ""; renderAccordion(); }
  toggleCategory(id, true);
  closeDrawer();
  const el = $(`cat-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1200);
  }
}

// ===== 실무 도구 · 통계 · 원격지원 =====
function renderTools() {
  const grid = $("toolsGrid");
  grid.innerHTML = TOOLS.length ? TOOLS.map((t) => `
    <a class="tool-card" href="${escapeHtml(safeUrl(t.url))}" target="_blank" rel="noopener noreferrer">
      <span class="tool-icon" aria-hidden="true">${toolIcon(t.icon)}</span>
      <h3>${escapeHtml(t.title)}</h3>
      <p>${escapeHtml(t.description)}</p>
      <span class="btn tool-card-cta">바로가기 →</span>
    </a>`).join("") : `<p class="tools-empty">등록된 도구가 없습니다.</p>`;

  $("drawerTools").innerHTML = TOOLS.map((t) =>
    `<li><a href="${escapeHtml(safeUrl(t.url))}" target="_blank" rel="noopener noreferrer"><span class="drawer-tool-icon" aria-hidden="true">${toolIcon(t.icon)}</span><span>${escapeHtml(t.title)}</span></a></li>`
  ).join("");
}

function renderStats() {
  const bots = isMember() ? BOTS.length : SETTINGS.stats?.bots;
  const cats = isMember() ? groupBots().filter((c) => c.bots.length).length : CATEGORIES.length;
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v ?? "–"; };
  set("statBots", bots);
  set("statCats", cats || null);
  set("statTools", TOOLS.length || null);
}

function renderRemote() {
  const url = safeUrl(SETTINGS.remoteSupportUrl || DEFAULT_REMOTE_URL);
  document.querySelectorAll("[data-remote]").forEach((a) => { a.href = url; });
}

function renderAll() {
  renderAuthNav();
  renderAccordion();
  renderDrawer();
  renderStats();
}

// ===== 드로어 (모바일 메뉴) =====
let closeDrawer = () => {};
function initDrawer() {
  const drawer = $("sideDrawer");
  const overlay = $("drawerOverlay");
  const toggleBtn = $("menuToggle");

  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("show");
    document.body.classList.add("no-scroll");
    toggleBtn.setAttribute("aria-expanded", "true");
  }
  closeDrawer = () => {
    drawer.classList.remove("open");
    overlay.classList.remove("show");
    document.body.classList.remove("no-scroll");
    toggleBtn.setAttribute("aria-expanded", "false");
  };

  toggleBtn.addEventListener("click", () => (drawer.classList.contains("open") ? closeDrawer() : openDrawer()));
  $("heroMenuBtn")?.addEventListener("click", openDrawer);
  $("drawerClose").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });
  // 데스크톱(사이드바 고정 표시)로 리사이즈되면 모바일 오버레이 상태를 정리
  window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => { if (e.matches) closeDrawer(); });
}

function initSearch() {
  const input = $("botSearch");
  input.addEventListener("input", () => {
    state.query = input.value;
    renderAccordion();
  });
  $("topSearchBtn").addEventListener("click", () => {
    $("toolbar").scrollIntoView({ behavior: "smooth", block: "start" });
    input.focus({ preventScroll: true });
  });
  $("toggleAllBtn").addEventListener("click", (e) => {
    const open = e.currentTarget.dataset.mode !== "close";
    document.querySelectorAll("#botAccordion .acc").forEach((x) => toggleCategory(x.dataset.cat, open));
  });
}

// ===== 데이터 불러오기 =====
async function loadPublic() {
  const [cats, tools, site] = await Promise.all([
    getDocs(collection(db, "categories")),
    getDocs(collection(db, "tools")),
    getDoc(doc(db, "settings", "site")),
  ]);
  const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99);
  CATEGORIES = cats.docs.map((d) => ({ id: d.id, ...d.data() })).filter((c) => c.active !== false).sort(byOrder);
  TOOLS = tools.docs.map((d) => ({ id: d.id, ...d.data() })).filter((t) => t.active !== false).sort(byOrder);
  SETTINGS = site.exists() ? site.data() : {};
}

async function loadBots() {
  const snap = await getDocs(query(collection(db, "bots"), where("active", "==", true)));
  BOTS = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ===== 로그인 상태 확인 & 접속 기록 =====
async function logAccess(action) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await addDoc(collection(db, "accessLogs"), {
      uid: user.uid, email: user.email || "", action,
      page: location.pathname + location.hash,
      userAgent: navigator.userAgent.slice(0, 200),
      at: serverTimestamp(),
    });
  } catch (_) { /* 로그 실패는 무시 */ }
}

// 세션당 1회 최근 접속 시각·접속 횟수 기록 (관리자 회원 목록에 표시)
function recordVisitOncePerSession(user) {
  const key = "chatcon_session_" + user.uid;
  let first = false;
  try { first = !sessionStorage.getItem(key); sessionStorage.setItem(key, "1"); } catch (_) {}
  if (!first) return;
  updateDoc(doc(db, "users", user.uid), { lastLoginAt: serverTimestamp(), loginCount: increment(1) }).catch(() => {});
  logAccess("visit");
}

const publicReady = loadPublic()
  .catch((e) => console.error("[chatcon] 공개 데이터 로드 실패", e))
  .then(() => { renderTools(); renderRemote(); renderAll(); });

onAuthStateChanged(auth, async (user) => {
  await publicReady;
  state.profile = null;
  BOTS = [];
  if (!user) { state.access = "guest"; return renderAll(); }
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) { state.access = "noprofile"; return renderAll(); }
    state.profile = snap.data();
    if (state.profile.status !== "approved") { state.access = state.profile.status || "pending"; return renderAll(); }
    await loadBots();
    state.access = "member";
    recordVisitOncePerSession(user);
  } catch (e) {
    console.error("[chatcon]", e);
    state.access = "error";
  }
  renderAll();
});

// 모듈 스크립트는 문서 파싱 후 실행되므로 바로 초기화
renderAll();
initSearch();
initDrawer();
