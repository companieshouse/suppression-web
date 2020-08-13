.PHONY: build
build: clean build-app build-static
	npm run build

.PHONY: build-app
build-app:
	npm run build

.PHONY: clean
clean:
	rm -rf dist

.PHONY: build-static
build-static:
	npm run build:views-styles

.PHONY: npm-install
npm-install:
	npm i

.PHONY: init
init: npm-install build-static

