# Glowing Bear docker image definition

[![Docker Build Status](https://img.shields.io/docker/pulls/thehyve/glowing-bear.svg)](https://hub.docker.com/r/thehyve/glowing-bear)

Nginx-based Docker image for Glowing Bear with proxy for backend services.

The hostname and port in the [Nginx configuration](nginx/nginx.conf) can be changed via
environment variables `NGINX_HOSTNAME` (default: `localhost`) and `NGINX_PORT` (default `80`).

The container serves the Glowing Bear application at the specified port and provides
a proxy for the backend services at the following locations:

| Location                    | Target
|:--------------------------- |:----------------------------------
| `/api/transmart-api-server` | `http://transmart-api-server:8081`
| `/api/gb-backend`           | `http://gb-backend:8083`
| `/api/transmart-packer`     | `http://transmart-packer:8999`

This assumes that these services are reachable by the container at these addresses.
See [glowing-bear-docker](https://github.com/thehyve/glowing-bear-docker) for an example. 

The `AUTOSAVE_SUBJECT_SETS`, `CHECK_SERVER_STATUS` and `DENY_ACCESS_WITHOUT_ROLE`
variables can be set to override the default value (`false`) for these properties,
see the [list of supported properties](../README.md#configuration).


## Run

Follow the instructions in [glowing-bear-docker](https://github.com/thehyve/glowing-bear-docker) repository to run the full stack, including:
- [TranSMART API server with a database](https://github.com/thehyve/transmart-core/tree/dev/docker),
- [Gb Backend with a database](https://github.com/thehyve/gb-backend/tree/dev/docker),
- [Transmart Packer](https://github.com/thehyve/transmart-packer) for export jobs handling.


## Development

### Build and publish

Build the images and publish it to [Docker Hub](https://hub.docker.com/r/thehyve/glowing-bear).

```bash
# Build image
GB_VERSION=$(node -pe "require('../package.json').version")
docker build --build-arg "GB_VERSION=${GB_VERSION}" -t "thehyve/glowing-bear:${GB_VERSION}" . --no-cache
# Publish images to Docker Hub
docker login
docker push "thehyve/glowing-bear:${GB_VERSION}"
```
