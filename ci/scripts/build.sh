#!/bin/bash

set -e -u -x

echo "Building node files"

mv dependency-cache/node_modules source_code

cd source_code

npm run build

echo "Done building"
