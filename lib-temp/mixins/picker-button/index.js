// Mixins
import Colorable from '../colorable';
// Utilities
import mixins from '../../util/mixins';
import { kebabCase } from '../../util/helpers';
/* @vue/component */
export default mixins(Colorable).extend({
    methods: {
        genPickerButton(prop, value, content, readonly = false, staticClass = '') {
            const active = this[prop] === value;
            const click = (event) => {
                event.stopPropagation();
                this.$emit(`update:${kebabCase(prop)}`, value);
            };
            return this.$createElement('div', {
                staticClass: `v-picker__title__btn ${staticClass}`.trim(),
                class: {
                    'v-picker__title__btn--active': active,
                    'v-picker__title__btn--readonly': readonly,
                },
                on: (active || readonly) ? undefined : { click },
            }, Array.isArray(content) ? content : [content]);
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL3BpY2tlci1idXR0b24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQTtBQUVwQyxZQUFZO0FBQ1osT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBSzlDLG9CQUFvQjtBQUNwQixlQUFlLE1BQU0sQ0FDbkIsU0FBUyxDQUNWLENBQUMsTUFBTSxDQUFDO0lBQ1AsT0FBTyxFQUFFO1FBQ1AsZUFBZSxDQUNiLElBQVksRUFDWixLQUFVLEVBQ1YsT0FBc0IsRUFDdEIsUUFBUSxHQUFHLEtBQUssRUFDaEIsV0FBVyxHQUFHLEVBQUU7WUFFaEIsTUFBTSxNQUFNLEdBQUksSUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQTtZQUM1QyxNQUFNLEtBQUssR0FBRyxDQUFDLEtBQVksRUFBRSxFQUFFO2dCQUM3QixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUE7Z0JBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUNoRCxDQUFDLENBQUE7WUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO2dCQUNoQyxXQUFXLEVBQUUsd0JBQXdCLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRTtnQkFDekQsS0FBSyxFQUFFO29CQUNMLDhCQUE4QixFQUFFLE1BQU07b0JBQ3RDLGdDQUFnQyxFQUFFLFFBQVE7aUJBQzNDO2dCQUNELEVBQUUsRUFBRSxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRTthQUNqRCxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBQ2xELENBQUM7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIE1peGluc1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi9jb2xvcmFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IGtlYmFiQ2FzZSB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlQ2hpbGRyZW4gfSBmcm9tICd2dWUnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoXG4gIENvbG9yYWJsZVxuKS5leHRlbmQoe1xuICBtZXRob2RzOiB7XG4gICAgZ2VuUGlja2VyQnV0dG9uIChcbiAgICAgIHByb3A6IHN0cmluZyxcbiAgICAgIHZhbHVlOiBhbnksXG4gICAgICBjb250ZW50OiBWTm9kZUNoaWxkcmVuLFxuICAgICAgcmVhZG9ubHkgPSBmYWxzZSxcbiAgICAgIHN0YXRpY0NsYXNzID0gJydcbiAgICApIHtcbiAgICAgIGNvbnN0IGFjdGl2ZSA9ICh0aGlzIGFzIGFueSlbcHJvcF0gPT09IHZhbHVlXG4gICAgICBjb25zdCBjbGljayA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgdGhpcy4kZW1pdChgdXBkYXRlOiR7a2ViYWJDYXNlKHByb3ApfWAsIHZhbHVlKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogYHYtcGlja2VyX190aXRsZV9fYnRuICR7c3RhdGljQ2xhc3N9YC50cmltKCksXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3YtcGlja2VyX190aXRsZV9fYnRuLS1hY3RpdmUnOiBhY3RpdmUsXG4gICAgICAgICAgJ3YtcGlja2VyX190aXRsZV9fYnRuLS1yZWFkb25seSc6IHJlYWRvbmx5LFxuICAgICAgICB9LFxuICAgICAgICBvbjogKGFjdGl2ZSB8fCByZWFkb25seSkgPyB1bmRlZmluZWQgOiB7IGNsaWNrIH0sXG4gICAgICB9LCBBcnJheS5pc0FycmF5KGNvbnRlbnQpID8gY29udGVudCA6IFtjb250ZW50XSlcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==