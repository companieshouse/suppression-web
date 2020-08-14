# Suppression Web
Web frontend for the 'Suppress My Details' service.

## Technologies

- [NodeJS](https://nodejs.org/)
- [expressJS](https://expressjs.com/)
- [NunJucks](https://mozilla.github.io/nunjucks)
- [gulpJS](https://gulpjs.com/)

## How to run it locally

cd to the root directory, and type the following commands:

```
make
npm start
```

Then open your browser and go to http://localhost:3000/suppress-my-details.

## How to run it through docker

cd to the root directory, and type the following commands:

```
DOCKER_BUILDKIT=1 docker build --ssh default -t suppression-web .
docker run -p 3000:3000 -d suppression-web
```

Then open your browser and go to http://localhost:3000/suppress-my-details.
