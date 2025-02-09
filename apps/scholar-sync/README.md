# OTL Plus Sync-server

[![CI](https://github.com/sparcs-kaist/otlplus-server/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/sparcs-kaist/otlplus-server/actions/workflows/ci.yml)

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

### Node.js 설치 및 버전 관리

Node.js v20 을 설치합니다.

버전 체크

```bash
node -v # v20.17.0
npm -v  # v9.x.x
```

```bash
brew install nvm
brew install yarn ## 없다면 npm install -g yarn
brew install npm
```

(Tip) [nvm](https://github.com/nvm-sh/nvm) 설치 후, nvm을 이용하여 로컬 개발 환경의 node.js 버전을 설정하는 것을 권장합니다!

```bash
nvm install 20
nvm use 20
```

아래 명령어를 사용하면 `.nvmrc` 설정 파일에 따라 자동으로 버전이 변경됩니다.

```bash
nvm use # uses v20
```

### NestJS 서버 실행

```sh
yarn
# or
yarn install
yarn workspace @otlplus/scholar-sync run start:local
```
