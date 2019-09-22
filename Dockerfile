# Creates a docker image with node, and your app
#
# Steps:
#   - Set meta information
#   - Install packages and scripts
#   - Copy package.json package-lock.json from app
#   - Build node env
#   - Copy all source code
#   - Build node app

# start from a minimal, bare-bones image
FROM node:10-alpine

# set the working directory to /app
WORKDIR /app

# install base packages
RUN apk add --no-cache bash

# copy the build scripts into image
COPY deploy/build-scripts /usr/local/sbin/

# ensure they're executable
RUN chmod +x /usr/local/sbin/*

# copy the start script into image
COPY deploy/bin /usr/local/bin/

# ensure they're executable
RUN chmod +x /usr/local/bin/*

# add node_modules/.bin to path
ENV PATH="/app/node_modules/.bin:${PATH}"

# copy package.json package-lock.json yarn.lock into image
COPY package*.json /app/

# build node (see build-scripts)
RUN build-node-env

# copy the source code
COPY . .

# build app (see build-scripts)
RUN build-node-app
