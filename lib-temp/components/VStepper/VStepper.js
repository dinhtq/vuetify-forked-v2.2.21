// Styles
import './VStepper.sass';
// Mixins
import { provide as RegistrableProvide } from '../../mixins/registrable';
import Proxyable from '../../mixins/proxyable';
import Themeable from '../../mixins/themeable';
// Utilities
import mixins from '../../util/mixins';
import { breaking } from '../../util/console';
const baseMixins = mixins(RegistrableProvide('stepper'), Proxyable, Themeable);
/* @vue/component */
export default baseMixins.extend({
    name: 'v-stepper',
    provide() {
        return {
            stepClick: this.stepClick,
            isVertical: this.vertical,
        };
    },
    props: {
        altLabels: Boolean,
        nonLinear: Boolean,
        vertical: Boolean,
    },
    data() {
        const data = {
            isBooted: false,
            steps: [],
            content: [],
            isReverse: false,
        };
        data.internalLazyValue = this.value != null
            ? this.value
            : (data[0] || {}).step || 1;
        return data;
    },
    computed: {
        classes() {
            return {
                'v-stepper--is-booted': this.isBooted,
                'v-stepper--vertical': this.vertical,
                'v-stepper--alt-labels': this.altLabels,
                'v-stepper--non-linear': this.nonLinear,
                ...this.themeClasses,
            };
        },
    },
    watch: {
        internalValue(val, oldVal) {
            this.isReverse = Number(val) < Number(oldVal);
            oldVal && (this.isBooted = true);
            this.updateView();
        },
    },
    created() {
        /* istanbul ignore next */
        if (this.$listeners.input) {
            breaking('@input', '@change', this);
        }
    },
    mounted() {
        this.updateView();
    },
    methods: {
        register(item) {
            if (item.$options.name === 'v-stepper-step') {
                this.steps.push(item);
            }
            else if (item.$options.name === 'v-stepper-content') {
                item.isVertical = this.vertical;
                this.content.push(item);
            }
        },
        unregister(item) {
            if (item.$options.name === 'v-stepper-step') {
                this.steps = this.steps.filter((i) => i !== item);
            }
            else if (item.$options.name === 'v-stepper-content') {
                item.isVertical = this.vertical;
                this.content = this.content.filter((i) => i !== item);
            }
        },
        stepClick(step) {
            this.$nextTick(() => (this.internalValue = step));
        },
        updateView() {
            for (let index = this.steps.length; --index >= 0;) {
                this.steps[index].toggle(this.internalValue);
            }
            for (let index = this.content.length; --index >= 0;) {
                this.content[index].toggle(this.internalValue, this.isReverse);
            }
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-stepper',
            class: this.classes,
        }, this.$slots.default);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlN0ZXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WU3RlcHBlci9WU3RlcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxpQkFBaUIsQ0FBQTtBQU14QixTQUFTO0FBQ1QsT0FBTyxFQUFFLE9BQU8sSUFBSSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ3hFLE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBRTlDLFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFLN0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN2QixrQkFBa0IsQ0FBQyxTQUFTLENBQUMsRUFDN0IsU0FBUyxFQUNULFNBQVMsQ0FDVixDQUFBO0FBS0Qsb0JBQW9CO0FBQ3BCLGVBQWUsVUFBVSxDQUFDLE1BQU0sQ0FBQztJQUMvQixJQUFJLEVBQUUsV0FBVztJQUVqQixPQUFPO1FBQ0wsT0FBTztZQUNMLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDMUIsQ0FBQTtJQUNILENBQUM7SUFFRCxLQUFLLEVBQUU7UUFDTCxTQUFTLEVBQUUsT0FBTztRQUNsQixTQUFTLEVBQUUsT0FBTztRQUNsQixRQUFRLEVBQUUsT0FBTztLQUNsQjtJQUVELElBQUk7UUFDRixNQUFNLElBQUksR0FBb0I7WUFDNUIsUUFBUSxFQUFFLEtBQUs7WUFDZixLQUFLLEVBQUUsRUFBNEI7WUFDbkMsT0FBTyxFQUFFLEVBQStCO1lBQ3hDLFNBQVMsRUFBRSxLQUFLO1NBQ2pCLENBQUE7UUFFRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJO1lBQ3pD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QUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRztnQkFDbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQW9CLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO2FBQ3RFO1FBQ0gsQ0FBQztLQUNGO0lBRUQsTUFBTSxDQUFFLENBQUM7UUFDUCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDZCxXQUFXLEVBQUUsV0FBVztZQUN4QixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87U0FDcEIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3pCLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WU3RlcHBlci5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVlN0ZXBwZXJTdGVwIGZyb20gJy4vVlN0ZXBwZXJTdGVwJ1xuaW1wb3J0IFZTdGVwcGVyQ29udGVudCBmcm9tICcuL1ZTdGVwcGVyQ29udGVudCdcblxuLy8gTWl4aW5zXG5pbXBvcnQgeyBwcm92aWRlIGFzIFJlZ2lzdHJhYmxlUHJvdmlkZSB9IGZyb20gJy4uLy4uL21peGlucy9yZWdpc3RyYWJsZSdcbmltcG9ydCBQcm94eWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3Byb3h5YWJsZSdcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RoZW1lYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgYnJlYWtpbmcgfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgUmVnaXN0cmFibGVQcm92aWRlKCdzdGVwcGVyJyksXG4gIFByb3h5YWJsZSxcbiAgVGhlbWVhYmxlXG4pXG5cbnR5cGUgVlN0ZXBwZXJTdGVwSW5zdGFuY2UgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIFZTdGVwcGVyU3RlcD5cbnR5cGUgVlN0ZXBwZXJDb250ZW50SW5zdGFuY2UgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIFZTdGVwcGVyQ29udGVudD5cblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IGJhc2VNaXhpbnMuZXh0ZW5kKHtcbiAgbmFtZTogJ3Ytc3RlcHBlcicsXG5cbiAgcHJvdmlkZSAoKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RlcENsaWNrOiB0aGlzLnN0ZXBDbGljayxcbiAgICAgIGlzVmVydGljYWw6IHRoaXMudmVydGljYWwsXG4gICAgfVxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgYWx0TGFiZWxzOiBCb29sZWFuLFxuICAgIG5vbkxpbmVhcjogQm9vbGVhbixcbiAgICB2ZXJ0aWNhbDogQm9vbGVhbixcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICBjb25zdCBkYXRhOiBEaWN0aW9uYXJ5PGFueT4gPSB7XG4gICAgICBpc0Jvb3RlZDogZmFsc2UsXG4gICAgICBzdGVwczogW10gYXMgVlN0ZXBwZXJTdGVwSW5zdGFuY2VbXSxcbiAgICAgIGNvbnRlbnQ6IFtdIGFzIFZTdGVwcGVyQ29udGVudEluc3RhbmNlW10sXG4gICAgICBpc1JldmVyc2U6IGZhbHNlLFxuICAgIH1cblxuICAgIGRhdGEuaW50ZXJuYWxMYXp5VmFsdWUgPSB0aGlzLnZhbHVlICE9IG51bGxcbiAgICAgID8gdGhpcy52YWx1ZVxuICAgICAgOiAoZGF0YVswXSB8fCB7fSkuc3RlcCB8fCAxXG5cbiAgICByZXR1cm4gZGF0YVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LXN0ZXBwZXItLWlzLWJvb3RlZCc6IHRoaXMuaXNCb290ZWQsXG4gICAgICAgICd2LXN0ZXBwZXItLXZlcnRpY2FsJzogdGhpcy52ZXJ0aWNhbCxcbiAgICAgICAgJ3Ytc3RlcHBlci0tYWx0LWxhYmVscyc6IHRoaXMuYWx0TGFiZWxzLFxuICAgICAgICAndi1zdGVwcGVyLS1ub24tbGluZWFyJzogdGhpcy5ub25MaW5lYXIsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBpbnRlcm5hbFZhbHVlICh2YWwsIG9sZFZhbCkge1xuICAgICAgdGhpcy5pc1JldmVyc2UgPSBOdW1iZXIodmFsKSA8IE51bWJlcihvbGRWYWwpXG5cbiAgICAgIG9sZFZhbCAmJiAodGhpcy5pc0Jvb3RlZCA9IHRydWUpXG5cbiAgICAgIHRoaXMudXBkYXRlVmlldygpXG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICh0aGlzLiRsaXN0ZW5lcnMuaW5wdXQpIHtcbiAgICAgIGJyZWFraW5nKCdAaW5wdXQnLCAnQGNoYW5nZScsIHRoaXMpXG4gICAgfVxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIHRoaXMudXBkYXRlVmlldygpXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIHJlZ2lzdGVyIChpdGVtOiBWU3RlcHBlclN0ZXBJbnN0YW5jZSB8IFZTdGVwcGVyQ29udGVudEluc3RhbmNlKSB7XG4gICAgICBpZiAoaXRlbS4kb3B0aW9ucy5uYW1lID09PSAndi1zdGVwcGVyLXN0ZXAnKSB7XG4gICAgICAgIHRoaXMuc3RlcHMucHVzaChpdGVtIGFzIFZTdGVwcGVyU3RlcEluc3RhbmNlKVxuICAgICAgfSBlbHNlIGlmIChpdGVtLiRvcHRpb25zLm5hbWUgPT09ICd2LXN0ZXBwZXItY29udGVudCcpIHtcbiAgICAgICAgKGl0ZW0gYXMgVlN0ZXBwZXJDb250ZW50SW5zdGFuY2UpLmlzVmVydGljYWwgPSB0aGlzLnZlcnRpY2FsXG4gICAgICAgIHRoaXMuY29udGVudC5wdXNoKGl0ZW0gYXMgVlN0ZXBwZXJDb250ZW50SW5zdGFuY2UpXG4gICAgICB9XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyIChpdGVtOiBWU3RlcHBlclN0ZXBJbnN0YW5jZSB8IFZTdGVwcGVyQ29udGVudEluc3RhbmNlKSB7XG4gICAgICBpZiAoaXRlbS4kb3B0aW9ucy5uYW1lID09PSAndi1zdGVwcGVyLXN0ZXAnKSB7XG4gICAgICAgIHRoaXMuc3RlcHMgPSB0aGlzLnN0ZXBzLmZpbHRlcigoaTogVlN0ZXBwZXJTdGVwSW5zdGFuY2UpID0+IGkgIT09IGl0ZW0pXG4gICAgICB9IGVsc2UgaWYgKGl0ZW0uJG9wdGlvbnMubmFtZSA9PT0gJ3Ytc3RlcHBlci1jb250ZW50Jykge1xuICAgICAgICAoaXRlbSBhcyBWU3RlcHBlckNvbnRlbnRJbnN0YW5jZSkuaXNWZXJ0aWNhbCA9IHRoaXMudmVydGljYWxcbiAgICAgICAgdGhpcy5jb250ZW50ID0gdGhpcy5jb250ZW50LmZpbHRlcigoaTogVlN0ZXBwZXJDb250ZW50SW5zdGFuY2UpID0+IGkgIT09IGl0ZW0pXG4gICAgICB9XG4gICAgfSxcbiAgICBzdGVwQ2xpY2sgKHN0ZXA6IHN0cmluZyB8IG51bWJlcikge1xuICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gKHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHN0ZXApKVxuICAgIH0sXG4gICAgdXBkYXRlVmlldyAoKSB7XG4gICAgICBmb3IgKGxldCBpbmRleCA9IHRoaXMuc3RlcHMubGVuZ3RoOyAtLWluZGV4ID49IDA7KSB7XG4gICAgICAgIHRoaXMuc3RlcHNbaW5kZXhdLnRvZ2dsZSh0aGlzLmludGVybmFsVmFsdWUgYXMgYW55KVxuICAgICAgfVxuICAgICAgZm9yIChsZXQgaW5kZXggPSB0aGlzLmNvbnRlbnQubGVuZ3RoOyAtLWluZGV4ID49IDA7KSB7XG4gICAgICAgIHRoaXMuY29udGVudFtpbmRleF0udG9nZ2xlKHRoaXMuaW50ZXJuYWxWYWx1ZSBhcyBhbnksIHRoaXMuaXNSZXZlcnNlKVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKCdkaXYnLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3Ytc3RlcHBlcicsXG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgIH0sIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gIH0sXG59KVxuIl19