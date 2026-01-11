# Library Sanctum 📚

**Library Sanctum**은 고풍스러운 도서관의 분위기를 디지털 환경에 구현한 문서 관리 시스템입니다. 전통적인 서재의 평온함과 현대적인 Google Gemini AI의 지능을 결합하여 독창적인 독서 및 집필 경험을 제공합니다.

![Library Sanctum Screenshot](https://via.placeholder.com/1000x600/3e2b22/e3d5c3?text=Library+Sanctum+App+Screenshot)

## ✨ 주요 기능

*   **클래식한 UI/UX**: 나무 질감과 종이 색감을 활용하여 실제 도서관에 온 듯한 몰입감을 제공합니다.
*   **문서 트리 관리**:
    *   폴더 및 파일(Markdown, PDF) 구조 관리
    *   마우스 우클릭을 통한 파일 추가, 삭제, 이름 변경
    *   더블 클릭을 통한 직관적인 문서 열기
*   **문서 뷰어 및 에디터**:
    *   **Markdown**: 실시간 렌더링 및 수정 기능 제공
    *   **PDF**: 뷰어 시뮬레이션 및 메타데이터 표시
    *   수정 사항 즉시 반영
*   **AI 사서 (Google Gemini)**:
    *   **문서 요약**: 긴 문서를 AI가 빠르고 명확하게 요약해줍니다.
    *   **지식 탐색**: 사서 페르소나를 가진 AI에게 현재 읽고 있는 문서에 대해 질문하고 답변을 받을 수 있습니다.
*   **외부 자료 연동**:
    *   **Notion 가져오기**: 외부 Notion 페이지를 Markdown 문서로 변환하여 서재로 가져오는 시뮬레이션 기능을 제공합니다.

## 🛠 기술 스택

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **AI**: Google GenAI SDK (Gemini 3 Flash Preview)
*   **Icons**: Lucide React
*   **Rendering**: React Markdown

## 🚀 설치 및 실행 가이드

이 프로젝트를 로컬 개발 환경에서 실행하기 위한 상세 가이드입니다.

### 1. 사전 요구 사항 (Prerequisites)
*   **Node.js**: v16.0.0 이상 (v18+ 권장)
*   **npm**: Node.js 설치 시 함께 설치됩니다.

### 2. 저장소 클론 (Clone)
```bash
git clone https://github.com/yourusername/library-sanctum.git
cd library-sanctum
```

### 3. 패키지 설치 (Install Dependencies)
필요한 라이브러리를 설치합니다.
```bash
npm install
# 또는 yarn 사용 시
yarn install
```

### 4. API 키 설정 (Environment Setup)
Google AI Studio에서 발급받은 API 키가 필요합니다. 프로젝트 루트 디렉토리에 `.env` 파일을 생성하거나 환경 변수를 설정합니다.

**참고**: 번들러 설정(Webpack, Vite 등)에 따라 환경 변수 주입 방식이 다를 수 있습니다. (예: `REACT_APP_`, `VITE_` 접두사 필요)
코드 상에서는 `process.env.API_KEY`를 참조하고 있습니다.

### 5. 실행 (Run)
개발 서버를 시작합니다.
```bash
npm start
# 또는
npm run dev
```

브라우저 주소창에 `http://localhost:3000` (또는 터미널에 표시된 주소)를 입력하여 접속합니다.

### 6. 빌드 (Build)
배포를 위해 최적화된 프로덕션 빌드를 생성합니다. 이 과정에서 **TypeScript 타입 검사**가 함께 수행됩니다.
```bash
npm run build
```
빌드 결과물은 보통 `dist` 또는 `build` 디렉토리에 생성됩니다.

#### TypeScript 타입 검사만 실행 (Type Check)
빌드 없이 코드의 타입 오류만 확인하려면 다음 명령어를 사용하세요.
```bash
npx tsc --noEmit
```

## 📖 사용 방법

1.  **탐색**: 왼쪽 '서재(Bookshelf)' 사이드바에서 폴더를 열고 문서를 관리합니다. 문서를 **더블 클릭**하면 우측 '독서대(Reading Desk)'에서 열립니다.
2.  **편집**: 문서 뷰어 상단의 `수정` 버튼을 눌러 내용을 작성하고 `저장` 버튼으로 반영합니다.
3.  **AI 활용**: 우측 상단의 `AI 사서` 버튼을 클릭하여 사이드 패널을 엽니다. 문서 요약을 요청하거나 궁금한 점을 대화하듯 물어보세요.
4.  **자료 가져오기**: 사이드바 상단의 구름 아이콘(Notion)을 클릭하여 외부 자료를 가져오는 시뮬레이션을 체험할 수 있습니다.

## 📝 라이센스

이 프로젝트는 [MIT License](LICENSE)를 따릅니다.