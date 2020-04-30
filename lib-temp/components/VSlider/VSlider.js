import './VSlider.sass';
// Components
import VInput from '../VInput';
import { VScaleTransition } from '../transitions';
// Mixins
import mixins from '../../util/mixins';
import Loadable from '../../mixins/loadable';
// Directives
import ClickOutside from '../../directives/click-outside';
// Helpers
import { addOnceEventListener, deepEqual, keyCodes, createRange, convertToUnit, passiveSupported } from '../../util/helpers';
import { consoleWarn } from '../../util/console';
export default mixins(VInput, Loadable
/* @vue/component */
).extend({
    name: 'v-slider',
    directives: {
        ClickOutside,
    },
    mixins: [Loadable],
    props: {
        disabled: Boolean,
        inverseLabel: Boolean,
        max: {
            type: [Number, String],
            default: 100,
        },
        min: {
            type: [Number, String],
            default: 0,
        },
        step: {
            type: [Number, String],
            default: 1,
        },
        thumbColor: String,
        thumbLabel: {
            type: [Boolean, String],
            default: undefined,
            validator: v => typeof v === 'boolean' || v === 'always',
        },
        thumbSize: {
            type: [Number, String],
            default: 32,
        },
        tickLabels: {
            type: Array,
            default: () => ([]),
        },
        ticks: {
            type: [Boolean, String],
            default: false,
            validator: v => typeof v === 'boolean' || v === 'always',
        },
        tickSize: {
            type: [Number, String],
            default: 2,
        },
        trackColor: String,
        trackFillColor: String,
        value: [Number, String],
        vertical: Boolean,
    },
    data: () => ({
        app: null,
        oldValue: null,
        keyPressed: 0,
        isFocused: false,
        isActive: false,
        noClick: false,
    }),
    computed: {
        classes() {
            return {
                ...VInput.options.computed.classes.call(this),
                'v-input__slider': true,
                'v-input__slider--vertical': this.vertical,
                'v-input__slider--inverse-label': this.inverseLabel,
            };
        },
        internalValue: {
            get() {
                return this.lazyValue;
            },
            set(val) {
                val = isNaN(val) ? this.minValue : val;
                // Round value to ensure the
                // entire slider range can
                // be selected with step
                const value = this.roundValue(Math.min(Math.max(val, this.minValue), this.maxValue));
                if (value === this.lazyValue)
                    return;
                this.lazyValue = value;
                this.$emit('input', value);
            },
        },
        trackTransition() {
            return this.keyPressed >= 2 ? 'none' : '';
        },
        minValue() {
            return parseFloat(this.min);
        },
        maxValue() {
            return parseFloat(this.max);
        },
        stepNumeric() {
            return this.step > 0 ? parseFloat(this.step) : 0;
        },
        inputWidth() {
            const value = (this.roundValue(this.internalValue) - this.minValue) / (this.maxValue - this.minValue) * 100;
            return value;
        },
        trackFillStyles() {
            const startDir = this.vertical ? 'bottom' : 'left';
            const endDir = this.vertical ? 'top' : 'right';
            const valueDir = this.vertical ? 'height' : 'width';
            const start = this.$vuetify.rtl ? 'auto' : '0';
            const end = this.$vuetify.rtl ? '0' : 'auto';
            const value = this.disabled ? `calc(${this.inputWidth}% - 10px)` : `${this.inputWidth}%`;
            return {
                transition: this.trackTransition,
                [startDir]: start,
                [endDir]: end,
                [valueDir]: value,
            };
        },
        trackStyles() {
            const startDir = this.vertical ? this.$vuetify.rtl ? 'bottom' : 'top' : this.$vuetify.rtl ? 'left' : 'right';
            const endDir = this.vertical ? 'height' : 'width';
            const start = '0px';
            const end = this.disabled ? `calc(${100 - this.inputWidth}% - 10px)` : `calc(${100 - this.inputWidth}%)`;
            return {
                transition: this.trackTransition,
                [startDir]: start,
                [endDir]: end,
            };
        },
        showTicks() {
            return this.tickLabels.length > 0 ||
                !!(!this.disabled && this.stepNumeric && this.ticks);
        },
        numTicks() {
            return Math.ceil((this.maxValue - this.minValue) / this.stepNumeric);
        },
        showThumbLabel() {
            return !this.disabled && !!(this.thumbLabel ||
                this.$scopedSlots['thumb-label']);
        },
        computedTrackColor() {
            if (this.disabled)
                return undefined;
            if (this.trackColor)
                return this.trackColor;
            if (this.isDark)
                return this.validationState;
            return this.validationState || 'primary lighten-3';
        },
        computedTrackFillColor() {
            if (this.disabled)
                return undefined;
            if (this.trackFillColor)
                return this.trackFillColor;
            return this.validationState || this.computedColor;
        },
        computedThumbColor() {
            if (this.thumbColor)
                return this.thumbColor;
            return this.validationState || this.computedColor;
        },
    },
    watch: {
        min(val) {
            const parsed = parseFloat(val);
            parsed > this.internalValue && this.$emit('input', parsed);
        },
        max(val) {
            const parsed = parseFloat(val);
            parsed < this.internalValue && this.$emit('input', parsed);
        },
        value: {
            handler(v) {
                this.internalValue = v;
            },
        },
    },
    // If done in as immediate in
    // value watcher, causes issues
    // with vue-test-utils
    beforeMount() {
        this.internalValue = this.value;
    },
    mounted() {
        // Without a v-app, iOS does not work with body selectors
        this.app = document.querySelector('[data-app]') ||
            consoleWarn('Missing v-app or a non-body wrapping element with the [data-app] attribute', this);
    },
    methods: {
        genDefaultSlot() {
            const children = [this.genLabel()];
            const slider = this.genSlider();
            this.inverseLabel
                ? children.unshift(slider)
                : children.push(slider);
            children.push(this.genProgress());
            return children;
        },
        genSlider() {
            return this.$createElement('div', {
                class: {
                    'v-slider': true,
                    'v-slider--horizontal': !this.vertical,
                    'v-slider--vertical': this.vertical,
                    'v-slider--focused': this.isFocused,
                    'v-slider--active': this.isActive,
                    'v-slider--disabled': this.disabled,
                    'v-slider--readonly': this.readonly,
                    ...this.themeClasses,
                },
                directives: [{
                        name: 'click-outside',
                        value: this.onBlur,
                    }],
                on: {
                    click: this.onSliderClick,
                },
            }, this.genChildren());
        },
        genChildren() {
            return [
                this.genInput(),
                this.genTrackContainer(),
                this.genSteps(),
                this.genThumbContainer(this.internalValue, this.inputWidth, this.isActive, this.isFocused, this.onThumbMouseDown, this.onFocus, this.onBlur),
            ];
        },
        genInput() {
            return this.$createElement('input', {
                attrs: {
                    value: this.internalValue,
                    id: this.computedId,
                    disabled: this.disabled,
                    readonly: true,
                    tabindex: -1,
                    ...this.$attrs,
                },
            });
        },
        genTrackContainer() {
            const children = [
                this.$createElement('div', this.setBackgroundColor(this.computedTrackColor, {
                    staticClass: 'v-slider__track-background',
                    style: this.trackStyles,
                })),
                this.$createElement('div', this.setBackgroundColor(this.computedTrackFillColor, {
                    staticClass: 'v-slider__track-fill',
                    style: this.trackFillStyles,
                })),
            ];
            return this.$createElement('div', {
                staticClass: 'v-slider__track-container',
                ref: 'track',
            }, children);
        },
        genSteps() {
            if (!this.step || !this.showTicks)
                return null;
            const tickSize = parseFloat(this.tickSize);
            const range = createRange(this.numTicks + 1);
            const direction = this.vertical ? 'bottom' : 'left';
            const offsetDirection = this.vertical ? 'right' : 'top';
            if (this.vertical)
                range.reverse();
            const ticks = range.map(i => {
                const index = this.$vuetify.rtl ? this.maxValue - i : i;
                const children = [];
                if (this.tickLabels[index]) {
                    children.push(this.$createElement('div', {
                        staticClass: 'v-slider__tick-label',
                    }, this.tickLabels[index]));
                }
                const width = i * (100 / this.numTicks);
                const filled = this.$vuetify.rtl ? (100 - this.inputWidth) < width : width < this.inputWidth;
                return this.$createElement('span', {
                    key: i,
                    staticClass: 'v-slider__tick',
                    class: {
                        'v-slider__tick--filled': filled,
                    },
                    style: {
                        width: `${tickSize}px`,
                        height: `${tickSize}px`,
                        [direction]: `calc(${width}% - ${tickSize / 2}px)`,
                        [offsetDirection]: `calc(50% - ${tickSize / 2}px)`,
                    },
                }, children);
            });
            return this.$createElement('div', {
                staticClass: 'v-slider__ticks-container',
                class: {
                    'v-slider__ticks-container--always-show': this.ticks === 'always' || this.tickLabels.length > 0,
                },
            }, ticks);
        },
        genThumbContainer(value, valueWidth, isActive, isFocused, onDrag, onFocus, onBlur, ref = 'thumb') {
            const children = [this.genThumb()];
            const thumbLabelContent = this.genThumbLabelContent(value);
            this.showThumbLabel && children.push(this.genThumbLabel(thumbLabelContent));
            return this.$createElement('div', this.setTextColor(this.computedThumbColor, {
                ref,
                staticClass: 'v-slider__thumb-container',
                class: {
                    'v-slider__thumb-container--active': isActive,
                    'v-slider__thumb-container--focused': isFocused,
                    'v-slider__thumb-container--show-label': this.showThumbLabel,
                },
                style: this.getThumbContainerStyles(valueWidth),
                attrs: {
                    role: 'slider',
                    tabindex: this.disabled || this.readonly ? -1 : this.$attrs.tabindex ? this.$attrs.tabindex : 0,
                    'aria-label': this.label,
                    'aria-valuemin': this.min,
                    'aria-valuemax': this.max,
                    'aria-valuenow': this.internalValue,
                    'aria-readonly': String(this.readonly),
                    'aria-orientation': this.vertical ? 'vertical' : 'horizontal',
                    ...this.$attrs,
                },
                on: {
                    focus: onFocus,
                    blur: onBlur,
                    keydown: this.onKeyDown,
                    keyup: this.onKeyUp,
                    touchstart: onDrag,
                    mousedown: onDrag,
                },
            }), children);
        },
        genThumbLabelContent(value) {
            return this.$scopedSlots['thumb-label']
                ? this.$scopedSlots['thumb-label']({ value })
                : [this.$createElement('span', [String(value)])];
        },
        genThumbLabel(content) {
            const size = convertToUnit(this.thumbSize);
            const transform = this.vertical
                ? `translateY(20%) translateY(${(Number(this.thumbSize) / 3) - 1}px) translateX(55%) rotate(135deg)`
                : `translateY(-20%) translateY(-12px) translateX(-50%) rotate(45deg)`;
            return this.$createElement(VScaleTransition, {
                props: { origin: 'bottom center' },
            }, [
                this.$createElement('div', {
                    staticClass: 'v-slider__thumb-label-container',
                    directives: [{
                            name: 'show',
                            value: this.isFocused || this.isActive || this.thumbLabel === 'always',
                        }],
                }, [
                    this.$createElement('div', this.setBackgroundColor(this.computedThumbColor, {
                        staticClass: 'v-slider__thumb-label',
                        style: {
                            height: size,
                            width: size,
                            transform,
                        },
                    }), [this.$createElement('div', content)]),
                ]),
            ]);
        },
        genThumb() {
            return this.$createElement('div', this.setBackgroundColor(this.computedThumbColor, {
                staticClass: 'v-slider__thumb',
            }));
        },
        getThumbContainerStyles(width) {
            const direction = this.vertical ? 'top' : 'left';
            let value = this.$vuetify.rtl ? 100 - width : width;
            value = this.vertical ? 100 - value : value;
            return {
                transition: this.trackTransition,
                [direction]: `${value}%`,
            };
        },
        onThumbMouseDown(e) {
            e.preventDefault();
            this.oldValue = this.internalValue;
            this.keyPressed = 2;
            this.isActive = true;
            const mouseUpOptions = passiveSupported ? { passive: true, capture: true } : true;
            const mouseMoveOptions = passiveSupported ? { passive: true } : false;
            if ('touches' in e) {
                this.app.addEventListener('touchmove', this.onMouseMove, mouseMoveOptions);
                addOnceEventListener(this.app, 'touchend', this.onSliderMouseUp, mouseUpOptions);
            }
            else {
                this.app.addEventListener('mousemove', this.onMouseMove, mouseMoveOptions);
                addOnceEventListener(this.app, 'mouseup', this.onSliderMouseUp, mouseUpOptions);
            }
            this.$emit('start', this.internalValue);
        },
        onSliderMouseUp(e) {
            e.stopPropagation();
            this.keyPressed = 0;
            const mouseMoveOptions = passiveSupported ? { passive: true } : false;
            this.app.removeEventListener('touchmove', this.onMouseMove, mouseMoveOptions);
            this.app.removeEventListener('mousemove', this.onMouseMove, mouseMoveOptions);
            this.$emit('end', this.internalValue);
            if (!deepEqual(this.oldValue, this.internalValue)) {
                this.$emit('change', this.internalValue);
                this.noClick = true;
            }
            this.isActive = false;
        },
        onMouseMove(e) {
            const { value } = this.parseMouseMove(e);
            this.internalValue = value;
        },
        onKeyDown(e) {
            if (this.disabled || this.readonly)
                return;
            const value = this.parseKeyDown(e, this.internalValue);
            if (value == null)
                return;
            this.internalValue = value;
            this.$emit('change', value);
        },
        onKeyUp() {
            this.keyPressed = 0;
        },
        onSliderClick(e) {
            if (this.noClick) {
                this.noClick = false;
                return;
            }
            const thumb = this.$refs.thumb;
            thumb.focus();
            this.onMouseMove(e);
            this.$emit('change', this.internalValue);
        },
        onBlur(e) {
            this.isFocused = false;
            this.$emit('blur', e);
        },
        onFocus(e) {
            this.isFocused = true;
            this.$emit('focus', e);
        },
        parseMouseMove(e) {
            const start = this.vertical ? 'top' : 'left';
            const length = this.vertical ? 'height' : 'width';
            const click = this.vertical ? 'clientY' : 'clientX';
            const { [start]: trackStart, [length]: trackLength, } = this.$refs.track.getBoundingClientRect();
            const clickOffset = 'touches' in e ? e.touches[0][click] : e[click]; // Can we get rid of any here?
            // It is possible for left to be NaN, force to number
            let clickPos = Math.min(Math.max((clickOffset - trackStart) / trackLength, 0), 1) || 0;
            if (this.vertical)
                clickPos = 1 - clickPos;
            if (this.$vuetify.rtl)
                clickPos = 1 - clickPos;
            const isInsideTrack = clickOffset >= trackStart && clickOffset <= trackStart + trackLength;
            const value = parseFloat(this.min) + clickPos * (this.maxValue - this.minValue);
            return { value, isInsideTrack };
        },
        parseKeyDown(e, value) {
            if (this.disabled)
                return;
            const { pageup, pagedown, end, home, left, right, down, up } = keyCodes;
            if (![pageup, pagedown, end, home, left, right, down, up].includes(e.keyCode))
                return;
            e.preventDefault();
            const step = this.stepNumeric || 1;
            const steps = (this.maxValue - this.minValue) / step;
            if ([left, right, down, up].includes(e.keyCode)) {
                this.keyPressed += 1;
                const increase = this.$vuetify.rtl ? [left, up] : [right, up];
                const direction = increase.includes(e.keyCode) ? 1 : -1;
                const multiplier = e.shiftKey ? 3 : (e.ctrlKey ? 2 : 1);
                value = value + (direction * step * multiplier);
            }
            else if (e.keyCode === home) {
                value = this.minValue;
            }
            else if (e.keyCode === end) {
                value = this.maxValue;
            }
            else {
                const direction = e.keyCode === pagedown ? 1 : -1;
                value = value - (direction * step * (steps > 100 ? steps / 10 : 10));
            }
            return value;
        },
        roundValue(value) {
            if (!this.stepNumeric)
                return value;
            // Format input value using the same number
            // of decimals places as in the step prop
            const trimmedStep = this.step.toString().trim();
            const decimals = trimmedStep.indexOf('.') > -1
                ? (trimmedStep.length - trimmedStep.indexOf('.') - 1)
                : 0;
            const offset = this.minValue % this.stepNumeric;
            const newValue = Math.round((value - offset) / this.stepNumeric) * this.stepNumeric + offset;
            return parseFloat(Math.min(newValue, this.maxValue).toFixed(decimals));
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNsaWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZTbGlkZXIvVlNsaWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGdCQUFnQixDQUFBO0FBRXZCLGFBQWE7QUFDYixPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUE7QUFDOUIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFakQsU0FBUztBQUNULE9BQU8sTUFBc0IsTUFBTSxtQkFBbUIsQ0FBQTtBQUN0RCxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUU1QyxhQUFhO0FBQ2IsT0FBTyxZQUFZLE1BQU0sZ0NBQWdDLENBQUE7QUFFekQsVUFBVTtBQUNWLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUM1SCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFZaEQsZUFBZSxNQUFNLENBUW5CLE1BQU0sRUFDTixRQUFRO0FBQ1Ysb0JBQW9CO0NBQ25CLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLFVBQVU7SUFFaEIsVUFBVSxFQUFFO1FBQ1YsWUFBWTtLQUNiO0lBRUQsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDO0lBRWxCLEtBQUssRUFBRTtRQUNMLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFlBQVksRUFBRSxPQUFPO1FBQ3JCLEdBQUcsRUFBRTtZQUNILElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLEdBQUc7U0FDYjtRQUNELEdBQUcsRUFBRTtZQUNILElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELElBQUksRUFBRTtZQUNKLElB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QUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLENBQUM7UUFDRCxRQUFRO1lBQ04sT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdCLENBQUM7UUFDRCxXQUFXO1lBQ1QsT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xELENBQUM7UUFDRCxVQUFVO1lBQ1IsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUE7WUFFM0csT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDO1FBQ0QsZUFBZTtZQUNiLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFBO1lBQ2xELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO1lBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO1lBRW5ELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtZQUM5QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUE7WUFDNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENB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TUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFBO1lBRTVGLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtRQUN4RSxDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vVlNsaWRlci5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVklucHV0IGZyb20gJy4uL1ZJbnB1dCdcbmltcG9ydCB7IFZTY2FsZVRyYW5zaXRpb24gfSBmcm9tICcuLi90cmFuc2l0aW9ucydcblxuLy8gTWl4aW5zXG5pbXBvcnQgbWl4aW5zLCB7IEV4dHJhY3RWdWUgfSBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCBMb2FkYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvbG9hZGFibGUnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBDbGlja091dHNpZGUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9jbGljay1vdXRzaWRlJ1xuXG4vLyBIZWxwZXJzXG5pbXBvcnQgeyBhZGRPbmNlRXZlbnRMaXN0ZW5lciwgZGVlcEVxdWFsLCBrZXlDb2RlcywgY3JlYXRlUmFuZ2UsIGNvbnZlcnRUb1VuaXQsIHBhc3NpdmVTdXBwb3J0ZWQgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgeyBjb25zb2xlV2FybiB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gVHlwZXNcbmltcG9ydCBWdWUsIHsgVk5vZGUsIFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzLCBQcm9wVHlwZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFNjb3BlZFNsb3RDaGlsZHJlbiB9IGZyb20gJ3Z1ZS90eXBlcy92bm9kZSdcblxuaW50ZXJmYWNlIG9wdGlvbnMgZXh0ZW5kcyBWdWUge1xuICAkcmVmczoge1xuICAgIHRyYWNrOiBIVE1MRWxlbWVudFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1peGluczxvcHRpb25zICZcbi8qIGVzbGludC1kaXNhYmxlIGluZGVudCAqL1xuICBFeHRyYWN0VnVlPFtcbiAgICB0eXBlb2YgVklucHV0LFxuICAgIHR5cGVvZiBMb2FkYWJsZVxuICBdPlxuLyogZXNsaW50LWVuYWJsZSBpbmRlbnQgKi9cbj4oXG4gIFZJbnB1dCxcbiAgTG9hZGFibGVcbi8qIEB2dWUvY29tcG9uZW50ICovXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LXNsaWRlcicsXG5cbiAgZGlyZWN0aXZlczoge1xuICAgIENsaWNrT3V0c2lkZSxcbiAgfSxcblxuICBtaXhpbnM6IFtMb2FkYWJsZV0sXG5cbiAgcHJvcHM6IHtcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICBpbnZlcnNlTGFiZWw6IEJvb2xlYW4sXG4gICAgbWF4OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMTAwLFxuICAgIH0sXG4gICAgbWluOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICAgIHN0ZXA6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAxLFxuICAgIH0sXG4gICAgdGh1bWJDb2xvcjogU3RyaW5nLFxuICAgIHRodW1iTGFiZWw6IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBTdHJpbmddIGFzIFByb3BUeXBlPGJvb2xlYW4gfCAnYWx3YXlzJyB8IHVuZGVmaW5lZD4sXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWQsXG4gICAgICB2YWxpZGF0b3I6IHYgPT4gdHlwZW9mIHYgPT09ICdib29sZWFuJyB8fCB2ID09PSAnYWx3YXlzJyxcbiAgICB9LFxuICAgIHRodW1iU2l6ZToge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDMyLFxuICAgIH0sXG4gICAgdGlja0xhYmVsczoge1xuICAgICAgdHlwZTogQXJyYXkgYXMgUHJvcFR5cGU8c3RyaW5nW10+LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKFtdKSxcbiAgICB9LFxuICAgIHRpY2tzOiB7XG4gICAgICB0eXBlOiBbQm9vbGVhbiwgU3RyaW5nXSBhcyBQcm9wVHlwZTxib29sZWFuIHwgJ2Fsd2F5cyc+LFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB2YWxpZGF0b3I6IHYgPT4gdHlwZW9mIHYgPT09ICdib29sZWFuJyB8fCB2ID09PSAnYWx3YXlzJyxcbiAgICB9LFxuICAgIHRpY2tTaXplOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMixcbiAgICB9LFxuICAgIHRyYWNrQ29sb3I6IFN0cmluZyxcbiAgICB0cmFja0ZpbGxDb2xvcjogU3RyaW5nLFxuICAgIHZhbHVlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgIHZlcnRpY2FsOiBCb29sZWFuLFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgYXBwOiBudWxsIGFzIGFueSxcbiAgICBvbGRWYWx1ZTogbnVsbCBhcyBhbnksXG4gICAga2V5UHJlc3NlZDogMCxcbiAgICBpc0ZvY3VzZWQ6IGZhbHNlLFxuICAgIGlzQWN0aXZlOiBmYWxzZSxcbiAgICBub0NsaWNrOiBmYWxzZSwgLy8gUHJldmVudCBjbGljayBldmVudCBpZiBkcmFnZ2luZyB0b29rIHBsYWNlLCBoYWNrIGZvciAjNzkxNVxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5WSW5wdXQub3B0aW9ucy5jb21wdXRlZC5jbGFzc2VzLmNhbGwodGhpcyksXG4gICAgICAgICd2LWlucHV0X19zbGlkZXInOiB0cnVlLFxuICAgICAgICAndi1pbnB1dF9fc2xpZGVyLS12ZXJ0aWNhbCc6IHRoaXMudmVydGljYWwsXG4gICAgICAgICd2LWlucHV0X19zbGlkZXItLWludmVyc2UtbGFiZWwnOiB0aGlzLmludmVyc2VMYWJlbCxcbiAgICAgIH1cbiAgICB9LFxuICAgIGludGVybmFsVmFsdWU6IHtcbiAgICAgIGdldCAoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGF6eVZhbHVlXG4gICAgICB9LFxuICAgICAgc2V0ICh2YWw6IG51bWJlcikge1xuICAgICAgICB2YWwgPSBpc05hTih2YWwpID8gdGhpcy5taW5WYWx1ZSA6IHZhbFxuICAgICAgICAvLyBSb3VuZCB2YWx1ZSB0byBlbnN1cmUgdGhlXG4gICAgICAgIC8vIGVudGlyZSBzbGlkZXIgcmFuZ2UgY2FuXG4gICAgICAgIC8vIGJlIHNlbGVjdGVkIHdpdGggc3RlcFxuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucm91bmRWYWx1ZShNYXRoLm1pbihNYXRoLm1heCh2YWwsIHRoaXMubWluVmFsdWUpLCB0aGlzLm1heFZhbHVlKSlcblxuICAgICAgICBpZiAodmFsdWUgPT09IHRoaXMubGF6eVZhbHVlKSByZXR1cm5cblxuICAgICAgICB0aGlzLmxhenlWYWx1ZSA9IHZhbHVlXG5cbiAgICAgICAgdGhpcy4kZW1pdCgnaW5wdXQnLCB2YWx1ZSlcbiAgICAgIH0sXG4gICAgfSxcbiAgICB0cmFja1RyYW5zaXRpb24gKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gdGhpcy5rZXlQcmVzc2VkID49IDIgPyAnbm9uZScgOiAnJ1xuICAgIH0sXG4gICAgbWluVmFsdWUgKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLm1pbilcbiAgICB9LFxuICAgIG1heFZhbHVlICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5tYXgpXG4gICAgfSxcbiAgICBzdGVwTnVtZXJpYyAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLnN0ZXAgPiAwID8gcGFyc2VGbG9hdCh0aGlzLnN0ZXApIDogMFxuICAgIH0sXG4gICAgaW5wdXRXaWR0aCAoKTogbnVtYmVyIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gKHRoaXMucm91bmRWYWx1ZSh0aGlzLmludGVybmFsVmFsdWUpIC0gdGhpcy5taW5WYWx1ZSkgLyAodGhpcy5tYXhWYWx1ZSAtIHRoaXMubWluVmFsdWUpICogMTAwXG5cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH0sXG4gICAgdHJhY2tGaWxsU3R5bGVzICgpOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+IHtcbiAgICAgIGNvbnN0IHN0YXJ0RGlyID0gdGhpcy52ZXJ0aWNhbCA/ICdib3R0b20nIDogJ2xlZnQnXG4gICAgICBjb25zdCBlbmREaXIgPSB0aGlzLnZlcnRpY2FsID8gJ3RvcCcgOiAncmlnaHQnXG4gICAgICBjb25zdCB2YWx1ZURpciA9IHRoaXMudmVydGljYWwgPyAnaGVpZ2h0JyA6ICd3aWR0aCdcblxuICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLiR2dWV0aWZ5LnJ0bCA/ICdhdXRvJyA6ICcwJ1xuICAgICAgY29uc3QgZW5kID0gdGhpcy4kdnVldGlmeS5ydGwgPyAnMCcgOiAnYXV0bydcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5kaXNhYmxlZCA/IGBjYWxjKCR7dGhpcy5pbnB1dFdpZHRofSUgLSAxMHB4KWAgOiBgJHt0aGlzLmlucHV0V2lkdGh9JWBcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNpdGlvbjogdGhpcy50cmFja1RyYW5zaXRpb24sXG4gICAgICAgIFtzdGFydERpcl06IHN0YXJ0LFxuICAgICAgICBbZW5kRGlyXTogZW5kLFxuICAgICAgICBbdmFsdWVEaXJdOiB2YWx1ZSxcbiAgICAgIH1cbiAgICB9LFxuICAgIHRyYWNrU3R5bGVzICgpOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+IHtcbiAgICAgIGNvbnN0IHN0YXJ0RGlyID0gdGhpcy52ZXJ0aWNhbCA/IHRoaXMuJHZ1ZXRpZnkucnRsID8gJ2JvdHRvbScgOiAndG9wJyA6IHRoaXMuJHZ1ZXRpZnkucnRsID8gJ2xlZnQnIDogJ3JpZ2h0J1xuICAgICAgY29uc3QgZW5kRGlyID0gdGhpcy52ZXJ0aWNhbCA/ICdoZWlnaHQnIDogJ3dpZHRoJ1xuXG4gICAgICBjb25zdCBzdGFydCA9ICcwcHgnXG4gICAgICBjb25zdCBlbmQgPSB0aGlzLmRpc2FibGVkID8gYGNhbGMoJHsxMDAgLSB0aGlzLmlucHV0V2lkdGh9JSAtIDEwcHgpYCA6IGBjYWxjKCR7MTAwIC0gdGhpcy5pbnB1dFdpZHRofSUpYFxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLnRyYWNrVHJhbnNpdGlvbixcbiAgICAgICAgW3N0YXJ0RGlyXTogc3RhcnQsXG4gICAgICAgIFtlbmREaXJdOiBlbmQsXG4gICAgICB9XG4gICAgfSxcbiAgICBzaG93VGlja3MgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMudGlja0xhYmVscy5sZW5ndGggPiAwIHx8XG4gICAgICAgICEhKCF0aGlzLmRpc2FibGVkICYmIHRoaXMuc3RlcE51bWVyaWMgJiYgdGhpcy50aWNrcylcbiAgICB9LFxuICAgIG51bVRpY2tzICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIE1hdGguY2VpbCgodGhpcy5tYXhWYWx1ZSAtIHRoaXMubWluVmFsdWUpIC8gdGhpcy5zdGVwTnVtZXJpYylcbiAgICB9LFxuICAgIHNob3dUaHVtYkxhYmVsICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAhdGhpcy5kaXNhYmxlZCAmJiAhIShcbiAgICAgICAgdGhpcy50aHVtYkxhYmVsIHx8XG4gICAgICAgIHRoaXMuJHNjb3BlZFNsb3RzWyd0aHVtYi1sYWJlbCddXG4gICAgICApXG4gICAgfSxcbiAgICBjb21wdXRlZFRyYWNrQ29sb3IgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgaWYgKHRoaXMudHJhY2tDb2xvcikgcmV0dXJuIHRoaXMudHJhY2tDb2xvclxuICAgICAgaWYgKHRoaXMuaXNEYXJrKSByZXR1cm4gdGhpcy52YWxpZGF0aW9uU3RhdGVcbiAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRpb25TdGF0ZSB8fCAncHJpbWFyeSBsaWdodGVuLTMnXG4gICAgfSxcbiAgICBjb21wdXRlZFRyYWNrRmlsbENvbG9yICgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybiB1bmRlZmluZWRcbiAgICAgIGlmICh0aGlzLnRyYWNrRmlsbENvbG9yKSByZXR1cm4gdGhpcy50cmFja0ZpbGxDb2xvclxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGlvblN0YXRlIHx8IHRoaXMuY29tcHV0ZWRDb2xvclxuICAgIH0sXG4gICAgY29tcHV0ZWRUaHVtYkNvbG9yICgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgaWYgKHRoaXMudGh1bWJDb2xvcikgcmV0dXJuIHRoaXMudGh1bWJDb2xvclxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGlvblN0YXRlIHx8IHRoaXMuY29tcHV0ZWRDb2xvclxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBtaW4gKHZhbCkge1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VGbG9hdCh2YWwpXG4gICAgICBwYXJzZWQgPiB0aGlzLmludGVybmFsVmFsdWUgJiYgdGhpcy4kZW1pdCgnaW5wdXQnLCBwYXJzZWQpXG4gICAgfSxcbiAgICBtYXggKHZhbCkge1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VGbG9hdCh2YWwpXG4gICAgICBwYXJzZWQgPCB0aGlzLmludGVybmFsVmFsdWUgJiYgdGhpcy4kZW1pdCgnaW5wdXQnLCBwYXJzZWQpXG4gICAgfSxcbiAgICB2YWx1ZToge1xuICAgICAgaGFuZGxlciAodjogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHZcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICAvLyBJZiBkb25lIGluIGFzIGltbWVkaWF0ZSBpblxuICAvLyB2YWx1ZSB3YXRjaGVyLCBjYXVzZXMgaXNzdWVzXG4gIC8vIHdpdGggdnVlLXRlc3QtdXRpbHNcbiAgYmVmb3JlTW91bnQgKCkge1xuICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHRoaXMudmFsdWVcbiAgfSxcblxuICBtb3VudGVkICgpIHtcbiAgICAvLyBXaXRob3V0IGEgdi1hcHAsIGlPUyBkb2VzIG5vdCB3b3JrIHdpdGggYm9keSBzZWxlY3RvcnNcbiAgICB0aGlzLmFwcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFwcF0nKSB8fFxuICAgICAgY29uc29sZVdhcm4oJ01pc3Npbmcgdi1hcHAgb3IgYSBub24tYm9keSB3cmFwcGluZyBlbGVtZW50IHdpdGggdGhlIFtkYXRhLWFwcF0gYXR0cmlidXRlJywgdGhpcylcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuRGVmYXVsdFNsb3QgKCk6IFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuOiBWTm9kZUNoaWxkcmVuQXJyYXlDb250ZW50cyA9IFt0aGlzLmdlbkxhYmVsKCldXG4gICAgICBjb25zdCBzbGlkZXIgPSB0aGlzLmdlblNsaWRlcigpXG4gICAgICB0aGlzLmludmVyc2VMYWJlbFxuICAgICAgICA/IGNoaWxkcmVuLnVuc2hpZnQoc2xpZGVyKVxuICAgICAgICA6IGNoaWxkcmVuLnB1c2goc2xpZGVyKVxuXG4gICAgICBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuUHJvZ3Jlc3MoKSlcblxuICAgICAgcmV0dXJuIGNoaWxkcmVuXG4gICAgfSxcbiAgICBnZW5TbGlkZXIgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3Ytc2xpZGVyJzogdHJ1ZSxcbiAgICAgICAgICAndi1zbGlkZXItLWhvcml6b250YWwnOiAhdGhpcy52ZXJ0aWNhbCxcbiAgICAgICAgICAndi1zbGlkZXItLXZlcnRpY2FsJzogdGhpcy52ZXJ0aWNhbCxcbiAgICAgICAgICAndi1zbGlkZXItLWZvY3VzZWQnOiB0aGlzLmlzRm9jdXNlZCxcbiAgICAgICAgICAndi1zbGlkZXItLWFjdGl2ZSc6IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgICAgJ3Ytc2xpZGVyLS1kaXNhYmxlZCc6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgJ3Ytc2xpZGVyLS1yZWFkb25seSc6IHRoaXMucmVhZG9ubHksXG4gICAgICAgICAgLi4udGhpcy50aGVtZUNsYXNzZXMsXG4gICAgICAgIH0sXG4gICAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgICAgbmFtZTogJ2NsaWNrLW91dHNpZGUnLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLm9uQmx1cixcbiAgICAgICAgfV0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6IHRoaXMub25TbGlkZXJDbGljayxcbiAgICAgICAgfSxcbiAgICAgIH0sIHRoaXMuZ2VuQ2hpbGRyZW4oKSlcbiAgICB9LFxuICAgIGdlbkNoaWxkcmVuICgpOiBWTm9kZUNoaWxkcmVuQXJyYXlDb250ZW50cyB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB0aGlzLmdlbklucHV0KCksXG4gICAgICAgIHRoaXMuZ2VuVHJhY2tDb250YWluZXIoKSxcbiAgICAgICAgdGhpcy5nZW5TdGVwcygpLFxuICAgICAgICB0aGlzLmdlblRodW1iQ29udGFpbmVyKFxuICAgICAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSxcbiAgICAgICAgICB0aGlzLmlucHV0V2lkdGgsXG4gICAgICAgICAgdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgICB0aGlzLmlzRm9jdXNlZCxcbiAgICAgICAgICB0aGlzLm9uVGh1bWJNb3VzZURvd24sXG4gICAgICAgICAgdGhpcy5vbkZvY3VzLFxuICAgICAgICAgIHRoaXMub25CbHVyLFxuICAgICAgICApLFxuICAgICAgXVxuICAgIH0sXG4gICAgZ2VuSW5wdXQgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5pbnRlcm5hbFZhbHVlLFxuICAgICAgICAgIGlkOiB0aGlzLmNvbXB1dGVkSWQsXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgcmVhZG9ubHk6IHRydWUsXG4gICAgICAgICAgdGFiaW5kZXg6IC0xLFxuICAgICAgICAgIC4uLnRoaXMuJGF0dHJzLFxuICAgICAgICB9LFxuICAgICAgICAvLyBvbjogdGhpcy5nZW5MaXN0ZW5lcnMoKSwgLy8gVE9ETzogZG8gd2UgbmVlZCB0byBhdHRhY2ggdGhlIGxpc3RlbmVycyB0byBpbnB1dD9cbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5UcmFja0NvbnRhaW5lciAoKTogVk5vZGUge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29tcHV0ZWRUcmFja0NvbG9yLCB7XG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlcl9fdHJhY2stYmFja2dyb3VuZCcsXG4gICAgICAgICAgc3R5bGU6IHRoaXMudHJhY2tTdHlsZXMsXG4gICAgICAgIH0pKSxcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IodGhpcy5jb21wdXRlZFRyYWNrRmlsbENvbG9yLCB7XG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlcl9fdHJhY2stZmlsbCcsXG4gICAgICAgICAgc3R5bGU6IHRoaXMudHJhY2tGaWxsU3R5bGVzLFxuICAgICAgICB9KSksXG4gICAgICBdXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZXJfX3RyYWNrLWNvbnRhaW5lcicsXG4gICAgICAgIHJlZjogJ3RyYWNrJyxcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuU3RlcHMgKCk6IFZOb2RlIHwgbnVsbCB7XG4gICAgICBpZiAoIXRoaXMuc3RlcCB8fCAhdGhpcy5zaG93VGlja3MpIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IHRpY2tTaXplID0gcGFyc2VGbG9hdCh0aGlzLnRpY2tTaXplKVxuICAgICAgY29uc3QgcmFuZ2UgPSBjcmVhdGVSYW5nZSh0aGlzLm51bVRpY2tzICsgMSlcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMudmVydGljYWwgPyAnYm90dG9tJyA6ICdsZWZ0J1xuICAgICAgY29uc3Qgb2Zmc2V0RGlyZWN0aW9uID0gdGhpcy52ZXJ0aWNhbCA/ICdyaWdodCcgOiAndG9wJ1xuXG4gICAgICBpZiAodGhpcy52ZXJ0aWNhbCkgcmFuZ2UucmV2ZXJzZSgpXG5cbiAgICAgIGNvbnN0IHRpY2tzID0gcmFuZ2UubWFwKGkgPT4ge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuJHZ1ZXRpZnkucnRsID8gdGhpcy5tYXhWYWx1ZSAtIGkgOiBpXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gW11cblxuICAgICAgICBpZiAodGhpcy50aWNrTGFiZWxzW2luZGV4XSkge1xuICAgICAgICAgIGNoaWxkcmVuLnB1c2godGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlcl9fdGljay1sYWJlbCcsXG4gICAgICAgICAgfSwgdGhpcy50aWNrTGFiZWxzW2luZGV4XSkpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3aWR0aCA9IGkgKiAoMTAwIC8gdGhpcy5udW1UaWNrcylcbiAgICAgICAgY29uc3QgZmlsbGVkID0gdGhpcy4kdnVldGlmeS5ydGwgPyAoMTAwIC0gdGhpcy5pbnB1dFdpZHRoKSA8IHdpZHRoIDogd2lkdGggPCB0aGlzLmlucHV0V2lkdGhcblxuICAgICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnc3BhbicsIHtcbiAgICAgICAgICBrZXk6IGksXG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlcl9fdGljaycsXG4gICAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAgICd2LXNsaWRlcl9fdGljay0tZmlsbGVkJzogZmlsbGVkLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgIHdpZHRoOiBgJHt0aWNrU2l6ZX1weGAsXG4gICAgICAgICAgICBoZWlnaHQ6IGAke3RpY2tTaXplfXB4YCxcbiAgICAgICAgICAgIFtkaXJlY3Rpb25dOiBgY2FsYygke3dpZHRofSUgLSAke3RpY2tTaXplIC8gMn1weClgLFxuICAgICAgICAgICAgW29mZnNldERpcmVjdGlvbl06IGBjYWxjKDUwJSAtICR7dGlja1NpemUgLyAyfXB4KWAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSwgY2hpbGRyZW4pXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2xpZGVyX190aWNrcy1jb250YWluZXInLFxuICAgICAgICBjbGFzczoge1xuICAgICAgICAgICd2LXNsaWRlcl9fdGlja3MtY29udGFpbmVyLS1hbHdheXMtc2hvdyc6IHRoaXMudGlja3MgPT09ICdhbHdheXMnIHx8IHRoaXMudGlja0xhYmVscy5sZW5ndGggPiAwLFxuICAgICAgICB9LFxuICAgICAgfSwgdGlja3MpXG4gICAgfSxcbiAgICBnZW5UaHVtYkNvbnRhaW5lciAoXG4gICAgICB2YWx1ZTogbnVtYmVyLFxuICAgICAgdmFsdWVXaWR0aDogbnVtYmVyLFxuICAgICAgaXNBY3RpdmU6IGJvb2xlYW4sXG4gICAgICBpc0ZvY3VzZWQ6IGJvb2xlYW4sXG4gICAgICBvbkRyYWc6IEZ1bmN0aW9uLFxuICAgICAgb25Gb2N1czogRnVuY3Rpb24sXG4gICAgICBvbkJsdXI6IEZ1bmN0aW9uLFxuICAgICAgcmVmID0gJ3RodW1iJ1xuICAgICk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW3RoaXMuZ2VuVGh1bWIoKV1cblxuICAgICAgY29uc3QgdGh1bWJMYWJlbENvbnRlbnQgPSB0aGlzLmdlblRodW1iTGFiZWxDb250ZW50KHZhbHVlKVxuICAgICAgdGhpcy5zaG93VGh1bWJMYWJlbCAmJiBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuVGh1bWJMYWJlbCh0aHVtYkxhYmVsQ29udGVudCkpXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldFRleHRDb2xvcih0aGlzLmNvbXB1dGVkVGh1bWJDb2xvciwge1xuICAgICAgICByZWYsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZXJfX3RodW1iLWNvbnRhaW5lcicsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3Ytc2xpZGVyX190aHVtYi1jb250YWluZXItLWFjdGl2ZSc6IGlzQWN0aXZlLFxuICAgICAgICAgICd2LXNsaWRlcl9fdGh1bWItY29udGFpbmVyLS1mb2N1c2VkJzogaXNGb2N1c2VkLFxuICAgICAgICAgICd2LXNsaWRlcl9fdGh1bWItY29udGFpbmVyLS1zaG93LWxhYmVsJzogdGhpcy5zaG93VGh1bWJMYWJlbCxcbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGU6IHRoaXMuZ2V0VGh1bWJDb250YWluZXJTdHlsZXModmFsdWVXaWR0aCksXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgcm9sZTogJ3NsaWRlcicsXG4gICAgICAgICAgdGFiaW5kZXg6IHRoaXMuZGlzYWJsZWQgfHwgdGhpcy5yZWFkb25seSA/IC0xIDogdGhpcy4kYXR0cnMudGFiaW5kZXggPyB0aGlzLiRhdHRycy50YWJpbmRleCA6IDAsXG4gICAgICAgICAgJ2FyaWEtbGFiZWwnOiB0aGlzLmxhYmVsLFxuICAgICAgICAgICdhcmlhLXZhbHVlbWluJzogdGhpcy5taW4sXG4gICAgICAgICAgJ2FyaWEtdmFsdWVtYXgnOiB0aGlzLm1heCxcbiAgICAgICAgICAnYXJpYS12YWx1ZW5vdyc6IHRoaXMuaW50ZXJuYWxWYWx1ZSxcbiAgICAgICAgICAnYXJpYS1yZWFkb25seSc6IFN0cmluZyh0aGlzLnJlYWRvbmx5KSxcbiAgICAgICAgICAnYXJpYS1vcmllbnRhdGlvbic6IHRoaXMudmVydGljYWwgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnLFxuICAgICAgICAgIC4uLnRoaXMuJGF0dHJzLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGZvY3VzOiBvbkZvY3VzLFxuICAgICAgICAgIGJsdXI6IG9uQmx1cixcbiAgICAgICAgICBrZXlkb3duOiB0aGlzLm9uS2V5RG93bixcbiAgICAgICAgICBrZXl1cDogdGhpcy5vbktleVVwLFxuICAgICAgICAgIHRvdWNoc3RhcnQ6IG9uRHJhZyxcbiAgICAgICAgICBtb3VzZWRvd246IG9uRHJhZyxcbiAgICAgICAgfSxcbiAgICAgIH0pLCBjaGlsZHJlbilcbiAgICB9LFxuICAgIGdlblRodW1iTGFiZWxDb250ZW50ICh2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogU2NvcGVkU2xvdENoaWxkcmVuIHtcbiAgICAgIHJldHVybiB0aGlzLiRzY29wZWRTbG90c1sndGh1bWItbGFiZWwnXVxuICAgICAgICA/IHRoaXMuJHNjb3BlZFNsb3RzWyd0aHVtYi1sYWJlbCddISh7IHZhbHVlIH0pXG4gICAgICAgIDogW3RoaXMuJGNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCBbU3RyaW5nKHZhbHVlKV0pXVxuICAgIH0sXG4gICAgZ2VuVGh1bWJMYWJlbCAoY29udGVudDogU2NvcGVkU2xvdENoaWxkcmVuKTogVk5vZGUge1xuICAgICAgY29uc3Qgc2l6ZSA9IGNvbnZlcnRUb1VuaXQodGhpcy50aHVtYlNpemUpXG5cbiAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHRoaXMudmVydGljYWxcbiAgICAgICAgPyBgdHJhbnNsYXRlWSgyMCUpIHRyYW5zbGF0ZVkoJHsoTnVtYmVyKHRoaXMudGh1bWJTaXplKSAvIDMpIC0gMX1weCkgdHJhbnNsYXRlWCg1NSUpIHJvdGF0ZSgxMzVkZWcpYFxuICAgICAgICA6IGB0cmFuc2xhdGVZKC0yMCUpIHRyYW5zbGF0ZVkoLTEycHgpIHRyYW5zbGF0ZVgoLTUwJSkgcm90YXRlKDQ1ZGVnKWBcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVlNjYWxlVHJhbnNpdGlvbiwge1xuICAgICAgICBwcm9wczogeyBvcmlnaW46ICdib3R0b20gY2VudGVyJyB9LFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlcl9fdGh1bWItbGFiZWwtY29udGFpbmVyJyxcbiAgICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgICAgbmFtZTogJ3Nob3cnLFxuICAgICAgICAgICAgdmFsdWU6IHRoaXMuaXNGb2N1c2VkIHx8IHRoaXMuaXNBY3RpdmUgfHwgdGhpcy50aHVtYkxhYmVsID09PSAnYWx3YXlzJyxcbiAgICAgICAgICB9XSxcbiAgICAgICAgfSwgW1xuICAgICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29tcHV0ZWRUaHVtYkNvbG9yLCB7XG4gICAgICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2xpZGVyX190aHVtYi1sYWJlbCcsXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBoZWlnaHQ6IHNpemUsXG4gICAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICAgICAgICB0cmFuc2Zvcm0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLCBbdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgY29udGVudCldKSxcbiAgICAgICAgXSksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuVGh1bWIgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldEJhY2tncm91bmRDb2xvcih0aGlzLmNvbXB1dGVkVGh1bWJDb2xvciwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2xpZGVyX190aHVtYicsXG4gICAgICB9KSlcbiAgICB9LFxuICAgIGdldFRodW1iQ29udGFpbmVyU3R5bGVzICh3aWR0aDogbnVtYmVyKTogb2JqZWN0IHtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMudmVydGljYWwgPyAndG9wJyA6ICdsZWZ0J1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy4kdnVldGlmeS5ydGwgPyAxMDAgLSB3aWR0aCA6IHdpZHRoXG4gICAgICB2YWx1ZSA9IHRoaXMudmVydGljYWwgPyAxMDAgLSB2YWx1ZSA6IHZhbHVlXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRyYW5zaXRpb246IHRoaXMudHJhY2tUcmFuc2l0aW9uLFxuICAgICAgICBbZGlyZWN0aW9uXTogYCR7dmFsdWV9JWAsXG4gICAgICB9XG4gICAgfSxcbiAgICBvblRodW1iTW91c2VEb3duIChlOiBNb3VzZUV2ZW50KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgdGhpcy5vbGRWYWx1ZSA9IHRoaXMuaW50ZXJuYWxWYWx1ZVxuICAgICAgdGhpcy5rZXlQcmVzc2VkID0gMlxuICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRydWVcblxuICAgICAgY29uc3QgbW91c2VVcE9wdGlvbnMgPSBwYXNzaXZlU3VwcG9ydGVkID8geyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0gOiB0cnVlXG4gICAgICBjb25zdCBtb3VzZU1vdmVPcHRpb25zID0gcGFzc2l2ZVN1cHBvcnRlZCA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2VcbiAgICAgIGlmICgndG91Y2hlcycgaW4gZSkge1xuICAgICAgICB0aGlzLmFwcC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlLCBtb3VzZU1vdmVPcHRpb25zKVxuICAgICAgICBhZGRPbmNlRXZlbnRMaXN0ZW5lcih0aGlzLmFwcCwgJ3RvdWNoZW5kJywgdGhpcy5vblNsaWRlck1vdXNlVXAsIG1vdXNlVXBPcHRpb25zKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHAuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSwgbW91c2VNb3ZlT3B0aW9ucylcbiAgICAgICAgYWRkT25jZUV2ZW50TGlzdGVuZXIodGhpcy5hcHAsICdtb3VzZXVwJywgdGhpcy5vblNsaWRlck1vdXNlVXAsIG1vdXNlVXBPcHRpb25zKVxuICAgICAgfVxuXG4gICAgICB0aGlzLiRlbWl0KCdzdGFydCcsIHRoaXMuaW50ZXJuYWxWYWx1ZSlcbiAgICB9LFxuICAgIG9uU2xpZGVyTW91c2VVcCAoZTogRXZlbnQpIHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIHRoaXMua2V5UHJlc3NlZCA9IDBcbiAgICAgIGNvbnN0IG1vdXNlTW92ZU9wdGlvbnMgPSBwYXNzaXZlU3VwcG9ydGVkID8geyBwYXNzaXZlOiB0cnVlIH0gOiBmYWxzZVxuICAgICAgdGhpcy5hcHAucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSwgbW91c2VNb3ZlT3B0aW9ucylcbiAgICAgIHRoaXMuYXBwLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUsIG1vdXNlTW92ZU9wdGlvbnMpXG5cbiAgICAgIHRoaXMuJGVtaXQoJ2VuZCcsIHRoaXMuaW50ZXJuYWxWYWx1ZSlcbiAgICAgIGlmICghZGVlcEVxdWFsKHRoaXMub2xkVmFsdWUsIHRoaXMuaW50ZXJuYWxWYWx1ZSkpIHtcbiAgICAgICAgdGhpcy4kZW1pdCgnY2hhbmdlJywgdGhpcy5pbnRlcm5hbFZhbHVlKVxuICAgICAgICB0aGlzLm5vQ2xpY2sgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZVxuICAgIH0sXG4gICAgb25Nb3VzZU1vdmUgKGU6IE1vdXNlRXZlbnQpIHtcbiAgICAgIGNvbnN0IHsgdmFsdWUgfSA9IHRoaXMucGFyc2VNb3VzZU1vdmUoZSlcbiAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHZhbHVlXG4gICAgfSxcbiAgICBvbktleURvd24gKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLmRpc2FibGVkIHx8IHRoaXMucmVhZG9ubHkpIHJldHVyblxuXG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGFyc2VLZXlEb3duKGUsIHRoaXMuaW50ZXJuYWxWYWx1ZSlcblxuICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVyblxuXG4gICAgICB0aGlzLmludGVybmFsVmFsdWUgPSB2YWx1ZVxuICAgICAgdGhpcy4kZW1pdCgnY2hhbmdlJywgdmFsdWUpXG4gICAgfSxcbiAgICBvbktleVVwICgpIHtcbiAgICAgIHRoaXMua2V5UHJlc3NlZCA9IDBcbiAgICB9LFxuICAgIG9uU2xpZGVyQ2xpY2sgKGU6IE1vdXNlRXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLm5vQ2xpY2spIHtcbiAgICAgICAgdGhpcy5ub0NsaWNrID0gZmFsc2VcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCB0aHVtYiA9IHRoaXMuJHJlZnMudGh1bWIgYXMgSFRNTEVsZW1lbnRcbiAgICAgIHRodW1iLmZvY3VzKClcblxuICAgICAgdGhpcy5vbk1vdXNlTW92ZShlKVxuICAgICAgdGhpcy4kZW1pdCgnY2hhbmdlJywgdGhpcy5pbnRlcm5hbFZhbHVlKVxuICAgIH0sXG4gICAgb25CbHVyIChlOiBFdmVudCkge1xuICAgICAgdGhpcy5pc0ZvY3VzZWQgPSBmYWxzZVxuXG4gICAgICB0aGlzLiRlbWl0KCdibHVyJywgZSlcbiAgICB9LFxuICAgIG9uRm9jdXMgKGU6IEV2ZW50KSB7XG4gICAgICB0aGlzLmlzRm9jdXNlZCA9IHRydWVcblxuICAgICAgdGhpcy4kZW1pdCgnZm9jdXMnLCBlKVxuICAgIH0sXG4gICAgcGFyc2VNb3VzZU1vdmUgKGU6IE1vdXNlRXZlbnQpIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy52ZXJ0aWNhbCA/ICd0b3AnIDogJ2xlZnQnXG4gICAgICBjb25zdCBsZW5ndGggPSB0aGlzLnZlcnRpY2FsID8gJ2hlaWdodCcgOiAnd2lkdGgnXG4gICAgICBjb25zdCBjbGljayA9IHRoaXMudmVydGljYWwgPyAnY2xpZW50WScgOiAnY2xpZW50WCdcblxuICAgICAgY29uc3Qge1xuICAgICAgICBbc3RhcnRdOiB0cmFja1N0YXJ0LFxuICAgICAgICBbbGVuZ3RoXTogdHJhY2tMZW5ndGgsXG4gICAgICB9ID0gdGhpcy4kcmVmcy50cmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSBhcyBhbnlcbiAgICAgIGNvbnN0IGNsaWNrT2Zmc2V0ID0gJ3RvdWNoZXMnIGluIGUgPyAoZSBhcyBhbnkpLnRvdWNoZXNbMF1bY2xpY2tdIDogZVtjbGlja10gLy8gQ2FuIHdlIGdldCByaWQgb2YgYW55IGhlcmU/XG5cbiAgICAgIC8vIEl0IGlzIHBvc3NpYmxlIGZvciBsZWZ0IHRvIGJlIE5hTiwgZm9yY2UgdG8gbnVtYmVyXG4gICAgICBsZXQgY2xpY2tQb3MgPSBNYXRoLm1pbihNYXRoLm1heCgoY2xpY2tPZmZzZXQgLSB0cmFja1N0YXJ0KSAvIHRyYWNrTGVuZ3RoLCAwKSwgMSkgfHwgMFxuXG4gICAgICBpZiAodGhpcy52ZXJ0aWNhbCkgY2xpY2tQb3MgPSAxIC0gY2xpY2tQb3NcbiAgICAgIGlmICh0aGlzLiR2dWV0aWZ5LnJ0bCkgY2xpY2tQb3MgPSAxIC0gY2xpY2tQb3NcblxuICAgICAgY29uc3QgaXNJbnNpZGVUcmFjayA9IGNsaWNrT2Zmc2V0ID49IHRyYWNrU3RhcnQgJiYgY2xpY2tPZmZzZXQgPD0gdHJhY2tTdGFydCArIHRyYWNrTGVuZ3RoXG4gICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQodGhpcy5taW4pICsgY2xpY2tQb3MgKiAodGhpcy5tYXhWYWx1ZSAtIHRoaXMubWluVmFsdWUpXG5cbiAgICAgIHJldHVybiB7IHZhbHVlLCBpc0luc2lkZVRyYWNrIH1cbiAgICB9LFxuICAgIHBhcnNlS2V5RG93biAoZTogS2V5Ym9hcmRFdmVudCwgdmFsdWU6IG51bWJlcikge1xuICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVyblxuXG4gICAgICBjb25zdCB7IHBhZ2V1cCwgcGFnZWRvd24sIGVuZCwgaG9tZSwgbGVmdCwgcmlnaHQsIGRvd24sIHVwIH0gPSBrZXlDb2Rlc1xuXG4gICAgICBpZiAoIVtwYWdldXAsIHBhZ2Vkb3duLCBlbmQsIGhvbWUsIGxlZnQsIHJpZ2h0LCBkb3duLCB1cF0uaW5jbHVkZXMoZS5rZXlDb2RlKSkgcmV0dXJuXG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3Qgc3RlcCA9IHRoaXMuc3RlcE51bWVyaWMgfHwgMVxuICAgICAgY29uc3Qgc3RlcHMgPSAodGhpcy5tYXhWYWx1ZSAtIHRoaXMubWluVmFsdWUpIC8gc3RlcFxuICAgICAgaWYgKFtsZWZ0LCByaWdodCwgZG93biwgdXBdLmluY2x1ZGVzKGUua2V5Q29kZSkpIHtcbiAgICAgICAgdGhpcy5rZXlQcmVzc2VkICs9IDFcblxuICAgICAgICBjb25zdCBpbmNyZWFzZSA9IHRoaXMuJHZ1ZXRpZnkucnRsID8gW2xlZnQsIHVwXSA6IFtyaWdodCwgdXBdXG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IGluY3JlYXNlLmluY2x1ZGVzKGUua2V5Q29kZSkgPyAxIDogLTFcbiAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IGUuc2hpZnRLZXkgPyAzIDogKGUuY3RybEtleSA/IDIgOiAxKVxuXG4gICAgICAgIHZhbHVlID0gdmFsdWUgKyAoZGlyZWN0aW9uICogc3RlcCAqIG11bHRpcGxpZXIpXG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gaG9tZSkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMubWluVmFsdWVcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBlbmQpIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLm1heFZhbHVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBlLmtleUNvZGUgPT09IHBhZ2Vkb3duID8gMSA6IC0xXG4gICAgICAgIHZhbHVlID0gdmFsdWUgLSAoZGlyZWN0aW9uICogc3RlcCAqIChzdGVwcyA+IDEwMCA/IHN0ZXBzIC8gMTAgOiAxMCkpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH0sXG4gICAgcm91bmRWYWx1ZSAodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgICBpZiAoIXRoaXMuc3RlcE51bWVyaWMpIHJldHVybiB2YWx1ZVxuICAgICAgLy8gRm9ybWF0IGlucHV0IHZhbHVlIHVzaW5nIHRoZSBzYW1lIG51bWJlclxuICAgICAgLy8gb2YgZGVjaW1hbHMgcGxhY2VzIGFzIGluIHRoZSBzdGVwIHByb3BcbiAgICAgIGNvbnN0IHRyaW1tZWRTdGVwID0gdGhpcy5zdGVwLnRvU3RyaW5nKCkudHJpbSgpXG4gICAgICBjb25zdCBkZWNpbWFscyA9IHRyaW1tZWRTdGVwLmluZGV4T2YoJy4nKSA+IC0xXG4gICAgICAgID8gKHRyaW1tZWRTdGVwLmxlbmd0aCAtIHRyaW1tZWRTdGVwLmluZGV4T2YoJy4nKSAtIDEpXG4gICAgICAgIDogMFxuICAgICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5taW5WYWx1ZSAlIHRoaXMuc3RlcE51bWVyaWNcblxuICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLnJvdW5kKCh2YWx1ZSAtIG9mZnNldCkgLyB0aGlzLnN0ZXBOdW1lcmljKSAqIHRoaXMuc3RlcE51bWVyaWMgKyBvZmZzZXRcblxuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoTWF0aC5taW4obmV3VmFsdWUsIHRoaXMubWF4VmFsdWUpLnRvRml4ZWQoZGVjaW1hbHMpKVxuICAgIH0sXG4gIH0sXG59KVxuIl19