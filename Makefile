BIN := node_modules/.bin

all: build/bundle.js

$(BIN)/watsh $(BIN)/tsc $(BIN)/webpack:
	npm install

build/bundle.js: webpack.config.js app.jsx .babelrc $(BIN)/webpack
	mkdir -p $(@D)
	NODE_ENV=production $(BIN)/webpack --config $<

dev:
	PORT=8080 node webpack-dev-server.js
