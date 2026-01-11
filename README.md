# Library Sanctum 📚

**Library Sanctum**은 고풍스러운 도서관의 분위기를 디지털 환경에 구현한 풀스택 문서 관리 시스템입니다. 전통적인 서재의 평온함과 현대적인 Google Gemini AI의 지능을 결합하여 독창적인 독서 및 집필 경험을 제공합니다.

<img width="1915" height="904" alt="Library Sanctum Main View" src="https://github.com/user-attachments/assets/e1cca0d6-824f-4971-8899-a351f001a673" />

## ✨ 주요 기능

*   **클래식한 UI/UX**: 나무 질감과 종이 색감을 활용하여 실제 도서관에 온 듯한 몰입감을 제공합니다.
*   **영구 저장소 (SQLite)**:
    *   Node.js 백엔드와 SQLite DB를 연동하여 파일 트리 구조와 문서 내용을 영구적으로 저장합니다.
*   **지능형 문서 트리 관리**:
    *   **드래그 앤 드롭**: 트리 내에서 파일/폴더 이동은 물론, 데스크탑의 파일을 브라우저로 끌어다 놓아 즉시 업로드할 수 있습니다.
    *   **중복 방지**: 동일한 폴더 내에 중복된 파일명이 생기지 않도록 실시간으로 검사하고 경고합니다.
    *   더블 클릭을 통한 문서 열기 및 우클릭/메뉴를 통한 관리 기능을 제공합니다.
*   **강력한 문서 에디터**:
    *   **Markdown**: 실시간 렌더링 및 편집 기능을 제공합니다.
    *   **미리보기 모드**: 편집 중 실시간으로 렌더링된 결과를 확인할 수 있는 토글 기능을 지원합니다.
*   **AI 사서 (Google Gemini 1.5 Flash)**:
    *   **문서 요약**: 긴 문서의 핵심 내용을 사서가 친절하게 요약해줍니다.
    *   **지식 탐색**: 현재 읽고 있는 문서의 맥락을 이해하는 AI 사서와 대화하며 궁금한 점을 해결할 수 있습니다.
*   **실제 데이터 연동**:
    *   **Notion API 통합**: 사용자의 Notion Integration Token을 통해 실제 Notion 페이지 목록을 조회하고, 내용을 Markdown으로 변환하여 서재로 이관합니다.

## 🛠 기술 스택

### Frontend
- **Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS
- **Markdown**: React Markdown
- **Icons**: Lucide React
- **Build Tool**: Vite

### Backend & Database
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express
- **Database**: SQLite3
- **AI SDK**: @google/generative-ai (Gemini 1.5 Flash)

## 🚀 설치 및 실행 가이드

### 1. 사전 요구 사항
- **Node.js**: v18.0.0 이상 권장
- **npm**: Node.js와 함께 설치됩니다.

### 2. 설치 및 설정
```bash
# 저장소 클론
git clone https://github.com/yourusername/library-sanctum.git
cd library-sanctum

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
echo "VITE_GEMINI_API_KEY=your_gemini_api_key_here" > .env
```
*참고: Google API 키는 [Google AI Studio](https://aistudio.google.com/)에서 무료로 발급받을 수 있습니다.*

### 3. 실행
하나의 명령어로 백엔드 서버(Port 3001)와 프론트엔드(Port 3000)를 동시에 실행합니다.
```bash
npm start
```
*내부적으로 `concurrently`를 사용하여 두 서버를 동시 실행하며, Vite Proxy가 API 요청을 자동으로 연결합니다.*

## 📖 사용 방법

1.  **문서 관리**: 사이드바에서 `+` 버튼으로 새 폴더나 문서를 만드세요. 파일을 드래그하여 다른 폴더로 옮기거나, PC의 파일을 브라우저 트리 위로 드롭하여 업로드할 수 있습니다.
2.  **독서 및 편집**: 문서를 더블 클릭하여 독서대(Main Area)에 올립니다. `수정` 버튼을 눌러 내용을 고치고, `미리보기` 버튼으로 결과물을 확인한 후 `저장`하세요.
3.  **AI 상담**: 우측 상단의 `AI 사서` 버튼을 눌러 사이드 패널을 엽니다. 문서 요약을 요청하거나 대화를 나눠보세요.
4.  **외부 연동**: 사이드바 상단의 구름 아이콘을 클릭하고 Notion API Key를 입력하여 외부 문서를 서재로 가져오세요.

## 📝 라이센스

이 프로젝트는 [MIT License](LICENSE)를 따릅니다.