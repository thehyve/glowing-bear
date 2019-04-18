#!/bin/bash
set -Eeuo pipefail

GB_CONFIG_FILE="$NGINX_ROOT/glowing-bear/app/config/config.docker-deployment.json"
cat > "${GB_CONFIG_FILE}" <<EOL
{
  "api-url": "${GB_API_URL}",
  "app-url": "${GB_URL}",
  "autosave-subject-sets": false,
  "export-data-view": "default",
  "show-observation-counts": false,
  "instant-counts-update-1": false,
  "instant-counts-update-2": false,
  "instant-counts-update-3": false,

  "authentication-service-type": "oidc",
  "oidc-server-url": "${GB_OIDC_URL}",
  "oidc-client-id": "${GB_OIDC_CLIENT_ID}",

  "endpoint-mode": "picsure",
  "include-query-saving": false,
  "include-data-table": false,
  "include-query-subscription": false,
  "include-variable-selection": false,
  "enable-analysis": false,
  "enable-export": false,
  "force-i2b2-nesting-style": true,
  "enable-greedy-tree-loading": false,

  "medco-cothority-key-url": "${GB_COTHORITY_KEY_URL}",
  "medco-genomic-annotations-url": "${GB_GENOMIC_ANNOTATIONS_URL}",
  "medco-results-randomization": ${GB_MEDCO_RESULTS_RANDOMIZATION},

  "footer-text": "${GB_FOOTER_TEXT}",

EOL

for (( IDX=0; ; IDX++ )); do
    MEDCO_NODE_NAME=$(echo "${MEDCO_NODES_NAME}" | cut -f$(($IDX+1)) -d,)

    if [[ -z ${MEDCO_NODE_NAME} ]]; then
        break
    fi

    PICSURE_RES_NAME="MEDCO_${MEDCO_NETWORK_NAME}_${IDX}_${MEDCO_NODE_NAME}"
    if [[ ${IDX} -eq 0 ]]; then
      echo "\"picsure-search-resource-name\": \"${PICSURE_RES_NAME}\"," >> "${GB_CONFIG_FILE}"
      echo "\"picsure-query-resource-names\": [" >> "${GB_CONFIG_FILE}"
    else
      echo "," >> "${GB_CONFIG_FILE}"
    fi
    echo "\"${PICSURE_RES_NAME}\"" >> "${GB_CONFIG_FILE}"

done
echo "]}" >> "${GB_CONFIG_FILE}"

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
