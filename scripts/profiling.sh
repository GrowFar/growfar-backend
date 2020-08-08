#!/bin/bash

NODE_ENV="$1"
LOG_PATH="./logs/profile/"
[ -z "$NODE_ENV" ] && { echo "Node Environment is null!"; exit 1; }

case $NODE_ENV in
  Production | production | PRODUCTION)

    printf "Using $NODE_ENV \n"
    LOG_PATH+=$NODE_ENV

    mkdir -p $LOG_PATH
    cross-env NODE_ENV=$NODE_ENV & 0x -o --collect-only --output-dir $LOG_PATH src/app.js
    ;;

  Development | development | DEVELOPMENT)

    printf "Using $NODE_ENV \n"
    LOG_PATH+=$NODE_ENV

    mkdir -p $LOG_PATH
    cross-env NODE_ENV=$NODE_ENV & 0x -o --output-dir $LOG_PATH src/app.js
    ;;

  *)
    printf "Unknown Environment"
    exit 1
    ;;
esac
