// Mixins
import mixins from '../../util/mixins';
import BindsAttrs from '../../mixins/binds-attrs';
import { provide as RegistrableProvide } from '../../mixins/registrable';
/* @vue/component */
export default mixins(BindsAttrs, RegistrableProvide('form')
/* @vue/component */
).extend({
    name: 'v-form',
    inheritAttrs: false,
    props: {
        lazyValidation: Boolean,
        value: Boolean,
    },
    data: () => ({
        inputs: [],
        watchers: [],
        errorBag: {},
    }),
    watch: {
        errorBag: {
            handler(val) {
                const errors = Object.values(val).includes(true);
                this.$emit('input', !errors);
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        watchInput(input) {
            const watcher = (input) => {
                return input.$watch('hasError', (val) => {
                    this.$set(this.errorBag, input._uid, val);
                }, { immediate: true });
            };
            const watchers = {
                _uid: input._uid,
                valid: () => { },
                shouldValidate: () => { },
            };
            if (this.lazyValidation) {
                // Only start watching inputs if we need to
                watchers.shouldValidate = input.$watch('shouldValidate', (val) => {
                    if (!val)
                        return;
                    // Only watch if we're not already doing it
                    if (this.errorBag.hasOwnProperty(input._uid))
                        return;
                    watchers.valid = watcher(input);
                });
            }
            else {
                watchers.valid = watcher(input);
            }
            return watchers;
        },
        /** @public */
        validate() {
            return this.inputs.filter(input => !input.validate(true)).length === 0;
        },
        /** @public */
        reset() {
            this.inputs.forEach(input => input.reset());
            this.resetErrorBag();
        },
        resetErrorBag() {
            if (this.lazyValidation) {
                // Account for timeout in validatable
                setTimeout(() => {
                    this.errorBag = {};
                }, 0);
            }
        },
        /** @public */
        resetValidation() {
            this.inputs.forEach(input => input.resetValidation());
            this.resetErrorBag();
        },
        register(input) {
            this.inputs.push(input);
            this.watchers.push(this.watchInput(input));
        },
        unregister(input) {
            const found = this.inputs.find(i => i._uid === input._uid);
            if (!found)
                return;
            const unwatch = this.watchers.find(i => i._uid === found._uid);
            if (unwatch) {
                unwatch.valid();
                unwatch.shouldValidate();
            }
            this.watchers = this.watchers.filter(i => i._uid !== found._uid);
            this.inputs = this.inputs.filter(i => i._uid !== found._uid);
            this.$delete(this.errorBag, found._uid);
        },
    },
    render(h) {
        return h('form', {
            staticClass: 'v-form',
            attrs: {
                novalidate: true,
                ...this.attrs$,
            },
            on: {
                submit: (e) => this.$emit('submit', e),
            },
        }, this.$slots.default);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WRm9ybS9WRm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxTQUFTO0FBQ1QsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxFQUFFLE9BQU8sSUFBSSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBYXhFLG9CQUFvQjtBQUNwQixlQUFlLE1BQU0sQ0FDbkIsVUFBVSxFQUNWLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztBQUMxQixvQkFBb0I7Q0FDckIsQ0FBQyxNQUFNLENBQUM7SUFDUCxJQUFJLEVBQUUsUUFBUTtJQUVkLFlBQVksRUFBRSxLQUFLO0lBRW5CLEtBQUssRUFBRTtRQUNMLGNBQWMsRUFBRSxPQUFPO1FBQ3ZCLEtBQUssRUFBRSxPQUFPO0tBQ2Y7SUFFRCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNYLE1BQU0sRUFBRSxFQUFzQjtRQUM5QixRQUFRLEVBQUUsRUFBZ0I7UUFDMUIsUUFBUSxFQUFFLEVBQWM7S0FDekIsQ0FBQztJQUVGLEtBQUssRUFBRTtRQUNMLFFBQVEsRUFBRTtZQUNSLE9BQU8sQ0FBRSxHQUFHO2dCQUNWLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUVoRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzlCLENBQUM7WUFDRCxJQUFJLEVBQUUsSUFBSTtZQUNWLFNBQVMsRUFBRSxJQUFJO1NBQ2hCO0tBQ0Y7SUFFRCxPQUFPLEVBQUU7UUFDUCxVQUFVLENBQUUsS0FBVTtZQUNwQixNQUFNLE9BQU8sR0FBRyxDQUFDLEtBQVUsRUFBZ0IsRUFBRTtnQkFDM0Ms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SUFBSSxDQUFDLENBQUE7WUFDOUQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFBO2dCQUNmLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQTthQUN6QjtZQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNoRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN6QyxDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUNmLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLEtBQUssRUFBRTtnQkFDTCxVQUFVLEVBQUUsSUFBSTtnQkFDaEIsR0FBRyxJQUFJLENBQUMsTUFBTTthQUNmO1lBQ0QsRUFBRSxFQUFFO2dCQUNGLE1BQU0sRUFBRSxDQUFDLENBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQzlDO1NBQ0YsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3pCLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb21wb25lbnRzXG5pbXBvcnQgVklucHV0IGZyb20gJy4uL1ZJbnB1dC9WSW5wdXQnXG5cbi8vIE1peGluc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCBCaW5kc0F0dHJzIGZyb20gJy4uLy4uL21peGlucy9iaW5kcy1hdHRycydcbmltcG9ydCB7IHByb3ZpZGUgYXMgUmVnaXN0cmFibGVQcm92aWRlIH0gZnJvbSAnLi4vLi4vbWl4aW5zL3JlZ2lzdHJhYmxlJ1xuXG4vLyBIZWxwZXJzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxudHlwZSBFcnJvckJhZyA9IFJlY29yZDxudW1iZXIsIGJvb2xlYW4+XG50eXBlIFZJbnB1dEluc3RhbmNlID0gSW5zdGFuY2VUeXBlPHR5cGVvZiBWSW5wdXQ+XG50eXBlIFdhdGNoZXJzID0ge1xuICBfdWlkOiBudW1iZXJcbiAgdmFsaWQ6ICgpID0+IHZvaWRcbiAgc2hvdWxkVmFsaWRhdGU6ICgpID0+IHZvaWRcbn1cblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IG1peGlucyhcbiAgQmluZHNBdHRycyxcbiAgUmVnaXN0cmFibGVQcm92aWRlKCdmb3JtJylcbiAgLyogQHZ1ZS9jb21wb25lbnQgKi9cbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtZm9ybScsXG5cbiAgaW5oZXJpdEF0dHJzOiBmYWxzZSxcblxuICBwcm9wczoge1xuICAgIGxhenlWYWxpZGF0aW9uOiBCb29sZWFuLFxuICAgIHZhbHVlOiBCb29sZWFuLFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgaW5wdXRzOiBbXSBhcyBWSW5wdXRJbnN0YW5jZVtdLFxuICAgIHdhdGNoZXJzOiBbXSBhcyBXYXRjaGVyc1tdLFxuICAgIGVycm9yQmFnOiB7fSBhcyBFcnJvckJhZyxcbiAgfSksXG5cbiAgd2F0Y2g6IHtcbiAgICBlcnJvckJhZzoge1xuICAgICAgaGFuZGxlciAodmFsKSB7XG4gICAgICAgIGNvbnN0IGVycm9ycyA9IE9iamVjdC52YWx1ZXModmFsKS5pbmNsdWRlcyh0cnVlKVxuXG4gICAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgIWVycm9ycylcbiAgICAgIH0sXG4gICAgICBkZWVwOiB0cnVlLFxuICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIHdhdGNoSW5wdXQgKGlucHV0OiBhbnkpOiBXYXRjaGVycyB7XG4gICAgICBjb25zdCB3YXRjaGVyID0gKGlucHV0OiBhbnkpOiAoKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICByZXR1cm4gaW5wdXQuJHdhdGNoKCdoYXNFcnJvcicsICh2YWw6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICB0aGlzLiRzZXQodGhpcy5lcnJvckJhZywgaW5wdXQuX3VpZCwgdmFsKVxuICAgICAgICB9LCB7IGltbWVkaWF0ZTogdHJ1ZSB9KVxuICAgICAgfVxuXG4gICAgICBjb25zdCB3YXRjaGVyczogV2F0Y2hlcnMgPSB7XG4gICAgICAgIF91aWQ6IGlucHV0Ll91aWQsXG4gICAgICAgIHZhbGlkOiAoKSA9PiB7fSxcbiAgICAgICAgc2hvdWxkVmFsaWRhdGU6ICgpID0+IHt9LFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5sYXp5VmFsaWRhdGlvbikge1xuICAgICAgICAvLyBPbmx5IHN0YXJ0IHdhdGNoaW5nIGlucHV0cyBpZiB3ZSBuZWVkIHRvXG4gICAgICAgIHdhdGNoZXJzLnNob3VsZFZhbGlkYXRlID0gaW5wdXQuJHdhdGNoKCdzaG91bGRWYWxpZGF0ZScsICh2YWw6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICBpZiAoIXZhbCkgcmV0dXJuXG5cbiAgICAgICAgICAvLyBPbmx5IHdhdGNoIGlmIHdlJ3JlIG5vdCBhbHJlYWR5IGRvaW5nIGl0XG4gICAgICAgICAgaWYgKHRoaXMuZXJyb3JCYWcuaGFzT3duUHJvcGVydHkoaW5wdXQuX3VpZCkpIHJldHVyblxuXG4gICAgICAgICAgd2F0Y2hlcnMudmFsaWQgPSB3YXRjaGVyKGlucHV0KVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2F0Y2hlcnMudmFsaWQgPSB3YXRjaGVyKGlucHV0KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gd2F0Y2hlcnNcbiAgICB9LFxuICAgIC8qKiBAcHVibGljICovXG4gICAgdmFsaWRhdGUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuaW5wdXRzLmZpbHRlcihpbnB1dCA9PiAhaW5wdXQudmFsaWRhdGUodHJ1ZSkpLmxlbmd0aCA9PT0gMFxuICAgIH0sXG4gICAgLyoqIEBwdWJsaWMgKi9cbiAgICByZXNldCAoKTogdm9pZCB7XG4gICAgICB0aGlzLmlucHV0cy5mb3JFYWNoKGlucHV0ID0+IGlucHV0LnJlc2V0KCkpXG4gICAgICB0aGlzLnJlc2V0RXJyb3JCYWcoKVxuICAgIH0sXG4gICAgcmVzZXRFcnJvckJhZyAoKSB7XG4gICAgICBpZiAodGhpcy5sYXp5VmFsaWRhdGlvbikge1xuICAgICAgICAvLyBBY2NvdW50IGZvciB0aW1lb3V0IGluIHZhbGlkYXRhYmxlXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZXJyb3JCYWcgPSB7fVxuICAgICAgICB9LCAwKVxuICAgICAgfVxuICAgIH0sXG4gICAgLyoqIEBwdWJsaWMgKi9cbiAgICByZXNldFZhbGlkYXRpb24gKCkge1xuICAgICAgdGhpcy5pbnB1dHMuZm9yRWFjaChpbnB1dCA9PiBpbnB1dC5yZXNldFZhbGlkYXRpb24oKSlcbiAgICAgIHRoaXMucmVzZXRFcnJvckJhZygpXG4gICAgfSxcbiAgICByZWdpc3RlciAoaW5wdXQ6IFZJbnB1dEluc3RhbmNlKSB7XG4gICAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0KVxuICAgICAgdGhpcy53YXRjaGVycy5wdXNoKHRoaXMud2F0Y2hJbnB1dChpbnB1dCkpXG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyIChpbnB1dDogVklucHV0SW5zdGFuY2UpIHtcbiAgICAgIGNvbnN0IGZvdW5kID0gdGhpcy5pbnB1dHMuZmluZChpID0+IGkuX3VpZCA9PT0gaW5wdXQuX3VpZClcblxuICAgICAgaWYgKCFmb3VuZCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHVud2F0Y2ggPSB0aGlzLndhdGNoZXJzLmZpbmQoaSA9PiBpLl91aWQgPT09IGZvdW5kLl91aWQpXG4gICAgICBpZiAodW53YXRjaCkge1xuICAgICAgICB1bndhdGNoLnZhbGlkKClcbiAgICAgICAgdW53YXRjaC5zaG91bGRWYWxpZGF0ZSgpXG4gICAgICB9XG5cbiAgICAgIHRoaXMud2F0Y2hlcnMgPSB0aGlzLndhdGNoZXJzLmZpbHRlcihpID0+IGkuX3VpZCAhPT0gZm91bmQuX3VpZClcbiAgICAgIHRoaXMuaW5wdXRzID0gdGhpcy5pbnB1dHMuZmlsdGVyKGkgPT4gaS5fdWlkICE9PSBmb3VuZC5fdWlkKVxuICAgICAgdGhpcy4kZGVsZXRlKHRoaXMuZXJyb3JCYWcsIGZvdW5kLl91aWQpXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgoJ2Zvcm0nLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtZm9ybScsXG4gICAgICBhdHRyczoge1xuICAgICAgICBub3ZhbGlkYXRlOiB0cnVlLFxuICAgICAgICAuLi50aGlzLmF0dHJzJCxcbiAgICAgIH0sXG4gICAgICBvbjoge1xuICAgICAgICBzdWJtaXQ6IChlOiBFdmVudCkgPT4gdGhpcy4kZW1pdCgnc3VibWl0JywgZSksXG4gICAgICB9LFxuICAgIH0sIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gIH0sXG59KVxuIl19