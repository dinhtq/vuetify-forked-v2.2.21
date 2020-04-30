// Styles
import './VNavigationDrawer.sass';
// Components
import VImg from '../VImg/VImg';
// Mixins
import Applicationable from '../../mixins/applicationable';
import Colorable from '../../mixins/colorable';
import Dependent from '../../mixins/dependent';
import Overlayable from '../../mixins/overlayable';
import SSRBootable from '../../mixins/ssr-bootable';
import Themeable from '../../mixins/themeable';
// Directives
import ClickOutside from '../../directives/click-outside';
import Resize from '../../directives/resize';
import Touch from '../../directives/touch';
// Utilities
import { convertToUnit, getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Applicationable('left', [
    'isActive',
    'isMobile',
    'miniVariant',
    'expandOnHover',
    'permanent',
    'right',
    'temporary',
    'width',
]), Colorable, Dependent, Overlayable, SSRBootable, Themeable);
/* @vue/component */
export default baseMixins.extend({
    name: 'v-navigation-drawer',
    provide() {
        return {
            isInNav: this.tag === 'nav',
        };
    },
    directives: {
        ClickOutside,
        Resize,
        Touch,
    },
    props: {
        bottom: Boolean,
        clipped: Boolean,
        disableResizeWatcher: Boolean,
        disableRouteWatcher: Boolean,
        expandOnHover: Boolean,
        floating: Boolean,
        height: {
            type: [Number, String],
            default() {
                return this.app ? '100vh' : '100%';
            },
        },
        miniVariant: Boolean,
        miniVariantWidth: {
            type: [Number, String],
            default: 56,
        },
        mobileBreakPoint: {
            type: [Number, String],
            default: 1264,
        },
        permanent: Boolean,
        right: Boolean,
        src: {
            type: [String, Object],
            default: '',
        },
        stateless: Boolean,
        tag: {
            type: String,
            default() {
                return this.app ? 'nav' : 'aside';
            },
        },
        temporary: Boolean,
        touchless: Boolean,
        width: {
            type: [Number, String],
            default: 256,
        },
        value: null,
    },
    data: () => ({
        isMouseover: false,
        touchArea: {
            left: 0,
            right: 0,
        },
        stackMinZIndex: 6,
    }),
    computed: {
        /**
         * Used for setting an app value from a dynamic
         * property. Called from applicationable.js
         */
        applicationProperty() {
            return this.right ? 'right' : 'left';
        },
        classes() {
            return {
                'v-navigation-drawer': true,
                'v-navigation-drawer--absolute': this.absolute,
                'v-navigation-drawer--bottom': this.bottom,
                'v-navigation-drawer--clipped': this.clipped,
                'v-navigation-drawer--close': !this.isActive,
                'v-navigation-drawer--fixed': !this.absolute && (this.app || this.fixed),
                'v-navigation-drawer--floating': this.floating,
                'v-navigation-drawer--is-mobile': this.isMobile,
                'v-navigation-drawer--is-mouseover': this.isMouseover,
                'v-navigation-drawer--mini-variant': this.isMiniVariant,
                'v-navigation-drawer--custom-mini-variant': Number(this.miniVariantWidth) !== 56,
                'v-navigation-drawer--open': this.isActive,
                'v-navigation-drawer--open-on-hover': this.expandOnHover,
                'v-navigation-drawer--right': this.right,
                'v-navigation-drawer--temporary': this.temporary,
                ...this.themeClasses,
            };
        },
        computedMaxHeight() {
            if (!this.hasApp)
                return null;
            const computedMaxHeight = (this.$vuetify.application.bottom +
                this.$vuetify.application.footer +
                this.$vuetify.application.bar);
            if (!this.clipped)
                return computedMaxHeight;
            return computedMaxHeight + this.$vuetify.application.top;
        },
        computedTop() {
            if (!this.hasApp)
                return 0;
            let computedTop = this.$vuetify.application.bar;
            computedTop += this.clipped
                ? this.$vuetify.application.top
                : 0;
            return computedTop;
        },
        computedTransform() {
            if (this.isActive)
                return 0;
            if (this.isBottom)
                return 100;
            return this.right ? 100 : -100;
        },
        computedWidth() {
            return this.isMiniVariant ? this.miniVariantWidth : this.width;
        },
        hasApp() {
            return (this.app &&
                (!this.isMobile && !this.temporary));
        },
        isBottom() {
            return this.bottom && this.isMobile;
        },
        isMiniVariant() {
            return (!this.expandOnHover &&
                this.miniVariant) || (this.expandOnHover &&
                !this.isMouseover);
        },
        isMobile() {
            return (!this.stateless &&
                !this.permanent &&
                this.$vuetify.breakpoint.width < parseInt(this.mobileBreakPoint, 10));
        },
        reactsToClick() {
            return (!this.stateless &&
                !this.permanent &&
                (this.isMobile || this.temporary));
        },
        reactsToMobile() {
            return (this.app &&
                !this.disableResizeWatcher &&
                !this.permanent &&
                !this.stateless &&
                !this.temporary);
        },
        reactsToResize() {
            return !this.disableResizeWatcher && !this.stateless;
        },
        reactsToRoute() {
            return (!this.disableRouteWatcher &&
                !this.stateless &&
                (this.temporary || this.isMobile));
        },
        showOverlay() {
            return (!this.hideOverlay &&
                this.isActive &&
                (this.isMobile || this.temporary));
        },
        styles() {
            const translate = this.isBottom ? 'translateY' : 'translateX';
            const styles = {
                height: convertToUnit(this.height),
                top: !this.isBottom ? convertToUnit(this.computedTop) : 'auto',
                maxHeight: this.computedMaxHeight != null
                    ? `calc(100% - ${convertToUnit(this.computedMaxHeight)})`
                    : undefined,
                transform: `${translate}(${convertToUnit(this.computedTransform, '%')})`,
                width: convertToUnit(this.computedWidth),
            };
            return styles;
        },
    },
    watch: {
        $route: 'onRouteChange',
        isActive(val) {
            this.$emit('input', val);
        },
        /**
         * When mobile changes, adjust the active state
         * only when there has been a previous value
         */
        isMobile(val, prev) {
            !val &&
                this.isActive &&
                !this.temporary &&
                this.removeOverlay();
            if (prev == null ||
                !this.reactsToResize ||
                !this.reactsToMobile)
                return;
            this.isActive = !val;
        },
        permanent(val) {
            // If enabling prop enable the drawer
            if (val)
                this.isActive = true;
        },
        showOverlay(val) {
            if (val)
                this.genOverlay();
            else
                this.removeOverlay();
        },
        value(val) {
            if (this.permanent)
                return;
            if (val == null) {
                this.init();
                return;
            }
            if (val !== this.isActive)
                this.isActive = val;
        },
        expandOnHover: 'updateMiniVariant',
        isMouseover(val) {
            this.updateMiniVariant(!val);
        },
    },
    beforeMount() {
        this.init();
    },
    methods: {
        calculateTouchArea() {
            const parent = this.$el.parentNode;
            if (!parent)
                return;
            const parentRect = parent.getBoundingClientRect();
            this.touchArea = {
                left: parentRect.left + 50,
                right: parentRect.right - 50,
            };
        },
        closeConditional() {
            return this.isActive && !this._isDestroyed && this.reactsToClick;
        },
        genAppend() {
            return this.genPosition('append');
        },
        genBackground() {
            const props = {
                height: '100%',
                width: '100%',
                src: this.src,
            };
            const image = this.$scopedSlots.img
                ? this.$scopedSlots.img(props)
                : this.$createElement(VImg, { props });
            return this.$createElement('div', {
                staticClass: 'v-navigation-drawer__image',
            }, [image]);
        },
        genDirectives() {
            const directives = [{
                    name: 'click-outside',
                    value: () => (this.isActive = false),
                    args: {
                        closeConditional: this.closeConditional,
                        include: this.getOpenDependentElements,
                    },
                }];
            if (!this.touchless && !this.stateless) {
                directives.push({
                    name: 'touch',
                    value: {
                        parent: true,
                        left: this.swipeLeft,
                        right: this.swipeRight,
                    },
                });
            }
            return directives;
        },
        genListeners() {
            const on = {
                transitionend: (e) => {
                    if (e.target !== e.currentTarget)
                        return;
                    this.$emit('transitionend', e);
                    // IE11 does not support new Event('resize')
                    const resizeEvent = document.createEvent('UIEvents');
                    resizeEvent.initUIEvent('resize', true, false, window, 0);
                    window.dispatchEvent(resizeEvent);
                },
            };
            if (this.miniVariant) {
                on.click = () => this.$emit('update:mini-variant', false);
            }
            if (this.expandOnHover) {
                on.mouseenter = () => (this.isMouseover = true);
                on.mouseleave = () => (this.isMouseover = false);
            }
            return on;
        },
        genPosition(name) {
            const slot = getSlot(this, name);
            if (!slot)
                return slot;
            return this.$createElement('div', {
                staticClass: `v-navigation-drawer__${name}`,
            }, slot);
        },
        genPrepend() {
            return this.genPosition('prepend');
        },
        genContent() {
            return this.$createElement('div', {
                staticClass: 'v-navigation-drawer__content',
            }, this.$slots.default);
        },
        genBorder() {
            return this.$createElement('div', {
                staticClass: 'v-navigation-drawer__border',
            });
        },
        init() {
            if (this.permanent) {
                this.isActive = true;
            }
            else if (this.stateless ||
                this.value != null) {
                this.isActive = this.value;
            }
            else if (!this.temporary) {
                this.isActive = !this.isMobile;
            }
        },
        onRouteChange() {
            if (this.reactsToRoute && this.closeConditional()) {
                this.isActive = false;
            }
        },
        swipeLeft(e) {
            if (this.isActive && this.right)
                return;
            this.calculateTouchArea();
            if (Math.abs(e.touchendX - e.touchstartX) < 100)
                return;
            if (this.right &&
                e.touchstartX >= this.touchArea.right)
                this.isActive = true;
            else if (!this.right && this.isActive)
                this.isActive = false;
        },
        swipeRight(e) {
            if (this.isActive && !this.right)
                return;
            this.calculateTouchArea();
            if (Math.abs(e.touchendX - e.touchstartX) < 100)
                return;
            if (!this.right &&
                e.touchstartX <= this.touchArea.left)
                this.isActive = true;
            else if (this.right && this.isActive)
                this.isActive = false;
        },
        /**
         * Update the application layout
         */
        updateApplication() {
            if (!this.isActive ||
                this.isMobile ||
                this.temporary ||
                !this.$el)
                return 0;
            const width = Number(this.computedWidth);
            return isNaN(width) ? this.$el.clientWidth : width;
        },
        updateMiniVariant(val) {
            if (this.miniVariant !== val)
                this.$emit('update:mini-variant', val);
        },
    },
    render(h) {
        const children = [
            this.genPrepend(),
            this.genContent(),
            this.genAppend(),
            this.genBorder(),
        ];
        if (this.src || getSlot(this, 'img'))
            children.unshift(this.genBackground());
        return h(this.tag, this.setBackgroundColor(this.color, {
            class: this.classes,
            style: this.styles,
            directives: this.genDirectives(),
            on: this.genListeners(),
        }), children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVk5hdmlnYXRpb25EcmF3ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WTmF2aWdhdGlvbkRyYXdlci9WTmF2aWdhdGlvbkRyYXdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTywwQkFBMEIsQ0FBQTtBQUVqQyxhQUFhO0FBQ2IsT0FBTyxJQUFtQixNQUFNLGNBQWMsQ0FBQTtBQUU5QyxTQUFTO0FBQ1QsT0FBTyxlQUFlLE1BQU0sOEJBQThCLENBQUE7QUFDMUQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxXQUFXLE1BQU0sMEJBQTBCLENBQUE7QUFDbEQsT0FBTyxXQUFXLE1BQU0sMkJBQTJCLENBQUE7QUFDbkQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsYUFBYTtBQUNiLE9BQU8sWUFBWSxNQUFNLGdDQUFnQyxDQUFBO0FBQ3pELE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBQzVDLE9BQU8sS0FBSyxNQUFNLHdCQUF3QixDQUFBO0FBRTFDLFlBQVk7QUFDWixPQUFPLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzNELE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBTXRDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsZUFBZSxDQUFDLE1BQU0sRUFBRTtJQUN0QixVQUFVO0lBQ1YsVUFBVTtJQUNWLGFBQWE7SUFDYixlQUFlO0lBQ2YsV0FBVztJQUNYLE9BQU87SUFDUCxXQUFXO0lBQ1gsT0FBTztDQUNSLENBQUMsRUFDRixTQUFTLEVBQ1QsU0FBUyxFQUNULFdBQVcsRUFDWCxXQUFXLEVBQ1gsU0FBUyxDQUNWLENBQUE7QUFFRCxvQkFBb0I7QUFDcEIsZUFBZSxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQy9CLElB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QXFCLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDdEUsQ0FBQztLQUNGO0lBRUQsTUFBTSxDQUFFLENBQUM7UUFDUCxNQUFNLFFBQVEsR0FBRztZQUNmLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDakIsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNqQixJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxTQUFTLEVBQUU7U0FDakIsQ0FBQTtRQUVELElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztZQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUE7UUFFNUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNyRCxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ2xCLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2hDLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO1NBQ3hCLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNmLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WTmF2aWdhdGlvbkRyYXdlci5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVkltZywgeyBzcmNPYmplY3QgfSBmcm9tICcuLi9WSW1nL1ZJbWcnXG5cbi8vIE1peGluc1xuaW1wb3J0IEFwcGxpY2F0aW9uYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvYXBwbGljYXRpb25hYmxlJ1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IERlcGVuZGVudCBmcm9tICcuLi8uLi9taXhpbnMvZGVwZW5kZW50J1xuaW1wb3J0IE92ZXJsYXlhYmxlIGZyb20gJy4uLy4uL21peGlucy9vdmVybGF5YWJsZSdcbmltcG9ydCBTU1JCb290YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvc3NyLWJvb3RhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgQ2xpY2tPdXRzaWRlIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvY2xpY2stb3V0c2lkZSdcbmltcG9ydCBSZXNpemUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yZXNpemUnXG5pbXBvcnQgVG91Y2ggZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy90b3VjaCdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgeyBjb252ZXJ0VG9Vbml0LCBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBWTm9kZURpcmVjdGl2ZSwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBUb3VjaFdyYXBwZXIgfSBmcm9tICd0eXBlcydcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgQXBwbGljYXRpb25hYmxlKCdsZWZ0JywgW1xuICAgICdpc0FjdGl2ZScsXG4gICAgJ2lzTW9iaWxlJyxcbiAgICAnbWluaVZhcmlhbnQnLFxuICAgICdleHBhbmRPbkhvdmVyJyxcbiAgICAncGVybWFuZW50JyxcbiAgICAncmlnaHQnLFxuICAgICd0ZW1wb3JhcnknLFxuICAgICd3aWR0aCcsXG4gIF0pLFxuICBDb2xvcmFibGUsXG4gIERlcGVuZGVudCxcbiAgT3ZlcmxheWFibGUsXG4gIFNTUkJvb3RhYmxlLFxuICBUaGVtZWFibGVcbilcblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IGJhc2VNaXhpbnMuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtbmF2aWdhdGlvbi1kcmF3ZXInLFxuXG4gIHByb3ZpZGUgKCk6IG9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzSW5OYXY6IHRoaXMudGFnID09PSAnbmF2JyxcbiAgICB9XG4gIH0sXG5cbiAgZGlyZWN0aXZlczoge1xuICAgIENsaWNrT3V0c2lkZSxcbiAgICBSZXNpemUsXG4gICAgVG91Y2gsXG4gIH0sXG5cbiAgcHJvcHM6IHtcbiAgICBib3R0b206IEJvb2xlYW4sXG4gICAgY2xpcHBlZDogQm9vbGVhbixcbiAgICBkaXNhYmxlUmVzaXplV2F0Y2hlcjogQm9vbGVhbixcbiAgICBkaXNhYmxlUm91dGVXYXRjaGVyOiBCb29sZWFuLFxuICAgIGV4cGFuZE9uSG92ZXI6IEJvb2xlYW4sXG4gICAgZmxvYXRpbmc6IEJvb2xlYW4sXG4gICAgaGVpZ2h0OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdCAoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwID8gJzEwMHZoJyA6ICcxMDAlJ1xuICAgICAgfSxcbiAgICB9LFxuICAgIG1pbmlWYXJpYW50OiBCb29sZWFuLFxuICAgIG1pbmlWYXJpYW50V2lkdGg6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiA1NixcbiAgICB9LFxuICAgIG1vYmlsZUJyZWFrUG9pbnQ6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAxMjY0LFxuICAgIH0sXG4gICAgcGVybWFuZW50OiBCb29sZWFuLFxuICAgIHJpZ2h0OiBCb29sZWFuLFxuICAgIHNyYzoge1xuICAgICAgdHlwZTogW1N0cmluZywgT2JqZWN0XSBhcyBQcm9wVHlwZTxzdHJpbmcgfCBzcmNPYmplY3Q+LFxuICAgICAgZGVmYXVsdDogJycsXG4gICAgfSxcbiAgICBzdGF0ZWxlc3M6IEJvb2xlYW4sXG4gICAgdGFnOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0ICgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5hcHAgPyAnbmF2JyA6ICdhc2lkZSdcbiAgICAgIH0sXG4gICAgfSxcbiAgICB0ZW1wb3Jhcnk6IEJvb2xlYW4sXG4gICAgdG91Y2hsZXNzOiBCb29sZWFuLFxuICAgIHdpZHRoOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMjU2LFxuICAgIH0sXG4gICAgdmFsdWU6IG51bGwgYXMgdW5rbm93biBhcyBQcm9wVHlwZTxhbnk+LFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgaXNNb3VzZW92ZXI6IGZhbHNlLFxuICAgIHRvdWNoQXJlYToge1xuICAgICAgbGVmdDogMCxcbiAgICAgIHJpZ2h0OiAwLFxuICAgIH0sXG4gICAgc3RhY2tNaW5aSW5kZXg6IDYsXG4gIH0pLFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgLyoqXG4gICAgICogVXNlZCBmb3Igc2V0dGluZyBhbiBhcHAgdmFsdWUgZnJvbSBhIGR5bmFtaWNcbiAgICAgKiBwcm9wZXJ0eS4gQ2FsbGVkIGZyb20gYXBwbGljYXRpb25hYmxlLmpzXG4gICAgICovXG4gICAgYXBwbGljYXRpb25Qcm9wZXJ0eSAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0ID8gJ3JpZ2h0JyA6ICdsZWZ0J1xuICAgIH0sXG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LW5hdmlnYXRpb24tZHJhd2VyJzogdHJ1ZSxcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLWFic29sdXRlJzogdGhpcy5hYnNvbHV0ZSxcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLWJvdHRvbSc6IHRoaXMuYm90dG9tLFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tY2xpcHBlZCc6IHRoaXMuY2xpcHBlZCxcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLWNsb3NlJzogIXRoaXMuaXNBY3RpdmUsXG4gICAgICAgICd2LW5hdmlnYXRpb24tZHJhd2VyLS1maXhlZCc6ICF0aGlzLmFic29sdXRlICYmICh0aGlzLmFwcCB8fCB0aGlzLmZpeGVkKSxcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLWZsb2F0aW5nJzogdGhpcy5mbG9hdGluZyxcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLWlzLW1vYmlsZSc6IHRoaXMuaXNNb2JpbGUsXG4gICAgICAgICd2LW5hdmlnYXRpb24tZHJhd2VyLS1pcy1tb3VzZW92ZXInOiB0aGlzLmlzTW91c2VvdmVyLFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tbWluaS12YXJpYW50JzogdGhpcy5pc01pbmlWYXJpYW50LFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tY3VzdG9tLW1pbmktdmFyaWFudCc6IE51bWJlcih0aGlzLm1pbmlWYXJpYW50V2lkdGgpICE9PSA1NixcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLW9wZW4nOiB0aGlzLmlzQWN0aXZlLFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tb3Blbi1vbi1ob3Zlcic6IHRoaXMuZXhwYW5kT25Ib3ZlcixcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLXJpZ2h0JzogdGhpcy5yaWdodCxcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLXRlbXBvcmFyeSc6IHRoaXMudGVtcG9yYXJ5LFxuICAgICAgICAuLi50aGlzLnRoZW1lQ2xhc3NlcyxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkTWF4SGVpZ2h0ICgpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgIGlmICghdGhpcy5oYXNBcHApIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IGNvbXB1dGVkTWF4SGVpZ2h0ID0gKFxuICAgICAgICB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLmJvdHRvbSArXG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkuYXBwbGljYXRpb24uZm9vdGVyICtcbiAgICAgICAgdGhpcy4kdnVldGlmeS5hcHBsaWNhdGlvbi5iYXJcbiAgICAgIClcblxuICAgICAgaWYgKCF0aGlzLmNsaXBwZWQpIHJldHVybiBjb21wdXRlZE1heEhlaWdodFxuXG4gICAgICByZXR1cm4gY29tcHV0ZWRNYXhIZWlnaHQgKyB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLnRvcFxuICAgIH0sXG4gICAgY29tcHV0ZWRUb3AgKCk6IG51bWJlciB7XG4gICAgICBpZiAoIXRoaXMuaGFzQXBwKSByZXR1cm4gMFxuXG4gICAgICBsZXQgY29tcHV0ZWRUb3AgPSB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLmJhclxuXG4gICAgICBjb21wdXRlZFRvcCArPSB0aGlzLmNsaXBwZWRcbiAgICAgICAgPyB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLnRvcFxuICAgICAgICA6IDBcblxuICAgICAgcmV0dXJuIGNvbXB1dGVkVG9wXG4gICAgfSxcbiAgICBjb21wdXRlZFRyYW5zZm9ybSAoKTogbnVtYmVyIHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSByZXR1cm4gMFxuICAgICAgaWYgKHRoaXMuaXNCb3R0b20pIHJldHVybiAxMDBcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0ID8gMTAwIDogLTEwMFxuICAgIH0sXG4gICAgY29tcHV0ZWRXaWR0aCAoKTogc3RyaW5nIHwgbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLmlzTWluaVZhcmlhbnQgPyB0aGlzLm1pbmlWYXJpYW50V2lkdGggOiB0aGlzLndpZHRoXG4gICAgfSxcbiAgICBoYXNBcHAgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5hcHAgJiZcbiAgICAgICAgKCF0aGlzLmlzTW9iaWxlICYmICF0aGlzLnRlbXBvcmFyeSlcbiAgICAgIClcbiAgICB9LFxuICAgIGlzQm90dG9tICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmJvdHRvbSAmJiB0aGlzLmlzTW9iaWxlXG4gICAgfSxcbiAgICBpc01pbmlWYXJpYW50ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICF0aGlzLmV4cGFuZE9uSG92ZXIgJiZcbiAgICAgICAgdGhpcy5taW5pVmFyaWFudFxuICAgICAgKSB8fCAoXG4gICAgICAgIHRoaXMuZXhwYW5kT25Ib3ZlciAmJlxuICAgICAgICAhdGhpcy5pc01vdXNlb3ZlclxuICAgICAgKVxuICAgIH0sXG4gICAgaXNNb2JpbGUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgIXRoaXMuc3RhdGVsZXNzICYmXG4gICAgICAgICF0aGlzLnBlcm1hbmVudCAmJlxuICAgICAgICB0aGlzLiR2dWV0aWZ5LmJyZWFrcG9pbnQud2lkdGggPCBwYXJzZUludCh0aGlzLm1vYmlsZUJyZWFrUG9pbnQsIDEwKVxuICAgICAgKVxuICAgIH0sXG4gICAgcmVhY3RzVG9DbGljayAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAhdGhpcy5zdGF0ZWxlc3MgJiZcbiAgICAgICAgIXRoaXMucGVybWFuZW50ICYmXG4gICAgICAgICh0aGlzLmlzTW9iaWxlIHx8IHRoaXMudGVtcG9yYXJ5KVxuICAgICAgKVxuICAgIH0sXG4gICAgcmVhY3RzVG9Nb2JpbGUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5hcHAgJiZcbiAgICAgICAgIXRoaXMuZGlzYWJsZVJlc2l6ZVdhdGNoZXIgJiZcbiAgICAgICAgIXRoaXMucGVybWFuZW50ICYmXG4gICAgICAgICF0aGlzLnN0YXRlbGVzcyAmJlxuICAgICAgICAhdGhpcy50ZW1wb3JhcnlcbiAgICAgIClcbiAgICB9LFxuICAgIHJlYWN0c1RvUmVzaXplICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAhdGhpcy5kaXNhYmxlUmVzaXplV2F0Y2hlciAmJiAhdGhpcy5zdGF0ZWxlc3NcbiAgICB9LFxuICAgIHJlYWN0c1RvUm91dGUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgIXRoaXMuZGlzYWJsZVJvdXRlV2F0Y2hlciAmJlxuICAgICAgICAhdGhpcy5zdGF0ZWxlc3MgJiZcbiAgICAgICAgKHRoaXMudGVtcG9yYXJ5IHx8IHRoaXMuaXNNb2JpbGUpXG4gICAgICApXG4gICAgfSxcbiAgICBzaG93T3ZlcmxheSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAhdGhpcy5oaWRlT3ZlcmxheSAmJlxuICAgICAgICB0aGlzLmlzQWN0aXZlICYmXG4gICAgICAgICh0aGlzLmlzTW9iaWxlIHx8IHRoaXMudGVtcG9yYXJ5KVxuICAgICAgKVxuICAgIH0sXG4gICAgc3R5bGVzICgpOiBvYmplY3Qge1xuICAgICAgY29uc3QgdHJhbnNsYXRlID0gdGhpcy5pc0JvdHRvbSA/ICd0cmFuc2xhdGVZJyA6ICd0cmFuc2xhdGVYJ1xuICAgICAgY29uc3Qgc3R5bGVzID0ge1xuICAgICAgICBoZWlnaHQ6IGNvbnZlcnRUb1VuaXQodGhpcy5oZWlnaHQpLFxuICAgICAgICB0b3A6ICF0aGlzLmlzQm90dG9tID8gY29udmVydFRvVW5pdCh0aGlzLmNvbXB1dGVkVG9wKSA6ICdhdXRvJyxcbiAgICAgICAgbWF4SGVpZ2h0OiB0aGlzLmNvbXB1dGVkTWF4SGVpZ2h0ICE9IG51bGxcbiAgICAgICAgICA/IGBjYWxjKDEwMCUgLSAke2NvbnZlcnRUb1VuaXQodGhpcy5jb21wdXRlZE1heEhlaWdodCl9KWBcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgdHJhbnNmb3JtOiBgJHt0cmFuc2xhdGV9KCR7Y29udmVydFRvVW5pdCh0aGlzLmNvbXB1dGVkVHJhbnNmb3JtLCAnJScpfSlgLFxuICAgICAgICB3aWR0aDogY29udmVydFRvVW5pdCh0aGlzLmNvbXB1dGVkV2lkdGgpLFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3R5bGVzXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgICRyb3V0ZTogJ29uUm91dGVDaGFuZ2UnLFxuICAgIGlzQWN0aXZlICh2YWwpIHtcbiAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgdmFsKVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogV2hlbiBtb2JpbGUgY2hhbmdlcywgYWRqdXN0IHRoZSBhY3RpdmUgc3RhdGVcbiAgICAgKiBvbmx5IHdoZW4gdGhlcmUgaGFzIGJlZW4gYSBwcmV2aW91cyB2YWx1ZVxuICAgICAqL1xuICAgIGlzTW9iaWxlICh2YWwsIHByZXYpIHtcbiAgICAgICF2YWwgJiZcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSAmJlxuICAgICAgICAhdGhpcy50ZW1wb3JhcnkgJiZcbiAgICAgICAgdGhpcy5yZW1vdmVPdmVybGF5KClcblxuICAgICAgaWYgKHByZXYgPT0gbnVsbCB8fFxuICAgICAgICAhdGhpcy5yZWFjdHNUb1Jlc2l6ZSB8fFxuICAgICAgICAhdGhpcy5yZWFjdHNUb01vYmlsZVxuICAgICAgKSByZXR1cm5cblxuICAgICAgdGhpcy5pc0FjdGl2ZSA9ICF2YWxcbiAgICB9LFxuICAgIHBlcm1hbmVudCAodmFsKSB7XG4gICAgICAvLyBJZiBlbmFibGluZyBwcm9wIGVuYWJsZSB0aGUgZHJhd2VyXG4gICAgICBpZiAodmFsKSB0aGlzLmlzQWN0aXZlID0gdHJ1ZVxuICAgIH0sXG4gICAgc2hvd092ZXJsYXkgKHZhbCkge1xuICAgICAgaWYgKHZhbCkgdGhpcy5nZW5PdmVybGF5KClcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVPdmVybGF5KClcbiAgICB9LFxuICAgIHZhbHVlICh2YWwpIHtcbiAgICAgIGlmICh0aGlzLnBlcm1hbmVudCkgcmV0dXJuXG5cbiAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmluaXQoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHZhbCAhPT0gdGhpcy5pc0FjdGl2ZSkgdGhpcy5pc0FjdGl2ZSA9IHZhbFxuICAgIH0sXG4gICAgZXhwYW5kT25Ib3ZlcjogJ3VwZGF0ZU1pbmlWYXJpYW50JyxcbiAgICBpc01vdXNlb3ZlciAodmFsKSB7XG4gICAgICB0aGlzLnVwZGF0ZU1pbmlWYXJpYW50KCF2YWwpXG4gICAgfSxcbiAgfSxcblxuICBiZWZvcmVNb3VudCAoKSB7XG4gICAgdGhpcy5pbml0KClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgY2FsY3VsYXRlVG91Y2hBcmVhICgpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuJGVsLnBhcmVudE5vZGUgYXMgRWxlbWVudFxuXG4gICAgICBpZiAoIXBhcmVudCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHBhcmVudFJlY3QgPSBwYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgdGhpcy50b3VjaEFyZWEgPSB7XG4gICAgICAgIGxlZnQ6IHBhcmVudFJlY3QubGVmdCArIDUwLFxuICAgICAgICByaWdodDogcGFyZW50UmVjdC5yaWdodCAtIDUwLFxuICAgICAgfVxuICAgIH0sXG4gICAgY2xvc2VDb25kaXRpb25hbCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pc0FjdGl2ZSAmJiAhdGhpcy5faXNEZXN0cm95ZWQgJiYgdGhpcy5yZWFjdHNUb0NsaWNrXG4gICAgfSxcbiAgICBnZW5BcHBlbmQgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2VuUG9zaXRpb24oJ2FwcGVuZCcpXG4gICAgfSxcbiAgICBnZW5CYWNrZ3JvdW5kICgpIHtcbiAgICAgIGNvbnN0IHByb3BzID0ge1xuICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgc3JjOiB0aGlzLnNyYyxcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW1hZ2UgPSB0aGlzLiRzY29wZWRTbG90cy5pbWdcbiAgICAgICAgPyB0aGlzLiRzY29wZWRTbG90cy5pbWcocHJvcHMpXG4gICAgICAgIDogdGhpcy4kY3JlYXRlRWxlbWVudChWSW1nLCB7IHByb3BzIH0pXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1uYXZpZ2F0aW9uLWRyYXdlcl9faW1hZ2UnLFxuICAgICAgfSwgW2ltYWdlXSlcbiAgICB9LFxuICAgIGdlbkRpcmVjdGl2ZXMgKCk6IFZOb2RlRGlyZWN0aXZlW10ge1xuICAgICAgY29uc3QgZGlyZWN0aXZlcyA9IFt7XG4gICAgICAgIG5hbWU6ICdjbGljay1vdXRzaWRlJyxcbiAgICAgICAgdmFsdWU6ICgpID0+ICh0aGlzLmlzQWN0aXZlID0gZmFsc2UpLFxuICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgY2xvc2VDb25kaXRpb25hbDogdGhpcy5jbG9zZUNvbmRpdGlvbmFsLFxuICAgICAgICAgIGluY2x1ZGU6IHRoaXMuZ2V0T3BlbkRlcGVuZGVudEVsZW1lbnRzLFxuICAgICAgICB9LFxuICAgICAgfV1cblxuICAgICAgaWYgKCF0aGlzLnRvdWNobGVzcyAmJiAhdGhpcy5zdGF0ZWxlc3MpIHtcbiAgICAgICAgZGlyZWN0aXZlcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiAndG91Y2gnLFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBwYXJlbnQ6IHRydWUsXG4gICAgICAgICAgICBsZWZ0OiB0aGlzLnN3aXBlTGVmdCxcbiAgICAgICAgICAgIHJpZ2h0OiB0aGlzLnN3aXBlUmlnaHQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSBhcyBhbnkpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkaXJlY3RpdmVzXG4gICAgfSxcbiAgICBnZW5MaXN0ZW5lcnMgKCkge1xuICAgICAgY29uc3Qgb246IFJlY29yZDxzdHJpbmcsIChlOiBFdmVudCkgPT4gdm9pZD4gPSB7XG4gICAgICAgIHRyYW5zaXRpb25lbmQ6IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgIGlmIChlLnRhcmdldCAhPT0gZS5jdXJyZW50VGFyZ2V0KSByZXR1cm5cbiAgICAgICAgICB0aGlzLiRlbWl0KCd0cmFuc2l0aW9uZW5kJywgZSlcblxuICAgICAgICAgIC8vIElFMTEgZG9lcyBub3Qgc3VwcG9ydCBuZXcgRXZlbnQoJ3Jlc2l6ZScpXG4gICAgICAgICAgY29uc3QgcmVzaXplRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnVUlFdmVudHMnKVxuICAgICAgICAgIHJlc2l6ZUV2ZW50LmluaXRVSUV2ZW50KCdyZXNpemUnLCB0cnVlLCBmYWxzZSwgd2luZG93LCAwKVxuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KHJlc2l6ZUV2ZW50KVxuICAgICAgICB9LFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5taW5pVmFyaWFudCkge1xuICAgICAgICBvbi5jbGljayA9ICgpID0+IHRoaXMuJGVtaXQoJ3VwZGF0ZTptaW5pLXZhcmlhbnQnLCBmYWxzZSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZXhwYW5kT25Ib3Zlcikge1xuICAgICAgICBvbi5tb3VzZWVudGVyID0gKCkgPT4gKHRoaXMuaXNNb3VzZW92ZXIgPSB0cnVlKVxuICAgICAgICBvbi5tb3VzZWxlYXZlID0gKCkgPT4gKHRoaXMuaXNNb3VzZW92ZXIgPSBmYWxzZSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9uXG4gICAgfSxcbiAgICBnZW5Qb3NpdGlvbiAobmFtZTogJ3ByZXBlbmQnIHwgJ2FwcGVuZCcpIHtcbiAgICAgIGNvbnN0IHNsb3QgPSBnZXRTbG90KHRoaXMsIG5hbWUpXG5cbiAgICAgIGlmICghc2xvdCkgcmV0dXJuIHNsb3RcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6IGB2LW5hdmlnYXRpb24tZHJhd2VyX18ke25hbWV9YCxcbiAgICAgIH0sIHNsb3QpXG4gICAgfSxcbiAgICBnZW5QcmVwZW5kICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdlblBvc2l0aW9uKCdwcmVwZW5kJylcbiAgICB9LFxuICAgIGdlbkNvbnRlbnQgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LW5hdmlnYXRpb24tZHJhd2VyX19jb250ZW50JyxcbiAgICAgIH0sIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gICAgfSxcbiAgICBnZW5Cb3JkZXIgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LW5hdmlnYXRpb24tZHJhd2VyX19ib3JkZXInLFxuICAgICAgfSlcbiAgICB9LFxuICAgIGluaXQgKCkge1xuICAgICAgaWYgKHRoaXMucGVybWFuZW50KSB7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGVsZXNzIHx8XG4gICAgICAgIHRoaXMudmFsdWUgIT0gbnVsbFxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSB0aGlzLnZhbHVlXG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLnRlbXBvcmFyeSkge1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gIXRoaXMuaXNNb2JpbGVcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uUm91dGVDaGFuZ2UgKCkge1xuICAgICAgaWYgKHRoaXMucmVhY3RzVG9Sb3V0ZSAmJiB0aGlzLmNsb3NlQ29uZGl0aW9uYWwoKSkge1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIHN3aXBlTGVmdCAoZTogVG91Y2hXcmFwcGVyKSB7XG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSAmJiB0aGlzLnJpZ2h0KSByZXR1cm5cbiAgICAgIHRoaXMuY2FsY3VsYXRlVG91Y2hBcmVhKClcblxuICAgICAgaWYgKE1hdGguYWJzKGUudG91Y2hlbmRYIC0gZS50b3VjaHN0YXJ0WCkgPCAxMDApIHJldHVyblxuICAgICAgaWYgKHRoaXMucmlnaHQgJiZcbiAgICAgICAgZS50b3VjaHN0YXJ0WCA+PSB0aGlzLnRvdWNoQXJlYS5yaWdodFxuICAgICAgKSB0aGlzLmlzQWN0aXZlID0gdHJ1ZVxuICAgICAgZWxzZSBpZiAoIXRoaXMucmlnaHQgJiYgdGhpcy5pc0FjdGl2ZSkgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlXG4gICAgfSxcbiAgICBzd2lwZVJpZ2h0IChlOiBUb3VjaFdyYXBwZXIpIHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlICYmICF0aGlzLnJpZ2h0KSByZXR1cm5cbiAgICAgIHRoaXMuY2FsY3VsYXRlVG91Y2hBcmVhKClcblxuICAgICAgaWYgKE1hdGguYWJzKGUudG91Y2hlbmRYIC0gZS50b3VjaHN0YXJ0WCkgPCAxMDApIHJldHVyblxuICAgICAgaWYgKCF0aGlzLnJpZ2h0ICYmXG4gICAgICAgIGUudG91Y2hzdGFydFggPD0gdGhpcy50b3VjaEFyZWEubGVmdFxuICAgICAgKSB0aGlzLmlzQWN0aXZlID0gdHJ1ZVxuICAgICAgZWxzZSBpZiAodGhpcy5yaWdodCAmJiB0aGlzLmlzQWN0aXZlKSB0aGlzLmlzQWN0aXZlID0gZmFsc2VcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB0aGUgYXBwbGljYXRpb24gbGF5b3V0XG4gICAgICovXG4gICAgdXBkYXRlQXBwbGljYXRpb24gKCkge1xuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5pc0FjdGl2ZSB8fFxuICAgICAgICB0aGlzLmlzTW9iaWxlIHx8XG4gICAgICAgIHRoaXMudGVtcG9yYXJ5IHx8XG4gICAgICAgICF0aGlzLiRlbFxuICAgICAgKSByZXR1cm4gMFxuXG4gICAgICBjb25zdCB3aWR0aCA9IE51bWJlcih0aGlzLmNvbXB1dGVkV2lkdGgpXG5cbiAgICAgIHJldHVybiBpc05hTih3aWR0aCkgPyB0aGlzLiRlbC5jbGllbnRXaWR0aCA6IHdpZHRoXG4gICAgfSxcbiAgICB1cGRhdGVNaW5pVmFyaWFudCAodmFsOiBib29sZWFuKSB7XG4gICAgICBpZiAodGhpcy5taW5pVmFyaWFudCAhPT0gdmFsKSB0aGlzLiRlbWl0KCd1cGRhdGU6bWluaS12YXJpYW50JywgdmFsKVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gW1xuICAgICAgdGhpcy5nZW5QcmVwZW5kKCksXG4gICAgICB0aGlzLmdlbkNvbnRlbnQoKSxcbiAgICAgIHRoaXMuZ2VuQXBwZW5kKCksXG4gICAgICB0aGlzLmdlbkJvcmRlcigpLFxuICAgIF1cblxuICAgIGlmICh0aGlzLnNyYyB8fCBnZXRTbG90KHRoaXMsICdpbWcnKSkgY2hpbGRyZW4udW5zaGlmdCh0aGlzLmdlbkJhY2tncm91bmQoKSlcblxuICAgIHJldHVybiBoKHRoaXMudGFnLCB0aGlzLnNldEJhY2tncm91bmRDb2xvcih0aGlzLmNvbG9yLCB7XG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGVzLFxuICAgICAgZGlyZWN0aXZlczogdGhpcy5nZW5EaXJlY3RpdmVzKCksXG4gICAgICBvbjogdGhpcy5nZW5MaXN0ZW5lcnMoKSxcbiAgICB9KSwgY2hpbGRyZW4pXG4gIH0sXG59KVxuIl19