.PHONY: build
build: clean build-app
	npm run build

.PHONY: build-app
build-app:
	npm run build

.PHONY: clean
clean:
	rm -rf dist

.PHONY: npm-install
npm-install:
	npm i

.PHONY: init
init: npm-install

