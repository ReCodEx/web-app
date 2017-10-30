# ReCodEx

[![Build Status](https://travis-ci.org/ReCodEx/web-app.svg?branch=master)](https://travis-ci.org/ReCodEx/web-app)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

The descriptin and documentation of the project is placed in the [global wiki](https://github.com/ReCodEx/wiki/wiki/Web-application) of the ReCodEx project.

## Environment variables

Create a `.env` file in the root directory and put environment variables into this file. Look at `.env-sample` file for an example settings. The `.env` file should not be published in the git repository.

### Supported variables and their default values

```
NODE_ENV=development
API_BASE=http://localhost:4000/v1
PORT=8080
WEBPACK_DEV_SERVER_PORT=8081
TITLE=ReCodEx
ALLOW_NORMAL_REGISTRATION=true
ALLOW_LDAP_REGISTRATION=false
ALLOW_CAS_REGISTRATION=true
```

## Run Dev

* webpack dev server, client side only, no server rendering

```
yarn
yarn dev
open http://127.0.0.1:8080
```

## Run in production

```
yarn
yarn test
yarn build
yarn start
```

Consider using [PM2](http://pm2.keymetrics.io/) or similar tool to run the `yarn start` command to prevent crashes of the web service. It is wise to use watch mode of PM2 in `prod/` subdirectory and deploy the app using `yarn deploy` command.

## License

[MIT](http://isekivacenz.mit-license.org/)
