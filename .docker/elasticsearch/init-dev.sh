#!/bin/bash
cd "$(dirname "$0")"
docker compose -f elasticsearch-docker-compose.dev.yml --env-file=../../env/.env.dev up -d

