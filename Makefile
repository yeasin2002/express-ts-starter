# Makefile

# Variables
NODE_ENV=production

.PHONY: start dev build lint format test docker-build docker-up docker-down prepare lint-staged cli

# Targets
start:
	$(NODE_ENV)=production node dist/app.js

dev:
	tsx watch ./src/app.ts --w

build:
	rimraf dist && tsc --noEmit && npm run lint && swc src -d dist --out-dir dist --source-maps --strip-leading-paths

lint:
	eslint 'src/**/*.{ts,js}'

format:
	prettier --write 'src/**/*.{ts,js,json,md}'

test:
	jest

docker-build:
	docker-compose build

docker-up:
	docker-compose up

docker-down:
	docker-compose down

prepare:
	husky

lint-staged:
	lint-staged --concurrent false

cli:
	tsx ./script/index.ts
