#!/bin/bash
cd "$(dirname "$0")"
docker compose -f elasticsearch-docker-compose.prod.yml --env-file=../../env/.env.prod up -d

