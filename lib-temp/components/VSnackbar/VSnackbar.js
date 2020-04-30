// Styles
import './VSnackbar.sass';
// Mixins
import Colorable from '../../mixins/colorable';
import Toggleable from '../../mixins/toggleable';
import { factory as PositionableFactory } from '../../mixins/positionable';
// Types
import mixins from '../../util/mixins';
import { removed } from '../../util/console';
export default mixins(Colorable, Toggleable, PositionableFactory(['absolute', 'top', 'bottom', 'left', 'right'])
/* @vue/component */
).extend({
    name: 'v-snackbar',
    props: {
        multiLine: Boolean,
        // TODO: change this to closeDelay to match other API in delayable.js
        timeout: {
            type: Number,
            default: 6000,
        },
        vertical: Boolean,
    },
    data: () => ({
        activeTimeout: -1,
    }),
    computed: {
        classes() {
            return {
                'v-snack--active': this.isActive,
                'v-snack--absolute': this.absolute,
                'v-snack--bottom': this.bottom || !this.top,
                'v-snack--left': this.left,
                'v-snack--multi-line': this.multiLine && !this.vertical,
                'v-snack--right': this.right,
                'v-snack--top': this.top,
                'v-snack--vertical': this.vertical,
            };
        },
    },
    watch: {
        isActive() {
            this.setTimeout();
        },
    },
    created() {
        if (this.$attrs.hasOwnProperty('auto-height')) {
            removed('auto-height', this);
        }
    },
    mounted() {
        this.setTimeout();
    },
    methods: {
        setTimeout() {
            window.clearTimeout(this.activeTimeout);
            if (this.isActive && this.timeout) {
                this.activeTimeout = window.setTimeout(() => {
                    this.isActive = false;
                }, this.timeout);
            }
        },
    },
    render(h) {
        return h('transition', {
            attrs: { name: 'v-snack-transition' },
        }, [
            this.isActive && h('div', {
                staticClass: 'v-snack',
                class: this.classes,
                on: this.$listeners,
            }, [
                h('div', this.setBackgroundColor(this.color, {
                    staticClass: 'v-snack__wrapper',
                    attrs: {
                        role: 'alert',
                    },
                }), [
                    h('div', {
                        staticClass: 'v-snack__content',
                    }, this.$slots.default),
                ]),
            ]),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNuYWNrYmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVlNuYWNrYmFyL1ZTbmFja2Jhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxrQkFBa0IsQ0FBQTtBQUV6QixTQUFTO0FBQ1QsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFDaEQsT0FBTyxFQUFFLE9BQU8sSUFBSSxtQkFBbUIsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBRTFFLFFBQVE7QUFDUixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUV0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFFNUMsZUFBZSxNQUFNLENBQ25CLFNBQVMsRUFDVCxVQUFVLEVBQ1YsbUJBQW1CLENBQUMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDckUsb0JBQW9CO0NBQ25CLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLFlBQVk7SUFFbEIsS0FBSyxFQUFFO1FBQ0wsU0FBUyxFQUFFLE9BQU87UUFDbEIscUVBQXFFO1FBQ3JFLE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLElBQUk7U0FDZDtRQUNELFFBQVEsRUFBRSxPQUFPO0tBQ2xCO0lBRUQsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDWCxhQUFhLEVBQUUsQ0FBQyxDQUFDO0tBQ2xCLENBQUM7SUFFRixRQUFRLEVBQUU7UUFDUixPQUFPO1lBQ0wsT0FBTztnQkFDTCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDaEMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ2xDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRztnQkFDM0MsZUFBZSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUMxQixxQkFBcUIsRUFBRSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZELGdCQUFnQixFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUM1QixjQUFjLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ3hCLG1CQUFtQixFQUFFLElBQUksQ0FBQyxRQUFRO2FBQ25DLENBQUE7UUFDSCxDQUFDO0tBQ0Y7SUFFRCxLQUFLLEVBQUU7UUFDTCxRQUFRO1lBQ04sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ25CLENBQUM7S0FDRjtJQUVELE9BQU87UUFDTCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzdDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDN0I7SUFDSCxDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUNuQixDQUFDO0lBRUQsT0FBTyxFQUFFO1FBQ1AsVUFBVTtZQUNSLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1lBRXZDLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUMxQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtnQkFDdkIsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTthQUNqQjtRQUNILENBQUM7S0FDRjtJQUVELE1BQU0sQ0FBRSxDQUFDO1FBQ1AsT0FBTyxDQUFDLENBQUMsWUFBWSxFQUFFO1lBQ3JCLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBRTtTQUN0QyxFQUFFO1lBQ0QsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO2dCQUN4QixXQUFXLEVBQUUsU0FBUztnQkFDdEIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPO2dCQUNuQixFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVU7YUFDcEIsRUFBRTtnQkFDRCxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUMzQyxXQUFXLEVBQUUsa0JBQWtCO29CQUMvQixLQUFLLEVBQUU7d0JBQ0wsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7aUJBQ0YsQ0FBQyxFQUFFO29CQUNGLENBQUMsQ0FBQyxLQUFLLEVBQUU7d0JBQ1AsV0FBVyxFQUFFLGtCQUFrQjtxQkFDaEMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztpQkFDeEIsQ0FBQzthQUNILENBQUM7U0FDSCxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVlNuYWNrYmFyLnNhc3MnXG5cbi8vIE1peGluc1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IFRvZ2dsZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RvZ2dsZWFibGUnXG5pbXBvcnQgeyBmYWN0b3J5IGFzIFBvc2l0aW9uYWJsZUZhY3RvcnkgfSBmcm9tICcuLi8uLi9taXhpbnMvcG9zaXRpb25hYmxlJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgcmVtb3ZlZCB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBDb2xvcmFibGUsXG4gIFRvZ2dsZWFibGUsXG4gIFBvc2l0aW9uYWJsZUZhY3RvcnkoWydhYnNvbHV0ZScsICd0b3AnLCAnYm90dG9tJywgJ2xlZnQnLCAncmlnaHQnXSlcbi8qIEB2dWUvY29tcG9uZW50ICovXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LXNuYWNrYmFyJyxcblxuICBwcm9wczoge1xuICAgIG11bHRpTGluZTogQm9vbGVhbixcbiAgICAvLyBUT0RPOiBjaGFuZ2UgdGhpcyB0byBjbG9zZURlbGF5IHRvIG1hdGNoIG90aGVyIEFQSSBpbiBkZWxheWFibGUuanNcbiAgICB0aW1lb3V0OiB7XG4gICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICBkZWZhdWx0OiA2MDAwLFxuICAgIH0sXG4gICAgdmVydGljYWw6IEJvb2xlYW4sXG4gIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBhY3RpdmVUaW1lb3V0OiAtMSxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3Ytc25hY2stLWFjdGl2ZSc6IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgICd2LXNuYWNrLS1hYnNvbHV0ZSc6IHRoaXMuYWJzb2x1dGUsXG4gICAgICAgICd2LXNuYWNrLS1ib3R0b20nOiB0aGlzLmJvdHRvbSB8fCAhdGhpcy50b3AsXG4gICAgICAgICd2LXNuYWNrLS1sZWZ0JzogdGhpcy5sZWZ0LFxuICAgICAgICAndi1zbmFjay0tbXVsdGktbGluZSc6IHRoaXMubXVsdGlMaW5lICYmICF0aGlzLnZlcnRpY2FsLFxuICAgICAgICAndi1zbmFjay0tcmlnaHQnOiB0aGlzLnJpZ2h0LFxuICAgICAgICAndi1zbmFjay0tdG9wJzogdGhpcy50b3AsXG4gICAgICAgICd2LXNuYWNrLS12ZXJ0aWNhbCc6IHRoaXMudmVydGljYWwsXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIGlzQWN0aXZlICgpIHtcbiAgICAgIHRoaXMuc2V0VGltZW91dCgpXG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICBpZiAodGhpcy4kYXR0cnMuaGFzT3duUHJvcGVydHkoJ2F1dG8taGVpZ2h0JykpIHtcbiAgICAgIHJlbW92ZWQoJ2F1dG8taGVpZ2h0JywgdGhpcylcbiAgICB9XG4gIH0sXG5cbiAgbW91bnRlZCAoKSB7XG4gICAgdGhpcy5zZXRUaW1lb3V0KClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgc2V0VGltZW91dCAoKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuYWN0aXZlVGltZW91dClcblxuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUgJiYgdGhpcy50aW1lb3V0KSB7XG4gICAgICAgIHRoaXMuYWN0aXZlVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2VcbiAgICAgICAgfSwgdGhpcy50aW1lb3V0KVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKCd0cmFuc2l0aW9uJywge1xuICAgICAgYXR0cnM6IHsgbmFtZTogJ3Ytc25hY2stdHJhbnNpdGlvbicgfSxcbiAgICB9LCBbXG4gICAgICB0aGlzLmlzQWN0aXZlICYmIGgoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNuYWNrJyxcbiAgICAgICAgY2xhc3M6IHRoaXMuY2xhc3NlcyxcbiAgICAgICAgb246IHRoaXMuJGxpc3RlbmVycyxcbiAgICAgIH0sIFtcbiAgICAgICAgaCgnZGl2JywgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IodGhpcy5jb2xvciwge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbmFja19fd3JhcHBlcicsXG4gICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgIHJvbGU6ICdhbGVydCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksIFtcbiAgICAgICAgICBoKCdkaXYnLCB7XG4gICAgICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc25hY2tfX2NvbnRlbnQnLFxuICAgICAgICAgIH0sIHRoaXMuJHNsb3RzLmRlZmF1bHQpLFxuICAgICAgICBdKSxcbiAgICAgIF0pLFxuICAgIF0pXG4gIH0sXG59KVxuIl19