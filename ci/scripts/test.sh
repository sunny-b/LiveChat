#!/bin/bash

set -e -u -x

echo "Running tests"

mv dependency-cache/node_modules wonderchat

cd wonderchat

npm test

echo "Finished running tests"
