# OTL Plus MCP Server

MCP (Model Context Protocol) 서버로 OTL Plus의 과목 정보를 조회하고 과목 추천 기능을 제공합니다.

## 기능

이 MCP 서버는 다음과 같은 읽기 전용 도구들을 제공합니다:

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

### Claude에서 사용 예시

```
"컴퓨터공학과에서 과제가 적고 평가가 좋은 과목 5개 추천해줘"
```

Claude가 `recommend_courses` 도구를 사용하여 다음과 같이 호출합니다:
```json
{
  "criteria": "low_load",
  "department": 1,
  "limit": 5
}
```

## API 엔드포인트

기본적으로 `https://otl.sparcs.org` API를 사용합니다.

## 라이선스

MIT
