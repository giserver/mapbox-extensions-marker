import proj4 from 'proj4';
import sprite from '../symbol-icon';
import spriteConfig from '../symbol-icon/jas-sprite.json';

export function createHtmlElement<K extends keyof HTMLElementTagNameMap>(target: K, ...classNames: string[]): HTMLElementTagNameMap[K] {
    const element = document.createElement(target);
    element.classList.add(...classNames);
    return element;
}

export const coordConverter = {
    wgs84g_to_cgcs2000p: (lngLat: [number, number], options: {
        lon_0?: number,
        x_0?: number,
        y_0?: number
    } = {}) => {
        options.lon_0 ??= 120;
        options.x_0 ??= 500000;
        options.y_0 ??= 0;

        const wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
        const cgcs2000 = '+proj=tmerc +lat_0=0 +lon_0=@lon_0 +k=1 +x_0=@x_0 +y_0=@y_0 +ellps=GRS80 +units=m +no_defs'
            .replace('@lon_0', options.lon_0.toString())
            .replace('@x_0', options.x_0.toString())
            .replace('@y_0', options.y_0.toString());

        return proj4(wgs84, cgcs2000, lngLat);
    }
}

export function getSpriteImages(callback:(images:Map<string, ImageData>)=>void) {
    const image = new Image();
    image.onload=e=>{
        const canvas = createHtmlElement('canvas').getContext('2d')!;
        canvas.drawImage(image, 0, 0);
        canvas.save();
    
        const spriteImages = new Map<string, ImageData>();
    
        spriteConfig.frames.forEach(item => {
            const { x, y, w, h } = item.frame;
            const data = canvas.getImageData(x, y, w, h);
            spriteImages.set(item.filename, data);
        });
        
        callback(spriteImages);
    }

    image.src = sprite;
}