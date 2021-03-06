// Components
import VAvatar from '../VAvatar';
/* @vue/component */
export default VAvatar.extend({
    name: 'v-list-item-avatar',
    props: {
        horizontal: Boolean,
        size: {
            type: [Number, String],
            default: 40,
        },
    },
    computed: {
        classes() {
            return {
                'v-list-item__avatar--horizontal': this.horizontal,
                ...VAvatar.options.computed.classes.call(this),
                'v-avatar--tile': this.tile || this.horizontal,
            };
        },
    },
    render(h) {
        const render = VAvatar.options.render.call(this, h);
        render.data = render.data || {};
        render.data.staticClass += ' v-list-item__avatar';
        return render;
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxpc3RJdGVtQXZhdGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkxpc3QvVkxpc3RJdGVtQXZhdGFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGFBQWE7QUFDYixPQUFPLE9BQU8sTUFBTSxZQUFZLENBQUE7QUFLaEMsb0JBQW9CO0FBQ3BCLGVBQWUsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUM1QixJQUFJLEVBQUUsb0JBQW9CO0lBRTFCLEtBQUssRUFBRTtRQUNMLFVBQVUsRUFBRSxPQUFPO1FBQ25CLElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLEVBQUU7U0FDWjtLQUNGO0lBRUQsUUFBUSxFQUFFO1FBQ1IsT0FBTztZQUNMLE9BQU87Z0JBQ0wsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQ2xELEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzlDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVU7YUFDL0MsQ0FBQTtRQUNILENBQUM7S0FDRjtJQUVELE1BQU0sQ0FBRSxDQUFDO1FBQ1AsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUVuRCxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFBO1FBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLHNCQUFzQixDQUFBO1FBRWpELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvbXBvbmVudHNcbmltcG9ydCBWQXZhdGFyIGZyb20gJy4uL1ZBdmF0YXInXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IFZBdmF0YXIuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtbGlzdC1pdGVtLWF2YXRhcicsXG5cbiAgcHJvcHM6IHtcbiAgICBob3Jpem9udGFsOiBCb29sZWFuLFxuICAgIHNpemU6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiA0MCxcbiAgICB9LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LWxpc3QtaXRlbV9fYXZhdGFyLS1ob3Jpem9udGFsJzogdGhpcy5ob3Jpem9udGFsLFxuICAgICAgICAuLi5WQXZhdGFyLm9wdGlvbnMuY29tcHV0ZWQuY2xhc3Nlcy5jYWxsKHRoaXMpLFxuICAgICAgICAndi1hdmF0YXItLXRpbGUnOiB0aGlzLnRpbGUgfHwgdGhpcy5ob3Jpem9udGFsLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIGNvbnN0IHJlbmRlciA9IFZBdmF0YXIub3B0aW9ucy5yZW5kZXIuY2FsbCh0aGlzLCBoKVxuXG4gICAgcmVuZGVyLmRhdGEgPSByZW5kZXIuZGF0YSB8fCB7fVxuICAgIHJlbmRlci5kYXRhLnN0YXRpY0NsYXNzICs9ICcgdi1saXN0LWl0ZW1fX2F2YXRhcidcblxuICAgIHJldHVybiByZW5kZXJcbiAgfSxcbn0pXG4iXX0=