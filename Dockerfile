FROM alpine:latest

SHELL ["/bin/bash", "-c"]

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash

WORKDIR /app

COPY . .

WORKDIR /app/backend



CMD ["just" ]