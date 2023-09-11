# OTL Plus Server

[![CI](https://github.com/sparcs-kaist/otlplus-server/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/sparcs-kaist/otlplus-server/actions/workflows/ci.yml)

## How to run

### 환경변수 설정

`env/.env.example`을 복사하여 `env/.env.local`을 만들고 적절하게 입력합니다.

### DB 설정

다음과 같이 `.env` 파일을 만들어 포트와 비밀번호를 설정할 수 있습니다.
아래 값들은 기본값입니다.

```env
OTLPLUS_DB_PORT=43306
OTLPLUS_DB_PASSWORD=password
```

아래 명령어로 DB를 도커로 띄웁니다.

```sh
sudo docker compose up
```

또는 로컬에서 MySQL 5.7을 설치하여 연결할 수 있습니다.

### NestJS 서버 실행

```sh
npm install
npm run start:local
```
