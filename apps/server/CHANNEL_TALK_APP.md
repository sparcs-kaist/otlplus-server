# ChannelTalk OTL ALF App

이 서버는 ChannelTalk Function Endpoint와 ALF 추천용 Command Extension을 제공합니다.

서버는 CommonJS로 빌드되지만 SDK 0.22.0은 ESM 전용이므로 Function endpoint는 공식 wire protocol과
schema를 따르는 호환 구현을 사용합니다. AppStore 등록은 공식 SDK의 `NativeFunctionClient`를 사용합니다.

## 제공 Function

| Function | 용도 |
| --- | --- |
| `extension.core.function.getFunctions` | Function 및 JSON Schema discovery |
| `extension.command.metadata.getCommands` | ALF Command metadata discovery |
| `otl.course.search` | 과목명, 코드, 학과, 교수 기반 과목 검색 |
| `otl.course.reviews` | OTL 과목 ID 기반 최신 후기 조회 |

Command 입력은 ChannelTalk Command Action 계약에 따라 `params.input`에 전달됩니다.

```json
{
  "method": "otl.course.search",
  "params": { "input": { "keyword": "프로그래밍", "limit": 5 } },
  "context": {},
  "systemVersion": "v1"
}
```

```json
{
  "method": "otl.course.reviews",
  "params": { "input": { "courseId": 101, "limit": 5 } },
  "context": {},
  "systemVersion": "v1"
}
```

두 Command 모두 `alfMode: recommend`로 노출됩니다. 후기 조회의 `courseId`는 과목 검색 결과에 표시되는
`과목 ID`를 사용합니다. `limit`은 선택값이며 기본 5, 최대 10입니다.

## 환경변수

Channel Developer Portal에서 발급받은 값을 배포 환경에 설정합니다.

```env
CHANNELTALK_APP_ID=
CHANNELTALK_APP_SECRET=
CHANNELTALK_SIGNING_KEY=
CHANNELTALK_APP_STORE_URL=https://app-store.channel.io
```

- `APP_SECRET`은 Extension 등록용이며 서버 응답이나 로그에 노출하면 안 됩니다.
- `SIGNING_KEY`는 hex 문자열입니다. 서버는 원본 JSON body에 대한 HMAC-SHA256 Base64 서명을
  `x-signature` 헤더와 constant-time 방식으로 비교합니다.

## Developer Portal 설정

1. 앱의 Function Endpoint를 `https://<server-host>/functions`로 설정합니다.
   `/v1`은 Channel AppStore가 자동으로 붙이므로 Portal에 입력하지 않습니다.
2. 위 환경변수가 설정된 서버를 먼저 배포합니다.
3. Command Extension을 한 번 등록합니다.

```bash
yarn dotenv -e env/.env.dev -- yarn register:channel-talk-app
```

운영 등록 시에는 `env/.env.prod`를 사용합니다. 등록 스크립트는 공식
`@channel.io/app-sdk-server`의 `issueToken`과 `registerExtension`을 사용합니다.

## HTTP 계약

AppStore는 다음 endpoint를 호출합니다.

```text
PUT /functions/v1
Content-Type: application/json
x-signature: <base64 HMAC-SHA256>
```

서명이 없거나 틀리면 `401`을 반환합니다. Function 입력 오류와 존재하지 않는 Function은 ChannelTalk
Function error envelope로 반환합니다.

## 로컬 확인

아래처럼 정확한 raw body로 서명을 만든 뒤 동일한 문자열을 전송해야 합니다.

```bash
export BODY='{"method":"extension.core.function.getFunctions","params":{},"systemVersion":"v1"}'
SIGNATURE=$(node -e "const c=require('crypto');const b=process.env.BODY;process.stdout.write(c.createHmac('sha256',Buffer.from(process.env.CHANNELTALK_SIGNING_KEY,'hex')).update(b).digest('base64'))")
curl -X PUT http://localhost:8000/functions/v1 \
  -H 'Content-Type: application/json' \
  -H "x-signature: $SIGNATURE" \
  --data "$BODY"
```

`BODY`와 `CHANNELTALK_SIGNING_KEY`는 shell 환경변수로 export한 상태에서 실행합니다.

## 참고

- [Channel App SDK](https://github.com/channel-io/app-sdk)
- [Function 등록](https://developers.channel.io/ko/articles/Function-Registration-77250b17)
- [Command 가이드](https://developers.channel.io/ko/articles/Command-Guide-b3d200dc)
