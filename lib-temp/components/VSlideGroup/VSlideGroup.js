// Styles
import './VSlideGroup.sass';
// Components
import VIcon from '../VIcon';
import { VFadeTransition } from '../transitions';
// Extensions
import { BaseItemGroup } from '../VItemGroup/VItemGroup';
// Directives
import Resize from '../../directives/resize';
import Touch from '../../directives/touch';
// Utilities
import mixins from '../../util/mixins';
export const BaseSlideGroup = mixins(BaseItemGroup
/* @vue/component */
).extend({
    name: 'base-slide-group',
    directives: {
        Resize,
        Touch,
    },
    props: {
        activeClass: {
            type: String,
            default: 'v-slide-item--active',
        },
        centerActive: Boolean,
        nextIcon: {
            type: String,
            default: '$next',
        },
        mobileBreakPoint: {
            type: [Number, String],
            default: 1264,
            validator: (v) => !isNaN(parseInt(v)),
        },
        prevIcon: {
            type: String,
            default: '$prev',
        },
        showArrows: Boolean,
    },
    data: () => ({
        internalItemsLength: 0,
        isOverflowing: false,
        resizeTimeout: 0,
        startX: 0,
        scrollOffset: 0,
        widths: {
            content: 0,
            wrapper: 0,
        },
    }),
    computed: {
        __cachedNext() {
            return this.genTransition('next');
        },
        __cachedPrev() {
            return this.genTransition('prev');
        },
        classes() {
            return {
                ...BaseItemGroup.options.computed.classes.call(this),
                'v-slide-group': true,
                'v-slide-group--has-affixes': this.hasAffixes,
                'v-slide-group--is-overflowing': this.isOverflowing,
            };
        },
        hasAffixes() {
            return ((this.showArrows || !this.isMobile) &&
                this.isOverflowing);
        },
        hasNext() {
            if (!this.hasAffixes)
                return false;
            const { content, wrapper } = this.widths;
            // Check one scroll ahead to know the width of right-most item
            return content > Math.abs(this.scrollOffset) + wrapper;
        },
        hasPrev() {
            return this.hasAffixes && this.scrollOffset !== 0;
        },
        isMobile() {
            return this.$vuetify.breakpoint.width < this.mobileBreakPoint;
        },
    },
    watch: {
        internalValue: 'setWidths',
        // When overflow changes, the arrows alter
        // the widths of the content and wrapper
        // and need to be recalculated
        isOverflowing: 'setWidths',
        scrollOffset(val) {
            this.$refs.content.style.transform = `translateX(${-val}px)`;
        },
    },
    beforeUpdate() {
        this.internalItemsLength = (this.$children || []).length;
    },
    updated() {
        if (this.internalItemsLength === (this.$children || []).length)
            return;
        this.setWidths();
    },
    methods: {
        // Always generate next for scrollable hint
        genNext() {
            const slot = this.$scopedSlots.next
                ? this.$scopedSlots.next({})
                : this.$slots.next || this.__cachedNext;
            return this.$createElement('div', {
                staticClass: 'v-slide-group__next',
                class: {
                    'v-slide-group__next--disabled': !this.hasNext,
                },
                on: {
                    click: () => this.onAffixClick('next'),
                },
                key: 'next',
            }, [slot]);
        },
        genContent() {
            return this.$createElement('div', {
                staticClass: 'v-slide-group__content',
                ref: 'content',
            }, this.$slots.default);
        },
        genData() {
            return {
                class: this.classes,
                directives: [{
                        name: 'resize',
                        value: this.onResize,
                    }],
            };
        },
        genIcon(location) {
            let icon = location;
            if (this.$vuetify.rtl && location === 'prev') {
                icon = 'next';
            }
            else if (this.$vuetify.rtl && location === 'next') {
                icon = 'prev';
            }
            const upperLocation = `${location[0].toUpperCase()}${location.slice(1)}`;
            const hasAffix = this[`has${upperLocation}`];
            if (!this.showArrows &&
                !hasAffix)
                return null;
            return this.$createElement(VIcon, {
                props: {
                    disabled: !hasAffix,
                },
            }, this[`${icon}Icon`]);
        },
        // Always generate prev for scrollable hint
        genPrev() {
            const slot = this.$scopedSlots.prev
                ? this.$scopedSlots.prev({})
                : this.$slots.prev || this.__cachedPrev;
            return this.$createElement('div', {
                staticClass: 'v-slide-group__prev',
                class: {
                    'v-slide-group__prev--disabled': !this.hasPrev,
                },
                on: {
                    click: () => this.onAffixClick('prev'),
                },
                key: 'prev',
            }, [slot]);
        },
        genTransition(location) {
            return this.$createElement(VFadeTransition, [this.genIcon(location)]);
        },
        genWrapper() {
            return this.$createElement('div', {
                staticClass: 'v-slide-group__wrapper',
                directives: [{
                        name: 'touch',
                        value: {
                            start: (e) => this.overflowCheck(e, this.onTouchStart),
                            move: (e) => this.overflowCheck(e, this.onTouchMove),
                            end: (e) => this.overflowCheck(e, this.onTouchEnd),
                        },
                    }],
                ref: 'wrapper',
            }, [this.genContent()]);
        },
        calculateNewOffset(direction, widths, rtl, currentScrollOffset) {
            const sign = rtl ? -1 : 1;
            const newAbosluteOffset = sign * currentScrollOffset +
                (direction === 'prev' ? -1 : 1) * widths.wrapper;
            return sign * Math.max(Math.min(newAbosluteOffset, widths.content - widths.wrapper), 0);
        },
        onAffixClick(location) {
            this.$emit(`click:${location}`);
            this.scrollTo(location);
        },
        onResize() {
            /* istanbul ignore next */
            if (this._isDestroyed)
                return;
            this.setWidths();
        },
        onTouchStart(e) {
            const { content } = this.$refs;
            this.startX = this.scrollOffset + e.touchstartX;
            content.style.setProperty('transition', 'none');
            content.style.setProperty('willChange', 'transform');
        },
        onTouchMove(e) {
            this.scrollOffset = this.startX - e.touchmoveX;
        },
        onTouchEnd() {
            const { content, wrapper } = this.$refs;
            const maxScrollOffset = content.clientWidth - wrapper.clientWidth;
            content.style.setProperty('transition', null);
            content.style.setProperty('willChange', null);
            if (this.$vuetify.rtl) {
                /* istanbul ignore else */
                if (this.scrollOffset > 0 || !this.isOverflowing) {
                    this.scrollOffset = 0;
                }
                else if (this.scrollOffset <= -maxScrollOffset) {
                    this.scrollOffset = -maxScrollOffset;
                }
            }
            else {
                /* istanbul ignore else */
                if (this.scrollOffset < 0 || !this.isOverflowing) {
                    this.scrollOffset = 0;
                }
                else if (this.scrollOffset >= maxScrollOffset) {
                    this.scrollOffset = maxScrollOffset;
                }
            }
        },
        overflowCheck(e, fn) {
            e.stopPropagation();
            this.isOverflowing && fn(e);
        },
        scrollIntoView /* istanbul ignore next */() {
            if (!this.selectedItem) {
                return;
            }
            if (this.selectedIndex === 0 ||
                (!this.centerActive && !this.isOverflowing)) {
                this.scrollOffset = 0;
            }
            else if (this.centerActive) {
                this.scrollOffset = this.calculateCenteredOffset(this.selectedItem.$el, this.widths, this.$vuetify.rtl);
            }
            else if (this.isOverflowing) {
                this.scrollOffset = this.calculateUpdatedOffset(this.selectedItem.$el, this.widths, this.$vuetify.rtl, this.scrollOffset);
            }
        },
        calculateUpdatedOffset(selectedElement, widths, rtl, currentScrollOffset) {
            const clientWidth = selectedElement.clientWidth;
            const offsetLeft = rtl
                ? (widths.content - selectedElement.offsetLeft - clientWidth)
                : selectedElement.offsetLeft;
            if (rtl) {
                currentScrollOffset = -currentScrollOffset;
            }
            const totalWidth = widths.wrapper + currentScrollOffset;
            const itemOffset = clientWidth + offsetLeft;
            const additionalOffset = clientWidth * 0.4;
            if (offsetLeft < currentScrollOffset) {
                currentScrollOffset = Math.max(offsetLeft - additionalOffset, 0);
            }
            else if (totalWidth < itemOffset) {
                currentScrollOffset = Math.min(currentScrollOffset - (totalWidth - itemOffset - additionalOffset), widths.content - widths.wrapper);
            }
            return rtl ? -currentScrollOffset : currentScrollOffset;
        },
        calculateCenteredOffset(selectedElement, widths, rtl) {
            const { offsetLeft, clientWidth } = selectedElement;
            if (rtl) {
                const offsetCentered = widths.content - offsetLeft - clientWidth / 2 - widths.wrapper / 2;
                return -Math.min(widths.content - widths.wrapper, Math.max(0, offsetCentered));
            }
            else {
                const offsetCentered = offsetLeft + clientWidth / 2 - widths.wrapper / 2;
                return Math.min(widths.content - widths.wrapper, Math.max(0, offsetCentered));
            }
        },
        scrollTo /* istanbul ignore next */(location) {
            this.scrollOffset = this.calculateNewOffset(location, {
                // Force reflow
                content: this.$refs.content ? this.$refs.content.clientWidth : 0,
                wrapper: this.$refs.wrapper ? this.$refs.wrapper.clientWidth : 0,
            }, this.$vuetify.rtl, this.scrollOffset);
        },
        setWidths /* istanbul ignore next */() {
            window.requestAnimationFrame(() => {
                const { content, wrapper } = this.$refs;
                this.widths = {
                    content: content ? content.clientWidth : 0,
                    wrapper: wrapper ? wrapper.clientWidth : 0,
                };
                this.isOverflowing = this.widths.wrapper < this.widths.content;
                this.scrollIntoView();
            });
        },
    },
    render(h) {
        return h('div', this.genData(), [
            this.genPrev(),
            this.genWrapper(),
            this.genNext(),
        ]);
    },
});
export default BaseSlideGroup.extend({
    name: 'v-slide-group',
    provide() {
        return {
            slideGroup: this,
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNsaWRlR3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WU2xpZGVHcm91cC9WU2xpZGVHcm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxvQkFBb0IsQ0FBQTtBQUUzQixhQUFhO0FBQ2IsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUVoRCxhQUFhO0FBQ2IsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBRXhELGFBQWE7QUFDYixPQUFPLE1BQU0sTUFBTSx5QkFBeUIsQ0FBQTtBQUM1QyxPQUFPLEtBQUssTUFBTSx3QkFBd0IsQ0FBQTtBQUUxQyxZQUFZO0FBQ1osT0FBTyxNQUFzQixNQUFNLG1CQUFtQixDQUFBO0FBdUJ0RCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUtsQyxhQUFhO0FBQ2Isb0JBQW9CO0NBQ3JCLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLGtCQUFrQjtJQUV4QixVQUFVLEVBQUU7UUFDVixNQUFNO1FBQ04sS0FBSztLQUNOO0lBRUQsS0FBSyxFQUFFO1FBQ0wsV0FBVyxFQUFFO1lBQ1gsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsc0JBQXNCO1NBQ2hDO1FBQ0QsWUFBWSxFQUFFLE9BQU87UUFDckIsUUFBUSxFQUFFO1lBQ1IsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsT0FBTztTQUNqQjtRQUNELGdCQUFnQixFQUFFO1lBQ2hCLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLElBQUk7WUFDYixTQUFTLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzQztR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QUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUE7QUFFRixlQUFlLGNBQWMsQ0FBQyxNQUFNLENBQUM7SUFDbkMsSUFBSSxFQUFFLGVBQWU7SUFFckIsT0FBTztRQUNMLE9BQU87WUFDTCxVQUFVLEVBQUUsSUFBSTtTQUNqQixDQUFBO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZTbGlkZUdyb3VwLnNhc3MnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWSWNvbiBmcm9tICcuLi9WSWNvbidcbmltcG9ydCB7IFZGYWRlVHJhbnNpdGlvbiB9IGZyb20gJy4uL3RyYW5zaXRpb25zJ1xuXG4vLyBFeHRlbnNpb25zXG5pbXBvcnQgeyBCYXNlSXRlbUdyb3VwIH0gZnJvbSAnLi4vVkl0ZW1Hcm91cC9WSXRlbUdyb3VwJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgUmVzaXplIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvcmVzaXplJ1xuaW1wb3J0IFRvdWNoIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvdG91Y2gnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucywgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgVnVlLCB7IFZOb2RlIH0gZnJvbSAndnVlJ1xuXG5pbnRlcmZhY2UgVG91Y2hFdmVudCB7XG4gIHRvdWNoc3RhcnRYOiBudW1iZXJcbiAgdG91Y2htb3ZlWDogbnVtYmVyXG4gIHN0b3BQcm9wYWdhdGlvbjogRnVuY3Rpb25cbn1cblxuaW50ZXJmYWNlIFdpZHRocyB7XG4gIGNvbnRlbnQ6IG51bWJlclxuICB3cmFwcGVyOiBudW1iZXJcbn1cblxuaW50ZXJmYWNlIG9wdGlvbnMgZXh0ZW5kcyBWdWUge1xuICAkcmVmczoge1xuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50XG4gICAgd3JhcHBlcjogSFRNTEVsZW1lbnRcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgQmFzZVNsaWRlR3JvdXAgPSBtaXhpbnM8b3B0aW9ucyAmXG4vKiBlc2xpbnQtZGlzYWJsZSBpbmRlbnQgKi9cbiAgRXh0cmFjdFZ1ZTx0eXBlb2YgQmFzZUl0ZW1Hcm91cD5cbi8qIGVzbGludC1lbmFibGUgaW5kZW50ICovXG4+KFxuICBCYXNlSXRlbUdyb3VwXG4gIC8qIEB2dWUvY29tcG9uZW50ICovXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICdiYXNlLXNsaWRlLWdyb3VwJyxcblxuICBkaXJlY3RpdmVzOiB7XG4gICAgUmVzaXplLFxuICAgIFRvdWNoLFxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgYWN0aXZlQ2xhc3M6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICd2LXNsaWRlLWl0ZW0tLWFjdGl2ZScsXG4gICAgfSxcbiAgICBjZW50ZXJBY3RpdmU6IEJvb2xlYW4sXG4gICAgbmV4dEljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckbmV4dCcsXG4gICAgfSxcbiAgICBtb2JpbGVCcmVha1BvaW50OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMTI2NCxcbiAgICAgIHZhbGlkYXRvcjogKHY6IGFueSkgPT4gIWlzTmFOKHBhcnNlSW50KHYpKSxcbiAgICB9LFxuICAgIHByZXZJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHByZXYnLFxuICAgIH0sXG4gICAgc2hvd0Fycm93czogQm9vbGVhbixcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGludGVybmFsSXRlbXNMZW5ndGg6IDAsXG4gICAgaXNPdmVyZmxvd2luZzogZmFsc2UsXG4gICAgcmVzaXplVGltZW91dDogMCxcbiAgICBzdGFydFg6IDAsXG4gICAgc2Nyb2xsT2Zmc2V0OiAwLFxuICAgIHdpZHRoczoge1xuICAgICAgY29udGVudDogMCxcbiAgICAgIHdyYXBwZXI6IDAsXG4gICAgfSxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBfX2NhY2hlZE5leHQgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLmdlblRyYW5zaXRpb24oJ25leHQnKVxuICAgIH0sXG4gICAgX19jYWNoZWRQcmV2ICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZW5UcmFuc2l0aW9uKCdwcmV2JylcbiAgICB9LFxuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5CYXNlSXRlbUdyb3VwLm9wdGlvbnMuY29tcHV0ZWQuY2xhc3Nlcy5jYWxsKHRoaXMpLFxuICAgICAgICAndi1zbGlkZS1ncm91cCc6IHRydWUsXG4gICAgICAgICd2LXNsaWRlLWdyb3VwLS1oYXMtYWZmaXhlcyc6IHRoaXMuaGFzQWZmaXhlcyxcbiAgICAgICAgJ3Ytc2xpZGUtZ3JvdXAtLWlzLW92ZXJmbG93aW5nJzogdGhpcy5pc092ZXJmbG93aW5nLFxuICAgICAgfVxuICAgIH0sXG4gICAgaGFzQWZmaXhlcyAoKTogQm9vbGVhbiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAodGhpcy5zaG93QXJyb3dzIHx8ICF0aGlzLmlzTW9iaWxlKSAmJlxuICAgICAgICB0aGlzLmlzT3ZlcmZsb3dpbmdcbiAgICAgIClcbiAgICB9LFxuICAgIGhhc05leHQgKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKCF0aGlzLmhhc0FmZml4ZXMpIHJldHVybiBmYWxzZVxuXG4gICAgICBjb25zdCB7IGNvbnRlbnQsIHdyYXBwZXIgfSA9IHRoaXMud2lkdGhzXG5cbiAgICAgIC8vIENoZWNrIG9uZSBzY3JvbGwgYWhlYWQgdG8ga25vdyB0aGUgd2lkdGggb2YgcmlnaHQtbW9zdCBpdGVtXG4gICAgICByZXR1cm4gY29udGVudCA+IE1hdGguYWJzKHRoaXMuc2Nyb2xsT2Zmc2V0KSArIHdyYXBwZXJcbiAgICB9LFxuICAgIGhhc1ByZXYgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuaGFzQWZmaXhlcyAmJiB0aGlzLnNjcm9sbE9mZnNldCAhPT0gMFxuICAgIH0sXG4gICAgaXNNb2JpbGUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuJHZ1ZXRpZnkuYnJlYWtwb2ludC53aWR0aCA8IHRoaXMubW9iaWxlQnJlYWtQb2ludFxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBpbnRlcm5hbFZhbHVlOiAnc2V0V2lkdGhzJyxcbiAgICAvLyBXaGVuIG92ZXJmbG93IGNoYW5nZXMsIHRoZSBhcnJvd3MgYWx0ZXJcbiAgICAvLyB0aGUgd2lkdGhzIG9mIHRoZSBjb250ZW50IGFuZCB3cmFwcGVyXG4gICAgLy8gYW5kIG5lZWQgdG8gYmUgcmVjYWxjdWxhdGVkXG4gICAgaXNPdmVyZmxvd2luZzogJ3NldFdpZHRocycsXG4gICAgc2Nyb2xsT2Zmc2V0ICh2YWwpIHtcbiAgICAgIHRoaXMuJHJlZnMuY29udGVudC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWCgkey12YWx9cHgpYFxuICAgIH0sXG4gIH0sXG5cbiAgYmVmb3JlVXBkYXRlICgpIHtcbiAgICB0aGlzLmludGVybmFsSXRlbXNMZW5ndGggPSAodGhpcy4kY2hpbGRyZW4gfHwgW10pLmxlbmd0aFxuICB9LFxuXG4gIHVwZGF0ZWQgKCkge1xuICAgIGlmICh0aGlzLmludGVybmFsSXRlbXNMZW5ndGggPT09ICh0aGlzLiRjaGlsZHJlbiB8fCBbXSkubGVuZ3RoKSByZXR1cm5cbiAgICB0aGlzLnNldFdpZHRocygpXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIC8vIEFsd2F5cyBnZW5lcmF0ZSBuZXh0IGZvciBzY3JvbGxhYmxlIGhpbnRcbiAgICBnZW5OZXh0ICgpOiBWTm9kZSB8IG51bGwge1xuICAgICAgY29uc3Qgc2xvdCA9IHRoaXMuJHNjb3BlZFNsb3RzLm5leHRcbiAgICAgICAgPyB0aGlzLiRzY29wZWRTbG90cy5uZXh0KHt9KVxuICAgICAgICA6IHRoaXMuJHNsb3RzLm5leHQgfHwgdGhpcy5fX2NhY2hlZE5leHRcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlLWdyb3VwX19uZXh0JyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1zbGlkZS1ncm91cF9fbmV4dC0tZGlzYWJsZWQnOiAhdGhpcy5oYXNOZXh0LFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrOiAoKSA9PiB0aGlzLm9uQWZmaXhDbGljaygnbmV4dCcpLFxuICAgICAgICB9LFxuICAgICAgICBrZXk6ICduZXh0JyxcbiAgICAgIH0sIFtzbG90XSlcbiAgICB9LFxuICAgIGdlbkNvbnRlbnQgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZS1ncm91cF9fY29udGVudCcsXG4gICAgICAgIHJlZjogJ2NvbnRlbnQnLFxuICAgICAgfSwgdGhpcy4kc2xvdHMuZGVmYXVsdClcbiAgICB9LFxuICAgIGdlbkRhdGEgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgIG5hbWU6ICdyZXNpemUnLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLm9uUmVzaXplLFxuICAgICAgICB9XSxcbiAgICAgIH1cbiAgICB9LFxuICAgIGdlbkljb24gKGxvY2F0aW9uOiAncHJldicgfCAnbmV4dCcpOiBWTm9kZSB8IG51bGwge1xuICAgICAgbGV0IGljb24gPSBsb2NhdGlvblxuXG4gICAgICBpZiAodGhpcy4kdnVldGlmeS5ydGwgJiYgbG9jYXRpb24gPT09ICdwcmV2Jykge1xuICAgICAgICBpY29uID0gJ25leHQnXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuJHZ1ZXRpZnkucnRsICYmIGxvY2F0aW9uID09PSAnbmV4dCcpIHtcbiAgICAgICAgaWNvbiA9ICdwcmV2J1xuICAgICAgfVxuXG4gICAgICBjb25zdCB1cHBlckxvY2F0aW9uID0gYCR7bG9jYXRpb25bMF0udG9VcHBlckNhc2UoKX0ke2xvY2F0aW9uLnNsaWNlKDEpfWBcbiAgICAgIGNvbnN0IGhhc0FmZml4ID0gKHRoaXMgYXMgYW55KVtgaGFzJHt1cHBlckxvY2F0aW9ufWBdXG5cbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuc2hvd0Fycm93cyAmJlxuICAgICAgICAhaGFzQWZmaXhcbiAgICAgICkgcmV0dXJuIG51bGxcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkljb24sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBkaXNhYmxlZDogIWhhc0FmZml4LFxuICAgICAgICB9LFxuICAgICAgfSwgKHRoaXMgYXMgYW55KVtgJHtpY29ufUljb25gXSlcbiAgICB9LFxuICAgIC8vIEFsd2F5cyBnZW5lcmF0ZSBwcmV2IGZvciBzY3JvbGxhYmxlIGhpbnRcbiAgICBnZW5QcmV2ICgpOiBWTm9kZSB8IG51bGwge1xuICAgICAgY29uc3Qgc2xvdCA9IHRoaXMuJHNjb3BlZFNsb3RzLnByZXZcbiAgICAgICAgPyB0aGlzLiRzY29wZWRTbG90cy5wcmV2KHt9KVxuICAgICAgICA6IHRoaXMuJHNsb3RzLnByZXYgfHwgdGhpcy5fX2NhY2hlZFByZXZcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlLWdyb3VwX19wcmV2JyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1zbGlkZS1ncm91cF9fcHJldi0tZGlzYWJsZWQnOiAhdGhpcy5oYXNQcmV2LFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrOiAoKSA9PiB0aGlzLm9uQWZmaXhDbGljaygncHJldicpLFxuICAgICAgICB9LFxuICAgICAgICBrZXk6ICdwcmV2JyxcbiAgICAgIH0sIFtzbG90XSlcbiAgICB9LFxuICAgIGdlblRyYW5zaXRpb24gKGxvY2F0aW9uOiAncHJldicgfCAnbmV4dCcpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZGYWRlVHJhbnNpdGlvbiwgW3RoaXMuZ2VuSWNvbihsb2NhdGlvbildKVxuICAgIH0sXG4gICAgZ2VuV3JhcHBlciAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlLWdyb3VwX193cmFwcGVyJyxcbiAgICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgICBuYW1lOiAndG91Y2gnLFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBzdGFydDogKGU6IFRvdWNoRXZlbnQpID0+IHRoaXMub3ZlcmZsb3dDaGVjayhlLCB0aGlzLm9uVG91Y2hTdGFydCksXG4gICAgICAgICAgICBtb3ZlOiAoZTogVG91Y2hFdmVudCkgPT4gdGhpcy5vdmVyZmxvd0NoZWNrKGUsIHRoaXMub25Ub3VjaE1vdmUpLFxuICAgICAgICAgICAgZW5kOiAoZTogVG91Y2hFdmVudCkgPT4gdGhpcy5vdmVyZmxvd0NoZWNrKGUsIHRoaXMub25Ub3VjaEVuZCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfV0sXG4gICAgICAgIHJlZjogJ3dyYXBwZXInLFxuICAgICAgfSwgW3RoaXMuZ2VuQ29udGVudCgpXSlcbiAgICB9LFxuICAgIGNhbGN1bGF0ZU5ld09mZnNldCAoZGlyZWN0aW9uOiAncHJldicgfCAnbmV4dCcsIHdpZHRoczogV2lkdGhzLCBydGw6IGJvb2xlYW4sIGN1cnJlbnRTY3JvbGxPZmZzZXQ6IG51bWJlcikge1xuICAgICAgY29uc3Qgc2lnbiA9IHJ0bCA/IC0xIDogMVxuICAgICAgY29uc3QgbmV3QWJvc2x1dGVPZmZzZXQgPSBzaWduICogY3VycmVudFNjcm9sbE9mZnNldCArXG4gICAgICAgIChkaXJlY3Rpb24gPT09ICdwcmV2JyA/IC0xIDogMSkgKiB3aWR0aHMud3JhcHBlclxuXG4gICAgICByZXR1cm4gc2lnbiAqIE1hdGgubWF4KE1hdGgubWluKG5ld0Fib3NsdXRlT2Zmc2V0LCB3aWR0aHMuY29udGVudCAtIHdpZHRocy53cmFwcGVyKSwgMClcbiAgICB9LFxuICAgIG9uQWZmaXhDbGljayAobG9jYXRpb246ICdwcmV2JyB8ICduZXh0Jykge1xuICAgICAgdGhpcy4kZW1pdChgY2xpY2s6JHtsb2NhdGlvbn1gKVxuICAgICAgdGhpcy5zY3JvbGxUbyhsb2NhdGlvbilcbiAgICB9LFxuICAgIG9uUmVzaXplICgpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVyblxuXG4gICAgICB0aGlzLnNldFdpZHRocygpXG4gICAgfSxcbiAgICBvblRvdWNoU3RhcnQgKGU6IFRvdWNoRXZlbnQpIHtcbiAgICAgIGNvbnN0IHsgY29udGVudCB9ID0gdGhpcy4kcmVmc1xuXG4gICAgICB0aGlzLnN0YXJ0WCA9IHRoaXMuc2Nyb2xsT2Zmc2V0ICsgZS50b3VjaHN0YXJ0WCBhcyBudW1iZXJcblxuICAgICAgY29udGVudC5zdHlsZS5zZXRQcm9wZXJ0eSgndHJhbnNpdGlvbicsICdub25lJylcbiAgICAgIGNvbnRlbnQuc3R5bGUuc2V0UHJvcGVydHkoJ3dpbGxDaGFuZ2UnLCAndHJhbnNmb3JtJylcbiAgICB9LFxuICAgIG9uVG91Y2hNb3ZlIChlOiBUb3VjaEV2ZW50KSB7XG4gICAgICB0aGlzLnNjcm9sbE9mZnNldCA9IHRoaXMuc3RhcnRYIC0gZS50b3VjaG1vdmVYXG4gICAgfSxcbiAgICBvblRvdWNoRW5kICgpIHtcbiAgICAgIGNvbnN0IHsgY29udGVudCwgd3JhcHBlciB9ID0gdGhpcy4kcmVmc1xuICAgICAgY29uc3QgbWF4U2Nyb2xsT2Zmc2V0ID0gY29udGVudC5jbGllbnRXaWR0aCAtIHdyYXBwZXIuY2xpZW50V2lkdGhcblxuICAgICAgY29udGVudC5zdHlsZS5zZXRQcm9wZXJ0eSgndHJhbnNpdGlvbicsIG51bGwpXG4gICAgICBjb250ZW50LnN0eWxlLnNldFByb3BlcnR5KCd3aWxsQ2hhbmdlJywgbnVsbClcblxuICAgICAgaWYgKHRoaXMuJHZ1ZXRpZnkucnRsKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgIGlmICh0aGlzLnNjcm9sbE9mZnNldCA+IDAgfHwgIXRoaXMuaXNPdmVyZmxvd2luZykge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsT2Zmc2V0ID0gMFxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2Nyb2xsT2Zmc2V0IDw9IC1tYXhTY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgICB0aGlzLnNjcm9sbE9mZnNldCA9IC1tYXhTY3JvbGxPZmZzZXRcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsT2Zmc2V0IDwgMCB8fCAhdGhpcy5pc092ZXJmbG93aW5nKSB7XG4gICAgICAgICAgdGhpcy5zY3JvbGxPZmZzZXQgPSAwXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zY3JvbGxPZmZzZXQgPj0gbWF4U2Nyb2xsT2Zmc2V0KSB7XG4gICAgICAgICAgdGhpcy5zY3JvbGxPZmZzZXQgPSBtYXhTY3JvbGxPZmZzZXRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgb3ZlcmZsb3dDaGVjayAoZTogVG91Y2hFdmVudCwgZm46IChlOiBUb3VjaEV2ZW50KSA9PiB2b2lkKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB0aGlzLmlzT3ZlcmZsb3dpbmcgJiYgZm4oZSlcbiAgICB9LFxuICAgIHNjcm9sbEludG9WaWV3IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovICgpIHtcbiAgICAgIGlmICghdGhpcy5zZWxlY3RlZEl0ZW0pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID09PSAwIHx8XG4gICAgICAgICghdGhpcy5jZW50ZXJBY3RpdmUgJiYgIXRoaXMuaXNPdmVyZmxvd2luZylcbiAgICAgICkge1xuICAgICAgICB0aGlzLnNjcm9sbE9mZnNldCA9IDBcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5jZW50ZXJBY3RpdmUpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxPZmZzZXQgPSB0aGlzLmNhbGN1bGF0ZUNlbnRlcmVkT2Zmc2V0KFxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtLiRlbCBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICB0aGlzLndpZHRocyxcbiAgICAgICAgICB0aGlzLiR2dWV0aWZ5LnJ0bFxuICAgICAgICApXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNPdmVyZmxvd2luZykge1xuICAgICAgICB0aGlzLnNjcm9sbE9mZnNldCA9IHRoaXMuY2FsY3VsYXRlVXBkYXRlZE9mZnNldChcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbS4kZWwgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgdGhpcy53aWR0aHMsXG4gICAgICAgICAgdGhpcy4kdnVldGlmeS5ydGwsXG4gICAgICAgICAgdGhpcy5zY3JvbGxPZmZzZXRcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0sXG4gICAgY2FsY3VsYXRlVXBkYXRlZE9mZnNldCAoc2VsZWN0ZWRFbGVtZW50OiBIVE1MRWxlbWVudCwgd2lkdGhzOiBXaWR0aHMsIHJ0bDogYm9vbGVhbiwgY3VycmVudFNjcm9sbE9mZnNldDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgIGNvbnN0IGNsaWVudFdpZHRoID0gc2VsZWN0ZWRFbGVtZW50LmNsaWVudFdpZHRoXG4gICAgICBjb25zdCBvZmZzZXRMZWZ0ID0gcnRsXG4gICAgICAgID8gKHdpZHRocy5jb250ZW50IC0gc2VsZWN0ZWRFbGVtZW50Lm9mZnNldExlZnQgLSBjbGllbnRXaWR0aClcbiAgICAgICAgOiBzZWxlY3RlZEVsZW1lbnQub2Zmc2V0TGVmdFxuXG4gICAgICBpZiAocnRsKSB7XG4gICAgICAgIGN1cnJlbnRTY3JvbGxPZmZzZXQgPSAtY3VycmVudFNjcm9sbE9mZnNldFxuICAgICAgfVxuXG4gICAgICBjb25zdCB0b3RhbFdpZHRoID0gd2lkdGhzLndyYXBwZXIgKyBjdXJyZW50U2Nyb2xsT2Zmc2V0XG4gICAgICBjb25zdCBpdGVtT2Zmc2V0ID0gY2xpZW50V2lkdGggKyBvZmZzZXRMZWZ0XG4gICAgICBjb25zdCBhZGRpdGlvbmFsT2Zmc2V0ID0gY2xpZW50V2lkdGggKiAwLjRcblxuICAgICAgaWYgKG9mZnNldExlZnQgPCBjdXJyZW50U2Nyb2xsT2Zmc2V0KSB7XG4gICAgICAgIGN1cnJlbnRTY3JvbGxPZmZzZXQgPSBNYXRoLm1heChvZmZzZXRMZWZ0IC0gYWRkaXRpb25hbE9mZnNldCwgMClcbiAgICAgIH0gZWxzZSBpZiAodG90YWxXaWR0aCA8IGl0ZW1PZmZzZXQpIHtcbiAgICAgICAgY3VycmVudFNjcm9sbE9mZnNldCA9IE1hdGgubWluKGN1cnJlbnRTY3JvbGxPZmZzZXQgLSAodG90YWxXaWR0aCAtIGl0ZW1PZmZzZXQgLSBhZGRpdGlvbmFsT2Zmc2V0KSwgd2lkdGhzLmNvbnRlbnQgLSB3aWR0aHMud3JhcHBlcilcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJ0bCA/IC1jdXJyZW50U2Nyb2xsT2Zmc2V0IDogY3VycmVudFNjcm9sbE9mZnNldFxuICAgIH0sXG4gICAgY2FsY3VsYXRlQ2VudGVyZWRPZmZzZXQgKHNlbGVjdGVkRWxlbWVudDogSFRNTEVsZW1lbnQsIHdpZHRoczogV2lkdGhzLCBydGw6IGJvb2xlYW4pOiBudW1iZXIge1xuICAgICAgY29uc3QgeyBvZmZzZXRMZWZ0LCBjbGllbnRXaWR0aCB9ID0gc2VsZWN0ZWRFbGVtZW50XG5cbiAgICAgIGlmIChydGwpIHtcbiAgICAgICAgY29uc3Qgb2Zmc2V0Q2VudGVyZWQgPSB3aWR0aHMuY29udGVudCAtIG9mZnNldExlZnQgLSBjbGllbnRXaWR0aCAvIDIgLSB3aWR0aHMud3JhcHBlciAvIDJcbiAgICAgICAgcmV0dXJuIC1NYXRoLm1pbih3aWR0aHMuY29udGVudCAtIHdpZHRocy53cmFwcGVyLCBNYXRoLm1heCgwLCBvZmZzZXRDZW50ZXJlZCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBvZmZzZXRDZW50ZXJlZCA9IG9mZnNldExlZnQgKyBjbGllbnRXaWR0aCAvIDIgLSB3aWR0aHMud3JhcHBlciAvIDJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKHdpZHRocy5jb250ZW50IC0gd2lkdGhzLndyYXBwZXIsIE1hdGgubWF4KDAsIG9mZnNldENlbnRlcmVkKSlcbiAgICAgIH1cbiAgICB9LFxuICAgIHNjcm9sbFRvIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIChsb2NhdGlvbjogJ3ByZXYnIHwgJ25leHQnKSB7XG4gICAgICB0aGlzLnNjcm9sbE9mZnNldCA9IHRoaXMuY2FsY3VsYXRlTmV3T2Zmc2V0KGxvY2F0aW9uLCB7XG4gICAgICAgIC8vIEZvcmNlIHJlZmxvd1xuICAgICAgICBjb250ZW50OiB0aGlzLiRyZWZzLmNvbnRlbnQgPyB0aGlzLiRyZWZzLmNvbnRlbnQuY2xpZW50V2lkdGggOiAwLFxuICAgICAgICB3cmFwcGVyOiB0aGlzLiRyZWZzLndyYXBwZXIgPyB0aGlzLiRyZWZzLndyYXBwZXIuY2xpZW50V2lkdGggOiAwLFxuICAgICAgfSwgdGhpcy4kdnVldGlmeS5ydGwsIHRoaXMuc2Nyb2xsT2Zmc2V0KVxuICAgIH0sXG4gICAgc2V0V2lkdGhzIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovICAoKSB7XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgY29uc3QgeyBjb250ZW50LCB3cmFwcGVyIH0gPSB0aGlzLiRyZWZzXG5cbiAgICAgICAgdGhpcy53aWR0aHMgPSB7XG4gICAgICAgICAgY29udGVudDogY29udGVudCA/IGNvbnRlbnQuY2xpZW50V2lkdGggOiAwLFxuICAgICAgICAgIHdyYXBwZXI6IHdyYXBwZXIgPyB3cmFwcGVyLmNsaWVudFdpZHRoIDogMCxcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaXNPdmVyZmxvd2luZyA9IHRoaXMud2lkdGhzLndyYXBwZXIgPCB0aGlzLndpZHRocy5jb250ZW50XG5cbiAgICAgICAgdGhpcy5zY3JvbGxJbnRvVmlldygpXG4gICAgICB9KVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKCdkaXYnLCB0aGlzLmdlbkRhdGEoKSwgW1xuICAgICAgdGhpcy5nZW5QcmV2KCksXG4gICAgICB0aGlzLmdlbldyYXBwZXIoKSxcbiAgICAgIHRoaXMuZ2VuTmV4dCgpLFxuICAgIF0pXG4gIH0sXG59KVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlU2xpZGVHcm91cC5leHRlbmQoe1xuICBuYW1lOiAndi1zbGlkZS1ncm91cCcsXG5cbiAgcHJvdmlkZSAoKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2xpZGVHcm91cDogdGhpcyxcbiAgICB9XG4gIH0sXG59KVxuIl19