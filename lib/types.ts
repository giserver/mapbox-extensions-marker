export interface GeometryStyle {
    textSize?:number,
    textColor?: string,

    pointIcon?:string,
    pointIconSize?:number,
    pointIconColor?:string,

    lineColor?: string,
    lineWidth?: number,

    polygonColor?: string,
    polygonOpacity?: number,
    polygonOutlineColor?: string,
    polygonOutlineWidth?: number
}

export interface MarkerFeatrueProperties extends GeometryStyle {
    id: string,
    name: string,
    layerId: string,
    date: number
}

export interface MarkerLayerProperties {
    id: string,
    name: string,
    date: number
}

export type MarkerFeatureType = GeoJSON.Feature<GeoJSON.Geometry, MarkerFeatrueProperties>;

export type ExportGeoJsonType = MarkerFeatureType | GeoJSON.FeatureCollection<GeoJSON.Geometry, MarkerFeatrueProperties>;