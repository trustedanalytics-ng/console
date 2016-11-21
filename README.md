[![Build Status](https://travis-ci.org/trustedanalytics/console.svg)](https://travis-ci.org/trustedanalytics/console)
[![Dependency Status](https://www.versioneye.com/user/projects/572364f9ba37ce00350af4fc/badge.svg?style=flat)](https://www.versioneye.com/user/projects/572364f9ba37ce00350af4fc)
[![Code Climate](https://codeclimate.com/github/trustedanalytics/console/badges/gpa.svg)](https://codeclimate.com/github/trustedanalytics/console)

Console
=======

Console is an UI for Analytics PaaS. It has three main responsibilities:

 * static resources hosting (HTML, JS, etc.);
 * user authentication;
 * reverse proxy for services.

##Local Development

### Requirements
* Nodejs
* Ruby (tested on version 2.1.5)
* Compass (required to compile stylesheets) - to install type:
  ```
sudo gem install compass
```

### Running

Before running the console, you have to install Node dependencies, compile UI. After that you can start console running NPM start task

```
npm install
node ./node_modules/gulp/bin/gulp.js
npm start
```  

### Setting up dependencies
Console is only a reverse-proxy - it doesn't have application logic. To run and develop console locally, it's needed to configure the console to know where the dependencies are. There is no need to set up all dependent microservices at once. Most of the time developer works on 1-2 features and uses a few microservices only. 

Although, there is one project always required - [user-management](https://github.com/trustedanalytics/user-management) which is responsible for downloading user details, organizations list, etc. A whole list of dependencies is stored in [service-mapping.json](app/server/config/service-mapping.json).

To run the service locally or in TAP, a few environment variables with proper values inside needs to be defined:
```
export SSO_AUTHORIZATION_URI=https://uaa.<platform_domain>/oauth/authorize
export SSO_TOKEN_URI=https://uaa.<platform_domain>/oauth/token
export SSO_LOGOUT_URI=https://uaa.<platform_domain>/logout.do
export SSO_CLIENT_ID=console
export SSO_CLIENT_SECRET=<console_client_secret>
export PLATFORM_DOMAIN=<platform_domain>
export API_HOST=http://api.<platform_domain>
```

#### Binding to external microservices
It's the easiest way of setting up a local environment. The idea is to spin up locally only console and connect it to microservices already running on an external environment. It can be done be using proper ``<SERVICE_NAME>_HOST`` environment variables. For example if we want to connect to user-management service deployed on TAP externally we need to add an value to:
```
export USER_MANAGEMENT_HOST=https://user-management.<platform_domain>
```
All the properties used for external services binding can be found in [local-services.json](app/server/config/local-services.json) file. 

*Note that not all services are available externally. To connect to some of them, an ssh port forwarding might be needed*

#### Binding to local microservices
An alternative to binding to external services is setting up dependent microservices on a local machine. Having them running locally there is no need to configure anything if they are running on proper ports. Such mappings of port - microservice can be found in [local-services.json](app/server/config/local-services.json).
Instructions how to run particular microservices can be found in README of those projects.

### Developing web application
The backend part of the console is responsible only for authentication and reverse proxying the requests. The main content is the JavaScript code, which requires compilation from the source files (i.e. jade and scss) to browser readable formats.

#### Recompiling via Gulp
[Gulp](http://gulpjs.com/) is a NodeJS build system for web sites.

After downloading dependencies using NPM, it's possible to run Gulp from the console root directory, which will compile all of web sources and hot deploy them on the server.
```
./node_modules/gulp/bin/gulp.js
```

 It's also possible to install gulp globally:
```
npm install -g gulp
```

Since running whole build process takes some time, during development process it's handy to use `gulp watch` command which automatically recompiles proper part of the code after each file change.
```
$ gulp watch
[16:49:59] Using gulpfile ~/console/gulpfile.js
[16:49:59] Starting 'watch:app'...
[16:49:59] Finished 'watch:app' after 223 ms
[16:49:59] Starting 'watch:new-account'...
[16:49:59] Finished 'watch:new-account' after 12 ms
[16:49:59] Starting 'watch'...
[16:49:59] Finished 'watch' after 6.3 μs
[16:50:20] Starting 'scripts:app'...
[16:50:20] Finished 'scripts:app' after 454 ms

```

### Bumping version

Each commit to "master" branch requires bumping the patch version of the project. You can do it either by manually editing package.json or (preferred solution) by running 

```
npm version patch --no-git-tag-version

```

Running "npm version patch" without --no-git-tag-version option will result in creating a new commit and git tag 
