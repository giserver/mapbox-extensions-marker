import mitt from 'mitt';
import { MarkerFeatureType } from '../types';

const emitter = mitt<{
    "marker-item-remove" : MarkerFeatureType,
    "marker-item-update" : MarkerFeatureType
}>();

export default emitter;