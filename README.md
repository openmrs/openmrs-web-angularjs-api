[![Build Status](https://travis-ci.org/openmrs/openmrs-web-angularjs-api.svg?branch=master)](https://travis-ci.org/openmrs/openmrs-web-angularjs-api)

JavaScript AngularJS (1.x) library exposing OpenMRS API

# Usage

`npm install @openmrs/angularjs-openmrs-api --save`

ES6: `import openmrsApi from '@openmrs/angularjs-openmrs-api'`;

ES5: `var openmrsApi = require('@openmrs/angularjs-openmrs-api')`;

# Development

You need to have Node 6.x installed. We recommend using [nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to install Node.

Installing dependencies: `npm install` (once after code checkout or when dependencies change)

Development build: `npm run build:dev`

Clean build: `npm run clean && npm run build:dev`

Running tests continously: `npm run test:dev`

Production build: `npm run build`

Release: `npm version 1.0.0 && git push upstream master && git push upstream --tags`

## Linking

Linking is a feature of npm, which allows you to modify the library and test modifications in your project.  
1) Run `npm link` and `npm run build` from the lib directory.
2) Run `npm link @openmrs/angularjs-openmrs-api` from your project directory.
3) Build your project.

In order to unlink do:
1) Run `npm unlink @openmrs/angularjs-openmrs-api` and `npm install` from your project directory.
2) Build your project.
