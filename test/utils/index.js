import GlContext from './GlContext';
import Camera from '../../src/cameras/Camera';
import Scene from '../../src/Scene';

export {default as cubeVertices} from './cubeVertices';

export function slice(typedArray) {
    if (!typedArray) { return null; }

    return Array.prototype.slice.call(typedArray);
}

export function round(value, sign = 5) {
    return Math.round(value * Math.pow(10, sign)) / Math.pow(10, sign);
}

export function flatten(array) {
    return array.reduce(function(a, b) {
        return slice(a).concat(slice(b));
    });
}

export function getNewGlContext() {
    return new GlContext();
}

export function getRenderState() {
    return {
        gl: new GlContext(),
        scene: new Scene(),
        camera: new Camera()
    };
}
