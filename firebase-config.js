// ▼ Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹) 에서 복사한 값으로 교체하세요.
//   (이 값은 공개되어도 괜찮습니다. 보안은 firestore.rules 가 담당합니다.)
export const firebaseConfig = {
  apiKey: "AIzaSyBnu1u8QqMks5sDvAsM7Mwl9ouWAED79wI",
  authDomain: "chatcon-cd997.firebaseapp.com",
  projectId: "chatcon-cd997",
  storageBucket: "chatcon-cd997.firebasestorage.app",
  messagingSenderId: "196165677931",
  appId: "1:196165677931:web:c5ec1f17366240008b122e",
  measurementId: "G-4ZZCP5E8FE"
};

// 사이트 경로 설정 (GitHub Pages: https://askaist7-ux.github.io/chatcon/)
export const SITE = {
  name: "ChatCon 이모티콘 프롬프트 챗봇 허브",
  loginPage: "login.html",
  homePage: "index.html#main",
  adminPage: "admin.html",
  // 로컬 테스트 시 에뮬레이터 사용 (true 로 바꾸면 localhost:9099 / 8080 연결)
  useEmulator: false
};
