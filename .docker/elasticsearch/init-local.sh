#!/bin/bash
cd "$(dirname "$0")"
docker compose -f elasticsearch-docker-compose.local.yml --env-file=../../env/.env.local up -d

