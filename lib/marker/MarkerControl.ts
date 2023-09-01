import mapboxgl from "mapbox-gl";
import { UIPosition } from "mapbox-extensions/dist/controls/ExtendControl";
import { AbstractExtendControl } from 'mapbox-extensions/dist/controls/ExtendControl';
import SvgBuilder from "../common/svg";
import MarkerManager, { MarkerManagerOptions } from "./MarkerManager";

import '../index.css';
import 'mapbox-extensions/dist/index.css';
import { getMapMarkerSpriteImages } from "../symbol-icon";

export interface MarkerControlOptions {
    icon?: string | SVGElement
    position?: UIPosition,
    markerOptions?: MarkerManagerOptions
}

export default class MarkerControl extends AbstractExtendControl {
    private declare markerManager: MarkerManager;

    /**
     *
     */
    constructor(private ops: MarkerControlOptions = {}) {
        ops.icon ??= new SvgBuilder('flag').create();
        ops.position ??= 'top-right';
        ops.markerOptions ??= {};
        ops.markerOptions.drawAfterOffset ??= ops.position.endsWith("right") ? [-400, 0] : [400, 0];

        super({
            title: "标注",
            closeable: true,
            ...ops,
            img1: ops.icon
        });
    }

    createContent() {
        return (map: mapboxgl.Map) => {
            getMapMarkerSpriteImages(images => {
                images.forEach((v, k) => {
                    map.addImage(k, v.data, { sdf: true });
                });
            });

            this.markerManager = new MarkerManager(map, this.ops.markerOptions);

            this.emitter.on('openChange', open => {
                this.markerManager.setGeometryVisible(open);
            });

            return this.markerManager.htmlElement;
        }
    }

    onRemove(map: mapboxgl.Map): void {
        super.onRemove(map);

        this.markerManager.destroy();
    }
}