import mapboxgl from "mapbox-gl";
import { ExtendControl } from "mapbox-extensions";
import { UIPosition } from "mapbox-extensions/dist/controls/ExtendControl";
import SvgBuilder from "../common/svg";
import MarkerManager, { MarkerManagerOptions } from "./MarkerManager";

import '../index.css';
import 'mapbox-extensions/dist/index.css';
import { getMapMarkerSpriteImages } from "../symbol-icon";
import emitter from "../common/events";

export interface MarkerControlOptions {
    icon?: string | SVGElement
    position?: UIPosition,
    markerOptions?: MarkerManagerOptions
}

export default class MarkerControl implements mapboxgl.IControl {

    private htmlElement? : HTMLElement

    /**
     *
     */
    constructor(private options: MarkerControlOptions = {}) {
        this.options.icon ??= new SvgBuilder('flag').create();
        this.options.position ??= 'top-right';
    }

    onAdd(map: mapboxgl.Map): HTMLElement {

        getMapMarkerSpriteImages(images => {
            images.forEach((v, k) => {
                map.addImage(k, v.data, { sdf: true });
            });
        });

        const manager = new MarkerManager(map, this.options.markerOptions);

        const extend = new ExtendControl({
            title: "标注",
            closeable: true,
            ...this.options,
            content: manager.htmlElement,
            titleSlot: manager.extendHeaderSlot,
            img1: this.options.icon,
            onChange: (open) => {
                manager.setGeometryVisible(open);
            }
        });

        this.htmlElement = extend.onAdd(map);
        return this.htmlElement;
    }

    onRemove(map: mapboxgl.Map): void {
        this.htmlElement?.remove();
        emitter.all.forEach((v)=>{
            v.length = 0;
        });
    }

    getDefaultPosition (){
        return this.options.position!;
    };
}