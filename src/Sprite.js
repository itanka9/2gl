import * as vec2 from '@2gis/gl-matrix/vec2';
import Object3D from './Object3D';
import {SPRITE, SPRITE_RENDERER} from './libConstants';

/**
 * Используется для отрисовки спрайтов. Спрайты всегда рисуются лицевой стороной
 * и их размеры не зависят от положения. Т.е. координаты спрайта проецируются в плоскость экрана,
 * и уже на ней отрисовываются.
 *
 * Для отрисовки спрайтов нужно подключить {@link SpritePlugin} к рендереру.
 *
 * @extends {Object3D}
 */
class Sprite extends Object3D {
    /**
     * @param {SpriteMaterial} material
     */
    constructor(material) {
        super();

        /**
         * Программа отрисовки спрайта
         * @type {SpriteMaterial}
         */
        this.material = material;

        /**
         * Смещение спрайта в плоскости экрана
         * @type {vec2}
         */
        this.offset = vec2.create();

        /**
         * Используется для обозначения типа объекта
         * @type {Number}
         */
        this.type = SPRITE;
    }

    render(state) {
        // Если cпрайт невидим или у программы спрайта не установлена текстура, то не рендерим его
        if (!this.visible || !this.material.getTexture()) { return this; }

        if (this.worldMatrixNeedsUpdate) {
            this.updateWorldMatrix();
        }

        const gl = state.gl;

        state.object = this;

        this.material.enable(state);

        // draw for indices
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        this.material.disable(state.gl);

        return this;
    }

    /**
     * Вызывается на этапе рендеринга, чтобы определить к какому типу рендера принадлежит объект.
     * Спрайты рисуются отдельным рендером.
     *
     * @param {Object} renderPlugins
     */
    typifyForRender(renderPlugins) {
        if (!this.visible) { return this; }

        renderPlugins[SPRITE_RENDERER].addObject(this);

        this.children.forEach(child => child.typifyForRender(renderPlugins));

        return this;
    }
}

export default Sprite;
