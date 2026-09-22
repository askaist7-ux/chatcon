ChatCon AI ACADEMY 이모티콘 프롬프트 챗봇 사이트 구축지침서

1. 목적

정규반 선생님이 저작권 등록용 캐릭터 시트, 일상·감정·시즌별 이모티콘 프롬프트 챗봇, 이미지 분할 및 심사 준비 도구에 빠르게 접근하는 비공개 포털을 구축한다.

외부 홍보용 랜딩페이지가 아니라 실제 챗봇 실행과 제작 흐름 확인이 중심인 작업형 포털로 구성한다.

2. 접근 원칙

대상: ChatCon AI ACADEMY 정규반 선생님

용도: 이모티콘 제작과 수익화 실습

외부 노출, 링크 재배포, 화면 공유 금지

사이트 배포 권한은 비공개로 유지

첫 방문 시 비밀유지 안내와 동의 확인창 표시

화면 동의는 법적 인증이나 실제 로그인 기능이 아니므로 호스팅 접근 제어를 반드시 병행

검색엔진 색인 방지를 위해 noindex, nofollow, noarchive 적용

3. 디자인 근거

Figma 참조 파일의 main-pc 프레임에서 다음 구조를 반영한다.

흰색의 얇고 고정된 헤더

넓은 히어로 영역

진한 블루의 가로형 빠른 메뉴

연한 블루·그레이 페이지 배경

둥근 흰색 카드와 부드러운 그림자

정보 밀도가 높은 포털형 다단 그리드

모바일에서 메뉴 축소와 카드 단일 열 전환

원본 금융기관의 로고, 상품 문구, 캐릭터, 아이콘은 복제하지 않는다. ChatCon의 로고와 교육·제작 콘텐츠만 사용한다.

4. 디자인 토큰

토큰

값

용도

--brand-navy

#071A33

제목, 푸터, 프롬프트 영역

--brand-blue

#0B63CE

주 버튼, 탭, 링크

--brand-cobalt

#246BFD

강조와 포커스

--brand-violet

#784DFF

시즌 챗봇

--brand-cyan

#22B8E6

감정 챗봇

--brand-gold

#D8B56A

저작권·프리미엄 강조

--surface-page

#EAF1F7

포털 배경

--surface-soft

#F6F9FC

검색·보조 배경

--text

#10243E

본문과 제목

--muted

#52657A

설명 문구

--border

#DCE5EE

카드와 구분선

권장 글꼴은 Pretendard이며, 대체 글꼴은 Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic 순으로 적용한다. 본문은 16px 이상을 원칙으로 한다.

5. 5개 대메뉴와 각 7개 소메뉴

대메뉴

소메뉴 7개

챗봇 시작하기

빠른 시작, 전체 챗봇, 저작권 등록, 기본 프롬프트, 제작 워크플로, 이미지 분할, 규격·심사 준비

일상 대화

뭐해?, 어디가?, 안녕, OK, ㅋㅋ, 축하, 고마워

감정 표현

사랑해, 감동, 열정, 집중, 좌절, 슬픔, 공포

생활·응원

화이팅, 피곤, 출근, 퇴근, 인사 반응, 직장 생활, 전체 검색

시즌 스페셜

추석 1, 추석 2, 추석 3, 추석 4, 크리스마스 1, 크리스마스 2, 크리스마스 3·4·5

6. 페이지 구조

사이트
├─ 고정 헤더
│  ├─ ChatCon 로고
│  ├─ 정규반 전용 상태
│  └─ 5×7 전체 메뉴
├─ 히어로
│  ├─ 사이트 목적
│  ├─ 전체 챗봇·제작 방법 CTA
│  └─ 챗봇 수·시트 규격 요약
├─ 빠른 분류 탭
│  └─ 전체·저작권·일상·감정·시즌·제작 도구
├─ 챗봇 포털
│  ├─ 검색
│  ├─ 분류 필터
│  └─ Gemini 실행 카드
├─ 승인 준비 워크플로
├─ 4×8 기본 프롬프트
├─ 제작 도구·공식 가이드
├─ 비밀유지 안내
└─ 푸터
   ├─ 대표 : 장안선
   ├─ 010-2627-3771
   └─ e_iiias@naver.com

7. 챗봇 데이터 구성

챗봇 링크는 dist/app.js의 bots 배열에서 관리한다. 각 항목은 다음 필드를 가진다.

{
  title: '화이팅',
  category: '감정',
  tag: '응원',
  desc: '힘을 북돋는 응원 동작과 멘트를 만듭니다.',
  url: 'Gemini Gem 공유 링크'
}

분류는 저작권, 일상, 감정, 시즌 네 종류로 통일한다. 신규 링크 추가 시 URL 전체를 그대로 넣고 새 창 열기와 noopener noreferrer를 유지한다.

7.1 운영 링크 원본

분류

챗봇

연결 주소

저작권

이모티콘 저작권 등록용

https://gemini.google.com/gem/1VRBuBcqy1i1EbOPdDRz3Da-dX0027DaP?usp=sharing

일상

어디가 1

https://gemini.google.com/gem/1IrR5E_Urn8aGe9gCQV2nR_ibUNIn7d7-?usp=sharing

일상

어디가 2

https://gemini.google.com/gem/1LFN6v-C6-8kuoQ3D-dEUuO795a0Zdpo0?usp=sharing

일상

ㅋㅋ 1

https://gemini.google.com/gem/1gX5NwJomj4OArO2WUq3H3OLAbvsQsAV0?usp=sharing

일상

ㅋㅋ 2

https://gemini.google.com/gem/1jQ_HrMZCVKGHOjX_FZBd3SDgmhvHnWnc?usp=sharing

일상

안녕 1

https://gemini.google.com/gem/0636b65add23

일상

안녕 2

https://gemini.google.com/gem/6b77266ab2c7

일상

OK 1

https://gemini.google.com/gem/18k5mjkmG4JvomvixHpYPPCfIWYH7cViH?usp=sharing

일상

OK 2

https://gemini.google.com/gem/fe4e575fd32f?usp=sharing

일상

축하 1

https://gemini.google.com/gem/fda65d61c254?usp=sharing

일상

축하 2

https://gemini.google.com/gem/1NiiH0f_vXhr55gCnv0uyoEptg5JKU-2I?usp=sharing

일상

고마워 1

https://gemini.google.com/gem/1mPuolwmCwVX8Fdcwi-zzarZobK6nM4X8?usp=sharing

일상

고마워 2

https://gemini.google.com/gem/1LKgbJ_zxcR8KIy68b2aNaBeIHcQXkRuB?usp=sharing

일상

뭐해?

https://gemini.google.com/gem/16vlu0F-jLmNncroeOlG30Vix4HqjAEtH?usp=sharing

일상

피곤

https://gemini.google.com/gem/1dzhEo1E-yxgRrfhwER18v4s45YZV3zbV?usp=sharing

일상

출근

https://gemini.google.com/gem/1ib_cIZucRe1oLWiTeZhrX3wn0oakeJMn?usp=sharing

일상

퇴근

https://gemini.google.com/gem/1mXCO-Jlv_mPlrVBqAKaaBIR-uBmZzHJY?usp=sharing

감정

집중

https://gemini.google.com/gem/1iupMcbMq8iM0L1VeQ5DRWQUQFdb90TWA?usp=sharing

감정

좌절

https://gemini.google.com/gem/8f2625174a86?usp=sharing

감정

공포

https://gemini.google.com/gem/8a0b6ee588ed?usp=sharing

감정

슬픔

https://gemini.google.com/gem/1hCbgX0rBEWVZbTI3EEuHi-yubKAmBKBH?usp=sharing

감정

화이팅

https://gemini.google.com/gem/1Ag2_7tXT6BpStJHAxW8azvD3J9cj7TT3?usp=sharing

감정

사랑해

https://gemini.google.com/gem/1f66vjRRhq2OSIrc9QhaOZNWA3vYc4_kD?usp=sharing

감정

감동

https://gemini.google.com/gem/1tL0bYg5O8A-OeyPQzZlhjFKFuGb_zVJn?usp=sharing

감정

열정

https://gemini.google.com/gem/1vbZrvgxD9OLFajacO8N3U5r3ThT9a65Q?usp=sharing

시즌

추석 1

https://gemini.google.com/gem/1VoIZoa8_i4gEl_IHz4SiO1G1sWggaGcr?usp=sharing

시즌

추석 2

https://gemini.google.com/gem/1gGbevuDq6942GTubqmPhbxHdMXQMwdjd?usp=sharing

시즌

추석 3

https://gemini.google.com/gem/18rBc3GhmLuGxD9RzJT2moiSNpkFRtRnd?usp=sharing

시즌

추석 4

https://gemini.google.com/gem/1GHOxtpok2_pWm0sSpUbRhKJVStWBGoOW?usp=sharing

시즌

크리스마스 1

https://gemini.google.com/gem/1pBXs6v74JvkYt9xPzAKovFd0FUaNd5zD?usp=sharing

시즌

크리스마스 2

https://gemini.google.com/gem/1MhgEf30UIbC3gh5nEkfnSP4S_jIISy19?usp=sharing

시즌

크리스마스 3

https://gemini.google.com/gem/1pqI0ur1f-fbJjaNEyOQ9K8sjPFnfyDDq?usp=sharing

시즌

크리스마스 4

https://gemini.google.com/gem/17Z8nk_JeKSLKFDhBDrsBNbJIfS0PyG-N?usp=sharing

시즌

크리스마스 5

https://gemini.google.com/gem/1_CYIXaneTtGraOWBZ_9bGavkir5GCpBF?usp=sharing

7.2 제출·제작 도구 링크

용도

주소

카카오 제안하기

https://emoticonstudio.kakao.com/

OGQ 제안하기

https://oid.ogq.me/?callbackUrl=https://creators.ogq.me/upload/sticker&serviceId=OCS

이미지 분할기

https://chromewebstore.google.com/detail/image-splitter/khkhfdckilojgneleiifofcaihjjohpi?utm_source=chatgpt.com

8. 기본 제작 흐름

이모티콘 컨셉을 선정한다.

저작권 등록용 챗봇에서 캐릭터의 정면·측면·후면을 포함한 기본 시트를 만든다.

기본 이미지를 사랑, 피곤, 화이팅 등 원하는 컨셉 챗봇에 첨부한다.

이미지 생성 버튼을 눌러 4열×8행 결과를 내려받는다.

이미지 분할기에서 행과 열을 지정하고 Lock Aspect Ratio를 해제한 뒤 분할한다.

각 이미지를 1000px 이상으로 스케일업하고 배경을 제거한다.

카카오·OGQ 등 제출 플랫폼의 최신 크기, 확장자, 용량 기준으로 조정한다.

원본 파일과 제출 파일을 별도 보관하고 외부에 공개하지 않는다.

심사 기간은 고정된 기간으로 단정하지 않고 플랫폼 정책과 접수 상황에 따라 달라질 수 있음을 안내한다.

9. 기본 프롬프트

고딕체가 아닌 동글동글한 폰트를 사용하고, 멘트는 검정색으로 넣어 이미지를 만들어 주세요. Columns 4, Rows 8로 구성하고 각 컨셉 칸은 정확한 정사각형으로 제작해 주세요. 칸 사이는 자르기 쉽도록 1픽셀 라인을 넣어 주세요.

10. 반응형 기준

981px 이상: 5개 대메뉴 가로 노출, 챗봇 3열, 워크플로 3열

641~980px: 햄버거 메뉴, 챗봇 2열, 워크플로 2열

640px 이하: 챗봇·워크플로 1열, CTA 세로 배치, 모바일 20px 여백

모든 화면에서 가로 스크롤과 텍스트 잘림이 발생하지 않도록 한다.

키보드 포커스, 건너뛰기 링크, 상태 안내를 제공한다.

prefers-reduced-motion 환경에서는 전환 효과를 제거한다.

11. 파일 구조

chatcon-emoticon-lab/
├─ .openai/
│  └─ hosting.json
├─ dist/
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  └─ assets/
│     └─ ChatCon_logo_transparent_1px.png
├─ docs/
│  ├─ ChatCon_AI_ACADEMY_웹사이트_전체_브랜딩_지침서.md
│  └─ ChatCon_이모티콘_챗봇_사이트_구축지침서.md
└─ README.md

12. 유지보수 체크리스트

Gemini 링크가 열리는지 정기 확인

플랫폼 규격은 반드시 공식 가이드의 최신 내용으로 확인

신규 챗봇 추가 시 검색 키워드와 분류도 함께 입력

로고 비율을 임의로 변경하지 않음

외부 공개 배포로 접근 권한을 바꾸지 않음

토큰, API 키, 개인 인증정보를 HTML·CSS·JavaScript에 넣지 않음

모바일 360px, 태블릿 768px, 데스크톱 1440px에서 확인

13. 보안 메모

사용자가 제공한 Figma 개인 토큰은 사이트 파일, 문서, Git 기록, 브라우저 코드에 저장하지 않는다. 피그마 디자인은 인증된 플러그인 연결을 통해 읽으며 토큰 문자열은 결과물에 포함하지 않는다.

14. MCP 구성 판단

이 사이트의 운영 기능은 정적 HTML·CSS·JavaScript와 외부 HTTPS 링크만 사용하므로 별도 MCP 서버가 필요하지 않다. 브라우저에 MCP 또는 개인 토큰을 넣으면 인증정보가 노출될 수 있으므로 금지한다.

디자인 단계: 인증된 Figma 연결로 디자인 프레임과 토큰만 조회한다.

운영 단계: 각 버튼은 Gemini Gem, 카카오, OGQ, 크롬 웹스토어로 직접 연결한다.

비공개 운영: 화면의 비밀유지 동의창은 실제 인증이 아니므로 배포 서비스에서 로그인·허용 사용자·비공개 공유 기능을 별도로 사용한다.

향후 회원별 접근 기록, 권한 관리, 챗봇 상태 점검 자동화가 필요할 때만 서버 기능 또는 MCP 도입을 별도 검토한다.