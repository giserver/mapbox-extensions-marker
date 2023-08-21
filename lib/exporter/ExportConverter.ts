import tokml from '@maphubs/tokml';
import { DxfWriter, HatchBoundaryPaths, HatchPolylineBoundary, HatchPredefinedPatterns, LWPolylineVertex, pattern, vertex } from '@tarikjabiri/dxf';
import { coordConverter } from '../common/utils';
import { ExportGeoJsonType} from '../types';

export type FileType = 'dxf' | 'kml' | 'geojson';

export interface IExportConverter {
    readonly type: FileType;
    convert(geojson: ExportGeoJsonType): string;
}

export class DxfConverter implements IExportConverter {
    readonly type = 'dxf';

    convert(geojson:ExportGeoJsonType): string {
        const dxf = new DxfWriter();
        const featrues = geojson.type === "Feature" ? [geojson] : geojson.features;

        featrues.forEach(f => {
            switch (f.geometry.type) {
                case "Point":
                    const point = coordConverter.wgs84g_to_cgcs2000p([f.geometry.coordinates[0], f.geometry.coordinates[1]]);
                    dxf.addPoint(point[0], point[1], 0);
                    break;

                case "LineString":
                    const points = f.geometry.coordinates.map(coord => {
                        const point = coordConverter.wgs84g_to_cgcs2000p([coord[0], coord[1]]);
                        return { point: { x: point[0], y: point[1] } } as LWPolylineVertex;
                    })
                    dxf.addLWPolyline(points, { thickness: f.properties.lineWidth });
                    break;

                case "Polygon":
                    const solid = pattern({
                        name: HatchPredefinedPatterns.SOLID,
                    });

                    const boundary = new HatchBoundaryPaths();
                    boundary.addPolylineBoundary(new HatchPolylineBoundary(f.geometry.coordinates[0].map(coord => {
                        const point = coordConverter.wgs84g_to_cgcs2000p([coord[0], coord[1]]);
                        return vertex(point[0], point[1]);
                    })));

                    dxf.addHatch(boundary, solid);

                    break;
            }
        });

        return dxf.stringify();
    }
}

export class KmlConverter implements IExportConverter {
    readonly type = 'kml';
    convert(geojson: ExportGeoJsonType): string {
        return tokml(geojson);
    }
}

export class GeoJsonConverter implements IExportConverter {
    readonly type = 'geojson';
    convert(geojson: ExportGeoJsonType): string {
        return JSON.stringify(geojson);
    }
}