import mapboxgl from "mapbox-gl";
import { ExtendControl } from "mapbox-extensions";
import { UIPosition } from "mapbox-extensions/dist/controls/ExtendControl";
import { createHtmlElement, getSpriteImages } from "../common/utils";
import SvgBuilder from "../common/svg";
import MarkerManager from "./MarkerManager";

import '../index.css';
import 'mapbox-extensions/dist/index.css';

export interface MarkerControlOptions {
    icon?: string | SVGElement
    position?: UIPosition
}

export default class MarkerControl implements mapboxgl.IControl {

    /**
     *
     */
    constructor(private options: MarkerControlOptions = {}) {
        this.options.icon ??= new SvgBuilder('flag').create();
        this.options.position ??= 'top-right';
    }

    onAdd(map: mapboxgl.Map): HTMLElement {


        getSpriteImages(images => {
            images.forEach((v, k) => {
                map.addImage(k, v, { sdf: true });
            });

            map.addLayer({
                'id': 'foo',
                'type': 'symbol',
                "source": {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [120.5, 31]
                        },
                        properties: {}
                    },
                },
                layout: {
                    "icon-image": "marker1.png",
                },
                paint: {
                    "icon-color": 'red'
                }
            });
        });

        const content = createHtmlElement('div');
        content.style.height = "600px";
        content.append(new MarkerManager(map).htmlElement);

        const extend = new ExtendControl({
            title: "标注",
            closeable: true,
            ...this.options,
            content,
            img1: this.options.icon,
            onChange: (open) => {
                if (!open) {

                }
            }
        });

        setTimeout(() => {
            extend.open = true;
        }, 100);

        return extend.onAdd(map);
    }

    onRemove(map: mapboxgl.Map): void {
    }

    getDefaultPosition?: (() => string) | undefined;
}