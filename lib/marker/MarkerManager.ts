import { createConfirmModal, createExportModal, createFeaturePropertiesEditModal, createMarkerLayerEditModel } from "./modal";
import SvgBuilder from "../common/svg";
import { createHtmlElement } from "../common/utils";
import { array, creator, deep } from 'wheater';
import { MarkerFeatrueProperties, MarkerFeatureType, MarkerLayerProperties } from "../types";
import DrawManager from "./DrawMarker";
import mapboxgl from "mapbox-gl";
import LayerGroup from "mapbox-extensions/dist/features/LayerGroup";
import emitter from "../common/events";

import * as turf from '@turf/turf';

interface MarkerItemOptions {
    onCreate?(feature: MarkerFeatureType): void,
    onRemove?(feature: MarkerFeatureType): void,
    onUpdate?(feature: MarkerFeatureType): void
}

interface MarkerLayerOptions {
    onCreate?(properties: MarkerLayerProperties): void,
    onRemove?(properties: MarkerLayerProperties): void,
    onRename?(properties: MarkerLayerProperties): void,

    markerItemOptions?: MarkerItemOptions
}

export interface MarkerManagerOptions {
    layers?: MarkerLayerProperties[],
    featureCollection?: GeoJSON.FeatureCollection<GeoJSON.Geometry, MarkerFeatrueProperties>,
    layerOptions?: MarkerLayerOptions
}

export default class MarkerManager {
    private readonly layerContainer: HTMLElement;

    readonly htmlElement = createHtmlElement('div', 'jas-ctrl-marker');
    readonly extendHeaderSlot = createHtmlElement('div');

    private markerLayers: MarkerLayer[] = [];

    /**
     * 绘制管理器
     */
    private readonly drawManger: DrawManager;

    /**
     * 搜索缓存，避免重复搜索
     */
    private lastSearchValue?: string;

    /**
     * 标记属性编辑缓存，为下一次创建标记做准备
     */
    private lastFeaturePropertiesCache: MarkerFeatrueProperties;

    /**
     *
     */
    constructor(private map: mapboxgl.Map, private options: MarkerManagerOptions = {}) {
        options.featureCollection ??= { type: 'FeatureCollection', features: [] };
        options.layerOptions ??= {};
        const onLayerRemove = options.layerOptions?.onRemove;
        options.layerOptions.onRemove = p => {
            this.markerLayers = this.markerLayers.filter(x => x.properties.id !== p.id);
            onLayerRemove?.call(undefined,p);
        }

        if (!options.layers || options.layers.length === 0) {
            const layer = {
                id: creator.uuid(),
                name: "默认图层",
                date: Date.now()
            };
            options.layers = [layer];
            options.layerOptions?.onCreate?.call(undefined, layer);
        }

        this.lastFeaturePropertiesCache = {
            id: creator.uuid(),
            name: "标注",
            layerId: options.layers[0].id,
            date: Date.now(),
            style: {
                textSize: 14,
                textColor: 'black',

                pointIcon: "标1.png",
                pointIconColor: "#ff0000",
                pointIconSize: 0.3,

                lineColor: '#0000ff',
                lineWidth: 3,

                polygonColor: '#0000ff',
                polygonOpacity: 0.5,
                polygonOutlineColor: '#000000',
                polygonOutlineWidth: 2,
            }
        };

        this.drawManger = new DrawManager(map, {
            onDrawFinish: (draw, flush) => {
                const featrue = draw.currentFeature!;

                createFeaturePropertiesEditModal(featrue, {
                    mode: 'create',
                    layers: this.markerLayers.map(x => x.properties),
                    onConfirm: () => {
                        options?.layerOptions?.markerItemOptions?.onCreate?.call(undefined, featrue);
                        this.addMarker(featrue);
                        this.lastFeaturePropertiesCache = deep.clone(featrue.properties);
                        flush();
                    },
                    onCancel: () => {
                        flush();
                    },
                    onPropChange: () => draw.update()
                });
            }
        });

        const values = array.groupBy(options.featureCollection.features, f => f.properties.layerId);
        options.layers.sort(x => x.date).forEach(l => {
            const features = values.get(l.id) || [];
            this.markerLayers.push(new MarkerLayer(map, l, features, options.layerOptions));
        });

        this.layerContainer = createHtmlElement('div', 'jas-ctrl-marker-data');
        this.layerContainer.append(...this.markerLayers.map(x => x.htmlElement));

        const header = createHtmlElement('div', 'jas-ctrl-marker-header');
        header.append(
            this.createHeaderSearch(),
            this.createHeaderAddLayer(),
            this.createHeaderDrawBtn());

        this.htmlElement.append(header, this.layerContainer);
    }

    private createHeaderSearch() {
        const searchDiv = createHtmlElement('div', 'jas-flex-center', 'jas-ctrl-marker-headre-search');
        searchDiv.style.position = 'relative';
        const search = createHtmlElement('input');
        search.type = 'text';
        search.placeholder = "请输入标注名称";
        search.style.padding = '6px 18px 6px 6px';
        search.style.outline = 'none';
        search.style.border = '1px solid #ddd';
        search.style.borderRadius = '4px';

        const clean = new SvgBuilder('X').resize(17, 17).create('svg');
        clean.style.position = 'absolute';
        clean.style.right = '2px';
        clean.style.cursor = 'pointer';

        clean.addEventListener('click', () => {
            search.value = '';
            this.search();
        });

        let searchTimeout: NodeJS.Timeout | undefined;
        search.addEventListener('input', e => {
            if (searchTimeout)
                clearInterval(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.search(search.value);
                searchTimeout = undefined;
            }, 100);
        });

        searchDiv.append(search, clean);

        return searchDiv;
    }

    private createHeaderDrawBtn() {
        const btnPoint = createHtmlElement('div', "jas-ctrl-marker-item-btn");
        const btnLine = createHtmlElement('div', "jas-ctrl-marker-item-btn");
        const btnPolygon = createHtmlElement('div', "jas-ctrl-marker-item-btn");

        const svgBuilder = new SvgBuilder('marker_point');
        btnPoint.innerHTML = svgBuilder.resize(22, 22).create();
        btnLine.innerHTML = svgBuilder.change('marker_line').create();
        btnPolygon.innerHTML = svgBuilder.resize(21, 21).change('marker_polygon').create();

        btnPoint.addEventListener('click', () => this.drawManger.start('Point', this.lastFeaturePropertiesCache));
        btnLine.addEventListener('click', () => this.drawManger.start('LineString', this.lastFeaturePropertiesCache));
        btnPolygon.addEventListener('click', () => this.drawManger.start('Polygon', this.lastFeaturePropertiesCache));

        const c = createHtmlElement('div', "jas-flex-center", "jas-ctrl-marker-btns-container");
        c.append(btnPoint, btnLine, btnPolygon);

        return c;
    }

    private createHeaderAddLayer() {
        const div = createHtmlElement('div', "jas-ctrl-marker-btns-container", "jas-ctrl-marker-item-btn");
        div.innerHTML = new SvgBuilder('add').resize(25, 25).create();
        div.title = '添加图层';

        div.addEventListener('click', () => {
            const layer: MarkerLayerProperties = {
                id: creator.uuid(),
                date: Date.now(),
                name: "新建图层"
            }
            createMarkerLayerEditModel(layer, {
                mode: 'create',
                onConfirm: () => {
                    this.addLayer(layer);
                }
            })
        })

        return div;
    }

    search(value?: string) {
        if (this.lastSearchValue === value)
            return;

        this.markerLayers.forEach(l => {
            if (value) {
                let hitCount = 0;
                l.items.forEach(m => {
                    const isHit = m.feature.properties.name.includes(value);
                    m.setUIVisible(isHit);
                    hitCount++;
                });
                l.setUIVisible(hitCount > 0);
                l.collapse(hitCount === 0)
            } else {
                // 复原操作
                l.setUIVisible(true);
                l.collapse(true);
                l.items.forEach(m => {
                    m.setUIVisible(true);
                });
            }
        });

        this.lastSearchValue = value;
    }

    addLayer(layer: MarkerLayerProperties) {
        this.options?.layerOptions?.onCreate?.call(undefined, layer);
        const markerLayer = new MarkerLayer(this.map, layer, [], this.options.layerOptions);
        this.markerLayers.unshift(markerLayer);
        this.layerContainer.insertBefore(markerLayer.htmlElement, this.layerContainer.firstChild);
    }

    addMarker(feature: MarkerFeatureType) {
        const layer = array.first(this.markerLayers, x => x.properties.id === feature.properties.layerId);
        if (!layer) throw Error(`layer id : ${feature.properties.layerId} not found`);

        layer.addMarker(feature);
    }

    setGeometryVisible(value: boolean) {
        this.markerLayers.forEach(l => l.setGeometryVisible(value));
    }
}



class MarkerItem {
    readonly htmlElement = createHtmlElement('div', 'jas-ctrl-marker-item-container');

    readonly reName: (name: string) => void;

    /**
     *
     */
    constructor(
        map: mapboxgl.Map,
        readonly feature: MarkerFeatureType,
        private options: MarkerItemOptions = {}) {

        this.htmlElement.classList.add(...MarkerItem.getGeometryMatchClasses(feature));

        const prefix = createHtmlElement('div', 'jas-flex-center');
        const suffix = createHtmlElement('div', 'jas-ctrl-marker-suffix', 'jas-ctrl-hidden');
        const content = createHtmlElement('div', 'jas-ctrl-marker-item-container-content');
        content.innerText = feature.properties.name;

        this.reName = (name: string) => content.innerText = name;

        content.addEventListener('click', () => {
            const box = turf.bbox(this.feature as any);
            map.fitBounds([box[0], box[1], box[2], box[3]], {
                maxZoom: 20,
                padding: 50
            });
        });

        const svgBuilder = new SvgBuilder('marker_point').resize(16, 16);
        const geometryType = feature.geometry.type === 'Point' ?
            svgBuilder.create('svg') :
            feature.geometry.type === 'LineString' ?
                svgBuilder.change('marker_line').create('svg') :
                svgBuilder.change('marker_polygon').create('svg');
        prefix.append(geometryType);
        suffix.append(
            // this.createSuffixEditGeometry(), 
            this.createSuffixEdit(),
            this.createSuffixExport(),
            this.createSuffixDel());

        this.htmlElement.addEventListener('mouseenter', () => {
            suffix.classList.remove('jas-ctrl-hidden');
        });
        this.htmlElement.addEventListener('mouseleave', () => {
            suffix.classList.add('jas-ctrl-hidden');
        });

        this.htmlElement.append(prefix, content, suffix);
    }

    static getGeometryMatchClass(feature: GeoJSON.Feature) {
        return `geometry-match-${feature.geometry.type.toLocaleLowerCase()}`;
    }

    static getGeometryMatchClasses(featrue: GeoJSON.Feature) {
        const geoType = featrue.geometry.type;
        if (geoType === 'Point')
            return [`geometry-match-point`];
        else if (geoType === 'LineString')
            return [`geometry-match-point`, `geometry-match-linestring`];
        else if (geoType === 'Polygon')
            return [`geometry-match-point`, `geometry-match-linestring`, `geometry-match-polygon`];

        return [];
    }

    remove() {
        // 外部删除 
        this.options.onRemove?.call(undefined, this.feature);

        // 更新地图
        emitter.emit('marker-item-remove', this.feature);

        // 删除ui
        this.htmlElement.remove();
    }

    update() {
        // 外部更新
        this.options.onUpdate?.call(undefined, this.feature);

        // 更新地图
        emitter.emit('marker-item-update', this.feature);

        // 更新ui
        this.reName(this.feature.properties.name);
    }

    setUIVisible(value: boolean) {
        if (value)
            this.htmlElement.classList.remove('jas-ctrl-hidden');
        else
            this.htmlElement.classList.add('jas-ctrl-hidden');
    }

    private createSuffixEdit() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('edit').resize(17, 17).create('svg'));
        div.addEventListener('click', () => {
            createFeaturePropertiesEditModal(this.feature, {
                layers: [],
                mode: 'update',
                onConfirm: () => {
                    this.update();
                },
                onPropChange: () => {
                    this.update();
                }
            })
        });
        return div;
    }

    private createSuffixEditGeometry() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('remake').resize(17, 17).create('svg'));

        return div;
    }

    private createSuffixExport() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('export').resize(15, 15).create('svg'));

        div.addEventListener('click', () => {
            createExportModal(this.feature.properties.name, this.feature);
        })

        return div;
    }

    private createSuffixDel() {
        const div = createHtmlElement('div');
        div.append(new SvgBuilder('delete').resize(15, 15).create('svg'));

        div.addEventListener('click', () => {
            createConfirmModal({
                title: '确认',
                content: "删除标记",
                onConfirm: () => {
                    this.remove();
                }
            });
        });

        return div;
    }
}

class MarkerLayer {
    readonly items: MarkerItem[];

    readonly htmlElement = createHtmlElement('div');

    private layerGroup: LayerGroup;
    private arrow = createHtmlElement('div', "jas-collapse-arrow", "jas-ctrl-switchlayer-group-header-title-collapse");
    private nameElement = createHtmlElement('div');
    private itemContainerElement = createHtmlElement('div', 'jas-ctrl-hidden');

    declare setGeometryVisible: (value: boolean) => void;

    /**
     *
     */
    constructor(
        private map: mapboxgl.Map,
        readonly properties: MarkerLayerProperties,
        private features: MarkerFeatureType[],
        private options: MarkerLayerOptions = {}) {

        const fm = array.groupBy(features, f => f.geometry.type);
        const layerFeatures =
            (fm.get('Point') || []).sort(x => x.properties.date).concat(
                (fm.get('LineString') || []).sort(x => x.properties.date)).concat(
                    (fm.get('Polygon') || []).sort(x => x.properties.date));

        this.items = layerFeatures.map(f => new MarkerItem(map, f, options.markerItemOptions));
        emitter.on('marker-item-remove', f => {
            if (f.properties.layerId !== this.properties.id)
                return;

            this.features = this.features.filter(x => x !== f);
            this.updateDataSource();
        })

        emitter.on('marker-item-update', f => {
            if (f.properties.layerId !== this.properties.id)
                return;

            this.updateDataSource();
        })

        map.addSource(this.properties.id, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features
            }
        });

        this.layerGroup = new LayerGroup(creator.uuid(), map, [
            {
                id: this.properties.id + "_point",
                type: 'symbol',
                source: this.properties.id,
                layout: {
                    "text-field": ['get', 'name'],
                    'text-size': ['get', 'textSize', ['get', 'style']],
                    'icon-image': ['get', 'pointIcon', ['get', 'style']],
                    'icon-size': ['get', 'pointIconSize', ['get', 'style']],
                    'text-justify': 'auto',
                    'text-variable-anchor': ['left', 'right', 'top', 'bottom'],
                    'text-radial-offset': ['*', ['get', 'pointIconSize', ['get', 'style']], 4],
                    visibility:'none'
                },
                paint: {
                    "text-color": ['get', 'textColor', ['get', 'style']],
                    'icon-color': ['get', 'pointIconColor', ['get', 'style']]
                },
                filter: ['==', '$type', 'Point']
            }, {
                id: this.properties.id + "_line",
                type: 'line',
                source: this.properties.id,
                layout:{
                    visibility:'none'
                },
                paint: {
                    "line-color": ['get', 'lineColor', ['get', 'style']],
                    "line-width": ['get', 'lineWidth', ['get', 'style']]
                },
                filter: ['==', '$type', 'LineString']
            }, {
                id: this.properties.id + '_polygon',
                type: 'fill',
                source: this.properties.id,
                layout:{
                    visibility:'none'
                },
                paint: {
                    "fill-color": ['get', 'polygonColor', ['get', 'style']],
                    "fill-opacity": ['get', 'polygonOpacity', ['get', 'style']]
                },
                filter: ['==', '$type', 'Polygon']
            }, {
                id: this.properties.id + '_polygon_outline',
                type: 'line',
                source: this.properties.id,
                layout:{
                    visibility:'none'
                },
                paint: {
                    "line-color": ['get', 'polygonOutlineColor', ['get', 'style']],
                    "line-width": ['get', 'polygonOutlineWidth', ['get', 'style']]
                },
                filter: ['==', '$type', 'Polygon']
            }, {
                id: this.properties.id + "_label",
                type: 'symbol',
                source: this.properties.id,
                layout: {
                    "text-field": ['get', 'name'],
                    'text-size': ['get', 'textSize', ['get', 'style']],
                    visibility:'none'
                },
                paint: {
                    "text-color": ['get', 'textColor', ['get', 'style']]
                },
                filter: ['!=', '$type', 'Point']
            }
        ]);

        map.on('mouseenter', this.layerGroup.layerIds, _ => {
            if (map.getCanvas().style.cursor === '')
                map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', this.layerGroup.layerIds, _ => {
            if (map.getCanvas().style.cursor === 'pointer')
                map.getCanvas().style.cursor = ''
        });

        this.nameElement.innerText = properties.name;
        this.itemContainerElement.append(...this.items.map(x => x.htmlElement));
        this.itemContainerElement.style.paddingLeft = '16px';
        this.htmlElement.append(this.createHeader(), this.itemContainerElement);
    }

    addMarker(feature: MarkerFeatureType) {
        const markerItem = new MarkerItem(this.map, feature, this.options.markerItemOptions);
        const firstNode = this.itemContainerElement.querySelector(`.${MarkerItem.getGeometryMatchClass(feature)}`)

        if (firstNode)
            this.itemContainerElement.insertBefore(markerItem.htmlElement, firstNode);
        else
            this.itemContainerElement.append(markerItem.htmlElement);

        this.features.push(feature);
        this.items.push(markerItem);

        this.updateDataSource();
    }

    remove() {
        console.error(this.options.onRemove);
        this.options.onRemove?.call(undefined, this.properties);
        this.htmlElement.remove();
        this.layerGroup.removeAll();
        this.map.removeLayerGroup(this.layerGroup.id);
    }

    updateDataSource() {
        (this.map.getSource(this.properties.id) as mapboxgl.GeoJSONSource)
            .setData({ type: 'FeatureCollection', features: this.features });
    }

    collapse(value: boolean) {
        if (value) {
            this.arrow.classList.remove("jas-collapse-active");
            this.itemContainerElement.classList.add("jas-ctrl-hidden");
        } else {
            this.arrow.classList.add("jas-collapse-active");
            this.itemContainerElement.classList.remove("jas-ctrl-hidden");
        }
    }

    setUIVisible(value: boolean) {
        if (value)
            this.htmlElement.classList.remove('jas-ctrl-hidden');
        else
            this.htmlElement.classList.add('jas-ctrl-hidden');
    }

    private createHeader() {
        const header = createHtmlElement('div', 'jas-ctrl-marker-layer-header');

        const content = createHtmlElement('div', 'jas-ctrl-marker-layer-header-content');
        content.append(this.arrow, this.nameElement);

        content.addEventListener('click', () => {
            this.arrow.classList.toggle("jas-collapse-active");
            this.itemContainerElement.classList.toggle("jas-ctrl-hidden");
        });

        const suffix = createHtmlElement('div', 'jas-ctrl-marker-suffix', 'jas-ctrl-hidden');

        suffix.append(
            this.createSuffixEdit(),
            this.createSuffixExport(),
            this.createSuffixDel());

        header.addEventListener('mouseenter', () => {
            suffix.classList.remove('jas-ctrl-hidden');
        });
        header.addEventListener('mouseleave', () => {
            suffix.classList.add('jas-ctrl-hidden');
        });

        header.append(content, suffix, this.createSuffixVisible());
        return header;
    }

    private createSuffixExport() {
        const exp = createHtmlElement('div');
        exp.innerHTML = new SvgBuilder('export').resize(15, 15).create();

        exp.addEventListener('click', () => {
            createExportModal(this.properties.name, {
                type: 'FeatureCollection',
                features: this.features
            });
        })

        return exp
    }

    private createSuffixEdit() {
        const edit = createHtmlElement('div');
        edit.innerHTML = new SvgBuilder('edit').resize(18, 18).create();
        edit.addEventListener('click', () => {
            createMarkerLayerEditModel(this.properties, {
                mode: 'update',
                onConfirm: () => {
                    this.options.onRename?.call(undefined, this.properties);
                    this.nameElement.innerText = this.properties.name;
                }
            });
        });
        return edit;
    }

    private createSuffixDel() {
        const del = createHtmlElement('div');
        del.innerHTML = new SvgBuilder('delete').resize(15, 15).create();
        del.addEventListener('click', () => {
            createConfirmModal({
                title: '确认',
                content: `删除图层 : ${this.properties.name}`,
                onConfirm: () => {
                    this.remove();
                }
            });
        });

        return del;
    }

    private createSuffixVisible() {
        const svgBuilder = new SvgBuilder('eye').resize(18, 18);
        const eye = svgBuilder.create();
        const uneye = svgBuilder.change('uneye').create();

        const visible = createHtmlElement('div');
        visible.innerHTML = eye;

        visible.addEventListener('click', () => {
            const isEye = visible.innerHTML === eye;
            visible.innerHTML = isEye ? uneye : eye;
            this.layerGroup.show = !isEye;
        });

        this.setGeometryVisible = (value: boolean) => {
            visible.innerHTML = value ? eye : uneye;
            this.layerGroup.show = value;
        }

        visible.style.cursor = "pointer";
        visible.style.marginLeft = "5px";

        return visible;
    }
}