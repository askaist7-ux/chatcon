// ChatCon 이모티콘 프롬프트 챗봇 허브 — 렌더링 & 필터 로직

const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "copyright", label: "저작권 등록" },
  { id: "reaction", label: "상황·리액션" },
  { id: "greeting", label: "인사·축하" },
  { id: "emotion", label: "감정·일상" },
  { id: "chuseok", label: "추석 시즌" },
  { id: "christmas", label: "크리스마스 시즌" },
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

// 사용자가 제공한 Gemini 챗봇 링크 전체
const BOTS = [
  { title: "이모티콘 저작권등록용 챗봇", cat: "copyright",
    desc: "캐릭터 방향별(좌·우·뒤) 이미지를 만들어 저작권 등록을 준비합니다.",
    url: "https://gemini.google.com/gem/1VRBuBcqy1i1EbOPdDRz3Da-dX0027DaP?usp=sharing" },

  { title: "어디가 1", cat: "reaction",
    desc: "260821 업데이트 · 상황 리액션 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1IrR5E_Urn8aGe9gCQV2nR_ibUNIn7d7-?usp=sharing" },
  { title: "어디가 2", cat: "reaction",
    desc: "260821 업데이트 · 상황 리액션 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1LFN6v-C6-8kuoQ3D-dEUuO795a0Zdpo0?usp=sharing" },
  { title: "ㅋㅋ 1 컨셉", cat: "reaction",
    desc: "웃음 리액션 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1gX5NwJomj4OArO2WUq3H3OLAbvsQsAV0?usp=sharing" },
  { title: "ㅋㅋ 2 컨셉", cat: "reaction",
    desc: "웃음 리액션 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1jQ_HrMZCVKGHOjX_FZBd3SDgmhvHnWnc?usp=sharing" },

  { title: "안녕 1 컨셉", cat: "greeting",
    desc: "인사 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/0636b65add23" },
  { title: "안녕 2 컨셉", cat: "greeting",
    desc: "인사 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/6b77266ab2c7" },
  { title: "OK 1 컨셉", cat: "greeting",
    desc: "긍정·수락 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/18k5mjkmG4JvomvixHpYPPCfIWYH7cViH?usp=sharing" },
  { title: "OK 2 컨셉", cat: "greeting",
    desc: "긍정·수락 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/fe4e575fd32f?usp=sharing" },
  { title: "축하 1 컨셉", cat: "greeting",
    desc: "축하 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/fda65d61c254?usp=sharing" },
  { title: "축하 2 컨셉", cat: "greeting",
    desc: "축하 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1NiiH0f_vXhr55gCnv0uyoEptg5JKU-2I?usp=sharing" },
  { title: "고마워 1 컨셉", cat: "greeting",
    desc: "감사 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1mPuolwmCwVX8Fdcwi-zzarZobK6nM4X8?usp=sharing" },
  { title: "고마워 2 컨셉", cat: "greeting",
    desc: "감사 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1LKgbJ_zxcR8KIy68b2aNaBeIHcQXkRuB?usp=sharing" },

  { title: "집중 컨셉", cat: "emotion",
    desc: "집중하는 모습의 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1iupMcbMq8iM0L1VeQ5DRWQUQFdb90TWA?usp=sharing" },
  { title: "좌절 컨셉", cat: "emotion",
    desc: "좌절 감정 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/8f2625174a86?usp=sharing" },
  { title: "공포 컨셉", cat: "emotion",
    desc: "공포 감정 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/8a0b6ee588ed?usp=sharing" },
  { title: "뭐해? 컨셉", cat: "emotion",
    desc: "궁금함·심심함을 표현하는 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/16vlu0F-jLmNncroeOlG30Vix4HqjAEtH?usp=sharing" },
  { title: "슬픔 컨셉", cat: "emotion",
    desc: "슬픔 감정 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1hCbgX0rBEWVZbTI3EEuHi-yubKAmBKBH?usp=sharing" },
  { title: "화이팅 컨셉", cat: "emotion",
    desc: "응원·화이팅 이모티콘 컨셉 챗봇 (장안선).",
    url: "https://gemini.google.com/gem/1Ag2_7tXT6BpStJHAxW8azvD3J9cj7TT3?usp=sharing" },
  { title: "피곤 컨셉", cat: "emotion",
    desc: "피곤함을 표현하는 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1dzhEo1E-yxgRrfhwER18v4s45YZV3zbV?usp=sharing" },
  { title: "사랑 컨셉", cat: "emotion",
    desc: "사랑 표현 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1f66vjRRhq2OSIrc9QhaOZNWA3vYc4_kD?usp=sharing" },
  { title: "감동 컨셉", cat: "emotion",
    desc: "감동 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1tL0bYg5O8A-OeyPQzZlhjFKFuGb_zVJn?usp=sharing" },
  { title: "열정 컨셉", cat: "emotion",
    desc: "열정 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1vbZrvgxD9OLFajacO8N3U5r3ThT9a65Q?usp=sharing" },
  { title: "출근 컨셉", cat: "emotion",
    desc: "출근 상황 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1ib_cIZucRe1oLWiTeZhrX3wn0oakeJMn?usp=sharing" },
  { title: "퇴근 컨셉", cat: "emotion",
    desc: "퇴근 상황 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1mXCO-Jlv_mPlrVBqAKaaBIR-uBmZzHJY?usp=sharing" },

  { title: "추석 컨셉 1", cat: "chuseok",
    desc: "추석 시즌 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1VoIZoa8_i4gEl_IHz4SiO1G1sWggaGcr?usp=sharing" },
  { title: "추석 컨셉 2", cat: "chuseok",
    desc: "추석 시즌 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1gGbevuDq6942GTubqmPhbxHdMXQMwdjd?usp=sharing" },
  { title: "추석 컨셉 3", cat: "chuseok",
    desc: "추석 시즌 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/18rBc3GhmLuGxD9RzJT2moiSNpkFRtRnd?usp=sharing" },
  { title: "추석 컨셉 4", cat: "chuseok",
    desc: "추석 시즌 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1GHOxtpok2_pWm0sSpUbRhKJVStWBGoOW?usp=sharing" },

  { title: "크리스마스 컨셉 1", cat: "christmas",
    desc: "크리스마스 시즌 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1pBXs6v74JvkYt9xPzAKovFd0FUaNd5zD?usp=sharing" },
  { title: "크리스마스 컨셉 2", cat: "christmas",
    desc: "크리스마스 시즌 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1MhgEf30UIbC3gh5nEkfnSP4S_jIISy19?usp=sharing" },
  { title: "크리스마스 컨셉 3", cat: "christmas",
    desc: "크리스마스 시즌 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1pqI0ur1f-fbJjaNEyOQ9K8sjPFnfyDDq?usp=sharing" },
  { title: "크리스마스 컨셉 4", cat: "christmas",
    desc: "크리스마스 시즌 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/17Z8nk_JeKSLKFDhBDrsBNbJIfS0PyG-N?usp=sharing" },
  { title: "크리스마스 컨셉 5", cat: "christmas",
    desc: "크리스마스 시즌 이모티콘 컨셉 챗봇.",
    url: "https://gemini.google.com/gem/1_CYIXaneTtGraOWBZ_9bGavkir5GCpBF?usp=sharing" },
];

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

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

const state = { category: "all", query: "" };

const externalLinkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>`;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTabs() {
  const tabsEl = document.getElementById("tabs");
  tabsEl.innerHTML = CATEGORIES.map((c) => {
    const count = c.id === "all" ? BOTS.length : BOTS.filter((b) => b.cat === c.id).length;
    return `<button type="button" class="tab-btn${c.id === state.category ? " active" : ""}" role="tab" aria-selected="${c.id === state.category}" data-cat="${c.id}">${c.label} <span style="opacity:.7">${count}</span></button>`;
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
  const q = state.query.trim().toLowerCase();

  const filtered = BOTS.filter((b) => {
    const matchCat = state.category === "all" || b.cat === state.category;
    const matchQuery = !q || b.title.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q);
    return matchCat && matchQuery;
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
    <a class="bot-card" href="${b.url}" target="_blank" rel="noopener noreferrer">
      <span class="bot-icon" aria-hidden="true">${CATEGORY_ICON[b.cat] || ""}</span>
      <span class="bot-category">${escapeHtml(CATEGORY_LABEL[b.cat] || "")}</span>
      <h3 class="bot-title">${escapeHtml(b.title)}</h3>
      <p class="bot-desc">${escapeHtml(b.desc)}</p>
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

// 왼쪽 메뉴(드로어): 필터와 무관하게 34개 컨셉 전체를 카테고리별로 항상 표시
function buildDrawerSection(c) {
  const items = BOTS.filter((b) => b.cat === c.id);
  if (items.length === 0) return "";
  const links = items
    .map(
      (b) => `
    <li>
      <a class="drawer-link" href="${b.url}" target="_blank" rel="noopener noreferrer">
        <span class="drawer-link-icon" aria-hidden="true">${CATEGORY_ICON[b.cat] || ""}</span>
        <span class="drawer-link-text">${escapeHtml(b.title)}</span>
        <span class="drawer-external-icon" aria-hidden="true">${externalLinkIcon}</span>
      </a>
    </li>`
    )
    .join("");
  return `
  <div class="drawer-section">
    <h3 class="drawer-section-title">${c.label} <span class="drawer-count">${items.length}</span></h3>
    <ul class="drawer-list">${links}</ul>
  </div>`;
}

function renderDrawer() {
  const nav = document.getElementById("drawerNav");

  // 저작권등록용 챗봇은 매 컨셉 제작마다 먼저 써야 하므로 왼쪽 메뉴 최상단에 고정
  const pinned = `<div class="drawer-pinned">${buildDrawerSection(CATEGORIES.find((c) => c.id === "copyright"))}</div>`;

  const rest = CATEGORIES.filter((c) => c.id !== "all" && c.id !== "copyright")
    .map(buildDrawerSection)
    .join("");

  nav.innerHTML = pinned + rest;
}

function renderDrawerTools() {
  const list = document.getElementById("drawerTools");
  list.innerHTML = TOOLS.map(
    (t) => `<li><a href="${t.url}" target="_blank" rel="noopener noreferrer"><span class="drawer-tool-icon" aria-hidden="true">${t.icon}</span><span>${escapeHtml(t.title)}</span></a></li>`
  ).join("");
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

document.addEventListener("DOMContentLoaded", () => {
  renderTabs();
  renderGrid();
  renderTools();
  renderDrawer();
  renderDrawerTools();
  initSearch();
  initDrawer();
});
