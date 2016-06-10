[![Build Status](https://travis-ci.org/jwbay/tslint-misc-rules.svg?branch=master)](https://travis-ci.org/jwbay/tslint-misc-rules)
[![npm version](https://img.shields.io/npm/v/tslint-misc-rules.svg?style=flat-square)](https://www.npmjs.com/package/tslint-misc-rules)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/jwbay/tslint-misc-rules/pulls)
# misc-tslint-rules

Collection of miscellaneous TSLint rules

1. `$ npm install tslint-misc-rules --save-dev`
2. Add the path to it to your tslint.json and add some rules:

```json
{
  "rules": {
    "sort-imports": true,
    "prefer-es6-imports": [
      true,
      "module1",
      "module2"
    ],
    "class-method-newlines": true,
    "jsx-attribute-spacing": true,
    "jsx-expression-spacing": true,
    "jsx-no-braces-for-string-attributes": true
  },
  "rulesDirectory": [
    "./node_modules/tslint-misc-rules/rules"
  ]
}
```

# Rules
## "sort-imports"
Fails:
```ts
import b from "b";
import a from "a";
```
Passes:
```ts
import a from "a";
import b from "b";
```
Blocks are grouped, so this also passes:
```ts
import a from "a";
import z from "z";
testSetup();
import c from "c";
import d from "d";
```
Precedence is essentially `*`, `{`, then alpha, so:
```ts
import * as a from "a";
import { b, c } from "bc";
import d from "d";
```

## "prefer-es6-imports"
```json
{
  "prefer-es6-imports": [
    true,
    "module1"
  ]
}
```
Fails:
```ts
import mod = require("module1");
import mod = require("path/to/module1");
import mod = require("../module1");
```

## "class-method-newlines"
Ensure each method in class is preceded by a newline.  

Fails:
```ts
class foo {
    propertyOne: any;
    propertyTwo: any;
    one() {
    }
    two() {
    }
}
```

Passes:
```ts
class foo {
    propertyOne: any;
    propertyTwo: any;

    one() {
    }

    two() {
    }
}
```

The first method is exempt, so this also passes:
```ts
class foo {
    one() {
    }

    two() {
    }
}
```


## "jsx-attribute-spacing"
Fails:
```jsx
<div prop = { value }/>
<div prop= { value }/>
<div prop ={ value }/>
```
Passes:
```jsx
<div prop={ value }/>
```

## "jsx-expression-spacing"
Fails:
```jsx
<div prop={value}/>
<div prop={ value}/>
<div prop={value }/>
<div>
  {value}
  { value}
  {value }
</div>
```
Passes:
```jsx
<div prop={ value }/>
<div>
  { value }
</div>
```

## "jsx-no-braces-for-string-attributes"
Fails:
```jsx
<div prop={ "value" }/>
```
Passes:
```jsx
<div prop="value"/>
```