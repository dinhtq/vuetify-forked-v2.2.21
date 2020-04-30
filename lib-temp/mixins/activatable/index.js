// Mixins
import Delayable from '../delayable';
import Toggleable from '../toggleable';
// Utilities
import mixins from '../../util/mixins';
import { getSlot, getSlotType } from '../../util/helpers';
import { consoleError } from '../../util/console';
const baseMixins = mixins(Delayable, Toggleable);
/* @vue/component */
export default baseMixins.extend({
    name: 'activatable',
    props: {
        activator: {
            default: null,
            validator: (val) => {
                return ['string', 'object'].includes(typeof val);
            },
        },
        disabled: Boolean,
        internalActivator: Boolean,
        openOnHover: Boolean,
    },
    data: () => ({
        // Do not use this directly, call getActivator() instead
        activatorElement: null,
        activatorNode: [],
        events: ['click', 'mouseenter', 'mouseleave'],
        listeners: {},
    }),
    watch: {
        activator: 'resetActivator',
        openOnHover: 'resetActivator',
    },
    mounted() {
        const slotType = getSlotType(this, 'activator', true);
        if (slotType && ['v-slot', 'normal'].includes(slotType)) {
            consoleError(`The activator slot must be bound, try '<template v-slot:activator="{ on }"><v-btn v-on="on">'`, this);
        }
        this.addActivatorEvents();
    },
    beforeDestroy() {
        this.removeActivatorEvents();
    },
    methods: {
        addActivatorEvents() {
            if (!this.activator ||
                this.disabled ||
                !this.getActivator())
                return;
            this.listeners = this.genActivatorListeners();
            const keys = Object.keys(this.listeners);
            for (const key of keys) {
                this.getActivator().addEventListener(key, this.listeners[key]);
            }
        },
        genActivator() {
            const node = getSlot(this, 'activator', Object.assign(this.getValueProxy(), {
                on: this.genActivatorListeners(),
                attrs: this.genActivatorAttributes(),
            })) || [];
            this.activatorNode = node;
            return node;
        },
        genActivatorAttributes() {
            return {
                role: 'button',
                'aria-haspopup': true,
                'aria-expanded': String(this.isActive),
            };
        },
        genActivatorListeners() {
            if (this.disabled)
                return {};
            const listeners = {};
            if (this.openOnHover) {
                listeners.mouseenter = (e) => {
                    this.getActivator(e);
                    this.runDelay('open');
                };
                listeners.mouseleave = (e) => {
                    this.getActivator(e);
                    this.runDelay('close');
                };
            }
            else {
                listeners.click = (e) => {
                    const activator = this.getActivator(e);
                    if (activator)
                        activator.focus();
                    e.stopPropagation();
                    this.isActive = !this.isActive;
                };
            }
            return listeners;
        },
        getActivator(e) {
            // If we've already fetched the activator, re-use
            if (this.activatorElement)
                return this.activatorElement;
            let activator = null;
            if (this.activator) {
                const target = this.internalActivator ? this.$el : document;
                if (typeof this.activator === 'string') {
                    // Selector
                    activator = target.querySelector(this.activator);
                }
                else if (this.activator.$el) {
                    // Component (ref)
                    activator = this.activator.$el;
                }
                else {
                    // HTMLElement | Element
                    activator = this.activator;
                }
            }
            else if (this.activatorNode.length === 1 || (this.activatorNode.length && !e)) {
                // Use the contents of the activator slot
                // There's either only one element in it or we
                // don't have a click event to use as a last resort
                const vm = this.activatorNode[0].componentInstance;
                if (vm &&
                    vm.$options.mixins && //                         Activatable is indirectly used via Menuable
                    vm.$options.mixins.some((m) => m.options && ['activatable', 'menuable'].includes(m.options.name))) {
                    // Activator is actually another activatible component, use its activator (#8846)
                    activator = vm.getActivator();
                }
                else {
                    activator = this.activatorNode[0].elm;
                }
            }
            else if (e) {
                // Activated by a click event
                activator = (e.currentTarget || e.target);
            }
            this.activatorElement = activator;
            return this.activatorElement;
        },
        getContentSlot() {
            return getSlot(this, 'default', this.getValueProxy(), true);
        },
        getValueProxy() {
            const self = this;
            return {
                get value() {
                    return self.isActive;
                },
                set value(isActive) {
                    self.isActive = isActive;
                },
            };
        },
        removeActivatorEvents() {
            if (!this.activator ||
                !this.activatorElement)
                return;
            const keys = Object.keys(this.listeners);
            for (const key of keys) {
                this.activatorElement.removeEventListener(key, this.listeners[key]);
            }
            this.listeners = {};
        },
        resetActivator() {
            this.removeActivatorEvents();
            this.activatorElement = null;
            this.getActivator();
            this.addActivatorEvents();
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL2FjdGl2YXRhYmxlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSxjQUFjLENBQUE7QUFDcEMsT0FBTyxVQUFVLE1BQU0sZUFBZSxDQUFBO0FBRXRDLFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUtqRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLFNBQVMsRUFDVCxVQUFVLENBQ1gsQ0FBQTtBQUVELG9CQUFvQjtBQUNwQixlQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDL0IsSUFBSSxFQUFFLGFBQWE7SUFFbkIsS0FBSyxFQUFFO1FBQ0wsU0FBUyxFQUFFO1lBQ1QsT0FBTyxFQUFFLElBQTBFO1lBQ25GLFNBQVMsRUFBRSxDQUFDLEdBQW9CLEVBQUUsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQTtZQUNsRCxDQUFDO1NBQ0Y7UUFDRCxRQUFRLEVBQUUsT0FBTztRQUNqQixpQkFBaUIsRUFBRSxPQUFPO1FBQzFCLFdBQVcsRUFBRSxPQUFPO0tBQ3JCO0lBRUQsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDWCx3REFBd0Q7UUFDeEQsZ0JBQWdCLEVBQUUsSUFBMEI7UUFDNUMsYUFBYSxFQUFFLEVBQWE7UUFDNUIsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUM7UUFDN0MsU0FBUyxFQUFFLEVBQTZEO0tBQ3pFLENBQUM7SUFFRixLQUFLLEVBQUU7UUFDTCxT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QUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFFeEMsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxnQkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO2FBQzdFO1lBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7UUFDckIsQ0FBQztRQUNELGNBQWM7WUFDWixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtZQUM1QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO1lBQzVCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtZQUNuQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtRQUMzQixDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBNaXhpbnNcbmltcG9ydCBEZWxheWFibGUgZnJvbSAnLi4vZGVsYXlhYmxlJ1xuaW1wb3J0IFRvZ2dsZWFibGUgZnJvbSAnLi4vdG9nZ2xlYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgZ2V0U2xvdCwgZ2V0U2xvdFR5cGUgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgeyBjb25zb2xlRXJyb3IgfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5cbmNvbnN0IGJhc2VNaXhpbnMgPSBtaXhpbnMoXG4gIERlbGF5YWJsZSxcbiAgVG9nZ2xlYWJsZVxuKVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQoe1xuICBuYW1lOiAnYWN0aXZhdGFibGUnLFxuXG4gIHByb3BzOiB7XG4gICAgYWN0aXZhdG9yOiB7XG4gICAgICBkZWZhdWx0OiBudWxsIGFzIHVua25vd24gYXMgUHJvcFR5cGU8c3RyaW5nIHwgSFRNTEVsZW1lbnQgfCBWTm9kZSB8IEVsZW1lbnQgfCBudWxsPixcbiAgICAgIHZhbGlkYXRvcjogKHZhbDogc3RyaW5nIHwgb2JqZWN0KSA9PiB7XG4gICAgICAgIHJldHVybiBbJ3N0cmluZycsICdvYmplY3QnXS5pbmNsdWRlcyh0eXBlb2YgdmFsKVxuICAgICAgfSxcbiAgICB9LFxuICAgIGRpc2FibGVkOiBCb29sZWFuLFxuICAgIGludGVybmFsQWN0aXZhdG9yOiBCb29sZWFuLFxuICAgIG9wZW5PbkhvdmVyOiBCb29sZWFuLFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgLy8gRG8gbm90IHVzZSB0aGlzIGRpcmVjdGx5LCBjYWxsIGdldEFjdGl2YXRvcigpIGluc3RlYWRcbiAgICBhY3RpdmF0b3JFbGVtZW50OiBudWxsIGFzIEhUTUxFbGVtZW50IHwgbnVsbCxcbiAgICBhY3RpdmF0b3JOb2RlOiBbXSBhcyBWTm9kZVtdLFxuICAgIGV2ZW50czogWydjbGljaycsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSxcbiAgICBsaXN0ZW5lcnM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIChlOiBNb3VzZUV2ZW50ICYgS2V5Ym9hcmRFdmVudCkgPT4gdm9pZD4sXG4gIH0pLFxuXG4gIHdhdGNoOiB7XG4gICAgYWN0aXZhdG9yOiAncmVzZXRBY3RpdmF0b3InLFxuICAgIG9wZW5PbkhvdmVyOiAncmVzZXRBY3RpdmF0b3InLFxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIGNvbnN0IHNsb3RUeXBlID0gZ2V0U2xvdFR5cGUodGhpcywgJ2FjdGl2YXRvcicsIHRydWUpXG5cbiAgICBpZiAoc2xvdFR5cGUgJiYgWyd2LXNsb3QnLCAnbm9ybWFsJ10uaW5jbHVkZXMoc2xvdFR5cGUpKSB7XG4gICAgICBjb25zb2xlRXJyb3IoYFRoZSBhY3RpdmF0b3Igc2xvdCBtdXN0IGJlIGJvdW5kLCB0cnkgJzx0ZW1wbGF0ZSB2LXNsb3Q6YWN0aXZhdG9yPVwieyBvbiB9XCI+PHYtYnRuIHYtb249XCJvblwiPidgLCB0aGlzKVxuICAgIH1cblxuICAgIHRoaXMuYWRkQWN0aXZhdG9yRXZlbnRzKClcbiAgfSxcblxuICBiZWZvcmVEZXN0cm95ICgpIHtcbiAgICB0aGlzLnJlbW92ZUFjdGl2YXRvckV2ZW50cygpXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGFkZEFjdGl2YXRvckV2ZW50cyAoKSB7XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLmFjdGl2YXRvciB8fFxuICAgICAgICB0aGlzLmRpc2FibGVkIHx8XG4gICAgICAgICF0aGlzLmdldEFjdGl2YXRvcigpXG4gICAgICApIHJldHVyblxuXG4gICAgICB0aGlzLmxpc3RlbmVycyA9IHRoaXMuZ2VuQWN0aXZhdG9yTGlzdGVuZXJzKClcbiAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmxpc3RlbmVycylcblxuICAgICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgICB0aGlzLmdldEFjdGl2YXRvcigpIS5hZGRFdmVudExpc3RlbmVyKGtleSwgdGhpcy5saXN0ZW5lcnNba2V5XSBhcyBhbnkpXG4gICAgICB9XG4gICAgfSxcbiAgICBnZW5BY3RpdmF0b3IgKCkge1xuICAgICAgY29uc3Qgbm9kZSA9IGdldFNsb3QodGhpcywgJ2FjdGl2YXRvcicsIE9iamVjdC5hc3NpZ24odGhpcy5nZXRWYWx1ZVByb3h5KCksIHtcbiAgICAgICAgb246IHRoaXMuZ2VuQWN0aXZhdG9yTGlzdGVuZXJzKCksXG4gICAgICAgIGF0dHJzOiB0aGlzLmdlbkFjdGl2YXRvckF0dHJpYnV0ZXMoKSxcbiAgICAgIH0pKSB8fCBbXVxuXG4gICAgICB0aGlzLmFjdGl2YXRvck5vZGUgPSBub2RlXG5cbiAgICAgIHJldHVybiBub2RlXG4gICAgfSxcbiAgICBnZW5BY3RpdmF0b3JBdHRyaWJ1dGVzICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJvbGU6ICdidXR0b24nLFxuICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogU3RyaW5nKHRoaXMuaXNBY3RpdmUpLFxuICAgICAgfVxuICAgIH0sXG4gICAgZ2VuQWN0aXZhdG9yTGlzdGVuZXJzICgpIHtcbiAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm4ge31cblxuICAgICAgY29uc3QgbGlzdGVuZXJzOiBSZWNvcmQ8c3RyaW5nLCAoZTogTW91c2VFdmVudCAmIEtleWJvYXJkRXZlbnQpID0+IHZvaWQ+ID0ge31cblxuICAgICAgaWYgKHRoaXMub3Blbk9uSG92ZXIpIHtcbiAgICAgICAgbGlzdGVuZXJzLm1vdXNlZW50ZXIgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuZ2V0QWN0aXZhdG9yKGUpXG4gICAgICAgICAgdGhpcy5ydW5EZWxheSgnb3BlbicpXG4gICAgICAgIH1cbiAgICAgICAgbGlzdGVuZXJzLm1vdXNlbGVhdmUgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuZ2V0QWN0aXZhdG9yKGUpXG4gICAgICAgICAgdGhpcy5ydW5EZWxheSgnY2xvc2UnKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaXN0ZW5lcnMuY2xpY2sgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGFjdGl2YXRvciA9IHRoaXMuZ2V0QWN0aXZhdG9yKGUpXG4gICAgICAgICAgaWYgKGFjdGl2YXRvcikgYWN0aXZhdG9yLmZvY3VzKClcblxuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSAhdGhpcy5pc0FjdGl2ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsaXN0ZW5lcnNcbiAgICB9LFxuICAgIGdldEFjdGl2YXRvciAoZT86IEV2ZW50KTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZmV0Y2hlZCB0aGUgYWN0aXZhdG9yLCByZS11c2VcbiAgICAgIGlmICh0aGlzLmFjdGl2YXRvckVsZW1lbnQpIHJldHVybiB0aGlzLmFjdGl2YXRvckVsZW1lbnRcblxuICAgICAgbGV0IGFjdGl2YXRvciA9IG51bGxcblxuICAgICAgaWYgKHRoaXMuYWN0aXZhdG9yKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuaW50ZXJuYWxBY3RpdmF0b3IgPyB0aGlzLiRlbCA6IGRvY3VtZW50XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmFjdGl2YXRvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBTZWxlY3RvclxuICAgICAgICAgIGFjdGl2YXRvciA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKHRoaXMuYWN0aXZhdG9yKVxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLmFjdGl2YXRvciBhcyBhbnkpLiRlbCkge1xuICAgICAgICAgIC8vIENvbXBvbmVudCAocmVmKVxuICAgICAgICAgIGFjdGl2YXRvciA9ICh0aGlzLmFjdGl2YXRvciBhcyBhbnkpLiRlbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEhUTUxFbGVtZW50IHwgRWxlbWVudFxuICAgICAgICAgIGFjdGl2YXRvciA9IHRoaXMuYWN0aXZhdG9yXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5hY3RpdmF0b3JOb2RlLmxlbmd0aCA9PT0gMSB8fCAodGhpcy5hY3RpdmF0b3JOb2RlLmxlbmd0aCAmJiAhZSkpIHtcbiAgICAgICAgLy8gVXNlIHRoZSBjb250ZW50cyBvZiB0aGUgYWN0aXZhdG9yIHNsb3RcbiAgICAgICAgLy8gVGhlcmUncyBlaXRoZXIgb25seSBvbmUgZWxlbWVudCBpbiBpdCBvciB3ZVxuICAgICAgICAvLyBkb24ndCBoYXZlIGEgY2xpY2sgZXZlbnQgdG8gdXNlIGFzIGEgbGFzdCByZXNvcnRcbiAgICAgICAgY29uc3Qgdm0gPSB0aGlzLmFjdGl2YXRvck5vZGVbMF0uY29tcG9uZW50SW5zdGFuY2VcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHZtICYmXG4gICAgICAgICAgdm0uJG9wdGlvbnMubWl4aW5zICYmIC8vICAgICAgICAgICAgICAgICAgICAgICAgIEFjdGl2YXRhYmxlIGlzIGluZGlyZWN0bHkgdXNlZCB2aWEgTWVudWFibGVcbiAgICAgICAgICB2bS4kb3B0aW9ucy5taXhpbnMuc29tZSgobTogYW55KSA9PiBtLm9wdGlvbnMgJiYgWydhY3RpdmF0YWJsZScsICdtZW51YWJsZSddLmluY2x1ZGVzKG0ub3B0aW9ucy5uYW1lKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gQWN0aXZhdG9yIGlzIGFjdHVhbGx5IGFub3RoZXIgYWN0aXZhdGlibGUgY29tcG9uZW50LCB1c2UgaXRzIGFjdGl2YXRvciAoIzg4NDYpXG4gICAgICAgICAgYWN0aXZhdG9yID0gKHZtIGFzIGFueSkuZ2V0QWN0aXZhdG9yKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhY3RpdmF0b3IgPSB0aGlzLmFjdGl2YXRvck5vZGVbMF0uZWxtIGFzIEhUTUxFbGVtZW50XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZSkge1xuICAgICAgICAvLyBBY3RpdmF0ZWQgYnkgYSBjbGljayBldmVudFxuICAgICAgICBhY3RpdmF0b3IgPSAoZS5jdXJyZW50VGFyZ2V0IHx8IGUudGFyZ2V0KSBhcyBIVE1MRWxlbWVudFxuICAgICAgfVxuXG4gICAgICB0aGlzLmFjdGl2YXRvckVsZW1lbnQgPSBhY3RpdmF0b3JcblxuICAgICAgcmV0dXJuIHRoaXMuYWN0aXZhdG9yRWxlbWVudFxuICAgIH0sXG4gICAgZ2V0Q29udGVudFNsb3QgKCkge1xuICAgICAgcmV0dXJuIGdldFNsb3QodGhpcywgJ2RlZmF1bHQnLCB0aGlzLmdldFZhbHVlUHJveHkoKSwgdHJ1ZSlcbiAgICB9LFxuICAgIGdldFZhbHVlUHJveHkgKCk6IG9iamVjdCB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpc1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0IHZhbHVlICgpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5pc0FjdGl2ZVxuICAgICAgICB9LFxuICAgICAgICBzZXQgdmFsdWUgKGlzQWN0aXZlOiBib29sZWFuKSB7XG4gICAgICAgICAgc2VsZi5pc0FjdGl2ZSA9IGlzQWN0aXZlXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVBY3RpdmF0b3JFdmVudHMgKCkge1xuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5hY3RpdmF0b3IgfHxcbiAgICAgICAgIXRoaXMuYWN0aXZhdG9yRWxlbWVudFxuICAgICAgKSByZXR1cm5cblxuICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMubGlzdGVuZXJzKVxuXG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgICh0aGlzLmFjdGl2YXRvckVsZW1lbnQgYXMgYW55KS5yZW1vdmVFdmVudExpc3RlbmVyKGtleSwgdGhpcy5saXN0ZW5lcnNba2V5XSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fVxuICAgIH0sXG4gICAgcmVzZXRBY3RpdmF0b3IgKCkge1xuICAgICAgdGhpcy5yZW1vdmVBY3RpdmF0b3JFdmVudHMoKVxuICAgICAgdGhpcy5hY3RpdmF0b3JFbGVtZW50ID0gbnVsbFxuICAgICAgdGhpcy5nZXRBY3RpdmF0b3IoKVxuICAgICAgdGhpcy5hZGRBY3RpdmF0b3JFdmVudHMoKVxuICAgIH0sXG4gIH0sXG59KVxuIl19