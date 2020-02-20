#!/usr/bin/env bash
npm install -g jest
npm --prefix ./server install -qy
npm --prefix ./client install -qy
npm --prefix ./client run dev
npm --prefix ./server run build
npm --prefix ./server run start
