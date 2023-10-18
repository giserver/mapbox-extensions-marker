import MarkerControl, { MarkerControlOptions } from "./marker/MarkerControl";
import { zh, en } from './common/lang'
import { MarkerManagerOptions } from "./marker/MarkerManager";

import * as wheater from 'wheater';

const languages = {
    zh,
    en
}

async function createGiserverMarkerManagerOptions(url: string, tenantId: string): Promise<MarkerManagerOptions> {
    function composeUrl(u: string, q?: wheater.types.TUrlQuery) {
        return url + url.endsWith('/') ? "" : "/" + u + "?" + wheater.common.composeUrlQuery(q);
    }

    return {
        "featureCollection": await (await fetch(composeUrl("markers", { tenantId }))).json(),
        "layers": await (await fetch(composeUrl('layers', { tenantId }))).json(),
        "layerOptions": {
            "onCreate": p => {
                const pars = { ...p, tenantId }
                fetch(composeUrl('layers'), {
                    'method': 'POST',
                    body: JSON.stringify(pars),
                    headers: new Headers({
                        'Content-Type': 'application/json',
                    })
                })
            },
            "onRemove": p => {
                fetch(composeUrl(`layers/${p.id}`), {
                    'method': 'DELETE',
                })
            },
            "onRename": p => {
                fetch(composeUrl(`layers`), {
                    'method': 'PUT',
                    body: JSON.stringify(p),
                    headers: new Headers({
                        'Content-Type': 'application/json',
                    })
                })
            },

            "markerItemOptions": {
                "onCreate": p => {
                    const pars = {
                        ...p.properties,
                        tenantId,
                        geom: p.geometry
                    }
                    fetch(composeUrl('markers'), {
                        'method': 'POST',
                        body: JSON.stringify(pars),
                        headers: new Headers({
                            'Content-Type': 'application/json',
                        })
                    })

                },
                "onRemove": p => {
                    fetch(composeUrl(`markers/${p.properties.id}`), {
                        'method': 'DELETE',
                    })
                },
                "onUpdate": p => {
                    const pars = {
                        ...p.properties,
                        tenantId,
                        geom: p.geometry
                    }
                    fetch(composeUrl('markers'), {
                        'method': 'PUT',
                        body: JSON.stringify(pars),
                        headers: new Headers({
                            'Content-Type': 'application/json',
                        })
                    })
                }
            }
        }
    }
}

export {
    MarkerControl,
    MarkerControlOptions,
    createGiserverMarkerManagerOptions,
    languages
}