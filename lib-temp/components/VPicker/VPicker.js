import './VPicker.sass';
import '../VCard/VCard.sass';
// Mixins
import Colorable from '../../mixins/colorable';
import Themeable from '../../mixins/themeable';
// Helpers
import { convertToUnit } from '../../util/helpers';
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(Colorable, Themeable).extend({
    name: 'v-picker',
    props: {
        fullWidth: Boolean,
        landscape: Boolean,
        noTitle: Boolean,
        transition: {
            type: String,
            default: 'fade-transition',
        },
        width: {
            type: [Number, String],
            default: 290,
        },
    },
    computed: {
        computedTitleColor() {
            const defaultTitleColor = this.isDark ? false : (this.color || 'primary');
            return this.color || defaultTitleColor;
        },
    },
    methods: {
        genTitle() {
            return this.$createElement('div', this.setBackgroundColor(this.computedTitleColor, {
                staticClass: 'v-picker__title',
                class: {
                    'v-picker__title--landscape': this.landscape,
                },
            }), this.$slots.title);
        },
        genBodyTransition() {
            return this.$createElement('transition', {
                props: {
                    name: this.transition,
                },
            }, this.$slots.default);
        },
        genBody() {
            return this.$createElement('div', {
                staticClass: 'v-picker__body',
                class: {
                    'v-picker__body--no-title': this.noTitle,
                    ...this.themeClasses,
                },
                style: this.fullWidth ? undefined : {
                    width: convertToUnit(this.width),
                },
            }, [
                this.genBodyTransition(),
            ]);
        },
        genActions() {
            return this.$createElement('div', {
                staticClass: 'v-picker__actions v-card__actions',
                class: {
                    'v-picker__actions--no-title': this.noTitle,
                },
            }, this.$slots.actions);
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-picker v-card',
            class: {
                'v-picker--landscape': this.landscape,
                'v-picker--full-width': this.fullWidth,
                ...this.themeClasses,
            },
        }, [
            this.$slots.title ? this.genTitle() : null,
            this.genBody(),
            this.$slots.actions ? this.genActions() : null,
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZQaWNrZXIvVlBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGdCQUFnQixDQUFBO0FBQ3ZCLE9BQU8scUJBQXFCLENBQUE7QUFFNUIsU0FBUztBQUNULE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBRTlDLFVBQVU7QUFDVixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFJbEQsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFFdEMsb0JBQW9CO0FBQ3BCLGVBQWUsTUFBTSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDakQsSUFBSSxFQUFFLFVBQVU7SUFFaEIsS0FBSyxFQUFFO1FBQ0wsU0FBUyxFQUFFLE9BQU87UUFDbEIsU0FBUyxFQUFFLE9BQU87UUFDbEIsT0FBTyxFQUFFLE9BQU87UUFDaEIsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsaUJBQWlCO1NBQzNCO1FBQ0QsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsR0FBRztTQUNiO0tBQ0Y7SUFFRCxRQUFRLEVBQUU7UUFDUixrQkFBa0I7WUFDaEIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsQ0FBQTtZQUN6RSxPQUFPLElBQUksQ0FBQyxLQUFLLElBQUksaUJBQWlCLENBQUE7UUFDeEMsQ0FBQztLQUNGO0lBRUQsT0FBTyxFQUFFO1FBQ1AsUUFBUTtZQUNOLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDakYsV0FBVyxFQUFFLGlCQUFpQjtnQkFDOUIsS0FBSyxFQUFFO29CQUNMLDRCQUE0QixFQUFFLElBQUksQ0FBQyxTQUFTO2lCQUM3QzthQUNGLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ3hCLENBQUM7UUFDRCxpQkFBaUI7WUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFO2dCQUN2QyxLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVO2lCQUN0QjthQUNGLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QixDQUFDO1FBQ0QsT0FBTztZQUNMLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hDLFdBQVcsRUFBRSxnQkFBZ0I7Z0JBQzdCLEtBQUssRUFBRTtvQkFDTCwwQkFBMEIsRUFBRSxJQUFJLENBQUMsT0FBTztvQkFDeEMsR0FBRyxJQUFJLENBQUMsWUFBWTtpQkFDckI7Z0JBQ0QsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLEtBQUssRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFDakM7YUFDRixFQUFFO2dCQUNELElBQUksQ0FBQyxpQkFBaUIsRUFBRTthQUN6QixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsVUFBVTtZQUNSLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hDLFdBQVcsRUFBRSxtQ0FBbUM7Z0JBQ2hELEtBQUssRUFBRTtvQkFDTCw2QkFBNkIsRUFBRSxJQUFJLENBQUMsT0FBTztpQkFDNUM7YUFDRixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDekIsQ0FBQztLQUNGO0lBRUQsTUFBTSxDQUFFLENBQUM7UUFDUCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDZCxXQUFXLEVBQUUsaUJBQWlCO1lBQzlCLEtBQUssRUFBRTtnQkFDTCxxQkFBcUIsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDckMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3RDLEdBQUcsSUFBSSxDQUFDLFlBQVk7YUFDckI7U0FDRixFQUFFO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUMxQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUMvQyxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL1ZQaWNrZXIuc2FzcydcbmltcG9ydCAnLi4vVkNhcmQvVkNhcmQuc2FzcydcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ29sb3JhYmxlIGZyb20gJy4uLy4uL21peGlucy9jb2xvcmFibGUnXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5cbi8vIEhlbHBlcnNcbmltcG9ydCB7IGNvbnZlcnRUb1VuaXQgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZS90eXBlcydcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoQ29sb3JhYmxlLCBUaGVtZWFibGUpLmV4dGVuZCh7XG4gIG5hbWU6ICd2LXBpY2tlcicsXG5cbiAgcHJvcHM6IHtcbiAgICBmdWxsV2lkdGg6IEJvb2xlYW4sXG4gICAgbGFuZHNjYXBlOiBCb29sZWFuLFxuICAgIG5vVGl0bGU6IEJvb2xlYW4sXG4gICAgdHJhbnNpdGlvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2ZhZGUtdHJhbnNpdGlvbicsXG4gICAgfSxcbiAgICB3aWR0aDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDI5MCxcbiAgICB9LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY29tcHV0ZWRUaXRsZUNvbG9yICgpOiBzdHJpbmcgfCBmYWxzZSB7XG4gICAgICBjb25zdCBkZWZhdWx0VGl0bGVDb2xvciA9IHRoaXMuaXNEYXJrID8gZmFsc2UgOiAodGhpcy5jb2xvciB8fCAncHJpbWFyeScpXG4gICAgICByZXR1cm4gdGhpcy5jb2xvciB8fCBkZWZhdWx0VGl0bGVDb2xvclxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlblRpdGxlICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldEJhY2tncm91bmRDb2xvcih0aGlzLmNvbXB1dGVkVGl0bGVDb2xvciwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtcGlja2VyX190aXRsZScsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3YtcGlja2VyX190aXRsZS0tbGFuZHNjYXBlJzogdGhpcy5sYW5kc2NhcGUsXG4gICAgICAgIH0sXG4gICAgICB9KSwgdGhpcy4kc2xvdHMudGl0bGUpXG4gICAgfSxcbiAgICBnZW5Cb2R5VHJhbnNpdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgndHJhbnNpdGlvbicsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBuYW1lOiB0aGlzLnRyYW5zaXRpb24sXG4gICAgICAgIH0sXG4gICAgICB9LCB0aGlzLiRzbG90cy5kZWZhdWx0KVxuICAgIH0sXG4gICAgZ2VuQm9keSAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtcGlja2VyX19ib2R5JyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1waWNrZXJfX2JvZHktLW5vLXRpdGxlJzogdGhpcy5ub1RpdGxlLFxuICAgICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgICB9LFxuICAgICAgICBzdHlsZTogdGhpcy5mdWxsV2lkdGggPyB1bmRlZmluZWQgOiB7XG4gICAgICAgICAgd2lkdGg6IGNvbnZlcnRUb1VuaXQodGhpcy53aWR0aCksXG4gICAgICAgIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuZ2VuQm9keVRyYW5zaXRpb24oKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5BY3Rpb25zICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1waWNrZXJfX2FjdGlvbnMgdi1jYXJkX19hY3Rpb25zJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1waWNrZXJfX2FjdGlvbnMtLW5vLXRpdGxlJzogdGhpcy5ub1RpdGxlLFxuICAgICAgICB9LFxuICAgICAgfSwgdGhpcy4kc2xvdHMuYWN0aW9ucylcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LXBpY2tlciB2LWNhcmQnLFxuICAgICAgY2xhc3M6IHtcbiAgICAgICAgJ3YtcGlja2VyLS1sYW5kc2NhcGUnOiB0aGlzLmxhbmRzY2FwZSxcbiAgICAgICAgJ3YtcGlja2VyLS1mdWxsLXdpZHRoJzogdGhpcy5mdWxsV2lkdGgsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfSxcbiAgICB9LCBbXG4gICAgICB0aGlzLiRzbG90cy50aXRsZSA/IHRoaXMuZ2VuVGl0bGUoKSA6IG51bGwsXG4gICAgICB0aGlzLmdlbkJvZHkoKSxcbiAgICAgIHRoaXMuJHNsb3RzLmFjdGlvbnMgPyB0aGlzLmdlbkFjdGlvbnMoKSA6IG51bGwsXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=