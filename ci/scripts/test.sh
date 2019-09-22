#!/bin/bash

echo "Running tests"

npm install

npm run lint

npm test

echo "Finished running tests"
