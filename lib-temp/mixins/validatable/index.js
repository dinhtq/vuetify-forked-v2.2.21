// Mixins
import Colorable from '../colorable';
import Themeable from '../themeable';
import { inject as RegistrableInject } from '../registrable';
// Utilities
import { deepEqual } from '../../util/helpers';
import { consoleError } from '../../util/console';
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(Colorable, RegistrableInject('form'), Themeable).extend({
    name: 'validatable',
    props: {
        disabled: Boolean,
        error: Boolean,
        errorCount: {
            type: [Number, String],
            default: 1,
        },
        errorMessages: {
            type: [String, Array],
            default: () => [],
        },
        messages: {
            type: [String, Array],
            default: () => [],
        },
        readonly: Boolean,
        rules: {
            type: Array,
            default: () => [],
        },
        success: Boolean,
        successMessages: {
            type: [String, Array],
            default: () => [],
        },
        validateOnBlur: Boolean,
        value: { required: false },
    },
    data() {
        return {
            errorBucket: [],
            hasColor: false,
            hasFocused: false,
            hasInput: false,
            isFocused: false,
            isResetting: false,
            lazyValue: this.value,
            valid: false,
        };
    },
    computed: {
        computedColor() {
            if (this.disabled)
                return undefined;
            if (this.color)
                return this.color;
            // It's assumed that if the input is on a
            // dark background, the user will want to
            // have a white color. If the entire app
            // is setup to be dark, then they will
            // like want to use their primary color
            if (this.isDark && !this.appIsDark)
                return 'white';
            else
                return 'primary';
        },
        hasError() {
            return (this.internalErrorMessages.length > 0 ||
                this.errorBucket.length > 0 ||
                this.error);
        },
        // TODO: Add logic that allows the user to enable based
        // upon a good validation
        hasSuccess() {
            return (this.internalSuccessMessages.length > 0 ||
                this.success);
        },
        externalError() {
            return this.internalErrorMessages.length > 0 || this.error;
        },
        hasMessages() {
            return this.validationTarget.length > 0;
        },
        hasState() {
            if (this.disabled)
                return false;
            return (this.hasSuccess ||
                (this.shouldValidate && this.hasError));
        },
        internalErrorMessages() {
            return this.genInternalMessages(this.errorMessages);
        },
        internalMessages() {
            return this.genInternalMessages(this.messages);
        },
        internalSuccessMessages() {
            return this.genInternalMessages(this.successMessages);
        },
        internalValue: {
            get() {
                return this.lazyValue;
            },
            set(val) {
                this.lazyValue = val;
                this.$emit('input', val);
            },
        },
        shouldValidate() {
            if (this.externalError)
                return true;
            if (this.isResetting)
                return false;
            return this.validateOnBlur
                ? this.hasFocused && !this.isFocused
                : (this.hasInput || this.hasFocused);
        },
        validations() {
            return this.validationTarget.slice(0, Number(this.errorCount));
        },
        validationState() {
            if (this.disabled)
                return undefined;
            if (this.hasError && this.shouldValidate)
                return 'error';
            if (this.hasSuccess)
                return 'success';
            if (this.hasColor)
                return this.computedColor;
            return undefined;
        },
        validationTarget() {
            if (this.internalErrorMessages.length > 0) {
                return this.internalErrorMessages;
            }
            else if (this.successMessages.length > 0) {
                return this.internalSuccessMessages;
            }
            else if (this.messages.length > 0) {
                return this.internalMessages;
            }
            else if (this.shouldValidate) {
                return this.errorBucket;
            }
            else
                return [];
        },
    },
    watch: {
        rules: {
            handler(newVal, oldVal) {
                if (deepEqual(newVal, oldVal))
                    return;
                this.validate();
            },
            deep: true,
        },
        internalValue() {
            // If it's the first time we're setting input,
            // mark it with hasInput
            this.hasInput = true;
            this.validateOnBlur || this.$nextTick(this.validate);
        },
        isFocused(val) {
            // Should not check validation
            // if disabled
            if (!val &&
                !this.disabled) {
                this.hasFocused = true;
                this.validateOnBlur && this.$nextTick(this.validate);
            }
        },
        isResetting() {
            setTimeout(() => {
                this.hasInput = false;
                this.hasFocused = false;
                this.isResetting = false;
                this.validate();
            }, 0);
        },
        hasError(val) {
            if (this.shouldValidate) {
                this.$emit('update:error', val);
            }
        },
        value(val) {
            this.lazyValue = val;
        },
    },
    beforeMount() {
        this.validate();
    },
    created() {
        this.form && this.form.register(this);
    },
    beforeDestroy() {
        this.form && this.form.unregister(this);
    },
    methods: {
        genInternalMessages(messages) {
            if (!messages)
                return [];
            else if (Array.isArray(messages))
                return messages;
            else
                return [messages];
        },
        /** @public */
        reset() {
            this.isResetting = true;
            this.internalValue = Array.isArray(this.internalValue)
                ? []
                : undefined;
        },
        /** @public */
        resetValidation() {
            this.isResetting = true;
        },
        /** @public */
        validate(force = false, value) {
            const errorBucket = [];
            value = value || this.internalValue;
            if (force)
                this.hasInput = this.hasFocused = true;
            for (let index = 0; index < this.rules.length; index++) {
                const rule = this.rules[index];
                const valid = typeof rule === 'function' ? rule(value) : rule;
                if (valid === false || typeof valid === 'string') {
                    errorBucket.push(valid || '');
                }
                else if (typeof valid !== 'boolean') {
                    consoleError(`Rules should return a string or boolean, received '${typeof valid}' instead`, this);
                }
            }
            this.errorBucket = errorBucket;
            this.valid = errorBucket.length === 0;
            return this.valid;
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL3ZhbGlkYXRhYmxlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSxjQUFjLENBQUE7QUFDcEMsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFBO0FBQ3BDLE9BQU8sRUFBRSxNQUFNLElBQUksaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUU1RCxZQUFZO0FBQ1osT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNqRCxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQU10QyxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLFNBQVMsRUFDVCxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsRUFDekIsU0FBUyxDQUNWLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLGFBQWE7SUFFbkIsS0FBSyxFQUFFO1FBQ0wsUUFBUSxFQUFFLE9BQU87UUFDakIsS0FBSyxFQUFFLE9BQU87UUFDZCxVQUFVLEVBQUU7WUFDVixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1lBQ3RCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxhQUFhLEVBQUU7WUFDYixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUEyQjtZQUMvQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTtTQUNsQjtRQUNELFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQTJCO1lBQy9DLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO1NBQ2xCO1FBQ0QsUUFBUSxFQUFFLE9BQU87UUFDakIsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLEtBQXVDO1lBQzdDLE9BQU8s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QUN0QixLQUFLLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUE7WUFFbkMsSUFBSSxLQUFLO2dCQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUE7WUFFakQsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUN0RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUM5QixNQUFNLEtBQUssR0FBRyxPQUFPLElBQUksS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO2dCQUU3RCxJQUFJLEtBQUssS0FBSyxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO29CQUNoRCxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQTtpQkFDOUI7cUJBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQ3JDLFlBQVksQ0FBQyxzREFBc0QsT0FBTyxLQUFLLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQTtpQkFDbEc7YUFDRjtZQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO1lBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUE7WUFFckMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO1FBQ25CLENBQUM7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIE1peGluc1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi9jb2xvcmFibGUnXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uL3RoZW1lYWJsZSdcbmltcG9ydCB7IGluamVjdCBhcyBSZWdpc3RyYWJsZUluamVjdCB9IGZyb20gJy4uL3JlZ2lzdHJhYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGRlZXBFcXVhbCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCB7IGNvbnNvbGVFcnJvciB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBQcm9wVHlwZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IElucHV0TWVzc2FnZSwgSW5wdXRWYWxpZGF0aW9uUnVsZXMgfSBmcm9tICd0eXBlcydcblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IG1peGlucyhcbiAgQ29sb3JhYmxlLFxuICBSZWdpc3RyYWJsZUluamVjdCgnZm9ybScpLFxuICBUaGVtZWFibGVcbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3ZhbGlkYXRhYmxlJyxcblxuICBwcm9wczoge1xuICAgIGRpc2FibGVkOiBCb29sZWFuLFxuICAgIGVycm9yOiBCb29sZWFuLFxuICAgIGVycm9yQ291bnQ6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAxLFxuICAgIH0sXG4gICAgZXJyb3JNZXNzYWdlczoge1xuICAgICAgdHlwZTogW1N0cmluZywgQXJyYXldIGFzIFByb3BUeXBlPElucHV0TWVzc2FnZT4sXG4gICAgICBkZWZhdWx0OiAoKSA9PiBbXSxcbiAgICB9LFxuICAgIG1lc3NhZ2VzOiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBBcnJheV0gYXMgUHJvcFR5cGU8SW5wdXRNZXNzYWdlPixcbiAgICAgIGRlZmF1bHQ6ICgpID0+IFtdLFxuICAgIH0sXG4gICAgcmVhZG9ubHk6IEJvb2xlYW4sXG4gICAgcnVsZXM6IHtcbiAgICAgIHR5cGU6IEFycmF5IGFzIFByb3BUeXBlPElucHV0VmFsaWRhdGlvblJ1bGVzPixcbiAgICAgIGRlZmF1bHQ6ICgpID0+IFtdLFxuICAgIH0sXG4gICAgc3VjY2VzczogQm9vbGVhbixcbiAgICBzdWNjZXNzTWVzc2FnZXM6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIEFycmF5XSBhcyBQcm9wVHlwZTxJbnB1dE1lc3NhZ2U+LFxuICAgICAgZGVmYXVsdDogKCkgPT4gW10sXG4gICAgfSxcbiAgICB2YWxpZGF0ZU9uQmx1cjogQm9vbGVhbixcbiAgICB2YWx1ZTogeyByZXF1aXJlZDogZmFsc2UgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZXJyb3JCdWNrZXQ6IFtdIGFzIHN0cmluZ1tdLFxuICAgICAgaGFzQ29sb3I6IGZhbHNlLFxuICAgICAgaGFzRm9jdXNlZDogZmFsc2UsXG4gICAgICBoYXNJbnB1dDogZmFsc2UsXG4gICAgICBpc0ZvY3VzZWQ6IGZhbHNlLFxuICAgICAgaXNSZXNldHRpbmc6IGZhbHNlLFxuICAgICAgbGF6eVZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgIH1cbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGNvbXB1dGVkQ29sb3IgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgaWYgKHRoaXMuY29sb3IpIHJldHVybiB0aGlzLmNvbG9yXG4gICAgICAvLyBJdCdzIGFzc3VtZWQgdGhhdCBpZiB0aGUgaW5wdXQgaXMgb24gYVxuICAgICAgLy8gZGFyayBiYWNrZ3JvdW5kLCB0aGUgdXNlciB3aWxsIHdhbnQgdG9cbiAgICAgIC8vIGhhdmUgYSB3aGl0ZSBjb2xvci4gSWYgdGhlIGVudGlyZSBhcHBcbiAgICAgIC8vIGlzIHNldHVwIHRvIGJlIGRhcmssIHRoZW4gdGhleSB3aWxsXG4gICAgICAvLyBsaWtlIHdhbnQgdG8gdXNlIHRoZWlyIHByaW1hcnkgY29sb3JcbiAgICAgIGlmICh0aGlzLmlzRGFyayAmJiAhdGhpcy5hcHBJc0RhcmspIHJldHVybiAnd2hpdGUnXG4gICAgICBlbHNlIHJldHVybiAncHJpbWFyeSdcbiAgICB9LFxuICAgIGhhc0Vycm9yICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuaW50ZXJuYWxFcnJvck1lc3NhZ2VzLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgdGhpcy5lcnJvckJ1Y2tldC5sZW5ndGggPiAwIHx8XG4gICAgICAgIHRoaXMuZXJyb3JcbiAgICAgIClcbiAgICB9LFxuICAgIC8vIFRPRE86IEFkZCBsb2dpYyB0aGF0IGFsbG93cyB0aGUgdXNlciB0byBlbmFibGUgYmFzZWRcbiAgICAvLyB1cG9uIGEgZ29vZCB2YWxpZGF0aW9uXG4gICAgaGFzU3VjY2VzcyAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmludGVybmFsU3VjY2Vzc01lc3NhZ2VzLmxlbmd0aCA+IDAgfHxcbiAgICAgICAgdGhpcy5zdWNjZXNzXG4gICAgICApXG4gICAgfSxcbiAgICBleHRlcm5hbEVycm9yICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVybmFsRXJyb3JNZXNzYWdlcy5sZW5ndGggPiAwIHx8IHRoaXMuZXJyb3JcbiAgICB9LFxuICAgIGhhc01lc3NhZ2VzICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRpb25UYXJnZXQubGVuZ3RoID4gMFxuICAgIH0sXG4gICAgaGFzU3RhdGUgKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybiBmYWxzZVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmhhc1N1Y2Nlc3MgfHxcbiAgICAgICAgKHRoaXMuc2hvdWxkVmFsaWRhdGUgJiYgdGhpcy5oYXNFcnJvcilcbiAgICAgIClcbiAgICB9LFxuICAgIGludGVybmFsRXJyb3JNZXNzYWdlcyAoKTogSW5wdXRWYWxpZGF0aW9uUnVsZXMge1xuICAgICAgcmV0dXJuIHRoaXMuZ2VuSW50ZXJuYWxNZXNzYWdlcyh0aGlzLmVycm9yTWVzc2FnZXMpXG4gICAgfSxcbiAgICBpbnRlcm5hbE1lc3NhZ2VzICgpOiBJbnB1dFZhbGlkYXRpb25SdWxlcyB7XG4gICAgICByZXR1cm4gdGhpcy5nZW5JbnRlcm5hbE1lc3NhZ2VzKHRoaXMubWVzc2FnZXMpXG4gICAgfSxcbiAgICBpbnRlcm5hbFN1Y2Nlc3NNZXNzYWdlcyAoKTogSW5wdXRWYWxpZGF0aW9uUnVsZXMge1xuICAgICAgcmV0dXJuIHRoaXMuZ2VuSW50ZXJuYWxNZXNzYWdlcyh0aGlzLnN1Y2Nlc3NNZXNzYWdlcylcbiAgICB9LFxuICAgIGludGVybmFsVmFsdWU6IHtcbiAgICAgIGdldCAoKTogdW5rbm93biB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhenlWYWx1ZVxuICAgICAgfSxcbiAgICAgIHNldCAodmFsOiBhbnkpIHtcbiAgICAgICAgdGhpcy5sYXp5VmFsdWUgPSB2YWxcblxuICAgICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIHZhbClcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzaG91bGRWYWxpZGF0ZSAoKTogYm9vbGVhbiB7XG4gICAgICBpZiAodGhpcy5leHRlcm5hbEVycm9yKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKHRoaXMuaXNSZXNldHRpbmcpIHJldHVybiBmYWxzZVxuXG4gICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZU9uQmx1clxuICAgICAgICA/IHRoaXMuaGFzRm9jdXNlZCAmJiAhdGhpcy5pc0ZvY3VzZWRcbiAgICAgICAgOiAodGhpcy5oYXNJbnB1dCB8fCB0aGlzLmhhc0ZvY3VzZWQpXG4gICAgfSxcbiAgICB2YWxpZGF0aW9ucyAoKTogSW5wdXRWYWxpZGF0aW9uUnVsZXMge1xuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGlvblRhcmdldC5zbGljZSgwLCBOdW1iZXIodGhpcy5lcnJvckNvdW50KSlcbiAgICB9LFxuICAgIHZhbGlkYXRpb25TdGF0ZSAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgICBpZiAodGhpcy5oYXNFcnJvciAmJiB0aGlzLnNob3VsZFZhbGlkYXRlKSByZXR1cm4gJ2Vycm9yJ1xuICAgICAgaWYgKHRoaXMuaGFzU3VjY2VzcykgcmV0dXJuICdzdWNjZXNzJ1xuICAgICAgaWYgKHRoaXMuaGFzQ29sb3IpIHJldHVybiB0aGlzLmNvbXB1dGVkQ29sb3JcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZhbGlkYXRpb25UYXJnZXQgKCk6IElucHV0VmFsaWRhdGlvblJ1bGVzIHtcbiAgICAgIGlmICh0aGlzLmludGVybmFsRXJyb3JNZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsRXJyb3JNZXNzYWdlc1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnN1Y2Nlc3NNZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsU3VjY2Vzc01lc3NhZ2VzXG4gICAgICB9IGVsc2UgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1lc3NhZ2VzXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc2hvdWxkVmFsaWRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JCdWNrZXRcbiAgICAgIH0gZWxzZSByZXR1cm4gW11cbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgcnVsZXM6IHtcbiAgICAgIGhhbmRsZXIgKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgIGlmIChkZWVwRXF1YWwobmV3VmFsLCBvbGRWYWwpKSByZXR1cm5cbiAgICAgICAgdGhpcy52YWxpZGF0ZSgpXG4gICAgICB9LFxuICAgICAgZGVlcDogdHJ1ZSxcbiAgICB9LFxuICAgIGludGVybmFsVmFsdWUgKCkge1xuICAgICAgLy8gSWYgaXQncyB0aGUgZmlyc3QgdGltZSB3ZSdyZSBzZXR0aW5nIGlucHV0LFxuICAgICAgLy8gbWFyayBpdCB3aXRoIGhhc0lucHV0XG4gICAgICB0aGlzLmhhc0lucHV0ID0gdHJ1ZVxuICAgICAgdGhpcy52YWxpZGF0ZU9uQmx1ciB8fCB0aGlzLiRuZXh0VGljayh0aGlzLnZhbGlkYXRlKVxuICAgIH0sXG4gICAgaXNGb2N1c2VkICh2YWwpIHtcbiAgICAgIC8vIFNob3VsZCBub3QgY2hlY2sgdmFsaWRhdGlvblxuICAgICAgLy8gaWYgZGlzYWJsZWRcbiAgICAgIGlmIChcbiAgICAgICAgIXZhbCAmJlxuICAgICAgICAhdGhpcy5kaXNhYmxlZFxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuaGFzRm9jdXNlZCA9IHRydWVcbiAgICAgICAgdGhpcy52YWxpZGF0ZU9uQmx1ciAmJiB0aGlzLiRuZXh0VGljayh0aGlzLnZhbGlkYXRlKVxuICAgICAgfVxuICAgIH0sXG4gICAgaXNSZXNldHRpbmcgKCkge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuaGFzSW5wdXQgPSBmYWxzZVxuICAgICAgICB0aGlzLmhhc0ZvY3VzZWQgPSBmYWxzZVxuICAgICAgICB0aGlzLmlzUmVzZXR0aW5nID0gZmFsc2VcbiAgICAgICAgdGhpcy52YWxpZGF0ZSgpXG4gICAgICB9LCAwKVxuICAgIH0sXG4gICAgaGFzRXJyb3IgKHZhbCkge1xuICAgICAgaWYgKHRoaXMuc2hvdWxkVmFsaWRhdGUpIHtcbiAgICAgICAgdGhpcy4kZW1pdCgndXBkYXRlOmVycm9yJywgdmFsKVxuICAgICAgfVxuICAgIH0sXG4gICAgdmFsdWUgKHZhbCkge1xuICAgICAgdGhpcy5sYXp5VmFsdWUgPSB2YWxcbiAgICB9LFxuICB9LFxuXG4gIGJlZm9yZU1vdW50ICgpIHtcbiAgICB0aGlzLnZhbGlkYXRlKClcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICB0aGlzLmZvcm0gJiYgdGhpcy5mb3JtLnJlZ2lzdGVyKHRoaXMpXG4gIH0sXG5cbiAgYmVmb3JlRGVzdHJveSAoKSB7XG4gICAgdGhpcy5mb3JtICYmIHRoaXMuZm9ybS51bnJlZ2lzdGVyKHRoaXMpXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkludGVybmFsTWVzc2FnZXMgKG1lc3NhZ2VzOiBJbnB1dE1lc3NhZ2UpOiBJbnB1dFZhbGlkYXRpb25SdWxlcyB7XG4gICAgICBpZiAoIW1lc3NhZ2VzKSByZXR1cm4gW11cbiAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSByZXR1cm4gbWVzc2FnZXNcbiAgICAgIGVsc2UgcmV0dXJuIFttZXNzYWdlc11cbiAgICB9LFxuICAgIC8qKiBAcHVibGljICovXG4gICAgcmVzZXQgKCkge1xuICAgICAgdGhpcy5pc1Jlc2V0dGluZyA9IHRydWVcbiAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IEFycmF5LmlzQXJyYXkodGhpcy5pbnRlcm5hbFZhbHVlKVxuICAgICAgICA/IFtdXG4gICAgICAgIDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICAvKiogQHB1YmxpYyAqL1xuICAgIHJlc2V0VmFsaWRhdGlvbiAoKSB7XG4gICAgICB0aGlzLmlzUmVzZXR0aW5nID0gdHJ1ZVxuICAgIH0sXG4gICAgLyoqIEBwdWJsaWMgKi9cbiAgICB2YWxpZGF0ZSAoZm9yY2UgPSBmYWxzZSwgdmFsdWU/OiBhbnkpOiBib29sZWFuIHtcbiAgICAgIGNvbnN0IGVycm9yQnVja2V0ID0gW11cbiAgICAgIHZhbHVlID0gdmFsdWUgfHwgdGhpcy5pbnRlcm5hbFZhbHVlXG5cbiAgICAgIGlmIChmb3JjZSkgdGhpcy5oYXNJbnB1dCA9IHRoaXMuaGFzRm9jdXNlZCA9IHRydWVcblxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucnVsZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHJ1bGUgPSB0aGlzLnJ1bGVzW2luZGV4XVxuICAgICAgICBjb25zdCB2YWxpZCA9IHR5cGVvZiBydWxlID09PSAnZnVuY3Rpb24nID8gcnVsZSh2YWx1ZSkgOiBydWxlXG5cbiAgICAgICAgaWYgKHZhbGlkID09PSBmYWxzZSB8fCB0eXBlb2YgdmFsaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZXJyb3JCdWNrZXQucHVzaCh2YWxpZCB8fCAnJylcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsaWQgIT09ICdib29sZWFuJykge1xuICAgICAgICAgIGNvbnNvbGVFcnJvcihgUnVsZXMgc2hvdWxkIHJldHVybiBhIHN0cmluZyBvciBib29sZWFuLCByZWNlaXZlZCAnJHt0eXBlb2YgdmFsaWR9JyBpbnN0ZWFkYCwgdGhpcylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVycm9yQnVja2V0ID0gZXJyb3JCdWNrZXRcbiAgICAgIHRoaXMudmFsaWQgPSBlcnJvckJ1Y2tldC5sZW5ndGggPT09IDBcblxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==