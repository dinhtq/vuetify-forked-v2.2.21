// Styles
import './VTabs.sass';
// Components
import VTabsBar from './VTabsBar';
import VTabsItems from './VTabsItems';
import VTabsSlider from './VTabsSlider';
// Mixins
import Colorable from '../../mixins/colorable';
import Proxyable from '../../mixins/proxyable';
import Themeable from '../../mixins/themeable';
// Directives
import Resize from '../../directives/resize';
// Utilities
import { convertToUnit } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Colorable, Proxyable, Themeable);
export default baseMixins.extend().extend({
    name: 'v-tabs',
    directives: {
        Resize,
    },
    props: {
        activeClass: {
            type: String,
            default: '',
        },
        alignWithTitle: Boolean,
        backgroundColor: String,
        centerActive: Boolean,
        centered: Boolean,
        fixedTabs: Boolean,
        grow: Boolean,
        height: {
            type: [Number, String],
            default: undefined,
        },
        hideSlider: Boolean,
        iconsAndText: Boolean,
        mobileBreakPoint: {
            type: [Number, String],
            default: 1264,
        },
        nextIcon: {
            type: String,
            default: '$next',
        },
        optional: Boolean,
        prevIcon: {
            type: String,
            default: '$prev',
        },
        right: Boolean,
        showArrows: Boolean,
        sliderColor: String,
        sliderSize: {
            type: [Number, String],
            default: 2,
        },
        vertical: Boolean,
    },
    data() {
        return {
            resizeTimeout: 0,
            slider: {
                height: null,
                left: null,
                right: null,
                top: null,
                width: null,
            },
            transitionTime: 300,
        };
    },
    computed: {
        classes() {
            return {
                'v-tabs--align-with-title': this.alignWithTitle,
                'v-tabs--centered': this.centered,
                'v-tabs--fixed-tabs': this.fixedTabs,
                'v-tabs--grow': this.grow,
                'v-tabs--icons-and-text': this.iconsAndText,
                'v-tabs--right': this.right,
                'v-tabs--vertical': this.vertical,
                ...this.themeClasses,
            };
        },
        isReversed() {
            return this.$vuetify.rtl && this.vertical;
        },
        sliderStyles() {
            return {
                height: convertToUnit(this.slider.height),
                left: this.isReversed ? undefined : convertToUnit(this.slider.left),
                right: this.isReversed ? convertToUnit(this.slider.right) : undefined,
                top: this.vertical ? convertToUnit(this.slider.top) : undefined,
                transition: this.slider.left != null ? null : 'none',
                width: convertToUnit(this.slider.width),
            };
        },
        computedColor() {
            if (this.color)
                return this.color;
            else if (this.isDark && !this.appIsDark)
                return 'white';
            else
                return 'primary';
        },
    },
    watch: {
        alignWithTitle: 'callSlider',
        centered: 'callSlider',
        centerActive: 'callSlider',
        fixedTabs: 'callSlider',
        grow: 'callSlider',
        right: 'callSlider',
        showArrows: 'callSlider',
        vertical: 'callSlider',
        '$vuetify.application.left': 'onResize',
        '$vuetify.application.right': 'onResize',
        '$vuetify.rtl': 'onResize',
    },
    mounted() {
        this.$nextTick(() => {
            window.setTimeout(this.callSlider, 30);
        });
    },
    methods: {
        callSlider() {
            if (this.hideSlider ||
                !this.$refs.items ||
                !this.$refs.items.selectedItems.length) {
                this.slider.width = 0;
                return false;
            }
            this.$nextTick(() => {
                // Give screen time to paint
                const activeTab = this.$refs.items.selectedItems[0];
                /* istanbul ignore if */
                if (!activeTab || !activeTab.$el) {
                    this.slider.width = 0;
                    this.slider.left = 0;
                    return;
                }
                const el = activeTab.$el;
                this.slider = {
                    height: !this.vertical ? Number(this.sliderSize) : el.scrollHeight,
                    left: this.vertical ? 0 : el.offsetLeft,
                    right: this.vertical ? 0 : el.offsetLeft + el.offsetWidth,
                    top: el.offsetTop,
                    width: this.vertical ? Number(this.sliderSize) : el.scrollWidth,
                };
            });
            return true;
        },
        genBar(items, slider) {
            const data = {
                style: {
                    height: convertToUnit(this.height),
                },
                props: {
                    activeClass: this.activeClass,
                    centerActive: this.centerActive,
                    dark: this.dark,
                    light: this.light,
                    mandatory: !this.optional,
                    mobileBreakPoint: this.mobileBreakPoint,
                    nextIcon: this.nextIcon,
                    prevIcon: this.prevIcon,
                    showArrows: this.showArrows,
                    value: this.internalValue,
                },
                on: {
                    'call:slider': this.callSlider,
                    change: (val) => {
                        this.internalValue = val;
                    },
                },
                ref: 'items',
            };
            this.setTextColor(this.computedColor, data);
            this.setBackgroundColor(this.backgroundColor, data);
            return this.$createElement(VTabsBar, data, [
                this.genSlider(slider),
                items,
            ]);
        },
        genItems(items, item) {
            // If user provides items
            // opt to use theirs
            if (items)
                return items;
            // If no tabs are provided
            // render nothing
            if (!item.length)
                return null;
            return this.$createElement(VTabsItems, {
                props: {
                    value: this.internalValue,
                },
                on: {
                    change: (val) => {
                        this.internalValue = val;
                    },
                },
            }, item);
        },
        genSlider(slider) {
            if (this.hideSlider)
                return null;
            if (!slider) {
                slider = this.$createElement(VTabsSlider, {
                    props: { color: this.sliderColor },
                });
            }
            return this.$createElement('div', {
                staticClass: 'v-tabs-slider-wrapper',
                style: this.sliderStyles,
            }, [slider]);
        },
        onResize() {
            if (this._isDestroyed)
                return;
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = window.setTimeout(this.callSlider, 0);
        },
        parseNodes() {
            let items = null;
            let slider = null;
            const item = [];
            const tab = [];
            const slot = this.$slots.default || [];
            const length = slot.length;
            for (let i = 0; i < length; i++) {
                const vnode = slot[i];
                if (vnode.componentOptions) {
                    switch (vnode.componentOptions.Ctor.options.name) {
                        case 'v-tabs-slider':
                            slider = vnode;
                            break;
                        case 'v-tabs-items':
                            items = vnode;
                            break;
                        case 'v-tab-item':
                            item.push(vnode);
                            break;
                        // case 'v-tab' - intentionally omitted
                        default: tab.push(vnode);
                    }
                }
                else {
                    tab.push(vnode);
                }
            }
            /**
             * tab: array of `v-tab`
             * slider: single `v-tabs-slider`
             * items: single `v-tabs-items`
             * item: array of `v-tab-item`
             */
            return { tab, slider, items, item };
        },
    },
    render(h) {
        const { tab, slider, items, item } = this.parseNodes();
        return h('div', {
            staticClass: 'v-tabs',
            class: this.classes,
            directives: [{
                    name: 'resize',
                    modifiers: { quiet: true },
                    value: this.onResize,
                }],
        }, [
            this.genBar(tab, slider),
            this.genItems(items, item),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlRhYnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WVGFicy9WVGFicy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxjQUFjLENBQUE7QUFFckIsYUFBYTtBQUNiLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQTtBQUNqQyxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFBO0FBRXZDLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUU5QyxhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0seUJBQXlCLENBQUE7QUFFNUMsWUFBWTtBQUNaLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUVsRCxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUt0QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLFNBQVMsRUFDVCxTQUFTLEVBQ1QsU0FBUyxDQUNWLENBQUE7QUFRRCxlQUFlLFVBQVUsQ0FBQyxNQUFNLEVBQVcsQ0FBQyxNQUFNLENBQUM7SUFDakQsSUFBSSxFQUFFLFFBQVE7SUFFZCxVQUFVLEVBQUU7UUFDVixNQUFNO0tBQ1A7SUFFRCxLQUFLLEVBQUU7UUFDTCxXQUFXLEVBQUU7WUFDWCxJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxFQUFFO1NBQ1o7UUFDRCxjQUFjLEVBQUUsT0FBTztRQUN2QixlQUFlLEVBQUUsTUFBTTtRQUN2QixZQUFZLEVBQUUsT0FBTztRQUNyQixRQUFRLEVBQUUsT0FBTztRQUNqQixTQUFTLEVBQUUsT0FBTztRQUNsQixJQUFJLEVBQUUsT0FBTztRQUNiLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxDQUFDLE1BQU0sRUFB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QUFJLENBQUMsUUFBUTtpQkFDckIsQ0FBQztTQUNILEVBQUU7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO1NBQzNCLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WVGFicy5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVlRhYnNCYXIgZnJvbSAnLi9WVGFic0JhcidcbmltcG9ydCBWVGFic0l0ZW1zIGZyb20gJy4vVlRhYnNJdGVtcydcbmltcG9ydCBWVGFic1NsaWRlciBmcm9tICcuL1ZUYWJzU2xpZGVyJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcbmltcG9ydCBQcm94eWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3Byb3h5YWJsZSdcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RoZW1lYWJsZSdcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IFJlc2l6ZSBmcm9tICcuLi8uLi9kaXJlY3RpdmVzL3Jlc2l6ZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgeyBjb252ZXJ0VG9Vbml0IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgRXh0cmFjdFZ1ZSB9IGZyb20gJy4vLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUvdHlwZXMnXG5cbmNvbnN0IGJhc2VNaXhpbnMgPSBtaXhpbnMoXG4gIENvbG9yYWJsZSxcbiAgUHJveHlhYmxlLFxuICBUaGVtZWFibGVcbilcblxuaW50ZXJmYWNlIG9wdGlvbnMgZXh0ZW5kcyBFeHRyYWN0VnVlPHR5cGVvZiBiYXNlTWl4aW5zPiB7XG4gICRyZWZzOiB7XG4gICAgaXRlbXM6IEluc3RhbmNlVHlwZTx0eXBlb2YgVlRhYnNCYXI+XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQ8b3B0aW9ucz4oKS5leHRlbmQoe1xuICBuYW1lOiAndi10YWJzJyxcblxuICBkaXJlY3RpdmVzOiB7XG4gICAgUmVzaXplLFxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgYWN0aXZlQ2xhc3M6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICcnLFxuICAgIH0sXG4gICAgYWxpZ25XaXRoVGl0bGU6IEJvb2xlYW4sXG4gICAgYmFja2dyb3VuZENvbG9yOiBTdHJpbmcsXG4gICAgY2VudGVyQWN0aXZlOiBCb29sZWFuLFxuICAgIGNlbnRlcmVkOiBCb29sZWFuLFxuICAgIGZpeGVkVGFiczogQm9vbGVhbixcbiAgICBncm93OiBCb29sZWFuLFxuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZCxcbiAgICB9LFxuICAgIGhpZGVTbGlkZXI6IEJvb2xlYW4sXG4gICAgaWNvbnNBbmRUZXh0OiBCb29sZWFuLFxuICAgIG1vYmlsZUJyZWFrUG9pbnQ6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAxMjY0LFxuICAgIH0sXG4gICAgbmV4dEljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckbmV4dCcsXG4gICAgfSxcbiAgICBvcHRpb25hbDogQm9vbGVhbixcbiAgICBwcmV2SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRwcmV2JyxcbiAgICB9LFxuICAgIHJpZ2h0OiBCb29sZWFuLFxuICAgIHNob3dBcnJvd3M6IEJvb2xlYW4sXG4gICAgc2xpZGVyQ29sb3I6IFN0cmluZyxcbiAgICBzbGlkZXJTaXplOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMixcbiAgICB9LFxuICAgIHZlcnRpY2FsOiBCb29sZWFuLFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIHJldHVybiB7XG4gICAgICByZXNpemVUaW1lb3V0OiAwLFxuICAgICAgc2xpZGVyOiB7XG4gICAgICAgIGhlaWdodDogbnVsbCBhcyBudWxsIHwgbnVtYmVyLFxuICAgICAgICBsZWZ0OiBudWxsIGFzIG51bGwgfCBudW1iZXIsXG4gICAgICAgIHJpZ2h0OiBudWxsIGFzIG51bGwgfCBudW1iZXIsXG4gICAgICAgIHRvcDogbnVsbCBhcyBudWxsIHwgbnVtYmVyLFxuICAgICAgICB3aWR0aDogbnVsbCBhcyBudWxsIHwgbnVtYmVyLFxuICAgICAgfSxcbiAgICAgIHRyYW5zaXRpb25UaW1lOiAzMDAsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LXRhYnMtLWFsaWduLXdpdGgtdGl0bGUnOiB0aGlzLmFsaWduV2l0aFRpdGxlLFxuICAgICAgICAndi10YWJzLS1jZW50ZXJlZCc6IHRoaXMuY2VudGVyZWQsXG4gICAgICAgICd2LXRhYnMtLWZpeGVkLXRhYnMnOiB0aGlzLmZpeGVkVGFicyxcbiAgICAgICAgJ3YtdGFicy0tZ3Jvdyc6IHRoaXMuZ3JvdyxcbiAgICAgICAgJ3YtdGFicy0taWNvbnMtYW5kLXRleHQnOiB0aGlzLmljb25zQW5kVGV4dCxcbiAgICAgICAgJ3YtdGFicy0tcmlnaHQnOiB0aGlzLnJpZ2h0LFxuICAgICAgICAndi10YWJzLS12ZXJ0aWNhbCc6IHRoaXMudmVydGljYWwsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfVxuICAgIH0sXG4gICAgaXNSZXZlcnNlZCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy4kdnVldGlmeS5ydGwgJiYgdGhpcy52ZXJ0aWNhbFxuICAgIH0sXG4gICAgc2xpZGVyU3R5bGVzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaGVpZ2h0OiBjb252ZXJ0VG9Vbml0KHRoaXMuc2xpZGVyLmhlaWdodCksXG4gICAgICAgIGxlZnQ6IHRoaXMuaXNSZXZlcnNlZCA/IHVuZGVmaW5lZCA6IGNvbnZlcnRUb1VuaXQodGhpcy5zbGlkZXIubGVmdCksXG4gICAgICAgIHJpZ2h0OiB0aGlzLmlzUmV2ZXJzZWQgPyBjb252ZXJ0VG9Vbml0KHRoaXMuc2xpZGVyLnJpZ2h0KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdG9wOiB0aGlzLnZlcnRpY2FsID8gY29udmVydFRvVW5pdCh0aGlzLnNsaWRlci50b3ApIDogdW5kZWZpbmVkLFxuICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLnNsaWRlci5sZWZ0ICE9IG51bGwgPyBudWxsIDogJ25vbmUnLFxuICAgICAgICB3aWR0aDogY29udmVydFRvVW5pdCh0aGlzLnNsaWRlci53aWR0aCksXG4gICAgICB9XG4gICAgfSxcbiAgICBjb21wdXRlZENvbG9yICgpOiBzdHJpbmcge1xuICAgICAgaWYgKHRoaXMuY29sb3IpIHJldHVybiB0aGlzLmNvbG9yXG4gICAgICBlbHNlIGlmICh0aGlzLmlzRGFyayAmJiAhdGhpcy5hcHBJc0RhcmspIHJldHVybiAnd2hpdGUnXG4gICAgICBlbHNlIHJldHVybiAncHJpbWFyeSdcbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgYWxpZ25XaXRoVGl0bGU6ICdjYWxsU2xpZGVyJyxcbiAgICBjZW50ZXJlZDogJ2NhbGxTbGlkZXInLFxuICAgIGNlbnRlckFjdGl2ZTogJ2NhbGxTbGlkZXInLFxuICAgIGZpeGVkVGFiczogJ2NhbGxTbGlkZXInLFxuICAgIGdyb3c6ICdjYWxsU2xpZGVyJyxcbiAgICByaWdodDogJ2NhbGxTbGlkZXInLFxuICAgIHNob3dBcnJvd3M6ICdjYWxsU2xpZGVyJyxcbiAgICB2ZXJ0aWNhbDogJ2NhbGxTbGlkZXInLFxuICAgICckdnVldGlmeS5hcHBsaWNhdGlvbi5sZWZ0JzogJ29uUmVzaXplJyxcbiAgICAnJHZ1ZXRpZnkuYXBwbGljYXRpb24ucmlnaHQnOiAnb25SZXNpemUnLFxuICAgICckdnVldGlmeS5ydGwnOiAnb25SZXNpemUnLFxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuY2FsbFNsaWRlciwgMzApXG4gICAgfSlcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgY2FsbFNsaWRlciAoKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuaGlkZVNsaWRlciB8fFxuICAgICAgICAhdGhpcy4kcmVmcy5pdGVtcyB8fFxuICAgICAgICAhdGhpcy4kcmVmcy5pdGVtcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aFxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuc2xpZGVyLndpZHRoID0gMFxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAvLyBHaXZlIHNjcmVlbiB0aW1lIHRvIHBhaW50XG4gICAgICAgIGNvbnN0IGFjdGl2ZVRhYiA9IHRoaXMuJHJlZnMuaXRlbXMuc2VsZWN0ZWRJdGVtc1swXVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKCFhY3RpdmVUYWIgfHwgIWFjdGl2ZVRhYi4kZWwpIHtcbiAgICAgICAgICB0aGlzLnNsaWRlci53aWR0aCA9IDBcbiAgICAgICAgICB0aGlzLnNsaWRlci5sZWZ0ID0gMFxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsID0gYWN0aXZlVGFiLiRlbCBhcyBIVE1MRWxlbWVudFxuXG4gICAgICAgIHRoaXMuc2xpZGVyID0ge1xuICAgICAgICAgIGhlaWdodDogIXRoaXMudmVydGljYWwgPyBOdW1iZXIodGhpcy5zbGlkZXJTaXplKSA6IGVsLnNjcm9sbEhlaWdodCxcbiAgICAgICAgICBsZWZ0OiB0aGlzLnZlcnRpY2FsID8gMCA6IGVsLm9mZnNldExlZnQsXG4gICAgICAgICAgcmlnaHQ6IHRoaXMudmVydGljYWwgPyAwIDogZWwub2Zmc2V0TGVmdCArIGVsLm9mZnNldFdpZHRoLFxuICAgICAgICAgIHRvcDogZWwub2Zmc2V0VG9wLFxuICAgICAgICAgIHdpZHRoOiB0aGlzLnZlcnRpY2FsID8gTnVtYmVyKHRoaXMuc2xpZGVyU2l6ZSkgOiBlbC5zY3JvbGxXaWR0aCxcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICAgIGdlbkJhciAoaXRlbXM6IFZOb2RlW10sIHNsaWRlcjogVk5vZGUgfCBudWxsKSB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGhlaWdodDogY29udmVydFRvVW5pdCh0aGlzLmhlaWdodCksXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgYWN0aXZlQ2xhc3M6IHRoaXMuYWN0aXZlQ2xhc3MsXG4gICAgICAgICAgY2VudGVyQWN0aXZlOiB0aGlzLmNlbnRlckFjdGl2ZSxcbiAgICAgICAgICBkYXJrOiB0aGlzLmRhcmssXG4gICAgICAgICAgbGlnaHQ6IHRoaXMubGlnaHQsXG4gICAgICAgICAgbWFuZGF0b3J5OiAhdGhpcy5vcHRpb25hbCxcbiAgICAgICAgICBtb2JpbGVCcmVha1BvaW50OiB0aGlzLm1vYmlsZUJyZWFrUG9pbnQsXG4gICAgICAgICAgbmV4dEljb246IHRoaXMubmV4dEljb24sXG4gICAgICAgICAgcHJldkljb246IHRoaXMucHJldkljb24sXG4gICAgICAgICAgc2hvd0Fycm93czogdGhpcy5zaG93QXJyb3dzLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLmludGVybmFsVmFsdWUsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgJ2NhbGw6c2xpZGVyJzogdGhpcy5jYWxsU2xpZGVyLFxuICAgICAgICAgIGNoYW5nZTogKHZhbDogYW55KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsVmFsdWUgPSB2YWxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICByZWY6ICdpdGVtcycsXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0VGV4dENvbG9yKHRoaXMuY29tcHV0ZWRDb2xvciwgZGF0YSlcbiAgICAgIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuYmFja2dyb3VuZENvbG9yLCBkYXRhKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWVGFic0JhciwgZGF0YSwgW1xuICAgICAgICB0aGlzLmdlblNsaWRlcihzbGlkZXIpLFxuICAgICAgICBpdGVtcyxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5JdGVtcyAoaXRlbXM6IFZOb2RlIHwgbnVsbCwgaXRlbTogVk5vZGVbXSkge1xuICAgICAgLy8gSWYgdXNlciBwcm92aWRlcyBpdGVtc1xuICAgICAgLy8gb3B0IHRvIHVzZSB0aGVpcnNcbiAgICAgIGlmIChpdGVtcykgcmV0dXJuIGl0ZW1zXG5cbiAgICAgIC8vIElmIG5vIHRhYnMgYXJlIHByb3ZpZGVkXG4gICAgICAvLyByZW5kZXIgbm90aGluZ1xuICAgICAgaWYgKCFpdGVtLmxlbmd0aCkgcmV0dXJuIG51bGxcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVlRhYnNJdGVtcywge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIHZhbHVlOiB0aGlzLmludGVybmFsVmFsdWUsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2hhbmdlOiAodmFsOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHZhbFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LCBpdGVtKVxuICAgIH0sXG4gICAgZ2VuU2xpZGVyIChzbGlkZXI6IFZOb2RlIHwgbnVsbCkge1xuICAgICAgaWYgKHRoaXMuaGlkZVNsaWRlcikgcmV0dXJuIG51bGxcblxuICAgICAgaWYgKCFzbGlkZXIpIHtcbiAgICAgICAgc2xpZGVyID0gdGhpcy4kY3JlYXRlRWxlbWVudChWVGFic1NsaWRlciwge1xuICAgICAgICAgIHByb3BzOiB7IGNvbG9yOiB0aGlzLnNsaWRlckNvbG9yIH0sXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10YWJzLXNsaWRlci13cmFwcGVyJyxcbiAgICAgICAgc3R5bGU6IHRoaXMuc2xpZGVyU3R5bGVzLFxuICAgICAgfSwgW3NsaWRlcl0pXG4gICAgfSxcbiAgICBvblJlc2l6ZSAoKSB7XG4gICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVyblxuXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5yZXNpemVUaW1lb3V0KVxuICAgICAgdGhpcy5yZXNpemVUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQodGhpcy5jYWxsU2xpZGVyLCAwKVxuICAgIH0sXG4gICAgcGFyc2VOb2RlcyAoKSB7XG4gICAgICBsZXQgaXRlbXMgPSBudWxsXG4gICAgICBsZXQgc2xpZGVyID0gbnVsbFxuICAgICAgY29uc3QgaXRlbSA9IFtdXG4gICAgICBjb25zdCB0YWIgPSBbXVxuICAgICAgY29uc3Qgc2xvdCA9IHRoaXMuJHNsb3RzLmRlZmF1bHQgfHwgW11cbiAgICAgIGNvbnN0IGxlbmd0aCA9IHNsb3QubGVuZ3RoXG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgdm5vZGUgPSBzbG90W2ldXG5cbiAgICAgICAgaWYgKHZub2RlLmNvbXBvbmVudE9wdGlvbnMpIHtcbiAgICAgICAgICBzd2l0Y2ggKHZub2RlLmNvbXBvbmVudE9wdGlvbnMuQ3Rvci5vcHRpb25zLm5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3YtdGFicy1zbGlkZXInOiBzbGlkZXIgPSB2bm9kZVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAndi10YWJzLWl0ZW1zJzogaXRlbXMgPSB2bm9kZVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAndi10YWItaXRlbSc6IGl0ZW0ucHVzaCh2bm9kZSlcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIC8vIGNhc2UgJ3YtdGFiJyAtIGludGVudGlvbmFsbHkgb21pdHRlZFxuICAgICAgICAgICAgZGVmYXVsdDogdGFiLnB1c2godm5vZGUpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhYi5wdXNoKHZub2RlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogdGFiOiBhcnJheSBvZiBgdi10YWJgXG4gICAgICAgKiBzbGlkZXI6IHNpbmdsZSBgdi10YWJzLXNsaWRlcmBcbiAgICAgICAqIGl0ZW1zOiBzaW5nbGUgYHYtdGFicy1pdGVtc2BcbiAgICAgICAqIGl0ZW06IGFycmF5IG9mIGB2LXRhYi1pdGVtYFxuICAgICAgICovXG4gICAgICByZXR1cm4geyB0YWIsIHNsaWRlciwgaXRlbXMsIGl0ZW0gfVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIGNvbnN0IHsgdGFiLCBzbGlkZXIsIGl0ZW1zLCBpdGVtIH0gPSB0aGlzLnBhcnNlTm9kZXMoKVxuXG4gICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi10YWJzJyxcbiAgICAgIGNsYXNzOiB0aGlzLmNsYXNzZXMsXG4gICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICBuYW1lOiAncmVzaXplJyxcbiAgICAgICAgbW9kaWZpZXJzOiB7IHF1aWV0OiB0cnVlIH0sXG4gICAgICAgIHZhbHVlOiB0aGlzLm9uUmVzaXplLFxuICAgICAgfV0sXG4gICAgfSwgW1xuICAgICAgdGhpcy5nZW5CYXIodGFiLCBzbGlkZXIpLFxuICAgICAgdGhpcy5nZW5JdGVtcyhpdGVtcywgaXRlbSksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=