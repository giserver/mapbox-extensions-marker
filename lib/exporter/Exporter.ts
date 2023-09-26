import { array } from "wheater";
import { ExportGeoJsonType } from "../types";
import { FileType, IExportConverter, export_converters } from "./ExportConverter";

export default class Exporter {
    private converter: IExportConverter;
    /**
     *
     */
    constructor(converter: IExportConverter | FileType) {
        this.converter = typeof converter === 'string' ?
            array.first(export_converters, x => x.type === converter)! :
            converter;
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