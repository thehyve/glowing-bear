FROM nginx:alpine

ARG GB_VERSION="2.0.14"
ARG GB_SRC_REPOSITORY="releases"

ENV GB_SRC_URL https://repo.thehyve.nl/service/local/artifact/maven/redirect?r=${GB_SRC_REPOSITORY}&g=nl.thehyve&a=glowing-bear&v=${GB_VERSION}&p=tar

WORKDIR /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY config.template.json config.template.json

# download and untar application artifacts
RUN apk add curl && \
    curl -f -L "${GB_SRC_URL}" -o "glowing-bear-${GB_VERSION}.tar" && \
    tar -xf "glowing-bear-${GB_VERSION}.tar" --strip 1

COPY docker-entrypoint.sh /opt/docker-entrypoint.sh

ENV NGINX_HOST="${NGINX_HOST:-localhost}"
ENV NGINX_PORT="${NGINX_PORT:-80}"

ENV TRANSMART_API_SERVER_URL=${TRANSMART_API_SERVER_URL:-http://transmart-api-server:8081}
ENV GB_BACKEND_URL=${GB_BACKEND_URL:-http://gb-backend:8083}
ENV TRANSMART_PACKER_URL=${TRANSMART_PACKER_URL:-http://transmart-packer:8999}

ENV KEYCLOAK_SERVER_URL=${KEYCLOAK_SERVER_URL}
ENV KEYCLOAK_REALM=${KEYCLOAK_REALM}
ENV KEYCLOAK_CLIENT_ID=${KEYCLOAK_CLIENT_ID}

ENV AUTOSAVE_SUBJECT_SETS=${AUTOSAVE_SUBJECT_SETS:-false}
ENV CHECK_SERVER_STATUS=${CHECK_SERVER_STATUS:-false}
ENV DENY_ACCESS_WITHOUT_ROLE=${DENY_ACCESS_WITHOUT_ROLE:-false}

ENTRYPOINT ["/opt/docker-entrypoint.sh"]
