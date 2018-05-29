[![Build Status](https://travis-ci.org/jwbay/tslint-misc-rules.svg?branch=master)](https://travis-ci.org/jwbay/tslint-misc-rules)
[![npm version](https://img.shields.io/npm/v/tslint-misc-rules.svg?style=flat-square)](https://www.npmjs.com/package/tslint-misc-rules)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/jwbay/tslint-misc-rules/pulls)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![BADGINATOR](https://badginator.herokuapp.com/jwbay/tslint-misc-rules.svg)](https://github.com/defunctzombie/badginator)
# misc-tslint-rules

Collection of miscellaneous TSLint rules

1. `$ npm install tslint-misc-rules --save-dev`
2. Add the path to it to your tslint.json and add some rules:

```json
{
  "rules": {
    "sort-imports": true
  },
  "rulesDirectory": [
    "tslint-misc-rules"
  ]
}
```

# <a name="TOC"></a>Rules

1. [sort-imports](#1) [has autofix]
1. [prefer-es6-imports](#2)
1. [class-method-newlines](#3) [has autofix]
1. [jsx-attribute-spacing](#4) [has autofix]
1. [jsx-expression-spacing](#5) [has autofix]
1. [jsx-no-closing-bracket-newline](#6) [has autofix]
1. [jsx-no-braces-for-string-attributes](#7) [has autofix]
1. [react-lifecycle-order](#8)
1. [prefer-or-operator-over-ternary](#9) [has autofix]
1. [no-property-initializers](#10)
1. [camel-case-local-function](#11)
1. [declare-class-methods-after-use](#12)
1. [no-braces-for-single-line-arrow-functions](#13) [has autofix]
1. [no-unnecessary-parens-for-arrow-function-arguments](#14)

## <a name="1"></a>"sort-imports" [↑](#TOC)
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
This rule has one option, `whitespace-insensitive`, that collapses all whitespace spans (including line breaks) down to one space when sorting. This provides compatibility with formatters like Prettier, which may decide to turn a single-line import into a multi-line import when it grows too long. This could otherwise introduce a lint failure. Ex:

```json
"sort-imports": [ true, "whitespace-insensitive" ]
```
Fails:
```ts
import {
  x,
  y,
} from "xy";
import { a } from "a";
```
Passes:
```ts
import { a } from "a";
import {
  x,
  y,
} from "xy";
```

## <a name="2"></a>"prefer-es6-imports" [↑](#TOC)
With configuration (required):
```json
{
  "prefer-es6-imports": [
    true,
    "module-name"
  ]
}
```
Fails:
```ts
import mod = require("module-name");
import mod = require("path/to/module-name");
import mod = require("../module-name");
```

## <a name="3"></a>"class-method-newlines" [↑](#TOC)
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


## <a name="4"></a>"jsx-attribute-spacing" [↑](#TOC)
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

## <a name="5"></a>"jsx-expression-spacing" [↑](#TOC)
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

## <a name="6"></a>"jsx-no-closing-bracket-newline" [↑](#TOC)
Fails:
```jsx
  <a className="asdf"
      href="/foo"
  />

  <div
      className="qwer"
      name="asdf"
  >
      text
  </div>
```

Passes:
```jsx
  <a className="asdf"
      href="/foo" />

  <div
      className="qwer"
      name="asdf">
      text
  </div>
```

## <a name="7"></a>"jsx-no-braces-for-string-attributes" [↑](#TOC)
Fails:
```jsx
<div prop={ "value" }/>
```
Passes:
```jsx
<div prop="value"/>
```

## <a name="8"></a>"react-lifecycle-order" [↑](#TOC)
With configuration (optional):
```json
{
  "react-lifecycle-order": [
    true,
    "componentWillMount",
    "render",
    "componentWillUnmount"
  ]
}
```
Fails:
```ts
class extends React.Component {
    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render() {
    }
}
```

Passes:
```ts
class extends React.Component {
    componentWillMount() {
    }

    render() {
    }

    componentWillUnmount() {
    }
}
```

If configuration is not specified, React's [invocation order](https://facebook.github.io/react/docs/component-specs.html#lifecycle-methods) is used.

## <a name="9"></a>"prefer-or-operator-over-ternary" [↑](#TOC)
Fails:
```ts
const maybeFoo = foo ? foo : bar;
```

Passes:
```ts
const maybeFoo = foo || bar;
```

## <a name="10"></a>"no-property-initializers" [↑](#TOC)
Fails:
```ts
class foo {
  bar = 42;
}
```

Passes:
```ts
class foo {
  bar: number;
}
```

## <a name="11"></a>"camel-case-local-functions" [↑](#TOC)
Due to React's Stateless Functional Components, this rule checks callsites rather than declarations.  
Fails:
```ts
import FooImport from 'foo';

function FooDeclaration() { }

FooImport();
FooDeclaration();
```

Passes:
```jsx
import fooImport from 'foo';

function fooDeclaration() { }
function SomeSFC(props) { return null; }

fooImport();
fooDeclaration();
const el = </SomeSFC>;
```

## <a name="12"></a>"declare-class-methods-after-use" [↑](#TOC)
Fails:
```ts
class foo {
    bar() {
    }

    foo() {
      this.bar();
    }
}
```

Passes:
```ts
class foo {
    foo() {
      this.bar();
    }

    bar() {
    }
}
```

## <a name="13"></a>"no-braces-for-single-line-arrow-functions" [↑](#TOC)

Fails:
```ts
const add = (x, y) => { return x + y };
const btn = <button onClick={ e => { console.log(e); } } />;
```
Passes:
```ts
const add = (x, y) => x + y;
const btn = <button onClick={ e => console.log(e) } />;
```

## <a name="14"></a>"no-unnecessary-parens-for-arrow-function-arguments" [↑](#TOC)
Fails:
```ts
const log = (x) => console.log(x);
```
Passes:
```ts
const log = x => console.log(x);
```
