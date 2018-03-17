# Speck
> Speck is a molecule renderer with the goal of producing figures that are as attractive as they are practical. Express your molecule clearly _and_ with style.

[![NPM Version](https://img.shields.io/npm/v/speck-renderer.svg?style=flat-square)](https://www.npmjs.com/package/speck-renderer)
[![Downloads Stats](https://img.shields.io/npm/dw/speck-renderer.svg?style=flat-square)](https://www.npmjs.com/package/speck-renderer)
[![Waffle.io - Columns and their card count](https://badge.waffle.io/jordangarside/speck.svg?columns=In%20Progress,Done&style=flat-square)](https://waffle.io/jordangarside/speck)

[Demo](https://speck-renderer.herokuapp.com/) - [Original Project](https://github.com/wwwtyro/speck) - [More Images](https://github.com/jordangarside/speck/blob/master/images.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/wwwtyro/speck/gh-pages/static/screenshots/demo-2.png">
</p>

## Installation


```sh
npm install --save speck-renderer
```

## Usage example

```js
speck = new Speck({canvasContainerID: "speck-root", canvasID: "speck-canvas"});
speck.loadStructure(xyz);
```

```js
speck.destroy();
```

## Release History

* 0.0.7
    * Work in progress

## Meta

Jordan Garside – JordanGarside@gmail.com

Distributed under the Unlicense license. See ``LICENSE`` for more information.

## Contributing

1. Fork it (<https://github.com/jordangarside/speck/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

<!-- Markdown link & img dfn's -->
[npm-image]: https://img.shields.io/npm/v/datadog-metrics.svg?style=flat-square
[npm-url]: https://npmjs.org/package/datadog-metrics
[npm-downloads]: https://img.shields.io/npm/dm/datadog-metrics.svg?style=flat-square
[travis-image]: https://img.shields.io/travis/dbader/node-datadog-metrics/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/dbader/node-datadog-metrics
[wiki]: https://github.com/yourname/yourproject/wiki
