FROM node:8 as dev

# build time env
ENV GB_SRC="/glowing-bear-src" \
    GB_DIST="/glowing-bear-dist"
ENV NG_BIN="$GB_SRC/node_modules/@angular/cli/bin/ng"

COPY . $GB_SRC
RUN cd $GB_SRC && \
    npm install && \
    $NG_BIN build --prod && \
    mv $GB_SRC/dist $GB_DIST && \
    rm -rf $GB_SRC

VOLUME $GB_SRC
EXPOSE 4200
WORKDIR $GB_SRC
ENTRYPOINT npm install && exec $NG_BIN serve --aot


# -------------------------------------------
FROM nginx:latest as prod

# build time env
ENV GB_DIST="/glowing-bear-dist" \
    NGINX_ROOT="/usr/share/nginx/html"

COPY --from=dev --chown=www-data:www-data $GB_DIST $NGINX_ROOT
COPY deployment/write-gb-config.sh /
RUN chmod +x /write-gb-config.sh

# run-time env
ENV GB_API_URL="http://localhost:8082/IRCT-CL/rest" \
    GB_URL="http://localhost:4200" \
    GB_OIDC_URL="http://localhost:8081/auth/realms/master/protocol/openid-connect" \
    GB_OIDC_CLIENT_ID="i2b2" \
    GB_PICSURE_RES_NAME="i2b2-medco" \
    GB_GENOMIC_ANNOTATIONS_URL="http://localhost/php"

ENTRYPOINT /bin/bash -c "/write-gb-config.sh && exec nginx -g 'daemon off;'"
