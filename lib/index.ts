import MeasurePoint from 'mapbox-extensions/dist/features/Measure/MeasurePoint';
import MeasureLineString from 'mapbox-extensions/dist/features/Measure/MeasureLineString';
import MeasurePolygon from 'mapbox-extensions/dist/features/Measure/MeasurePolygon';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';


export interface GeometryStyle {
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

export interface MarkerOptions {
    onceDrawed(id: string, geometry: GeoJSON.Geometry, save: (style: GeometryStyle) => void, cancle: () => void): void
    geojson?: GeoJSON.FeatureCollection
}

export interface MarkerPointOptions extends MarkerOptions {

}
export interface MarkerLineStringOptions extends MarkerOptions {

}

export interface MarkerPolygonOptioins extends MarkerOptions {

}

export class MarkerPoint extends MeasurePoint {

    /**
     *
     */
    constructor(map: mapboxgl.Map, options: MarkerPointOptions) {
        super(map, {
            onDrawed: (id, geometry) => {
                options.onceDrawed(id, geometry, style => {
                    this.getFeatrue(id)!.properties = style;
                    this.updateGeometryDataSource();
                }, () => {
                    this.deleteFeature(id);
                })
            }
        });
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

export class MarkerLine extends MeasureLineString {
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
                options.onceDrawed(id, geometry, style => {
                    this.getFeatrue(id)!.properties = style;

                    const centerFeature = turf.centroid(geometry);
                    centerFeature.properties = style;
                    this.centerPoints.features.push(centerFeature);
                    this.updateCenterGeojsonSouce();
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

    private updateCenterGeojsonSouce() {
        const dataSource = this.map.getSource(this.centerId) as mapboxgl.GeoJSONSource;
        dataSource.setData(this.centerPoints);
    }
}

export class MarkerPolygon extends MeasurePolygon {
    constructor(map: mapboxgl.Map, options: MarkerPolygonOptioins) {
        super(map, {
            onDrawed: (id, geometry) => {
                options.onceDrawed(id, geometry,
                    style => {
                        this.getFeatrue(id)!.properties = style;
                        this.updateGeometryDataSource();
                    }, () => {
                        this.deleteFeature(id);
                    })
            }
        });
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
        this.map.setPaintProperty(this.id, "fill-outline-color", ['get', 'fill-outline-color'])
    }
}