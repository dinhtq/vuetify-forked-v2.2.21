// Mixins
import Toggleable from '../../mixins/toggleable';
// Directives
import intersect from '../../directives/intersect';
// Utilities
import mixins from '../../util/mixins';
import { convertToUnit, getSlot } from '../../util/helpers';
export default mixins(Toggleable).extend({
    name: 'VLazy',
    directives: { intersect },
    props: {
        minHeight: [Number, String],
        options: {
            type: Object,
            // For more information on types, navigate to:
            // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
            default: () => ({
                root: undefined,
                rootMargin: undefined,
                threshold: undefined,
            }),
        },
        tag: {
            type: String,
            default: 'div',
        },
        transition: {
            type: String,
            default: 'fade-transition',
        },
    },
    computed: {
        styles() {
            return {
                minHeight: parseInt(this.minHeight) ? convertToUnit(this.minHeight) : this.minHeight,
            };
        },
    },
    methods: {
        genContent() {
            const slot = getSlot(this);
            /* istanbul ignore if */
            if (!this.transition)
                return slot;
            const children = [];
            if (this.isActive)
                children.push(slot);
            return this.$createElement('transition', {
                props: { name: this.transition },
            }, children);
        },
        onObserve(entries, observer, isIntersecting) {
            if (this.isActive)
                return;
            this.isActive = isIntersecting;
        },
    },
    render(h) {
        return h(this.tag, {
            staticClass: 'v-lazy',
            attrs: this.$attrs,
            directives: [{
                    name: 'intersect',
                    value: {
                        handler: this.onObserve,
                        options: this.options,
                    },
                }],
            on: this.$listeners,
            style: this.styles,
        }, [this.genContent()]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxhenkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WTGF6eS9WTGF6eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFFaEQsYUFBYTtBQUNiLE9BQU8sU0FBUyxNQUFNLDRCQUE0QixDQUFBO0FBRWxELFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBTTNELGVBQWUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN2QyxJQUFJLEVBQUUsT0FBTztJQUViLFVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRTtJQUV6QixLQUFLLEVBQUU7UUFDTCxTQUFTLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQzNCLE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSxNQUFNO1lBQ1osOENBQThDO1lBQzlDLDZFQUE2RTtZQUM3RSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDZCxJQUFJLEVBQUUsU0FBUztnQkFDZixVQUFVLEVBQUUsU0FBUztnQkFDckIsU0FBUyxFQUFFLFNBQVM7YUFDckIsQ0FBQztTQUN3QztRQUM1QyxHQUFHLEVBQUU7WUFDSCxJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxLQUFLO1NBQ2Y7UUFDRCxVQUFVLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxpQkFBaUI7U0FDM0I7S0FDRjtJQUVELFFBQVEsRUFBRTtRQUNSLE1BQU07WUFDSixPQUFPO2dCQUNMLFNBQVMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUzthQUNyRixDQUFBO1FBQ0gsQ0FBQztLQUNGO0lBRUQsT0FBTyxFQUFFO1FBQ1AsVUFBVTtZQUNSLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUUxQix3QkFBd0I7WUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU8sSUFBSSxDQUFBO1lBRWpDLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQTtZQUVuQixJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7WUFFdEMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRTtnQkFDdkMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7YUFDakMsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUNkLENBQUM7UUFDRCxTQUFTLENBQ1AsT0FBb0MsRUFDcEMsUUFBOEIsRUFDOUIsY0FBdUI7WUFFdkIsSUFBSSxJQUFJLENBQUMsUUFBUTtnQkFBRSxPQUFNO1lBRXpCLElBQUksQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFBO1FBQ2hDLENBQUM7S0FDRjtJQUVELE1BQU0sQ0FBRSxDQUFDO1FBQ1AsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNqQixXQUFXLEVBQUUsUUFBUTtZQUNyQixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbEIsVUFBVSxFQUFFLENBQUM7b0JBQ1gsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLEtBQUssRUFBRTt3QkFDTCxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVM7d0JBQ3ZCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztxQkFDdEI7aUJBQ0YsQ0FBQztZQUNGLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU07U0FDbkIsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDekIsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIE1peGluc1xuaW1wb3J0IFRvZ2dsZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RvZ2dsZWFibGUnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBpbnRlcnNlY3QgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9pbnRlcnNlY3QnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IGNvbnZlcnRUb1VuaXQsIGdldFNsb3QgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFByb3BWYWxpZGF0b3IgfSBmcm9tICd2dWUvdHlwZXMvb3B0aW9ucydcblxuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFRvZ2dsZWFibGUpLmV4dGVuZCh7XG4gIG5hbWU6ICdWTGF6eScsXG5cbiAgZGlyZWN0aXZlczogeyBpbnRlcnNlY3QgfSxcblxuICBwcm9wczoge1xuICAgIG1pbkhlaWdodDogW051bWJlciwgU3RyaW5nXSxcbiAgICBvcHRpb25zOiB7XG4gICAgICB0eXBlOiBPYmplY3QsXG4gICAgICAvLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0eXBlcywgbmF2aWdhdGUgdG86XG4gICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSW50ZXJzZWN0aW9uX09ic2VydmVyX0FQSVxuICAgICAgZGVmYXVsdDogKCkgPT4gKHtcbiAgICAgICAgcm9vdDogdW5kZWZpbmVkLFxuICAgICAgICByb290TWFyZ2luOiB1bmRlZmluZWQsXG4gICAgICAgIHRocmVzaG9sZDogdW5kZWZpbmVkLFxuICAgICAgfSksXG4gICAgfSBhcyBQcm9wVmFsaWRhdG9yPEludGVyc2VjdGlvbk9ic2VydmVySW5pdD4sXG4gICAgdGFnOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnZGl2JyxcbiAgICB9LFxuICAgIHRyYW5zaXRpb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdmYWRlLXRyYW5zaXRpb24nLFxuICAgIH0sXG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBzdHlsZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtaW5IZWlnaHQ6IHBhcnNlSW50KHRoaXMubWluSGVpZ2h0KSA/IGNvbnZlcnRUb1VuaXQodGhpcy5taW5IZWlnaHQpIDogdGhpcy5taW5IZWlnaHQsXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICBjb25zdCBzbG90ID0gZ2V0U2xvdCh0aGlzKVxuXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghdGhpcy50cmFuc2l0aW9uKSByZXR1cm4gc2xvdFxuXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtdXG5cbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSBjaGlsZHJlbi5wdXNoKHNsb3QpXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCd0cmFuc2l0aW9uJywge1xuICAgICAgICBwcm9wczogeyBuYW1lOiB0aGlzLnRyYW5zaXRpb24gfSxcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgb25PYnNlcnZlIChcbiAgICAgIGVudHJpZXM6IEludGVyc2VjdGlvbk9ic2VydmVyRW50cnlbXSxcbiAgICAgIG9ic2VydmVyOiBJbnRlcnNlY3Rpb25PYnNlcnZlcixcbiAgICAgIGlzSW50ZXJzZWN0aW5nOiBib29sZWFuLFxuICAgICkge1xuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUpIHJldHVyblxuXG4gICAgICB0aGlzLmlzQWN0aXZlID0gaXNJbnRlcnNlY3RpbmdcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICByZXR1cm4gaCh0aGlzLnRhZywge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LWxhenknLFxuICAgICAgYXR0cnM6IHRoaXMuJGF0dHJzLFxuICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgbmFtZTogJ2ludGVyc2VjdCcsXG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgaGFuZGxlcjogdGhpcy5vbk9ic2VydmUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9LFxuICAgICAgfV0sXG4gICAgICBvbjogdGhpcy4kbGlzdGVuZXJzLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGVzLFxuICAgIH0sIFt0aGlzLmdlbkNvbnRlbnQoKV0pXG4gIH0sXG59KVxuIl19