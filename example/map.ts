import mapboxgl from 'mapbox-gl';
import 'mapbox-extensions';
import 'mapbox-extensions/dist/index.css'

import { MarkerControl } from '../lib/index';
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

    map.addControl(new MarkerControl({
        markerOptions: {
            featureCollection: {
                type: 'FeatureCollection',
                features: [{ 
                    "type": "Feature", 
                    "geometry": { "type": "Polygon", "coordinates": [[[120.49867589000883, 31.132121689741965], [120.49798937907525, 31.051581162855], [120.66481154289812, 31.134472214486294], [120.57350558878807, 31.183819720866595], [120.52133075786622, 31.18969271190261], [120.49867589000883, 31.132121689741965]]] }, 
                    "properties": { "id": "d8e3ca79-fe69-4792-9e93-c2e3fc64c237", "name": "标注", "layerId": "84d4ff03-f322-49ab-abda-52832f788709", "date": 1695713839586, "style": { "textSize": 14, "textColor": "black", "textHaloColor": "white", "textHaloWidth": 1, "pointIcon": "标1.png", "pointIconColor": "#ff0000", "pointIconSize": 0.3, "lineColor": "#0000ff", "lineWidth": 3, "polygonColor": "#0000ff", "polygonOpacity": 0.5, "polygonOutlineColor": "#000000", "polygonOutlineWidth": 2 } } }]
            },
            layers:[{
                id:'84d4ff03-f322-49ab-abda-52832f788709',
                name: 'ff',
                date:12312321
            }]
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

