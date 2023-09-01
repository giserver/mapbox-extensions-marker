import mapboxgl from 'mapbox-gl';
import 'mapbox-extensions';
import 'mapbox-extensions/dist/index.css'

import { MarkerControl } from '../lib/index';
import { Measure2Control, SwitchLayerControl } from 'mapbox-extensions';

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
    map.addControl(new Measure2Control());
    map.addControl(new SwitchLayerControl({
        'layerGroups': {
            '测试': {
                layers: []
            }
        }
    }));

    // let res = await fetch(composeUrl("markers"));
    // const markers = await res.json();
    // res = await fetch(composeUrl("layers"));
    // const layers = await res.json();

    map.addControl(new MarkerControl({
        markerOptions: {
            // featureCollection:{
            //     type:'FeatureCollection',
            //     features:[{
            //         type:'Feature',
            //         properties:{
            //             id:'',
            //             date:1,
            //             layerId:'1',
            //             name: 'ff测试',
            //             style:{}
            //         },
            //         geometry:{
            //             type:'MultiPolygon',
            //             coordinates:[[[[121,30],[121,31],[120,31],[120,30],[121,30]]]]
            //         }
            //     }]
            // },
            // layers:[
            //     {
            //         id:'1',
            //         date:1,
            //         name:'1'
            //     }
            // ]
            // featureCollection: markers,
            // layers,
            // layerOptions: {
            //     onCreate: async l => {
            //         await fetch(composeUrl("layers"), {
            //             method: 'POST',
            //             body: JSON.stringify(l),
            //             headers: new Headers({
            //                 'Content-Type': 'application/json'
            //             })
            //         });
            //     },
            //     onRemove: async l => {
            //         await fetch(composeUrl(`layers/${l.id}`), {
            //             method: "DELETE"
            //         });
            //     },
            //     onRename: async l => {
            //         await fetch(composeUrl('layers'), {
            //             method: "PUT",
            //             body: JSON.stringify(l),
            //             headers: new Headers({
            //                 'Content-Type': 'application/json'
            //             })
            //         })
            //     },
            //     markerItemOptions: {
            //         onCreate: async m => {
            //             const dto = {
            //                 ...m.properties,
            //                 geom:m.geometry,
            //             };
            //             await fetch(composeUrl("markers"), {
            //                 method: 'POST',
            //                 body: JSON.stringify(dto),
            //                 headers: new Headers({
            //                     'Content-Type': 'application/json'
            //                 })
            //             });
            //         },
            //         onRemove: async m => {
            //             await fetch(composeUrl(`markers/${m.properties.id}`), {
            //                 method: "DELETE"
            //             });
            //         },
            //         onUpdate: async m => {
            //             const dto = {
            //                 ...m.properties,
            //                 geom:m.geometry,
            //             };
            //             await fetch(composeUrl('markers'), {
            //                 method: "PUT",
            //                 body: JSON.stringify(dto),
            //                 headers: new Headers({
            //                     'Content-Type': 'application/json'
            //                 })
            //             })
            //         }
            //     }
            // }
        }
    }));
});

