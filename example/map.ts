import mapboxgl from 'mapbox-gl';
import 'mapbox-extensions';
import 'mapbox-extensions/dist/index.css'

import { MarkerControl } from '../lib/index';
import {Measure2Control,SwitchLayerControl} from 'mapbox-extensions';

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

map.on('load', () => {
    map.addControl(new Measure2Control());
    map.addControl(new SwitchLayerControl({
        'layerGroups' : {
            '测试':{
                layers:[]
            }
        }
    }));
    map.addControl(new MarkerControl());
})

