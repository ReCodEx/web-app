# ReCodEx

[![Build Status](https://travis-ci.org/ReCodEx/web-app.svg?branch=master)](https://travis-ci.org/ReCodEx/web-app)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![GitHub release](https://img.shields.io/github/release/recodex/web-app.svg)](https://github.com/ReCodEx/wiki/wiki/Changelog)

## Installation

Web application requires [NodeJS](https://nodejs.org/en/) server as its runtime
environment. This runtime is needed for executing JavaScript code on server and
sending the pre-render parts of pages to clients, so the final rendering in
browsers is a lot quicker and the page is accessible to search engines for
indexing.

But some functionality is better in other full fledged web servers like *Apache*
or *Nginx*, so the common practice is to use a tandem of both. *NodeJS* takes
care of basic functionality of the app while the other server (Apache) is set as
reverse proxy and providing additional functionality like SSL encryption, load
balancing or caching of static files. The recommended setup contains both NodeJS
and one of Apache and Nginx web servers for the reasons discussed above. 

Stable versions of 4th and 6th series of NodeJS server are sufficient, using at
least 6th series is highly recommended. Please check the most recent version of
the packages in your distribution's repositories, there are often outdated ones.
However, there are some third party repositories for all main Linux
distributions.

The app depends on several libraries and components, all of them are listed in
`package.json` file in source repository. For managing dependencies is used dependency manager `yarn`, which has to be installed separately. To fetch and install all dependencies run:

```
$ npm install yarn -g
$ yarn
```

The app is built into self-contained bundle for NodeJS server. There is
a prepared SystemD unit file for control over the app. Another option is
to use `pm2` process manager, but we had some problems with it.

## Environment variables

Create a `.env` file in the root directory and put environment variables into this file. Look at `.env-sample` file for an example settings. The `.env` file should not be published in the git repository.

### Supported variables and their default values

```
NODE_ENV=development
WEBPACK_DEV_SERVER_PORT=8081
LOGGER_MIDDLEWARE_VERBOSE=false
LOGGER_MIDDLEWARE_EXCEPTIONS=true
```

## Configuration

Compiled bundle properties can be modified by runtime configuration file. Sample
content of this file is following:

```
{
  "PORT": 8080,
  "API_BASE": "https://recodex-devel.ms.mff.cuni.cz:4000/v1",
  "TITLE": "ReCodEx",
  "SKIN": "skin-green",
  "ALLOW_NORMAL_REGISTRATION": true,
  "ALLOW_LDAP_REGISTRATION": false,
  "ALLOW_CAS_REGISTRATION": true
}
```

## Usage

The application can be run in two modes, development and production. Development
mode uses only client rendering and tracks code changes with rebuilds of the
application in real time. In production mode the compilation (transpile to _ES5_
standard using *Babel* and bundle into single file using *webpack*) has to be
done separately prior to running. The scripts for compilation are provided as
additional `npm` commands.

- Development mode can be use for local testing of the app. This mode uses
  webpack dev server, so all code runs on a client, there is no server side
  rendering available. Starting is simple command, default address is
  http://localhost:8080.

```
$ yarn dev
```

- Production mode is mostly used on the servers. It provides all features such
  as server side rendering. This can be run via:

```
$ yarn build
$ yarn deploy  # copies all neccessary files to prod/ directory
$ cd prod
$ node bin/server.js
```

Both modes can be configured to use different ports or set base address of used
API server. This can be configured in `.env` file in root of the repository.
There is `.env-sample` file which can be just copied and altered.

## Documentation

The descriptin and documentation of the project is placed in the [global wiki](https://github.com/ReCodEx/wiki/wiki) of the ReCodEx project.
