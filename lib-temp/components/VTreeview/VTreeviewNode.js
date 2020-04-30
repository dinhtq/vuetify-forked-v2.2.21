// Components
import { VExpandTransition } from '../transitions';
import { VIcon } from '../VIcon';
// Mixins
import { inject as RegistrableInject } from '../../mixins/registrable';
import Colorable from '../../mixins/colorable';
// Utils
import mixins from '../../util/mixins';
import { getObjectValueByPath, createRange } from '../../util/helpers';
const baseMixins = mixins(Colorable, RegistrableInject('treeview'));
export const VTreeviewNodeProps = {
    activatable: Boolean,
    activeClass: {
        type: String,
        default: 'v-treeview-node--active',
    },
    color: {
        type: String,
        default: 'primary',
    },
    expandIcon: {
        type: String,
        default: '$subgroup',
    },
    indeterminateIcon: {
        type: String,
        default: '$checkboxIndeterminate',
    },
    itemChildren: {
        type: String,
        default: 'children',
    },
    itemDisabled: {
        type: String,
        default: 'disabled',
    },
    itemKey: {
        type: String,
        default: 'id',
    },
    itemText: {
        type: String,
        default: 'name',
    },
    loadChildren: Function,
    loadingIcon: {
        type: String,
        default: '$loading',
    },
    offIcon: {
        type: String,
        default: '$checkboxOff',
    },
    onIcon: {
        type: String,
        default: '$checkboxOn',
    },
    openOnClick: Boolean,
    rounded: Boolean,
    selectable: Boolean,
    selectedColor: {
        type: String,
        default: 'accent',
    },
    shaped: Boolean,
    transition: Boolean,
};
/* @vue/component */
const VTreeviewNode = baseMixins.extend().extend({
    name: 'v-treeview-node',
    inject: {
        treeview: {
            default: null,
        },
    },
    props: {
        level: Number,
        item: {
            type: Object,
            default: () => null,
        },
        ...VTreeviewNodeProps,
    },
    data: () => ({
        hasLoaded: false,
        isActive: false,
        isIndeterminate: false,
        isLoading: false,
        isOpen: false,
        isSelected: false,
    }),
    computed: {
        disabled() {
            return getObjectValueByPath(this.item, this.itemDisabled);
        },
        key() {
            return getObjectValueByPath(this.item, this.itemKey);
        },
        children() {
            return getObjectValueByPath(this.item, this.itemChildren);
        },
        text() {
            return getObjectValueByPath(this.item, this.itemText);
        },
        scopedProps() {
            return {
                item: this.item,
                leaf: !this.children,
                selected: this.isSelected,
                indeterminate: this.isIndeterminate,
                active: this.isActive,
                open: this.isOpen,
            };
        },
        computedIcon() {
            if (this.isIndeterminate)
                return this.indeterminateIcon;
            else if (this.isSelected)
                return this.onIcon;
            else
                return this.offIcon;
        },
        hasChildren() {
            return !!this.children && (!!this.children.length || !!this.loadChildren);
        },
    },
    created() {
        this.treeview.register(this);
    },
    beforeDestroy() {
        this.treeview.unregister(this);
    },
    methods: {
        checkChildren() {
            return new Promise(resolve => {
                // TODO: Potential issue with always trying
                // to load children if response is empty?
                if (!this.children || this.children.length || !this.loadChildren || this.hasLoaded)
                    return resolve();
                this.isLoading = true;
                resolve(this.loadChildren(this.item));
            }).then(() => {
                this.isLoading = false;
                this.hasLoaded = true;
            });
        },
        open() {
            this.isOpen = !this.isOpen;
            this.treeview.updateOpen(this.key, this.isOpen);
            this.treeview.emitOpen();
        },
        genLabel() {
            const children = [];
            if (this.$scopedSlots.label)
                children.push(this.$scopedSlots.label(this.scopedProps));
            else
                children.push(this.text);
            return this.$createElement('div', {
                slot: 'label',
                staticClass: 'v-treeview-node__label',
            }, children);
        },
        genPrependSlot() {
            if (!this.$scopedSlots.prepend)
                return null;
            return this.$createElement('div', {
                staticClass: 'v-treeview-node__prepend',
            }, this.$scopedSlots.prepend(this.scopedProps));
        },
        genAppendSlot() {
            if (!this.$scopedSlots.append)
                return null;
            return this.$createElement('div', {
                staticClass: 'v-treeview-node__append',
            }, this.$scopedSlots.append(this.scopedProps));
        },
        genContent() {
            const children = [
                this.genPrependSlot(),
                this.genLabel(),
                this.genAppendSlot(),
            ];
            return this.$createElement('div', {
                staticClass: 'v-treeview-node__content',
            }, children);
        },
        genToggle() {
            return this.$createElement(VIcon, {
                staticClass: 'v-treeview-node__toggle',
                class: {
                    'v-treeview-node__toggle--open': this.isOpen,
                    'v-treeview-node__toggle--loading': this.isLoading,
                },
                slot: 'prepend',
                on: {
                    click: (e) => {
                        if (this.disabled)
                            return;
                        e.stopPropagation();
                        if (this.isLoading)
                            return;
                        this.checkChildren().then(() => this.open());
                    },
                },
            }, [this.isLoading ? this.loadingIcon : this.expandIcon]);
        },
        genCheckbox() {
            return this.$createElement(VIcon, {
                staticClass: 'v-treeview-node__checkbox',
                props: {
                    color: this.isSelected || this.isIndeterminate ? this.selectedColor : undefined,
                },
                on: {
                    click: (e) => {
                        if (this.disabled)
                            return;
                        e.stopPropagation();
                        if (this.isLoading)
                            return;
                        this.checkChildren().then(() => {
                            // We nextTick here so that items watch in VTreeview has a chance to run first
                            this.$nextTick(() => {
                                this.isSelected = !this.isSelected;
                                this.isIndeterminate = false;
                                this.treeview.updateSelected(this.key, this.isSelected);
                                this.treeview.emitSelected();
                            });
                        });
                    },
                },
            }, [this.computedIcon]);
        },
        genLevel(level) {
            return createRange(level).map(() => this.$createElement('div', {
                staticClass: 'v-treeview-node__level',
            }));
        },
        genNode() {
            const children = [this.genContent()];
            if (this.selectable)
                children.unshift(this.genCheckbox());
            if (this.hasChildren) {
                children.unshift(this.genToggle());
            }
            else {
                children.unshift(...this.genLevel(1));
            }
            children.unshift(...this.genLevel(this.level));
            return this.$createElement('div', this.setTextColor(this.isActive && this.color, {
                staticClass: 'v-treeview-node__root',
                class: {
                    [this.activeClass]: this.isActive,
                },
                on: {
                    click: () => {
                        if (this.disabled)
                            return;
                        if (this.openOnClick && this.hasChildren) {
                            this.open();
                        }
                        else if (this.activatable) {
                            this.isActive = !this.isActive;
                            this.treeview.updateActive(this.key, this.isActive);
                            this.treeview.emitActive();
                        }
                    },
                },
            }), children);
        },
        genChild(item) {
            return this.$createElement(VTreeviewNode, {
                key: getObjectValueByPath(item, this.itemKey),
                props: {
                    activatable: this.activatable,
                    activeClass: this.activeClass,
                    item,
                    selectable: this.selectable,
                    selectedColor: this.selectedColor,
                    color: this.color,
                    expandIcon: this.expandIcon,
                    indeterminateIcon: this.indeterminateIcon,
                    offIcon: this.offIcon,
                    onIcon: this.onIcon,
                    loadingIcon: this.loadingIcon,
                    itemKey: this.itemKey,
                    itemText: this.itemText,
                    itemDisabled: this.itemDisabled,
                    itemChildren: this.itemChildren,
                    loadChildren: this.loadChildren,
                    transition: this.transition,
                    openOnClick: this.openOnClick,
                    rounded: this.rounded,
                    shaped: this.shaped,
                    level: this.level + 1,
                },
                scopedSlots: this.$scopedSlots,
            });
        },
        genChildrenWrapper() {
            if (!this.isOpen || !this.children)
                return null;
            const children = [this.children.map(this.genChild)];
            return this.$createElement('div', {
                staticClass: 'v-treeview-node__children',
            }, children);
        },
        genTransition() {
            return this.$createElement(VExpandTransition, [this.genChildrenWrapper()]);
        },
    },
    render(h) {
        const children = [this.genNode()];
        if (this.transition)
            children.push(this.genTransition());
        else
            children.push(this.genChildrenWrapper());
        return h('div', {
            staticClass: 'v-treeview-node',
            class: {
                'v-treeview-node--leaf': !this.hasChildren,
                'v-treeview-node--click': this.openOnClick,
                'v-treeview-node--disabled': this.disabled,
                'v-treeview-node--rounded': this.rounded,
                'v-treeview-node--shaped': this.shaped,
                'v-treeview-node--selected': this.isSelected,
                'v-treeview-node--excluded': this.treeview.isExcluded(this.key),
            },
            attrs: {
                'aria-expanded': String(this.isOpen),
            },
        }, children);
    },
});
export default VTreeviewNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlRyZWV2aWV3Tm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZUcmVldmlldy9WVHJlZXZpZXdOb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGFBQWE7QUFDYixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBR2hDLFNBQVM7QUFDVCxPQUFPLEVBQUUsTUFBTSxJQUFJLGlCQUFpQixFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFDdEUsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsUUFBUTtBQUNSLE9BQU8sTUFBc0IsTUFBTSxtQkFBbUIsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFPdEUsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN2QixTQUFTLEVBQ1QsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQzlCLENBQUE7QUFNRCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRztJQUNoQyxXQUFXLEVBQUUsT0FBTztJQUNwQixXQUFXLEVBQUU7UUFDWCxJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSx5QkFBeUI7S0FDbkM7SUFDRCxLQUFLLEVBQUU7UUFDTCxJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSxTQUFTO0tBQ25CO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLE1BQU07UUFDWixPQUFPLEVBQUUsV0FBVztLQUNyQjtJQUNELGlCQUFpQixFQUFFO1FBQ2pCLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLHdCQUF3QjtLQUNsQztJQUNELFlBQVksRUFBRTtRQUNaLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLFVBQVU7S0FDcEI7SUFDRCxZQUFZLEVBQUU7UUFDWixJQUFJ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O1lBQ0QsS0FBSyxFQUFFO2dCQUNMLGVBQWUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUNyQztTQUNGLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDZCxDQUFDO0NBQ0YsQ0FBQyxDQUFBO0FBRUYsZUFBZSxhQUFhLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb21wb25lbnRzXG5pbXBvcnQgeyBWRXhwYW5kVHJhbnNpdGlvbiB9IGZyb20gJy4uL3RyYW5zaXRpb25zJ1xuaW1wb3J0IHsgVkljb24gfSBmcm9tICcuLi9WSWNvbidcbmltcG9ydCBWVHJlZXZpZXcgZnJvbSAnLi9WVHJlZXZpZXcnXG5cbi8vIE1peGluc1xuaW1wb3J0IHsgaW5qZWN0IGFzIFJlZ2lzdHJhYmxlSW5qZWN0IH0gZnJvbSAnLi4vLi4vbWl4aW5zL3JlZ2lzdHJhYmxlJ1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuXG4vLyBVdGlsc1xuaW1wb3J0IG1peGlucywgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBnZXRPYmplY3RWYWx1ZUJ5UGF0aCwgY3JlYXRlUmFuZ2UgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5cbnR5cGUgVlRyZWVWaWV3SW5zdGFuY2UgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIFZUcmVldmlldz5cblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgQ29sb3JhYmxlLFxuICBSZWdpc3RyYWJsZUluamVjdCgndHJlZXZpZXcnKVxuKVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIEV4dHJhY3RWdWU8dHlwZW9mIGJhc2VNaXhpbnM+IHtcbiAgdHJlZXZpZXc6IFZUcmVlVmlld0luc3RhbmNlXG59XG5cbmV4cG9ydCBjb25zdCBWVHJlZXZpZXdOb2RlUHJvcHMgPSB7XG4gIGFjdGl2YXRhYmxlOiBCb29sZWFuLFxuICBhY3RpdmVDbGFzczoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAndi10cmVldmlldy1ub2RlLS1hY3RpdmUnLFxuICB9LFxuICBjb2xvcjoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAncHJpbWFyeScsXG4gIH0sXG4gIGV4cGFuZEljb246IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgZGVmYXVsdDogJyRzdWJncm91cCcsXG4gIH0sXG4gIGluZGV0ZXJtaW5hdGVJY29uOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGRlZmF1bHQ6ICckY2hlY2tib3hJbmRldGVybWluYXRlJyxcbiAgfSxcbiAgaXRlbUNoaWxkcmVuOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGRlZmF1bHQ6ICdjaGlsZHJlbicsXG4gIH0sXG4gIGl0ZW1EaXNhYmxlZDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAnZGlzYWJsZWQnLFxuICB9LFxuICBpdGVtS2V5OiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGRlZmF1bHQ6ICdpZCcsXG4gIH0sXG4gIGl0ZW1UZXh0OiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGRlZmF1bHQ6ICduYW1lJyxcbiAgfSxcbiAgbG9hZENoaWxkcmVuOiBGdW5jdGlvbiBhcyBQcm9wVHlwZTwoaXRlbTogYW55KSA9PiBQcm9taXNlPHZvaWQ+PixcbiAgbG9hZGluZ0ljb246IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgZGVmYXVsdDogJyRsb2FkaW5nJyxcbiAgfSxcbiAgb2ZmSWNvbjoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAnJGNoZWNrYm94T2ZmJyxcbiAgfSxcbiAgb25JY29uOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGRlZmF1bHQ6ICckY2hlY2tib3hPbicsXG4gIH0sXG4gIG9wZW5PbkNsaWNrOiBCb29sZWFuLFxuICByb3VuZGVkOiBCb29sZWFuLFxuICBzZWxlY3RhYmxlOiBCb29sZWFuLFxuICBzZWxlY3RlZENvbG9yOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGRlZmF1bHQ6ICdhY2NlbnQnLFxuICB9LFxuICBzaGFwZWQ6IEJvb2xlYW4sXG4gIHRyYW5zaXRpb246IEJvb2xlYW4sXG59XG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5jb25zdCBWVHJlZXZpZXdOb2RlID0gYmFzZU1peGlucy5leHRlbmQ8b3B0aW9ucz4oKS5leHRlbmQoe1xuICBuYW1lOiAndi10cmVldmlldy1ub2RlJyxcblxuICBpbmplY3Q6IHtcbiAgICB0cmVldmlldzoge1xuICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgbGV2ZWw6IE51bWJlcixcbiAgICBpdGVtOiB7XG4gICAgICB0eXBlOiBPYmplY3QsXG4gICAgICBkZWZhdWx0OiAoKSA9PiBudWxsLFxuICAgIH0sXG4gICAgLi4uVlRyZWV2aWV3Tm9kZVByb3BzLFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgaGFzTG9hZGVkOiBmYWxzZSxcbiAgICBpc0FjdGl2ZTogZmFsc2UsIC8vIE5vZGUgaXMgc2VsZWN0ZWQgKHJvdylcbiAgICBpc0luZGV0ZXJtaW5hdGU6IGZhbHNlLCAvLyBOb2RlIGhhcyBhdCBsZWFzdCBvbmUgc2VsZWN0ZWQgY2hpbGRcbiAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgIGlzT3BlbjogZmFsc2UsIC8vIE5vZGUgaXMgb3Blbi9leHBhbmRlZFxuICAgIGlzU2VsZWN0ZWQ6IGZhbHNlLCAvLyBOb2RlIGlzIHNlbGVjdGVkIChjaGVja2JveClcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBkaXNhYmxlZCAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBnZXRPYmplY3RWYWx1ZUJ5UGF0aCh0aGlzLml0ZW0sIHRoaXMuaXRlbURpc2FibGVkKVxuICAgIH0sXG4gICAga2V5ICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIGdldE9iamVjdFZhbHVlQnlQYXRoKHRoaXMuaXRlbSwgdGhpcy5pdGVtS2V5KVxuICAgIH0sXG4gICAgY2hpbGRyZW4gKCk6IGFueVtdIHwgbnVsbCB7XG4gICAgICByZXR1cm4gZ2V0T2JqZWN0VmFsdWVCeVBhdGgodGhpcy5pdGVtLCB0aGlzLml0ZW1DaGlsZHJlbilcbiAgICB9LFxuICAgIHRleHQgKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gZ2V0T2JqZWN0VmFsdWVCeVBhdGgodGhpcy5pdGVtLCB0aGlzLml0ZW1UZXh0KVxuICAgIH0sXG4gICAgc2NvcGVkUHJvcHMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpdGVtOiB0aGlzLml0ZW0sXG4gICAgICAgIGxlYWY6ICF0aGlzLmNoaWxkcmVuLFxuICAgICAgICBzZWxlY3RlZDogdGhpcy5pc1NlbGVjdGVkLFxuICAgICAgICBpbmRldGVybWluYXRlOiB0aGlzLmlzSW5kZXRlcm1pbmF0ZSxcbiAgICAgICAgYWN0aXZlOiB0aGlzLmlzQWN0aXZlLFxuICAgICAgICBvcGVuOiB0aGlzLmlzT3BlbixcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkSWNvbiAoKTogc3RyaW5nIHtcbiAgICAgIGlmICh0aGlzLmlzSW5kZXRlcm1pbmF0ZSkgcmV0dXJuIHRoaXMuaW5kZXRlcm1pbmF0ZUljb25cbiAgICAgIGVsc2UgaWYgKHRoaXMuaXNTZWxlY3RlZCkgcmV0dXJuIHRoaXMub25JY29uXG4gICAgICBlbHNlIHJldHVybiB0aGlzLm9mZkljb25cbiAgICB9LFxuICAgIGhhc0NoaWxkcmVuICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4gJiYgKCEhdGhpcy5jaGlsZHJlbi5sZW5ndGggfHwgISF0aGlzLmxvYWRDaGlsZHJlbilcbiAgICB9LFxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIHRoaXMudHJlZXZpZXcucmVnaXN0ZXIodGhpcylcbiAgfSxcblxuICBiZWZvcmVEZXN0cm95ICgpIHtcbiAgICB0aGlzLnRyZWV2aWV3LnVucmVnaXN0ZXIodGhpcylcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgY2hlY2tDaGlsZHJlbiAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB7XG4gICAgICAgIC8vIFRPRE86IFBvdGVudGlhbCBpc3N1ZSB3aXRoIGFsd2F5cyB0cnlpbmdcbiAgICAgICAgLy8gdG8gbG9hZCBjaGlsZHJlbiBpZiByZXNwb25zZSBpcyBlbXB0eT9cbiAgICAgICAgaWYgKCF0aGlzLmNoaWxkcmVuIHx8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIHx8ICF0aGlzLmxvYWRDaGlsZHJlbiB8fCB0aGlzLmhhc0xvYWRlZCkgcmV0dXJuIHJlc29sdmUoKVxuXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZVxuICAgICAgICByZXNvbHZlKHRoaXMubG9hZENoaWxkcmVuKHRoaXMuaXRlbSkpXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLmhhc0xvYWRlZCA9IHRydWVcbiAgICAgIH0pXG4gICAgfSxcbiAgICBvcGVuICgpIHtcbiAgICAgIHRoaXMuaXNPcGVuID0gIXRoaXMuaXNPcGVuXG4gICAgICB0aGlzLnRyZWV2aWV3LnVwZGF0ZU9wZW4odGhpcy5rZXksIHRoaXMuaXNPcGVuKVxuICAgICAgdGhpcy50cmVldmlldy5lbWl0T3BlbigpXG4gICAgfSxcbiAgICBnZW5MYWJlbCAoKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtdXG5cbiAgICAgIGlmICh0aGlzLiRzY29wZWRTbG90cy5sYWJlbCkgY2hpbGRyZW4ucHVzaCh0aGlzLiRzY29wZWRTbG90cy5sYWJlbCh0aGlzLnNjb3BlZFByb3BzKSlcbiAgICAgIGVsc2UgY2hpbGRyZW4ucHVzaCh0aGlzLnRleHQpXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHNsb3Q6ICdsYWJlbCcsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10cmVldmlldy1ub2RlX19sYWJlbCcsXG4gICAgICB9LCBjaGlsZHJlbilcbiAgICB9LFxuICAgIGdlblByZXBlbmRTbG90ICgpIHtcbiAgICAgIGlmICghdGhpcy4kc2NvcGVkU2xvdHMucHJlcGVuZCkgcmV0dXJuIG51bGxcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXRyZWV2aWV3LW5vZGVfX3ByZXBlbmQnLFxuICAgICAgfSwgdGhpcy4kc2NvcGVkU2xvdHMucHJlcGVuZCh0aGlzLnNjb3BlZFByb3BzKSlcbiAgICB9LFxuICAgIGdlbkFwcGVuZFNsb3QgKCkge1xuICAgICAgaWYgKCF0aGlzLiRzY29wZWRTbG90cy5hcHBlbmQpIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10cmVldmlldy1ub2RlX19hcHBlbmQnLFxuICAgICAgfSwgdGhpcy4kc2NvcGVkU2xvdHMuYXBwZW5kKHRoaXMuc2NvcGVkUHJvcHMpKVxuICAgIH0sXG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtcbiAgICAgICAgdGhpcy5nZW5QcmVwZW5kU2xvdCgpLFxuICAgICAgICB0aGlzLmdlbkxhYmVsKCksXG4gICAgICAgIHRoaXMuZ2VuQXBwZW5kU2xvdCgpLFxuICAgICAgXVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtdHJlZXZpZXctbm9kZV9fY29udGVudCcsXG4gICAgICB9LCBjaGlsZHJlbilcbiAgICB9LFxuICAgIGdlblRvZ2dsZSAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWSWNvbiwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtdHJlZXZpZXctbm9kZV9fdG9nZ2xlJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi10cmVldmlldy1ub2RlX190b2dnbGUtLW9wZW4nOiB0aGlzLmlzT3BlbixcbiAgICAgICAgICAndi10cmVldmlldy1ub2RlX190b2dnbGUtLWxvYWRpbmcnOiB0aGlzLmlzTG9hZGluZyxcbiAgICAgICAgfSxcbiAgICAgICAgc2xvdDogJ3ByZXBlbmQnLFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVyblxuXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykgcmV0dXJuXG5cbiAgICAgICAgICAgIHRoaXMuY2hlY2tDaGlsZHJlbigpLnRoZW4oKCkgPT4gdGhpcy5vcGVuKCkpXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sIFt0aGlzLmlzTG9hZGluZyA/IHRoaXMubG9hZGluZ0ljb24gOiB0aGlzLmV4cGFuZEljb25dKVxuICAgIH0sXG4gICAgZ2VuQ2hlY2tib3ggKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkljb24sIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXRyZWV2aWV3LW5vZGVfX2NoZWNrYm94JyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBjb2xvcjogdGhpcy5pc1NlbGVjdGVkIHx8IHRoaXMuaXNJbmRldGVybWluYXRlID8gdGhpcy5zZWxlY3RlZENvbG9yIDogdW5kZWZpbmVkLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVyblxuXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykgcmV0dXJuXG5cbiAgICAgICAgICAgIHRoaXMuY2hlY2tDaGlsZHJlbigpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAvLyBXZSBuZXh0VGljayBoZXJlIHNvIHRoYXQgaXRlbXMgd2F0Y2ggaW4gVlRyZWV2aWV3IGhhcyBhIGNoYW5jZSB0byBydW4gZmlyc3RcbiAgICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RlZCA9ICF0aGlzLmlzU2VsZWN0ZWRcbiAgICAgICAgICAgICAgICB0aGlzLmlzSW5kZXRlcm1pbmF0ZSA9IGZhbHNlXG5cbiAgICAgICAgICAgICAgICB0aGlzLnRyZWV2aWV3LnVwZGF0ZVNlbGVjdGVkKHRoaXMua2V5LCB0aGlzLmlzU2VsZWN0ZWQpXG4gICAgICAgICAgICAgICAgdGhpcy50cmVldmlldy5lbWl0U2VsZWN0ZWQoKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSwgW3RoaXMuY29tcHV0ZWRJY29uXSlcbiAgICB9LFxuICAgIGdlbkxldmVsIChsZXZlbDogbnVtYmVyKSB7XG4gICAgICByZXR1cm4gY3JlYXRlUmFuZ2UobGV2ZWwpLm1hcCgoKSA9PiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10cmVldmlldy1ub2RlX19sZXZlbCcsXG4gICAgICB9KSlcbiAgICB9LFxuICAgIGdlbk5vZGUgKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW3RoaXMuZ2VuQ29udGVudCgpXVxuXG4gICAgICBpZiAodGhpcy5zZWxlY3RhYmxlKSBjaGlsZHJlbi51bnNoaWZ0KHRoaXMuZ2VuQ2hlY2tib3goKSlcblxuICAgICAgaWYgKHRoaXMuaGFzQ2hpbGRyZW4pIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdCh0aGlzLmdlblRvZ2dsZSgpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hpbGRyZW4udW5zaGlmdCguLi50aGlzLmdlbkxldmVsKDEpKVxuICAgICAgfVxuXG4gICAgICBjaGlsZHJlbi51bnNoaWZ0KC4uLnRoaXMuZ2VuTGV2ZWwodGhpcy5sZXZlbCkpXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldFRleHRDb2xvcih0aGlzLmlzQWN0aXZlICYmIHRoaXMuY29sb3IsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXRyZWV2aWV3LW5vZGVfX3Jvb3QnLFxuICAgICAgICBjbGFzczoge1xuICAgICAgICAgIFt0aGlzLmFjdGl2ZUNsYXNzXTogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVyblxuXG4gICAgICAgICAgICBpZiAodGhpcy5vcGVuT25DbGljayAmJiB0aGlzLmhhc0NoaWxkcmVuKSB7XG4gICAgICAgICAgICAgIHRoaXMub3BlbigpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aXZhdGFibGUpIHtcbiAgICAgICAgICAgICAgdGhpcy5pc0FjdGl2ZSA9ICF0aGlzLmlzQWN0aXZlXG4gICAgICAgICAgICAgIHRoaXMudHJlZXZpZXcudXBkYXRlQWN0aXZlKHRoaXMua2V5LCB0aGlzLmlzQWN0aXZlKVxuICAgICAgICAgICAgICB0aGlzLnRyZWV2aWV3LmVtaXRBY3RpdmUoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KSwgY2hpbGRyZW4pXG4gICAgfSxcbiAgICBnZW5DaGlsZCAoaXRlbTogYW55KTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVlRyZWV2aWV3Tm9kZSwge1xuICAgICAgICBrZXk6IGdldE9iamVjdFZhbHVlQnlQYXRoKGl0ZW0sIHRoaXMuaXRlbUtleSksXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgYWN0aXZhdGFibGU6IHRoaXMuYWN0aXZhdGFibGUsXG4gICAgICAgICAgYWN0aXZlQ2xhc3M6IHRoaXMuYWN0aXZlQ2xhc3MsXG4gICAgICAgICAgaXRlbSxcbiAgICAgICAgICBzZWxlY3RhYmxlOiB0aGlzLnNlbGVjdGFibGUsXG4gICAgICAgICAgc2VsZWN0ZWRDb2xvcjogdGhpcy5zZWxlY3RlZENvbG9yLFxuICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxuICAgICAgICAgIGV4cGFuZEljb246IHRoaXMuZXhwYW5kSWNvbixcbiAgICAgICAgICBpbmRldGVybWluYXRlSWNvbjogdGhpcy5pbmRldGVybWluYXRlSWNvbixcbiAgICAgICAgICBvZmZJY29uOiB0aGlzLm9mZkljb24sXG4gICAgICAgICAgb25JY29uOiB0aGlzLm9uSWNvbixcbiAgICAgICAgICBsb2FkaW5nSWNvbjogdGhpcy5sb2FkaW5nSWNvbixcbiAgICAgICAgICBpdGVtS2V5OiB0aGlzLml0ZW1LZXksXG4gICAgICAgICAgaXRlbVRleHQ6IHRoaXMuaXRlbVRleHQsXG4gICAgICAgICAgaXRlbURpc2FibGVkOiB0aGlzLml0ZW1EaXNhYmxlZCxcbiAgICAgICAgICBpdGVtQ2hpbGRyZW46IHRoaXMuaXRlbUNoaWxkcmVuLFxuICAgICAgICAgIGxvYWRDaGlsZHJlbjogdGhpcy5sb2FkQ2hpbGRyZW4sXG4gICAgICAgICAgdHJhbnNpdGlvbjogdGhpcy50cmFuc2l0aW9uLFxuICAgICAgICAgIG9wZW5PbkNsaWNrOiB0aGlzLm9wZW5PbkNsaWNrLFxuICAgICAgICAgIHJvdW5kZWQ6IHRoaXMucm91bmRlZCxcbiAgICAgICAgICBzaGFwZWQ6IHRoaXMuc2hhcGVkLFxuICAgICAgICAgIGxldmVsOiB0aGlzLmxldmVsICsgMSxcbiAgICAgICAgfSxcbiAgICAgICAgc2NvcGVkU2xvdHM6IHRoaXMuJHNjb3BlZFNsb3RzLFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlbkNoaWxkcmVuV3JhcHBlciAoKTogYW55IHtcbiAgICAgIGlmICghdGhpcy5pc09wZW4gfHwgIXRoaXMuY2hpbGRyZW4pIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW3RoaXMuY2hpbGRyZW4ubWFwKHRoaXMuZ2VuQ2hpbGQpXVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtdHJlZXZpZXctbm9kZV9fY2hpbGRyZW4nLFxuICAgICAgfSwgY2hpbGRyZW4pXG4gICAgfSxcbiAgICBnZW5UcmFuc2l0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZFeHBhbmRUcmFuc2l0aW9uLCBbdGhpcy5nZW5DaGlsZHJlbldyYXBwZXIoKV0pXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBbdGhpcy5nZW5Ob2RlKCldXG5cbiAgICBpZiAodGhpcy50cmFuc2l0aW9uKSBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuVHJhbnNpdGlvbigpKVxuICAgIGVsc2UgY2hpbGRyZW4ucHVzaCh0aGlzLmdlbkNoaWxkcmVuV3JhcHBlcigpKVxuXG4gICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi10cmVldmlldy1ub2RlJyxcbiAgICAgIGNsYXNzOiB7XG4gICAgICAgICd2LXRyZWV2aWV3LW5vZGUtLWxlYWYnOiAhdGhpcy5oYXNDaGlsZHJlbixcbiAgICAgICAgJ3YtdHJlZXZpZXctbm9kZS0tY2xpY2snOiB0aGlzLm9wZW5PbkNsaWNrLFxuICAgICAgICAndi10cmVldmlldy1ub2RlLS1kaXNhYmxlZCc6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICd2LXRyZWV2aWV3LW5vZGUtLXJvdW5kZWQnOiB0aGlzLnJvdW5kZWQsXG4gICAgICAgICd2LXRyZWV2aWV3LW5vZGUtLXNoYXBlZCc6IHRoaXMuc2hhcGVkLFxuICAgICAgICAndi10cmVldmlldy1ub2RlLS1zZWxlY3RlZCc6IHRoaXMuaXNTZWxlY3RlZCxcbiAgICAgICAgJ3YtdHJlZXZpZXctbm9kZS0tZXhjbHVkZWQnOiB0aGlzLnRyZWV2aWV3LmlzRXhjbHVkZWQodGhpcy5rZXkpLFxuICAgICAgfSxcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogU3RyaW5nKHRoaXMuaXNPcGVuKSxcbiAgICAgIH0sXG4gICAgfSwgY2hpbGRyZW4pXG4gIH0sXG59KVxuXG5leHBvcnQgZGVmYXVsdCBWVHJlZXZpZXdOb2RlXG4iXX0=