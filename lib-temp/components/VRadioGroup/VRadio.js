// Styles
import './VRadio.sass';
import VLabel from '../VLabel';
import VIcon from '../VIcon';
import VInput from '../VInput';
// Mixins
import BindsAttrs from '../../mixins/binds-attrs';
import Colorable from '../../mixins/colorable';
import { factory as GroupableFactory } from '../../mixins/groupable';
import Rippleable from '../../mixins/rippleable';
import Themeable from '../../mixins/themeable';
import Selectable from '../../mixins/selectable';
// Utilities
import { getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(BindsAttrs, Colorable, Rippleable, GroupableFactory('radioGroup'), Themeable);
/* @vue/component */
export default baseMixins.extend().extend({
    name: 'v-radio',
    inheritAttrs: false,
    props: {
        disabled: Boolean,
        id: String,
        label: String,
        name: String,
        offIcon: {
            type: String,
            default: '$radioOff',
        },
        onIcon: {
            type: String,
            default: '$radioOn',
        },
        readonly: Boolean,
        value: {
            default: null,
        },
    },
    data: () => ({
        isFocused: false,
    }),
    computed: {
        classes() {
            return {
                'v-radio--is-disabled': this.isDisabled,
                'v-radio--is-focused': this.isFocused,
                ...this.themeClasses,
                ...this.groupClasses,
            };
        },
        computedColor() {
            return Selectable.options.computed.computedColor.call(this);
        },
        computedIcon() {
            return this.isActive
                ? this.onIcon
                : this.offIcon;
        },
        computedId() {
            return VInput.options.computed.computedId.call(this);
        },
        hasLabel: VInput.options.computed.hasLabel,
        hasState() {
            return (this.radioGroup || {}).hasState;
        },
        isDisabled() {
            return this.disabled || !!(this.radioGroup || {}).disabled;
        },
        isReadonly() {
            return this.readonly || !!(this.radioGroup || {}).readonly;
        },
        computedName() {
            if (this.name || !this.radioGroup) {
                return this.name;
            }
            return this.radioGroup.name || `radio-${this.radioGroup._uid}`;
        },
        rippleState() {
            return Selectable.options.computed.rippleState.call(this);
        },
        validationState() {
            return (this.radioGroup || {}).validationState || this.computedColor;
        },
    },
    methods: {
        genInput(args) {
            // We can't actually use the mixin directly because
            // it's made for standalone components, but its
            // genInput method is exactly what we need
            return Selectable.options.methods.genInput.call(this, 'radio', args);
        },
        genLabel() {
            if (!this.hasLabel)
                return null;
            return this.$createElement(VLabel, {
                on: {
                    click: (e) => {
                        // Prevent label from
                        // causing the input
                        // to focus
                        e.preventDefault();
                        this.onChange();
                    },
                },
                attrs: {
                    for: this.computedId,
                },
                props: {
                    color: this.validationState,
                    focused: this.hasState,
                },
            }, getSlot(this, 'label') || this.label);
        },
        genRadio() {
            return this.$createElement('div', {
                staticClass: 'v-input--selection-controls__input',
            }, [
                this.$createElement(VIcon, this.setTextColor(this.validationState, {
                    props: {
                        dense: this.radioGroup && this.radioGroup.dense,
                    },
                }), this.computedIcon),
                this.genInput({
                    name: this.computedName,
                    value: this.value,
                    ...this.attrs$,
                }),
                this.genRipple(this.setTextColor(this.rippleState)),
            ]);
        },
        onFocus(e) {
            this.isFocused = true;
            this.$emit('focus', e);
        },
        onBlur(e) {
            this.isFocused = false;
            this.$emit('blur', e);
        },
        onChange() {
            if (this.isDisabled || this.isReadonly || this.isActive)
                return;
            this.toggle();
        },
        onKeydown: () => { },
    },
    render(h) {
        const data = {
            staticClass: 'v-radio',
            class: this.classes,
        };
        return h('div', data, [
            this.genRadio(),
            this.genLabel(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlJhZGlvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVlJhZGlvR3JvdXAvVlJhZGlvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLGVBQWUsQ0FBQTtBQUl0QixPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUE7QUFDOUIsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sTUFBTSxNQUFNLFdBQVcsQ0FBQTtBQUU5QixTQUFTO0FBQ1QsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3BFLE9BQU8sVUFBVSxNQUFNLHlCQUF5QixDQUFBO0FBQ2hELE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sVUFBVSxNQUFNLHlCQUF5QixDQUFBO0FBRWhELFlBQVk7QUFDWixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFJNUMsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFFdEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN2QixVQUFVLEVBQ1YsU0FBUyxFQUNULFVBQVUsRUFDVixnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsRUFDOUIsU0FBUyxDQUNWLENBQUE7QUFNRCxvQkFBb0I7QUFDcEIsZUFBZSxVQUFVLENBQUMsTUFBTSxFQUFXLENBQUMsTUFBTSxDQUFDO0lBQ2pELElBQUksRUFBRSxTQUFTO0lBRWYsWUFBWSxFQUFFLEtBQUs7SUFFbkIsS0FBSyxFQUFFO1FBQ0wsUUFBUSxFQUFFLE9BQU87UUFDakIsRUFBRSxFQUFFLE1BQU07UUFDVixLQUFLLEVBQUUsTUFBTTtRQUNiLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFF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Q3JCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLENBQUM7UUFDRCxNQUFNLENBQUUsQ0FBUTtZQUNkLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFBO1lBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3ZCLENBQUM7UUFDRCxRQUFRO1lBQ04sSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFFBQVE7Z0JBQUUsT0FBTTtZQUUvRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDZixDQUFDO1FBQ0QsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFFLENBQUM7S0FDcEI7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE1BQU0sSUFBSSxHQUFHO1lBQ1gsV0FBVyxFQUFFLFNBQVM7WUFDdEIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQ1AsQ0FBQTtRQUVkLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxRQUFRLEVBQUU7U0FDaEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZSYWRpby5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVlJhZGlvR3JvdXAgZnJvbSAnLi9WUmFkaW9Hcm91cCdcbmltcG9ydCBWTGFiZWwgZnJvbSAnLi4vVkxhYmVsJ1xuaW1wb3J0IFZJY29uIGZyb20gJy4uL1ZJY29uJ1xuaW1wb3J0IFZJbnB1dCBmcm9tICcuLi9WSW5wdXQnXG5cbi8vIE1peGluc1xuaW1wb3J0IEJpbmRzQXR0cnMgZnJvbSAnLi4vLi4vbWl4aW5zL2JpbmRzLWF0dHJzJ1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IHsgZmFjdG9yeSBhcyBHcm91cGFibGVGYWN0b3J5IH0gZnJvbSAnLi4vLi4vbWl4aW5zL2dyb3VwYWJsZSdcbmltcG9ydCBSaXBwbGVhYmxlIGZyb20gJy4uLy4uL21peGlucy9yaXBwbGVhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuaW1wb3J0IFNlbGVjdGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3NlbGVjdGFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IHsgZ2V0U2xvdCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBWTm9kZURhdGEgfSBmcm9tICd2dWUnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuXG5jb25zdCBiYXNlTWl4aW5zID0gbWl4aW5zKFxuICBCaW5kc0F0dHJzLFxuICBDb2xvcmFibGUsXG4gIFJpcHBsZWFibGUsXG4gIEdyb3VwYWJsZUZhY3RvcnkoJ3JhZGlvR3JvdXAnKSxcbiAgVGhlbWVhYmxlXG4pXG5cbmludGVyZmFjZSBvcHRpb25zIGV4dGVuZHMgSW5zdGFuY2VUeXBlPHR5cGVvZiBiYXNlTWl4aW5zPiB7XG4gIHJhZGlvR3JvdXA6IEluc3RhbmNlVHlwZTx0eXBlb2YgVlJhZGlvR3JvdXA+XG59XG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZDxvcHRpb25zPigpLmV4dGVuZCh7XG4gIG5hbWU6ICd2LXJhZGlvJyxcblxuICBpbmhlcml0QXR0cnM6IGZhbHNlLFxuXG4gIHByb3BzOiB7XG4gICAgZGlzYWJsZWQ6IEJvb2xlYW4sXG4gICAgaWQ6IFN0cmluZyxcbiAgICBsYWJlbDogU3RyaW5nLFxuICAgIG5hbWU6IFN0cmluZyxcbiAgICBvZmZJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHJhZGlvT2ZmJyxcbiAgICB9LFxuICAgIG9uSWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRyYWRpb09uJyxcbiAgICB9LFxuICAgIHJlYWRvbmx5OiBCb29sZWFuLFxuICAgIHZhbHVlOiB7XG4gICAgICBkZWZhdWx0OiBudWxsLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBpc0ZvY3VzZWQ6IGZhbHNlLFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndi1yYWRpby0taXMtZGlzYWJsZWQnOiB0aGlzLmlzRGlzYWJsZWQsXG4gICAgICAgICd2LXJhZGlvLS1pcy1mb2N1c2VkJzogdGhpcy5pc0ZvY3VzZWQsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgICAuLi50aGlzLmdyb3VwQ2xhc3NlcyxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkQ29sb3IgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICByZXR1cm4gU2VsZWN0YWJsZS5vcHRpb25zLmNvbXB1dGVkLmNvbXB1dGVkQ29sb3IuY2FsbCh0aGlzKVxuICAgIH0sXG4gICAgY29tcHV0ZWRJY29uICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMuaXNBY3RpdmVcbiAgICAgICAgPyB0aGlzLm9uSWNvblxuICAgICAgICA6IHRoaXMub2ZmSWNvblxuICAgIH0sXG4gICAgY29tcHV0ZWRJZCAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBWSW5wdXQub3B0aW9ucy5jb21wdXRlZC5jb21wdXRlZElkLmNhbGwodGhpcylcbiAgICB9LFxuICAgIGhhc0xhYmVsOiBWSW5wdXQub3B0aW9ucy5jb21wdXRlZC5oYXNMYWJlbCxcbiAgICBoYXNTdGF0ZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gKHRoaXMucmFkaW9Hcm91cCB8fCB7fSkuaGFzU3RhdGVcbiAgICB9LFxuICAgIGlzRGlzYWJsZWQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgfHwgISEodGhpcy5yYWRpb0dyb3VwIHx8IHt9KS5kaXNhYmxlZFxuICAgIH0sXG4gICAgaXNSZWFkb25seSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5yZWFkb25seSB8fCAhISh0aGlzLnJhZGlvR3JvdXAgfHwge30pLnJlYWRvbmx5XG4gICAgfSxcbiAgICBjb21wdXRlZE5hbWUgKCk6IHN0cmluZyB7XG4gICAgICBpZiAodGhpcy5uYW1lIHx8ICF0aGlzLnJhZGlvR3JvdXApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yYWRpb0dyb3VwLm5hbWUgfHwgYHJhZGlvLSR7dGhpcy5yYWRpb0dyb3VwLl91aWR9YFxuICAgIH0sXG4gICAgcmlwcGxlU3RhdGUgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICByZXR1cm4gU2VsZWN0YWJsZS5vcHRpb25zLmNvbXB1dGVkLnJpcHBsZVN0YXRlLmNhbGwodGhpcylcbiAgICB9LFxuICAgIHZhbGlkYXRpb25TdGF0ZSAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIHJldHVybiAodGhpcy5yYWRpb0dyb3VwIHx8IHt9KS52YWxpZGF0aW9uU3RhdGUgfHwgdGhpcy5jb21wdXRlZENvbG9yXG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuSW5wdXQgKGFyZ3M6IGFueSkge1xuICAgICAgLy8gV2UgY2FuJ3QgYWN0dWFsbHkgdXNlIHRoZSBtaXhpbiBkaXJlY3RseSBiZWNhdXNlXG4gICAgICAvLyBpdCdzIG1hZGUgZm9yIHN0YW5kYWxvbmUgY29tcG9uZW50cywgYnV0IGl0c1xuICAgICAgLy8gZ2VuSW5wdXQgbWV0aG9kIGlzIGV4YWN0bHkgd2hhdCB3ZSBuZWVkXG4gICAgICByZXR1cm4gU2VsZWN0YWJsZS5vcHRpb25zLm1ldGhvZHMuZ2VuSW5wdXQuY2FsbCh0aGlzLCAncmFkaW8nLCBhcmdzKVxuICAgIH0sXG4gICAgZ2VuTGFiZWwgKCkge1xuICAgICAgaWYgKCF0aGlzLmhhc0xhYmVsKSByZXR1cm4gbnVsbFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWTGFiZWwsIHtcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjbGljazogKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBQcmV2ZW50IGxhYmVsIGZyb21cbiAgICAgICAgICAgIC8vIGNhdXNpbmcgdGhlIGlucHV0XG4gICAgICAgICAgICAvLyB0byBmb2N1c1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2UoKVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgZm9yOiB0aGlzLmNvbXB1dGVkSWQsXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgY29sb3I6IHRoaXMudmFsaWRhdGlvblN0YXRlLFxuICAgICAgICAgIGZvY3VzZWQ6IHRoaXMuaGFzU3RhdGUsXG4gICAgICAgIH0sXG4gICAgICB9LCBnZXRTbG90KHRoaXMsICdsYWJlbCcpIHx8IHRoaXMubGFiZWwpXG4gICAgfSxcbiAgICBnZW5SYWRpbyAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtaW5wdXQtLXNlbGVjdGlvbi1jb250cm9sc19faW5wdXQnLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCB0aGlzLnNldFRleHRDb2xvcih0aGlzLnZhbGlkYXRpb25TdGF0ZSwge1xuICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBkZW5zZTogdGhpcy5yYWRpb0dyb3VwICYmIHRoaXMucmFkaW9Hcm91cC5kZW5zZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KSwgdGhpcy5jb21wdXRlZEljb24pLFxuICAgICAgICB0aGlzLmdlbklucHV0KHtcbiAgICAgICAgICBuYW1lOiB0aGlzLmNvbXB1dGVkTmFtZSxcbiAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZSxcbiAgICAgICAgICAuLi50aGlzLmF0dHJzJCxcbiAgICAgICAgfSksXG4gICAgICAgIHRoaXMuZ2VuUmlwcGxlKHRoaXMuc2V0VGV4dENvbG9yKHRoaXMucmlwcGxlU3RhdGUpKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBvbkZvY3VzIChlOiBFdmVudCkge1xuICAgICAgdGhpcy5pc0ZvY3VzZWQgPSB0cnVlXG4gICAgICB0aGlzLiRlbWl0KCdmb2N1cycsIGUpXG4gICAgfSxcbiAgICBvbkJsdXIgKGU6IEV2ZW50KSB7XG4gICAgICB0aGlzLmlzRm9jdXNlZCA9IGZhbHNlXG4gICAgICB0aGlzLiRlbWl0KCdibHVyJywgZSlcbiAgICB9LFxuICAgIG9uQ2hhbmdlICgpIHtcbiAgICAgIGlmICh0aGlzLmlzRGlzYWJsZWQgfHwgdGhpcy5pc1JlYWRvbmx5IHx8IHRoaXMuaXNBY3RpdmUpIHJldHVyblxuXG4gICAgICB0aGlzLnRvZ2dsZSgpXG4gICAgfSxcbiAgICBvbktleWRvd246ICgpID0+IHt9LCAvLyBPdmVycmlkZSBkZWZhdWx0IHdpdGggbm9vcFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LXJhZGlvJyxcbiAgICAgIGNsYXNzOiB0aGlzLmNsYXNzZXMsXG4gICAgfSBhcyBWTm9kZURhdGFcblxuICAgIHJldHVybiBoKCdkaXYnLCBkYXRhLCBbXG4gICAgICB0aGlzLmdlblJhZGlvKCksXG4gICAgICB0aGlzLmdlbkxhYmVsKCksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=