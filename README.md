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
npm install
make
npm start
```

Then open your browser and go to http://localhost:3000/suppress-my-details.

## How to run it through docker

cd to the root directory, and type the following commands:

```
docker build -t tiny_rebels/suppression-web .
docker run -p 3000:3000 -d tiny_rebels/suppression-web
```

Then open your browser and go to http://localhost:3000/suppress-my-details.
