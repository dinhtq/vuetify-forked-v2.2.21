// Mixins
import { factory as GroupableFactory } from '../../mixins/groupable';
import Routable from '../../mixins/routable';
import Themeable from '../../mixins/themeable';
// Utilities
import { keyCodes } from './../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Routable, 
// Must be after routable
// to overwrite activeClass
GroupableFactory('tabsBar'), Themeable);
export default baseMixins.extend().extend(
/* @vue/component */
).extend({
    name: 'v-tab',
    props: {
        ripple: {
            type: [Boolean, Object],
            default: true,
        },
    },
    data: () => ({
        proxyClass: 'v-tab--active',
    }),
    computed: {
        classes() {
            return {
                'v-tab': true,
                ...Routable.options.computed.classes.call(this),
                'v-tab--disabled': this.disabled,
                ...this.groupClasses,
            };
        },
        value() {
            let to = this.to || this.href || '';
            if (this.$router &&
                this.to === Object(this.to)) {
                const resolve = this.$router.resolve(this.to, this.$route, this.append);
                to = resolve.href;
            }
            return to.replace('#', '');
        },
    },
    mounted() {
        this.onRouteChange();
    },
    methods: {
        click(e) {
            // If user provides an
            // actual link, do not
            // prevent default
            if (this.href &&
                this.href.indexOf('#') > -1)
                e.preventDefault();
            if (e.detail)
                this.$el.blur();
            this.$emit('click', e);
            this.to || this.toggle();
        },
    },
    render(h) {
        const { tag, data } = this.generateRouteLink();
        data.attrs = {
            ...data.attrs,
            'aria-selected': String(this.isActive),
            role: 'tab',
            tabindex: 0,
        };
        data.on = {
            ...data.on,
            keydown: (e) => {
                if (e.keyCode === keyCodes.enter)
                    this.click(e);
                this.$emit('keydown', e);
            },
        };
        return h(tag, data, this.$slots.default);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlRhYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZUYWJzL1ZUYWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sRUFBRSxPQUFPLElBQUksZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNwRSxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUM1QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUU5QyxZQUFZO0FBQ1osT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBTXRDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsUUFBUTtBQUNSLHlCQUF5QjtBQUN6QiwyQkFBMkI7QUFDM0IsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQzNCLFNBQVMsQ0FDVixDQUFBO0FBTUQsZUFBZSxVQUFVLENBQUMsTUFBTSxFQUFXLENBQUMsTUFBTTtBQUNoRCxvQkFBb0I7Q0FDckIsQ0FBQyxNQUFNLENBQUM7SUFDUCxJQUFJLEVBQUUsT0FBTztJQUViLEtBQUssRUFBRTtRQUNMLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7WUFDdkIsT0FBTyxFQUFFLElBQUk7U0FDZDtLQUNGO0lBRUQsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDWCxVQUFVLEVBQUUsZUFBZTtLQUM1QixDQUFDO0lBRUYsUUFBUSxFQUFFO1FBQ1IsT0FBTztZQUNMLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDL0MsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ2hDLEdBQUcsSUFBSSxDQUFDLFlBQVk7YUFDckIsQ0FBQTtRQUNILENBQUM7UUFDRCxLQUFLO1lBQ0gsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQTtZQUVuQyxJQUFJLElBQUksQ0FBQyxPQUFPO2dCQUNkLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFDM0I7Z0JBQ0EsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQ2xDLElBQUksQ0FBQyxFQUFFLEVBQ1AsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsTUFBTSxDQUNaLENBQUE7Z0JBRUQsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUE7YUFDbEI7WUFFRCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzVCLENBQUM7S0FDRjtJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7SUFDdEIsQ0FBQztJQUVELE9BQU8sRUFBRTtRQUNQLEtBQUssQ0FBRSxDQUE2QjtZQUNsQyxzQkFBc0I7WUFDdEIsc0JBQXNCO1lBQ3RCLGtCQUFrQjtZQUNsQixJQUFJLElBQUksQ0FBQyxJQUFJO2dCQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0IsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO1lBRXBCLElBQUksQ0FBQyxDQUFDLE1BQU07Z0JBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtZQUU3QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUV0QixJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUMxQixDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7UUFFOUMsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLEdBQUcsSUFBSSxDQUFDLEtBQUs7WUFDYixlQUFlLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDdEMsSUFBSSxFQUFFLEtBQUs7WUFDWCxRQUFRLEVBQUUsQ0FBQztTQUNaLENBQUE7UUFDRCxJQUFJLENBQUMsRUFBRSxHQUFHO1lBQ1IsR0FBRyxJQUFJLENBQUMsRUFBRTtZQUNWLE9BQU8sRUFBRSxDQUFDLENBQWdCLEVBQUUsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxLQUFLO29CQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBRS9DLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQzFCLENBQUM7U0FDRixDQUFBO1FBRUQsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzFDLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBNaXhpbnNcbmltcG9ydCB7IGZhY3RvcnkgYXMgR3JvdXBhYmxlRmFjdG9yeSB9IGZyb20gJy4uLy4uL21peGlucy9ncm91cGFibGUnXG5pbXBvcnQgUm91dGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3JvdXRhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGtleUNvZGVzIH0gZnJvbSAnLi8uLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgRXh0cmFjdFZ1ZSB9IGZyb20gJy4vLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZS90eXBlcydcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgUm91dGFibGUsXG4gIC8vIE11c3QgYmUgYWZ0ZXIgcm91dGFibGVcbiAgLy8gdG8gb3ZlcndyaXRlIGFjdGl2ZUNsYXNzXG4gIEdyb3VwYWJsZUZhY3RvcnkoJ3RhYnNCYXInKSxcbiAgVGhlbWVhYmxlXG4pXG5cbmludGVyZmFjZSBvcHRpb25zIGV4dGVuZHMgRXh0cmFjdFZ1ZTx0eXBlb2YgYmFzZU1peGlucz4ge1xuICAkZWw6IEhUTUxFbGVtZW50XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VNaXhpbnMuZXh0ZW5kPG9wdGlvbnM+KCkuZXh0ZW5kKFxuICAvKiBAdnVlL2NvbXBvbmVudCAqL1xuKS5leHRlbmQoe1xuICBuYW1lOiAndi10YWInLFxuXG4gIHByb3BzOiB7XG4gICAgcmlwcGxlOiB7XG4gICAgICB0eXBlOiBbQm9vbGVhbiwgT2JqZWN0XSxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIHByb3h5Q2xhc3M6ICd2LXRhYi0tYWN0aXZlJyxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3YtdGFiJzogdHJ1ZSxcbiAgICAgICAgLi4uUm91dGFibGUub3B0aW9ucy5jb21wdXRlZC5jbGFzc2VzLmNhbGwodGhpcyksXG4gICAgICAgICd2LXRhYi0tZGlzYWJsZWQnOiB0aGlzLmRpc2FibGVkLFxuICAgICAgICAuLi50aGlzLmdyb3VwQ2xhc3NlcyxcbiAgICAgIH1cbiAgICB9LFxuICAgIHZhbHVlICgpOiBhbnkge1xuICAgICAgbGV0IHRvID0gdGhpcy50byB8fCB0aGlzLmhyZWYgfHwgJydcblxuICAgICAgaWYgKHRoaXMuJHJvdXRlciAmJlxuICAgICAgICB0aGlzLnRvID09PSBPYmplY3QodGhpcy50bylcbiAgICAgICkge1xuICAgICAgICBjb25zdCByZXNvbHZlID0gdGhpcy4kcm91dGVyLnJlc29sdmUoXG4gICAgICAgICAgdGhpcy50byxcbiAgICAgICAgICB0aGlzLiRyb3V0ZSxcbiAgICAgICAgICB0aGlzLmFwcGVuZFxuICAgICAgICApXG5cbiAgICAgICAgdG8gPSByZXNvbHZlLmhyZWZcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRvLnJlcGxhY2UoJyMnLCAnJylcbiAgICB9LFxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIHRoaXMub25Sb3V0ZUNoYW5nZSgpXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGNsaWNrIChlOiBLZXlib2FyZEV2ZW50IHwgTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgLy8gSWYgdXNlciBwcm92aWRlcyBhblxuICAgICAgLy8gYWN0dWFsIGxpbmssIGRvIG5vdFxuICAgICAgLy8gcHJldmVudCBkZWZhdWx0XG4gICAgICBpZiAodGhpcy5ocmVmICYmXG4gICAgICAgIHRoaXMuaHJlZi5pbmRleE9mKCcjJykgPiAtMVxuICAgICAgKSBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgaWYgKGUuZGV0YWlsKSB0aGlzLiRlbC5ibHVyKClcblxuICAgICAgdGhpcy4kZW1pdCgnY2xpY2snLCBlKVxuXG4gICAgICB0aGlzLnRvIHx8IHRoaXMudG9nZ2xlKClcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCB7IHRhZywgZGF0YSB9ID0gdGhpcy5nZW5lcmF0ZVJvdXRlTGluaygpXG5cbiAgICBkYXRhLmF0dHJzID0ge1xuICAgICAgLi4uZGF0YS5hdHRycyxcbiAgICAgICdhcmlhLXNlbGVjdGVkJzogU3RyaW5nKHRoaXMuaXNBY3RpdmUpLFxuICAgICAgcm9sZTogJ3RhYicsXG4gICAgICB0YWJpbmRleDogMCxcbiAgICB9XG4gICAgZGF0YS5vbiA9IHtcbiAgICAgIC4uLmRhdGEub24sXG4gICAgICBrZXlkb3duOiAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5lbnRlcikgdGhpcy5jbGljayhlKVxuXG4gICAgICAgIHRoaXMuJGVtaXQoJ2tleWRvd24nLCBlKVxuICAgICAgfSxcbiAgICB9XG5cbiAgICByZXR1cm4gaCh0YWcsIGRhdGEsIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gIH0sXG59KVxuIl19