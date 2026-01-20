FROM node:20 AS build

RUN mkdir -p /var/www/otlplus-server && \
    mkdir -p /var/www/otlplus-server/libs && \
    mkdir -p /var/www/otlplus-server/apps && \
    mkdir -p /var/www/otlplus-server/apps/server/logs

WORKDIR /var/www/otlplus-server

COPY package.json yarn.lock* package-lock.json* tsconfig.json tsconfig.build.json nest-cli.json ./

RUN yarn --production

COPY ./apps/server ./apps/scholar-sync ./apps/server-consumer ./apps/notification-consumer ./apps/
COPY ./libs/common ./libs/prisma-client ./libs/rmq ./libs/

RUN yarn client:generate
RUN yarn generate:server:api-docs && \
    yarn build:server

FROM node:20-slim AS server
RUN apt-get update -y && apt-get install -y openssl

COPY --from=build /var/www/otlplus-server/dist/apps/server /var/www/otlplus-server/dist/apps/server
COPY --from=build /var/www/otlplus-server/apps/server/static /var/www/otlplus-server/apps/server/static
COPY --from=build /var/www/otlplus-server/node_modules /var/www/otlplus-server/node_modules

WORKDIR /var/www/otlplus-server

EXPOSE 8000