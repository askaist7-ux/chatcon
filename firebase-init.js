import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, SITE } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "ko";
export const db = getFirestore(app);

if (SITE.useEmulator) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
}
setPersistence(auth, browserLocalPersistence).catch(() => {});

export { SITE };

// 공용: 오류 메시지 한글화
export function koError(e) {
  const m = {
    "auth/email-already-in-use": "이미 가입된 이메일입니다. 로그인해 주세요.",
    "auth/invalid-email": "이메일 형식이 올바르지 않습니다.",
    "auth/weak-password": "비밀번호는 8자 이상으로 입력해 주세요.",
    "auth/user-not-found": "가입되지 않은 이메일입니다.",
    "auth/wrong-password": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "auth/too-many-requests": "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    "auth/user-disabled": "이용이 정지된 계정입니다. 관리자에게 문의해 주세요.",
    "auth/network-request-failed": "네트워크 연결을 확인해 주세요.",
    "permission-denied": "권한이 없습니다.",
  };
  return m[e?.code] || e?.message || "알 수 없는 오류가 발생했습니다.";
}
