// Styles
import './VFileInput.sass';
// Extensions
import VTextField from '../VTextField';
// Components
import { VChip } from '../VChip';
// Utilities
import { deepEqual, humanReadableFileSize, wrapInArray } from '../../util/helpers';
import { consoleError } from '../../util/console';
export default VTextField.extend({
    name: 'v-file-input',
    model: {
        prop: 'value',
        event: 'change',
    },
    props: {
        chips: Boolean,
        clearable: {
            type: Boolean,
            default: true,
        },
        counterSizeString: {
            type: String,
            default: '$vuetify.fileInput.counterSize',
        },
        counterString: {
            type: String,
            default: '$vuetify.fileInput.counter',
        },
        placeholder: String,
        prependIcon: {
            type: String,
            default: '$file',
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        showSize: {
            type: [Boolean, Number],
            default: false,
            validator: (v) => {
                return (typeof v === 'boolean' ||
                    [1000, 1024].includes(v));
            },
        },
        smallChips: Boolean,
        truncateLength: {
            type: [Number, String],
            default: 22,
        },
        type: {
            type: String,
            default: 'file',
        },
        value: {
            default: undefined,
            validator: val => {
                return wrapInArray(val).every(v => v != null && typeof v === 'object');
            },
        },
    },
    computed: {
        classes() {
            return {
                ...VTextField.options.computed.classes.call(this),
                'v-file-input': true,
            };
        },
        computedCounterValue() {
            const fileCount = (this.isMultiple && this.lazyValue)
                ? this.lazyValue.length
                : (this.lazyValue instanceof File) ? 1 : 0;
            if (!this.showSize)
                return this.$vuetify.lang.t(this.counterString, fileCount);
            const bytes = this.internalArrayValue.reduce((bytes, { size = 0 }) => {
                return bytes + size;
            }, 0);
            return this.$vuetify.lang.t(this.counterSizeString, fileCount, humanReadableFileSize(bytes, this.base === 1024));
        },
        internalArrayValue() {
            return wrapInArray(this.internalValue);
        },
        internalValue: {
            get() {
                return this.lazyValue;
            },
            set(val) {
                this.lazyValue = val;
                this.$emit('change', this.lazyValue);
            },
        },
        isDirty() {
            return this.internalArrayValue.length > 0;
        },
        isLabelActive() {
            return this.isDirty;
        },
        isMultiple() {
            return this.$attrs.hasOwnProperty('multiple');
        },
        text() {
            if (!this.isDirty)
                return [this.placeholder];
            return this.internalArrayValue.map((file) => {
                const { name = '', size = 0, } = file;
                const truncatedText = this.truncateText(name);
                return !this.showSize
                    ? truncatedText
                    : `${truncatedText} (${humanReadableFileSize(size, this.base === 1024)})`;
            });
        },
        base() {
            return typeof this.showSize !== 'boolean' ? this.showSize : undefined;
        },
        hasChips() {
            return this.chips || this.smallChips;
        },
    },
    watch: {
        readonly: {
            handler(v) {
                if (v === true)
                    consoleError('readonly is not supported on <v-file-input>', this);
            },
            immediate: true,
        },
        value(v) {
            const value = this.isMultiple ? v : v ? [v] : [];
            if (!deepEqual(value, this.$refs.input.files)) {
                // When the input value is changed programatically, clear the
                // internal input's value so that the `onInput` handler
                // can be triggered again if the user re-selects the exact
                // same file(s). Ideally, `input.files` should be
                // manipulated directly but that property is readonly.
                this.$refs.input.value = '';
            }
        },
    },
    methods: {
        clearableCallback() {
            this.internalValue = this.isMultiple ? [] : undefined;
            this.$refs.input.value = '';
        },
        genChips() {
            if (!this.isDirty)
                return [];
            return this.text.map((text, index) => this.$createElement(VChip, {
                props: { small: this.smallChips },
                on: {
                    'click:close': () => {
                        const internalValue = this.internalValue;
                        internalValue.splice(index, 1);
                        this.internalValue = internalValue; // Trigger the watcher
                    },
                },
            }, [text]));
        },
        genInput() {
            const input = VTextField.options.methods.genInput.call(this);
            // We should not be setting value
            // programmatically on the input
            // when it is using type="file"
            delete input.data.domProps.value;
            // This solves an issue in Safari where
            // nothing happens when adding a file
            // do to the input event not firing
            // https://github.com/vuetifyjs/vuetify/issues/7941
            delete input.data.on.input;
            input.data.on.change = this.onInput;
            return [this.genSelections(), input];
        },
        genPrependSlot() {
            if (!this.prependIcon)
                return null;
            const icon = this.genIcon('prepend', () => {
                this.$refs.input.click();
            });
            return this.genSlot('prepend', 'outer', [icon]);
        },
        genSelectionText() {
            const length = this.text.length;
            if (length < 2)
                return this.text;
            if (this.showSize && !this.counter)
                return [this.computedCounterValue];
            return [this.$vuetify.lang.t(this.counterString, length)];
        },
        genSelections() {
            const children = [];
            if (this.isDirty && this.$scopedSlots.selection) {
                this.internalArrayValue.forEach((file, index) => {
                    if (!this.$scopedSlots.selection)
                        return;
                    children.push(this.$scopedSlots.selection({
                        text: this.text[index],
                        file,
                        index,
                    }));
                });
            }
            else {
                children.push(this.hasChips && this.isDirty ? this.genChips() : this.genSelectionText());
            }
            return this.$createElement('div', {
                staticClass: 'v-file-input__text',
                class: {
                    'v-file-input__text--placeholder': this.placeholder && !this.isDirty,
                    'v-file-input__text--chips': this.hasChips && !this.$scopedSlots.selection,
                },
            }, children);
        },
        genTextFieldSlot() {
            const node = VTextField.options.methods.genTextFieldSlot.call(this);
            node.data.on = {
                ...(node.data.on || {}),
                click: () => this.$refs.input.click(),
            };
            return node;
        },
        onInput(e) {
            const files = [...e.target.files || []];
            this.internalValue = this.isMultiple ? files : files[0];
            // Set initialValue here otherwise isFocused
            // watcher in VTextField will emit a change
            // event whenever the component is blurred
            this.initialValue = this.internalValue;
        },
        onKeyDown(e) {
            this.$emit('keydown', e);
        },
        truncateText(str) {
            if (str.length < Number(this.truncateLength))
                return str;
            const charsKeepOneSide = Math.floor((Number(this.truncateLength) - 1) / 2);
            return `${str.slice(0, charsKeepOneSide)}…${str.slice(str.length - charsKeepOneSide)}`;
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkZpbGVJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZGaWxlSW5wdXQvVkZpbGVJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxtQkFBbUIsQ0FBQTtBQUUxQixhQUFhO0FBQ2IsT0FBTyxVQUFVLE1BQU0sZUFBZSxDQUFBO0FBRXRDLGFBQWE7QUFDYixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBS2hDLFlBQVk7QUFDWixPQUFPLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ2xGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUVqRCxlQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDL0IsSUFBSSxFQUFFLGNBQWM7SUFFcEIsS0FBSyxFQUFFO1FBQ0wsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUUsUUFBUTtLQUNoQjtJQUVELEtBQUssRUFBRTtRQUNMLEtBQUssRUFBRSxPQUFPO1FBQ2QsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsaUJBQWlCLEVBQUU7WUFDakIsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsZ0NBQWdDO1NBQzFDO1FBQ0QsYUFBYSxFQUFFO1lBQ2IsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsNEJBQTRCO1NBQ3RDO1FBQ0QsV0FBVyxFQUFFLE1BQU07UUFDbkIsV0FBVyxFQUFFO1lBQ1gsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsT0FBTztTQUNqQjtRQUNELFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLEtBQUs7U0FDZjtRQUNELFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxDQUFDLE9BQU8s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QUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQzFFLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUE7UUFDeEYsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVkZpbGVJbnB1dC5zYXNzJ1xuXG4vLyBFeHRlbnNpb25zXG5pbXBvcnQgVlRleHRGaWVsZCBmcm9tICcuLi9WVGV4dEZpZWxkJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgeyBWQ2hpcCB9IGZyb20gJy4uL1ZDaGlwJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgUHJvcFZhbGlkYXRvciB9IGZyb20gJ3Z1ZS90eXBlcy9vcHRpb25zJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGRlZXBFcXVhbCwgaHVtYW5SZWFkYWJsZUZpbGVTaXplLCB3cmFwSW5BcnJheSB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCB7IGNvbnNvbGVFcnJvciB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuZXhwb3J0IGRlZmF1bHQgVlRleHRGaWVsZC5leHRlbmQoe1xuICBuYW1lOiAndi1maWxlLWlucHV0JyxcblxuICBtb2RlbDoge1xuICAgIHByb3A6ICd2YWx1ZScsXG4gICAgZXZlbnQ6ICdjaGFuZ2UnLFxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgY2hpcHM6IEJvb2xlYW4sXG4gICAgY2xlYXJhYmxlOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGNvdW50ZXJTaXplU3RyaW5nOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkuZmlsZUlucHV0LmNvdW50ZXJTaXplJyxcbiAgICB9LFxuICAgIGNvdW50ZXJTdHJpbmc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckdnVldGlmeS5maWxlSW5wdXQuY291bnRlcicsXG4gICAgfSxcbiAgICBwbGFjZWhvbGRlcjogU3RyaW5nLFxuICAgIHByZXBlbmRJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJGZpbGUnLFxuICAgIH0sXG4gICAgcmVhZG9ubHk6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIHNob3dTaXplOiB7XG4gICAgICB0eXBlOiBbQm9vbGVhbiwgTnVtYmVyXSxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdmFsaWRhdG9yOiAodjogYm9vbGVhbiB8IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIHR5cGVvZiB2ID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgICBbMTAwMCwgMTAyNF0uaW5jbHVkZXModilcbiAgICAgICAgKVxuICAgICAgfSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8Ym9vbGVhbiB8IDEwMDAgfCAxMDI0PixcbiAgICBzbWFsbENoaXBzOiBCb29sZWFuLFxuICAgIHRydW5jYXRlTGVuZ3RoOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMjIsXG4gICAgfSxcbiAgICB0eXBlOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnZmlsZScsXG4gICAgfSxcbiAgICB2YWx1ZToge1xuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkLFxuICAgICAgdmFsaWRhdG9yOiB2YWwgPT4ge1xuICAgICAgICByZXR1cm4gd3JhcEluQXJyYXkodmFsKS5ldmVyeSh2ID0+IHYgIT0gbnVsbCAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcpXG4gICAgICB9LFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxGaWxlIHwgRmlsZVtdPixcbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5WVGV4dEZpZWxkLm9wdGlvbnMuY29tcHV0ZWQuY2xhc3Nlcy5jYWxsKHRoaXMpLFxuICAgICAgICAndi1maWxlLWlucHV0JzogdHJ1ZSxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkQ291bnRlclZhbHVlICgpOiBzdHJpbmcge1xuICAgICAgY29uc3QgZmlsZUNvdW50ID0gKHRoaXMuaXNNdWx0aXBsZSAmJiB0aGlzLmxhenlWYWx1ZSlcbiAgICAgICAgPyB0aGlzLmxhenlWYWx1ZS5sZW5ndGhcbiAgICAgICAgOiAodGhpcy5sYXp5VmFsdWUgaW5zdGFuY2VvZiBGaWxlKSA/IDEgOiAwXG5cbiAgICAgIGlmICghdGhpcy5zaG93U2l6ZSkgcmV0dXJuIHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMuY291bnRlclN0cmluZywgZmlsZUNvdW50KVxuXG4gICAgICBjb25zdCBieXRlcyA9IHRoaXMuaW50ZXJuYWxBcnJheVZhbHVlLnJlZHVjZSgoYnl0ZXM6IG51bWJlciwgeyBzaXplID0gMCB9OiBGaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBieXRlcyArIHNpemVcbiAgICAgIH0sIDApXG5cbiAgICAgIHJldHVybiB0aGlzLiR2dWV0aWZ5LmxhbmcudChcbiAgICAgICAgdGhpcy5jb3VudGVyU2l6ZVN0cmluZyxcbiAgICAgICAgZmlsZUNvdW50LFxuICAgICAgICBodW1hblJlYWRhYmxlRmlsZVNpemUoYnl0ZXMsIHRoaXMuYmFzZSA9PT0gMTAyNClcbiAgICAgIClcbiAgICB9LFxuICAgIGludGVybmFsQXJyYXlWYWx1ZSAoKTogRmlsZVtdIHtcbiAgICAgIHJldHVybiB3cmFwSW5BcnJheSh0aGlzLmludGVybmFsVmFsdWUpXG4gICAgfSxcbiAgICBpbnRlcm5hbFZhbHVlOiB7XG4gICAgICBnZXQgKCk6IEZpbGVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhenlWYWx1ZVxuICAgICAgfSxcbiAgICAgIHNldCAodmFsOiBGaWxlIHwgRmlsZVtdKSB7XG4gICAgICAgIHRoaXMubGF6eVZhbHVlID0gdmFsXG4gICAgICAgIHRoaXMuJGVtaXQoJ2NoYW5nZScsIHRoaXMubGF6eVZhbHVlKVxuICAgICAgfSxcbiAgICB9LFxuICAgIGlzRGlydHkgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxBcnJheVZhbHVlLmxlbmd0aCA+IDBcbiAgICB9LFxuICAgIGlzTGFiZWxBY3RpdmUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuaXNEaXJ0eVxuICAgIH0sXG4gICAgaXNNdWx0aXBsZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy4kYXR0cnMuaGFzT3duUHJvcGVydHkoJ211bHRpcGxlJylcbiAgICB9LFxuICAgIHRleHQgKCk6IHN0cmluZ1tdIHtcbiAgICAgIGlmICghdGhpcy5pc0RpcnR5KSByZXR1cm4gW3RoaXMucGxhY2Vob2xkZXJdXG5cbiAgICAgIHJldHVybiB0aGlzLmludGVybmFsQXJyYXlWYWx1ZS5tYXAoKGZpbGU6IEZpbGUpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIG5hbWUgPSAnJyxcbiAgICAgICAgICBzaXplID0gMCxcbiAgICAgICAgfSA9IGZpbGVcblxuICAgICAgICBjb25zdCB0cnVuY2F0ZWRUZXh0ID0gdGhpcy50cnVuY2F0ZVRleHQobmFtZSlcblxuICAgICAgICByZXR1cm4gIXRoaXMuc2hvd1NpemVcbiAgICAgICAgICA/IHRydW5jYXRlZFRleHRcbiAgICAgICAgICA6IGAke3RydW5jYXRlZFRleHR9ICgke2h1bWFuUmVhZGFibGVGaWxlU2l6ZShzaXplLCB0aGlzLmJhc2UgPT09IDEwMjQpfSlgXG4gICAgICB9KVxuICAgIH0sXG4gICAgYmFzZSAoKTogMTAwMCB8IDEwMjQgfCB1bmRlZmluZWQge1xuICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLnNob3dTaXplICE9PSAnYm9vbGVhbicgPyB0aGlzLnNob3dTaXplIDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBoYXNDaGlwcyAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5jaGlwcyB8fCB0aGlzLnNtYWxsQ2hpcHNcbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgcmVhZG9ubHk6IHtcbiAgICAgIGhhbmRsZXIgKHYpIHtcbiAgICAgICAgaWYgKHYgPT09IHRydWUpIGNvbnNvbGVFcnJvcigncmVhZG9ubHkgaXMgbm90IHN1cHBvcnRlZCBvbiA8di1maWxlLWlucHV0PicsIHRoaXMpXG4gICAgICB9LFxuICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgIH0sXG4gICAgdmFsdWUgKHYpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5pc011bHRpcGxlID8gdiA6IHYgPyBbdl0gOiBbXVxuICAgICAgaWYgKCFkZWVwRXF1YWwodmFsdWUsIHRoaXMuJHJlZnMuaW5wdXQuZmlsZXMpKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGlucHV0IHZhbHVlIGlzIGNoYW5nZWQgcHJvZ3JhbWF0aWNhbGx5LCBjbGVhciB0aGVcbiAgICAgICAgLy8gaW50ZXJuYWwgaW5wdXQncyB2YWx1ZSBzbyB0aGF0IHRoZSBgb25JbnB1dGAgaGFuZGxlclxuICAgICAgICAvLyBjYW4gYmUgdHJpZ2dlcmVkIGFnYWluIGlmIHRoZSB1c2VyIHJlLXNlbGVjdHMgdGhlIGV4YWN0XG4gICAgICAgIC8vIHNhbWUgZmlsZShzKS4gSWRlYWxseSwgYGlucHV0LmZpbGVzYCBzaG91bGQgYmVcbiAgICAgICAgLy8gbWFuaXB1bGF0ZWQgZGlyZWN0bHkgYnV0IHRoYXQgcHJvcGVydHkgaXMgcmVhZG9ubHkuXG4gICAgICAgIHRoaXMuJHJlZnMuaW5wdXQudmFsdWUgPSAnJ1xuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGNsZWFyYWJsZUNhbGxiYWNrICgpIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHRoaXMuaXNNdWx0aXBsZSA/IFtdIDogdW5kZWZpbmVkXG4gICAgICB0aGlzLiRyZWZzLmlucHV0LnZhbHVlID0gJydcbiAgICB9LFxuICAgIGdlbkNoaXBzICgpIHtcbiAgICAgIGlmICghdGhpcy5pc0RpcnR5KSByZXR1cm4gW11cblxuICAgICAgcmV0dXJuIHRoaXMudGV4dC5tYXAoKHRleHQsIGluZGV4KSA9PiB0aGlzLiRjcmVhdGVFbGVtZW50KFZDaGlwLCB7XG4gICAgICAgIHByb3BzOiB7IHNtYWxsOiB0aGlzLnNtYWxsQ2hpcHMgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICAnY2xpY2s6Y2xvc2UnOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbnRlcm5hbFZhbHVlID0gdGhpcy5pbnRlcm5hbFZhbHVlXG4gICAgICAgICAgICBpbnRlcm5hbFZhbHVlLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IGludGVybmFsVmFsdWUgLy8gVHJpZ2dlciB0aGUgd2F0Y2hlclxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LCBbdGV4dF0pKVxuICAgIH0sXG4gICAgZ2VuSW5wdXQgKCkge1xuICAgICAgY29uc3QgaW5wdXQgPSBWVGV4dEZpZWxkLm9wdGlvbnMubWV0aG9kcy5nZW5JbnB1dC5jYWxsKHRoaXMpXG5cbiAgICAgIC8vIFdlIHNob3VsZCBub3QgYmUgc2V0dGluZyB2YWx1ZVxuICAgICAgLy8gcHJvZ3JhbW1hdGljYWxseSBvbiB0aGUgaW5wdXRcbiAgICAgIC8vIHdoZW4gaXQgaXMgdXNpbmcgdHlwZT1cImZpbGVcIlxuICAgICAgZGVsZXRlIGlucHV0LmRhdGEhLmRvbVByb3BzIS52YWx1ZVxuXG4gICAgICAvLyBUaGlzIHNvbHZlcyBhbiBpc3N1ZSBpbiBTYWZhcmkgd2hlcmVcbiAgICAgIC8vIG5vdGhpbmcgaGFwcGVucyB3aGVuIGFkZGluZyBhIGZpbGVcbiAgICAgIC8vIGRvIHRvIHRoZSBpbnB1dCBldmVudCBub3QgZmlyaW5nXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVldGlmeWpzL3Z1ZXRpZnkvaXNzdWVzLzc5NDFcbiAgICAgIGRlbGV0ZSBpbnB1dC5kYXRhIS5vbiEuaW5wdXRcbiAgICAgIGlucHV0LmRhdGEhLm9uIS5jaGFuZ2UgPSB0aGlzLm9uSW5wdXRcblxuICAgICAgcmV0dXJuIFt0aGlzLmdlblNlbGVjdGlvbnMoKSwgaW5wdXRdXG4gICAgfSxcbiAgICBnZW5QcmVwZW5kU2xvdCAoKSB7XG4gICAgICBpZiAoIXRoaXMucHJlcGVuZEljb24pIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IGljb24gPSB0aGlzLmdlbkljb24oJ3ByZXBlbmQnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuJHJlZnMuaW5wdXQuY2xpY2soKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHRoaXMuZ2VuU2xvdCgncHJlcGVuZCcsICdvdXRlcicsIFtpY29uXSlcbiAgICB9LFxuICAgIGdlblNlbGVjdGlvblRleHQgKCk6IHN0cmluZ1tdIHtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMudGV4dC5sZW5ndGhcblxuICAgICAgaWYgKGxlbmd0aCA8IDIpIHJldHVybiB0aGlzLnRleHRcbiAgICAgIGlmICh0aGlzLnNob3dTaXplICYmICF0aGlzLmNvdW50ZXIpIHJldHVybiBbdGhpcy5jb21wdXRlZENvdW50ZXJWYWx1ZV1cbiAgICAgIHJldHVybiBbdGhpcy4kdnVldGlmeS5sYW5nLnQodGhpcy5jb3VudGVyU3RyaW5nLCBsZW5ndGgpXVxuICAgIH0sXG4gICAgZ2VuU2VsZWN0aW9ucyAoKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtdXG5cbiAgICAgIGlmICh0aGlzLmlzRGlydHkgJiYgdGhpcy4kc2NvcGVkU2xvdHMuc2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxBcnJheVZhbHVlLmZvckVhY2goKGZpbGU6IEZpbGUsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMuJHNjb3BlZFNsb3RzLnNlbGVjdGlvbikgcmV0dXJuXG5cbiAgICAgICAgICBjaGlsZHJlbi5wdXNoKFxuICAgICAgICAgICAgdGhpcy4kc2NvcGVkU2xvdHMuc2VsZWN0aW9uKHtcbiAgICAgICAgICAgICAgdGV4dDogdGhpcy50ZXh0W2luZGV4XSxcbiAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2godGhpcy5oYXNDaGlwcyAmJiB0aGlzLmlzRGlydHkgPyB0aGlzLmdlbkNoaXBzKCkgOiB0aGlzLmdlblNlbGVjdGlvblRleHQoKSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWZpbGUtaW5wdXRfX3RleHQnLFxuICAgICAgICBjbGFzczoge1xuICAgICAgICAgICd2LWZpbGUtaW5wdXRfX3RleHQtLXBsYWNlaG9sZGVyJzogdGhpcy5wbGFjZWhvbGRlciAmJiAhdGhpcy5pc0RpcnR5LFxuICAgICAgICAgICd2LWZpbGUtaW5wdXRfX3RleHQtLWNoaXBzJzogdGhpcy5oYXNDaGlwcyAmJiAhdGhpcy4kc2NvcGVkU2xvdHMuc2VsZWN0aW9uLFxuICAgICAgICB9LFxuICAgICAgfSwgY2hpbGRyZW4pXG4gICAgfSxcbiAgICBnZW5UZXh0RmllbGRTbG90ICgpIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBWVGV4dEZpZWxkLm9wdGlvbnMubWV0aG9kcy5nZW5UZXh0RmllbGRTbG90LmNhbGwodGhpcylcblxuICAgICAgbm9kZS5kYXRhIS5vbiA9IHtcbiAgICAgICAgLi4uKG5vZGUuZGF0YSEub24gfHwge30pLFxuICAgICAgICBjbGljazogKCkgPT4gdGhpcy4kcmVmcy5pbnB1dC5jbGljaygpLFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZVxuICAgIH0sXG4gICAgb25JbnB1dCAoZTogRXZlbnQpIHtcbiAgICAgIGNvbnN0IGZpbGVzID0gWy4uLihlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5maWxlcyB8fCBbXV1cblxuICAgICAgdGhpcy5pbnRlcm5hbFZhbHVlID0gdGhpcy5pc011bHRpcGxlID8gZmlsZXMgOiBmaWxlc1swXVxuXG4gICAgICAvLyBTZXQgaW5pdGlhbFZhbHVlIGhlcmUgb3RoZXJ3aXNlIGlzRm9jdXNlZFxuICAgICAgLy8gd2F0Y2hlciBpbiBWVGV4dEZpZWxkIHdpbGwgZW1pdCBhIGNoYW5nZVxuICAgICAgLy8gZXZlbnQgd2hlbmV2ZXIgdGhlIGNvbXBvbmVudCBpcyBibHVycmVkXG4gICAgICB0aGlzLmluaXRpYWxWYWx1ZSA9IHRoaXMuaW50ZXJuYWxWYWx1ZVxuICAgIH0sXG4gICAgb25LZXlEb3duIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICB0aGlzLiRlbWl0KCdrZXlkb3duJywgZSlcbiAgICB9LFxuICAgIHRydW5jYXRlVGV4dCAoc3RyOiBzdHJpbmcpIHtcbiAgICAgIGlmIChzdHIubGVuZ3RoIDwgTnVtYmVyKHRoaXMudHJ1bmNhdGVMZW5ndGgpKSByZXR1cm4gc3RyXG4gICAgICBjb25zdCBjaGFyc0tlZXBPbmVTaWRlID0gTWF0aC5mbG9vcigoTnVtYmVyKHRoaXMudHJ1bmNhdGVMZW5ndGgpIC0gMSkgLyAyKVxuICAgICAgcmV0dXJuIGAke3N0ci5zbGljZSgwLCBjaGFyc0tlZXBPbmVTaWRlKX3igKYke3N0ci5zbGljZShzdHIubGVuZ3RoIC0gY2hhcnNLZWVwT25lU2lkZSl9YFxuICAgIH0sXG4gIH0sXG59KVxuIl19