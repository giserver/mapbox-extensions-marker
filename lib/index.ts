import MeasurePoint from 'mapbox-extensions/dist/features/Measure/MeasurePoint';
import MeasureLineString from 'mapbox-extensions/dist/features/Measure/MeasureLineString';
import MeasurePolygon from 'mapbox-extensions/dist/features/Measure/MeasurePolygon';
import mapboxgl from 'mapbox-gl';


export interface GeometryStyle {
    'label': string,
    'text-size'?: number,
    'text-color'?: string,
    'text-halo-color'?: string,
    'text-halo-width'?: number,
    'icon-image'?: string,
    'icon-size'?: number,
    'icon-color'?: string,
}

export interface MarkerOptions {
    onceDrawed(id: string, geometry: GeoJSON.Geometry, save: (style: GeometryStyle) => void, cancle: () => void): void
}

export interface MarkerPointOptions extends MarkerOptions {

}
export interface MarkerLineStringOptions {

}

export interface MarkerPolygonOptioins {

}

export class MarkerPoint extends MeasurePoint {

    /**
     *
     */
    constructor(map: mapboxgl.Map, options: MarkerPointOptions) {
        super(map, {
            createText: () => "",
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
        this.map.setLayoutProperty(symbol, 'text-variable-anchor', ['top', 'bottom', 'left', 'right'])

        this.map.setLayoutProperty(symbol, "icon-image", ['get', 'icon-image']);
        this.map.setLayoutProperty(symbol, "icon-size", ['get', 'icon-size']);
        this.map.setLayoutProperty(symbol, "icon-image", ['get', 'icon-image']);

        this.map.setPaintProperty(symbol, "text-color", ['get', 'text-color']);
        this.map.setPaintProperty(symbol, "text-halo-width", ['get', 'text-halo-width']);
        this.map.setPaintProperty(symbol, "text-halo-color", ['get', 'text-halo-color']);

        this.map.setPaintProperty(symbol, "icon-color", ['get', 'icon-color']);
    }
}

export class MarkerLine extends MeasureLineString {
    constructor(map: mapboxgl.Map, options: MarkerLineStringOptions) {
        super(map, { ...options, segmentTextSize: 0, segmentPointSize: 0, centerTextSize: 0, });
    }

    protected onInit(): void {
        super.onInit();
        // 取消点显示
        this.map.setLayoutProperty(this.pointSourceId, "visibility", 'none');
    }
}

export class MarkerPolygon extends MeasurePolygon {
    constructor(map: mapboxgl.Map, options: MarkerPolygonOptioins) {
        super(map, options);
    }

    protected onInit(): void {
        super.onInit();
        // 取消点显示
        this.map.setLayoutProperty(this.pointSourceId, "visibility", 'none');
    }
}