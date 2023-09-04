import { deep } from "wheater";

interface ILanguageOptions {
    title: string,
    searchPlaceholder: string,
    nameText: string

    newMarkerName: string,
    newLayer: string,
    chooseLayer: string,

    markerName: string,
    fontSize: string,
    fontColor: string,
    iconText: string,
    iconSize: string,
    iconColor: string,
    lineWidth: string,
    lineColor: string,
    polygonColor: string,
    polygonOpacity: string,
    polygonOutlineWidth: string,
    polygonOutlineColor: string,

    defaltLayerName: string,
    fileType: string,

    newItem: string,
    editItem: string,
    exportItem: string,
    deleteItem: string,
    visibility: string,
    cannotDeleteLastLayer: string,

    warn: string,
    confirm: string,
    cancel: string
}

const zh: ILanguageOptions = {
    title: "标注",
    searchPlaceholder: "请输入标注名称",
    nameText: '名称',

    newMarkerName: "标注",
    newLayer: "新建图层",
    chooseLayer: "选择图层",

    markerName: "标注名称",
    fontSize: "文字大小",
    fontColor: "文字颜色",
    iconText: "图形",
    iconSize: "图形大小",
    iconColor: "图形颜色",
    lineWidth: "线宽",
    lineColor: "颜色",
    polygonColor: "颜色",
    polygonOpacity: "透明度",
    polygonOutlineWidth: "轮廓线宽",
    polygonOutlineColor: "轮廓颜色",

    defaltLayerName: "默认图层",
    fileType: "文件类型",

    newItem: "新增",
    editItem: "编辑",
    exportItem: "导出",
    deleteItem: "删除",
    visibility: "显隐",
    cannotDeleteLastLayer: "无法删除最后一个图层",

    warn: "警告",
    confirm: "确认",
    cancel: "取消"
}

const en: ILanguageOptions = {
    title: "Mark",
    searchPlaceholder: "please input marker name",
    nameText: 'name',

    newMarkerName: "new-item",
    newLayer: "new-layer",
    chooseLayer: "choose layer",

    markerName: "text",
    fontSize: "font size",
    fontColor: "font color",
    iconText: "icon",
    iconSize: "icon size",
    iconColor: "icon color",
    lineWidth: "line width",
    lineColor: "line color",
    polygonColor: "color",
    polygonOpacity: "opacity",
    polygonOutlineWidth: "outline width",
    polygonOutlineColor: "outline color",

    defaltLayerName: "default layer",
    fileType: "file type",

    newItem: "create",
    editItem: "edit",
    exportItem: "export",
    deleteItem: "delete",
    visibility: "visibility",
    cannotDeleteLastLayer: "can not delete last layer",

    warn: "warning",
    confirm: "confirm",
    cancel: "cancel"
}

const lang = zh;

function reset(l?: ILanguageOptions) {
    if (l)
        deep.setProps(l, lang);
}

function change(l?: Partial<ILanguageOptions>) {
    if (!l) return;

    let p: keyof ILanguageOptions;
    for (p in l) {
        if (l[p]) lang[p] = l[p]!;
    }
}

export { lang, zh, en, reset, change, ILanguageOptions }; 
