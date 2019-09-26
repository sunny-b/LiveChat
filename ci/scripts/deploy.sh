#!/bin/bash

set -e -u -x

echo "Deploying app"

eval $(ssh-agent)

chmod 600 "$SSH_KEY_PATH"

ssh-add "$SSH_KEY_PATH"

ssh -o "StrictHostKeyChecking no" "$SSH_USER@$SSH_IP" docker pull sunlib/wonderchat:latest
ssh -o "StrictHostKeyChecking no" "$SSH_USER@$SSH_IP" docker stop wonderchat
ssh -o "StrictHostKeyChecking no" "$SSH_USER@$SSH_IP" docker rm wonderchat
ssh -o "StrictHostKeyChecking no" "$SSH_USER@$SSH_IP" docker run --name wonderchat -d -p 3000:3000 sunlib/wonderchat:latest deploy/bin/start-node

echo "Finished deploying app"
