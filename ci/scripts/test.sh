#!/bin/bash

set -e -u -x

echo "Running tests"

mv dependency-cache/node_modules wonderchat

cd wonderchat

npm run lint

npm test

echo "Finished running tests"
