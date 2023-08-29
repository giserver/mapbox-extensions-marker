import mapboxgl from "mapbox-gl";
import { UIPosition } from "mapbox-extensions/dist/controls/ExtendControl";
import {AbstractExtendControl} from 'mapbox-extensions/dist/controls/ExtendControl';
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

export default class MarkerControl extends AbstractExtendControl {

    /**
     *
     */
    constructor(private ops: MarkerControlOptions = {}) {
        ops.icon ??= new SvgBuilder('flag').create();
        ops.position ??= 'top-right';

        super({
            title: "标注",
            closeable: true,
            ...ops,
            img1: ops.icon
        });
    }

    createContent(){
        return (map:mapboxgl.Map)=>{
            getMapMarkerSpriteImages(images => {
                images.forEach((v, k) => {
                    map.addImage(k, v.data, { sdf: true });
                });
            });

            const manager = new MarkerManager(map, this.ops.markerOptions);

            this.emitter.on('openChange',open=>{
                manager.setGeometryVisible(open);
            });

            return manager.htmlElement;
        }
    }

    onRemove(map: mapboxgl.Map): void {
        emitter.all.forEach((v)=>{
            v.length = 0;
        });
    }
}