// Style
import './VParallax.sass';
// Mixins
import Translatable from '../../mixins/translatable';
import mixins from '../../util/mixins';
const baseMixins = mixins(Translatable);
/* @vue/component */
export default baseMixins.extend().extend({
    name: 'v-parallax',
    props: {
        alt: {
            type: String,
            default: '',
        },
        height: {
            type: [String, Number],
            default: 500,
        },
        src: String,
    },
    data: () => ({
        isBooted: false,
    }),
    computed: {
        styles() {
            return {
                display: 'block',
                opacity: this.isBooted ? 1 : 0,
                transform: `translate(-50%, ${this.parallax}px)`,
            };
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            const img = this.$refs.img;
            if (!img)
                return;
            if (img.complete) {
                this.translate();
                this.listeners();
            }
            else {
                img.addEventListener('load', () => {
                    this.translate();
                    this.listeners();
                }, false);
            }
            this.isBooted = true;
        },
        objHeight() {
            return this.$refs.img.naturalHeight;
        },
    },
    render(h) {
        const imgData = {
            staticClass: 'v-parallax__image',
            style: this.styles,
            attrs: {
                src: this.src,
                alt: this.alt,
            },
            ref: 'img',
        };
        const container = h('div', {
            staticClass: 'v-parallax__image-container',
        }, [
            h('img', imgData),
        ]);
        const content = h('div', {
            staticClass: 'v-parallax__content',
        }, this.$slots.default);
        return h('div', {
            staticClass: 'v-parallax',
            style: {
                height: `${this.height}px`,
            },
            on: this.$listeners,
        }, [container, content]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBhcmFsbGF4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVlBhcmFsbGF4L1ZQYXJhbGxheC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxRQUFRO0FBQ1IsT0FBTyxrQkFBa0IsQ0FBQTtBQUV6QixTQUFTO0FBQ1QsT0FBTyxZQUFZLE1BQU0sMkJBQTJCLENBQUE7QUFJcEQsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFFdEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN2QixZQUFZLENBQ2IsQ0FBQTtBQU9ELG9CQUFvQjtBQUNwQixlQUFlLFVBQVUsQ0FBQyxNQUFNLEVBQVcsQ0FBQyxNQUFNLENBQUM7SUFDakQsSUFBSSxFQUFFLFlBQVk7SUFFbEIsS0FBSyxFQUFFO1FBQ0wsR0FBRyxFQUFFO1lBQ0gsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsRUFBRTtTQUNaO1FBQ0QsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsR0FBRztTQUNiO1FBQ0QsR0FBRyxFQUFFLE1BQU07S0FDWjtJQUVELElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztJQUVGLFFBQVEsRUFBRTtRQUNSLE1BQU07WUFDSixPQUFPO2dCQUNMLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixTQUFTLEVBQUUsbUJBQW1CLElBQUksQ0FBQyxRQUFRLEtBQUs7YUFDakQsQ0FBQTtRQUNILENBQUM7S0FDRjtJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDYixDQUFDO0lBRUQsT0FBTyxFQUFFO1FBQ1AsSUFBSTtZQUNGLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFBO1lBRTFCLElBQUksQ0FBQyxHQUFHO2dCQUFFLE9BQU07WUFFaEIsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFO2dCQUNoQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7Z0JBQ2hCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTthQUNqQjtpQkFBTTtnQkFDTCxHQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDaEMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO29CQUNoQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7Z0JBQ2xCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTthQUNWO1lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7UUFDdEIsQ0FBQztRQUNELFNBQVM7WUFDUCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQTtRQUNyQyxDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE1BQU0sT0FBTyxHQUFjO1lBQ3pCLFdBQVcsRUFBRSxtQkFBbUI7WUFDaEMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ2xCLEtBQUssRUFBRTtnQkFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ2IsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO2FBQ2Q7WUFDRCxHQUFHLEVBQUUsS0FBSztTQUNYLENBQUE7UUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ3pCLFdBQVcsRUFBRSw2QkFBNkI7U0FDM0MsRUFBRTtZQUNELENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO1NBQ2xCLENBQUMsQ0FBQTtRQUVGLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDdkIsV0FBVyxFQUFFLHFCQUFxQjtTQUNuQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7UUFFdkIsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ2QsV0FBVyxFQUFFLFlBQVk7WUFDekIsS0FBSyxFQUFFO2dCQUNMLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUk7YUFDM0I7WUFDRCxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVU7U0FDcEIsRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBO0lBQzFCLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZVxuaW1wb3J0ICcuL1ZQYXJhbGxheC5zYXNzJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBUcmFuc2xhdGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RyYW5zbGF0YWJsZSdcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBWTm9kZURhdGEgfSBmcm9tICd2dWUvdHlwZXMvdm5vZGUnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuXG5jb25zdCBiYXNlTWl4aW5zID0gbWl4aW5zKFxuICBUcmFuc2xhdGFibGVcbilcbmludGVyZmFjZSBvcHRpb25zIGV4dGVuZHMgSW5zdGFuY2VUeXBlPHR5cGVvZiBiYXNlTWl4aW5zPiB7XG4gICRyZWZzOiB7XG4gICAgaW1nOiBIVE1MSW1hZ2VFbGVtZW50XG4gIH1cbn1cblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IGJhc2VNaXhpbnMuZXh0ZW5kPG9wdGlvbnM+KCkuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtcGFyYWxsYXgnLFxuXG4gIHByb3BzOiB7XG4gICAgYWx0OiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJyxcbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogW1N0cmluZywgTnVtYmVyXSxcbiAgICAgIGRlZmF1bHQ6IDUwMCxcbiAgICB9LFxuICAgIHNyYzogU3RyaW5nLFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgaXNCb290ZWQ6IGZhbHNlLFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIHN0eWxlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXk6ICdibG9jaycsXG4gICAgICAgIG9wYWNpdHk6IHRoaXMuaXNCb290ZWQgPyAxIDogMCxcbiAgICAgICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKC01MCUsICR7dGhpcy5wYXJhbGxheH1weClgLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgbW91bnRlZCAoKSB7XG4gICAgdGhpcy5pbml0KClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgaW5pdCAoKSB7XG4gICAgICBjb25zdCBpbWcgPSB0aGlzLiRyZWZzLmltZ1xuXG4gICAgICBpZiAoIWltZykgcmV0dXJuXG5cbiAgICAgIGlmIChpbWcuY29tcGxldGUpIHtcbiAgICAgICAgdGhpcy50cmFuc2xhdGUoKVxuICAgICAgICB0aGlzLmxpc3RlbmVycygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICAgICAgICB0aGlzLnRyYW5zbGF0ZSgpXG4gICAgICAgICAgdGhpcy5saXN0ZW5lcnMoKVxuICAgICAgICB9LCBmYWxzZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5pc0Jvb3RlZCA9IHRydWVcbiAgICB9LFxuICAgIG9iakhlaWdodCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kcmVmcy5pbWcubmF0dXJhbEhlaWdodFxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIGNvbnN0IGltZ0RhdGE6IFZOb2RlRGF0YSA9IHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1wYXJhbGxheF9faW1hZ2UnLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGVzLFxuICAgICAgYXR0cnM6IHtcbiAgICAgICAgc3JjOiB0aGlzLnNyYyxcbiAgICAgICAgYWx0OiB0aGlzLmFsdCxcbiAgICAgIH0sXG4gICAgICByZWY6ICdpbWcnLFxuICAgIH1cblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1wYXJhbGxheF9faW1hZ2UtY29udGFpbmVyJyxcbiAgICB9LCBbXG4gICAgICBoKCdpbWcnLCBpbWdEYXRhKSxcbiAgICBdKVxuXG4gICAgY29uc3QgY29udGVudCA9IGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1wYXJhbGxheF9fY29udGVudCcsXG4gICAgfSwgdGhpcy4kc2xvdHMuZGVmYXVsdClcblxuICAgIHJldHVybiBoKCdkaXYnLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtcGFyYWxsYXgnLFxuICAgICAgc3R5bGU6IHtcbiAgICAgICAgaGVpZ2h0OiBgJHt0aGlzLmhlaWdodH1weGAsXG4gICAgICB9LFxuICAgICAgb246IHRoaXMuJGxpc3RlbmVycyxcbiAgICB9LCBbY29udGFpbmVyLCBjb250ZW50XSlcbiAgfSxcbn0pXG4iXX0=