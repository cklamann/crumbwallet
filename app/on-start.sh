#!/usr/bin/env bash

set -e

npm install -g jest
npm install -qy --prefix ./server 
npm install -qy --prefix ./client 
npm run development --prefix ./client 
npm run build --prefix ./server 
npm run start --prefix ./server 
