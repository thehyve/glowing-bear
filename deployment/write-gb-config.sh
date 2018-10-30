#!/bin/bash
set -Eeuo pipefail

cat > "$NGINX_ROOT/app/config/env.json" <<EOL
{ "env": "docker-deployment" }
EOL

cat > "$NGINX_ROOT/app/config/config.docker-deployment.json" <<EOL
{
  "api-url": "$GB_API_URL",
  "app-url": "$GB_URL",
  "autosave-subject-sets": false,
  "export-data-view": "default",
  "show-observation-counts": false,
  "instant-counts-update-1": false,
  "instant-counts-update-2": false,
  "instant-counts-update-3": false,

  "authentication-service-type": "oidc",
  "oidc-server-url": "$GB_OIDC_URL",
  "oidc-client-id": "$GB_OIDC_CLIENT_ID",

  "endpoint-mode": "picsure",
  "picsure-resource-name": "$GB_PICSURE_RES_NAME",
  "include-query-saving": false,
  "include-data-table": false,
  "include-query-subscription": false,
  "include-variable-selection": false,
  "enable-analysis": false,
  "enable-export": false,
  "force-i2b2-nesting-style": true,
  "enable-greedy-tree-loading": false,

  "medco-cothority-key-url": "app/config/medco-cothority-key.toml",
  "medco-genomic-annotations-url": "$GB_GENOMIC_ANNOTATIONS_URL"

}
EOL

# todo: key hard coded! do with docker secrets secrets
#ln -s /dev/secrets/ app/aaaaa

cat > /etc/nginx/conf.d/default.conf <<EOL
server {
    listen       80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
EOL
