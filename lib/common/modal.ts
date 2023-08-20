import Exporter from "../exporter/Exporter";
import { ExportGeoJsonType } from "../types";
import SvgBuilder from "./svg";
import { createHtmlElement } from "./utils";

export interface ModalOptions {
    content: HTMLElement | string,
    title?: string,
    onClose?(): void
}

export interface ConfirmModalOptions extends ModalOptions {
    onConfirm?(): void,
    onCancel?(): void,
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
        options.onClose?.call(undefined);
        modal.remove();
    });

    header.append(titleDiv);
    header.append(closeBtn);
    container.append(header);
    container.append(options.content);

    modal.append(container);
    document.body.append(modal);
    return [modal, container, closeBtn];
}

export function createConfirmModal(options: ConfirmModalOptions) {
    options.withCancel ??= true;
    const [modal, container, closeBtn] = createModal(options);
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
    closeBtn.addEventListener('click', () => options.onCancel?.call(undefined));

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