import { ExportGeoJsonType } from "../types";
import { DxfConverter, FileType, GeoJsonConverter, IExportConverter, KmlConverter } from "./ExportConverter";
export default class Exporter {
    private converter: IExportConverter;
    /**
     *
     */
    constructor(converter: IExportConverter | FileType) {
        if (converter === 'dxf')
            this.converter = new DxfConverter();
        else if (converter === 'geojson')
            this.converter = new GeoJsonConverter();
        else if (converter === 'kml')
            this.converter = new KmlConverter();
        else
            this.converter = converter;
    }

    export(fileName: string, geojson: ExportGeoJsonType) {

        const url = window.URL || window.webkitURL || window;
        const blob = new Blob([this.converter.convert(geojson)]);
        const saveLink = document.createElement('a');
        saveLink.href = url.createObjectURL(blob);
        saveLink.download = fileName + "." + this.converter.type;
        saveLink.click();
    }
}