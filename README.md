# mapbox-extensions-marker
[![npm](https://img.shields.io/npm/v/mapbox-extensions-marker)](https://www.npmjs.com/package/mapbox-extensions-marker)  
## DEMO
[examples](https://cocaine-coder.github.io/mapbox-extensions-marker/example-dist/)

## usage  

### install
#### npm
```shell
npm install mapbox-extensions-marker
```

#### yarn
```shell
yarn add mapbox-extensions-marker
```

### code

``` ts
import { MarkerControl } from 'mapbox-extensions-marker'
import 'mapbox-extensions-marker/dist/index.css'

map.addControl(new MarkerControl({}));
```