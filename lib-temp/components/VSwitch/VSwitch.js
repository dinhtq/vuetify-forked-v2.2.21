// Styles
import '../../styles/components/_selection-controls.sass';
import './VSwitch.sass';
// Mixins
import Selectable from '../../mixins/selectable';
import VInput from '../VInput';
// Directives
import Touch from '../../directives/touch';
// Components
import { VFabTransition } from '../transitions';
import VProgressCircular from '../VProgressCircular/VProgressCircular';
// Helpers
import { keyCodes } from '../../util/helpers';
/* @vue/component */
export default Selectable.extend({
    name: 'v-switch',
    directives: { Touch },
    props: {
        inset: Boolean,
        loading: {
            type: [Boolean, String],
            default: false,
        },
        flat: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        classes() {
            return {
                ...VInput.options.computed.classes.call(this),
                'v-input--selection-controls v-input--switch': true,
                'v-input--switch--flat': this.flat,
                'v-input--switch--inset': this.inset,
            };
        },
        attrs() {
            return {
                'aria-checked': String(this.isActive),
                'aria-disabled': String(this.disabled),
                role: 'switch',
            };
        },
        // Do not return undefined if disabled,
        // according to spec, should still show
        // a color when disabled and active
        validationState() {
            if (this.hasError && this.shouldValidate)
                return 'error';
            if (this.hasSuccess)
                return 'success';
            if (this.hasColor !== null)
                return this.computedColor;
            return undefined;
        },
        switchData() {
            return this.setTextColor(this.loading ? undefined : this.validationState, {
                class: this.themeClasses,
            });
        },
    },
    methods: {
        genDefaultSlot() {
            return [
                this.genSwitch(),
                this.genLabel(),
            ];
        },
        genSwitch() {
            return this.$createElement('div', {
                staticClass: 'v-input--selection-controls__input',
            }, [
                this.genInput('checkbox', {
                    ...this.attrs,
                    ...this.attrs$,
                }),
                this.genRipple(this.setTextColor(this.validationState, {
                    directives: [{
                            name: 'touch',
                            value: {
                                left: this.onSwipeLeft,
                                right: this.onSwipeRight,
                            },
                        }],
                })),
                this.$createElement('div', {
                    staticClass: 'v-input--switch__track',
                    ...this.switchData,
                }),
                this.$createElement('div', {
                    staticClass: 'v-input--switch__thumb',
                    ...this.switchData,
                }, [this.genProgress()]),
            ]);
        },
        genProgress() {
            return this.$createElement(VFabTransition, {}, [
                this.loading === false
                    ? null
                    : this.$slots.progress || this.$createElement(VProgressCircular, {
                        props: {
                            color: (this.loading === true || this.loading === '')
                                ? (this.color || 'primary')
                                : this.loading,
                            size: 16,
                            width: 2,
                            indeterminate: true,
                        },
                    }),
            ]);
        },
        onSwipeLeft() {
            if (this.isActive)
                this.onChange();
        },
        onSwipeRight() {
            if (!this.isActive)
                this.onChange();
        },
        onKeydown(e) {
            if ((e.keyCode === keyCodes.left && this.isActive) ||
                (e.keyCode === keyCodes.right && !this.isActive))
                this.onChange();
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlN3aXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZTd2l0Y2gvVlN3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxrREFBa0QsQ0FBQTtBQUN6RCxPQUFPLGdCQUFnQixDQUFBO0FBRXZCLFNBQVM7QUFDVCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUE7QUFFOUIsYUFBYTtBQUNiLE9BQU8sS0FBSyxNQUFNLHdCQUF3QixDQUFBO0FBRTFDLGFBQWE7QUFDYixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDL0MsT0FBTyxpQkFBaUIsTUFBTSx3Q0FBd0MsQ0FBQTtBQUV0RSxVQUFVO0FBQ1YsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBSzdDLG9CQUFvQjtBQUNwQixlQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDL0IsSUFBSSxFQUFFLFVBQVU7SUFFaEIsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFO0lBRXJCLEtBQUssRUFBRTtRQUNMLEtBQUssRUFBRSxPQUFPO1FBQ2QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztZQUN2QixPQUFPLEVBQUUsS0FBSztTQUNmO1FBQ0QsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsS0FBSztTQUNmO0tBQ0Y7SUFFRCxRQUFRLEVBQUU7UUFDUixPQUFPO1lBQ0wsT0FBTztnQkFDTCxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUM3Qyw2Q0FBNkMsRUFBRSxJQUFJO2dCQUNuRCx1QkFBdUIsRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDbEMsd0JBQXdCLEVB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QkFDUixLQUFLLEVBQUUsQ0FBQzs0QkFDUixhQUFhLEVBQUUsSUFBSTt5QkFDcEI7cUJBQ0YsQ0FBQzthQUNMLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxXQUFXO1lBQ1QsSUFBSSxJQUFJLENBQUMsUUFBUTtnQkFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDcEMsQ0FBQztRQUNELFlBQVk7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7Z0JBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3JDLENBQUM7UUFDRCxTQUFTLENBQUUsQ0FBZ0I7WUFDekIsSUFDRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUM5QyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUNuQixDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi4vLi4vc3R5bGVzL2NvbXBvbmVudHMvX3NlbGVjdGlvbi1jb250cm9scy5zYXNzJ1xuaW1wb3J0ICcuL1ZTd2l0Y2guc2FzcydcblxuLy8gTWl4aW5zXG5pbXBvcnQgU2VsZWN0YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvc2VsZWN0YWJsZSdcbmltcG9ydCBWSW5wdXQgZnJvbSAnLi4vVklucHV0J1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgVG91Y2ggZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy90b3VjaCdcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IHsgVkZhYlRyYW5zaXRpb24gfSBmcm9tICcuLi90cmFuc2l0aW9ucydcbmltcG9ydCBWUHJvZ3Jlc3NDaXJjdWxhciBmcm9tICcuLi9WUHJvZ3Jlc3NDaXJjdWxhci9WUHJvZ3Jlc3NDaXJjdWxhcidcblxuLy8gSGVscGVyc1xuaW1wb3J0IHsga2V5Q29kZXMgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgVk5vZGVEYXRhIH0gZnJvbSAndnVlJ1xuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgU2VsZWN0YWJsZS5leHRlbmQoe1xuICBuYW1lOiAndi1zd2l0Y2gnLFxuXG4gIGRpcmVjdGl2ZXM6IHsgVG91Y2ggfSxcblxuICBwcm9wczoge1xuICAgIGluc2V0OiBCb29sZWFuLFxuICAgIGxvYWRpbmc6IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBmbGF0OiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5WSW5wdXQub3B0aW9ucy5jb21wdXRlZC5jbGFzc2VzLmNhbGwodGhpcyksXG4gICAgICAgICd2LWlucHV0LS1zZWxlY3Rpb24tY29udHJvbHMgdi1pbnB1dC0tc3dpdGNoJzogdHJ1ZSxcbiAgICAgICAgJ3YtaW5wdXQtLXN3aXRjaC0tZmxhdCc6IHRoaXMuZmxhdCxcbiAgICAgICAgJ3YtaW5wdXQtLXN3aXRjaC0taW5zZXQnOiB0aGlzLmluc2V0LFxuICAgICAgfVxuICAgIH0sXG4gICAgYXR0cnMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAnYXJpYS1jaGVja2VkJzogU3RyaW5nKHRoaXMuaXNBY3RpdmUpLFxuICAgICAgICAnYXJpYS1kaXNhYmxlZCc6IFN0cmluZyh0aGlzLmRpc2FibGVkKSxcbiAgICAgICAgcm9sZTogJ3N3aXRjaCcsXG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBEbyBub3QgcmV0dXJuIHVuZGVmaW5lZCBpZiBkaXNhYmxlZCxcbiAgICAvLyBhY2NvcmRpbmcgdG8gc3BlYywgc2hvdWxkIHN0aWxsIHNob3dcbiAgICAvLyBhIGNvbG9yIHdoZW4gZGlzYWJsZWQgYW5kIGFjdGl2ZVxuICAgIHZhbGlkYXRpb25TdGF0ZSAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICh0aGlzLmhhc0Vycm9yICYmIHRoaXMuc2hvdWxkVmFsaWRhdGUpIHJldHVybiAnZXJyb3InXG4gICAgICBpZiAodGhpcy5oYXNTdWNjZXNzKSByZXR1cm4gJ3N1Y2Nlc3MnXG4gICAgICBpZiAodGhpcy5oYXNDb2xvciAhPT0gbnVsbCkgcmV0dXJuIHRoaXMuY29tcHV0ZWRDb2xvclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH0sXG4gICAgc3dpdGNoRGF0YSAoKTogVk5vZGVEYXRhIHtcbiAgICAgIHJldHVybiB0aGlzLnNldFRleHRDb2xvcih0aGlzLmxvYWRpbmcgPyB1bmRlZmluZWQgOiB0aGlzLnZhbGlkYXRpb25TdGF0ZSwge1xuICAgICAgICBjbGFzczogdGhpcy50aGVtZUNsYXNzZXMsXG4gICAgICB9KVxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkRlZmF1bHRTbG90ICgpOiAoVk5vZGUgfCBudWxsKVtdIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHRoaXMuZ2VuU3dpdGNoKCksXG4gICAgICAgIHRoaXMuZ2VuTGFiZWwoKSxcbiAgICAgIF1cbiAgICB9LFxuICAgIGdlblN3aXRjaCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWlucHV0LS1zZWxlY3Rpb24tY29udHJvbHNfX2lucHV0JyxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5JbnB1dCgnY2hlY2tib3gnLCB7XG4gICAgICAgICAgLi4udGhpcy5hdHRycyxcbiAgICAgICAgICAuLi50aGlzLmF0dHJzJCxcbiAgICAgICAgfSksXG4gICAgICAgIHRoaXMuZ2VuUmlwcGxlKHRoaXMuc2V0VGV4dENvbG9yKHRoaXMudmFsaWRhdGlvblN0YXRlLCB7XG4gICAgICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgICAgIG5hbWU6ICd0b3VjaCcsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBsZWZ0OiB0aGlzLm9uU3dpcGVMZWZ0LFxuICAgICAgICAgICAgICByaWdodDogdGhpcy5vblN3aXBlUmlnaHQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1dLFxuICAgICAgICB9KSksXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtaW5wdXQtLXN3aXRjaF9fdHJhY2snLFxuICAgICAgICAgIC4uLnRoaXMuc3dpdGNoRGF0YSxcbiAgICAgICAgfSksXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtaW5wdXQtLXN3aXRjaF9fdGh1bWInLFxuICAgICAgICAgIC4uLnRoaXMuc3dpdGNoRGF0YSxcbiAgICAgICAgfSwgW3RoaXMuZ2VuUHJvZ3Jlc3MoKV0pLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlblByb2dyZXNzICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRmFiVHJhbnNpdGlvbiwge30sIFtcbiAgICAgICAgdGhpcy5sb2FkaW5nID09PSBmYWxzZVxuICAgICAgICAgID8gbnVsbFxuICAgICAgICAgIDogdGhpcy4kc2xvdHMucHJvZ3Jlc3MgfHwgdGhpcy4kY3JlYXRlRWxlbWVudChWUHJvZ3Jlc3NDaXJjdWxhciwge1xuICAgICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgICAgY29sb3I6ICh0aGlzLmxvYWRpbmcgPT09IHRydWUgfHwgdGhpcy5sb2FkaW5nID09PSAnJylcbiAgICAgICAgICAgICAgICA/ICh0aGlzLmNvbG9yIHx8ICdwcmltYXJ5JylcbiAgICAgICAgICAgICAgICA6IHRoaXMubG9hZGluZyxcbiAgICAgICAgICAgICAgc2l6ZTogMTYsXG4gICAgICAgICAgICAgIHdpZHRoOiAyLFxuICAgICAgICAgICAgICBpbmRldGVybWluYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBvblN3aXBlTGVmdCAoKSB7XG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSkgdGhpcy5vbkNoYW5nZSgpXG4gICAgfSxcbiAgICBvblN3aXBlUmlnaHQgKCkge1xuICAgICAgaWYgKCF0aGlzLmlzQWN0aXZlKSB0aGlzLm9uQ2hhbmdlKClcbiAgICB9LFxuICAgIG9uS2V5ZG93biAoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgaWYgKFxuICAgICAgICAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5sZWZ0ICYmIHRoaXMuaXNBY3RpdmUpIHx8XG4gICAgICAgIChlLmtleUNvZGUgPT09IGtleUNvZGVzLnJpZ2h0ICYmICF0aGlzLmlzQWN0aXZlKVxuICAgICAgKSB0aGlzLm9uQ2hhbmdlKClcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==