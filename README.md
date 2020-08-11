# Suppression Web
Web frontend for the 'Suppress My Details' service.


## How to run it locally

cd to the root directory, and type the following commands:

```
npm install
make build
npm start
```

Then open your browser and go to http://localhost:3000.

## How to run it through docker

cd to the root directory, and type the following commands:

```
docker build -t tiny_rebels/suppression-web .
docker run -p 3000:3000 -d tiny_rebels/suppression-web
```

Then open your browser and go to http://localhost:3000.
