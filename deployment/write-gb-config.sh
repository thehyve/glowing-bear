#!/bin/bash
set -Eeuo pipefail

cat > "$NGINX_ROOT/glowing-bear/app/config/config.docker-deployment.json" <<EOL
{
  "medco-node-url": "${GB_MEDCO_NODE_URL}",

  "keycloak-url": "${GB_KEYCLOAK_URL}",
  "keycloak-realm": "${GB_KEYCLOAK_REALM}",
  "keycloak-client-id": "${GB_KEYCLOAK_CLIENT_ID}",

  "footer-text": "${GB_FOOTER_TEXT}"
}
EOL

cat > "$NGINX_ROOT/glowing-bear/app/config/env.json" <<EOL
{ "env": "docker-deployment" }
EOL

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
