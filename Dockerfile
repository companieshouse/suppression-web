
# syntax=docker/dockerfile:1.0.0-experimental

## Base build image
FROM node:14-alpine as build-base

# Configure work directory
WORKDIR /build
COPY package.json package-lock.json ./

## Image with runtime dependencies
FROM build-base as prod-deps-image

RUN npm install --production

## Build image
FROM prod-deps-image as build-image

RUN npm install
RUN npm install gulp-cli -g
COPY . ./

RUN npm run build
COPY . ./

FROM node:14-alpine as runtime

WORKDIR /app

COPY --from=prod-deps-image /build/node_modules/ ./node_modules
COPY --from=build-image /build/dist/ ./dist

EXPOSE 3000
CMD [ "node", "/app/dist/server.js" ]
