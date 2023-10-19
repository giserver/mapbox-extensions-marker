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

function composeUrl(template: string) {
    return `http://localhost:5092/geo/${template}`;
}



map.on('load', async () => {

    // let res = await fetch(composeUrl("markers"));
    // const markers = await res.json();
    // res = await fetch(composeUrl("layers"));
    // const layers = await res.json();

    map.addControl(new SwitchMapControl({
        'showSatelliteDefault': true
    }))

    const markerOptions= await createGiserverMarkerManagerOptions("http://localhost:5214/geo", "LZQGC");

    console.log(markerOptions);

    map.addControl(new MarkerControl({
        markerOptions
    }));
});

