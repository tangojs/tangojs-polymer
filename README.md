# \<tangojs-polymer\>

Polymer mixins for TangoJS

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your element locally.

This project is dependant on the tangojs-core project which is accessible through npm. Polymer 2.0 use bower as package manager but the next version will use npm. So there is no point to move now tangojs-core to bower.

To install tangojs-core and its mtango plugin:
```
$ npm install tangojs
$ npm install tangojs-connector-mtango
```

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
