# Glowing Bear docker image definition

[![Docker Build Status](https://img.shields.io/docker/pulls/thehyve/glowing-bear.svg)](https://hub.docker.com/r/thehyve/glowing-bear)

Nginx-based Docker image definition for Glowing Bear.

The current [Nginx configuration](./nginx.nginx.conf) allows to connect to the applications via either HTTP, or HTTPS, 
depending on the specified `NGINX_PORT` and volumes with signed certificate, private key and ssl config (see [the configuration instruction](https://github.com/thehyve/glowing-bear-docker#configuration)). 

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
GB_VERSION=$(node -pe "require('./package.json').version")
docker build --build-arg "GB_VERSION=${GB_VERSION}" -t "thehyve/glowing-bear:${GB_VERSION}" docker/
# Publish images to Docker Hub
docker login
docker push "thehyve/glowing-bear:${GB_VERSION}"
```
