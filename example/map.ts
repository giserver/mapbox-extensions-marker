import mapboxgl from 'mapbox-gl';
import 'mapbox-extensions';
import 'mapbox-extensions/dist/index.css'

import { MarkerControl, createGiserverMarkerManagerOptions } from '../lib/index';
import { SwitchMapControl } from 'mapbox-extensions';
import { en } from '../lib/common/lang';

const lightStyle = 'mapbox://styles/mapbox/light-v11';
let currentStyle = lightStyle;

mapboxgl.accessToken = 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w';

const map = new mapboxgl.Map({
    container: 'map',
    zoom: 10,
    center: [120.5, 31],
    pitch: 0,
    style: currentStyle
});

map.on('load', async () => {

    map.addControl(new SwitchMapControl({
        'showSatelliteDefault': true
    }))

    // const markerOptions= await createGiserverMarkerManagerOptions("http://localhost:5214/geo", "LZQGC");

    map.addControl(new MarkerControl({
        markerOptions : undefined
    }));
});

