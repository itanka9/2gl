import {vec3} from 'gl-matrix';

export default class Ray {
    constructor(origin, direction) {
        this.origin = origin || vec3.create();
        this.direction = direction || vec3.create();
    }

    clone() {
        return new Ray(vec3.clone(this.origin), vec3.clone(this.origin));
    }

    at(t) {
        let result = vec3.create();
        vec3.scaleAndAdd(result, this.direction, this.origin, vec3.fromValues(t, t, t));
        return result;
    }

    intersectBox(box) {
        // from https://github.com/mrdoob/three.js/blob/master/src/math/Ray.js

        let tmin, tmax, tymin, tymax, tzmin, tzmax;

        let invdirx = 1 / this.direction[0],
            invdiry = 1 / this.direction[1],
            invdirz = 1 / this.direction[2];

        let origin = this.origin;

        if (invdirx >= 0) {
            tmin = (box.min[0] - origin[0]) * invdirx;
            tmax = (box.max[0] - origin[0]) * invdirx;
        } else {
            tmin = (box.max[0] - origin[0]) * invdirx;
            tmax = (box.min[0] - origin[0]) * invdirx;
        }

        if ( invdiry >= 0 ) {
            tymin = (box.min[1] - origin[1]) * invdiry;
            tymax = (box.max[1] - origin[1]) * invdiry;
        } else {
            tymin = (box.max[1] - origin[1]) * invdiry;
            tymax = (box.min[1] - origin[1]) * invdiry;
        }

        if ((tmin > tymax) || (tymin > tmax)) { return null; }

        // These lines also handle the case where tmin or tmax is NaN
        // (result of 0 * Infinity). x !== x returns true if x is NaN
        if (tymin > tmin || tmin !== tmin) { tmin = tymin; }

        if (tymax < tmax || tmax !== tmax) { tmax = tymax; }

        if (invdirz >= 0) {
            tzmin = (box.min[2] - origin[2]) * invdirz;
            tzmax = (box.max[2] - origin[2]) * invdirz;
        } else {
            tzmin = (box.max[2] - origin[2]) * invdirz;
            tzmax = (box.min[2] - origin[2]) * invdirz;
        }

        if ((tmin > tzmax) || (tzmin > tmax)) { return null; }

        if (tzmin > tmin || tmin !== tmin) { tmin = tzmin; }

        if (tzmax < tmax || tmax !== tmax) { tmax = tzmax; }

        // return point closest to the ray (positive side)
        if (tmax < 0) { return null; }

        return this.at(tmin >= 0 ? tmin : tmax);
    }

    applyMatrix4(matrix) {
        vec3.add(this.direction, this.direction, this.origin);
        vec3.transformMat4(this.direction, this.direction, matrix);
        vec3.transformMat4(this.origin, this.origin, matrix);
        vec3.sub(this.direction, this.direction, this.origin);
        vec3.normalize(this.direction, this.direction);

        return this;
    }

    intersectTriangle(triangle, backfaceCulling) {
        // from https://github.com/mrdoob/three.js/blob/master/src/math/Ray.js

        // Compute the offset origin, edges, and normal.
        let edge1 = vec3.create();
        let edge2 = vec3.create();
        let normal = vec3.create();

        vec3.sub(edge1, triangle[1], triangle[0]);
        vec3.sub(edge2, triangle[2], triangle[0]);
        vec3.cross(normal, edge1, edge2);

        // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
        // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
        //   |Dot(D,N)| * b1 = sign(Dot(D, N)) * Dot(D, Cross(Q, E2))
        //   |Dot(D,N)| * b2 = sign(Dot(D, N)) * Dot(D, Cross(E1, Q))
        //   |Dot(D,N)| * t = -sign(Dot(D, N)) * Dot(Q, N)
        var DdN = vec3.dot(this.direction, normal);
        var sign;

        if (DdN > 0) {
            if (backfaceCulling) return null;
            sign = 1;
        } else if (DdN < 0) {
            sign = - 1;
            DdN = - DdN;
        } else {
            return null;
        }

        let diff = vec3.create();
        vec3.sub(diff, this.origin, a);

        let cde2 = vec3.create();
        vec3.cross(cde2, diff, edge2);

        let DdQxE2 = sign * vec3.dot(this.direction, cde2);

        // b1 < 0, no intersection
        if (DdQxE2 < 0) {
            return null;
        }

        let cde1 = vec3.create();
        vec3.cross(cde1, edge1, diff);
        let DdE1xQ = sign * vec3.dot(this.direction, cde1);

        // b2 < 0, no intersection
        if (DdE1xQ < 0) {
            return null;
        }

        // b1+b2 > 1, no intersection
        if (DdQxE2 + DdE1xQ > DdN) {
            return null;
        }

        // Line intersects triangle, check if ray does.
        let QdN = - sign * vec3.dot(diff, normal);

        // t < 0, no intersection
        if (QdN < 0) {
            return null;
        }

        // Ray intersects triangle.
        return this.at(QdN / DdN);

    };
}