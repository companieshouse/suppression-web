# Suppression Web
Web frontend for the 'Suppress My Details' service.

## Technologies

- [NodeJS](https://nodejs.org/)
- [expressJS](https://expressjs.com/)
- [NunJucks](https://mozilla.github.io/nunjucks)
- [gulpJS](https://gulpjs.com/)

## Running locally

1. Clone [Docker CHS Development](https://github.com/companieshouse/docker-chs-development) and follow the steps in the README.

2. Enable the `suppression` module

3. Navigate to `http://chs.local/suppress-my-details/` to see the landing page

## To make local changes

Development mode is available for this service in [Docker CHS Development](https://github.com/companieshouse/docker-chs-development).

    ./bin/chs-dev development enable suppression-web

## To build the Docker container

    DOCKER_BUILDKIT=1 docker build --ssh default -t 169942020521.dkr.ecr.eu-west-1.amazonaws.com/local/suppression-web .


