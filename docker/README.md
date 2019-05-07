# Docker scripts for Glowing Bear and its dependencies

[![Docker Build Status](https://img.shields.io/docker/pulls/thehyve/glowing-bear.svg)](https://hub.docker.com/r/thehyve/glowing-bear)

## Run

Install [docker-compose](https://docs.docker.com/compose/install/) and run
```bash
docker-compose up
```

This starts web server serving Glowing Bear, [TranSMART API server with a database](https://github.com/thehyve/transmart-core/tree/dev/docker), [Gb Backend with a database](https://github.com/thehyve/gb-backend/tree/dev/docker) 
and [transmart-packer](https://github.com/thehyve/transmart-packer).

Applications use Keycloak for authentication. The following environment variables
can be used to configure Keycloak:

Variable              | Default value
----------------------|---------------
`KEYCLOAK_SERVER_URL` | https://keycloak-dwh-test.thehyve.net
`KEYCLOAK_REALM`      | transmart-dev
`KEYCLOAK_CLIENT_ID`  | transmart-client

For a current setup urls of TranSMART API server, Gb Backend and transmart-packer should be configured, 
 what cab be done using the following environment variables:

Variable                   | Default value
---------------------------|---------------------------
`TRANSMART_API_SERVER_URL` | http://localhost:9081
`TRANSMART_PACKER_URL`     | http://localhost:8999
`GB_BACKEND_URL`           | http://localhost:9083

The default values are defined in the [`.env`](../.env) file.

### Ports

The following ports will be exposed:

Value    | Type  | Description
---------|-------|-----------------
9080     | `tcp` | The Glowing Bear UI
9083     | `tcp` | The Gb Backend
9081     | `tcp` | The TranSMART API Server
9432     | `tcp` | PostgreSQL database server for TranSMART
8999     | `tcp` | transmart-packer


The Glowing Bear application is available at http://localhost:9080.


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
- [ ] splitting docker-compose.yml into smaller compose scripts per component,
- [ ] moving of the docker-compose script to a separate repository.
