# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package.json ]; then npm install; fi

COPY . /app

CMD ["npm", "run", "dev"]
