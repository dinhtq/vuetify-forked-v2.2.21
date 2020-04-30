import './VProgressLinear.sass';
// Components
import { VFadeTransition, VSlideXTransition, } from '../transitions';
// Mixins
import Colorable from '../../mixins/colorable';
import { factory as PositionableFactory } from '../../mixins/positionable';
import Proxyable from '../../mixins/proxyable';
import Themeable from '../../mixins/themeable';
// Utilities
import { convertToUnit, getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Colorable, PositionableFactory(['absolute', 'fixed', 'top', 'bottom']), Proxyable, Themeable);
/* @vue/component */
export default baseMixins.extend({
    name: 'v-progress-linear',
    props: {
        active: {
            type: Boolean,
            default: true,
        },
        backgroundColor: {
            type: String,
            default: null,
        },
        backgroundOpacity: {
            type: [Number, String],
            default: null,
        },
        bufferValue: {
            type: [Number, String],
            default: 100,
        },
        color: {
            type: String,
            default: 'primary',
        },
        height: {
            type: [Number, String],
            default: 4,
        },
        indeterminate: Boolean,
        query: Boolean,
        rounded: Boolean,
        stream: Boolean,
        striped: Boolean,
        value: {
            type: [Number, String],
            default: 0,
        },
    },
    data() {
        return {
            internalLazyValue: this.value || 0,
        };
    },
    computed: {
        __cachedBackground() {
            return this.$createElement('div', this.setBackgroundColor(this.backgroundColor || this.color, {
                staticClass: 'v-progress-linear__background',
                style: this.backgroundStyle,
            }));
        },
        __cachedBar() {
            return this.$createElement(this.computedTransition, [this.__cachedBarType]);
        },
        __cachedBarType() {
            return this.indeterminate ? this.__cachedIndeterminate : this.__cachedDeterminate;
        },
        __cachedBuffer() {
            return this.$createElement('div', {
                staticClass: 'v-progress-linear__buffer',
                style: this.styles,
            });
        },
        __cachedDeterminate() {
            return this.$createElement('div', this.setBackgroundColor(this.color, {
                staticClass: `v-progress-linear__determinate`,
                style: {
                    width: convertToUnit(this.normalizedValue, '%'),
                },
            }));
        },
        __cachedIndeterminate() {
            return this.$createElement('div', {
                staticClass: 'v-progress-linear__indeterminate',
                class: {
                    'v-progress-linear__indeterminate--active': this.active,
                },
            }, [
                this.genProgressBar('long'),
                this.genProgressBar('short'),
            ]);
        },
        __cachedStream() {
            if (!this.stream)
                return null;
            return this.$createElement('div', this.setTextColor(this.color, {
                staticClass: 'v-progress-linear__stream',
                style: {
                    width: convertToUnit(100 - this.normalizedBuffer, '%'),
                },
            }));
        },
        backgroundStyle() {
            const backgroundOpacity = this.backgroundOpacity == null
                ? (this.backgroundColor ? 1 : 0.3)
                : parseFloat(this.backgroundOpacity);
            return {
                opacity: backgroundOpacity,
                [this.$vuetify.rtl ? 'right' : 'left']: convertToUnit(this.normalizedValue, '%'),
                width: convertToUnit(this.normalizedBuffer - this.normalizedValue, '%'),
            };
        },
        classes() {
            return {
                'v-progress-linear--absolute': this.absolute,
                'v-progress-linear--fixed': this.fixed,
                'v-progress-linear--query': this.query,
                'v-progress-linear--reactive': this.reactive,
                'v-progress-linear--rounded': this.rounded,
                'v-progress-linear--striped': this.striped,
                ...this.themeClasses,
            };
        },
        computedTransition() {
            return this.indeterminate ? VFadeTransition : VSlideXTransition;
        },
        normalizedBuffer() {
            return this.normalize(this.bufferValue);
        },
        normalizedValue() {
            return this.normalize(this.internalLazyValue);
        },
        reactive() {
            return Boolean(this.$listeners.change);
        },
        styles() {
            const styles = {};
            if (!this.active) {
                styles.height = 0;
            }
            if (!this.indeterminate && parseFloat(this.normalizedBuffer) !== 100) {
                styles.width = convertToUnit(this.normalizedBuffer, '%');
            }
            return styles;
        },
    },
    methods: {
        genContent() {
            const slot = getSlot(this, 'default', { value: this.internalLazyValue });
            if (!slot)
                return null;
            return this.$createElement('div', {
                staticClass: 'v-progress-linear__content',
            }, slot);
        },
        genListeners() {
            const listeners = this.$listeners;
            if (this.reactive) {
                listeners.click = this.onClick;
            }
            return listeners;
        },
        genProgressBar(name) {
            return this.$createElement('div', this.setBackgroundColor(this.color, {
                staticClass: 'v-progress-linear__indeterminate',
                class: {
                    [name]: true,
                },
            }));
        },
        onClick(e) {
            if (!this.reactive)
                return;
            const { width } = this.$el.getBoundingClientRect();
            this.internalValue = e.offsetX / width * 100;
        },
        normalize(value) {
            if (value < 0)
                return 0;
            if (value > 100)
                return 100;
            return parseFloat(value);
        },
    },
    render(h) {
        const data = {
            staticClass: 'v-progress-linear',
            attrs: {
                role: 'progressbar',
                'aria-valuemin': 0,
                'aria-valuemax': this.normalizedBuffer,
                'aria-valuenow': this.indeterminate ? undefined : this.normalizedValue,
            },
            class: this.classes,
            style: {
                bottom: this.bottom ? 0 : undefined,
                height: this.active ? convertToUnit(this.height) : 0,
                top: this.top ? 0 : undefined,
            },
            on: this.genListeners(),
        };
        return h('div', data, [
            this.__cachedStream,
            this.__cachedBackground,
            this.__cachedBuffer,
            this.__cachedBar,
            this.genContent(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlByb2dyZXNzTGluZWFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVlByb2dyZXNzTGluZWFyL1ZQcm9ncmVzc0xpbmVhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLHdCQUF3QixDQUFBO0FBRS9CLGFBQWE7QUFDYixPQUFPLEVBQ0wsZUFBZSxFQUNmLGlCQUFpQixHQUNsQixNQUFNLGdCQUFnQixDQUFBO0FBRXZCLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsT0FBTyxJQUFJLG1CQUFtQixFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFDMUUsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsWUFBWTtBQUNaLE9BQU8sRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDM0QsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFNdEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN2QixTQUFTLEVBQ1QsbUJBQW1CLENBQUMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUMzRCxTQUFTLEVBQ1QsU0FBUyxDQUNWLENBQUE7QUFFRCxvQkFBb0I7QUFDcEIsZUFBZSxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQy9CLElBQUksRUFBRSxtQkFBbUI7SUFFekIsS0FBSyxFQUFFO1FBQ0wsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsZUFBZSxFQUFFO1lBQ2YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsaUJBQWlCLEVBQUU7WUFDakIsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0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Q0FBQyxPQUFPO1lBQ25CLEtBQUssRUFBRTtnQkFDTCxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2dCQUNuQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUzthQUM5QjtZQUNELEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO1NBQ3hCLENBQUE7UUFFRCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxjQUFjO1lBQ25CLElBQUksQ0FBQyxrQkFBa0I7WUFDdkIsSUFBSSxDQUFDLGNBQWM7WUFDbkIsSUFBSSxDQUFDLFdBQVc7WUFDaEIsSUFBSSxDQUFDLFVBQVUsRUFBRTtTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL1ZQcm9ncmVzc0xpbmVhci5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQge1xuICBWRmFkZVRyYW5zaXRpb24sXG4gIFZTbGlkZVhUcmFuc2l0aW9uLFxufSBmcm9tICcuLi90cmFuc2l0aW9ucydcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ29sb3JhYmxlIGZyb20gJy4uLy4uL21peGlucy9jb2xvcmFibGUnXG5pbXBvcnQgeyBmYWN0b3J5IGFzIFBvc2l0aW9uYWJsZUZhY3RvcnkgfSBmcm9tICcuLi8uLi9taXhpbnMvcG9zaXRpb25hYmxlJ1xuaW1wb3J0IFByb3h5YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvcHJveHlhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGNvbnZlcnRUb1VuaXQsIGdldFNsb3QgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgRnVuY3Rpb25hbENvbXBvbmVudE9wdGlvbnMgfSBmcm9tICd2dWUvdHlwZXMnXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgQ29sb3JhYmxlLFxuICBQb3NpdGlvbmFibGVGYWN0b3J5KFsnYWJzb2x1dGUnLCAnZml4ZWQnLCAndG9wJywgJ2JvdHRvbSddKSxcbiAgUHJveHlhYmxlLFxuICBUaGVtZWFibGVcbilcblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IGJhc2VNaXhpbnMuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtcHJvZ3Jlc3MtbGluZWFyJyxcblxuICBwcm9wczoge1xuICAgIGFjdGl2ZToge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kT3BhY2l0eToge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBidWZmZXJWYWx1ZToge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDEwMCxcbiAgICB9LFxuICAgIGNvbG9yOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAncHJpbWFyeScsXG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiA0LFxuICAgIH0sXG4gICAgaW5kZXRlcm1pbmF0ZTogQm9vbGVhbixcbiAgICBxdWVyeTogQm9vbGVhbixcbiAgICByb3VuZGVkOiBCb29sZWFuLFxuICAgIHN0cmVhbTogQm9vbGVhbixcbiAgICBzdHJpcGVkOiBCb29sZWFuLFxuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpbnRlcm5hbExhenlWYWx1ZTogdGhpcy52YWx1ZSB8fCAwLFxuICAgIH1cbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIF9fY2FjaGVkQmFja2dyb3VuZCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuYmFja2dyb3VuZENvbG9yIHx8IHRoaXMuY29sb3IsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXByb2dyZXNzLWxpbmVhcl9fYmFja2dyb3VuZCcsXG4gICAgICAgIHN0eWxlOiB0aGlzLmJhY2tncm91bmRTdHlsZSxcbiAgICAgIH0pKVxuICAgIH0sXG4gICAgX19jYWNoZWRCYXIgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KHRoaXMuY29tcHV0ZWRUcmFuc2l0aW9uLCBbdGhpcy5fX2NhY2hlZEJhclR5cGVdKVxuICAgIH0sXG4gICAgX19jYWNoZWRCYXJUeXBlICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy5pbmRldGVybWluYXRlID8gdGhpcy5fX2NhY2hlZEluZGV0ZXJtaW5hdGUgOiB0aGlzLl9fY2FjaGVkRGV0ZXJtaW5hdGVcbiAgICB9LFxuICAgIF9fY2FjaGVkQnVmZmVyICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtcHJvZ3Jlc3MtbGluZWFyX19idWZmZXInLFxuICAgICAgICBzdHlsZTogdGhpcy5zdHlsZXMsXG4gICAgICB9KVxuICAgIH0sXG4gICAgX19jYWNoZWREZXRlcm1pbmF0ZSAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29sb3IsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6IGB2LXByb2dyZXNzLWxpbmVhcl9fZGV0ZXJtaW5hdGVgLFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIHdpZHRoOiBjb252ZXJ0VG9Vbml0KHRoaXMubm9ybWFsaXplZFZhbHVlLCAnJScpLFxuICAgICAgICB9LFxuICAgICAgfSkpXG4gICAgfSxcbiAgICBfX2NhY2hlZEluZGV0ZXJtaW5hdGUgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1wcm9ncmVzcy1saW5lYXJfX2luZGV0ZXJtaW5hdGUnLFxuICAgICAgICBjbGFzczoge1xuICAgICAgICAgICd2LXByb2dyZXNzLWxpbmVhcl9faW5kZXRlcm1pbmF0ZS0tYWN0aXZlJzogdGhpcy5hY3RpdmUsXG4gICAgICAgIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuZ2VuUHJvZ3Jlc3NCYXIoJ2xvbmcnKSxcbiAgICAgICAgdGhpcy5nZW5Qcm9ncmVzc0Jhcignc2hvcnQnKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBfX2NhY2hlZFN0cmVhbSAoKTogVk5vZGUgfCBudWxsIHtcbiAgICAgIGlmICghdGhpcy5zdHJlYW0pIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldFRleHRDb2xvcih0aGlzLmNvbG9yLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1wcm9ncmVzcy1saW5lYXJfX3N0cmVhbScsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgd2lkdGg6IGNvbnZlcnRUb1VuaXQoMTAwIC0gdGhpcy5ub3JtYWxpemVkQnVmZmVyLCAnJScpLFxuICAgICAgICB9LFxuICAgICAgfSkpXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kU3R5bGUgKCk6IG9iamVjdCB7XG4gICAgICBjb25zdCBiYWNrZ3JvdW5kT3BhY2l0eSA9IHRoaXMuYmFja2dyb3VuZE9wYWNpdHkgPT0gbnVsbFxuICAgICAgICA/ICh0aGlzLmJhY2tncm91bmRDb2xvciA/IDEgOiAwLjMpXG4gICAgICAgIDogcGFyc2VGbG9hdCh0aGlzLmJhY2tncm91bmRPcGFjaXR5KVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBvcGFjaXR5OiBiYWNrZ3JvdW5kT3BhY2l0eSxcbiAgICAgICAgW3RoaXMuJHZ1ZXRpZnkucnRsID8gJ3JpZ2h0JyA6ICdsZWZ0J106IGNvbnZlcnRUb1VuaXQodGhpcy5ub3JtYWxpemVkVmFsdWUsICclJyksXG4gICAgICAgIHdpZHRoOiBjb252ZXJ0VG9Vbml0KHRoaXMubm9ybWFsaXplZEJ1ZmZlciAtIHRoaXMubm9ybWFsaXplZFZhbHVlLCAnJScpLFxuICAgICAgfVxuICAgIH0sXG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LXByb2dyZXNzLWxpbmVhci0tYWJzb2x1dGUnOiB0aGlzLmFic29sdXRlLFxuICAgICAgICAndi1wcm9ncmVzcy1saW5lYXItLWZpeGVkJzogdGhpcy5maXhlZCxcbiAgICAgICAgJ3YtcHJvZ3Jlc3MtbGluZWFyLS1xdWVyeSc6IHRoaXMucXVlcnksXG4gICAgICAgICd2LXByb2dyZXNzLWxpbmVhci0tcmVhY3RpdmUnOiB0aGlzLnJlYWN0aXZlLFxuICAgICAgICAndi1wcm9ncmVzcy1saW5lYXItLXJvdW5kZWQnOiB0aGlzLnJvdW5kZWQsXG4gICAgICAgICd2LXByb2dyZXNzLWxpbmVhci0tc3RyaXBlZCc6IHRoaXMuc3RyaXBlZCxcbiAgICAgICAgLi4udGhpcy50aGVtZUNsYXNzZXMsXG4gICAgICB9XG4gICAgfSxcbiAgICBjb21wdXRlZFRyYW5zaXRpb24gKCk6IEZ1bmN0aW9uYWxDb21wb25lbnRPcHRpb25zIHtcbiAgICAgIHJldHVybiB0aGlzLmluZGV0ZXJtaW5hdGUgPyBWRmFkZVRyYW5zaXRpb24gOiBWU2xpZGVYVHJhbnNpdGlvblxuICAgIH0sXG4gICAgbm9ybWFsaXplZEJ1ZmZlciAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSh0aGlzLmJ1ZmZlclZhbHVlKVxuICAgIH0sXG4gICAgbm9ybWFsaXplZFZhbHVlICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHRoaXMuaW50ZXJuYWxMYXp5VmFsdWUpXG4gICAgfSxcbiAgICByZWFjdGl2ZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gQm9vbGVhbih0aGlzLiRsaXN0ZW5lcnMuY2hhbmdlKVxuICAgIH0sXG4gICAgc3R5bGVzICgpOiBvYmplY3Qge1xuICAgICAgY29uc3Qgc3R5bGVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkge1xuICAgICAgICBzdHlsZXMuaGVpZ2h0ID0gMFxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaW5kZXRlcm1pbmF0ZSAmJiBwYXJzZUZsb2F0KHRoaXMubm9ybWFsaXplZEJ1ZmZlcikgIT09IDEwMCkge1xuICAgICAgICBzdHlsZXMud2lkdGggPSBjb252ZXJ0VG9Vbml0KHRoaXMubm9ybWFsaXplZEJ1ZmZlciwgJyUnKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3R5bGVzXG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICBjb25zdCBzbG90ID0gZ2V0U2xvdCh0aGlzLCAnZGVmYXVsdCcsIHsgdmFsdWU6IHRoaXMuaW50ZXJuYWxMYXp5VmFsdWUgfSlcblxuICAgICAgaWYgKCFzbG90KSByZXR1cm4gbnVsbFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtcHJvZ3Jlc3MtbGluZWFyX19jb250ZW50JyxcbiAgICAgIH0sIHNsb3QpXG4gICAgfSxcbiAgICBnZW5MaXN0ZW5lcnMgKCkge1xuICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy4kbGlzdGVuZXJzXG5cbiAgICAgIGlmICh0aGlzLnJlYWN0aXZlKSB7XG4gICAgICAgIGxpc3RlbmVycy5jbGljayA9IHRoaXMub25DbGlja1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGlzdGVuZXJzXG4gICAgfSxcbiAgICBnZW5Qcm9ncmVzc0JhciAobmFtZTogJ2xvbmcnIHwgJ3Nob3J0Jykge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29sb3IsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXByb2dyZXNzLWxpbmVhcl9faW5kZXRlcm1pbmF0ZScsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgW25hbWVdOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSkpXG4gICAgfSxcbiAgICBvbkNsaWNrIChlOiBNb3VzZUV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMucmVhY3RpdmUpIHJldHVyblxuXG4gICAgICBjb25zdCB7IHdpZHRoIH0gPSB0aGlzLiRlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICB0aGlzLmludGVybmFsVmFsdWUgPSBlLm9mZnNldFggLyB3aWR0aCAqIDEwMFxuICAgIH0sXG4gICAgbm9ybWFsaXplICh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyKSB7XG4gICAgICBpZiAodmFsdWUgPCAwKSByZXR1cm4gMFxuICAgICAgaWYgKHZhbHVlID4gMTAwKSByZXR1cm4gMTAwXG4gICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LXByb2dyZXNzLWxpbmVhcicsXG4gICAgICBhdHRyczoge1xuICAgICAgICByb2xlOiAncHJvZ3Jlc3NiYXInLFxuICAgICAgICAnYXJpYS12YWx1ZW1pbic6IDAsXG4gICAgICAgICdhcmlhLXZhbHVlbWF4JzogdGhpcy5ub3JtYWxpemVkQnVmZmVyLFxuICAgICAgICAnYXJpYS12YWx1ZW5vdyc6IHRoaXMuaW5kZXRlcm1pbmF0ZSA/IHVuZGVmaW5lZCA6IHRoaXMubm9ybWFsaXplZFZhbHVlLFxuICAgICAgfSxcbiAgICAgIGNsYXNzOiB0aGlzLmNsYXNzZXMsXG4gICAgICBzdHlsZToge1xuICAgICAgICBib3R0b206IHRoaXMuYm90dG9tID8gMCA6IHVuZGVmaW5lZCxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmFjdGl2ZSA/IGNvbnZlcnRUb1VuaXQodGhpcy5oZWlnaHQpIDogMCxcbiAgICAgICAgdG9wOiB0aGlzLnRvcCA/IDAgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgICAgb246IHRoaXMuZ2VuTGlzdGVuZXJzKCksXG4gICAgfVxuXG4gICAgcmV0dXJuIGgoJ2RpdicsIGRhdGEsIFtcbiAgICAgIHRoaXMuX19jYWNoZWRTdHJlYW0sXG4gICAgICB0aGlzLl9fY2FjaGVkQmFja2dyb3VuZCxcbiAgICAgIHRoaXMuX19jYWNoZWRCdWZmZXIsXG4gICAgICB0aGlzLl9fY2FjaGVkQmFyLFxuICAgICAgdGhpcy5nZW5Db250ZW50KCksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=