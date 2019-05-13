# Glowing Bear docker image definition

[![Docker Build Status](https://img.shields.io/docker/pulls/thehyve/glowing-bear.svg)](https://hub.docker.com/r/thehyve/glowing-bear)

Nginx-based Docker image definition for Glowing Bear.

## Run

Follow the instructions in [glowing-bear-docker](https://github.com/thehyve/glowing-bear-docker) repository to run the full stack, including:
- [TranSMART API server with a database](https://github.com/thehyve/transmart-core/tree/dev/docker),
- [Gb Backend with a database](https://github.com/thehyve/gb-backend/tree/dev/docker),
- [Transmart Packer](https://github.com/thehyve/transmart-packer) for export jobs handling.


## Development

### Build

```bash
docker build -t glowing-bear glowing-bear
```

### Publish

Publish the image to [Docker Hub](https://hub.docker.com/r/thehyve/glowing-bear):

```bash
docker login
GLOWING_BEAR_VERSION="1.3.8"
docker tag glowing-bear "thehyve/glowing-bear:${GLOWING_BEAR_VERSION}"
docker push "thehyve/glowing-bear:${GLOWING_BEAR_VERSION}"
```

## :wrench: Next steps


- [ ] configuration of SSL certificates,
- [x] moving of the docker-compose script to a separate repository.
