#!/bin/bash

set -e -u -x

echo "Deploying app"

DOCKER_HOST="ssh://$SSH_USER@$SSH_IP"

ssh-add "$SSH_KEY_PATH"

docker pull sunlib/wonderchat:latest
docker stop wonderchat
docker rm wonderchat
docker run --name wonderchat -d -p 80:3000 sunlib/wonderchat:latest deploy/bin/start-node

echo "Finished deploying app"
