// Directives
import Intersect from '../../directives/intersect';
// Utilities
import { consoleWarn } from '../../util/console';
// Types
import Vue from 'vue';
export default function intersectable(options) {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        // do nothing because intersection observer is not available
        return Vue.extend({ name: 'intersectable' });
    }
    return Vue.extend({
        name: 'intersectable',
        mounted() {
            Intersect.inserted(this.$el, {
                name: 'intersect',
                value: {
                    handler: this.onObserve,
                },
            });
        },
        destroyed() {
            Intersect.unbind(this.$el);
        },
        methods: {
            onObserve(entries, observer, isIntersecting) {
                if (!isIntersecting)
                    return;
                for (let i = 0, length = options.onVisible.length; i < length; i++) {
                    const callback = this[options.onVisible[i]];
                    if (typeof callback === 'function') {
                        callback();
                        continue;
                    }
                    consoleWarn(options.onVisible[i] + ' method is not available on the instance but referenced in intersectable mixin options');
                }
            },
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL2ludGVyc2VjdGFibGUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsYUFBYTtBQUNiLE9BQU8sU0FBUyxNQUFNLDRCQUE0QixDQUFBO0FBRWxELFlBQVk7QUFDWixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFFaEQsUUFBUTtBQUNSLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQTtBQUVyQixNQUFNLENBQUMsT0FBTyxVQUFVLGFBQWEsQ0FBRSxPQUFnQztJQUNyRSxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsc0JBQXNCLElBQUksTUFBTSxDQUFDLEVBQUU7UUFDeEUsNERBQTREO1FBQzVELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFBO0tBQzdDO0lBRUQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ2hCLElBQUksRUFBRSxlQUFlO1FBRXJCLE9BQU87WUFDTCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFrQixFQUFFO2dCQUMxQyxJQUFJLEVBQUUsV0FBVztnQkFDakIsS0FBSyxFQUFFO29CQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUztpQkFDeEI7YUFDRixDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQsU0FBUztZQUNQLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQWtCLENBQUMsQ0FBQTtRQUMzQyxDQUFDO1FBRUQsT0FBTyxFQUFFO1lBQ1AsU0FBUyxDQUFFLE9BQW9DLEVBQUUsUUFBOEIsRUFBRSxjQUF1QjtnQkFDdEcsSUFBSSxDQUFDLGNBQWM7b0JBQUUsT0FBTTtnQkFFM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ2xFLE1BQU0sUUFBUSxHQUFJLElBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBRXBELElBQUksT0FBTyxRQUFRLEtBQUssVUFBVSxFQUFFO3dCQUNsQyxRQUFRLEVBQUUsQ0FBQTt3QkFDVixTQUFRO3FCQUNUO29CQUVELFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLHdGQUF3RixDQUFDLENBQUE7aUJBQzdIO1lBQ0gsQ0FBQztTQUNGO0tBQ0YsQ0FBQyxDQUFBO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIERpcmVjdGl2ZXNcbmltcG9ydCBJbnRlcnNlY3QgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9pbnRlcnNlY3QnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IHsgY29uc29sZVdhcm4gfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5cbi8vIFR5cGVzXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW50ZXJzZWN0YWJsZSAob3B0aW9uczogeyBvblZpc2libGU6IHN0cmluZ1tdIH0pIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8ICEoJ0ludGVyc2VjdGlvbk9ic2VydmVyJyBpbiB3aW5kb3cpKSB7XG4gICAgLy8gZG8gbm90aGluZyBiZWNhdXNlIGludGVyc2VjdGlvbiBvYnNlcnZlciBpcyBub3QgYXZhaWxhYmxlXG4gICAgcmV0dXJuIFZ1ZS5leHRlbmQoeyBuYW1lOiAnaW50ZXJzZWN0YWJsZScgfSlcbiAgfVxuXG4gIHJldHVybiBWdWUuZXh0ZW5kKHtcbiAgICBuYW1lOiAnaW50ZXJzZWN0YWJsZScsXG5cbiAgICBtb3VudGVkICgpIHtcbiAgICAgIEludGVyc2VjdC5pbnNlcnRlZCh0aGlzLiRlbCBhcyBIVE1MRWxlbWVudCwge1xuICAgICAgICBuYW1lOiAnaW50ZXJzZWN0JyxcbiAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICBoYW5kbGVyOiB0aGlzLm9uT2JzZXJ2ZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGRlc3Ryb3llZCAoKSB7XG4gICAgICBJbnRlcnNlY3QudW5iaW5kKHRoaXMuJGVsIGFzIEhUTUxFbGVtZW50KVxuICAgIH0sXG5cbiAgICBtZXRob2RzOiB7XG4gICAgICBvbk9ic2VydmUgKGVudHJpZXM6IEludGVyc2VjdGlvbk9ic2VydmVyRW50cnlbXSwgb2JzZXJ2ZXI6IEludGVyc2VjdGlvbk9ic2VydmVyLCBpc0ludGVyc2VjdGluZzogYm9vbGVhbikge1xuICAgICAgICBpZiAoIWlzSW50ZXJzZWN0aW5nKSByZXR1cm5cblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gb3B0aW9ucy5vblZpc2libGUubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBjYWxsYmFjayA9ICh0aGlzIGFzIGFueSlbb3B0aW9ucy5vblZpc2libGVbaV1dXG5cbiAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnNvbGVXYXJuKG9wdGlvbnMub25WaXNpYmxlW2ldICsgJyBtZXRob2QgaXMgbm90IGF2YWlsYWJsZSBvbiB0aGUgaW5zdGFuY2UgYnV0IHJlZmVyZW5jZWQgaW4gaW50ZXJzZWN0YWJsZSBtaXhpbiBvcHRpb25zJylcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KVxufVxuIl19