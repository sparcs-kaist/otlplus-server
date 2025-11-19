# OTL Plus MCP Server

MCP (Model Context Protocol) 서버로 OTL Plus의 과목 정보를 조회하고 과목 추천 기능을 제공합니다.

## 기능

이 MCP 서버는 다음과 같은 도구들을 제공합니다:

### 공개 도구 (인증 불필요)

### 1. `search_courses`
- 다양한 필터를 사용하여 과목을 검색합니다
- 파라미터:
  - `keyword` (string, optional): 과목명 또는 과목 코드 검색어
  - `department` (number, optional): 학과 ID
  - `type` (string, optional): 과목 유형 (예: "전공필수", "전공선택", "교양")
  - `limit` (number, optional): 결과 개수 제한 (기본값: 20)

### 2. `get_course_details`
- 특정 과목의 상세 정보를 조회합니다
- 파라미터:
  - `course_id` (number, required): 조회할 과목의 ID

### 3. `search_lectures`
- 다양한 필터를 사용하여 강의를 검색합니다
- 파라미터:
  - `keyword` (string, optional): 강의명 또는 강의 코드 검색어
  - `year` (number, optional): 학년도 (예: 2024)
  - `semester` (number, optional): 학기 (1: 봄, 2: 여름, 3: 가을, 4: 겨울)
  - `department` (number, optional): 학과 ID
  - `limit` (number, optional): 결과 개수 제한 (기본값: 20)

### 4. `get_lecture_details`
- 특정 강의의 상세 정보를 조회합니다
- 파라미터:
  - `lecture_id` (number, required): 조회할 강의의 ID

### 5. `get_course_reviews`
- 특정 과목의 리뷰를 조회합니다
- 파라미터:
  - `course_id` (number, required): 조회할 과목의 ID
  - `limit` (number, optional): 결과 개수 제한 (기본값: 10)

### 6. `get_lecture_reviews`
- 특정 강의의 리뷰를 조회합니다
- 파라미터:
  - `lecture_id` (number, required): 조회할 강의의 ID
  - `limit` (number, optional): 결과 개수 제한 (기본값: 10)

### 7. `recommend_courses` (핵심 기능)
- 다양한 기준에 따라 과목을 추천합니다
- 파라미터:
  - `criteria` (string, optional): 추천 기준
    - `high_rating`: 종합 평가가 높은 과목 (기본값)
    - `easy_grade`: 학점을 받기 쉬운 과목
    - `low_load`: 과제가 적은 과목
    - `good_teaching`: 강의 품질이 좋은 과목
  - `department` (number, optional): 학과 필터
  - `type` (string, optional): 과목 유형 필터
  - `limit` (number, optional): 추천 개수 (기본값: 10)

### 인증 도구 (개인 데이터 접근용)

### 8. `set_api_key`
- API 인증 토큰을 설정합니다
- **OTL Plus 로그인 후 발급받은 JWT 액세스 토큰을 사용하세요**
- 파라미터:
  - `access_token` (string, required): OTL Plus에서 발급받은 JWT 액세스 토큰

### 9. `get_user_profile`
- 현재 인증된 사용자의 프로필 정보를 조회합니다
- **사전 요구사항**: `set_api_key`로 인증 필요
- 파라미터: 없음

### 10. `get_my_taken_courses`
- 내가 수강한 모든 과목을 조회합니다
- **사전 요구사항**: `set_api_key`로 인증 필요
- 파라미터:
  - `limit` (number, optional): 결과 개수 제한

### 11. `get_taken_lectures_by_semester`
- 특정 학기에 수강한 강의 목록을 조회합니다
- **사전 요구사항**: `set_api_key`로 인증 필요
- 파라미터:
  - `year` (number, required): 학년도 (예: 2024)
  - `semester` (number, required): 학기 (1: 봄, 2: 여름, 3: 가을, 4: 겨울)

## 설치

```bash
cd apps/mcp-server
npm install
npm run build
```

## 사용 방법

### Claude Desktop에서 사용

Claude Desktop의 설정 파일에 다음과 같이 추가하세요:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### 기본 설정 (공개 기능만 사용)
```json
{
  "mcpServers": {
    "otlplus": {
      "command": "node",
      "args": [
        "/absolute/path/to/otlplus-server/apps/mcp-server/dist/index.js"
      ]
    }
  }
}
```

#### 인증 토큰과 함께 사용 (개인 데이터 접근)
```json
{
  "mcpServers": {
    "otlplus": {
      "command": "node",
      "args": [
        "/absolute/path/to/otlplus-server/apps/mcp-server/dist/index.js"
      ],
      "env": {
        "OTL_ACCESS_TOKEN": "your_jwt_access_token_here"
      }
    }
  }
}
```

**API 토큰 발급 방법:**

### 방법 1: API Key 발급 (권장)

1. OTL Plus에 로그인한 상태에서 다음 명령어 실행:
```bash
curl -X POST https://otl.sparcs.org/session/api-keys \
  -H "Cookie: accessToken=YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My MCP Server"}'
```

2. 응답에서 `key` 값을 복사
3. 위 설정의 `your_jwt_access_token_here` 부분에 API Key 붙여넣기

### 방법 2: 액세스 토큰 사용 (임시)

1. OTL Plus 웹사이트(https://otl.sparcs.org)에 로그인
2. 브라우저 개발자 도구를 열고 (F12)
3. Application/Storage > Cookies > https://otl.sparcs.org
4. `accessToken` 쿠키 값을 복사
5. 위 설정의 `your_jwt_access_token_here` 부분에 붙여넣기

**참고:** API Key는 만료되지 않고 관리가 용이하므로 MCP 서버에는 API Key 사용을 권장합니다.

### API Key 관리

발급받은 API Key 목록 조회:
```bash
GET /session/api-keys
```

API Key 비활성화:
```bash
POST /session/api-keys/{keyId}/revoke
```

API Key 삭제:
```bash
DELETE /session/api-keys/{keyId}
```

또는 Claude와 대화 중에 `set_api_key` 도구를 사용하여 토큰을 설정할 수도 있습니다.

### 직접 실행

```bash
npm start
```

## 개발

### 빌드

```bash
npm run build
```

### Watch 모드

```bash
npm run watch
```

## 예제

### 공개 기능 사용 예시

**과목 추천:**
```
"컴퓨터공학과에서 과제가 적고 평가가 좋은 과목 5개 추천해줘"
```
Claude가 `recommend_courses` 도구를 사용합니다.

**과목 검색:**
```
"데이터베이스 관련 과목을 찾아줘"
```
Claude가 `search_courses` 도구를 사용합니다.

### 인증 기능 사용 예시

**1. API 키 설정:**
```
"내 액세스 토큰은 eyJhbGc... 이야. 이걸로 인증해줘"
```
Claude가 `set_api_key` 도구를 사용합니다.

**2. 내 수강 이력 조회:**
```
"내가 들은 과목들 보여줘"
```
Claude가 `get_my_taken_courses` 도구를 사용합니다.

**3. 특정 학기 수강 이력 조회:**
```
"2024년 1학기에 내가 들은 강의 목록 보여줘"
```
Claude가 `get_taken_lectures_by_semester` 도구를 사용합니다.

**4. 프로필 조회:**
```
"내 프로필 정보 알려줘"
```
Claude가 `get_user_profile` 도구를 사용합니다.

## API 엔드포인트

기본적으로 `https://otl.sparcs.org` API를 사용합니다.

환경 변수 `OTL_BASE_URL`로 다른 서버를 지정할 수 있습니다.

## 라이선스

MIT
