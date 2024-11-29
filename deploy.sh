#!/bin/bash

usage() {
  echo "Usage: $0 -e value"
  echo "  -e: 현재 배포 환경을 입력하세요. (prod, dev, local)"
}

NODE_ENV=""

while getopts "e:" opt; do
  case $opt in
    e)
      NODE_ENV=$OPTARG
      echo "NODE_ENV: $NODE_ENV"
      if [[ "$NODE_ENV" = "prod" ]]; then
         COMPOSE_FILE="docker/docker-compose.prod.yml"
      elif [[ "$NODE_ENV" = "dev" ]]; then
          COMPOSE_FILE="docker/docker-compose.dev.yml"
      elif [[ "$NODE_ENV" = "local" ]]; then
          COMPOSE_FILE="docker/docker-compose.local.yml"
      else
        echo "Invalid environment: $NODE_ENV" 1>&2
        usage
        exit 1
      fi

      if [[ ! -f "$COMPOSE_FILE" ]]; then
        echo "Error: Compose file does not exist: $COMPOSE_FILE" 1>&2
        exit 1
      fi

      docker compose -f "$COMPOSE_FILE" up -d
      ;;
    \?)
      echo "Invalid option: -$OPTARG" 1>&2
      usage
      exit 1
      ;;
  esac
done

if [ -z "$NODE_ENV" ]; then
  echo "Error: Environment option is required."
  usage
  exit 1
fi