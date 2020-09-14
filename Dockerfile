## Base build image
FROM node:14-alpine as build-base

ARG SSH_PRIVATE_KEY
ARG SSH_PRIVATE_KEY_PASSPHRASE

RUN apk add --update-cache git openssh-client python make g++ \
    && rm -rf /var/cache/apk/*

RUN mkdir -m 0600 ~/.ssh \
    && ssh-keyscan github.com >> ~/.ssh/known_hosts \
    && echo "${SSH_PRIVATE_KEY}" > ~/.ssh/id_rsa \
    && chmod 600 ~/.ssh/id_rsa \
    && ssh-keygen -p -f ~/.ssh/id_rsa -P "${SSH_PRIVATE_KEY_PASSPHRASE}" -N ""

# Configure work directory
WORKDIR /build
COPY package.json package-lock.json ./

## Image with runtime dependencies
FROM build-base as prod-deps-image

RUN npm install --production

## Build image
FROM prod-deps-image as build-image

RUN npm install
COPY . ./

RUN npm run build

FROM node:14-alpine as runtime

WORKDIR /app

COPY --from=prod-deps-image /build/node_modules/ ./node_modules
COPY --from=build-image /build/dist/ ./dist

EXPOSE 3000
CMD [ "node", "/app/dist/server.js" ]
