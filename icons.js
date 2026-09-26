// ChatCon 공용 아이콘 세트 (사이트 · 관리자 페이지 공통)
// 카테고리·도구 문서에는 아이콘 "키"만 저장하고, 실제 SVG 는 여기서 가져옵니다.
const svg = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const CATEGORY_ICONS = {
  copyright: { label: "방패(저작권)", svg: svg(`<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>`) },
  reaction:  { label: "말풍선(리액션)", svg: svg(`<path d="M21 11.5a8.5 8.5 0 01-8.5 8.5c-1.3 0-2.5-.3-3.6-.8L4 20l1-4.4A8.5 8.5 0 1121 11.5z"/>`) },
  greeting:  { label: "웃는 얼굴(인사)", svg: svg(`<circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 15c1.2 1 2.6 1.5 4 1.5s2.8-.5 4-1.5"/>`) },
  emotion:   { label: "하트(감정)", svg: svg(`<path d="M12 20s-7-4.4-9.5-8.8C1 8 2.4 5 5.6 4.6 8 4.3 10 5.6 12 8c2-2.4 4-3.7 6.4-3.4C21.6 5 23 8 21.5 11.2 19 15.6 12 20 12 20z"/>`) },
  chuseok:   { label: "달(추석)", svg: svg(`<path d="M20 14.5A8.5 8.5 0 1110.5 4a7 7 0 009.5 10.5z"/>`) },
  christmas: { label: "트리(크리스마스)", svg: svg(`<path d="M12 3l5 7h-3l4 6H6l4-6H7l5-7z"/><line x1="12" y1="19" x2="12" y2="21"/>`) },
  star:      { label: "별", svg: svg(`<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/>`) },
  gift:      { label: "선물", svg: svg(`<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8S10.5 3 8 3.5 7 8 12 8zm0 0s1.5-5 4-4.5S17 8 12 8z"/>`) },
  sparkle:   { label: "반짝임", svg: svg(`<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>`) },
  sun:       { label: "해(계절)", svg: svg(`<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>`) },
  paw:       { label: "발바닥(동물)", svg: svg(`<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="9" r="2"/><path d="M12 12c-3 0-6 3.5-6 6 0 1.7 1.5 2.5 3 2 1-.3 2-.8 3-.8s2 .5 3 .8c1.5.5 3-.3 3-2 0-2.5-3-6-6-6z"/>`) },
  cup:       { label: "컵(음식·일상)", svg: svg(`<path d="M4 8h13v5a6 6 0 01-6 6H10a6 6 0 01-6-6V8z"/><path d="M17 10h1.5a2.5 2.5 0 010 5H17M8 3v2M12 3v2"/>`) },
};

export const TOOL_ICONS = {
  kakao:  { label: "말풍선(카카오)", svg: svg(`<path d="M12 4C6.5 4 2 7.6 2 12c0 2.6 1.6 4.9 4 6.3L5 22l4.3-2.3c.9.2 1.8.3 2.7.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z"/>`) },
  image:  { label: "이미지(OGQ)", svg: svg(`<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5.5-5.5a2 2 0 00-2.8 0L4 19"/>`) },
  split:  { label: "가위(분할)", svg: svg(`<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><line x1="8.1" y1="7.5" x2="20" y2="19"/><line x1="8.1" y1="16.5" x2="20" y2="5"/>`) },
  shop:   { label: "쇼핑백(샵)", svg: svg(`<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>`) },
  market: { label: "상점(마켓)", svg: svg(`<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"/><path d="M5 12v8h14v-8M10 20v-5h4v5"/>`) },
  remote: { label: "모니터(원격)", svg: svg(`<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M9 10.5l2 2 4-4"/>`) },
  link:   { label: "링크", svg: svg(`<path d="M10 14a5 5 0 007.1 0l3-3a5 5 0 00-7.1-7.1l-1 1"/><path d="M14 10a5 5 0 00-7.1 0l-3 3a5 5 0 007.1 7.1l1-1"/>`) },
};

export const categoryIcon = (key) => (CATEGORY_ICONS[key] || CATEGORY_ICONS.reaction).svg;
export const toolIcon = (key) => (TOOL_ICONS[key] || TOOL_ICONS.link).svg;
