import mapboxgl from "mapbox-gl";
import { ExtendControl } from "mapbox-extensions";
import { UIPosition } from "mapbox-extensions/dist/controls/ExtendControl";
import { createHtmlElement } from "../common/utils";
import SvgBuilder from "../common/svg";
import MarkerManager from "./MarkerManager";

import '../index.css';
import 'mapbox-extensions/dist/index.css';
import { getMapMarkerSpriteImages } from "../symbol-icon";

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

        getMapMarkerSpriteImages(images => {
            images.forEach((v, k) => {
                map.addImage(k, v.data, { sdf: true });
            });
        });

        const extend = new ExtendControl({
            title: "标注",
            closeable: true,
            ...this.options,
            content : new MarkerManager(map).htmlElement,
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