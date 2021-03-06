import * as vec3 from '@2gis/gl-matrix/vec3';
import * as mat3 from '@2gis/gl-matrix/mat3';
import * as mat4 from '@2gis/gl-matrix/mat4';
import * as quat from '@2gis/gl-matrix/quat';
import Object3D from '../Object3D';

/**
 * Камера
 *
 * @extends Object3D
 */
class Camera extends Object3D {
    constructor() {
        super();

        /**
         * Специфичный для камеры вектор, помогающий определить её положение
         * @type {vec3}
         */
        this.up = vec3.fromValues(0, 1, 0);

        /**
         * Проекционная матрица
         * @type {mat4}
         */
        this.projectionMatrix = mat4.create();

        /**
         * Матрица модель-вида использующаяся в шейдерах для получения конечного изображения
         * @type {mat4}
         */
        this.modelViewMatrix = mat4.create();

        /**
         * Матрица, обратная к worldMatrix
         * @type {mat4}
         */
        this.worldInverseMatrix = mat4.create();

        // Вспомогательные переменные для методов
        this._mat3 = mat3.create();
        this._mat4a = mat4.create();
        this._mat4b = mat4.create();
    }

    /**
     * Обновляет проекционную матрицу. Обычно это нужно после изменения параметров камеры.
     * Используется в наследуемых классах.
     */
    updateProjectionMatrix() {}

    /**
     * Обновляет глобальную матрицу объекта и матрицу модель-вида.
     * */
    updateWorldMatrix() {
        super.updateWorldMatrix();

        mat4.invert(this.worldInverseMatrix, this.worldMatrix);
        mat4.multiply(this.modelViewMatrix, this.projectionMatrix, this.worldInverseMatrix);
    }

    /**
     * Проецирует вектор из глобальной системы координат на экран
     * @param {vec3} vector
     * @returns {vec3}
     */
    project(vector) {
        const result = vec3.create();
        vec3.transformMat4(result, vector, this.modelViewMatrix);
        return result;
    }

    /**
     * Проецирует вектор из системы координат экрана в глобальную
     * @param {vec3} vector
     * @returns {vec3}
     */
    unproject(vector) {
        const matrix = this._mat4a;
        const inverseMatrix = this._mat4b;
        const result = vec3.create();

        mat4.invert(inverseMatrix, this.projectionMatrix);
        mat4.mul(matrix, this.worldMatrix, inverseMatrix);
        vec3.transformMat4(result, vector, matrix);

        return result;
    }

    /**
     * Поворачивает камеру так, чтобы центр экрана точно смотрел на указанную позицию
     * @param {vec3} position
     */
    lookAt(position) {
        const matrix4 = this._mat4a;
        const matrix3 = this._mat3;
        mat4.lookAt(matrix4, this.position, position, this.up);
        mat4.transpose(matrix4, matrix4);
        mat3.fromMat4(matrix3, matrix4);
        quat.fromMat3(this.quaternion, matrix3);

        return this;
    }
}

export default Camera;
