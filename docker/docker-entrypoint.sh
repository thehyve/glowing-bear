#!/bin/sh
set -e

# Error message and exit for missing environment variable
fatal() {
		cat << EndOfMessage
--------------------------------------------------------------
Fatal error!
--------------------------------------------------------------
The variable with the name '$1' is unset.
Please specify a value in this container environment using
-e in docker run or the environment section in docker-compose.
--------------------------------------------------------------
EndOfMessage
		exit 1
}

# Check that Keycloak is configured via environment variables
[ -n "${KEYCLOAK_SERVER_URL}" ] || fatal 'KEYCLOAK_SERVER_URL'
[ -n "${KEYCLOAK_REALM}" ] || fatal 'KEYCLOAK_REALM'
[ -n "${KEYCLOAK_CLIENT_ID}" ] || fatal 'KEYCLOAK_CLIENT_ID'

envsubst '$${NGINX_HOST}, $${NGINX_PORT}, $${TRANSMART_API_SERVER_URL}, $${GB_BACKEND_URL}, $${TRANSMART_PACKER_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
echo '{"env": "default"}' > /usr/share/nginx/html/app/config/env.json && \
cat /usr/share/nginx/html/app/config/env.json && \
envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/app/config/config.default.json && \
exec nginx -g 'daemon off;'
