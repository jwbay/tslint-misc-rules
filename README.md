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
    "sort-imports": true
  },
  "rulesDirectory": [
    "./node_modules/tslint-misc-rules/rules"
  ]
}
```

# <span name="TOC">Rules</span>

1. [sort-imports](#1)
1. [prefer-es6-imports](#2)
1. [class-method-newlines](#3)
1. [jsx-attribute-spacing](#4)
1. [jsx-expression-spacing](#5)
1. [jsx-no-closing-bracket-newline](#6)
1. [jsx-no-braces-for-string-attributes](#7)
1. [react-lifecycle-order](#8)
1. [prefer-or-operator-over-ternary](#9)
1. [no-property-initializers](#10)
1. [camel-case-local-function](#11)
1. [declare-class-methods-after-use](#12)
1. [no-braces-for-single-line-arrow-functions](#13)
1. [no-unnecessary-parens-for-arrow-function-arguments](#14)

## <span name="1">"sort-imports"</span> [↑](#TOC) 
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

## <span name="2">"prefer-es6-imports"</span> [↑](#TOC)
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

## <span name="3">"class-method-newlines"</span> [↑](#TOC)
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


## <span name="4">"jsx-attribute-spacing"</span> [↑](#TOC)
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

## <span name="5">"jsx-expression-spacing"</span> [↑](#TOC)
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

## <span name="6">"jsx-no-closing-bracket-newline"</span> [↑](#TOC)
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

## <span name="7">"jsx-no-braces-for-string-attributes"</span> [↑](#TOC)
Fails:
```jsx
<div prop={ "value" }/>
```
Passes:
```jsx
<div prop="value"/>
```

## <span name="8">"react-lifecycle-order"</span> [↑](#TOC)
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

## <span name="9">"prefer-or-operator-over-ternary"</span> [↑](#TOC)
Fails:
```ts
const maybeFoo = foo ? foo : bar;
```

Passes:
```ts
const maybeFoo = foo || bar;
```

## <span name="10">"no-property-initializers"</span> [↑](#TOC)
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

## <span name="11">"camel-case-local-functions"</span> [↑](#TOC)
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

## <span name="12">"declare-class-methods-after-use"</span> [↑](#TOC)
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

## <span name="13">"no-braces-for-single-line-arrow-functions"</span> [↑](#TOC)
This rule supports autofixing.

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

## <span name="14">"no-unnecessary-parens-for-arrow-function-arguments"</span> [↑](#TOC)
Fails:
```ts
const log = (x) => console.log(x);
```
Passes:
```ts
const log = x => console.log(x);
```