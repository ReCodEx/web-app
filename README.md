# ReCodEx

[![Build Status](https://travis-ci.org/ReCodEx/web-app.svg?branch=master)](https://travis-ci.org/ReCodEx/web-app) [![Coverage Status](https://coveralls.io/repos/github/ReCodEx/web-app/badge.svg?branch=master)](https://coveralls.io/github/ReCodEx/web-app?branch=master)

The descriptin and documentation of the project is placed in the [global wiki](https://github.com/ReCodEx/wiki/wiki/Web-application) of the ReCodEx project.

## Environment variables

Create a `.env` file in the root directory and put environment variables into this file. Look at `.env-sample` file for an example settings. The `.env` file should not be published in the git repository.

### Supported variables and their default values

```
NODE_ENV=development
API_BASE=http://localhost:4000/v1
PORT=8080
WEBPACK_DEV_SERVER_PORT=8081
```

## Run Dev

* webpack dev server, client side only, no server rendering

```
npm install
npm run dev
open http://127.0.0.1:8080
```

## License

[MIT](http://isekivacenz.mit-license.org/)
