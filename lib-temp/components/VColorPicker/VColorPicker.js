// Styles
import './VColorPicker.sass';
// Components
import VSheet from '../VSheet/VSheet';
import VColorPickerPreview from './VColorPickerPreview';
import VColorPickerCanvas from './VColorPickerCanvas';
import VColorPickerEdit, { modes } from './VColorPickerEdit';
import VColorPickerSwatches from './VColorPickerSwatches';
// Helpers
import { parseColor, fromRGBA, extractColor, hasAlpha } from './util';
import mixins from '../../util/mixins';
import { deepEqual } from '../../util/helpers';
import Themeable from '../../mixins/themeable';
export default mixins(Themeable).extend({
    name: 'v-color-picker',
    props: {
        canvasHeight: {
            type: [String, Number],
            default: 150,
        },
        disabled: Boolean,
        dotSize: {
            type: [Number, String],
            default: 10,
        },
        flat: Boolean,
        hideCanvas: Boolean,
        hideInputs: Boolean,
        hideModeSwitch: Boolean,
        mode: {
            type: String,
            default: 'rgba',
            validator: (v) => Object.keys(modes).includes(v),
        },
        showSwatches: Boolean,
        swatches: Array,
        swatchesMaxHeight: {
            type: [Number, String],
            default: 150,
        },
        value: {
            type: [Object, String],
        },
        width: {
            type: [Number, String],
            default: 300,
        },
    },
    data: () => ({
        internalValue: fromRGBA({ r: 255, g: 0, b: 0, a: 1 }),
    }),
    computed: {
        hideAlpha() {
            if (!this.value)
                return false;
            return !hasAlpha(this.value);
        },
    },
    watch: {
        value: {
            handler(color) {
                this.updateColor(parseColor(color, this.internalValue));
            },
            immediate: true,
        },
    },
    methods: {
        updateColor(color) {
            this.internalValue = color;
            const value = extractColor(this.internalValue, this.value);
            if (!deepEqual(value, this.value)) {
                this.$emit('input', value);
                this.$emit('update:color', this.internalValue);
            }
        },
        genCanvas() {
            return this.$createElement(VColorPickerCanvas, {
                props: {
                    color: this.internalValue,
                    disabled: this.disabled,
                    dotSize: this.dotSize,
                    width: this.width,
                    height: this.canvasHeight,
                },
                on: {
                    'update:color': this.updateColor,
                },
            });
        },
        genControls() {
            return this.$createElement('div', {
                staticClass: 'v-color-picker__controls',
            }, [
                this.genPreview(),
                !this.hideInputs && this.genEdit(),
            ]);
        },
        genEdit() {
            return this.$createElement(VColorPickerEdit, {
                props: {
                    color: this.internalValue,
                    disabled: this.disabled,
                    hideAlpha: this.hideAlpha,
                    hideModeSwitch: this.hideModeSwitch,
                    mode: this.mode,
                },
                on: {
                    'update:color': this.updateColor,
                    'update:mode': (v) => this.$emit('update:mode', v),
                },
            });
        },
        genPreview() {
            return this.$createElement(VColorPickerPreview, {
                props: {
                    color: this.internalValue,
                    disabled: this.disabled,
                    hideAlpha: this.hideAlpha,
                },
                on: {
                    'update:color': this.updateColor,
                },
            });
        },
        genSwatches() {
            return this.$createElement(VColorPickerSwatches, {
                props: {
                    dark: this.dark,
                    light: this.light,
                    swatches: this.swatches,
                    color: this.internalValue,
                    maxHeight: this.swatchesMaxHeight,
                },
                on: {
                    'update:color': this.updateColor,
                },
            });
        },
    },
    render(h) {
        return h(VSheet, {
            staticClass: 'v-color-picker',
            class: {
                'v-color-picker--flat': this.flat,
                ...this.themeClasses,
            },
            props: {
                maxWidth: this.width,
            },
        }, [
            !this.hideCanvas && this.genCanvas(),
            this.genControls(),
            this.showSwatches && this.genSwatches(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNvbG9yUGlja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkNvbG9yUGlja2VyL1ZDb2xvclBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxxQkFBcUIsQ0FBQTtBQUU1QixhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0sa0JBQWtCLENBQUE7QUFDckMsT0FBTyxtQkFBbUIsTUFBTSx1QkFBdUIsQ0FBQTtBQUN2RCxPQUFPLGtCQUFrQixNQUFNLHNCQUFzQixDQUFBO0FBQ3JELE9BQU8sZ0JBQWdCLEVBQUUsRUFBUSxLQUFLLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNsRSxPQUFPLG9CQUFvQixNQUFNLHdCQUF3QixDQUFBO0FBRXpELFVBQVU7QUFDVixPQUFPLEVBQXFCLFVBQVUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUN4RixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFLOUMsZUFBZSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3RDLElBQUksRUFBRSxnQkFBZ0I7SUFFdEIsS0FBSyxFQUFFO1FBQ0wsWUFBWSxFQUFFO1lBQ1osSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsR0FBRztTQUNiO1FBQ0QsUUFBUSxFQUFFLE9BQU87UUFDakIsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsRUFBRTtTQUNaO1FBQ0QsSUFBSSxFQUFFLE9BQU87UUFDYixVQUFVLEVBQUUsT0FBTztRQUNuQixVQUFVLEVBQUUsT0FBTztR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QzthQUNGLENBQUMsQ0FBQTtRQUNKLENBQUM7S0FDRjtJQUVELE1BQU0sQ0FBRSxDQUFDO1FBQ1AsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ2YsV0FBVyxFQUFFLGdCQUFnQjtZQUM3QixLQUFLLEVBQUU7Z0JBQ0wsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2pDLEdBQUcsSUFBSSxDQUFDLFlBQVk7YUFDckI7WUFDRCxLQUFLLEVBQUU7Z0JBQ0wsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLO2FBQ3JCO1NBQ0YsRUFBRTtZQUNELENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ3BDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1NBQ3hDLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WQ29sb3JQaWNrZXIuc2FzcydcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZTaGVldCBmcm9tICcuLi9WU2hlZXQvVlNoZWV0J1xuaW1wb3J0IFZDb2xvclBpY2tlclByZXZpZXcgZnJvbSAnLi9WQ29sb3JQaWNrZXJQcmV2aWV3J1xuaW1wb3J0IFZDb2xvclBpY2tlckNhbnZhcyBmcm9tICcuL1ZDb2xvclBpY2tlckNhbnZhcydcbmltcG9ydCBWQ29sb3JQaWNrZXJFZGl0LCB7IE1vZGUsIG1vZGVzIH0gZnJvbSAnLi9WQ29sb3JQaWNrZXJFZGl0J1xuaW1wb3J0IFZDb2xvclBpY2tlclN3YXRjaGVzIGZyb20gJy4vVkNvbG9yUGlja2VyU3dhdGNoZXMnXG5cbi8vIEhlbHBlcnNcbmltcG9ydCB7IFZDb2xvclBpY2tlckNvbG9yLCBwYXJzZUNvbG9yLCBmcm9tUkdCQSwgZXh0cmFjdENvbG9yLCBoYXNBbHBoYSB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBkZWVwRXF1YWwgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5cbmV4cG9ydCBkZWZhdWx0IG1peGlucyhUaGVtZWFibGUpLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWNvbG9yLXBpY2tlcicsXG5cbiAgcHJvcHM6IHtcbiAgICBjYW52YXNIZWlnaHQ6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIE51bWJlcl0sXG4gICAgICBkZWZhdWx0OiAxNTAsXG4gICAgfSxcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICBkb3RTaXplOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMTAsXG4gICAgfSxcbiAgICBmbGF0OiBCb29sZWFuLFxuICAgIGhpZGVDYW52YXM6IEJvb2xlYW4sXG4gICAgaGlkZUlucHV0czogQm9vbGVhbixcbiAgICBoaWRlTW9kZVN3aXRjaDogQm9vbGVhbixcbiAgICBtb2RlOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAncmdiYScsXG4gICAgICB2YWxpZGF0b3I6ICh2OiBzdHJpbmcpID0+IE9iamVjdC5rZXlzKG1vZGVzKS5pbmNsdWRlcyh2KSxcbiAgICB9LFxuICAgIHNob3dTd2F0Y2hlczogQm9vbGVhbixcbiAgICBzd2F0Y2hlczogQXJyYXkgYXMgUHJvcFR5cGU8c3RyaW5nW11bXT4sXG4gICAgc3dhdGNoZXNNYXhIZWlnaHQ6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAxNTAsXG4gICAgfSxcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogW09iamVjdCwgU3RyaW5nXSxcbiAgICB9LFxuICAgIHdpZHRoOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMzAwLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBpbnRlcm5hbFZhbHVlOiBmcm9tUkdCQSh7IHI6IDI1NSwgZzogMCwgYjogMCwgYTogMSB9KSxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBoaWRlQWxwaGEgKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKCF0aGlzLnZhbHVlKSByZXR1cm4gZmFsc2VcblxuICAgICAgcmV0dXJuICFoYXNBbHBoYSh0aGlzLnZhbHVlKVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICB2YWx1ZToge1xuICAgICAgaGFuZGxlciAoY29sb3I6IGFueSkge1xuICAgICAgICB0aGlzLnVwZGF0ZUNvbG9yKHBhcnNlQ29sb3IoY29sb3IsIHRoaXMuaW50ZXJuYWxWYWx1ZSkpXG4gICAgICB9LFxuICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIHVwZGF0ZUNvbG9yIChjb2xvcjogVkNvbG9yUGlja2VyQ29sb3IpIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IGNvbG9yXG4gICAgICBjb25zdCB2YWx1ZSA9IGV4dHJhY3RDb2xvcih0aGlzLmludGVybmFsVmFsdWUsIHRoaXMudmFsdWUpXG5cbiAgICAgIGlmICghZGVlcEVxdWFsKHZhbHVlLCB0aGlzLnZhbHVlKSkge1xuICAgICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIHZhbHVlKVxuICAgICAgICB0aGlzLiRlbWl0KCd1cGRhdGU6Y29sb3InLCB0aGlzLmludGVybmFsVmFsdWUpXG4gICAgICB9XG4gICAgfSxcbiAgICBnZW5DYW52YXMgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZDb2xvclBpY2tlckNhbnZhcywge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIGNvbG9yOiB0aGlzLmludGVybmFsVmFsdWUsXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgZG90U2l6ZTogdGhpcy5kb3RTaXplLFxuICAgICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogdGhpcy5jYW52YXNIZWlnaHQsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgJ3VwZGF0ZTpjb2xvcic6IHRoaXMudXBkYXRlQ29sb3IsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuQ29udHJvbHMgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jb2xvci1waWNrZXJfX2NvbnRyb2xzJyxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5QcmV2aWV3KCksXG4gICAgICAgICF0aGlzLmhpZGVJbnB1dHMgJiYgdGhpcy5nZW5FZGl0KCksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuRWRpdCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkNvbG9yUGlja2VyRWRpdCwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIGNvbG9yOiB0aGlzLmludGVybmFsVmFsdWUsXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgaGlkZUFscGhhOiB0aGlzLmhpZGVBbHBoYSxcbiAgICAgICAgICBoaWRlTW9kZVN3aXRjaDogdGhpcy5oaWRlTW9kZVN3aXRjaCxcbiAgICAgICAgICBtb2RlOiB0aGlzLm1vZGUsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgJ3VwZGF0ZTpjb2xvcic6IHRoaXMudXBkYXRlQ29sb3IsXG4gICAgICAgICAgJ3VwZGF0ZTptb2RlJzogKHY6IE1vZGUpID0+IHRoaXMuJGVtaXQoJ3VwZGF0ZTptb2RlJywgdiksXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuUHJldmlldyAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkNvbG9yUGlja2VyUHJldmlldywge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIGNvbG9yOiB0aGlzLmludGVybmFsVmFsdWUsXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgaGlkZUFscGhhOiB0aGlzLmhpZGVBbHBoYSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICAndXBkYXRlOmNvbG9yJzogdGhpcy51cGRhdGVDb2xvcixcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5Td2F0Y2hlcyAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkNvbG9yUGlja2VyU3dhdGNoZXMsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBkYXJrOiB0aGlzLmRhcmssXG4gICAgICAgICAgbGlnaHQ6IHRoaXMubGlnaHQsXG4gICAgICAgICAgc3dhdGNoZXM6IHRoaXMuc3dhdGNoZXMsXG4gICAgICAgICAgY29sb3I6IHRoaXMuaW50ZXJuYWxWYWx1ZSxcbiAgICAgICAgICBtYXhIZWlnaHQ6IHRoaXMuc3dhdGNoZXNNYXhIZWlnaHQsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgJ3VwZGF0ZTpjb2xvcic6IHRoaXMudXBkYXRlQ29sb3IsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKFZTaGVldCwge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LWNvbG9yLXBpY2tlcicsXG4gICAgICBjbGFzczoge1xuICAgICAgICAndi1jb2xvci1waWNrZXItLWZsYXQnOiB0aGlzLmZsYXQsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfSxcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIG1heFdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgfSxcbiAgICB9LCBbXG4gICAgICAhdGhpcy5oaWRlQ2FudmFzICYmIHRoaXMuZ2VuQ2FudmFzKCksXG4gICAgICB0aGlzLmdlbkNvbnRyb2xzKCksXG4gICAgICB0aGlzLnNob3dTd2F0Y2hlcyAmJiB0aGlzLmdlblN3YXRjaGVzKCksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=