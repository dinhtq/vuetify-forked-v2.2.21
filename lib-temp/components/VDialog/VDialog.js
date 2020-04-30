// Styles
import './VDialog.sass';
// Components
import { VThemeProvider } from '../VThemeProvider';
// Mixins
import Activatable from '../../mixins/activatable';
import Dependent from '../../mixins/dependent';
import Detachable from '../../mixins/detachable';
import Overlayable from '../../mixins/overlayable';
import Returnable from '../../mixins/returnable';
import Stackable from '../../mixins/stackable';
import Toggleable from '../../mixins/toggleable';
// Directives
import ClickOutside from '../../directives/click-outside';
// Helpers
import mixins from '../../util/mixins';
import { removed } from '../../util/console';
import { convertToUnit, keyCodes, } from '../../util/helpers';
const baseMixins = mixins(Activatable, Dependent, Detachable, Overlayable, Returnable, Stackable, Toggleable);
/* @vue/component */
export default baseMixins.extend({
    name: 'v-dialog',
    directives: { ClickOutside },
    props: {
        dark: Boolean,
        disabled: Boolean,
        fullscreen: Boolean,
        light: Boolean,
        maxWidth: {
            type: [String, Number],
            default: 'none',
        },
        noClickAnimation: Boolean,
        origin: {
            type: String,
            default: 'center center',
        },
        persistent: Boolean,
        retainFocus: {
            type: Boolean,
            default: true,
        },
        scrollable: Boolean,
        transition: {
            type: [String, Boolean],
            default: 'dialog-transition',
        },
        width: {
            type: [String, Number],
            default: 'auto',
        },
    },
    data() {
        return {
            activatedBy: null,
            animate: false,
            animateTimeout: -1,
            isActive: !!this.value,
            stackMinZIndex: 200,
        };
    },
    computed: {
        classes() {
            return {
                [(`v-dialog ${this.contentClass}`).trim()]: true,
                'v-dialog--active': this.isActive,
                'v-dialog--persistent': this.persistent,
                'v-dialog--fullscreen': this.fullscreen,
                'v-dialog--scrollable': this.scrollable,
                'v-dialog--animated': this.animate,
            };
        },
        contentClasses() {
            return {
                'v-dialog__content': true,
                'v-dialog__content--active': this.isActive,
            };
        },
        hasActivator() {
            return Boolean(!!this.$slots.activator ||
                !!this.$scopedSlots.activator);
        },
    },
    watch: {
        isActive(val) {
            if (val) {
                this.show();
                this.hideScroll();
            }
            else {
                this.removeOverlay();
                this.unbind();
            }
        },
        fullscreen(val) {
            if (!this.isActive)
                return;
            if (val) {
                this.hideScroll();
                this.removeOverlay(false);
            }
            else {
                this.showScroll();
                this.genOverlay();
            }
        },
    },
    created() {
        /* istanbul ignore next */
        if (this.$attrs.hasOwnProperty('full-width')) {
            removed('full-width', this);
        }
    },
    beforeMount() {
        this.$nextTick(() => {
            this.isBooted = this.isActive;
            this.isActive && this.show();
        });
    },
    beforeDestroy() {
        if (typeof window !== 'undefined')
            this.unbind();
    },
    methods: {
        animateClick() {
            this.animate = false;
            // Needed for when clicking very fast
            // outside of the dialog
            this.$nextTick(() => {
                this.animate = true;
                window.clearTimeout(this.animateTimeout);
                this.animateTimeout = window.setTimeout(() => (this.animate = false), 150);
            });
        },
        closeConditional(e) {
            const target = e.target;
            // Ignore the click if the dialog is closed or destroyed,
            // if it was on an element inside the content,
            // if it was dragged onto the overlay (#6969),
            // or if this isn't the topmost dialog (#9907)
            return !(this._isDestroyed ||
                !this.isActive ||
                this.$refs.content.contains(target) ||
                (this.overlay && target && !this.overlay.$el.contains(target))) && this.activeZIndex >= this.getMaxZIndex();
        },
        hideScroll() {
            if (this.fullscreen) {
                document.documentElement.classList.add('overflow-y-hidden');
            }
            else {
                Overlayable.options.methods.hideScroll.call(this);
            }
        },
        show() {
            !this.fullscreen && !this.hideOverlay && this.genOverlay();
            this.$nextTick(() => {
                this.$refs.content.focus();
                this.bind();
            });
        },
        bind() {
            window.addEventListener('focusin', this.onFocusin);
        },
        unbind() {
            window.removeEventListener('focusin', this.onFocusin);
        },
        onClickOutside(e) {
            this.$emit('click:outside', e);
            if (this.persistent) {
                this.noClickAnimation || this.animateClick();
            }
            else {
                this.isActive = false;
            }
        },
        onKeydown(e) {
            if (e.keyCode === keyCodes.esc && !this.getOpenDependents().length) {
                if (!this.persistent) {
                    this.isActive = false;
                    const activator = this.getActivator();
                    this.$nextTick(() => activator && activator.focus());
                }
                else if (!this.noClickAnimation) {
                    this.animateClick();
                }
            }
            this.$emit('keydown', e);
        },
        // On focus change, wrap focus to stay inside the dialog
        // https://github.com/vuetifyjs/vuetify/issues/6892
        onFocusin(e) {
            if (!e || !this.retainFocus)
                return;
            const target = e.target;
            if (!!target &&
                // It isn't the document or the dialog body
                ![document, this.$refs.content].includes(target) &&
                // It isn't inside the dialog body
                !this.$refs.content.contains(target) &&
                // We're the topmost dialog
                this.activeZIndex >= this.getMaxZIndex() &&
                // It isn't inside a dependent element (like a menu)
                !this.getOpenDependentElements().some(el => el.contains(target))
            // So we must have focused something outside the dialog and its children
            ) {
                // Find and focus the first available element inside the dialog
                const focusable = this.$refs.content.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                focusable.length && focusable[0].focus();
            }
        },
        genContent() {
            return this.showLazyContent(() => [
                this.$createElement(VThemeProvider, {
                    props: {
                        root: true,
                        light: this.light,
                        dark: this.dark,
                    },
                }, [
                    this.$createElement('div', {
                        class: this.contentClasses,
                        attrs: {
                            role: 'document',
                            tabindex: this.isActive ? 0 : undefined,
                            ...this.getScopeIdAttrs(),
                        },
                        on: { keydown: this.onKeydown },
                        style: { zIndex: this.activeZIndex },
                        ref: 'content',
                    }, [this.genTransition()]),
                ]),
            ]);
        },
        genTransition() {
            const content = this.genInnerContent();
            if (!this.transition)
                return content;
            return this.$createElement('transition', {
                props: {
                    name: this.transition,
                    origin: this.origin,
                    appear: true,
                },
            }, [content]);
        },
        genInnerContent() {
            const data = {
                class: this.classes,
                ref: 'dialog',
                directives: [
                    {
                        name: 'click-outside',
                        value: this.onClickOutside,
                        args: {
                            closeConditional: this.closeConditional,
                            include: this.getOpenDependentElements,
                        },
                    },
                    { name: 'show', value: this.isActive },
                ],
                style: {
                    transformOrigin: this.origin,
                },
            };
            if (!this.fullscreen) {
                data.style = {
                    ...data.style,
                    maxWidth: this.maxWidth === 'none' ? undefined : convertToUnit(this.maxWidth),
                    width: this.width === 'auto' ? undefined : convertToUnit(this.width),
                };
            }
            return this.$createElement('div', data, this.getContentSlot());
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-dialog__container',
            class: {
                'v-dialog__container--attached': this.attach === '' ||
                    this.attach === true ||
                    this.attach === 'attach',
            },
            attrs: { role: 'dialog' },
        }, [
            this.genActivator(),
            this.genContent(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZEaWFsb2cvVkRpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxnQkFBZ0IsQ0FBQTtBQUV2QixhQUFhO0FBQ2IsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBRWxELFNBQVM7QUFDVCxPQUFPLFdBQVcsTUFBTSwwQkFBMEIsQ0FBQTtBQUNsRCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFdBQVcsTUFBTSwwQkFBMEIsQ0FBQTtBQUNsRCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUVoRCxhQUFhO0FBQ2IsT0FBTyxZQUFZLE1BQU0sZ0NBQWdDLENBQUE7QUFFekQsVUFBVTtBQUNWLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUM1QyxPQUFPLEVBQ0wsYUFBYSxFQUNiLFFBQVEsR0FDVCxNQUFNLG9CQUFvQixDQUFBO0FBSzNCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsV0FBVyxFQUNYLFNBQVMsRUFDVCxVQUFVLEVBQ1YsV0FBVyxFQUNYLFVBQVUsRUFDVixTQUFTLEVBQ1QsVUFBVSxDQUNYLENBQUE7QUFFRCxvQkFBb0I7QUFDcEIsZUFBZSxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQy9CLElBQUksRUFBRSxVQUFVO0lBRWhCLFVBQVUsRUFBRSxFQUFFLFlBQVksRUFBRTtJQUU1QixLQUFLLEVBQUU7UUFDTCxJQUFJLEVBQUUsT0FBTztRQUNiLFFBQVEsRUFBRSxPQUFPO1FBQ2pC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LENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDN0UsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2lCQUNyRSxDQUFBO2FBQ0Y7WUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQTtRQUNoRSxDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUNkLFdBQVcsRUFBRSxxQkFBcUI7WUFDbEMsS0FBSyxFQUFFO2dCQUNMLCtCQUErQixFQUM3QixJQUFJLENBQUMsTUFBTSxLQUFLLEVBQUU7b0JBQ2xCLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSTtvQkFDcEIsSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRO2FBQzNCO1lBQ0QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtTQUMxQixFQUFFO1lBQ0QsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLENBQUMsVUFBVSxFQUFFO1NBQ2xCLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WRGlhbG9nLnNhc3MnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCB7IFZUaGVtZVByb3ZpZGVyIH0gZnJvbSAnLi4vVlRoZW1lUHJvdmlkZXInXG5cbi8vIE1peGluc1xuaW1wb3J0IEFjdGl2YXRhYmxlIGZyb20gJy4uLy4uL21peGlucy9hY3RpdmF0YWJsZSdcbmltcG9ydCBEZXBlbmRlbnQgZnJvbSAnLi4vLi4vbWl4aW5zL2RlcGVuZGVudCdcbmltcG9ydCBEZXRhY2hhYmxlIGZyb20gJy4uLy4uL21peGlucy9kZXRhY2hhYmxlJ1xuaW1wb3J0IE92ZXJsYXlhYmxlIGZyb20gJy4uLy4uL21peGlucy9vdmVybGF5YWJsZSdcbmltcG9ydCBSZXR1cm5hYmxlIGZyb20gJy4uLy4uL21peGlucy9yZXR1cm5hYmxlJ1xuaW1wb3J0IFN0YWNrYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvc3RhY2thYmxlJ1xuaW1wb3J0IFRvZ2dsZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RvZ2dsZWFibGUnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBDbGlja091dHNpZGUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9jbGljay1vdXRzaWRlJ1xuXG4vLyBIZWxwZXJzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgcmVtb3ZlZCB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcbmltcG9ydCB7XG4gIGNvbnZlcnRUb1VuaXQsXG4gIGtleUNvZGVzLFxufSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgVk5vZGVEYXRhIH0gZnJvbSAndnVlJ1xuXG5jb25zdCBiYXNlTWl4aW5zID0gbWl4aW5zKFxuICBBY3RpdmF0YWJsZSxcbiAgRGVwZW5kZW50LFxuICBEZXRhY2hhYmxlLFxuICBPdmVybGF5YWJsZSxcbiAgUmV0dXJuYWJsZSxcbiAgU3RhY2thYmxlLFxuICBUb2dnbGVhYmxlXG4pXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWRpYWxvZycsXG5cbiAgZGlyZWN0aXZlczogeyBDbGlja091dHNpZGUgfSxcblxuICBwcm9wczoge1xuICAgIGRhcms6IEJvb2xlYW4sXG4gICAgZGlzYWJsZWQ6IEJvb2xlYW4sXG4gICAgZnVsbHNjcmVlbjogQm9vbGVhbixcbiAgICBsaWdodDogQm9vbGVhbixcbiAgICBtYXhXaWR0aDoge1xuICAgICAgdHlwZTogW1N0cmluZywgTnVtYmVyXSxcbiAgICAgIGRlZmF1bHQ6ICdub25lJyxcbiAgICB9LFxuICAgIG5vQ2xpY2tBbmltYXRpb246IEJvb2xlYW4sXG4gICAgb3JpZ2luOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnY2VudGVyIGNlbnRlcicsXG4gICAgfSxcbiAgICBwZXJzaXN0ZW50OiBCb29sZWFuLFxuICAgIHJldGFpbkZvY3VzOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIHNjcm9sbGFibGU6IEJvb2xlYW4sXG4gICAgdHJhbnNpdGlvbjoge1xuICAgICAgdHlwZTogW1N0cmluZywgQm9vbGVhbl0sXG4gICAgICBkZWZhdWx0OiAnZGlhbG9nLXRyYW5zaXRpb24nLFxuICAgIH0sXG4gICAgd2lkdGg6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIE51bWJlcl0sXG4gICAgICBkZWZhdWx0OiAnYXV0bycsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYWN0aXZhdGVkQnk6IG51bGwgYXMgRXZlbnRUYXJnZXQgfCBudWxsLFxuICAgICAgYW5pbWF0ZTogZmFsc2UsXG4gICAgICBhbmltYXRlVGltZW91dDogLTEsXG4gICAgICBpc0FjdGl2ZTogISF0aGlzLnZhbHVlLFxuICAgICAgc3RhY2tNaW5aSW5kZXg6IDIwMCxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgWyhgdi1kaWFsb2cgJHt0aGlzLmNvbnRlbnRDbGFzc31gKS50cmltKCldOiB0cnVlLFxuICAgICAgICAndi1kaWFsb2ctLWFjdGl2ZSc6IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgICd2LWRpYWxvZy0tcGVyc2lzdGVudCc6IHRoaXMucGVyc2lzdGVudCxcbiAgICAgICAgJ3YtZGlhbG9nLS1mdWxsc2NyZWVuJzogdGhpcy5mdWxsc2NyZWVuLFxuICAgICAgICAndi1kaWFsb2ctLXNjcm9sbGFibGUnOiB0aGlzLnNjcm9sbGFibGUsXG4gICAgICAgICd2LWRpYWxvZy0tYW5pbWF0ZWQnOiB0aGlzLmFuaW1hdGUsXG4gICAgICB9XG4gICAgfSxcbiAgICBjb250ZW50Q2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LWRpYWxvZ19fY29udGVudCc6IHRydWUsXG4gICAgICAgICd2LWRpYWxvZ19fY29udGVudC0tYWN0aXZlJzogdGhpcy5pc0FjdGl2ZSxcbiAgICAgIH1cbiAgICB9LFxuICAgIGhhc0FjdGl2YXRvciAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gQm9vbGVhbihcbiAgICAgICAgISF0aGlzLiRzbG90cy5hY3RpdmF0b3IgfHxcbiAgICAgICAgISF0aGlzLiRzY29wZWRTbG90cy5hY3RpdmF0b3JcbiAgICAgIClcbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgaXNBY3RpdmUgKHZhbCkge1xuICAgICAgaWYgKHZhbCkge1xuICAgICAgICB0aGlzLnNob3coKVxuICAgICAgICB0aGlzLmhpZGVTY3JvbGwoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW1vdmVPdmVybGF5KClcbiAgICAgICAgdGhpcy51bmJpbmQoKVxuICAgICAgfVxuICAgIH0sXG4gICAgZnVsbHNjcmVlbiAodmFsKSB7XG4gICAgICBpZiAoIXRoaXMuaXNBY3RpdmUpIHJldHVyblxuXG4gICAgICBpZiAodmFsKSB7XG4gICAgICAgIHRoaXMuaGlkZVNjcm9sbCgpXG4gICAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheShmYWxzZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2hvd1Njcm9sbCgpXG4gICAgICAgIHRoaXMuZ2VuT3ZlcmxheSgpXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICh0aGlzLiRhdHRycy5oYXNPd25Qcm9wZXJ0eSgnZnVsbC13aWR0aCcpKSB7XG4gICAgICByZW1vdmVkKCdmdWxsLXdpZHRoJywgdGhpcylcbiAgICB9XG4gIH0sXG5cbiAgYmVmb3JlTW91bnQgKCkge1xuICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgIHRoaXMuaXNCb290ZWQgPSB0aGlzLmlzQWN0aXZlXG4gICAgICB0aGlzLmlzQWN0aXZlICYmIHRoaXMuc2hvdygpXG4gICAgfSlcbiAgfSxcblxuICBiZWZvcmVEZXN0cm95ICgpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHRoaXMudW5iaW5kKClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgYW5pbWF0ZUNsaWNrICgpIHtcbiAgICAgIHRoaXMuYW5pbWF0ZSA9IGZhbHNlXG4gICAgICAvLyBOZWVkZWQgZm9yIHdoZW4gY2xpY2tpbmcgdmVyeSBmYXN0XG4gICAgICAvLyBvdXRzaWRlIG9mIHRoZSBkaWFsb2dcbiAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgdGhpcy5hbmltYXRlID0gdHJ1ZVxuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuYW5pbWF0ZVRpbWVvdXQpXG4gICAgICAgIHRoaXMuYW5pbWF0ZVRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiAodGhpcy5hbmltYXRlID0gZmFsc2UpLCAxNTApXG4gICAgICB9KVxuICAgIH0sXG4gICAgY2xvc2VDb25kaXRpb25hbCAoZTogRXZlbnQpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50XG4gICAgICAvLyBJZ25vcmUgdGhlIGNsaWNrIGlmIHRoZSBkaWFsb2cgaXMgY2xvc2VkIG9yIGRlc3Ryb3llZCxcbiAgICAgIC8vIGlmIGl0IHdhcyBvbiBhbiBlbGVtZW50IGluc2lkZSB0aGUgY29udGVudCxcbiAgICAgIC8vIGlmIGl0IHdhcyBkcmFnZ2VkIG9udG8gdGhlIG92ZXJsYXkgKCM2OTY5KSxcbiAgICAgIC8vIG9yIGlmIHRoaXMgaXNuJ3QgdGhlIHRvcG1vc3QgZGlhbG9nICgjOTkwNylcbiAgICAgIHJldHVybiAhKFxuICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCB8fFxuICAgICAgICAhdGhpcy5pc0FjdGl2ZSB8fFxuICAgICAgICB0aGlzLiRyZWZzLmNvbnRlbnQuY29udGFpbnModGFyZ2V0KSB8fFxuICAgICAgICAodGhpcy5vdmVybGF5ICYmIHRhcmdldCAmJiAhdGhpcy5vdmVybGF5LiRlbC5jb250YWlucyh0YXJnZXQpKVxuICAgICAgKSAmJiB0aGlzLmFjdGl2ZVpJbmRleCA+PSB0aGlzLmdldE1heFpJbmRleCgpXG4gICAgfSxcbiAgICBoaWRlU2Nyb2xsICgpIHtcbiAgICAgIGlmICh0aGlzLmZ1bGxzY3JlZW4pIHtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ292ZXJmbG93LXktaGlkZGVuJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE92ZXJsYXlhYmxlLm9wdGlvbnMubWV0aG9kcy5oaWRlU2Nyb2xsLmNhbGwodGhpcylcbiAgICAgIH1cbiAgICB9LFxuICAgIHNob3cgKCkge1xuICAgICAgIXRoaXMuZnVsbHNjcmVlbiAmJiAhdGhpcy5oaWRlT3ZlcmxheSAmJiB0aGlzLmdlbk92ZXJsYXkoKVxuICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICB0aGlzLiRyZWZzLmNvbnRlbnQuZm9jdXMoKVxuICAgICAgICB0aGlzLmJpbmQoKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGJpbmQgKCkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCB0aGlzLm9uRm9jdXNpbilcbiAgICB9LFxuICAgIHVuYmluZCAoKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIHRoaXMub25Gb2N1c2luKVxuICAgIH0sXG4gICAgb25DbGlja091dHNpZGUgKGU6IEV2ZW50KSB7XG4gICAgICB0aGlzLiRlbWl0KCdjbGljazpvdXRzaWRlJywgZSlcblxuICAgICAgaWYgKHRoaXMucGVyc2lzdGVudCkge1xuICAgICAgICB0aGlzLm5vQ2xpY2tBbmltYXRpb24gfHwgdGhpcy5hbmltYXRlQ2xpY2soKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICBvbktleWRvd24gKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IGtleUNvZGVzLmVzYyAmJiAhdGhpcy5nZXRPcGVuRGVwZW5kZW50cygpLmxlbmd0aCkge1xuICAgICAgICBpZiAoIXRoaXMucGVyc2lzdGVudCkge1xuICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZVxuICAgICAgICAgIGNvbnN0IGFjdGl2YXRvciA9IHRoaXMuZ2V0QWN0aXZhdG9yKClcbiAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiBhY3RpdmF0b3IgJiYgKGFjdGl2YXRvciBhcyBIVE1MRWxlbWVudCkuZm9jdXMoKSlcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5ub0NsaWNrQW5pbWF0aW9uKSB7XG4gICAgICAgICAgdGhpcy5hbmltYXRlQ2xpY2soKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLiRlbWl0KCdrZXlkb3duJywgZSlcbiAgICB9LFxuICAgIC8vIE9uIGZvY3VzIGNoYW5nZSwgd3JhcCBmb2N1cyB0byBzdGF5IGluc2lkZSB0aGUgZGlhbG9nXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZXRpZnlqcy92dWV0aWZ5L2lzc3Vlcy82ODkyXG4gICAgb25Gb2N1c2luIChlOiBFdmVudCkge1xuICAgICAgaWYgKCFlIHx8ICF0aGlzLnJldGFpbkZvY3VzKSByZXR1cm5cblxuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnRcblxuICAgICAgaWYgKFxuICAgICAgICAhIXRhcmdldCAmJlxuICAgICAgICAvLyBJdCBpc24ndCB0aGUgZG9jdW1lbnQgb3IgdGhlIGRpYWxvZyBib2R5XG4gICAgICAgICFbZG9jdW1lbnQsIHRoaXMuJHJlZnMuY29udGVudF0uaW5jbHVkZXModGFyZ2V0KSAmJlxuICAgICAgICAvLyBJdCBpc24ndCBpbnNpZGUgdGhlIGRpYWxvZyBib2R5XG4gICAgICAgICF0aGlzLiRyZWZzLmNvbnRlbnQuY29udGFpbnModGFyZ2V0KSAmJlxuICAgICAgICAvLyBXZSdyZSB0aGUgdG9wbW9zdCBkaWFsb2dcbiAgICAgICAgdGhpcy5hY3RpdmVaSW5kZXggPj0gdGhpcy5nZXRNYXhaSW5kZXgoKSAmJlxuICAgICAgICAvLyBJdCBpc24ndCBpbnNpZGUgYSBkZXBlbmRlbnQgZWxlbWVudCAobGlrZSBhIG1lbnUpXG4gICAgICAgICF0aGlzLmdldE9wZW5EZXBlbmRlbnRFbGVtZW50cygpLnNvbWUoZWwgPT4gZWwuY29udGFpbnModGFyZ2V0KSlcbiAgICAgICAgLy8gU28gd2UgbXVzdCBoYXZlIGZvY3VzZWQgc29tZXRoaW5nIG91dHNpZGUgdGhlIGRpYWxvZyBhbmQgaXRzIGNoaWxkcmVuXG4gICAgICApIHtcbiAgICAgICAgLy8gRmluZCBhbmQgZm9jdXMgdGhlIGZpcnN0IGF2YWlsYWJsZSBlbGVtZW50IGluc2lkZSB0aGUgZGlhbG9nXG4gICAgICAgIGNvbnN0IGZvY3VzYWJsZSA9IHRoaXMuJHJlZnMuY29udGVudC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24sIFtocmVmXSwgaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEsIFt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKScpXG4gICAgICAgIGZvY3VzYWJsZS5sZW5ndGggJiYgKGZvY3VzYWJsZVswXSBhcyBIVE1MRWxlbWVudCkuZm9jdXMoKVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaG93TGF6eUNvbnRlbnQoKCkgPT4gW1xuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KFZUaGVtZVByb3ZpZGVyLCB7XG4gICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHJvb3Q6IHRydWUsXG4gICAgICAgICAgICBsaWdodDogdGhpcy5saWdodCxcbiAgICAgICAgICAgIGRhcms6IHRoaXMuZGFyayxcbiAgICAgICAgICB9LFxuICAgICAgICB9LCBbXG4gICAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAgY2xhc3M6IHRoaXMuY29udGVudENsYXNzZXMsXG4gICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICByb2xlOiAnZG9jdW1lbnQnLFxuICAgICAgICAgICAgICB0YWJpbmRleDogdGhpcy5pc0FjdGl2ZSA/IDAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgIC4uLnRoaXMuZ2V0U2NvcGVJZEF0dHJzKCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb246IHsga2V5ZG93bjogdGhpcy5vbktleWRvd24gfSxcbiAgICAgICAgICAgIHN0eWxlOiB7IHpJbmRleDogdGhpcy5hY3RpdmVaSW5kZXggfSxcbiAgICAgICAgICAgIHJlZjogJ2NvbnRlbnQnLFxuICAgICAgICAgIH0sIFt0aGlzLmdlblRyYW5zaXRpb24oKV0pLFxuICAgICAgICBdKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5UcmFuc2l0aW9uICgpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdlbklubmVyQ29udGVudCgpXG5cbiAgICAgIGlmICghdGhpcy50cmFuc2l0aW9uKSByZXR1cm4gY29udGVudFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgndHJhbnNpdGlvbicsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBuYW1lOiB0aGlzLnRyYW5zaXRpb24sXG4gICAgICAgICAgb3JpZ2luOiB0aGlzLm9yaWdpbixcbiAgICAgICAgICBhcHBlYXI6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LCBbY29udGVudF0pXG4gICAgfSxcbiAgICBnZW5Jbm5lckNvbnRlbnQgKCkge1xuICAgICAgY29uc3QgZGF0YTogVk5vZGVEYXRhID0ge1xuICAgICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgICByZWY6ICdkaWFsb2cnLFxuICAgICAgICBkaXJlY3RpdmVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ2NsaWNrLW91dHNpZGUnLFxuICAgICAgICAgICAgdmFsdWU6IHRoaXMub25DbGlja091dHNpZGUsXG4gICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgIGNsb3NlQ29uZGl0aW9uYWw6IHRoaXMuY2xvc2VDb25kaXRpb25hbCxcbiAgICAgICAgICAgICAgaW5jbHVkZTogdGhpcy5nZXRPcGVuRGVwZW5kZW50RWxlbWVudHMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0gYXMgYW55LFxuICAgICAgICAgIHsgbmFtZTogJ3Nob3cnLCB2YWx1ZTogdGhpcy5pc0FjdGl2ZSB9LFxuICAgICAgICBdLFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIHRyYW5zZm9ybU9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5mdWxsc2NyZWVuKSB7XG4gICAgICAgIGRhdGEuc3R5bGUgPSB7XG4gICAgICAgICAgLi4uZGF0YS5zdHlsZSBhcyBvYmplY3QsXG4gICAgICAgICAgbWF4V2lkdGg6IHRoaXMubWF4V2lkdGggPT09ICdub25lJyA/IHVuZGVmaW5lZCA6IGNvbnZlcnRUb1VuaXQodGhpcy5tYXhXaWR0aCksXG4gICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGggPT09ICdhdXRvJyA/IHVuZGVmaW5lZCA6IGNvbnZlcnRUb1VuaXQodGhpcy53aWR0aCksXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIGRhdGEsIHRoaXMuZ2V0Q29udGVudFNsb3QoKSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LWRpYWxvZ19fY29udGFpbmVyJyxcbiAgICAgIGNsYXNzOiB7XG4gICAgICAgICd2LWRpYWxvZ19fY29udGFpbmVyLS1hdHRhY2hlZCc6XG4gICAgICAgICAgdGhpcy5hdHRhY2ggPT09ICcnIHx8XG4gICAgICAgICAgdGhpcy5hdHRhY2ggPT09IHRydWUgfHxcbiAgICAgICAgICB0aGlzLmF0dGFjaCA9PT0gJ2F0dGFjaCcsXG4gICAgICB9LFxuICAgICAgYXR0cnM6IHsgcm9sZTogJ2RpYWxvZycgfSxcbiAgICB9LCBbXG4gICAgICB0aGlzLmdlbkFjdGl2YXRvcigpLFxuICAgICAgdGhpcy5nZW5Db250ZW50KCksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=