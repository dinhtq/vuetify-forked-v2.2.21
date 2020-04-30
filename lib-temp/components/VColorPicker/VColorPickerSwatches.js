// Styles
import './VColorPickerSwatches.sass';
// Components
import VIcon from '../VIcon';
// Helpers
import colors from '../../util/colors';
import { fromHex, parseColor } from './util';
import { convertToUnit, deepEqual } from '../../util/helpers';
import mixins from '../../util/mixins';
import Themeable from '../../mixins/themeable';
import { contrastRatio } from '../../util/colorUtils';
function parseDefaultColors(colors) {
    return Object.keys(colors).map(key => {
        const color = colors[key];
        return color.base ? [
            color.base,
            color.darken4,
            color.darken3,
            color.darken2,
            color.darken1,
            color.lighten1,
            color.lighten2,
            color.lighten3,
            color.lighten4,
            color.lighten5,
        ] : [
            color.black,
            color.white,
            color.transparent,
        ];
    });
}
const white = fromHex('#FFFFFF').rgba;
const black = fromHex('#000000').rgba;
export default mixins(Themeable).extend({
    name: 'v-color-picker-swatches',
    props: {
        swatches: {
            type: Array,
            default: () => parseDefaultColors(colors),
        },
        color: Object,
        maxWidth: [Number, String],
        maxHeight: [Number, String],
    },
    methods: {
        genColor(color) {
            const content = this.$createElement('div', {
                style: {
                    background: color,
                },
            }, [
                deepEqual(this.color, parseColor(color, null)) && this.$createElement(VIcon, {
                    props: {
                        small: true,
                        dark: contrastRatio(this.color.rgba, white) > 2 && this.color.alpha > 0.5,
                        light: contrastRatio(this.color.rgba, black) > 2 && this.color.alpha > 0.5,
                    },
                }, '$success'),
            ]);
            return this.$createElement('div', {
                staticClass: 'v-color-picker__color',
                on: {
                    // TODO: Less hacky way of catching transparent
                    click: () => this.$emit('update:color', fromHex(color === 'transparent' ? '#00000000' : color)),
                },
            }, [content]);
        },
        genSwatches() {
            return this.swatches.map(swatch => {
                const colors = swatch.map(this.genColor);
                return this.$createElement('div', {
                    staticClass: 'v-color-picker__swatch',
                }, colors);
            });
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-color-picker__swatches',
            style: {
                maxWidth: convertToUnit(this.maxWidth),
                maxHeight: convertToUnit(this.maxHeight),
            },
        }, [
            this.$createElement('div', this.genSwatches()),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNvbG9yUGlja2VyU3dhdGNoZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ29sb3JQaWNrZXIvVkNvbG9yUGlja2VyU3dhdGNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sNkJBQTZCLENBQUE7QUFFcEMsYUFBYTtBQUNiLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixVQUFVO0FBQ1YsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxFQUFxQixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDN0QsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFJOUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRXJELFNBQVMsa0JBQWtCLENBQUUsTUFBOEM7SUFDekUsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNuQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDekIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsQixLQUFLLENBQUMsSUFBSTtZQUNWLEtBQUssQ0FBQyxPQUFPO1lBQ2IsS0FBSyxDQUFDLE9BQU87WUFDYixLQUFLLENBQUMsT0FBTztZQUNiLEtBQUssQ0FBQyxPQUFPO1lBQ2IsS0FBSyxDQUFDLFFBQVE7WUFDZCxLQUFLLENBQUMsUUFBUTtZQUNkLEtBQUssQ0FBQyxRQUFRO1lBQ2QsS0FBSyxDQUFDLFFBQVE7WUFDZCxLQUFLLENBQUMsUUFBUTtTQUNmLENBQUMsQ0FBQyxDQUFDO1lB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WUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDL0MsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZDb2xvclBpY2tlclN3YXRjaGVzLnNhc3MnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWSWNvbiBmcm9tICcuLi9WSWNvbidcblxuLy8gSGVscGVyc1xuaW1wb3J0IGNvbG9ycyBmcm9tICcuLi8uLi91dGlsL2NvbG9ycydcbmltcG9ydCB7IFZDb2xvclBpY2tlckNvbG9yLCBmcm9tSGV4LCBwYXJzZUNvbG9yIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgY29udmVydFRvVW5pdCwgZGVlcEVxdWFsIH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RoZW1lYWJsZSdcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBQcm9wVHlwZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IGNvbnRyYXN0UmF0aW8gfSBmcm9tICcuLi8uLi91dGlsL2NvbG9yVXRpbHMnXG5cbmZ1bmN0aW9uIHBhcnNlRGVmYXVsdENvbG9ycyAoY29sb3JzOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+Pikge1xuICByZXR1cm4gT2JqZWN0LmtleXMoY29sb3JzKS5tYXAoa2V5ID0+IHtcbiAgICBjb25zdCBjb2xvciA9IGNvbG9yc1trZXldXG4gICAgcmV0dXJuIGNvbG9yLmJhc2UgPyBbXG4gICAgICBjb2xvci5iYXNlLFxuICAgICAgY29sb3IuZGFya2VuNCxcbiAgICAgIGNvbG9yLmRhcmtlbjMsXG4gICAgICBjb2xvci5kYXJrZW4yLFxuICAgICAgY29sb3IuZGFya2VuMSxcbiAgICAgIGNvbG9yLmxpZ2h0ZW4xLFxuICAgICAgY29sb3IubGlnaHRlbjIsXG4gICAgICBjb2xvci5saWdodGVuMyxcbiAgICAgIGNvbG9yLmxpZ2h0ZW40LFxuICAgICAgY29sb3IubGlnaHRlbjUsXG4gICAgXSA6IFtcbiAgICAgIGNvbG9yLmJsYWNrLFxuICAgICAgY29sb3Iud2hpdGUsXG4gICAgICBjb2xvci50cmFuc3BhcmVudCxcbiAgICBdXG4gIH0pXG59XG5cbmNvbnN0IHdoaXRlID0gZnJvbUhleCgnI0ZGRkZGRicpLnJnYmFcbmNvbnN0IGJsYWNrID0gZnJvbUhleCgnIzAwMDAwMCcpLnJnYmFcblxuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFRoZW1lYWJsZSkuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtY29sb3ItcGlja2VyLXN3YXRjaGVzJyxcblxuICBwcm9wczoge1xuICAgIHN3YXRjaGVzOiB7XG4gICAgICB0eXBlOiBBcnJheSBhcyBQcm9wVHlwZTxzdHJpbmdbXVtdPixcbiAgICAgIGRlZmF1bHQ6ICgpID0+IHBhcnNlRGVmYXVsdENvbG9ycyhjb2xvcnMpLFxuICAgIH0sXG4gICAgY29sb3I6IE9iamVjdCBhcyBQcm9wVHlwZTxWQ29sb3JQaWNrZXJDb2xvcj4sXG4gICAgbWF4V2lkdGg6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgbWF4SGVpZ2h0OiBbTnVtYmVyLCBTdHJpbmddLFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBnZW5Db2xvciAoY29sb3I6IHN0cmluZykge1xuICAgICAgY29uc3QgY29udGVudCA9IHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiBjb2xvcixcbiAgICAgICAgfSxcbiAgICAgIH0sIFtcbiAgICAgICAgZGVlcEVxdWFsKHRoaXMuY29sb3IsIHBhcnNlQ29sb3IoY29sb3IsIG51bGwpKSAmJiB0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCB7XG4gICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHNtYWxsOiB0cnVlLFxuICAgICAgICAgICAgZGFyazogY29udHJhc3RSYXRpbyh0aGlzLmNvbG9yLnJnYmEsIHdoaXRlKSA+IDIgJiYgdGhpcy5jb2xvci5hbHBoYSA+IDAuNSxcbiAgICAgICAgICAgIGxpZ2h0OiBjb250cmFzdFJhdGlvKHRoaXMuY29sb3IucmdiYSwgYmxhY2spID4gMiAmJiB0aGlzLmNvbG9yLmFscGhhID4gMC41LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sICckc3VjY2VzcycpLFxuICAgICAgXSlcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNvbG9yLXBpY2tlcl9fY29sb3InLFxuICAgICAgICBvbjoge1xuICAgICAgICAgIC8vIFRPRE86IExlc3MgaGFja3kgd2F5IG9mIGNhdGNoaW5nIHRyYW5zcGFyZW50XG4gICAgICAgICAgY2xpY2s6ICgpID0+IHRoaXMuJGVtaXQoJ3VwZGF0ZTpjb2xvcicsIGZyb21IZXgoY29sb3IgPT09ICd0cmFuc3BhcmVudCcgPyAnIzAwMDAwMDAwJyA6IGNvbG9yKSksXG4gICAgICAgIH0sXG4gICAgICB9LCBbY29udGVudF0pXG4gICAgfSxcbiAgICBnZW5Td2F0Y2hlcyAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zd2F0Y2hlcy5tYXAoc3dhdGNoID0+IHtcbiAgICAgICAgY29uc3QgY29sb3JzID0gc3dhdGNoLm1hcCh0aGlzLmdlbkNvbG9yKVxuXG4gICAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNvbG9yLXBpY2tlcl9fc3dhdGNoJyxcbiAgICAgICAgfSwgY29sb3JzKVxuICAgICAgfSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LWNvbG9yLXBpY2tlcl9fc3dhdGNoZXMnLFxuICAgICAgc3R5bGU6IHtcbiAgICAgICAgbWF4V2lkdGg6IGNvbnZlcnRUb1VuaXQodGhpcy5tYXhXaWR0aCksXG4gICAgICAgIG1heEhlaWdodDogY29udmVydFRvVW5pdCh0aGlzLm1heEhlaWdodCksXG4gICAgICB9LFxuICAgIH0sIFtcbiAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuZ2VuU3dhdGNoZXMoKSksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=