# nanbyodata
## Prerequisites
* Docker
* Docker Compose

## Download source code
Download source code from this repository
```
$ cd /your/path/src/
$ git clone https://github.com/aidrd/nanbyodata.git
$ cd nanbyodata
```

## Configuration environment
Create `.env` file and set values for your environment.
```
$ cp templete.env .env
```
### `CONTAINER_NAME`
(default: `nanbyodata-app`)

The name of the docker container. Must be unique in the system.

### `PORT`
(default: `8000`)

Port to listen on. Must be unique in the system.

## Start server
```
$ docker compose up -d
### Check of startup status
$ docker compose ps
NAME                SERVICE             STATUS              PORTS
nanbyodata-app      app                 running             0.0.0.0:18008->8000/tcp, :::18008->8000/tcp
```
If you are using a version prior to Docker Compose v2.0.0, use the `docker-compose` command instead of `docker compose`
```
$ docker-compose up -d
```

Check the application page can be displayed from a browser on the port number specified in the `.env` file. e.g. `http://localhost:8000`