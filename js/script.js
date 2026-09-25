// ChatCon 이모티콘 프롬프트 챗봇 허브 — 렌더링 & 필터 로직
// 챗봇 링크는 이 파일에 두지 않고 Firestore(bots)에서 불러옵니다.
// 보안 규칙상 승인된 회원만 읽을 수 있어 비회원은 소스 보기로도 링크를 볼 수 없습니다.
// 챗봇 추가·수정은 관리자 페이지(admin.html) > 챗봇 탭에서 합니다.
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, addDoc, serverTimestamp, increment }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db, SITE } from "../firebase-init.js";

// 기본 카테고리 (아이콘·순서용). 관리자 페이지에서 새 카테고리를 쓰면 탭이 자동으로 추가됩니다.
const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "christmas", label: "크리스마스 시즌" },
  { id: "chuseok", label: "추석 시즌" },
  { id: "copyright", label: "저작권 등록" },
  { id: "reaction", label: "상황·리액션" },
  { id: "greeting", label: "인사·축하" },
  { id: "emotion", label: "감정·일상" },
];

// 카테고리별 라인 아이콘 (이모지 대신 사용하는 일관된 SVG 아이콘 세트)
const CATEGORY_ICON = {
  copyright: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>`,
  reaction: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 01-8.5 8.5c-1.3 0-2.5-.3-3.6-.8L4 20l1-4.4A8.5 8.5 0 1121 11.5z"/></svg>`,
  greeting: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 15c1.2 1 2.6 1.5 4 1.5s2.8-.5 4-1.5"/></svg>`,
  emotion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-9.5-8.8C1 8 2.4 5 5.6 4.6 8 4.3 10 5.6 12 8c2-2.4 4-3.7 6.4-3.4C21.6 5 23 8 21.5 11.2 19 15.6 12 20 12 20z"/></svg>`,
  chuseok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1110.5 4a7 7 0 009.5 10.5z"/></svg>`,
  christmas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l5 7h-3l4 6H6l4-6H7l5-7z"/><line x1="12" y1="19" x2="12" y2="21"/></svg>`,
};

const TOOLS = [
  { title: "카카오 이모티콘 스튜디오",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4C6.5 4 2 7.6 2 12c0 2.6 1.6 4.9 4 6.3L5 22l4.3-2.3c.9.2 1.8.3 2.7.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z"/></svg>`,
    desc: "완성한 이모티콘을 카카오에 제안합니다.",
    url: "https://emoticonstudio.kakao.com/" },
  { title: "OGQ 크리에이터 스튜디오",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5.5-5.5a2 2 0 00-2.8 0L4 19"/></svg>`,
    desc: "완성한 스티커를 OGQ에 업로드·제안합니다.",
    url: "https://oid.ogq.me/?callbackUrl=https://creators.ogq.me/upload/sticker&serviceId=OCS" },
  { title: "이미지 분할기 (크롬 확장)",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><line x1="8.1" y1="7.5" x2="20" y2="19"/><line x1="8.1" y1="16.5" x2="20" y2="5"/></svg>`,
    desc: "여러 컷이 담긴 이미지를 낱장으로 자동 분할합니다.",
    url: "https://chromewebstore.google.com/detail/image-splitter/khkhfdckilojgneleiifofcaihjjohpi?utm_source=chatgpt.com" },
];

const LABEL_TO_ID = Object.fromEntries(CATEGORIES.map((c) => [c.label, c.id]));
const iconFor = (label) => CATEGORY_ICON[LABEL_TO_ID[label]] || CATEGORY_ICON.reaction;

// access: loading | guest | pending | rejected | suspended | noprofile | error | member
const state = { category: "all", query: "", access: "loading", profile: null };
let BOTS = []; // Firestore bots: { title, category, categoryOrder, order, url, description, badge, tags }
let tabs = [{ id: "all", label: "전체" }];

const externalLinkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>`;
const lockIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>`;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "#");

// ===== 회원 상태별 안내 =====
const LOGIN_URL = SITE.loginPage;
const SIGNUP_URL = `${SITE.loginPage}#signup`;
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
  const nav = document.getElementById("authNav");
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
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await logAccess("logout");
    await signOut(auth);
    location.reload();
  });
}

// ===== 챗봇 목록 =====
function buildTabs() {
  const order = new Map();
  BOTS.forEach((b) => order.set(b.category, Math.min(order.get(b.category) ?? Infinity, b.categoryOrder ?? 99)));
  tabs = [{ id: "all", label: "전체" },
    ...[...order.entries()].sort((a, b) => a[1] - b[1]).map(([label]) => ({ id: label, label }))];
}

function renderTabs() {
  const tabsEl = document.getElementById("tabs");
  if (state.access !== "member") { tabsEl.innerHTML = ""; return; }
  tabsEl.innerHTML = tabs.map((c) => {
    const count = c.id === "all" ? BOTS.length : BOTS.filter((b) => b.category === c.id).length;
    return `<button type="button" class="tab-btn${c.id === state.category ? " active" : ""}" role="tab" aria-selected="${c.id === state.category}" data-cat="${escapeHtml(c.id)}">${escapeHtml(c.label)} <span style="opacity:.7">${count}</span></button>`;
  }).join("");

  tabsEl.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.cat;
      renderTabs();
      renderGrid();
    });
  });
}

function renderGrid() {
  const grid = document.getElementById("botGrid");
  const empty = document.getElementById("emptyState");
  const countEl = document.getElementById("resultCount");

  if (state.access !== "member") {
    countEl.textContent = "";
    empty.classList.remove("show");
    grid.innerHTML = lockPanel();
    return;
  }

  const q = state.query.trim().toLowerCase();
  const filtered = BOTS.filter((b) => {
    const matchCat = state.category === "all" || b.category === state.category;
    const text = [b.title, b.description, ...(b.tags || [])].join(" ").toLowerCase();
    return matchCat && (!q || text.includes(q));
  });

  countEl.textContent = `${filtered.length}개`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.classList.add("show");
    return;
  }
  empty.classList.remove("show");

  grid.innerHTML = filtered
    .map(
      (b) => `
    <a class="bot-card" href="${escapeHtml(safeUrl(b.url))}" target="_blank" rel="noopener noreferrer">
      <span class="bot-icon" aria-hidden="true">${iconFor(b.category)}</span>
      <span class="bot-category">${escapeHtml(b.category)}${b.badge ? ` · ${escapeHtml(b.badge)}` : ""}</span>
      <h3 class="bot-title">${escapeHtml(b.title)}</h3>
      <p class="bot-desc">${escapeHtml(b.description)}</p>
      <span class="bot-open-btn">챗봇 열기 ${externalLinkIcon}</span>
    </a>`
    )
    .join("");
}

function renderTools() {
  const grid = document.getElementById("toolsGrid");
  grid.innerHTML = TOOLS.map(
    (t) => `
    <a class="tool-card" href="${t.url}" target="_blank" rel="noopener noreferrer">
      <span class="tool-icon" aria-hidden="true">${t.icon}</span>
      <h3>${escapeHtml(t.title)}</h3>
      <p>${escapeHtml(t.desc)}</p>
      <span class="btn tool-card-cta">바로가기 →</span>
    </a>`
  ).join("");
}

// 왼쪽 메뉴(드로어): 필터와 무관하게 전체 컨셉을 카테고리별로 항상 표시
function buildDrawerSection(label) {
  const items = BOTS.filter((b) => b.category === label);
  if (items.length === 0) return "";
  const links = items
    .map(
      (b) => `
    <li>
      <a class="drawer-link" href="${escapeHtml(safeUrl(b.url))}" target="_blank" rel="noopener noreferrer">
        <span class="drawer-link-icon" aria-hidden="true">${iconFor(b.category)}</span>
        <span class="drawer-link-text">${escapeHtml(b.title)}</span>
        <span class="drawer-external-icon" aria-hidden="true">${externalLinkIcon}</span>
      </a>
    </li>`
    )
    .join("");
  return `
  <div class="drawer-section">
    <h3 class="drawer-section-title">${escapeHtml(label)} <span class="drawer-count">${items.length}</span></h3>
    <ul class="drawer-list">${links}</ul>
  </div>`;
}

function renderDrawer() {
  const nav = document.getElementById("drawerNav");
  if (state.access !== "member") { nav.innerHTML = lockPanel(true); return; }

  // 저작권등록용 챗봇은 매 컨셉 제작마다 먼저 써야 하므로 왼쪽 메뉴 최상단에 고정
  const PINNED = "저작권 등록";
  const pinned = `<div class="drawer-pinned">${buildDrawerSection(PINNED)}</div>`;
  const rest = tabs.filter((c) => c.id !== "all" && c.label !== PINNED)
    .map((c) => buildDrawerSection(c.label))
    .join("");

  nav.innerHTML = pinned + rest;
}

function renderDrawerTools() {
  const list = document.getElementById("drawerTools");
  list.innerHTML = TOOLS.map(
    (t) => `<li><a href="${t.url}" target="_blank" rel="noopener noreferrer"><span class="drawer-tool-icon" aria-hidden="true">${t.icon}</span><span>${escapeHtml(t.title)}</span></a></li>`
  ).join("");
}

function renderAll() {
  renderAuthNav();
  renderTabs();
  renderGrid();
  renderDrawer();
}

function initDrawer() {
  const drawer = document.getElementById("sideDrawer");
  const overlay = document.getElementById("drawerOverlay");
  const toggleBtn = document.getElementById("menuToggle");
  const heroBtn = document.getElementById("heroMenuBtn");
  const closeBtn = document.getElementById("drawerClose");

  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("show");
    document.body.classList.add("no-scroll");
    toggleBtn.setAttribute("aria-expanded", "true");
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.classList.remove("show");
    document.body.classList.remove("no-scroll");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  toggleBtn.addEventListener("click", () => {
    drawer.classList.contains("open") ? closeDrawer() : openDrawer();
  });
  heroBtn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });

  // 데스크톱(사이드바 고정 표시)로 리사이즈되면 모바일 오버레이 상태를 정리
  const desktopQuery = window.matchMedia("(min-width: 900px)");
  desktopQuery.addEventListener("change", (e) => {
    if (e.matches) closeDrawer();
  });
}

function initSearch() {
  const input = document.getElementById("botSearch");
  input.addEventListener("input", () => {
    state.query = input.value;
    renderGrid();
  });

  document.getElementById("topSearchBtn").addEventListener("click", () => {
    document.getElementById("toolbar").scrollIntoView({ behavior: "smooth", block: "start" });
    input.focus();
  });
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

async function loadBots() {
  const snap = await getDocs(query(collection(db, "bots"), where("active", "==", true)));
  BOTS = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.categoryOrder ?? 99) - (b.categoryOrder ?? 99) || (a.order ?? 0) - (b.order ?? 0));
  buildTabs();
}

onAuthStateChanged(auth, async (user) => {
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
renderTools();
renderDrawerTools();
initSearch();
initDrawer();
