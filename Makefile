BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -Fv .d.ts)
TYPESCRIPT_BASENAMES = $(basename $(TYPESCRIPT))
JAVASCRIPT := $(TYPESCRIPT_BASENAMES:%=%.js)

all: $(JAVASCRIPT) build/bundle.js server.js .gitignore .npmignore

$(BIN)/tsc $(BIN)/mocha $(BIN)/watsh $(BIN)/webpack:
	npm install

.gitignore: tsconfig.json
	echo $(TYPESCRIPT_BASENAMES:%=/%.js) /build/bundle.js | tr ' ' '\n' > $@

.npmignore: tsconfig.json
	echo $(TYPESCRIPT) Makefile tsconfig.json webpack.config.js | tr ' ' '\n' > $@

build/bundle.js: webpack.config.js $(JAVASCRIPT) .babelrc $(BIN)/webpack
	NODE_ENV=production $(BIN)/webpack --config $<

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

%.js: %.tsx $(BIN)/tsc
	$(BIN)/tsc

tests: $(BIN)/mocha
	$(BIN)/mocha tests/

server: server.js
	node $<

# dev:
	# node_restarter '**/*.js' 'node server.js'
	# PORT=8080 node webpack-dev-server.js

dev:
	(\
   $(BIN)/webpack --watch --config webpack.config.js & \
   $(BIN)/tsc --watch & \
   node_restarter '**/*.js' '!**/bundle.js' '!node_modules/**/*.js' 'bin/taskdb.js server -v' & \
   wait)
