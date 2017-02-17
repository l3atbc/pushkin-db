#!/bin/bash
echo "API container loaded, waiting for rabbitmq"
while ! nc -z message-queue 5672; do sleep 3; done
echo "Rabbitmq loaded"
npm install -g nodemon knex
knex migrate:latest

nodemon --debug=5858 index.js
