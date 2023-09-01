import Exporter from "../exporter/Exporter";
import { ExportGeoJsonType, MarkerFeatrueProperties, MarkerFeatureType, MarkerLayerProperties } from "../types";
import SvgBuilder from "../common/svg";
import { createHtmlElement } from "../common/utils";
import { deep } from 'wheater';
import { getMapMarkerSpriteImages } from "../symbol-icon";

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

export function createExportModal(fileName: string, geojson: ExportGeoJsonType) {
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

type EditMode = "update" | "create";

function makeCIBEFunc(onPropChange?: <T>(v: T) => void) {
    return function createInputBindingElement<T>(v: T, k: keyof T, config?: (element: HTMLInputElement) => void) {
        const input = createHtmlElement('input','jas-marker-edit-input');
        input.value = v[k] as string;
        config?.call(undefined, input);
        input.classList.add(input.type);

        input.addEventListener('change', e => {
            const value = (e.target as any).value;
            if (input.type === 'number') {
                const n = Number.parseFloat(value);
                if (n > Number.parseFloat(input.max) || n < Number.parseFloat(input.min)) {
                    input.value = v[k] as string;
                    return;
                }
                v[k] = n as any;
            } else
                v[k] = value;

            onPropChange?.call(undefined, v);
        });

        return input;
    }
}

export function createMarkerLayerEditModel(layer: MarkerLayerProperties, options: Omit<Omit<Omit<ConfirmModalOptions, 'content'>, 'withCancel'>, 'title'> & {
    mode: EditMode,
}) {
    const layerCopy = deep.clone(layer);
    const content = createHtmlElement('div', 'jas-modal-content-edit');
    const createInputBindingElement = makeCIBEFunc();
    
    content.append("名称", createInputBindingElement(layer, 'name', input => {
        input.type = 'text';
        input.maxLength = 12;
    }));

    createConfirmModal({
        'title': options.mode === 'update' ? "更新" : "新增",
        content,
        onCancel: () => {
            // 数据恢复
            deep.setProps(layerCopy, layer);
            options.onCancel?.call(undefined);
        },
        onConfirm: options.onConfirm
    })
}

export function createFeaturePropertiesEditModal(
    feature: MarkerFeatureType,
    options: Omit<Omit<Omit<ConfirmModalOptions, 'content'>, 'withCancel'>, 'title'> & {
        mode: EditMode,
        layers: MarkerLayerProperties[],
        onPropChange?(): void
    }) {

    const createInputBindingElement = makeCIBEFunc(options.onPropChange);

    function createSelectBindingElement<T>(v: T, k: keyof T, config?: (element: HTMLSelectElement) => void) {
        const input = createHtmlElement('select', 'jas-marker-edit-select');
        input.value = v[k] as string;
        config?.call(undefined, input);

        input.addEventListener('change', e => {
            v[k] = (e.target as any).value;
        });

        return input;
    }

    const properties = feature.properties;

    if (options.mode === 'create' && (
        !properties.layerId ||
        !options.layers.some(x => x.id === feature.properties.layerId)))
        properties.layerId = options.layers[0].id;

    const propsCopy = deep.clone(properties);
    const geoType = feature.geometry.type;

    const content = createHtmlElement('div', 'jas-modal-content-edit');

    //#region 添加图层选择
    if (options.mode === 'create')
        content.append("选择图层", createSelectBindingElement(properties, 'layerId', x => {
            options.layers.forEach(l => {
                x.innerHTML += `<option value="${l.id}">${l.name}</option>`
            });
            x.value = properties.layerId;
        }));
    //#endregion

    content.append("标注名称", createInputBindingElement(properties, 'name', input => {
        input.type = 'text';
        input.maxLength = 12;
    }));
    content.append('文字大小', createInputBindingElement(properties.style, 'textSize', input => {
        input.type = 'number';
        input.min = '1';
        input.max = '30';
    }));
    content.append('文字颜色', createInputBindingElement(properties.style, 'textColor', input => {
        input.type = 'color';
    }));

    if (geoType === 'Point' || geoType === 'MultiPoint') {
        getMapMarkerSpriteImages(images => {
            const imagesContainer = createHtmlElement('div');
            imagesContainer.style.width = '400px';
            imagesContainer.style.height = '130px';
            imagesContainer.style.overflowY = 'auto';

            let lastClickImg: HTMLImageElement;

            images.forEach((v, k) => {
                const imgElement = createHtmlElement('img');
                imgElement.src = v.url;
                imgElement.height = 30;
                imgElement.width = 30;
                imagesContainer.append(imgElement);

                imgElement.style.cursor = 'pointer';
                imgElement.style.borderRadius = '4px';
                imgElement.style.padding = '4px';

                if (properties.style.pointIcon === k) {
                    imgElement.style.backgroundColor = '#ccc';
                    lastClickImg = imgElement;
                }

                imgElement.addEventListener('click', () => {
                    if (lastClickImg)
                        lastClickImg.style.backgroundColor = '#fff';
                    imgElement.style.backgroundColor = '#ccc';
                    lastClickImg = imgElement;
                    properties.style.pointIcon = k;
                    options.onPropChange?.call(undefined);
                });
            });

            content.append("图形", imagesContainer);

            content.append("图形大小", createInputBindingElement(properties.style, 'pointIconSize', input => {
                input.type = 'number';
                input.min = '0.1';
                input.step = '0.1';
                input.max = '1';
            }));

            content.append('图形颜色', createInputBindingElement(properties.style, 'pointIconColor', input => {
                input.type = 'color';
            }));
        });
    }
    else if (geoType === 'LineString' || geoType === 'MultiLineString') {
        content.append('线宽', createInputBindingElement(properties.style, 'lineWidth', input => {
            input.type = 'number';
            input.min = '1';
            input.step = '1';
            input.max = '10';
        }));
        content.append('颜色', createInputBindingElement(properties.style, 'lineColor', input => {
            input.type = 'color';
        }));
    }
    else if (geoType === 'Polygon' || geoType === 'MultiPolygon') {
        content.append('颜色', createInputBindingElement(properties.style, 'polygonColor', element => {
            element.type = 'color'
        }));

        content.append('透明度', createInputBindingElement(properties.style, 'polygonOpacity', element => {
            element.type = 'number'
            element.min = '0';
            element.step = '0.1';
            element.max = '1';
        }));

        content.append('轮廓线宽', createInputBindingElement(properties.style, 'polygonOutlineWidth', element => {
            element.type = 'number';
            element.min = '1';
            element.step = '1';
            element.max = '10';
        }));

        content.append('轮廓颜色', createInputBindingElement(properties.style, 'polygonOutlineColor', element => {
            element.type = 'color';
        }));
    }

    createConfirmModal({
        'title': options.mode === 'update' ? "更新" : "新增",
        content,
        onCancel: () => {
            // 数据恢复
            feature.properties = propsCopy;
            options.onCancel?.call(undefined);
            options.onPropChange?.call(undefined);
        },
        onConfirm: options.onConfirm
    })
}