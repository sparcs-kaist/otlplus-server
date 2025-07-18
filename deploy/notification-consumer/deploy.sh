#!/bin/bash

# 사용 중인 포트 중 3001~3010 사이 확인
for port in {3001..3010}; do
  if ! lsof -i:"$port" >/dev/null; then
    echo "Starting container on port $port"
    EXTERNAL_PORT=$port docker-compose -p nest-app-$port up -d
    exit 0
  fi
done

echo "No available port found between 3001 and 3010"
exit 1
