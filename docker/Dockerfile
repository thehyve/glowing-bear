FROM nginx:alpine

ENV GB_VERSION 1.3.8
ENV GB_SRC_URL https://repo.thehyve.nl/content/repositories/releases/nl/thehyve/glowing-bear/${GB_VERSION}/glowing-bear-${GB_VERSION}.tar

WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf
COPY config.template.json config.template.json

# download and untar application artifacts
RUN wget "${GB_SRC_URL}" -O "glowing-bear-${GB_VERSION}.tar" && \
    tar -xf "glowing-bear-${GB_VERSION}.tar" --strip 1

# apply env variables to the application config starting the webserver
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/app/config/config.default.json && \
      exec nginx -g 'daemon off;'"]
