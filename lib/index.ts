import MeasurePoint from 'mapbox-extensions/dist/features/Measure/MeasurePoint';
import MeasureLineString from 'mapbox-extensions/dist/features/Measure/MeasureLineString';
import MeasurePolygon from 'mapbox-extensions/dist/features/Measure/MeasurePolygon';
import MeasureBase, { MeasureType } from 'mapbox-extensions/dist/features/Measure/MeasureBase';

import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { createHtmlElement } from 'mapbox-extensions/dist/utils';

export interface MarkerGeometryProperty {
    'groupId': string,
    'label': string,
    'text-size'?: number,
    'text-color'?: string,
    'text-halo-color'?: string,
    'text-halo-width'?: number,

    'icon-image'?: string,
    'icon-size'?: number,
    'icon-color'?: string,

    'line-color'?: string,
    'line-width'?: number,


    'fill-color'?: string,
    'fill-opacity'?: number,
    'fill-outline-color'?: string,
}

interface MarkerOptions {
    onceDrawed(id: string, geometry: GeoJSON.Geometry, save: (style: MarkerGeometryProperty) => void, cancle: () => void): void
    features?: Array<GeoJSON.Feature>
}

interface MarkerPointOptions extends MarkerOptions {

}
interface MarkerLineStringOptions extends MarkerOptions {

}

interface MarkerPolygonOptioins extends MarkerOptions {

}

interface MarkerExtension {
    updateFeature(id: string, properties: MarkerGeometryProperty): GeoJSON.Feature | undefined;
    deleteGroupFeatures(groupId: string): boolean;
}

class MarkerPoint extends MeasurePoint implements MarkerExtension {

    /**
     *
     */
    constructor(map: mapboxgl.Map, options: MarkerPointOptions) {
        super(map, {
            onDrawed: (id, geometry) => {
                options.onceDrawed(id, geometry, properties => {
                    this.getFeatrue(id)!.properties = properties;
                }, () => {
                    this.deleteFeature(id);
                })
            }
        });
    }

    updateFeature(id: string, properties: MarkerGeometryProperty) {
        const feature = this.getFeatrue(id);
        if (feature) {
            feature.properties = properties;
            this.updateGeometryDataSource();
        }

        return feature;
    }

    deleteGroupFeatures(groupId: string): boolean {
        const deleteIds = this.geojson.features
            .filter(x => x.properties!.groupId === groupId)
            .map(x => x.id! as string);
        if (deleteIds.length > 0) {
            this.deleteFeature(...deleteIds);
        }

        return deleteIds.length > 0;
    }

    protected onInit(): void {
        super.onInit();
        const symbol = this.id + "_font";
        this.map.setLayoutProperty(this.id, "visibility", 'none');

        this.map.setLayoutProperty(symbol, "text-field", ['get', 'label']);
        this.map.setLayoutProperty(symbol, "text-size", ['get', 'text-size']);
        this.map.setPaintProperty(symbol, "text-color", ['get', 'text-color']);
        this.map.setPaintProperty(symbol, "text-halo-width", ['get', 'text-halo-width']);
        this.map.setPaintProperty(symbol, "text-halo-color", ['get', 'text-halo-color']);
        this.map.setLayoutProperty(symbol, 'text-variable-anchor', ['top', 'bottom', 'left', 'right'])

        this.map.setLayoutProperty(symbol, "icon-image", ['get', 'icon-image']);
        this.map.setLayoutProperty(symbol, "icon-size", ['get', 'icon-size']);
        this.map.setLayoutProperty(symbol, "icon-image", ['get', 'icon-image']);
        this.map.setPaintProperty(symbol, "icon-color", ['get', 'icon-color']);
    }
}

class MarkerLine extends MeasureLineString implements MarkerExtension {
    private centerPoints: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: []
    }

    get centerId() {
        return `${this.id}_center`;
    }

    constructor(map: mapboxgl.Map, options: MarkerLineStringOptions) {
        super(map, {
            onDrawed: (id, geometry) => {
                options.onceDrawed(id, geometry, properties => {
                    this.getFeatrue(id)!.properties = properties;

                    const centerFeature = turf.centroid(geometry);
                    centerFeature.id = id;
                    centerFeature.properties = properties;
                    this.centerPoints.features.push(centerFeature);

                }, () => this.deleteFeature(id))
            }
        });
    }

    protected onInit(): void {
        super.onInit();
        // 取消点显示
        this.map.setLayoutProperty(this.pointSourceId, "visibility", 'none');
        this.map.setLayoutProperty(this.pointSourceId + "_font", "visibility", 'none');

        this.map.addSource(this.centerId, {
            type: 'geojson',
            data: this.centerPoints
        });

        this.map.addLayer({
            id: this.centerId,
            type: 'symbol',
            source: this.centerId,
        });

        this.map.setLayoutProperty(this.centerId, "text-field", ['get', 'label']);
        this.map.setLayoutProperty(this.centerId, "text-size", ['get', 'text-size']);
        this.map.setPaintProperty(this.centerId, "text-color", ['get', 'text-color']);
        this.map.setPaintProperty(this.centerId, "text-halo-width", ['get', 'text-halo-width']);
        this.map.setPaintProperty(this.centerId, "text-halo-color", ['get', 'text-halo-color']);

        this.map.setPaintProperty(this.id, "line-color", ['get', 'line-color']);
        this.map.setPaintProperty(this.id, "line-width", ['get', 'line-width']);
    }

    protected updateGeometryDataSource() {
        super.updateGeometryDataSource();
        const dataSource = this.map.getSource(this.centerId) as mapboxgl.GeoJSONSource;
        dataSource.setData(this.centerPoints);
    }

    updateFeature(id: string, properties: MarkerGeometryProperty) {
        const feature = this.getFeatrue(id);
        if (feature) {
            feature.properties = properties;
            this.centerPoints.features.find(f => f.id === id)!.properties = properties;
            this.updateGeometryDataSource();
        }

        return feature;
    }

    deleteGroupFeatures(groupId: string): boolean {
        const deleteIds = this.geojson.features
            .filter(x => x.properties!.groupId === groupId)
            .map(x => x.id! as string);
        if (deleteIds.length > 0) {
            this.deleteFeature(...deleteIds);
        }

        return deleteIds.length > 0;
    }

    public deleteFeature(...ids: string[]): void {
        this.centerPoints.features = this.centerPoints.features.filter(f => !ids.some(id => id === f.id));
        super.deleteFeature(...ids);
    }
}

class MarkerPolygon extends MeasurePolygon implements MarkerExtension {
    constructor(map: mapboxgl.Map, options: MarkerPolygonOptioins) {
        super(map, {
            onDrawed: (id, geometry) => {
                options.onceDrawed(id, geometry,
                    properties => {
                        this.getFeatrue(id)!.properties = { id, ...properties };
                    }, () => {
                        this.deleteFeature(id);
                    })
            }
        });
    }

    updateFeature(id: string, properties: MarkerGeometryProperty) {
        const feature = this.getFeatrue(id);
        if (feature) {
            feature.properties = properties;
            this.updateGeometryDataSource();
        }
        return feature;
    }

    deleteGroupFeatures(groupId: string): boolean {
        const deleteIds = this.geojson.features
            .filter(x => x.properties!.groupId === groupId)
            .map(x => x.id! as string);
        if (deleteIds.length > 0) {
            this.deleteFeature(...deleteIds);
        }

        return deleteIds.length > 0;
    }

    protected onInit(): void {
        super.onInit();

        this.map.setLayoutProperty(this.pointSourceId, "text-field", ['get', 'label']);
        this.map.setLayoutProperty(this.pointSourceId, "text-size", ['get', 'text-size']);
        this.map.setPaintProperty(this.pointSourceId, "text-color", ['get', 'text-color']);
        this.map.setPaintProperty(this.pointSourceId, "text-halo-width", ['get', 'text-halo-width']);
        this.map.setPaintProperty(this.pointSourceId, "text-halo-color", ['get', 'text-halo-color']);

        this.map.setPaintProperty(this.id, "fill-color", ['get', 'fill-color']);
        this.map.setPaintProperty(this.id, "fill-opacity", ['get', 'fill-opacity']);
    }
}

type MarkerType = MarkerExtension & MeasureBase;
type MarkerGeometryType = MeasureType;

export interface CustomOptions {
    onCreateFeature?(feature: GeoJSON.Feature): void,
    onUpdateFeatureGeometry?(id: string, geom: GeoJSON.Geometry): void,
    onUpdateFeatureProperties?(id: string, properties: MarkerGeometryProperty): void,
    onDeleteFeature?(id: string): void,
    onDeleteGroupFeatures?(groupId: string): void
}

export type MarkerManagerOptions = {
    markerPointOptions: MarkerPointOptions,
    markerLineStringOptions: MarkerLineStringOptions,
    markerPolygonOptions: MarkerPolygonOptioins,
} & CustomOptions

export class MarkerManager {

    private readonly markers = new Map<MarkerGeometryType, MarkerType>();
    private currentMarker: MarkerType | undefined

    /**
     *
     */
    constructor(map: mapboxgl.Map, private options: MarkerManagerOptions) {
        this.markers.set('Point', new MarkerPoint(map, options.markerPointOptions));
        this.markers.set('LineString', new MarkerLine(map, options.markerLineStringOptions));
        this.markers.set('Polygon', new MarkerPolygon(map, options.markerPolygonOptions));
    }

    start(type: MarkerGeometryType) {
        this.currentMarker?.stop();
        this.currentMarker = this.markers.get(type);
    }

    stop() {
        this.currentMarker?.stop();
    }

    updateFeature(id: string, properties: MarkerGeometryProperty) {
        this.options.onUpdateFeatureProperties?.call(undefined, id, properties);

        for (const pair of this.markers) {
            if (pair[1].updateFeature(id, properties))
                return;
        }
    }

    deleteFeature(id: string) {
        this.options.onDeleteFeature?.call(undefined, id);
        for (const pair of this.markers) {
            if (pair[1].getFeatrue(id)) {
                pair[1].deleteFeature(id);
                return;
            }
        }
    }

    deleteGroupFeatures(groupId: string) {
        this.options.onDeleteGroupFeatures?.call(undefined, groupId);

        for (const pair of this.markers) {
            if (pair[1].deleteGroupFeatures(groupId))
                return;
        }
    }
}

type MarkerControlOptions = {
    geojson?: GeoJSON.FeatureCollection
} & CustomOptions


export default class MarkerControl implements mapboxgl.IControl {
    private svg = `<svg t="1682504808800" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8039" width="20" height="20"><path d="M870.749152 285.952684c-119.829156-18.639522-226.373751-96.27981-347.365382-168.544671-88.382956-52.788274-210.680327-80.161714-231.962026-23.908526l-0.002047 0.00921-204.553792 811.30376 0.243547 0.061399-0.243547 0.966001c-6.049786 23.99346 8.498558 48.350195 32.492018 54.39998 23.994484 6.049786 48.348148-8.498558 54.397935-32.493041L277.302165 517.059226c264.74978-8.919137 323.505975 178.528046 413.597853 193.338356 75.022671 12.331863 199.302185-222.300992 236.372475-324.757478 10.32209-28.52466 35.971259-85.299735-56.523341-99.68742z" fill="" p-id="8040"></path></svg>`
    private active = false;

    private container: HTMLDivElement;
    private containerOrgDisplay: string;

    /**
     *
     */
    constructor(markerContainer: HTMLDivElement | string, private options: MarkerControlOptions = {}) {
        this.container = typeof markerContainer == 'string' ?
            document.getElementById(markerContainer) as HTMLDivElement :
            markerContainer;

        this.containerOrgDisplay = this.container.style.display ?? "block";
        this.container.style.display = 'none';
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        const markerManager = this.createUI(map);

        const div = createHtmlElement("div", "jas-btn-hover", "jas-flex-center", "jas-ctrl-marker", "mapboxgl-ctrl", "mapboxgl-ctrl-group");
        div.innerHTML = this.svg;

        div.addEventListener('click', () => {

            if (this.active) {
                this.container.style.display = 'none';
            } else {
                this.container.style.display = this.containerOrgDisplay;
            }

            this.active = !this.active;
            div.classList.toggle("jas-ctrl-marker-active");
        });

        return div;
    }
    onRemove(map: mapboxgl.Map): void {
    }
    getDefaultPosition?: (() => string) | undefined;

    private createUI(map: mapboxgl.Map): MarkerManager {
        const markerManager = new MarkerManager(map, {
            'markerPointOptions': {
                features: this.filterFeatruesByGeometryType('Point'),
                onceDrawed: (id, geometry, save, cancle) => {

                    // 弹出样式编辑器

                    // if 点击确定 执行save 执行用户自定义回调

                    // else 点击取消或关闭 执行cancle
                }
            },
            'markerLineStringOptions': {
                features: this.filterFeatruesByGeometryType('LineString'),
                onceDrawed: (id, geometry, save, cancle) => {

                }
            },
            'markerPolygonOptions': {
                features: this.filterFeatruesByGeometryType('Polygon'),
                onceDrawed: (id, geometry, save, cancle) => {

                }
            },
            ...this.options
        });
        return markerManager;
    }

    private filterFeatruesByGeometryType(type: MarkerGeometryType) {
        if (!this.options.geojson) return undefined;
        return this.options.geojson.features.filter(x => x.geometry.type === type);
    }
}