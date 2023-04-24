import mapboxgl from 'mapbox-gl';
import 'mapbox-extensions';
import '../lib/index.css';
import { MarkerLine, MarkerPoint, MarkerPolygon } from '../lib';

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

    map.loadImage("./marker.png", (err, img) => {
        if (err || !img) throw err;

        map.addImage("jas-custom-marker", img, { sdf: true });

        new MarkerLine(map, {
            onceDrawed: (id, geometry, save, cancle) => {
                save({
                    label: 'test',
                    "text-size": 15,
                    'text-color': 'red',
                    'text-halo-width': 1,
                    'text-halo-color': '#ffffff',
                    'icon-image': 'jas-custom-marker',
                    'icon-size': 1,
                    'icon-color': 'red',
                    'line-color': 'red',
                    'line-width': 10
                })
            }
        }).start();
    })


})

