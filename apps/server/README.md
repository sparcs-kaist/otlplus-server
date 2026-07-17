# OTL Plus Server

[![CI](https://github.com/sparcs-kaist/otlplus-server/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/sparcs-kaist/otlplus-server/actions/workflows/ci.yml)

## How to run

### 환경변수 설정

`env/.env.example`을 복사하여 `env/.env.local`을 만들고 적절하게 입력합니다.

### DB 설정

다음과 같이 `.env` 파일을 만들어 포트와 비밀번호를 설정할 수 있습니다.
아래 값들은 기본값입니다.

```env
OTLPLUS_DB_PORT=45432
OTLPLUS_DB_USER=otlplus
OTLPLUS_DB_PASSWORD=password
```

아래 명령어로 DB를 도커로 띄웁니다.

```sh
sudo docker compose up
```

빈 Docker 볼륨으로 처음 시작하면 PostgreSQL entrypoint가 `shadow_otlplus` shadow database를 자동으로 생성합니다. Shadow database는 main database인 `otlplus`와 반드시 달라야 합니다.

기존 `apps/server/volumes/db`가 있으면 Docker entrypoint 초기화 스크립트가 다시 실행되지 않습니다. 이 경우 `shadow_otlplus`가 없을 때만 아래 명령어로 생성합니다.

```sh
docker compose exec db psql -U otlplus -d otlplus -c 'CREATE DATABASE shadow_otlplus;'
```

PostgreSQL을 시작한 후 데이터베이스를 초기화합니다.

```sh
yarn db:init
```

또는 로컬에서 PostgreSQL 18을 설치하여 연결할 수 있습니다.

#### 이미 스키마가 반영된 PostgreSQL로 전환할 때

운영 데이터베이스를 pg_dump/restore 등으로 이미 동일한 스키마로 옮긴 경우, 아래 절차를 따르세요.

1. 스키마 차이가 없는지 확인합니다.

   ```sh
   npx prisma migrate diff \
     --from-url "$DATABASE_URL" \
     --to-schema-datamodel ./libs/prisma-client/src/schema.prisma \
     --exit-code
   ```

   차이가 보고되면 `0_init` baseline와 맞춘 뒤 진행하세요.

2. 차이가 없으면 baseline를 적용된 것으로 표시합니다.

   ```sh
   npx prisma migrate resolve \
     --applied 0_init \
     --schema ./libs/prisma-client/src/schema.prisma
   ```

MariaDB/MySQL에서 PostgreSQL로의 데이터 이관은 이 PR 범위 밖입니다. 운영 데이터 덤프, 시퀀스 보정, 검증, 롤백 절차는 별도의 운영 작업으로 수행해야 합니다.

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
yarn workspace @otlplus/server-nest run start:local
```
