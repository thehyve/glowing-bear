#!/usr/bin/env bash

here=$(dirname "${0}")
GB_VERSION=$(node -pe "require('${here}/../package.json').version")
if echo "${GB_VERSION}" | grep '\.*-SNAPSHOT$' -; then
  GB_SRC_REPOSITORY="snapshots"
else
  GB_SRC_REPOSITORY="releases"
fi

docker build --build-arg "GB_VERSION=${GB_VERSION}" --build-arg "GB_SRC_REPOSITORY=${GB_SRC_REPOSITORY}" \
       -t "thehyve/glowing-bear:${GB_VERSION}" "${here}/../docker" && \
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD" && \
docker push "thehyve/glowing-bear:${GB_VERSION}"
