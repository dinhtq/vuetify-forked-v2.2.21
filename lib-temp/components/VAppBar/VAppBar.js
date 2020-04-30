// Styles
import './VAppBar.sass';
// Extensions
import VToolbar from '../VToolbar/VToolbar';
// Directives
import Scroll from '../../directives/scroll';
// Mixins
import Applicationable from '../../mixins/applicationable';
import Scrollable from '../../mixins/scrollable';
import SSRBootable from '../../mixins/ssr-bootable';
import Toggleable from '../../mixins/toggleable';
// Utilities
import { convertToUnit } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(VToolbar, Scrollable, SSRBootable, Toggleable, Applicationable('top', [
    'clippedLeft',
    'clippedRight',
    'computedHeight',
    'invertedScroll',
    'isExtended',
    'isProminent',
    'value',
]));
/* @vue/component */
export default baseMixins.extend({
    name: 'v-app-bar',
    directives: { Scroll },
    props: {
        clippedLeft: Boolean,
        clippedRight: Boolean,
        collapseOnScroll: Boolean,
        elevateOnScroll: Boolean,
        fadeImgOnScroll: Boolean,
        hideOnScroll: Boolean,
        invertedScroll: Boolean,
        scrollOffScreen: Boolean,
        shrinkOnScroll: Boolean,
        value: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            isActive: this.value,
        };
    },
    computed: {
        applicationProperty() {
            return !this.bottom ? 'top' : 'bottom';
        },
        canScroll() {
            return (Scrollable.options.computed.canScroll.call(this) &&
                (this.invertedScroll ||
                    this.elevateOnScroll ||
                    this.hideOnScroll ||
                    this.collapseOnScroll ||
                    this.isBooted ||
                    // If falsey, user has provided an
                    // explicit value which should
                    // overwrite anything we do
                    !this.value));
        },
        classes() {
            return {
                ...VToolbar.options.computed.classes.call(this),
                'v-toolbar--collapse': this.collapse || this.collapseOnScroll,
                'v-app-bar': true,
                'v-app-bar--clipped': this.clippedLeft || this.clippedRight,
                'v-app-bar--fade-img-on-scroll': this.fadeImgOnScroll,
                'v-app-bar--elevate-on-scroll': this.elevateOnScroll,
                'v-app-bar--fixed': !this.absolute && (this.app || this.fixed),
                'v-app-bar--hide-shadow': this.hideShadow,
                'v-app-bar--is-scrolled': this.currentScroll > 0,
                'v-app-bar--shrink-on-scroll': this.shrinkOnScroll,
            };
        },
        computedContentHeight() {
            if (!this.shrinkOnScroll)
                return VToolbar.options.computed.computedContentHeight.call(this);
            const height = this.computedOriginalHeight;
            const min = this.dense ? 48 : 56;
            const max = height;
            const difference = max - min;
            const iteration = difference / this.computedScrollThreshold;
            const offset = this.currentScroll * iteration;
            return Math.max(min, max - offset);
        },
        computedFontSize() {
            if (!this.isProminent)
                return undefined;
            const max = this.dense ? 96 : 128;
            const difference = max - this.computedContentHeight;
            const increment = 0.00347;
            // 1.5rem to a minimum of 1.25rem
            return Number((1.50 - difference * increment).toFixed(2));
        },
        computedLeft() {
            if (!this.app || this.clippedLeft)
                return 0;
            return this.$vuetify.application.left;
        },
        computedMarginTop() {
            if (!this.app)
                return 0;
            return this.$vuetify.application.bar;
        },
        computedOpacity() {
            if (!this.fadeImgOnScroll)
                return undefined;
            const opacity = Math.max((this.computedScrollThreshold - this.currentScroll) / this.computedScrollThreshold, 0);
            return Number(parseFloat(opacity).toFixed(2));
        },
        computedOriginalHeight() {
            let height = VToolbar.options.computed.computedContentHeight.call(this);
            if (this.isExtended)
                height += parseInt(this.extensionHeight);
            return height;
        },
        computedRight() {
            if (!this.app || this.clippedRight)
                return 0;
            return this.$vuetify.application.right;
        },
        computedScrollThreshold() {
            if (this.scrollThreshold)
                return Number(this.scrollThreshold);
            return this.computedOriginalHeight - (this.dense ? 48 : 56);
        },
        computedTransform() {
            if (!this.canScroll ||
                (this.elevateOnScroll && this.currentScroll === 0 && this.isActive))
                return 0;
            if (this.isActive)
                return 0;
            const scrollOffScreen = this.scrollOffScreen
                ? this.computedHeight
                : this.computedContentHeight;
            return this.bottom ? scrollOffScreen : -scrollOffScreen;
        },
        hideShadow() {
            if (this.elevateOnScroll && this.isExtended) {
                return this.currentScroll < this.computedScrollThreshold;
            }
            if (this.elevateOnScroll) {
                return this.currentScroll === 0 ||
                    this.computedTransform < 0;
            }
            return (!this.isExtended ||
                this.scrollOffScreen) && this.computedTransform !== 0;
        },
        isCollapsed() {
            if (!this.collapseOnScroll) {
                return VToolbar.options.computed.isCollapsed.call(this);
            }
            return this.currentScroll > 0;
        },
        isProminent() {
            return (VToolbar.options.computed.isProminent.call(this) ||
                this.shrinkOnScroll);
        },
        styles() {
            return {
                ...VToolbar.options.computed.styles.call(this),
                fontSize: convertToUnit(this.computedFontSize, 'rem'),
                marginTop: convertToUnit(this.computedMarginTop),
                transform: `translateY(${convertToUnit(this.computedTransform)})`,
                left: convertToUnit(this.computedLeft),
                right: convertToUnit(this.computedRight),
            };
        },
    },
    watch: {
        canScroll: 'onScroll',
        computedTransform() {
            // Normally we do not want the v-app-bar
            // to update the application top value
            // to avoid screen jump. However, in
            // this situation, we must so that
            // the clipped drawer can update
            // its top value when scrolled
            if (!this.canScroll ||
                (!this.clippedLeft && !this.clippedRight))
                return;
            this.callUpdate();
        },
        invertedScroll(val) {
            this.isActive = !val || this.currentScroll !== 0;
        },
    },
    created() {
        if (this.invertedScroll)
            this.isActive = false;
    },
    methods: {
        genBackground() {
            const render = VToolbar.options.methods.genBackground.call(this);
            render.data = this._b(render.data || {}, render.tag, {
                style: { opacity: this.computedOpacity },
            });
            return render;
        },
        updateApplication() {
            return this.invertedScroll
                ? 0
                : this.computedHeight + this.computedTransform;
        },
        thresholdMet() {
            if (this.invertedScroll) {
                this.isActive = this.currentScroll > this.computedScrollThreshold;
                return;
            }
            if (this.currentThreshold < this.computedScrollThreshold)
                return;
            if (this.hideOnScroll) {
                this.isActive = this.isScrollingUp;
            }
            this.savedScroll = this.currentScroll;
        },
    },
    render(h) {
        const render = VToolbar.options.render.call(this, h);
        render.data = render.data || {};
        if (this.canScroll) {
            render.data.directives = render.data.directives || [];
            render.data.directives.push({
                arg: this.scrollTarget,
                name: 'scroll',
                value: this.onScroll,
            });
        }
        return render;
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFwcEJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZBcHBCYXIvVkFwcEJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxnQkFBZ0IsQ0FBQTtBQUV2QixhQUFhO0FBQ2IsT0FBTyxRQUFRLE1BQU0sc0JBQXNCLENBQUE7QUFFM0MsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLFNBQVM7QUFDVCxPQUFPLGVBQWUsTUFBTSw4QkFBOEIsQ0FBQTtBQUMxRCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFdBQVcsTUFBTSwyQkFBMkIsQ0FBQTtBQUNuRCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUVoRCxZQUFZO0FBQ1osT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ2xELE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBS3RDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsUUFBUSxFQUNSLFVBQVUsRUFDVixXQUFXLEVBQ1gsVUFBVSxFQUNWLGVBQWUsQ0FBQyxLQUFLLEVBQUU7SUFDckIsYUFBYTtJQUNiLGNBQWM7SUFDZCxnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLFlBQVk7SUFDWixhQUFhO0lBQ2IsT0FBTztDQUNSLENBQUMsQ0FDSCxDQUFBO0FBRUQsb0JBQW9CO0FBQ3BCLGVBQWUsVUFBVSxDQUFDLE1BQU0sQ0FBQztJQUMvQixJQUFJLEVBQUUsV0FBVztJQUVqQixVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUU7SUFFdEIsS0FBSyxFQUFFO1FBQ0wsV0FBVyxFQUFFLE9BQU87UUFDcEIsWUFBWSxFQUFFLE9BQU87UUFDckIsZ0JBQWdCLEVBQUUsT0FBTztRQUN6QixlQUFlLEVBQUUsT0FBTztRQUN4QixlQUFlLEVBQUUsT0FBTztRQUN4QixZQUFZLEVBQUUsT0FB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LEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUE7Z0JBQ2pFLE9BQU07YUFDUDtZQUVELElBQUksSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyx1QkFBdUI7Z0JBQUUsT0FBTTtZQUVoRSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQTthQUNuQztZQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQTtRQUN2QyxDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFcEQsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQTtRQUUvQixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFBO1lBQ3JELE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztnQkFDMUIsR0FBRyxFQUFFLElBQUksQ0FBQyxZQUFZO2dCQUN0QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVE7YUFDckIsQ0FBQyxDQUFBO1NBQ0g7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WQXBwQmFyLnNhc3MnXG5cbi8vIEV4dGVuc2lvbnNcbmltcG9ydCBWVG9vbGJhciBmcm9tICcuLi9WVG9vbGJhci9WVG9vbGJhcidcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IFNjcm9sbCBmcm9tICcuLi8uLi9kaXJlY3RpdmVzL3Njcm9sbCdcblxuLy8gTWl4aW5zXG5pbXBvcnQgQXBwbGljYXRpb25hYmxlIGZyb20gJy4uLy4uL21peGlucy9hcHBsaWNhdGlvbmFibGUnXG5pbXBvcnQgU2Nyb2xsYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvc2Nyb2xsYWJsZSdcbmltcG9ydCBTU1JCb290YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvc3NyLWJvb3RhYmxlJ1xuaW1wb3J0IFRvZ2dsZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RvZ2dsZWFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IHsgY29udmVydFRvVW5pdCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgVlRvb2xiYXIsXG4gIFNjcm9sbGFibGUsXG4gIFNTUkJvb3RhYmxlLFxuICBUb2dnbGVhYmxlLFxuICBBcHBsaWNhdGlvbmFibGUoJ3RvcCcsIFtcbiAgICAnY2xpcHBlZExlZnQnLFxuICAgICdjbGlwcGVkUmlnaHQnLFxuICAgICdjb21wdXRlZEhlaWdodCcsXG4gICAgJ2ludmVydGVkU2Nyb2xsJyxcbiAgICAnaXNFeHRlbmRlZCcsXG4gICAgJ2lzUHJvbWluZW50JyxcbiAgICAndmFsdWUnLFxuICBdKVxuKVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQoe1xuICBuYW1lOiAndi1hcHAtYmFyJyxcblxuICBkaXJlY3RpdmVzOiB7IFNjcm9sbCB9LFxuXG4gIHByb3BzOiB7XG4gICAgY2xpcHBlZExlZnQ6IEJvb2xlYW4sXG4gICAgY2xpcHBlZFJpZ2h0OiBCb29sZWFuLFxuICAgIGNvbGxhcHNlT25TY3JvbGw6IEJvb2xlYW4sXG4gICAgZWxldmF0ZU9uU2Nyb2xsOiBCb29sZWFuLFxuICAgIGZhZGVJbWdPblNjcm9sbDogQm9vbGVhbixcbiAgICBoaWRlT25TY3JvbGw6IEJvb2xlYW4sXG4gICAgaW52ZXJ0ZWRTY3JvbGw6IEJvb2xlYW4sXG4gICAgc2Nyb2xsT2ZmU2NyZWVuOiBCb29sZWFuLFxuICAgIHNocmlua09uU2Nyb2xsOiBCb29sZWFuLFxuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0FjdGl2ZTogdGhpcy52YWx1ZSxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBhcHBsaWNhdGlvblByb3BlcnR5ICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICF0aGlzLmJvdHRvbSA/ICd0b3AnIDogJ2JvdHRvbSdcbiAgICB9LFxuICAgIGNhblNjcm9sbCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBTY3JvbGxhYmxlLm9wdGlvbnMuY29tcHV0ZWQuY2FuU2Nyb2xsLmNhbGwodGhpcykgJiZcbiAgICAgICAgKFxuICAgICAgICAgIHRoaXMuaW52ZXJ0ZWRTY3JvbGwgfHxcbiAgICAgICAgICB0aGlzLmVsZXZhdGVPblNjcm9sbCB8fFxuICAgICAgICAgIHRoaXMuaGlkZU9uU2Nyb2xsIHx8XG4gICAgICAgICAgdGhpcy5jb2xsYXBzZU9uU2Nyb2xsIHx8XG4gICAgICAgICAgdGhpcy5pc0Jvb3RlZCB8fFxuICAgICAgICAgIC8vIElmIGZhbHNleSwgdXNlciBoYXMgcHJvdmlkZWQgYW5cbiAgICAgICAgICAvLyBleHBsaWNpdCB2YWx1ZSB3aGljaCBzaG91bGRcbiAgICAgICAgICAvLyBvdmVyd3JpdGUgYW55dGhpbmcgd2UgZG9cbiAgICAgICAgICAhdGhpcy52YWx1ZVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uVlRvb2xiYXIub3B0aW9ucy5jb21wdXRlZC5jbGFzc2VzLmNhbGwodGhpcyksXG4gICAgICAgICd2LXRvb2xiYXItLWNvbGxhcHNlJzogdGhpcy5jb2xsYXBzZSB8fCB0aGlzLmNvbGxhcHNlT25TY3JvbGwsXG4gICAgICAgICd2LWFwcC1iYXInOiB0cnVlLFxuICAgICAgICAndi1hcHAtYmFyLS1jbGlwcGVkJzogdGhpcy5jbGlwcGVkTGVmdCB8fCB0aGlzLmNsaXBwZWRSaWdodCxcbiAgICAgICAgJ3YtYXBwLWJhci0tZmFkZS1pbWctb24tc2Nyb2xsJzogdGhpcy5mYWRlSW1nT25TY3JvbGwsXG4gICAgICAgICd2LWFwcC1iYXItLWVsZXZhdGUtb24tc2Nyb2xsJzogdGhpcy5lbGV2YXRlT25TY3JvbGwsXG4gICAgICAgICd2LWFwcC1iYXItLWZpeGVkJzogIXRoaXMuYWJzb2x1dGUgJiYgKHRoaXMuYXBwIHx8IHRoaXMuZml4ZWQpLFxuICAgICAgICAndi1hcHAtYmFyLS1oaWRlLXNoYWRvdyc6IHRoaXMuaGlkZVNoYWRvdyxcbiAgICAgICAgJ3YtYXBwLWJhci0taXMtc2Nyb2xsZWQnOiB0aGlzLmN1cnJlbnRTY3JvbGwgPiAwLFxuICAgICAgICAndi1hcHAtYmFyLS1zaHJpbmstb24tc2Nyb2xsJzogdGhpcy5zaHJpbmtPblNjcm9sbCxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkQ29udGVudEhlaWdodCAoKTogbnVtYmVyIHtcbiAgICAgIGlmICghdGhpcy5zaHJpbmtPblNjcm9sbCkgcmV0dXJuIFZUb29sYmFyLm9wdGlvbnMuY29tcHV0ZWQuY29tcHV0ZWRDb250ZW50SGVpZ2h0LmNhbGwodGhpcylcblxuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5jb21wdXRlZE9yaWdpbmFsSGVpZ2h0XG5cbiAgICAgIGNvbnN0IG1pbiA9IHRoaXMuZGVuc2UgPyA0OCA6IDU2XG4gICAgICBjb25zdCBtYXggPSBoZWlnaHRcbiAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBtYXggLSBtaW5cbiAgICAgIGNvbnN0IGl0ZXJhdGlvbiA9IGRpZmZlcmVuY2UgLyB0aGlzLmNvbXB1dGVkU2Nyb2xsVGhyZXNob2xkXG4gICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLmN1cnJlbnRTY3JvbGwgKiBpdGVyYXRpb25cblxuICAgICAgcmV0dXJuIE1hdGgubWF4KG1pbiwgbWF4IC0gb2Zmc2V0KVxuICAgIH0sXG4gICAgY29tcHV0ZWRGb250U2l6ZSAoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICghdGhpcy5pc1Byb21pbmVudCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgICBjb25zdCBtYXggPSB0aGlzLmRlbnNlID8gOTYgOiAxMjhcbiAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBtYXggLSB0aGlzLmNvbXB1dGVkQ29udGVudEhlaWdodFxuICAgICAgY29uc3QgaW5jcmVtZW50ID0gMC4wMDM0N1xuXG4gICAgICAvLyAxLjVyZW0gdG8gYSBtaW5pbXVtIG9mIDEuMjVyZW1cbiAgICAgIHJldHVybiBOdW1iZXIoKDEuNTAgLSBkaWZmZXJlbmNlICogaW5jcmVtZW50KS50b0ZpeGVkKDIpKVxuICAgIH0sXG4gICAgY29tcHV0ZWRMZWZ0ICgpOiBudW1iZXIge1xuICAgICAgaWYgKCF0aGlzLmFwcCB8fCB0aGlzLmNsaXBwZWRMZWZ0KSByZXR1cm4gMFxuXG4gICAgICByZXR1cm4gdGhpcy4kdnVldGlmeS5hcHBsaWNhdGlvbi5sZWZ0XG4gICAgfSxcbiAgICBjb21wdXRlZE1hcmdpblRvcCAoKTogbnVtYmVyIHtcbiAgICAgIGlmICghdGhpcy5hcHApIHJldHVybiAwXG5cbiAgICAgIHJldHVybiB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLmJhclxuICAgIH0sXG4gICAgY29tcHV0ZWRPcGFjaXR5ICgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgICAgaWYgKCF0aGlzLmZhZGVJbWdPblNjcm9sbCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgICBjb25zdCBvcGFjaXR5ID0gTWF0aC5tYXgoXG4gICAgICAgICh0aGlzLmNvbXB1dGVkU2Nyb2xsVGhyZXNob2xkIC0gdGhpcy5jdXJyZW50U2Nyb2xsKSAvIHRoaXMuY29tcHV0ZWRTY3JvbGxUaHJlc2hvbGQsXG4gICAgICAgIDBcbiAgICAgIClcblxuICAgICAgcmV0dXJuIE51bWJlcihwYXJzZUZsb2F0KG9wYWNpdHkpLnRvRml4ZWQoMikpXG4gICAgfSxcbiAgICBjb21wdXRlZE9yaWdpbmFsSGVpZ2h0ICgpOiBudW1iZXIge1xuICAgICAgbGV0IGhlaWdodCA9IFZUb29sYmFyLm9wdGlvbnMuY29tcHV0ZWQuY29tcHV0ZWRDb250ZW50SGVpZ2h0LmNhbGwodGhpcylcbiAgICAgIGlmICh0aGlzLmlzRXh0ZW5kZWQpIGhlaWdodCArPSBwYXJzZUludCh0aGlzLmV4dGVuc2lvbkhlaWdodClcbiAgICAgIHJldHVybiBoZWlnaHRcbiAgICB9LFxuICAgIGNvbXB1dGVkUmlnaHQgKCk6IG51bWJlciB7XG4gICAgICBpZiAoIXRoaXMuYXBwIHx8IHRoaXMuY2xpcHBlZFJpZ2h0KSByZXR1cm4gMFxuXG4gICAgICByZXR1cm4gdGhpcy4kdnVldGlmeS5hcHBsaWNhdGlvbi5yaWdodFxuICAgIH0sXG4gICAgY29tcHV0ZWRTY3JvbGxUaHJlc2hvbGQgKCk6IG51bWJlciB7XG4gICAgICBpZiAodGhpcy5zY3JvbGxUaHJlc2hvbGQpIHJldHVybiBOdW1iZXIodGhpcy5zY3JvbGxUaHJlc2hvbGQpXG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXB1dGVkT3JpZ2luYWxIZWlnaHQgLSAodGhpcy5kZW5zZSA/IDQ4IDogNTYpXG4gICAgfSxcbiAgICBjb21wdXRlZFRyYW5zZm9ybSAoKTogbnVtYmVyIHtcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuY2FuU2Nyb2xsIHx8XG4gICAgICAgICh0aGlzLmVsZXZhdGVPblNjcm9sbCAmJiB0aGlzLmN1cnJlbnRTY3JvbGwgPT09IDAgJiYgdGhpcy5pc0FjdGl2ZSlcbiAgICAgICkgcmV0dXJuIDBcblxuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUpIHJldHVybiAwXG5cbiAgICAgIGNvbnN0IHNjcm9sbE9mZlNjcmVlbiA9IHRoaXMuc2Nyb2xsT2ZmU2NyZWVuXG4gICAgICAgID8gdGhpcy5jb21wdXRlZEhlaWdodFxuICAgICAgICA6IHRoaXMuY29tcHV0ZWRDb250ZW50SGVpZ2h0XG5cbiAgICAgIHJldHVybiB0aGlzLmJvdHRvbSA/IHNjcm9sbE9mZlNjcmVlbiA6IC1zY3JvbGxPZmZTY3JlZW5cbiAgICB9LFxuICAgIGhpZGVTaGFkb3cgKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHRoaXMuZWxldmF0ZU9uU2Nyb2xsICYmIHRoaXMuaXNFeHRlbmRlZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2Nyb2xsIDwgdGhpcy5jb21wdXRlZFNjcm9sbFRocmVzaG9sZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5lbGV2YXRlT25TY3JvbGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFNjcm9sbCA9PT0gMCB8fFxuICAgICAgICAgIHRoaXMuY29tcHV0ZWRUcmFuc2Zvcm0gPCAwXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgICF0aGlzLmlzRXh0ZW5kZWQgfHxcbiAgICAgICAgdGhpcy5zY3JvbGxPZmZTY3JlZW5cbiAgICAgICkgJiYgdGhpcy5jb21wdXRlZFRyYW5zZm9ybSAhPT0gMFxuICAgIH0sXG4gICAgaXNDb2xsYXBzZWQgKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKCF0aGlzLmNvbGxhcHNlT25TY3JvbGwpIHtcbiAgICAgICAgcmV0dXJuIFZUb29sYmFyLm9wdGlvbnMuY29tcHV0ZWQuaXNDb2xsYXBzZWQuY2FsbCh0aGlzKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2Nyb2xsID4gMFxuICAgIH0sXG4gICAgaXNQcm9taW5lbnQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgVlRvb2xiYXIub3B0aW9ucy5jb21wdXRlZC5pc1Byb21pbmVudC5jYWxsKHRoaXMpIHx8XG4gICAgICAgIHRoaXMuc2hyaW5rT25TY3JvbGxcbiAgICAgIClcbiAgICB9LFxuICAgIHN0eWxlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLlZUb29sYmFyLm9wdGlvbnMuY29tcHV0ZWQuc3R5bGVzLmNhbGwodGhpcyksXG4gICAgICAgIGZvbnRTaXplOiBjb252ZXJ0VG9Vbml0KHRoaXMuY29tcHV0ZWRGb250U2l6ZSwgJ3JlbScpLFxuICAgICAgICBtYXJnaW5Ub3A6IGNvbnZlcnRUb1VuaXQodGhpcy5jb21wdXRlZE1hcmdpblRvcCksXG4gICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZVkoJHtjb252ZXJ0VG9Vbml0KHRoaXMuY29tcHV0ZWRUcmFuc2Zvcm0pfSlgLFxuICAgICAgICBsZWZ0OiBjb252ZXJ0VG9Vbml0KHRoaXMuY29tcHV0ZWRMZWZ0KSxcbiAgICAgICAgcmlnaHQ6IGNvbnZlcnRUb1VuaXQodGhpcy5jb21wdXRlZFJpZ2h0KSxcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgY2FuU2Nyb2xsOiAnb25TY3JvbGwnLFxuICAgIGNvbXB1dGVkVHJhbnNmb3JtICgpIHtcbiAgICAgIC8vIE5vcm1hbGx5IHdlIGRvIG5vdCB3YW50IHRoZSB2LWFwcC1iYXJcbiAgICAgIC8vIHRvIHVwZGF0ZSB0aGUgYXBwbGljYXRpb24gdG9wIHZhbHVlXG4gICAgICAvLyB0byBhdm9pZCBzY3JlZW4ganVtcC4gSG93ZXZlciwgaW5cbiAgICAgIC8vIHRoaXMgc2l0dWF0aW9uLCB3ZSBtdXN0IHNvIHRoYXRcbiAgICAgIC8vIHRoZSBjbGlwcGVkIGRyYXdlciBjYW4gdXBkYXRlXG4gICAgICAvLyBpdHMgdG9wIHZhbHVlIHdoZW4gc2Nyb2xsZWRcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuY2FuU2Nyb2xsIHx8XG4gICAgICAgICghdGhpcy5jbGlwcGVkTGVmdCAmJiAhdGhpcy5jbGlwcGVkUmlnaHQpXG4gICAgICApIHJldHVyblxuXG4gICAgICB0aGlzLmNhbGxVcGRhdGUoKVxuICAgIH0sXG4gICAgaW52ZXJ0ZWRTY3JvbGwgKHZhbDogYm9vbGVhbikge1xuICAgICAgdGhpcy5pc0FjdGl2ZSA9ICF2YWwgfHwgdGhpcy5jdXJyZW50U2Nyb2xsICE9PSAwXG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICBpZiAodGhpcy5pbnZlcnRlZFNjcm9sbCkgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkJhY2tncm91bmQgKCkge1xuICAgICAgY29uc3QgcmVuZGVyID0gVlRvb2xiYXIub3B0aW9ucy5tZXRob2RzLmdlbkJhY2tncm91bmQuY2FsbCh0aGlzKVxuXG4gICAgICByZW5kZXIuZGF0YSA9IHRoaXMuX2IocmVuZGVyLmRhdGEgfHwge30sIHJlbmRlci50YWchLCB7XG4gICAgICAgIHN0eWxlOiB7IG9wYWNpdHk6IHRoaXMuY29tcHV0ZWRPcGFjaXR5IH0sXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcmVuZGVyXG4gICAgfSxcbiAgICB1cGRhdGVBcHBsaWNhdGlvbiAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLmludmVydGVkU2Nyb2xsXG4gICAgICAgID8gMFxuICAgICAgICA6IHRoaXMuY29tcHV0ZWRIZWlnaHQgKyB0aGlzLmNvbXB1dGVkVHJhbnNmb3JtXG4gICAgfSxcbiAgICB0aHJlc2hvbGRNZXQgKCkge1xuICAgICAgaWYgKHRoaXMuaW52ZXJ0ZWRTY3JvbGwpIHtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRoaXMuY3VycmVudFNjcm9sbCA+IHRoaXMuY29tcHV0ZWRTY3JvbGxUaHJlc2hvbGRcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUaHJlc2hvbGQgPCB0aGlzLmNvbXB1dGVkU2Nyb2xsVGhyZXNob2xkKSByZXR1cm5cblxuICAgICAgaWYgKHRoaXMuaGlkZU9uU2Nyb2xsKSB7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSB0aGlzLmlzU2Nyb2xsaW5nVXBcbiAgICAgIH1cblxuICAgICAgdGhpcy5zYXZlZFNjcm9sbCA9IHRoaXMuY3VycmVudFNjcm9sbFxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIGNvbnN0IHJlbmRlciA9IFZUb29sYmFyLm9wdGlvbnMucmVuZGVyLmNhbGwodGhpcywgaClcblxuICAgIHJlbmRlci5kYXRhID0gcmVuZGVyLmRhdGEgfHwge31cblxuICAgIGlmICh0aGlzLmNhblNjcm9sbCkge1xuICAgICAgcmVuZGVyLmRhdGEuZGlyZWN0aXZlcyA9IHJlbmRlci5kYXRhLmRpcmVjdGl2ZXMgfHwgW11cbiAgICAgIHJlbmRlci5kYXRhLmRpcmVjdGl2ZXMucHVzaCh7XG4gICAgICAgIGFyZzogdGhpcy5zY3JvbGxUYXJnZXQsXG4gICAgICAgIG5hbWU6ICdzY3JvbGwnLFxuICAgICAgICB2YWx1ZTogdGhpcy5vblNjcm9sbCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlbmRlclxuICB9LFxufSlcbiJdfQ==