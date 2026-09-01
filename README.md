# ReCodEx

[![Build Status](https://github.com/ReCodEx/web-app/workflows/CI/badge.svg)](https://github.com/ReCodEx/web-app/actions)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![GitHub release](https://img.shields.io/github/release/recodex/web-app.svg)](https://github.com/ReCodEx/wiki/wiki/Changelog)
[![COPR](https://copr.fedorainfracloud.org/coprs/semai/ReCodEx/package/recodex-web/status_image/last_build.png)](https://copr.fedorainfracloud.org/coprs/semai/ReCodEx/)


## Installation

The web application requires a [NodeJS](https://nodejs.org/en/) 22+ server (LTS versions are preferred) as a runtime environment. However, some functionality is better handled by other full-fledged web servers, such as *Apache*, so the common practice is to use both in tandem. *NodeJS* takes care of the basic functionality of the app, while the other server (Apache) is set up as a reverse proxy and provides additional functionality such as SSL encryption, load balancing, or caching of static files.

The following instructions describe how to install the application. Configuration of Apache (or another web server) is not covered here.

### RPM package (recommended)

For Linux systems with RPM packages (RHEL, AlmaLinux, RockyLinux, Fedora), we provide prebuilt packages. They install the production bundle in the `/opt/recodex-web` directory and register a `recodex-web` systemd service.


### Installation from source

Alternatively, the application can be installed from source. First, clone the git repository to the desired application root directory (e.g., `/opt/recodex-web`):

```
$ git clone https://github.com/ReCodEx/web-app.git /opt/recodex-web
```

The app depends on several libraries and components, all of which are listed in the `package.json` file in the source repository. The `yarn` dependency manager is used to manage dependencies and must be installed separately. To fetch and install all dependencies, run:

```
$ sudo npm install yarn -g
$ yarn install
```

The app is built into a self-contained bundle for a NodeJS server managed as a systemd service:
```
$ yarn build
$ yarn deploy  # copies all necessary files to prod/ directory
```

Then, the `install/recodex-web.service` file should be copied to the systemd configuration directory (we recommend `/usr/lib/systemd/system/`) and changed to be owned by root. The parameters in the `.service` file need to be updated to reflect the correct path to the application. The `WorkingDirectory` should be `<app-root>/prod`, and `ExecStart` should point to the `<app-root>/prod/bin/server.mjs` script. Additionally, you may change the user and group to reflect the access rights to the application files (the default values assume the user and group are `recodex`).


### Post installation

After installation, the web application needs to be configured. The only configuration file is located at `/etc/recodex/web-app/env.json` (which is actually a link to `/opt/recodex-web/etc/env.json`). If you installed the application from source, the configuration file is in `<app-root>/prod/etc/env.json`. The configuration parameters are described below in the Configuration section.

Finally, the service can be started (and enabled for automatic startup) using the following commands:

```
$ systemctl daemon-reload
$ systemctl start recodex-web
$ systemctl enable recodex-web
```


## Environment variables

Create a `.env` file in the root directory and put the environment variables in this file. Look at the `.env-sample` file for example settings. The `.env` file should not be published in the Git repository. Environment variables are applied before the app is built, so they cannot be changed in the finished bundle.


### Supported variables and their default values

```
NODE_ENV=development
WEBPACK_DEV_SERVER_PORT=8081
LOGGER_MIDDLEWARE_VERBOSE=false
LOGGER_MIDDLEWARE_EXCEPTIONS=true
```

For production deployment, the `NODE_ENV` variable should be set to `production`.


## Configuration

Compiled bundle properties can be modified by a runtime configuration file. The file is located at `etc/env.json` (`prod/etc/env.json` when deployed from source). New values of these properties are applied after the app is restarted. Note that all these values are directly accessible to JavaScript code in browsers, so it is not a suitable place to store secrets.

The sample content of this file is as follows:

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
  "SHORT_SESSION": 15,
  "EXTERNAL_AUTH_URL": "https://some.other.domain/cas/",
  "EXTERNAL_AUTH_SERVICE_ID": "id-from-core-api",
  "EXTERNAL_AUTH_NAME": {
    "cs": "Univerzitní login",
    "en": "University login"
  },
  "EXTERNAL_AUTH_HELPDESK_URL": "mailto:cas@some.other.domain",
  "FAQ_URI": "https://raw.githubusercontent.com/wiki/ReCodEx/wiki/FAQ.md",
  "FAQ_FOR_ANON": false,
  "KNOWN_IPS": {
    "127.0.0.1": "localhost"
  }
}
```

Meaning of the individual values:

* `PORT` - The port on which the Node.js Express server listens.
* `API_BASE` - URL of the API to which the frontend is connected.
* `TITLE` - Prefix for the web page title.
* `SKIN` - Which [skin color](https://getbootstrap.com/docs/5.3/utilities/background/) of the AdminLTE should be used. This is only a color suffix (e.g., `success` or `primary`).
* `URL_PATH_PREFIX` - If ReCodEx is not placed in the root path of the current domain, the path prefix should be specified here. This also allows multiple ReCodEx frontends to run on one domain.
* `PERSISTENT_TOKENS_KEY_PREFIX` - Prefix used for security token identifiers (in cookies or local storage). If you run multiple ReCodEx instances on the same domain, it might be necessary to give each instance a different prefix.
* `ENVIRONMENTS_INFO_URL` - Link to a web page where individual runtime environments are explained (the default refers to our wiki).
* `ALLOW_LOCAL_REGISTRATION` - Allows or disables different forms for registration. Note that this configuration should match which registration types are supported by the API.
* `SHORT_SESSION` - Default expiration time (in minutes) of short sessions (if supported by the API). If set to `0` (or omitted), short sessions are disabled.
* `EXTERNAL_AUTH_URL` - URL of an external authentication service (that implements the [ReCodEx protocol](https://github.com/ReCodEx/wiki/wiki/External-Authenticators)).
* `EXTERNAL_AUTH_SERVICE_ID` - Identifier (name) of the external authenticator as specified in core-api configuration (and in database).
* `EXTERNAL_AUTH_NAME` - Caption (string) or object with localized captions (keys are locales) for the service (displayed in the UI).
* `EXTERNAL_AUTH_HELPDESK_URL` - URL for a link that is displayed if CAS registration fails. The URL may be either a `mailto:` URL (with an email address for technical support) or an `http(s):` URL leading to a web page where help can be found.
* `FAQ_URI` - URL of a web page with an FAQ (frequently asked questions) for users. The value may also be an object with localized URLs (keys are locales). This way, a ReCodEx instance can override the default FAQ page with its own localized version.
* `FAQ_FOR_ANON` - If set to `true`, the FAQ link is displayed for users that are not logged in.
* `KNOWN_IPS` - Object with known IP addresses and their captions. This translation is used in exam mode, where the IP addresses of locked users are displayed. It is more convenient for teachers to see PC names (possibly with room numbers and in-room locations) instead of IP addresses.

