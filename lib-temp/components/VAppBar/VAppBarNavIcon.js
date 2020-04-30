// Components
import VIcon from '../VIcon';
import VBtn from '../VBtn/VBtn';
// Types
import Vue from 'vue';
/* @vue/component */
export default Vue.extend({
    name: 'v-app-bar-nav-icon',
    functional: true,
    render(h, { slots, listeners, props, data }) {
        const d = Object.assign(data, {
            staticClass: (`v-app-bar__nav-icon ${data.staticClass || ''}`).trim(),
            props: {
                ...props,
                icon: true,
            },
            on: listeners,
        });
        const defaultSlot = slots().default;
        return h(VBtn, d, defaultSlot || [h(VIcon, '$menu')]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFwcEJhck5hdkljb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQXBwQmFyL1ZBcHBCYXJOYXZJY29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGFBQWE7QUFDYixPQUFPLEtBQUssTUFBTSxVQUFVLENBQUE7QUFDNUIsT0FBTyxJQUFJLE1BQU0sY0FBYyxDQUFBO0FBRS9CLFFBQVE7QUFDUixPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFFckIsb0JBQW9CO0FBQ3BCLGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUN4QixJQUFJLEVBQUUsb0JBQW9CO0lBRTFCLFVBQVUsRUFBRSxJQUFJO0lBRWhCLE1BQU0sQ0FBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7UUFDMUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDNUIsV0FBVyxFQUFFLENBQUMsdUJBQXVCLElBQUksQ0FBQyxXQUFXLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUU7WUFDckUsS0FBSyxFQUFFO2dCQUNMLEdBQUcsS0FBSztnQkFDUixJQUFJLEVBQUUsSUFBSTthQUNYO1lBQ0QsRUFBRSxFQUFFLFNBQVM7U0FDZCxDQUFDLENBQUE7UUFFRixNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUE7UUFFbkMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN2RCxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZJY29uIGZyb20gJy4uL1ZJY29uJ1xuaW1wb3J0IFZCdG4gZnJvbSAnLi4vVkJ0bi9WQnRuJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBWdWUuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtYXBwLWJhci1uYXYtaWNvbicsXG5cbiAgZnVuY3Rpb25hbDogdHJ1ZSxcblxuICByZW5kZXIgKGgsIHsgc2xvdHMsIGxpc3RlbmVycywgcHJvcHMsIGRhdGEgfSkge1xuICAgIGNvbnN0IGQgPSBPYmplY3QuYXNzaWduKGRhdGEsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAoYHYtYXBwLWJhcl9fbmF2LWljb24gJHtkYXRhLnN0YXRpY0NsYXNzIHx8ICcnfWApLnRyaW0oKSxcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIC4uLnByb3BzLFxuICAgICAgICBpY29uOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIG9uOiBsaXN0ZW5lcnMsXG4gICAgfSlcblxuICAgIGNvbnN0IGRlZmF1bHRTbG90ID0gc2xvdHMoKS5kZWZhdWx0XG5cbiAgICByZXR1cm4gaChWQnRuLCBkLCBkZWZhdWx0U2xvdCB8fCBbaChWSWNvbiwgJyRtZW51JyldKVxuICB9LFxufSlcbiJdfQ==