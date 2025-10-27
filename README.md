# ReCodEx

[![Build Status](https://github.com/ReCodEx/web-app/workflows/CI/badge.svg)](https://github.com/ReCodEx/web-app/actions)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![GitHub release](https://img.shields.io/github/release/recodex/web-app.svg)](https://github.com/ReCodEx/wiki/wiki/Changelog)
[![COPR](https://copr.fedorainfracloud.org/coprs/semai/ReCodEx/package/recodex-web/status_image/last_build.png)](https://copr.fedorainfracloud.org/coprs/semai/ReCodEx/)

## Installation

The web application requires [NodeJS](https://nodejs.org/en/) 22+ (version 22 is recommended since it has LTS) server as a runtime
environment. This runtime is needed for executing JavaScript code on server and
sending the pre-render parts of pages to clients, so the final rendering in
browsers is a lot quicker and the page is accessible to search engines for
indexing.

But some functionality is better in other full-fledged web servers like *Apache*
or *Nginx*, so the common practice is to use a tandem of both. *NodeJS* takes
care of basic functionality of the app while the other server (Apache) is set as
reverse proxy and providing additional functionality like SSL encryption, load
balancing or caching of static files. The recommended setup contains both NodeJS
and one of Apache and Nginx web servers for the reasons discussed above.

Stable versions of 6th and 8th series of NodeJS server are sufficient, using at
least 8th series is highly recommended. Please check the most recent version of
the packages in your distribution's repositories, there are often outdated ones.
However, there are some third party repositories for all main Linux
distributions.

The app depends on several libraries and components, all of them are listed in
`package.json` file in source repository. For managing dependencies is used
dependency manager `yarn`, which has to be installed separately. To fetch and
install all dependencies run:

```
$ npm install yarn -g
$ yarn install
```

The app is built into self-contained bundle for NodeJS server. There is
a prepared SystemD unit file for control over the app. Another option is
to use `pm2` process manager, but we had some problems with it (it won't
automatically start on boot on one of our computers for no reason).

### RPM package

For Linux systems with RPM packages (CentOS, Fedora) we provide prebuilt
packages. They install production bundle to `/opt/recodex-web` directory.
Provided unit file can be used to run the app with SystemD. The app itself do
not care about certificates, so it is recommended to use the app behind reverse
proxy of your choice.

## Environment variables

Create a `.env` file in the root directory and put environment variables into
this file. Look at `.env-sample` file for an example settings. The `.env` file
should not be published in the git repository. Environment variables are aplied
before build of the app, so they cannot be changed on finished bundle.

### Supported variables and their default values

```
NODE_ENV=development
WEBPACK_DEV_SERVER_PORT=8081
LOGGER_MIDDLEWARE_VERBOSE=false
LOGGER_MIDDLEWARE_EXCEPTIONS=true
```

## Configuration

Compiled bundle properties can be modified by runtime configuration file. The
file is located in `etc/env.json` file. New values of these properties are
applied after restart of the app. Note, that all these values are directly
accessible to JavaScript code in browsers, so it is not a good place to store any
kind of secrets.

Sample content of this file is following:

```
{
  "PORT": 8080,
  "API_BASE": "https://recodex.base.domain/api/v1",
  "TITLE": "ReCodEx",
  "SKIN": "success",
  "URL_PATH_PREFIX": "",
  "PERSISTENT_TOKENS_KEY_PREFIX": "recodex",
  "ENVIRONMENTS_INFO_URL": "https://github.com/ReCodEx/wiki/wiki/Runtime-Environments",
  "ALLOW_LOCAL_REGISTRATION": false,
  "EXTERNAL_AUTH_URL": "https://some.other.domain/cas/",
  "EXTERNAL_AUTH_SERVICE_ID": "id-from-core-api",
  "EXTERNAL_AUTH_NAME": {
    "cs": "Univerzitní login",
    "en": "University login"
  },
  "EXTERNAL_AUTH_HELPDESK_URL": "mailto:cas@some.other.domain"
}
```

Meaning of individual values:

* `PORT` - On which port the node.js express server listens.
* `API_BASE` - URL of API to which the frontend is connected.
* `TITLE` - Prefix for the web page title.
* `SKIN` - Which [skin color](https://getbootstrap.com/docs/5.3/utilities/background/) of the AdminLTE should be used. This is only a color suffix (e.g., `success` or `primary`).
* `URL_PATH_PREFIX` - If the ReCodEx is not placed in the root path of the current domain, the path prefix should be placed here. This also allows running multiple ReCodEx frontends on one domain.
* `PERSISTENT_TOKENS_KEY_PREFIX` - Prefix used for security token identifiers (in cookies or in local storage). If you run multiple ReCodEx instances on the same domain, it might be necessary to give each instance different prefix.
* `ENVIRONMENTS_INFO_URL` - Link to a web page where individual runtime environments are explained (default refers to our wiki).
* `ALLOW_LOCAL_REGISTRATION` - Allows or disables different forms for registration. Note that this configuration should match which registration types are supported by the API.
* `EXTERNAL_AUTH_URL` - URL of external authentication service (that implements [ReCodEx protocol](https://github.com/ReCodEx/wiki/wiki/External-Authenticators)).
* `EXTERNAL_AUTH_SERVICE_ID` - Identifier (name) of the external authenticator as specified in core-api configuration (and in database).
* `EXTERNAL_AUTH_NAME` - Caption (string) or object with localized captions (keys are locales) of the service (will be displayed in UI).
* `EXTERNAL_AUTH_HELPDESK_URL` - URL for a link that is displayed in case CAS registration fails. The URL may be either `mailto:` URL (with email to tech support) or `http(s):` URL leading to a web page where help can be found.


## Usage

The application can be run in two modes, development and production. Development
mode uses only client rendering and tracks code changes with rebuilds of the
application in real time. In production mode the compilation (transpilling to _ES5_
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
$ node bin/server.mjs
```

Both modes can be configured to use different ports or set base address of used
API server. This can be configured in `.env` file in root of the repository.
There is `.env-sample` file which can be just copied and altered.

## Documentation

The description and documentation of the project is placed in the [global wiki](https://github.com/ReCodEx/wiki/wiki) of the ReCodEx project.
