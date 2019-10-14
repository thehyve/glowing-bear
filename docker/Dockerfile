FROM nginx:alpine

ARG GB_VERSION="2.0.8"
ARG GB_SRC_REPOSITORY="releases"

ENV GB_SRC_URL https://repo.thehyve.nl/service/local/artifact/maven/redirect?r=${GB_SRC_REPOSITORY}&g=nl.thehyve&a=glowing-bear&v=${GB_VERSION}&p=tar
ENV NGINX_HOST="${NGINX_HOST:-localhost}"
ENV NGINX_PORT="${NGINX_PORT:-80}"

ENV CHECK_SERVER_STATUS=${CHECK_SERVER_STATUS:-false}
ENV DENY_ACCESS_WITHOUT_ROLE=${DENY_ACCESS_WITHOUT_ROLE:-false}

WORKDIR /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY config.template.json config.template.json

# download and untar application artifacts
RUN apk add curl && \
    curl -L "${GB_SRC_URL}" -o "glowing-bear-${GB_VERSION}.tar" && \
    tar -xf "glowing-bear-${GB_VERSION}.tar" --strip 1

# apply env variables to the application config and nginx config, while starting the webserver
CMD ["/bin/sh", "-c", "\
      envsubst '$${NGINX_HOST}, $${NGINX_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
      envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/app/config/config.default.json && \
      exec nginx -g 'daemon off;'"]
