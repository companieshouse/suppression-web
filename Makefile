.PHONY: build
build: clean
	npm run build

.PHONY: clean
clean:
	rm -rf dist

.PHONY: npm-install
npm-install:
	npm i

.PHONY: init
init: npm-install

.PHONY: test
test:
	npm run test

.PHONY: sonar
sonar:
	npm run analyse-code
