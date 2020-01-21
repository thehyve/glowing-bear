FROM node:12 as dev

# build time env
ENV GB_SRC="/glowing-bear-src"
ENV NG_BIN="$GB_SRC/node_modules/@angular/cli/bin/ng"

VOLUME $GB_SRC
EXPOSE 4200
WORKDIR $GB_SRC
ENTRYPOINT npm install && exec $NG_BIN serve --aot --port 4200 --host 0.0.0.0


# -------------------------------------------
FROM node:12 as build

# build time env
ENV GB_SRC="/glowing-bear-src" \
    GB_DIST="/glowing-bear-dist"
ENV NG_BIN="$GB_SRC/node_modules/@angular/cli/bin/ng"

COPY . $GB_SRC
RUN cd $GB_SRC && \
    npm install && \
    $NG_BIN build --prod && \
    mv $GB_SRC/dist $GB_DIST


# -------------------------------------------
FROM nginx:latest as release

# build time env
ENV GB_DIST="/glowing-bear-dist" \
    NGINX_ROOT="/usr/share/nginx/html"

COPY --from=build --chown=www-data:www-data $GB_DIST $NGINX_ROOT/glowing-bear
COPY deployment/write-gb-config.sh /
RUN chmod +x /write-gb-config.sh

# run-time env
ENV GB_API_URL="http://localhost/pic-sure-api-2/PICSURE" \
    GB_URL="http://localhost:4200" \
    GB_OIDC_URL="http://localhost/auth/realms/master/protocol/openid-connect" \
    GB_OIDC_CLIENT_ID="medco" \
    GB_COTHORITY_KEY_URL="http://localhost/cothority-key.pub.toml" \
    GB_GENOMIC_ANNOTATIONS_URL="http://localhost/genomicAnnotations" \
    GB_MEDCO_RESULTS_RANDOMIZATION="0" \
    MEDCO_NETWORK_NAME="testnetwork" \
    MEDCO_NODES_NAME="a,b,c"

ENTRYPOINT /bin/bash -c "/write-gb-config.sh && exec nginx -g 'daemon off;'"
