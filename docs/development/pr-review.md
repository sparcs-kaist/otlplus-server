# PR 자동 리뷰

[공식 Codex GitHub Action 예제](https://learn.chatgpt.com/docs/github-action)의
checkout → Codex 실행 → 별도 작업에서 PR 댓글 게시 구조를 사용한다.

- 모델: `gpt-6.1-terra`
- API: `https://codex-lb.sparcs.org/backend-api/codex/responses`
- GitHub Secret: `CODEX_LB_API_KEY` (키만 저장, `Bearer ` 제외)
- 액션은 커밋 SHA, Codex CLI는 0.167.0으로 고정한다.

`responses-api-endpoint`는 완전한 Responses URL이다. `/v1`을 추가하지 않는다.
개인 `config.toml`, TUI, 웹 검색, WebSocket 설정은 필요 없다.

merge 커밋과 히스토리를 받은 뒤 base 커밋으로 전환해 신뢰할 수 있는 설정으로 실행한다.
기본 `drop-sudo`가 DBus 소켓 접근 제한 중 실패했으므로 공식 지원 옵션인
`unprivileged-user`를 사용한다. 전용 계정을 만들고 checkout 읽기 권한만 부여하며,
`:read-only` 실행 제한을 유지한다. 이 단계는 해당 runner 오류를 피하기 위해 필요하다.

동일 레포의 일반 PR만 검토한다. 리뷰 작업은 저장소 읽기 권한만 가지며,
댓글 게시 권한은 별도 작업에만 부여한다. 결과는 한국어 요약 댓글로 남긴다.

YAML과 액션 입력을 로컬 검증했다. GitHub runner 실행 및 실제 API 연결은 재확인이 필요하다.
