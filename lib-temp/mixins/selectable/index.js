// Components
import VInput from '../../components/VInput';
// Mixins
import Rippleable from '../rippleable';
import Comparable from '../comparable';
// Utilities
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(VInput, Rippleable, Comparable).extend({
    name: 'selectable',
    model: {
        prop: 'inputValue',
        event: 'change',
    },
    props: {
        id: String,
        inputValue: null,
        falseValue: null,
        trueValue: null,
        multiple: {
            type: Boolean,
            default: null,
        },
        label: String,
    },
    data() {
        return {
            hasColor: this.inputValue,
            lazyValue: this.inputValue,
        };
    },
    computed: {
        computedColor() {
            if (!this.isActive)
                return undefined;
            if (this.color)
                return this.color;
            if (this.isDark && !this.appIsDark)
                return 'white';
            return 'primary';
        },
        isMultiple() {
            return this.multiple === true || (this.multiple === null && Array.isArray(this.internalValue));
        },
        isActive() {
            const value = this.value;
            const input = this.internalValue;
            if (this.isMultiple) {
                if (!Array.isArray(input))
                    return false;
                return input.some(item => this.valueComparator(item, value));
            }
            if (this.trueValue === undefined || this.falseValue === undefined) {
                return value
                    ? this.valueComparator(value, input)
                    : Boolean(input);
            }
            return this.valueComparator(input, this.trueValue);
        },
        isDirty() {
            return this.isActive;
        },
        rippleState() {
            return !this.disabled && !this.validationState
                ? 'primary'
                : this.validationState;
        },
    },
    watch: {
        inputValue(val) {
            this.lazyValue = val;
            this.hasColor = val;
        },
    },
    methods: {
        genLabel() {
            const label = VInput.options.methods.genLabel.call(this);
            if (!label)
                return label;
            label.data.on = {
                click: (e) => {
                    // Prevent label from
                    // causing the input
                    // to focus
                    e.preventDefault();
                    this.onChange();
                },
            };
            return label;
        },
        genInput(type, attrs) {
            return this.$createElement('input', {
                attrs: Object.assign({
                    'aria-checked': this.isActive.toString(),
                    disabled: this.isDisabled,
                    id: this.computedId,
                    role: type,
                    type,
                }, attrs),
                domProps: {
                    value: this.value,
                    checked: this.isActive,
                },
                on: {
                    blur: this.onBlur,
                    change: this.onChange,
                    focus: this.onFocus,
                    keydown: this.onKeydown,
                },
                ref: 'input',
            });
        },
        onBlur() {
            this.isFocused = false;
        },
        onChange() {
            if (this.isDisabled)
                return;
            const value = this.value;
            let input = this.internalValue;
            if (this.isMultiple) {
                if (!Array.isArray(input)) {
                    input = [];
                }
                const length = input.length;
                input = input.filter((item) => !this.valueComparator(item, value));
                if (input.length === length) {
                    input.push(value);
                }
            }
            else if (this.trueValue !== undefined && this.falseValue !== undefined) {
                input = this.valueComparator(input, this.trueValue) ? this.falseValue : this.trueValue;
            }
            else if (value) {
                input = this.valueComparator(input, value) ? null : value;
            }
            else {
                input = !input;
            }
            this.validate(true, input);
            this.internalValue = input;
            this.hasColor = input;
        },
        onFocus() {
            this.isFocused = true;
        },
        /** @abstract */
        onKeydown(e) { },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL3NlbGVjdGFibGUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLFNBQVM7QUFDVCxPQUFPLFVBQVUsTUFBTSxlQUFlLENBQUE7QUFDdEMsT0FBTyxVQUFVLE1BQU0sZUFBZSxDQUFBO0FBRXRDLFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUV0QyxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLE1BQU0sRUFDTixVQUFVLEVBQ1YsVUFBVSxDQUNYLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLFlBQVk7SUFFbEIsS0FBSyxFQUFFO1FBQ0wsSUFBSSxFQUFFLFlBQVk7UUFDbEIsS0FBSyxFQUFFLFFBQVE7S0FDaEI7SUFFRCxLQUFLLEVBQUU7UUFDTCxFQUFFLEVBQUUsTUFBTTtRQUNWLFVBQVUsRUFBRSxJQUFXO1FBQ3ZCLFVBQVUsRUFBRSxJQUFXO1FBQ3ZCLFNBQVMsRUFBRSxJQUFXO1FBQ3RCLFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLElBQUk7U0FDZDtRQUNELEtBQUssRUFBRSxNQUFNO0tBQ2Q7SUFFRCxJQUFJO1FBQ0YsT0FBTztZQUNMLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUN6QixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7U0FDM0IsQ0FBQTtJQUNILENBQUM7SUFFRCxRQUFRLEVBQUU7UUFDUixhQUFhO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU8sU0FBUyxDQUFBO1lBQ3BDLElBQUksSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO1lBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElB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LENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUE7YUFDdkY7aUJBQU0sSUFBSSxLQUFLLEVBQUU7Z0JBQ2hCLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7YUFDMUQ7aUJBQU07Z0JBQ0wsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFBO2FBQ2Y7WUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUMxQixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQTtZQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTtRQUN2QixDQUFDO1FBQ0QsT0FBTztZQUNMLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO1FBQ3ZCLENBQUM7UUFDRCxnQkFBZ0I7UUFDaEIsU0FBUyxDQUFFLENBQVEsSUFBRyxDQUFDO0tBQ3hCO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZJbnB1dCBmcm9tICcuLi8uLi9jb21wb25lbnRzL1ZJbnB1dCdcblxuLy8gTWl4aW5zXG5pbXBvcnQgUmlwcGxlYWJsZSBmcm9tICcuLi9yaXBwbGVhYmxlJ1xuaW1wb3J0IENvbXBhcmFibGUgZnJvbSAnLi4vY29tcGFyYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBWSW5wdXQsXG4gIFJpcHBsZWFibGUsXG4gIENvbXBhcmFibGVcbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3NlbGVjdGFibGUnLFxuXG4gIG1vZGVsOiB7XG4gICAgcHJvcDogJ2lucHV0VmFsdWUnLFxuICAgIGV2ZW50OiAnY2hhbmdlJyxcbiAgfSxcblxuICBwcm9wczoge1xuICAgIGlkOiBTdHJpbmcsXG4gICAgaW5wdXRWYWx1ZTogbnVsbCBhcyBhbnksXG4gICAgZmFsc2VWYWx1ZTogbnVsbCBhcyBhbnksXG4gICAgdHJ1ZVZhbHVlOiBudWxsIGFzIGFueSxcbiAgICBtdWx0aXBsZToge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBsYWJlbDogU3RyaW5nLFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBoYXNDb2xvcjogdGhpcy5pbnB1dFZhbHVlLFxuICAgICAgbGF6eVZhbHVlOiB0aGlzLmlucHV0VmFsdWUsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY29tcHV0ZWRDb2xvciAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgaWYgKHRoaXMuY29sb3IpIHJldHVybiB0aGlzLmNvbG9yXG4gICAgICBpZiAodGhpcy5pc0RhcmsgJiYgIXRoaXMuYXBwSXNEYXJrKSByZXR1cm4gJ3doaXRlJ1xuICAgICAgcmV0dXJuICdwcmltYXJ5J1xuICAgIH0sXG4gICAgaXNNdWx0aXBsZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBsZSA9PT0gdHJ1ZSB8fCAodGhpcy5tdWx0aXBsZSA9PT0gbnVsbCAmJiBBcnJheS5pc0FycmF5KHRoaXMuaW50ZXJuYWxWYWx1ZSkpXG4gICAgfSxcbiAgICBpc0FjdGl2ZSAoKTogYm9vbGVhbiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmFsdWVcbiAgICAgIGNvbnN0IGlucHV0ID0gdGhpcy5pbnRlcm5hbFZhbHVlXG5cbiAgICAgIGlmICh0aGlzLmlzTXVsdGlwbGUpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSkgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgcmV0dXJuIGlucHV0LnNvbWUoaXRlbSA9PiB0aGlzLnZhbHVlQ29tcGFyYXRvcihpdGVtLCB2YWx1ZSkpXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnRydWVWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuZmFsc2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgID8gdGhpcy52YWx1ZUNvbXBhcmF0b3IodmFsdWUsIGlucHV0KVxuICAgICAgICAgIDogQm9vbGVhbihpbnB1dClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMudmFsdWVDb21wYXJhdG9yKGlucHV0LCB0aGlzLnRydWVWYWx1ZSlcbiAgICB9LFxuICAgIGlzRGlydHkgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuaXNBY3RpdmVcbiAgICB9LFxuICAgIHJpcHBsZVN0YXRlICgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgcmV0dXJuICF0aGlzLmRpc2FibGVkICYmICF0aGlzLnZhbGlkYXRpb25TdGF0ZVxuICAgICAgICA/ICdwcmltYXJ5J1xuICAgICAgICA6IHRoaXMudmFsaWRhdGlvblN0YXRlXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIGlucHV0VmFsdWUgKHZhbCkge1xuICAgICAgdGhpcy5sYXp5VmFsdWUgPSB2YWxcbiAgICAgIHRoaXMuaGFzQ29sb3IgPSB2YWxcbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBnZW5MYWJlbCAoKSB7XG4gICAgICBjb25zdCBsYWJlbCA9IFZJbnB1dC5vcHRpb25zLm1ldGhvZHMuZ2VuTGFiZWwuY2FsbCh0aGlzKVxuXG4gICAgICBpZiAoIWxhYmVsKSByZXR1cm4gbGFiZWxcblxuICAgICAgbGFiZWwhLmRhdGEhLm9uID0ge1xuICAgICAgICBjbGljazogKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgLy8gUHJldmVudCBsYWJlbCBmcm9tXG4gICAgICAgICAgLy8gY2F1c2luZyB0aGUgaW5wdXRcbiAgICAgICAgICAvLyB0byBmb2N1c1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICAgICAgdGhpcy5vbkNoYW5nZSgpXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsYWJlbFxuICAgIH0sXG4gICAgZ2VuSW5wdXQgKHR5cGU6IHN0cmluZywgYXR0cnM6IG9iamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuICAgICAgICBhdHRyczogT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgJ2FyaWEtY2hlY2tlZCc6IHRoaXMuaXNBY3RpdmUudG9TdHJpbmcoKSxcbiAgICAgICAgICBkaXNhYmxlZDogdGhpcy5pc0Rpc2FibGVkLFxuICAgICAgICAgIGlkOiB0aGlzLmNvbXB1dGVkSWQsXG4gICAgICAgICAgcm9sZTogdHlwZSxcbiAgICAgICAgICB0eXBlLFxuICAgICAgICB9LCBhdHRycyksXG4gICAgICAgIGRvbVByb3BzOiB7XG4gICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWUsXG4gICAgICAgICAgY2hlY2tlZDogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBibHVyOiB0aGlzLm9uQmx1cixcbiAgICAgICAgICBjaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgZm9jdXM6IHRoaXMub25Gb2N1cyxcbiAgICAgICAgICBrZXlkb3duOiB0aGlzLm9uS2V5ZG93bixcbiAgICAgICAgfSxcbiAgICAgICAgcmVmOiAnaW5wdXQnLFxuICAgICAgfSlcbiAgICB9LFxuICAgIG9uQmx1ciAoKSB7XG4gICAgICB0aGlzLmlzRm9jdXNlZCA9IGZhbHNlXG4gICAgfSxcbiAgICBvbkNoYW5nZSAoKSB7XG4gICAgICBpZiAodGhpcy5pc0Rpc2FibGVkKSByZXR1cm5cblxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnZhbHVlXG4gICAgICBsZXQgaW5wdXQgPSB0aGlzLmludGVybmFsVmFsdWVcblxuICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgICAgaW5wdXQgPSBbXVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaW5wdXQubGVuZ3RoXG5cbiAgICAgICAgaW5wdXQgPSBpbnB1dC5maWx0ZXIoKGl0ZW06IGFueSkgPT4gIXRoaXMudmFsdWVDb21wYXJhdG9yKGl0ZW0sIHZhbHVlKSlcblxuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoID09PSBsZW5ndGgpIHtcbiAgICAgICAgICBpbnB1dC5wdXNoKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHJ1ZVZhbHVlICE9PSB1bmRlZmluZWQgJiYgdGhpcy5mYWxzZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaW5wdXQgPSB0aGlzLnZhbHVlQ29tcGFyYXRvcihpbnB1dCwgdGhpcy50cnVlVmFsdWUpID8gdGhpcy5mYWxzZVZhbHVlIDogdGhpcy50cnVlVmFsdWVcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgaW5wdXQgPSB0aGlzLnZhbHVlQ29tcGFyYXRvcihpbnB1dCwgdmFsdWUpID8gbnVsbCA6IHZhbHVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnB1dCA9ICFpbnB1dFxuICAgICAgfVxuXG4gICAgICB0aGlzLnZhbGlkYXRlKHRydWUsIGlucHV0KVxuICAgICAgdGhpcy5pbnRlcm5hbFZhbHVlID0gaW5wdXRcbiAgICAgIHRoaXMuaGFzQ29sb3IgPSBpbnB1dFxuICAgIH0sXG4gICAgb25Gb2N1cyAoKSB7XG4gICAgICB0aGlzLmlzRm9jdXNlZCA9IHRydWVcbiAgICB9LFxuICAgIC8qKiBAYWJzdHJhY3QgKi9cbiAgICBvbktleWRvd24gKGU6IEV2ZW50KSB7fSxcbiAgfSxcbn0pXG4iXX0=