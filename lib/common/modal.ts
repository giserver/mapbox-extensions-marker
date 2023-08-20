import Exporter from "../exporter/Exporter";
import { ExportGeoJsonType, MarkerFeatrueProperties, MarkerFeatureType } from "../types";
import SvgBuilder from "./svg";
import { createHtmlElement } from "./utils";
import { deep } from 'wheater';

export interface ModalOptions {
    content: HTMLElement | string,
    title?: string,
    onCancel?(): void,
}

export interface ConfirmModalOptions extends ModalOptions {
    onConfirm?(): void,
    withCancel?: boolean
}

export function createModal(options: ModalOptions) {

    const modal = createHtmlElement('div', 'jas-modal');
    const container = createHtmlElement('div', 'jas-modal-container');

    const header = createHtmlElement('div', 'jas-modal-header');
    const titleDiv = createHtmlElement('div', 'jas-modal-header-title');
    const closeBtn = new SvgBuilder('X').create('svg');

    titleDiv.innerText = options.title ?? '';
    closeBtn.style.cursor = 'pointer'
    closeBtn.addEventListener('click', () => {
        options.onCancel?.call(undefined);
        modal.remove();
    });

    header.append(titleDiv);
    header.append(closeBtn);
    container.append(header);
    container.append(options.content);

    modal.append(container);
    document.body.append(modal);

    const escPress = (e: KeyboardEvent) => {
        if (e.code.toLocaleLowerCase() === 'escape') {
            document.removeEventListener('keydown', escPress);
            options.onCancel?.call(undefined);
            modal.remove();
        }
    }
    document.addEventListener('keydown', escPress);
    return [modal, container];
}

export function createConfirmModal(options: ConfirmModalOptions) {
    options.withCancel ??= true;
    const [modal, container] = createModal(options);
    const footDiv = createHtmlElement('div', 'jas-modal-foot');

    const confirmBtn = createHtmlElement('button', 'jas-btn', 'jas-btn-confirm');
    const cancleBtn = createHtmlElement('button', 'jas-btn', 'jas-btn-default');
    confirmBtn.innerText = "确定";
    cancleBtn.innerText = "取消";

    confirmBtn.addEventListener('click', () => {
        options.onConfirm?.call(undefined);
        modal.remove();
    });
    cancleBtn.addEventListener('click', () => {
        options.onCancel?.call(undefined);
        modal.remove();
    });

    footDiv.append(confirmBtn);
    if (options.withCancel)
        footDiv.append(cancleBtn);
    container.append(footDiv);
}

export function createExportGeoJsonModal(fileName: string, geojson: ExportGeoJsonType) {
    const content = createHtmlElement('div');
    content.style.display = 'flex';
    content.style.justifyContent = 'space-between';

    const fileTypeLabel = createHtmlElement('span');
    fileTypeLabel.innerText = "文件类型"
    const select = createHtmlElement('select');
    select.innerHTML = `
        <option value="dxf">dxf</option>
        <option value="kml">kml</option>
        <option value="geojson">geojson</option>
    `
    select.style.outline = 'none'

    content.append(fileTypeLabel, select);

    createConfirmModal({
        title: "导出",
        content,
        onCancel: () => { },
        onConfirm: () => {
            new Exporter(select.selectedOptions[0].value as any).export(fileName, geojson);
        }
    })
}

export function createFeaturePropertiesEditModal(feature: MarkerFeatureType, options: Omit<ConfirmModalOptions, 'content'>) {
    const propsCopy = deep.clone(feature.properties);
    const geoType = feature.geometry.type;
    const content = geoType === 'Point' ? createPointPropertiesEditContent(feature.properties) :
        geoType === 'LineString' ? createLineStringPropertiesEditContent(feature.properties) :
            createPolygonPropertiesEditContent(feature.properties);

    createConfirmModal({
        'title': options.title,
        content,
        onCancel: () => {
            // 数据恢复
            feature.properties = propsCopy;
            options.onCancel?.call(undefined);
        },
        onConfirm: options.onConfirm
    })
}

function createPointPropertiesEditContent(properties: MarkerFeatrueProperties): HTMLElement {

}

function createLineStringPropertiesEditContent(properties: MarkerFeatrueProperties): HTMLElement {

}

function createPolygonPropertiesEditContent(properties: MarkerFeatrueProperties): HTMLElement {

}