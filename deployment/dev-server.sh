#!/usr/bin/env sh
USER_GROUP="$(id -u):$(id -g)" docker-compose up --build dev-server
