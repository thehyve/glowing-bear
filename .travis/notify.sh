#!/usr/bin/env bash

app=glowing-bear
message="<${TRAVIS_BUILD_WEB_URL}|Build #${TRAVIS_BUILD_NUMBER}> succeeded, application deployed. <https://github.com/${TRAVIS_REPO_SLUG}/tree/${TRAVIS_BRANCH}|Branch ${TRAVIS_BRANCH} on ${TRAVIS_REPO_SLUG}>, commit ${TRAVIS_COMMIT}: ${TRAVIS_COMMIT_MESSAGE}"
curl -f -q -X POST --data-urlencode "payload={\"channel\": \"#dw-builds\", \"username\": \"${app}\", \"text\": \"${message}\"}" "${SLACK_WEBHOOK}"
