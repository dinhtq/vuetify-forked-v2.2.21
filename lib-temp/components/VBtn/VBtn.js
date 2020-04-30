// Styles
import './VBtn.sass';
// Extensions
import VSheet from '../VSheet';
// Components
import VProgressCircular from '../VProgressCircular';
// Mixins
import { factory as GroupableFactory } from '../../mixins/groupable';
import { factory as ToggleableFactory } from '../../mixins/toggleable';
import Positionable from '../../mixins/positionable';
import Routable from '../../mixins/routable';
import Sizeable from '../../mixins/sizeable';
// Utilities
import mixins from '../../util/mixins';
import { breaking } from '../../util/console';
const baseMixins = mixins(VSheet, Routable, Positionable, Sizeable, GroupableFactory('btnToggle'), ToggleableFactory('inputValue')
/* @vue/component */
);
export default baseMixins.extend().extend({
    name: 'v-btn',
    props: {
        activeClass: {
            type: String,
            default() {
                if (!this.btnToggle)
                    return '';
                return this.btnToggle.activeClass;
            },
        },
        block: Boolean,
        depressed: Boolean,
        fab: Boolean,
        icon: Boolean,
        loading: Boolean,
        outlined: Boolean,
        retainFocusOnClick: Boolean,
        rounded: Boolean,
        tag: {
            type: String,
            default: 'button',
        },
        text: Boolean,
        type: {
            type: String,
            default: 'button',
        },
        value: null,
    },
    data: () => ({
        proxyClass: 'v-btn--active',
    }),
    computed: {
        classes() {
            return {
                'v-btn': true,
                ...Routable.options.computed.classes.call(this),
                'v-btn--absolute': this.absolute,
                'v-btn--block': this.block,
                'v-btn--bottom': this.bottom,
                'v-btn--contained': this.contained,
                'v-btn--depressed': (this.depressed) || this.outlined,
                'v-btn--disabled': this.disabled,
                'v-btn--fab': this.fab,
                'v-btn--fixed': this.fixed,
                'v-btn--flat': this.isFlat,
                'v-btn--icon': this.icon,
                'v-btn--left': this.left,
                'v-btn--loading': this.loading,
                'v-btn--outlined': this.outlined,
                'v-btn--right': this.right,
                'v-btn--round': this.isRound,
                'v-btn--rounded': this.rounded,
                'v-btn--router': this.to,
                'v-btn--text': this.text,
                'v-btn--tile': this.tile,
                'v-btn--top': this.top,
                ...this.themeClasses,
                ...this.groupClasses,
                ...this.elevationClasses,
                ...this.sizeableClasses,
            };
        },
        contained() {
            return Boolean(!this.isFlat &&
                !this.depressed &&
                // Contained class only adds elevation
                // is not needed if user provides value
                !this.elevation);
        },
        computedRipple() {
            const defaultRipple = this.icon || this.fab ? { circle: true } : true;
            if (this.disabled)
                return false;
            else
                return this.ripple != null ? this.ripple : defaultRipple;
        },
        isFlat() {
            return Boolean(this.icon ||
                this.text ||
                this.outlined);
        },
        isRound() {
            return Boolean(this.icon ||
                this.fab);
        },
        styles() {
            return {
                ...this.measurableStyles,
            };
        },
    },
    created() {
        const breakingProps = [
            ['flat', 'text'],
            ['outline', 'outlined'],
            ['round', 'rounded'],
        ];
        /* istanbul ignore next */
        breakingProps.forEach(([original, replacement]) => {
            if (this.$attrs.hasOwnProperty(original))
                breaking(original, replacement, this);
        });
    },
    methods: {
        click(e) {
            !this.retainFocusOnClick && !this.fab && e.detail && this.$el.blur();
            this.$emit('click', e);
            this.btnToggle && this.toggle();
        },
        genContent() {
            return this.$createElement('span', {
                staticClass: 'v-btn__content',
            }, this.$slots.default);
        },
        genLoader() {
            return this.$createElement('span', {
                class: 'v-btn__loader',
            }, this.$slots.loader || [this.$createElement(VProgressCircular, {
                    props: {
                        indeterminate: true,
                        size: 23,
                        width: 2,
                    },
                })]);
        },
    },
    render(h) {
        const children = [
            this.genContent(),
            this.loading && this.genLoader(),
        ];
        const setColor = !this.isFlat ? this.setBackgroundColor : this.setTextColor;
        const { tag, data } = this.generateRouteLink();
        if (tag === 'button') {
            data.attrs.type = this.type;
            data.attrs.disabled = this.disabled;
        }
        data.attrs.value = ['string', 'number'].includes(typeof this.value)
            ? this.value
            : JSON.stringify(this.value);
        return h(tag, this.disabled ? data : setColor(this.color, data), children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkJ0bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZCdG4vVkJ0bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxhQUFhLENBQUE7QUFFcEIsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLFdBQVcsQ0FBQTtBQUU5QixhQUFhO0FBQ2IsT0FBTyxpQkFBaUIsTUFBTSxzQkFBc0IsQ0FBQTtBQUVwRCxTQUFTO0FBQ1QsT0FBTyxFQUFFLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3BFLE9BQU8sRUFBRSxPQUFPLElBQUksaUJBQWlCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUN0RSxPQUFPLFlBQVksTUFBTSwyQkFBMkIsQ0FBQTtBQUNwRCxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUM1QyxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUU1QyxZQUFZO0FBQ1osT0FBTyxNQUFzQixNQUFNLG1CQUFtQixDQUFBO0FBQ3RELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQU83QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLE1BQU0sRUFDTixRQUFRLEVBQ1IsWUFBWSxFQUNaLFFBQVEsRUFDUixnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFDN0IsaUJBQWlCLENBQUMsWUFBWSxDQUFDO0FBQy9CLG9CQUFvQjtDQUNyQixDQUFBO0FBS0QsZUFBZSxVQUFVLENBQUMsTUFBTSxFQUFXLENBQUMsTUFBTSxDQUFDO0lBQ2pELElBQUksRUFBRSxPQUFPO0lBRWIsS0FBSyxFQUFFO1FBQ0wsV0FBVyxFQUFFO1lBQ1gsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPO2dCQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztvQkFBRSxPQUFPLEVBQUUsQ0FBQTtnQkFFOUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdB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Q0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDbEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQ1osQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRTlCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQzVFLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WQnRuLnNhc3MnXG5cbi8vIEV4dGVuc2lvbnNcbmltcG9ydCBWU2hlZXQgZnJvbSAnLi4vVlNoZWV0J1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVlByb2dyZXNzQ2lyY3VsYXIgZnJvbSAnLi4vVlByb2dyZXNzQ2lyY3VsYXInXG5cbi8vIE1peGluc1xuaW1wb3J0IHsgZmFjdG9yeSBhcyBHcm91cGFibGVGYWN0b3J5IH0gZnJvbSAnLi4vLi4vbWl4aW5zL2dyb3VwYWJsZSdcbmltcG9ydCB7IGZhY3RvcnkgYXMgVG9nZ2xlYWJsZUZhY3RvcnkgfSBmcm9tICcuLi8uLi9taXhpbnMvdG9nZ2xlYWJsZSdcbmltcG9ydCBQb3NpdGlvbmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3Bvc2l0aW9uYWJsZSdcbmltcG9ydCBSb3V0YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvcm91dGFibGUnXG5pbXBvcnQgU2l6ZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3NpemVhYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBtaXhpbnMsIHsgRXh0cmFjdFZ1ZSB9IGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgYnJlYWtpbmcgfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFByb3BWYWxpZGF0b3IsIFByb3BUeXBlIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5pbXBvcnQgeyBSaXBwbGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yaXBwbGUnXG5cbmNvbnN0IGJhc2VNaXhpbnMgPSBtaXhpbnMoXG4gIFZTaGVldCxcbiAgUm91dGFibGUsXG4gIFBvc2l0aW9uYWJsZSxcbiAgU2l6ZWFibGUsXG4gIEdyb3VwYWJsZUZhY3RvcnkoJ2J0blRvZ2dsZScpLFxuICBUb2dnbGVhYmxlRmFjdG9yeSgnaW5wdXRWYWx1ZScpXG4gIC8qIEB2dWUvY29tcG9uZW50ICovXG4pXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIEV4dHJhY3RWdWU8dHlwZW9mIGJhc2VNaXhpbnM+IHtcbiAgJGVsOiBIVE1MRWxlbWVudFxufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZDxvcHRpb25zPigpLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWJ0bicsXG5cbiAgcHJvcHM6IHtcbiAgICBhY3RpdmVDbGFzczoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdCAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKCF0aGlzLmJ0blRvZ2dsZSkgcmV0dXJuICcnXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYnRuVG9nZ2xlLmFjdGl2ZUNsYXNzXG4gICAgICB9LFxuICAgIH0gYXMgYW55IGFzIFByb3BWYWxpZGF0b3I8c3RyaW5nPixcbiAgICBibG9jazogQm9vbGVhbixcbiAgICBkZXByZXNzZWQ6IEJvb2xlYW4sXG4gICAgZmFiOiBCb29sZWFuLFxuICAgIGljb246IEJvb2xlYW4sXG4gICAgbG9hZGluZzogQm9vbGVhbixcbiAgICBvdXRsaW5lZDogQm9vbGVhbixcbiAgICByZXRhaW5Gb2N1c09uQ2xpY2s6IEJvb2xlYW4sXG4gICAgcm91bmRlZDogQm9vbGVhbixcbiAgICB0YWc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdidXR0b24nLFxuICAgIH0sXG4gICAgdGV4dDogQm9vbGVhbixcbiAgICB0eXBlOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnYnV0dG9uJyxcbiAgICB9LFxuICAgIHZhbHVlOiBudWxsIGFzIGFueSBhcyBQcm9wVHlwZTxhbnk+LFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgcHJveHlDbGFzczogJ3YtYnRuLS1hY3RpdmUnLFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IGFueSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndi1idG4nOiB0cnVlLFxuICAgICAgICAuLi5Sb3V0YWJsZS5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtYnRuLS1hYnNvbHV0ZSc6IHRoaXMuYWJzb2x1dGUsXG4gICAgICAgICd2LWJ0bi0tYmxvY2snOiB0aGlzLmJsb2NrLFxuICAgICAgICAndi1idG4tLWJvdHRvbSc6IHRoaXMuYm90dG9tLFxuICAgICAgICAndi1idG4tLWNvbnRhaW5lZCc6IHRoaXMuY29udGFpbmVkLFxuICAgICAgICAndi1idG4tLWRlcHJlc3NlZCc6ICh0aGlzLmRlcHJlc3NlZCkgfHwgdGhpcy5vdXRsaW5lZCxcbiAgICAgICAgJ3YtYnRuLS1kaXNhYmxlZCc6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICd2LWJ0bi0tZmFiJzogdGhpcy5mYWIsXG4gICAgICAgICd2LWJ0bi0tZml4ZWQnOiB0aGlzLmZpeGVkLFxuICAgICAgICAndi1idG4tLWZsYXQnOiB0aGlzLmlzRmxhdCxcbiAgICAgICAgJ3YtYnRuLS1pY29uJzogdGhpcy5pY29uLFxuICAgICAgICAndi1idG4tLWxlZnQnOiB0aGlzLmxlZnQsXG4gICAgICAgICd2LWJ0bi0tbG9hZGluZyc6IHRoaXMubG9hZGluZyxcbiAgICAgICAgJ3YtYnRuLS1vdXRsaW5lZCc6IHRoaXMub3V0bGluZWQsXG4gICAgICAgICd2LWJ0bi0tcmlnaHQnOiB0aGlzLnJpZ2h0LFxuICAgICAgICAndi1idG4tLXJvdW5kJzogdGhpcy5pc1JvdW5kLFxuICAgICAgICAndi1idG4tLXJvdW5kZWQnOiB0aGlzLnJvdW5kZWQsXG4gICAgICAgICd2LWJ0bi0tcm91dGVyJzogdGhpcy50byxcbiAgICAgICAgJ3YtYnRuLS10ZXh0JzogdGhpcy50ZXh0LFxuICAgICAgICAndi1idG4tLXRpbGUnOiB0aGlzLnRpbGUsXG4gICAgICAgICd2LWJ0bi0tdG9wJzogdGhpcy50b3AsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgICAuLi50aGlzLmdyb3VwQ2xhc3NlcyxcbiAgICAgICAgLi4udGhpcy5lbGV2YXRpb25DbGFzc2VzLFxuICAgICAgICAuLi50aGlzLnNpemVhYmxlQ2xhc3NlcyxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbnRhaW5lZCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gQm9vbGVhbihcbiAgICAgICAgIXRoaXMuaXNGbGF0ICYmXG4gICAgICAgICF0aGlzLmRlcHJlc3NlZCAmJlxuICAgICAgICAvLyBDb250YWluZWQgY2xhc3Mgb25seSBhZGRzIGVsZXZhdGlvblxuICAgICAgICAvLyBpcyBub3QgbmVlZGVkIGlmIHVzZXIgcHJvdmlkZXMgdmFsdWVcbiAgICAgICAgIXRoaXMuZWxldmF0aW9uXG4gICAgICApXG4gICAgfSxcbiAgICBjb21wdXRlZFJpcHBsZSAoKTogUmlwcGxlT3B0aW9ucyB8IGJvb2xlYW4ge1xuICAgICAgY29uc3QgZGVmYXVsdFJpcHBsZSA9IHRoaXMuaWNvbiB8fCB0aGlzLmZhYiA/IHsgY2lyY2xlOiB0cnVlIH0gOiB0cnVlXG4gICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuIGZhbHNlXG4gICAgICBlbHNlIHJldHVybiB0aGlzLnJpcHBsZSAhPSBudWxsID8gdGhpcy5yaXBwbGUgOiBkZWZhdWx0UmlwcGxlXG4gICAgfSxcbiAgICBpc0ZsYXQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIEJvb2xlYW4oXG4gICAgICAgIHRoaXMuaWNvbiB8fFxuICAgICAgICB0aGlzLnRleHQgfHxcbiAgICAgICAgdGhpcy5vdXRsaW5lZFxuICAgICAgKVxuICAgIH0sXG4gICAgaXNSb3VuZCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gQm9vbGVhbihcbiAgICAgICAgdGhpcy5pY29uIHx8XG4gICAgICAgIHRoaXMuZmFiXG4gICAgICApXG4gICAgfSxcbiAgICBzdHlsZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi50aGlzLm1lYXN1cmFibGVTdHlsZXMsXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICBjb25zdCBicmVha2luZ1Byb3BzID0gW1xuICAgICAgWydmbGF0JywgJ3RleHQnXSxcbiAgICAgIFsnb3V0bGluZScsICdvdXRsaW5lZCddLFxuICAgICAgWydyb3VuZCcsICdyb3VuZGVkJ10sXG4gICAgXVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBicmVha2luZ1Byb3BzLmZvckVhY2goKFtvcmlnaW5hbCwgcmVwbGFjZW1lbnRdKSA9PiB7XG4gICAgICBpZiAodGhpcy4kYXR0cnMuaGFzT3duUHJvcGVydHkob3JpZ2luYWwpKSBicmVha2luZyhvcmlnaW5hbCwgcmVwbGFjZW1lbnQsIHRoaXMpXG4gICAgfSlcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgY2xpY2sgKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICF0aGlzLnJldGFpbkZvY3VzT25DbGljayAmJiAhdGhpcy5mYWIgJiYgZS5kZXRhaWwgJiYgdGhpcy4kZWwuYmx1cigpXG4gICAgICB0aGlzLiRlbWl0KCdjbGljaycsIGUpXG5cbiAgICAgIHRoaXMuYnRuVG9nZ2xlICYmIHRoaXMudG9nZ2xlKClcbiAgICB9LFxuICAgIGdlbkNvbnRlbnQgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdzcGFuJywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtYnRuX19jb250ZW50JyxcbiAgICAgIH0sIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gICAgfSxcbiAgICBnZW5Mb2FkZXIgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdzcGFuJywge1xuICAgICAgICBjbGFzczogJ3YtYnRuX19sb2FkZXInLFxuICAgICAgfSwgdGhpcy4kc2xvdHMubG9hZGVyIHx8IFt0aGlzLiRjcmVhdGVFbGVtZW50KFZQcm9ncmVzc0NpcmN1bGFyLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgaW5kZXRlcm1pbmF0ZTogdHJ1ZSxcbiAgICAgICAgICBzaXplOiAyMyxcbiAgICAgICAgICB3aWR0aDogMixcbiAgICAgICAgfSxcbiAgICAgIH0pXSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IFtcbiAgICAgIHRoaXMuZ2VuQ29udGVudCgpLFxuICAgICAgdGhpcy5sb2FkaW5nICYmIHRoaXMuZ2VuTG9hZGVyKCksXG4gICAgXVxuICAgIGNvbnN0IHNldENvbG9yID0gIXRoaXMuaXNGbGF0ID8gdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IgOiB0aGlzLnNldFRleHRDb2xvclxuICAgIGNvbnN0IHsgdGFnLCBkYXRhIH0gPSB0aGlzLmdlbmVyYXRlUm91dGVMaW5rKClcblxuICAgIGlmICh0YWcgPT09ICdidXR0b24nKSB7XG4gICAgICBkYXRhLmF0dHJzIS50eXBlID0gdGhpcy50eXBlXG4gICAgICBkYXRhLmF0dHJzIS5kaXNhYmxlZCA9IHRoaXMuZGlzYWJsZWRcbiAgICB9XG4gICAgZGF0YS5hdHRycyEudmFsdWUgPSBbJ3N0cmluZycsICdudW1iZXInXS5pbmNsdWRlcyh0eXBlb2YgdGhpcy52YWx1ZSlcbiAgICAgID8gdGhpcy52YWx1ZVxuICAgICAgOiBKU09OLnN0cmluZ2lmeSh0aGlzLnZhbHVlKVxuXG4gICAgcmV0dXJuIGgodGFnLCB0aGlzLmRpc2FibGVkID8gZGF0YSA6IHNldENvbG9yKHRoaXMuY29sb3IsIGRhdGEpLCBjaGlsZHJlbilcbiAgfSxcbn0pXG4iXX0=