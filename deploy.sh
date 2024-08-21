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
      if [ "$NODE_ENV" == "prod" ]; then
         docker-compose -f docker/docker-compose.prod.yml up -d
      elif [ "$NODE_ENV" == "dev" ]; then
          docker-compose -f docker/docker-compose.dev.yml up -d
      elif [ "$NODE_ENV" == "local" ]; then
          docker-compose -f docker/docker-compose.local.yml up -d
      else
        echo "Invalid environment: $NODE_ENV" 1>&2
        usage
        exit 1
      fi
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
