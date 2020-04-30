// Styles
import '../VTextField/VTextField.sass';
import './VSelect.sass';
// Components
import VChip from '../VChip';
import VMenu from '../VMenu';
import VSelectList from './VSelectList';
// Extensions
import VInput from '../VInput';
import VTextField from '../VTextField/VTextField';
// Mixins
import Comparable from '../../mixins/comparable';
import Filterable from '../../mixins/filterable';
// Directives
import ClickOutside from '../../directives/click-outside';
// Utilities
import mergeData from '../../util/mergeData';
import { getPropertyFromItem, getObjectValueByPath, keyCodes } from '../../util/helpers';
import { consoleError } from '../../util/console';
// Types
import mixins from '../../util/mixins';
export const defaultMenuProps = {
    closeOnClick: false,
    closeOnContentClick: false,
    disableKeys: true,
    openOnClick: false,
    maxHeight: 304,
};
// Types
const baseMixins = mixins(VTextField, Comparable, Filterable);
/* @vue/component */
export default baseMixins.extend().extend({
    name: 'v-select',
    directives: {
        ClickOutside,
    },
    props: {
        appendIcon: {
            type: String,
            default: '$dropdown',
        },
        attach: {
            type: null,
            default: false,
        },
        cacheItems: Boolean,
        chips: Boolean,
        clearable: Boolean,
        deletableChips: Boolean,
        disableLookup: Boolean,
        eager: Boolean,
        hideSelected: Boolean,
        items: {
            type: Array,
            default: () => [],
        },
        itemColor: {
            type: String,
            default: 'primary',
        },
        itemDisabled: {
            type: [String, Array, Function],
            default: 'disabled',
        },
        itemText: {
            type: [String, Array, Function],
            default: 'text',
        },
        itemValue: {
            type: [String, Array, Function],
            default: 'value',
        },
        menuProps: {
            type: [String, Array, Object],
            default: () => defaultMenuProps,
        },
        multiple: Boolean,
        openOnClear: Boolean,
        returnObject: Boolean,
        smallChips: Boolean,
    },
    data() {
        return {
            cachedItems: this.cacheItems ? this.items : [],
            menuIsBooted: false,
            isMenuActive: false,
            lastItem: 20,
            // As long as a value is defined, show it
            // Otherwise, check if multiple
            // to determine which default to provide
            lazyValue: this.value !== undefined
                ? this.value
                : this.multiple ? [] : undefined,
            selectedIndex: -1,
            selectedItems: [],
            keyboardLookupPrefix: '',
            keyboardLookupLastTime: 0,
        };
    },
    computed: {
        /* All items that the select has */
        allItems() {
            return this.filterDuplicates(this.cachedItems.concat(this.items));
        },
        classes() {
            return {
                ...VTextField.options.computed.classes.call(this),
                'v-select': true,
                'v-select--chips': this.hasChips,
                'v-select--chips--small': this.smallChips,
                'v-select--is-menu-active': this.isMenuActive,
                'v-select--is-multi': this.multiple,
            };
        },
        /* Used by other components to overwrite */
        computedItems() {
            return this.allItems;
        },
        computedOwns() {
            return `list-${this._uid}`;
        },
        computedCounterValue() {
            return this.multiple
                ? this.selectedItems.length
                : (this.getText(this.selectedItems[0]) || '').toString().length;
        },
        directives() {
            return this.isFocused ? [{
                    name: 'click-outside',
                    value: this.blur,
                    args: {
                        closeConditional: this.closeConditional,
                    },
                }] : undefined;
        },
        dynamicHeight() {
            return 'auto';
        },
        hasChips() {
            return this.chips || this.smallChips;
        },
        hasSlot() {
            return Boolean(this.hasChips || this.$scopedSlots.selection);
        },
        isDirty() {
            return this.selectedItems.length > 0;
        },
        listData() {
            const scopeId = this.$vnode && this.$vnode.context.$options._scopeId;
            const attrs = scopeId ? {
                [scopeId]: true,
            } : {};
            return {
                attrs: {
                    ...attrs,
                    id: this.computedOwns,
                },
                props: {
                    action: this.multiple,
                    color: this.itemColor,
                    dense: this.dense,
                    hideSelected: this.hideSelected,
                    items: this.virtualizedItems,
                    itemDisabled: this.itemDisabled,
                    itemText: this.itemText,
                    itemValue: this.itemValue,
                    noDataText: this.$vuetify.lang.t(this.noDataText),
                    selectedItems: this.selectedItems,
                },
                on: {
                    select: this.selectItem,
                },
                scopedSlots: {
                    item: this.$scopedSlots.item,
                },
            };
        },
        staticList() {
            if (this.$slots['no-data'] || this.$slots['prepend-item'] || this.$slots['append-item']) {
                consoleError('assert: staticList should not be called if slots are used');
            }
            return this.$createElement(VSelectList, this.listData);
        },
        virtualizedItems() {
            return this.$_menuProps.auto
                ? this.computedItems
                : this.computedItems.slice(0, this.lastItem);
        },
        menuCanShow: () => true,
        $_menuProps() {
            let normalisedProps = typeof this.menuProps === 'string'
                ? this.menuProps.split(',')
                : this.menuProps;
            if (Array.isArray(normalisedProps)) {
                normalisedProps = normalisedProps.reduce((acc, p) => {
                    acc[p.trim()] = true;
                    return acc;
                }, {});
            }
            return {
                ...defaultMenuProps,
                eager: this.eager,
                value: this.menuCanShow && this.isMenuActive,
                nudgeBottom: normalisedProps.offsetY ? 1 : 0,
                ...normalisedProps,
            };
        },
    },
    watch: {
        internalValue(val) {
            this.initialValue = val;
            this.setSelectedItems();
        },
        menuIsBooted() {
            window.setTimeout(() => {
                if (this.getContent() && this.getContent().addEventListener) {
                    this.getContent().addEventListener('scroll', this.onScroll, false);
                }
            });
        },
        isMenuActive(val) {
            window.setTimeout(() => this.onMenuActiveChange(val));
            if (!val)
                return;
            this.menuIsBooted = true;
        },
        items: {
            immediate: true,
            handler(val) {
                if (this.cacheItems) {
                    // Breaks vue-test-utils if
                    // this isn't calculated
                    // on the next tick
                    this.$nextTick(() => {
                        this.cachedItems = this.filterDuplicates(this.cachedItems.concat(val));
                    });
                }
                this.setSelectedItems();
            },
        },
    },
    methods: {
        /** @public */
        blur(e) {
            VTextField.options.methods.blur.call(this, e);
            this.isMenuActive = false;
            this.isFocused = false;
            this.selectedIndex = -1;
        },
        /** @public */
        activateMenu() {
            if (this.disabled ||
                this.readonly ||
                this.isMenuActive)
                return;
            this.isMenuActive = true;
        },
        clearableCallback() {
            this.setValue(this.multiple ? [] : undefined);
            this.setMenuIndex(-1);
            this.$nextTick(() => this.$refs.input && this.$refs.input.focus());
            if (this.openOnClear)
                this.isMenuActive = true;
        },
        closeConditional(e) {
            if (!this.isMenuActive)
                return true;
            return (!this._isDestroyed &&
                // Click originates from outside the menu content
                // Multiple selects don't close when an item is clicked
                (!this.getContent() ||
                    !this.getContent().contains(e.target)) &&
                // Click originates from outside the element
                this.$el &&
                !this.$el.contains(e.target) &&
                e.target !== this.$el);
        },
        filterDuplicates(arr) {
            const uniqueValues = new Map();
            for (let index = 0; index < arr.length; ++index) {
                const item = arr[index];
                const val = this.getValue(item);
                // TODO: comparator
                !uniqueValues.has(val) && uniqueValues.set(val, item);
            }
            return Array.from(uniqueValues.values());
        },
        findExistingIndex(item) {
            const itemValue = this.getValue(item);
            return (this.internalValue || []).findIndex((i) => this.valueComparator(this.getValue(i), itemValue));
        },
        getContent() {
            return this.$refs.menu && this.$refs.menu.$refs.content;
        },
        genChipSelection(item, index) {
            const isDisabled = (this.disabled ||
                this.readonly ||
                this.getDisabled(item));
            return this.$createElement(VChip, {
                staticClass: 'v-chip--select',
                attrs: { tabindex: -1 },
                props: {
                    close: this.deletableChips && !isDisabled,
                    disabled: isDisabled,
                    inputValue: index === this.selectedIndex,
                    small: this.smallChips,
                },
                on: {
                    click: (e) => {
                        if (isDisabled)
                            return;
                        e.stopPropagation();
                        this.selectedIndex = index;
                    },
                    'click:close': () => this.onChipInput(item),
                },
                key: JSON.stringify(this.getValue(item)),
            }, this.getText(item));
        },
        genCommaSelection(item, index, last) {
            const color = index === this.selectedIndex && this.computedColor;
            const isDisabled = (this.disabled ||
                this.getDisabled(item));
            return this.$createElement('div', this.setTextColor(color, {
                staticClass: 'v-select__selection v-select__selection--comma',
                class: {
                    'v-select__selection--disabled': isDisabled,
                },
                key: JSON.stringify(this.getValue(item)),
            }), `${this.getText(item)}${last ? '' : ', '}`);
        },
        genDefaultSlot() {
            const selections = this.genSelections();
            const input = this.genInput();
            // If the return is an empty array
            // push the input
            if (Array.isArray(selections)) {
                selections.push(input);
                // Otherwise push it into children
            }
            else {
                selections.children = selections.children || [];
                selections.children.push(input);
            }
            return [
                this.genFieldset(),
                this.$createElement('div', {
                    staticClass: 'v-select__slot',
                    directives: this.directives,
                }, [
                    this.genLabel(),
                    this.prefix ? this.genAffix('prefix') : null,
                    selections,
                    this.suffix ? this.genAffix('suffix') : null,
                    this.genClearIcon(),
                    this.genIconSlot(),
                    this.genHiddenInput(),
                ]),
                this.genMenu(),
                this.genProgress(),
            ];
        },
        genIcon(type, cb, extraData) {
            const icon = VInput.options.methods.genIcon.call(this, type, cb, extraData);
            if (type === 'append') {
                // Don't allow the dropdown icon to be focused
                icon.children[0].data = mergeData(icon.children[0].data, {
                    attrs: {
                        tabindex: icon.children[0].componentOptions.listeners && '-1',
                        'aria-hidden': 'true',
                        'aria-label': undefined,
                    },
                });
            }
            return icon;
        },
        genInput() {
            const input = VTextField.options.methods.genInput.call(this);
            delete input.data.attrs.name;
            input.data = mergeData(input.data, {
                domProps: { value: null },
                attrs: {
                    readonly: true,
                    type: 'text',
                    'aria-readonly': String(this.readonly),
                    'aria-activedescendant': getObjectValueByPath(this.$refs.menu, 'activeTile.id'),
                    autocomplete: getObjectValueByPath(input.data, 'attrs.autocomplete', 'off'),
                },
                on: { keypress: this.onKeyPress },
            });
            return input;
        },
        genHiddenInput() {
            return this.$createElement('input', {
                domProps: { value: this.lazyValue },
                attrs: {
                    type: 'hidden',
                    name: this.attrs$.name,
                },
            });
        },
        genInputSlot() {
            const render = VTextField.options.methods.genInputSlot.call(this);
            render.data.attrs = {
                ...render.data.attrs,
                role: 'button',
                'aria-haspopup': 'listbox',
                'aria-expanded': String(this.isMenuActive),
                'aria-owns': this.computedOwns,
            };
            return render;
        },
        genList() {
            // If there's no slots, we can use a cached VNode to improve performance
            if (this.$slots['no-data'] || this.$slots['prepend-item'] || this.$slots['append-item']) {
                return this.genListWithSlot();
            }
            else {
                return this.staticList;
            }
        },
        genListWithSlot() {
            const slots = ['prepend-item', 'no-data', 'append-item']
                .filter(slotName => this.$slots[slotName])
                .map(slotName => this.$createElement('template', {
                slot: slotName,
            }, this.$slots[slotName]));
            // Requires destructuring due to Vue
            // modifying the `on` property when passed
            // as a referenced object
            return this.$createElement(VSelectList, {
                ...this.listData,
            }, slots);
        },
        genMenu() {
            const props = this.$_menuProps;
            props.activator = this.$refs['input-slot'];
            // Attach to root el so that
            // menu covers prepend/append icons
            if (
            // TODO: make this a computed property or helper or something
            this.attach === '' || // If used as a boolean prop (<v-menu attach>)
                this.attach === true || // If bound to a boolean (<v-menu :attach="true">)
                this.attach === 'attach' // If bound as boolean prop in pug (v-menu(attach))
            ) {
                props.attach = this.$el;
            }
            else {
                props.attach = this.attach;
            }
            return this.$createElement(VMenu, {
                attrs: { role: undefined, offsetY: true },
                props,
                on: {
                    input: (val) => {
                        this.isMenuActive = val;
                        this.isFocused = val;
                    },
                },
                ref: 'menu',
            }, [this.genList()]);
        },
        genSelections() {
            let length = this.selectedItems.length;
            const children = new Array(length);
            let genSelection;
            if (this.$scopedSlots.selection) {
                genSelection = this.genSlotSelection;
            }
            else if (this.hasChips) {
                genSelection = this.genChipSelection;
            }
            else {
                genSelection = this.genCommaSelection;
            }
            while (length--) {
                children[length] = genSelection(this.selectedItems[length], length, length === children.length - 1);
            }
            return this.$createElement('div', {
                staticClass: 'v-select__selections',
            }, children);
        },
        genSlotSelection(item, index) {
            return this.$scopedSlots.selection({
                attrs: {
                    class: 'v-chip--select',
                },
                parent: this,
                item,
                index,
                select: (e) => {
                    e.stopPropagation();
                    this.selectedIndex = index;
                },
                selected: index === this.selectedIndex,
                disabled: this.disabled || this.readonly,
            });
        },
        getMenuIndex() {
            return this.$refs.menu ? this.$refs.menu.listIndex : -1;
        },
        getDisabled(item) {
            return getPropertyFromItem(item, this.itemDisabled, false);
        },
        getText(item) {
            return getPropertyFromItem(item, this.itemText, item);
        },
        getValue(item) {
            return getPropertyFromItem(item, this.itemValue, this.getText(item));
        },
        onBlur(e) {
            e && this.$emit('blur', e);
        },
        onChipInput(item) {
            if (this.multiple)
                this.selectItem(item);
            else
                this.setValue(null);
            // If all items have been deleted,
            // open `v-menu`
            if (this.selectedItems.length === 0) {
                this.isMenuActive = true;
            }
            else {
                this.isMenuActive = false;
            }
            this.selectedIndex = -1;
        },
        onClick(e) {
            if (this.isDisabled)
                return;
            if (!this.isAppendInner(e.target)) {
                this.isMenuActive = true;
            }
            if (!this.isFocused) {
                this.isFocused = true;
                this.$emit('focus');
            }
            this.$emit('click', e);
        },
        onEscDown(e) {
            e.preventDefault();
            if (this.isMenuActive) {
                e.stopPropagation();
                this.isMenuActive = false;
            }
        },
        onKeyPress(e) {
            if (this.multiple ||
                this.readonly ||
                this.disableLookup)
                return;
            const KEYBOARD_LOOKUP_THRESHOLD = 1000; // milliseconds
            const now = performance.now();
            if (now - this.keyboardLookupLastTime > KEYBOARD_LOOKUP_THRESHOLD) {
                this.keyboardLookupPrefix = '';
            }
            this.keyboardLookupPrefix += e.key.toLowerCase();
            this.keyboardLookupLastTime = now;
            const index = this.allItems.findIndex(item => {
                const text = (this.getText(item) || '').toString();
                return text.toLowerCase().startsWith(this.keyboardLookupPrefix);
            });
            const item = this.allItems[index];
            if (index !== -1) {
                this.lastItem = Math.max(this.lastItem, index + 5);
                this.setValue(this.returnObject ? item : this.getValue(item));
                this.$nextTick(() => this.$refs.menu.getTiles());
                setTimeout(() => this.setMenuIndex(index));
            }
        },
        onKeyDown(e) {
            if (this.readonly)
                return;
            const keyCode = e.keyCode;
            const menu = this.$refs.menu;
            // If enter, space, open menu
            if ([
                keyCodes.enter,
                keyCodes.space,
            ].includes(keyCode))
                this.activateMenu();
            this.$emit('keydown', e);
            if (!menu)
                return;
            // If menu is active, allow default
            // listIndex change from menu
            if (this.isMenuActive && keyCode !== keyCodes.tab) {
                this.$nextTick(() => {
                    menu.changeListIndex(e);
                    this.$emit('update:list-index', menu.listIndex);
                });
            }
            // If menu is not active, up and down can do
            // one of 2 things. If multiple, opens the
            // menu, if not, will cycle through all
            // available options
            if (!this.isMenuActive &&
                [keyCodes.up, keyCodes.down].includes(keyCode))
                return this.onUpDown(e);
            // If escape deactivate the menu
            if (keyCode === keyCodes.esc)
                return this.onEscDown(e);
            // If tab - select item or close menu
            if (keyCode === keyCodes.tab)
                return this.onTabDown(e);
            // If space preventDefault
            if (keyCode === keyCodes.space)
                return this.onSpaceDown(e);
        },
        onMenuActiveChange(val) {
            // If menu is closing and mulitple
            // or menuIndex is already set
            // skip menu index recalculation
            if ((this.multiple && !val) ||
                this.getMenuIndex() > -1)
                return;
            const menu = this.$refs.menu;
            if (!menu || !this.isDirty)
                return;
            // When menu opens, set index of first active item
            for (let i = 0; i < menu.tiles.length; i++) {
                if (menu.tiles[i].getAttribute('aria-selected') === 'true') {
                    this.setMenuIndex(i);
                    break;
                }
            }
        },
        onMouseUp(e) {
            if (this.hasMouseDown &&
                e.which !== 3 &&
                !this.isDisabled) {
                // If append inner is present
                // and the target is itself
                // or inside, toggle menu
                if (this.isAppendInner(e.target)) {
                    this.$nextTick(() => (this.isMenuActive = !this.isMenuActive));
                    // If user is clicking in the container
                    // and field is enclosed, activate it
                }
                else if (this.isEnclosed) {
                    this.isMenuActive = true;
                }
            }
            VTextField.options.methods.onMouseUp.call(this, e);
        },
        onScroll() {
            if (!this.isMenuActive) {
                requestAnimationFrame(() => (this.getContent().scrollTop = 0));
            }
            else {
                if (this.lastItem >= this.computedItems.length)
                    return;
                const showMoreItems = (this.getContent().scrollHeight -
                    (this.getContent().scrollTop +
                        this.getContent().clientHeight)) < 200;
                if (showMoreItems) {
                    this.lastItem += 20;
                }
            }
        },
        onSpaceDown(e) {
            e.preventDefault();
        },
        onTabDown(e) {
            const menu = this.$refs.menu;
            if (!menu)
                return;
            const activeTile = menu.activeTile;
            // An item that is selected by
            // menu-index should toggled
            if (!this.multiple &&
                activeTile &&
                this.isMenuActive) {
                e.preventDefault();
                e.stopPropagation();
                activeTile.click();
            }
            else {
                // If we make it here,
                // the user has no selected indexes
                // and is probably tabbing out
                this.blur(e);
            }
        },
        onUpDown(e) {
            const menu = this.$refs.menu;
            if (!menu)
                return;
            e.preventDefault();
            // Multiple selects do not cycle their value
            // when pressing up or down, instead activate
            // the menu
            if (this.multiple)
                return this.activateMenu();
            const keyCode = e.keyCode;
            // Cycle through available values to achieve
            // select native behavior
            menu.isBooted = true;
            window.requestAnimationFrame(() => {
                menu.getTiles();
                keyCodes.up === keyCode ? menu.prevTile() : menu.nextTile();
                menu.activeTile && menu.activeTile.click();
            });
        },
        selectItem(item) {
            if (!this.multiple) {
                this.setValue(this.returnObject ? item : this.getValue(item));
                this.isMenuActive = false;
            }
            else {
                const internalValue = (this.internalValue || []).slice();
                const i = this.findExistingIndex(item);
                i !== -1 ? internalValue.splice(i, 1) : internalValue.push(item);
                this.setValue(internalValue.map((i) => {
                    return this.returnObject ? i : this.getValue(i);
                }));
                // When selecting multiple
                // adjust menu after each
                // selection
                this.$nextTick(() => {
                    this.$refs.menu &&
                        this.$refs.menu.updateDimensions();
                });
                // We only need to reset list index for multiple
                // to keep highlight when an item is toggled
                // on and off
                if (!this.multiple)
                    return;
                const listIndex = this.getMenuIndex();
                this.setMenuIndex(-1);
                // There is no item to re-highlight
                // when selections are hidden
                if (this.hideSelected)
                    return;
                this.$nextTick(() => this.setMenuIndex(listIndex));
            }
        },
        setMenuIndex(index) {
            this.$refs.menu && (this.$refs.menu.listIndex = index);
        },
        setSelectedItems() {
            const selectedItems = [];
            const values = !this.multiple || !Array.isArray(this.internalValue)
                ? [this.internalValue]
                : this.internalValue;
            for (const value of values) {
                const index = this.allItems.findIndex(v => this.valueComparator(this.getValue(v), this.getValue(value)));
                if (index > -1) {
                    selectedItems.push(this.allItems[index]);
                }
            }
            this.selectedItems = selectedItems;
        },
        setValue(value) {
            const oldValue = this.internalValue;
            this.internalValue = value;
            value !== oldValue && this.$emit('change', value);
        },
        isAppendInner(target) {
            // return true if append inner is present
            // and the target is itself or inside
            const appendInner = this.$refs['append-inner'];
            return appendInner && (appendInner === target || appendInner.contains(target));
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNlbGVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZTZWxlY3QvVlNlbGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTywrQkFBK0IsQ0FBQTtBQUN0QyxPQUFPLGdCQUFnQixDQUFBO0FBRXZCLGFBQWE7QUFDYixPQUFPLEtBQUssTUFBTSxVQUFVLENBQUE7QUFDNUIsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sV0FBVyxNQUFNLGVBQWUsQ0FBQTtBQUV2QyxhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFBO0FBQzlCLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBRWpELFNBQVM7QUFDVCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUVoRCxhQUFhO0FBQ2IsT0FBTyxZQUFZLE1BQU0sZ0NBQWdDLENBQUE7QUFFekQsWUFBWTtBQUNaLE9BQU8sU0FBUyxNQUFNLHNCQUFzQixDQUFBO0FBQzVDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUN4RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFFakQsUUFBUTtBQUNSLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBSXRDLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHO0lBQzlCLFlBQVksRUFBRSxLQUFLO0lBQ25CLG1CQUFtQixFQUFFLEtBQUs7SUFDMUIsV0FBVyxFQUFFLElBQUk7SUFDakIsV0FBVyxFQUFFLEtBQUs7SUFDbEIsU0FBUyxFQUFFLEdBQUc7Q0FDZixDQUFBO0FBRUQsUUFBUTtBQUNSLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsVUFBVSxFQUNWLFVBQVUsRUFDVixVQUFVLENBQ1gsQ0FB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SSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FDckIsQ0FBQyxDQUFBO2dCQUVGLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUNkLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO2lCQUN6QzthQUNGO1lBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7UUFDcEMsQ0FBQztRQUNELFFBQVEsQ0FBRSxLQUFVO1lBQ2xCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUE7WUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUE7WUFDMUIsS0FBSyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUNuRCxDQUFDO1FBQ0QsYUFBYSxDQUFFLE1BQVc7WUFDeEIseUNBQXlDO1lBQ3pDLHFDQUFxQztZQUNyQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1lBRTlDLE9BQU8sV0FBVyxJQUFJLENBQUMsV0FBVyxLQUFLLE1BQU0sSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7UUFDaEYsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4uL1ZUZXh0RmllbGQvVlRleHRGaWVsZC5zYXNzJ1xuaW1wb3J0ICcuL1ZTZWxlY3Quc2FzcydcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZDaGlwIGZyb20gJy4uL1ZDaGlwJ1xuaW1wb3J0IFZNZW51IGZyb20gJy4uL1ZNZW51J1xuaW1wb3J0IFZTZWxlY3RMaXN0IGZyb20gJy4vVlNlbGVjdExpc3QnXG5cbi8vIEV4dGVuc2lvbnNcbmltcG9ydCBWSW5wdXQgZnJvbSAnLi4vVklucHV0J1xuaW1wb3J0IFZUZXh0RmllbGQgZnJvbSAnLi4vVlRleHRGaWVsZC9WVGV4dEZpZWxkJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBDb21wYXJhYmxlIGZyb20gJy4uLy4uL21peGlucy9jb21wYXJhYmxlJ1xuaW1wb3J0IEZpbHRlcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2ZpbHRlcmFibGUnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBDbGlja091dHNpZGUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9jbGljay1vdXRzaWRlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBtZXJnZURhdGEgZnJvbSAnLi4vLi4vdXRpbC9tZXJnZURhdGEnXG5pbXBvcnQgeyBnZXRQcm9wZXJ0eUZyb21JdGVtLCBnZXRPYmplY3RWYWx1ZUJ5UGF0aCwga2V5Q29kZXMgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgeyBjb25zb2xlRXJyb3IgfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5cbi8vIFR5cGVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgVk5vZGUsIFZOb2RlRGlyZWN0aXZlLCBQcm9wVHlwZSwgVk5vZGVEYXRhIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgU2VsZWN0SXRlbUtleSB9IGZyb20gJ3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdE1lbnVQcm9wcyA9IHtcbiAgY2xvc2VPbkNsaWNrOiBmYWxzZSxcbiAgY2xvc2VPbkNvbnRlbnRDbGljazogZmFsc2UsXG4gIGRpc2FibGVLZXlzOiB0cnVlLFxuICBvcGVuT25DbGljazogZmFsc2UsXG4gIG1heEhlaWdodDogMzA0LFxufVxuXG4vLyBUeXBlc1xuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgVlRleHRGaWVsZCxcbiAgQ29tcGFyYWJsZSxcbiAgRmlsdGVyYWJsZVxuKVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIEluc3RhbmNlVHlwZTx0eXBlb2YgYmFzZU1peGlucz4ge1xuICAkcmVmczoge1xuICAgIG1lbnU6IEluc3RhbmNlVHlwZTx0eXBlb2YgVk1lbnU+XG4gICAgbGFiZWw6IEhUTUxFbGVtZW50XG4gICAgaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnRcbiAgICAncHJlcGVuZC1pbm5lcic6IEhUTUxFbGVtZW50XG4gICAgJ2FwcGVuZC1pbm5lcic6IEhUTUxFbGVtZW50XG4gICAgcHJlZml4OiBIVE1MRWxlbWVudFxuICAgIHN1ZmZpeDogSFRNTEVsZW1lbnRcbiAgfVxufVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQ8b3B0aW9ucz4oKS5leHRlbmQoe1xuICBuYW1lOiAndi1zZWxlY3QnLFxuXG4gIGRpcmVjdGl2ZXM6IHtcbiAgICBDbGlja091dHNpZGUsXG4gIH0sXG5cbiAgcHJvcHM6IHtcbiAgICBhcHBlbmRJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJGRyb3Bkb3duJyxcbiAgICB9LFxuICAgIGF0dGFjaDoge1xuICAgICAgdHlwZTogbnVsbCBhcyB1bmtub3duIGFzIFByb3BUeXBlPHN0cmluZyB8IGJvb2xlYW4gfCBFbGVtZW50IHwgVk5vZGU+LFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBjYWNoZUl0ZW1zOiBCb29sZWFuLFxuICAgIGNoaXBzOiBCb29sZWFuLFxuICAgIGNsZWFyYWJsZTogQm9vbGVhbixcbiAgICBkZWxldGFibGVDaGlwczogQm9vbGVhbixcbiAgICBkaXNhYmxlTG9va3VwOiBCb29sZWFuLFxuICAgIGVhZ2VyOiBCb29sZWFuLFxuICAgIGhpZGVTZWxlY3RlZDogQm9vbGVhbixcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogQXJyYXksXG4gICAgICBkZWZhdWx0OiAoKSA9PiBbXSxcbiAgICB9LFxuICAgIGl0ZW1Db2xvcjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ3ByaW1hcnknLFxuICAgIH0sXG4gICAgaXRlbURpc2FibGVkOiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBBcnJheSwgRnVuY3Rpb25dIGFzIFByb3BUeXBlPFNlbGVjdEl0ZW1LZXk+LFxuICAgICAgZGVmYXVsdDogJ2Rpc2FibGVkJyxcbiAgICB9LFxuICAgIGl0ZW1UZXh0OiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBBcnJheSwgRnVuY3Rpb25dIGFzIFByb3BUeXBlPFNlbGVjdEl0ZW1LZXk+LFxuICAgICAgZGVmYXVsdDogJ3RleHQnLFxuICAgIH0sXG4gICAgaXRlbVZhbHVlOiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBBcnJheSwgRnVuY3Rpb25dIGFzIFByb3BUeXBlPFNlbGVjdEl0ZW1LZXk+LFxuICAgICAgZGVmYXVsdDogJ3ZhbHVlJyxcbiAgICB9LFxuICAgIG1lbnVQcm9wczoge1xuICAgICAgdHlwZTogW1N0cmluZywgQXJyYXksIE9iamVjdF0sXG4gICAgICBkZWZhdWx0OiAoKSA9PiBkZWZhdWx0TWVudVByb3BzLFxuICAgIH0sXG4gICAgbXVsdGlwbGU6IEJvb2xlYW4sXG4gICAgb3Blbk9uQ2xlYXI6IEJvb2xlYW4sXG4gICAgcmV0dXJuT2JqZWN0OiBCb29sZWFuLFxuICAgIHNtYWxsQ2hpcHM6IEJvb2xlYW4sXG4gIH0sXG5cbiAgZGF0YSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNhY2hlZEl0ZW1zOiB0aGlzLmNhY2hlSXRlbXMgPyB0aGlzLml0ZW1zIDogW10sXG4gICAgICBtZW51SXNCb290ZWQ6IGZhbHNlLFxuICAgICAgaXNNZW51QWN0aXZlOiBmYWxzZSxcbiAgICAgIGxhc3RJdGVtOiAyMCxcbiAgICAgIC8vIEFzIGxvbmcgYXMgYSB2YWx1ZSBpcyBkZWZpbmVkLCBzaG93IGl0XG4gICAgICAvLyBPdGhlcndpc2UsIGNoZWNrIGlmIG11bHRpcGxlXG4gICAgICAvLyB0byBkZXRlcm1pbmUgd2hpY2ggZGVmYXVsdCB0byBwcm92aWRlXG4gICAgICBsYXp5VmFsdWU6IHRoaXMudmFsdWUgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IHRoaXMudmFsdWVcbiAgICAgICAgOiB0aGlzLm11bHRpcGxlID8gW10gOiB1bmRlZmluZWQsXG4gICAgICBzZWxlY3RlZEluZGV4OiAtMSxcbiAgICAgIHNlbGVjdGVkSXRlbXM6IFtdIGFzIGFueVtdLFxuICAgICAga2V5Ym9hcmRMb29rdXBQcmVmaXg6ICcnLFxuICAgICAga2V5Ym9hcmRMb29rdXBMYXN0VGltZTogMCxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICAvKiBBbGwgaXRlbXMgdGhhdCB0aGUgc2VsZWN0IGhhcyAqL1xuICAgIGFsbEl0ZW1zICgpOiBvYmplY3RbXSB7XG4gICAgICByZXR1cm4gdGhpcy5maWx0ZXJEdXBsaWNhdGVzKHRoaXMuY2FjaGVkSXRlbXMuY29uY2F0KHRoaXMuaXRlbXMpKVxuICAgIH0sXG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLlZUZXh0RmllbGQub3B0aW9ucy5jb21wdXRlZC5jbGFzc2VzLmNhbGwodGhpcyksXG4gICAgICAgICd2LXNlbGVjdCc6IHRydWUsXG4gICAgICAgICd2LXNlbGVjdC0tY2hpcHMnOiB0aGlzLmhhc0NoaXBzLFxuICAgICAgICAndi1zZWxlY3QtLWNoaXBzLS1zbWFsbCc6IHRoaXMuc21hbGxDaGlwcyxcbiAgICAgICAgJ3Ytc2VsZWN0LS1pcy1tZW51LWFjdGl2ZSc6IHRoaXMuaXNNZW51QWN0aXZlLFxuICAgICAgICAndi1zZWxlY3QtLWlzLW11bHRpJzogdGhpcy5tdWx0aXBsZSxcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qIFVzZWQgYnkgb3RoZXIgY29tcG9uZW50cyB0byBvdmVyd3JpdGUgKi9cbiAgICBjb21wdXRlZEl0ZW1zICgpOiBvYmplY3RbXSB7XG4gICAgICByZXR1cm4gdGhpcy5hbGxJdGVtc1xuICAgIH0sXG4gICAgY29tcHV0ZWRPd25zICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIGBsaXN0LSR7dGhpcy5fdWlkfWBcbiAgICB9LFxuICAgIGNvbXB1dGVkQ291bnRlclZhbHVlICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbGVcbiAgICAgICAgPyB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoXG4gICAgICAgIDogKHRoaXMuZ2V0VGV4dCh0aGlzLnNlbGVjdGVkSXRlbXNbMF0pIHx8ICcnKS50b1N0cmluZygpLmxlbmd0aFxuICAgIH0sXG4gICAgZGlyZWN0aXZlcyAoKTogVk5vZGVEaXJlY3RpdmVbXSB8IHVuZGVmaW5lZCB7XG4gICAgICByZXR1cm4gdGhpcy5pc0ZvY3VzZWQgPyBbe1xuICAgICAgICBuYW1lOiAnY2xpY2stb3V0c2lkZScsXG4gICAgICAgIHZhbHVlOiB0aGlzLmJsdXIsXG4gICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICBjbG9zZUNvbmRpdGlvbmFsOiB0aGlzLmNsb3NlQ29uZGl0aW9uYWwsXG4gICAgICAgIH0sXG4gICAgICB9IGFzIFZOb2RlRGlyZWN0aXZlXSA6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgZHluYW1pY0hlaWdodCAoKSB7XG4gICAgICByZXR1cm4gJ2F1dG8nXG4gICAgfSxcbiAgICBoYXNDaGlwcyAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5jaGlwcyB8fCB0aGlzLnNtYWxsQ2hpcHNcbiAgICB9LFxuICAgIGhhc1Nsb3QgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIEJvb2xlYW4odGhpcy5oYXNDaGlwcyB8fCB0aGlzLiRzY29wZWRTbG90cy5zZWxlY3Rpb24pXG4gICAgfSxcbiAgICBpc0RpcnR5ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoID4gMFxuICAgIH0sXG4gICAgbGlzdERhdGEgKCk6IG9iamVjdCB7XG4gICAgICBjb25zdCBzY29wZUlkID0gdGhpcy4kdm5vZGUgJiYgKHRoaXMuJHZub2RlLmNvbnRleHQhLiRvcHRpb25zIGFzIHsgW2tleTogc3RyaW5nXTogYW55IH0pLl9zY29wZUlkXG4gICAgICBjb25zdCBhdHRycyA9IHNjb3BlSWQgPyB7XG4gICAgICAgIFtzY29wZUlkXTogdHJ1ZSxcbiAgICAgIH0gOiB7fVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIC4uLmF0dHJzLFxuICAgICAgICAgIGlkOiB0aGlzLmNvbXB1dGVkT3ducyxcbiAgICAgICAgfSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBhY3Rpb246IHRoaXMubXVsdGlwbGUsXG4gICAgICAgICAgY29sb3I6IHRoaXMuaXRlbUNvbG9yLFxuICAgICAgICAgIGRlbnNlOiB0aGlzLmRlbnNlLFxuICAgICAgICAgIGhpZGVTZWxlY3RlZDogdGhpcy5oaWRlU2VsZWN0ZWQsXG4gICAgICAgICAgaXRlbXM6IHRoaXMudmlydHVhbGl6ZWRJdGVtcyxcbiAgICAgICAgICBpdGVtRGlzYWJsZWQ6IHRoaXMuaXRlbURpc2FibGVkLFxuICAgICAgICAgIGl0ZW1UZXh0OiB0aGlzLml0ZW1UZXh0LFxuICAgICAgICAgIGl0ZW1WYWx1ZTogdGhpcy5pdGVtVmFsdWUsXG4gICAgICAgICAgbm9EYXRhVGV4dDogdGhpcy4kdnVldGlmeS5sYW5nLnQodGhpcy5ub0RhdGFUZXh0KSxcbiAgICAgICAgICBzZWxlY3RlZEl0ZW1zOiB0aGlzLnNlbGVjdGVkSXRlbXMsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgc2VsZWN0OiB0aGlzLnNlbGVjdEl0ZW0sXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3BlZFNsb3RzOiB7XG4gICAgICAgICAgaXRlbTogdGhpcy4kc2NvcGVkU2xvdHMuaXRlbSxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXRpY0xpc3QgKCk6IFZOb2RlIHtcbiAgICAgIGlmICh0aGlzLiRzbG90c1snbm8tZGF0YSddIHx8IHRoaXMuJHNsb3RzWydwcmVwZW5kLWl0ZW0nXSB8fCB0aGlzLiRzbG90c1snYXBwZW5kLWl0ZW0nXSkge1xuICAgICAgICBjb25zb2xlRXJyb3IoJ2Fzc2VydDogc3RhdGljTGlzdCBzaG91bGQgbm90IGJlIGNhbGxlZCBpZiBzbG90cyBhcmUgdXNlZCcpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZTZWxlY3RMaXN0LCB0aGlzLmxpc3REYXRhKVxuICAgIH0sXG4gICAgdmlydHVhbGl6ZWRJdGVtcyAoKTogb2JqZWN0W10ge1xuICAgICAgcmV0dXJuICh0aGlzLiRfbWVudVByb3BzIGFzIGFueSkuYXV0b1xuICAgICAgICA/IHRoaXMuY29tcHV0ZWRJdGVtc1xuICAgICAgICA6IHRoaXMuY29tcHV0ZWRJdGVtcy5zbGljZSgwLCB0aGlzLmxhc3RJdGVtKVxuICAgIH0sXG4gICAgbWVudUNhblNob3c6ICgpID0+IHRydWUsXG4gICAgJF9tZW51UHJvcHMgKCk6IG9iamVjdCB7XG4gICAgICBsZXQgbm9ybWFsaXNlZFByb3BzID0gdHlwZW9mIHRoaXMubWVudVByb3BzID09PSAnc3RyaW5nJ1xuICAgICAgICA/IHRoaXMubWVudVByb3BzLnNwbGl0KCcsJylcbiAgICAgICAgOiB0aGlzLm1lbnVQcm9wc1xuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShub3JtYWxpc2VkUHJvcHMpKSB7XG4gICAgICAgIG5vcm1hbGlzZWRQcm9wcyA9IG5vcm1hbGlzZWRQcm9wcy5yZWR1Y2UoKGFjYywgcCkgPT4ge1xuICAgICAgICAgIGFjY1twLnRyaW0oKV0gPSB0cnVlXG4gICAgICAgICAgcmV0dXJuIGFjY1xuICAgICAgICB9LCB7fSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZGVmYXVsdE1lbnVQcm9wcyxcbiAgICAgICAgZWFnZXI6IHRoaXMuZWFnZXIsXG4gICAgICAgIHZhbHVlOiB0aGlzLm1lbnVDYW5TaG93ICYmIHRoaXMuaXNNZW51QWN0aXZlLFxuICAgICAgICBudWRnZUJvdHRvbTogbm9ybWFsaXNlZFByb3BzLm9mZnNldFkgPyAxIDogMCwgLy8gY29udmVydCB0byBpbnRcbiAgICAgICAgLi4ubm9ybWFsaXNlZFByb3BzLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBpbnRlcm5hbFZhbHVlICh2YWwpIHtcbiAgICAgIHRoaXMuaW5pdGlhbFZhbHVlID0gdmFsXG4gICAgICB0aGlzLnNldFNlbGVjdGVkSXRlbXMoKVxuICAgIH0sXG4gICAgbWVudUlzQm9vdGVkICgpIHtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q29udGVudCgpICYmIHRoaXMuZ2V0Q29udGVudCgpLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICB0aGlzLmdldENvbnRlbnQoKS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLm9uU2Nyb2xsLCBmYWxzZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICAgIGlzTWVudUFjdGl2ZSAodmFsKSB7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB0aGlzLm9uTWVudUFjdGl2ZUNoYW5nZSh2YWwpKVxuXG4gICAgICBpZiAoIXZhbCkgcmV0dXJuXG5cbiAgICAgIHRoaXMubWVudUlzQm9vdGVkID0gdHJ1ZVxuICAgIH0sXG4gICAgaXRlbXM6IHtcbiAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgIGhhbmRsZXIgKHZhbCkge1xuICAgICAgICBpZiAodGhpcy5jYWNoZUl0ZW1zKSB7XG4gICAgICAgICAgLy8gQnJlYWtzIHZ1ZS10ZXN0LXV0aWxzIGlmXG4gICAgICAgICAgLy8gdGhpcyBpc24ndCBjYWxjdWxhdGVkXG4gICAgICAgICAgLy8gb24gdGhlIG5leHQgdGlja1xuICAgICAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkSXRlbXMgPSB0aGlzLmZpbHRlckR1cGxpY2F0ZXModGhpcy5jYWNoZWRJdGVtcy5jb25jYXQodmFsKSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZEl0ZW1zKClcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgLyoqIEBwdWJsaWMgKi9cbiAgICBibHVyIChlPzogRXZlbnQpIHtcbiAgICAgIFZUZXh0RmllbGQub3B0aW9ucy5tZXRob2RzLmJsdXIuY2FsbCh0aGlzLCBlKVxuICAgICAgdGhpcy5pc01lbnVBY3RpdmUgPSBmYWxzZVxuICAgICAgdGhpcy5pc0ZvY3VzZWQgPSBmYWxzZVxuICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gLTFcbiAgICB9LFxuICAgIC8qKiBAcHVibGljICovXG4gICAgYWN0aXZhdGVNZW51ICgpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5kaXNhYmxlZCB8fFxuICAgICAgICB0aGlzLnJlYWRvbmx5IHx8XG4gICAgICAgIHRoaXMuaXNNZW51QWN0aXZlXG4gICAgICApIHJldHVyblxuXG4gICAgICB0aGlzLmlzTWVudUFjdGl2ZSA9IHRydWVcbiAgICB9LFxuICAgIGNsZWFyYWJsZUNhbGxiYWNrICgpIHtcbiAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5tdWx0aXBsZSA/IFtdIDogdW5kZWZpbmVkKVxuICAgICAgdGhpcy5zZXRNZW51SW5kZXgoLTEpXG4gICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB0aGlzLiRyZWZzLmlucHV0ICYmIHRoaXMuJHJlZnMuaW5wdXQuZm9jdXMoKSlcblxuICAgICAgaWYgKHRoaXMub3Blbk9uQ2xlYXIpIHRoaXMuaXNNZW51QWN0aXZlID0gdHJ1ZVxuICAgIH0sXG4gICAgY2xvc2VDb25kaXRpb25hbCAoZTogRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc01lbnVBY3RpdmUpIHJldHVybiB0cnVlXG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgICF0aGlzLl9pc0Rlc3Ryb3llZCAmJlxuXG4gICAgICAgIC8vIENsaWNrIG9yaWdpbmF0ZXMgZnJvbSBvdXRzaWRlIHRoZSBtZW51IGNvbnRlbnRcbiAgICAgICAgLy8gTXVsdGlwbGUgc2VsZWN0cyBkb24ndCBjbG9zZSB3aGVuIGFuIGl0ZW0gaXMgY2xpY2tlZFxuICAgICAgICAoIXRoaXMuZ2V0Q29udGVudCgpIHx8XG4gICAgICAgICF0aGlzLmdldENvbnRlbnQoKS5jb250YWlucyhlLnRhcmdldCBhcyBOb2RlKSkgJiZcblxuICAgICAgICAvLyBDbGljayBvcmlnaW5hdGVzIGZyb20gb3V0c2lkZSB0aGUgZWxlbWVudFxuICAgICAgICB0aGlzLiRlbCAmJlxuICAgICAgICAhdGhpcy4kZWwuY29udGFpbnMoZS50YXJnZXQgYXMgTm9kZSkgJiZcbiAgICAgICAgZS50YXJnZXQgIT09IHRoaXMuJGVsXG4gICAgICApXG4gICAgfSxcbiAgICBmaWx0ZXJEdXBsaWNhdGVzIChhcnI6IGFueVtdKSB7XG4gICAgICBjb25zdCB1bmlxdWVWYWx1ZXMgPSBuZXcgTWFwKClcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhcnIubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBhcnJbaW5kZXhdXG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMuZ2V0VmFsdWUoaXRlbSlcblxuICAgICAgICAvLyBUT0RPOiBjb21wYXJhdG9yXG4gICAgICAgICF1bmlxdWVWYWx1ZXMuaGFzKHZhbCkgJiYgdW5pcXVlVmFsdWVzLnNldCh2YWwsIGl0ZW0pXG4gICAgICB9XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh1bmlxdWVWYWx1ZXMudmFsdWVzKCkpXG4gICAgfSxcbiAgICBmaW5kRXhpc3RpbmdJbmRleCAoaXRlbTogb2JqZWN0KSB7XG4gICAgICBjb25zdCBpdGVtVmFsdWUgPSB0aGlzLmdldFZhbHVlKGl0ZW0pXG5cbiAgICAgIHJldHVybiAodGhpcy5pbnRlcm5hbFZhbHVlIHx8IFtdKS5maW5kSW5kZXgoKGk6IG9iamVjdCkgPT4gdGhpcy52YWx1ZUNvbXBhcmF0b3IodGhpcy5nZXRWYWx1ZShpKSwgaXRlbVZhbHVlKSlcbiAgICB9LFxuICAgIGdldENvbnRlbnQgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJHJlZnMubWVudSAmJiB0aGlzLiRyZWZzLm1lbnUuJHJlZnMuY29udGVudFxuICAgIH0sXG4gICAgZ2VuQ2hpcFNlbGVjdGlvbiAoaXRlbTogb2JqZWN0LCBpbmRleDogbnVtYmVyKSB7XG4gICAgICBjb25zdCBpc0Rpc2FibGVkID0gKFxuICAgICAgICB0aGlzLmRpc2FibGVkIHx8XG4gICAgICAgIHRoaXMucmVhZG9ubHkgfHxcbiAgICAgICAgdGhpcy5nZXREaXNhYmxlZChpdGVtKVxuICAgICAgKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWQ2hpcCwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2hpcC0tc2VsZWN0JyxcbiAgICAgICAgYXR0cnM6IHsgdGFiaW5kZXg6IC0xIH0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgY2xvc2U6IHRoaXMuZGVsZXRhYmxlQ2hpcHMgJiYgIWlzRGlzYWJsZWQsXG4gICAgICAgICAgZGlzYWJsZWQ6IGlzRGlzYWJsZWQsXG4gICAgICAgICAgaW5wdXRWYWx1ZTogaW5kZXggPT09IHRoaXMuc2VsZWN0ZWRJbmRleCxcbiAgICAgICAgICBzbWFsbDogdGhpcy5zbWFsbENoaXBzLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzRGlzYWJsZWQpIHJldHVyblxuXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IGluZGV4XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnY2xpY2s6Y2xvc2UnOiAoKSA9PiB0aGlzLm9uQ2hpcElucHV0KGl0ZW0pLFxuICAgICAgICB9LFxuICAgICAgICBrZXk6IEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0VmFsdWUoaXRlbSkpLFxuICAgICAgfSwgdGhpcy5nZXRUZXh0KGl0ZW0pKVxuICAgIH0sXG4gICAgZ2VuQ29tbWFTZWxlY3Rpb24gKGl0ZW06IG9iamVjdCwgaW5kZXg6IG51bWJlciwgbGFzdDogYm9vbGVhbikge1xuICAgICAgY29uc3QgY29sb3IgPSBpbmRleCA9PT0gdGhpcy5zZWxlY3RlZEluZGV4ICYmIHRoaXMuY29tcHV0ZWRDb2xvclxuICAgICAgY29uc3QgaXNEaXNhYmxlZCA9IChcbiAgICAgICAgdGhpcy5kaXNhYmxlZCB8fFxuICAgICAgICB0aGlzLmdldERpc2FibGVkKGl0ZW0pXG4gICAgICApXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldFRleHRDb2xvcihjb2xvciwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2VsZWN0X19zZWxlY3Rpb24gdi1zZWxlY3RfX3NlbGVjdGlvbi0tY29tbWEnLFxuICAgICAgICBjbGFzczoge1xuICAgICAgICAgICd2LXNlbGVjdF9fc2VsZWN0aW9uLS1kaXNhYmxlZCc6IGlzRGlzYWJsZWQsXG4gICAgICAgIH0sXG4gICAgICAgIGtleTogSlNPTi5zdHJpbmdpZnkodGhpcy5nZXRWYWx1ZShpdGVtKSksXG4gICAgICB9KSwgYCR7dGhpcy5nZXRUZXh0KGl0ZW0pfSR7bGFzdCA/ICcnIDogJywgJ31gKVxuICAgIH0sXG4gICAgZ2VuRGVmYXVsdFNsb3QgKCk6IChWTm9kZSB8IFZOb2RlW10gfCBudWxsKVtdIHtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbnMgPSB0aGlzLmdlblNlbGVjdGlvbnMoKVxuICAgICAgY29uc3QgaW5wdXQgPSB0aGlzLmdlbklucHV0KClcblxuICAgICAgLy8gSWYgdGhlIHJldHVybiBpcyBhbiBlbXB0eSBhcnJheVxuICAgICAgLy8gcHVzaCB0aGUgaW5wdXRcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdGlvbnMpKSB7XG4gICAgICAgIHNlbGVjdGlvbnMucHVzaChpbnB1dClcbiAgICAgIC8vIE90aGVyd2lzZSBwdXNoIGl0IGludG8gY2hpbGRyZW5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdGlvbnMuY2hpbGRyZW4gPSBzZWxlY3Rpb25zLmNoaWxkcmVuIHx8IFtdXG4gICAgICAgIHNlbGVjdGlvbnMuY2hpbGRyZW4ucHVzaChpbnB1dClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgdGhpcy5nZW5GaWVsZHNldCgpLFxuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNlbGVjdF9fc2xvdCcsXG4gICAgICAgICAgZGlyZWN0aXZlczogdGhpcy5kaXJlY3RpdmVzLFxuICAgICAgICB9LCBbXG4gICAgICAgICAgdGhpcy5nZW5MYWJlbCgpLFxuICAgICAgICAgIHRoaXMucHJlZml4ID8gdGhpcy5nZW5BZmZpeCgncHJlZml4JykgOiBudWxsLFxuICAgICAgICAgIHNlbGVjdGlvbnMsXG4gICAgICAgICAgdGhpcy5zdWZmaXggPyB0aGlzLmdlbkFmZml4KCdzdWZmaXgnKSA6IG51bGwsXG4gICAgICAgICAgdGhpcy5nZW5DbGVhckljb24oKSxcbiAgICAgICAgICB0aGlzLmdlbkljb25TbG90KCksXG4gICAgICAgICAgdGhpcy5nZW5IaWRkZW5JbnB1dCgpLFxuICAgICAgICBdKSxcbiAgICAgICAgdGhpcy5nZW5NZW51KCksXG4gICAgICAgIHRoaXMuZ2VuUHJvZ3Jlc3MoKSxcbiAgICAgIF1cbiAgICB9LFxuICAgIGdlbkljb24gKFxuICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgY2I/OiAoZTogRXZlbnQpID0+IHZvaWQsXG4gICAgICBleHRyYURhdGE/OiBWTm9kZURhdGFcbiAgICApIHtcbiAgICAgIGNvbnN0IGljb24gPSBWSW5wdXQub3B0aW9ucy5tZXRob2RzLmdlbkljb24uY2FsbCh0aGlzLCB0eXBlLCBjYiwgZXh0cmFEYXRhKVxuXG4gICAgICBpZiAodHlwZSA9PT0gJ2FwcGVuZCcpIHtcbiAgICAgICAgLy8gRG9uJ3QgYWxsb3cgdGhlIGRyb3Bkb3duIGljb24gdG8gYmUgZm9jdXNlZFxuICAgICAgICBpY29uLmNoaWxkcmVuIVswXS5kYXRhID0gbWVyZ2VEYXRhKGljb24uY2hpbGRyZW4hWzBdLmRhdGEhLCB7XG4gICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgIHRhYmluZGV4OiBpY29uLmNoaWxkcmVuIVswXS5jb21wb25lbnRPcHRpb25zIS5saXN0ZW5lcnMgJiYgJy0xJyxcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJyxcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogdW5kZWZpbmVkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpY29uXG4gICAgfSxcbiAgICBnZW5JbnB1dCAoKTogVk5vZGUge1xuICAgICAgY29uc3QgaW5wdXQgPSBWVGV4dEZpZWxkLm9wdGlvbnMubWV0aG9kcy5nZW5JbnB1dC5jYWxsKHRoaXMpXG5cbiAgICAgIGRlbGV0ZSBpbnB1dC5kYXRhIS5hdHRycyEubmFtZVxuXG4gICAgICBpbnB1dC5kYXRhID0gbWVyZ2VEYXRhKGlucHV0LmRhdGEhLCB7XG4gICAgICAgIGRvbVByb3BzOiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgcmVhZG9ubHk6IHRydWUsXG4gICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICdhcmlhLXJlYWRvbmx5JzogU3RyaW5nKHRoaXMucmVhZG9ubHkpLFxuICAgICAgICAgICdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnOiBnZXRPYmplY3RWYWx1ZUJ5UGF0aCh0aGlzLiRyZWZzLm1lbnUsICdhY3RpdmVUaWxlLmlkJyksXG4gICAgICAgICAgYXV0b2NvbXBsZXRlOiBnZXRPYmplY3RWYWx1ZUJ5UGF0aChpbnB1dC5kYXRhISwgJ2F0dHJzLmF1dG9jb21wbGV0ZScsICdvZmYnKSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHsga2V5cHJlc3M6IHRoaXMub25LZXlQcmVzcyB9LFxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIGlucHV0XG4gICAgfSxcbiAgICBnZW5IaWRkZW5JbnB1dCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuICAgICAgICBkb21Qcm9wczogeyB2YWx1ZTogdGhpcy5sYXp5VmFsdWUgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICB0eXBlOiAnaGlkZGVuJyxcbiAgICAgICAgICBuYW1lOiB0aGlzLmF0dHJzJC5uYW1lLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlbklucHV0U2xvdCAoKTogVk5vZGUge1xuICAgICAgY29uc3QgcmVuZGVyID0gVlRleHRGaWVsZC5vcHRpb25zLm1ldGhvZHMuZ2VuSW5wdXRTbG90LmNhbGwodGhpcylcblxuICAgICAgcmVuZGVyLmRhdGEhLmF0dHJzID0ge1xuICAgICAgICAuLi5yZW5kZXIuZGF0YSEuYXR0cnMsXG4gICAgICAgIHJvbGU6ICdidXR0b24nLFxuICAgICAgICAnYXJpYS1oYXNwb3B1cCc6ICdsaXN0Ym94JyxcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBTdHJpbmcodGhpcy5pc01lbnVBY3RpdmUpLFxuICAgICAgICAnYXJpYS1vd25zJzogdGhpcy5jb21wdXRlZE93bnMsXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZW5kZXJcbiAgICB9LFxuICAgIGdlbkxpc3QgKCk6IFZOb2RlIHtcbiAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gc2xvdHMsIHdlIGNhbiB1c2UgYSBjYWNoZWQgVk5vZGUgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZVxuICAgICAgaWYgKHRoaXMuJHNsb3RzWyduby1kYXRhJ10gfHwgdGhpcy4kc2xvdHNbJ3ByZXBlbmQtaXRlbSddIHx8IHRoaXMuJHNsb3RzWydhcHBlbmQtaXRlbSddKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlbkxpc3RXaXRoU2xvdCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0aWNMaXN0XG4gICAgICB9XG4gICAgfSxcbiAgICBnZW5MaXN0V2l0aFNsb3QgKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IHNsb3RzID0gWydwcmVwZW5kLWl0ZW0nLCAnbm8tZGF0YScsICdhcHBlbmQtaXRlbSddXG4gICAgICAgIC5maWx0ZXIoc2xvdE5hbWUgPT4gdGhpcy4kc2xvdHNbc2xvdE5hbWVdKVxuICAgICAgICAubWFwKHNsb3ROYW1lID0+IHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJywge1xuICAgICAgICAgIHNsb3Q6IHNsb3ROYW1lLFxuICAgICAgICB9LCB0aGlzLiRzbG90c1tzbG90TmFtZV0pKVxuICAgICAgLy8gUmVxdWlyZXMgZGVzdHJ1Y3R1cmluZyBkdWUgdG8gVnVlXG4gICAgICAvLyBtb2RpZnlpbmcgdGhlIGBvbmAgcHJvcGVydHkgd2hlbiBwYXNzZWRcbiAgICAgIC8vIGFzIGEgcmVmZXJlbmNlZCBvYmplY3RcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZTZWxlY3RMaXN0LCB7XG4gICAgICAgIC4uLnRoaXMubGlzdERhdGEsXG4gICAgICB9LCBzbG90cylcbiAgICB9LFxuICAgIGdlbk1lbnUgKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IHByb3BzID0gdGhpcy4kX21lbnVQcm9wcyBhcyBhbnlcbiAgICAgIHByb3BzLmFjdGl2YXRvciA9IHRoaXMuJHJlZnNbJ2lucHV0LXNsb3QnXVxuXG4gICAgICAvLyBBdHRhY2ggdG8gcm9vdCBlbCBzbyB0aGF0XG4gICAgICAvLyBtZW51IGNvdmVycyBwcmVwZW5kL2FwcGVuZCBpY29uc1xuICAgICAgaWYgKFxuICAgICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgYSBjb21wdXRlZCBwcm9wZXJ0eSBvciBoZWxwZXIgb3Igc29tZXRoaW5nXG4gICAgICAgIHRoaXMuYXR0YWNoID09PSAnJyB8fCAvLyBJZiB1c2VkIGFzIGEgYm9vbGVhbiBwcm9wICg8di1tZW51IGF0dGFjaD4pXG4gICAgICAgIHRoaXMuYXR0YWNoID09PSB0cnVlIHx8IC8vIElmIGJvdW5kIHRvIGEgYm9vbGVhbiAoPHYtbWVudSA6YXR0YWNoPVwidHJ1ZVwiPilcbiAgICAgICAgdGhpcy5hdHRhY2ggPT09ICdhdHRhY2gnIC8vIElmIGJvdW5kIGFzIGJvb2xlYW4gcHJvcCBpbiBwdWcgKHYtbWVudShhdHRhY2gpKVxuICAgICAgKSB7XG4gICAgICAgIHByb3BzLmF0dGFjaCA9IHRoaXMuJGVsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wcy5hdHRhY2ggPSB0aGlzLmF0dGFjaFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWTWVudSwge1xuICAgICAgICBhdHRyczogeyByb2xlOiB1bmRlZmluZWQsIG9mZnNldFk6IHRydWUgfSxcbiAgICAgICAgcHJvcHMsXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgaW5wdXQ6ICh2YWw6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXNNZW51QWN0aXZlID0gdmFsXG4gICAgICAgICAgICB0aGlzLmlzRm9jdXNlZCA9IHZhbFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHJlZjogJ21lbnUnLFxuICAgICAgfSwgW3RoaXMuZ2VuTGlzdCgpXSlcbiAgICB9LFxuICAgIGdlblNlbGVjdGlvbnMgKCk6IFZOb2RlIHtcbiAgICAgIGxldCBsZW5ndGggPSB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IG5ldyBBcnJheShsZW5ndGgpXG5cbiAgICAgIGxldCBnZW5TZWxlY3Rpb25cbiAgICAgIGlmICh0aGlzLiRzY29wZWRTbG90cy5zZWxlY3Rpb24pIHtcbiAgICAgICAgZ2VuU2VsZWN0aW9uID0gdGhpcy5nZW5TbG90U2VsZWN0aW9uXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ2hpcHMpIHtcbiAgICAgICAgZ2VuU2VsZWN0aW9uID0gdGhpcy5nZW5DaGlwU2VsZWN0aW9uXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZW5TZWxlY3Rpb24gPSB0aGlzLmdlbkNvbW1hU2VsZWN0aW9uXG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBjaGlsZHJlbltsZW5ndGhdID0gZ2VuU2VsZWN0aW9uKFxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtc1tsZW5ndGhdLFxuICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgICBsZW5ndGggPT09IGNoaWxkcmVuLmxlbmd0aCAtIDFcbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2VsZWN0X19zZWxlY3Rpb25zJyxcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuU2xvdFNlbGVjdGlvbiAoaXRlbTogb2JqZWN0LCBpbmRleDogbnVtYmVyKTogVk5vZGVbXSB8IHVuZGVmaW5lZCB7XG4gICAgICByZXR1cm4gdGhpcy4kc2NvcGVkU2xvdHMuc2VsZWN0aW9uISh7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgY2xhc3M6ICd2LWNoaXAtLXNlbGVjdCcsXG4gICAgICAgIH0sXG4gICAgICAgIHBhcmVudDogdGhpcyxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIHNlbGVjdDogKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IGluZGV4XG4gICAgICAgIH0sXG4gICAgICAgIHNlbGVjdGVkOiBpbmRleCA9PT0gdGhpcy5zZWxlY3RlZEluZGV4LFxuICAgICAgICBkaXNhYmxlZDogdGhpcy5kaXNhYmxlZCB8fCB0aGlzLnJlYWRvbmx5LFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdldE1lbnVJbmRleCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kcmVmcy5tZW51ID8gKHRoaXMuJHJlZnMubWVudSBhcyB7IFtrZXk6IHN0cmluZ106IGFueSB9KS5saXN0SW5kZXggOiAtMVxuICAgIH0sXG4gICAgZ2V0RGlzYWJsZWQgKGl0ZW06IG9iamVjdCkge1xuICAgICAgcmV0dXJuIGdldFByb3BlcnR5RnJvbUl0ZW0oaXRlbSwgdGhpcy5pdGVtRGlzYWJsZWQsIGZhbHNlKVxuICAgIH0sXG4gICAgZ2V0VGV4dCAoaXRlbTogb2JqZWN0KSB7XG4gICAgICByZXR1cm4gZ2V0UHJvcGVydHlGcm9tSXRlbShpdGVtLCB0aGlzLml0ZW1UZXh0LCBpdGVtKVxuICAgIH0sXG4gICAgZ2V0VmFsdWUgKGl0ZW06IG9iamVjdCkge1xuICAgICAgcmV0dXJuIGdldFByb3BlcnR5RnJvbUl0ZW0oaXRlbSwgdGhpcy5pdGVtVmFsdWUsIHRoaXMuZ2V0VGV4dChpdGVtKSlcbiAgICB9LFxuICAgIG9uQmx1ciAoZT86IEV2ZW50KSB7XG4gICAgICBlICYmIHRoaXMuJGVtaXQoJ2JsdXInLCBlKVxuICAgIH0sXG4gICAgb25DaGlwSW5wdXQgKGl0ZW06IG9iamVjdCkge1xuICAgICAgaWYgKHRoaXMubXVsdGlwbGUpIHRoaXMuc2VsZWN0SXRlbShpdGVtKVxuICAgICAgZWxzZSB0aGlzLnNldFZhbHVlKG51bGwpXG4gICAgICAvLyBJZiBhbGwgaXRlbXMgaGF2ZSBiZWVuIGRlbGV0ZWQsXG4gICAgICAvLyBvcGVuIGB2LW1lbnVgXG4gICAgICBpZiAodGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLmlzTWVudUFjdGl2ZSA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaXNNZW51QWN0aXZlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IC0xXG4gICAgfSxcbiAgICBvbkNsaWNrIChlOiBNb3VzZUV2ZW50KSB7XG4gICAgICBpZiAodGhpcy5pc0Rpc2FibGVkKSByZXR1cm5cblxuICAgICAgaWYgKCF0aGlzLmlzQXBwZW5kSW5uZXIoZS50YXJnZXQpKSB7XG4gICAgICAgIHRoaXMuaXNNZW51QWN0aXZlID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaXNGb2N1c2VkKSB7XG4gICAgICAgIHRoaXMuaXNGb2N1c2VkID0gdHJ1ZVxuICAgICAgICB0aGlzLiRlbWl0KCdmb2N1cycpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgZSlcbiAgICB9LFxuICAgIG9uRXNjRG93biAoZTogRXZlbnQpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgaWYgKHRoaXMuaXNNZW51QWN0aXZlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgdGhpcy5pc01lbnVBY3RpdmUgPSBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgb25LZXlQcmVzcyAoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLm11bHRpcGxlIHx8XG4gICAgICAgIHRoaXMucmVhZG9ubHkgfHxcbiAgICAgICAgdGhpcy5kaXNhYmxlTG9va3VwXG4gICAgICApIHJldHVyblxuXG4gICAgICBjb25zdCBLRVlCT0FSRF9MT09LVVBfVEhSRVNIT0xEID0gMTAwMCAvLyBtaWxsaXNlY29uZHNcbiAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpXG4gICAgICBpZiAobm93IC0gdGhpcy5rZXlib2FyZExvb2t1cExhc3RUaW1lID4gS0VZQk9BUkRfTE9PS1VQX1RIUkVTSE9MRCkge1xuICAgICAgICB0aGlzLmtleWJvYXJkTG9va3VwUHJlZml4ID0gJydcbiAgICAgIH1cbiAgICAgIHRoaXMua2V5Ym9hcmRMb29rdXBQcmVmaXggKz0gZS5rZXkudG9Mb3dlckNhc2UoKVxuICAgICAgdGhpcy5rZXlib2FyZExvb2t1cExhc3RUaW1lID0gbm93XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5hbGxJdGVtcy5maW5kSW5kZXgoaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSAodGhpcy5nZXRUZXh0KGl0ZW0pIHx8ICcnKS50b1N0cmluZygpXG5cbiAgICAgICAgcmV0dXJuIHRleHQudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKHRoaXMua2V5Ym9hcmRMb29rdXBQcmVmaXgpXG4gICAgICB9KVxuICAgICAgY29uc3QgaXRlbSA9IHRoaXMuYWxsSXRlbXNbaW5kZXhdXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMubGFzdEl0ZW0gPSBNYXRoLm1heCh0aGlzLmxhc3RJdGVtLCBpbmRleCArIDUpXG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5yZXR1cm5PYmplY3QgPyBpdGVtIDogdGhpcy5nZXRWYWx1ZShpdGVtKSlcbiAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gdGhpcy4kcmVmcy5tZW51LmdldFRpbGVzKCkpXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zZXRNZW51SW5kZXgoaW5kZXgpKVxuICAgICAgfVxuICAgIH0sXG4gICAgb25LZXlEb3duIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICBpZiAodGhpcy5yZWFkb25seSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IGtleUNvZGUgPSBlLmtleUNvZGVcbiAgICAgIGNvbnN0IG1lbnUgPSB0aGlzLiRyZWZzLm1lbnVcblxuICAgICAgLy8gSWYgZW50ZXIsIHNwYWNlLCBvcGVuIG1lbnVcbiAgICAgIGlmIChbXG4gICAgICAgIGtleUNvZGVzLmVudGVyLFxuICAgICAgICBrZXlDb2Rlcy5zcGFjZSxcbiAgICAgIF0uaW5jbHVkZXMoa2V5Q29kZSkpIHRoaXMuYWN0aXZhdGVNZW51KClcblxuICAgICAgdGhpcy4kZW1pdCgna2V5ZG93bicsIGUpXG5cbiAgICAgIGlmICghbWVudSkgcmV0dXJuXG5cbiAgICAgIC8vIElmIG1lbnUgaXMgYWN0aXZlLCBhbGxvdyBkZWZhdWx0XG4gICAgICAvLyBsaXN0SW5kZXggY2hhbmdlIGZyb20gbWVudVxuICAgICAgaWYgKHRoaXMuaXNNZW51QWN0aXZlICYmIGtleUNvZGUgIT09IGtleUNvZGVzLnRhYikge1xuICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgbWVudS5jaGFuZ2VMaXN0SW5kZXgoZSlcbiAgICAgICAgICB0aGlzLiRlbWl0KCd1cGRhdGU6bGlzdC1pbmRleCcsIG1lbnUubGlzdEluZGV4KVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBtZW51IGlzIG5vdCBhY3RpdmUsIHVwIGFuZCBkb3duIGNhbiBkb1xuICAgICAgLy8gb25lIG9mIDIgdGhpbmdzLiBJZiBtdWx0aXBsZSwgb3BlbnMgdGhlXG4gICAgICAvLyBtZW51LCBpZiBub3QsIHdpbGwgY3ljbGUgdGhyb3VnaCBhbGxcbiAgICAgIC8vIGF2YWlsYWJsZSBvcHRpb25zXG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLmlzTWVudUFjdGl2ZSAmJlxuICAgICAgICBba2V5Q29kZXMudXAsIGtleUNvZGVzLmRvd25dLmluY2x1ZGVzKGtleUNvZGUpXG4gICAgICApIHJldHVybiB0aGlzLm9uVXBEb3duKGUpXG5cbiAgICAgIC8vIElmIGVzY2FwZSBkZWFjdGl2YXRlIHRoZSBtZW51XG4gICAgICBpZiAoa2V5Q29kZSA9PT0ga2V5Q29kZXMuZXNjKSByZXR1cm4gdGhpcy5vbkVzY0Rvd24oZSlcblxuICAgICAgLy8gSWYgdGFiIC0gc2VsZWN0IGl0ZW0gb3IgY2xvc2UgbWVudVxuICAgICAgaWYgKGtleUNvZGUgPT09IGtleUNvZGVzLnRhYikgcmV0dXJuIHRoaXMub25UYWJEb3duKGUpXG5cbiAgICAgIC8vIElmIHNwYWNlIHByZXZlbnREZWZhdWx0XG4gICAgICBpZiAoa2V5Q29kZSA9PT0ga2V5Q29kZXMuc3BhY2UpIHJldHVybiB0aGlzLm9uU3BhY2VEb3duKGUpXG4gICAgfSxcbiAgICBvbk1lbnVBY3RpdmVDaGFuZ2UgKHZhbDogYm9vbGVhbikge1xuICAgICAgLy8gSWYgbWVudSBpcyBjbG9zaW5nIGFuZCBtdWxpdHBsZVxuICAgICAgLy8gb3IgbWVudUluZGV4IGlzIGFscmVhZHkgc2V0XG4gICAgICAvLyBza2lwIG1lbnUgaW5kZXggcmVjYWxjdWxhdGlvblxuICAgICAgaWYgKFxuICAgICAgICAodGhpcy5tdWx0aXBsZSAmJiAhdmFsKSB8fFxuICAgICAgICB0aGlzLmdldE1lbnVJbmRleCgpID4gLTFcbiAgICAgICkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IG1lbnUgPSB0aGlzLiRyZWZzLm1lbnVcblxuICAgICAgaWYgKCFtZW51IHx8ICF0aGlzLmlzRGlydHkpIHJldHVyblxuXG4gICAgICAvLyBXaGVuIG1lbnUgb3BlbnMsIHNldCBpbmRleCBvZiBmaXJzdCBhY3RpdmUgaXRlbVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZW51LnRpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChtZW51LnRpbGVzW2ldLmdldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgICAgICB0aGlzLnNldE1lbnVJbmRleChpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9uTW91c2VVcCAoZTogTW91c2VFdmVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmhhc01vdXNlRG93biAmJlxuICAgICAgICBlLndoaWNoICE9PSAzICYmXG4gICAgICAgICF0aGlzLmlzRGlzYWJsZWRcbiAgICAgICkge1xuICAgICAgICAvLyBJZiBhcHBlbmQgaW5uZXIgaXMgcHJlc2VudFxuICAgICAgICAvLyBhbmQgdGhlIHRhcmdldCBpcyBpdHNlbGZcbiAgICAgICAgLy8gb3IgaW5zaWRlLCB0b2dnbGUgbWVudVxuICAgICAgICBpZiAodGhpcy5pc0FwcGVuZElubmVyKGUudGFyZ2V0KSkge1xuICAgICAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+ICh0aGlzLmlzTWVudUFjdGl2ZSA9ICF0aGlzLmlzTWVudUFjdGl2ZSkpXG4gICAgICAgIC8vIElmIHVzZXIgaXMgY2xpY2tpbmcgaW4gdGhlIGNvbnRhaW5lclxuICAgICAgICAvLyBhbmQgZmllbGQgaXMgZW5jbG9zZWQsIGFjdGl2YXRlIGl0XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0VuY2xvc2VkKSB7XG4gICAgICAgICAgdGhpcy5pc01lbnVBY3RpdmUgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgVlRleHRGaWVsZC5vcHRpb25zLm1ldGhvZHMub25Nb3VzZVVwLmNhbGwodGhpcywgZSlcbiAgICB9LFxuICAgIG9uU2Nyb2xsICgpIHtcbiAgICAgIGlmICghdGhpcy5pc01lbnVBY3RpdmUpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+ICh0aGlzLmdldENvbnRlbnQoKS5zY3JvbGxUb3AgPSAwKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3RJdGVtID49IHRoaXMuY29tcHV0ZWRJdGVtcy5sZW5ndGgpIHJldHVyblxuXG4gICAgICAgIGNvbnN0IHNob3dNb3JlSXRlbXMgPSAoXG4gICAgICAgICAgdGhpcy5nZXRDb250ZW50KCkuc2Nyb2xsSGVpZ2h0IC1cbiAgICAgICAgICAodGhpcy5nZXRDb250ZW50KCkuc2Nyb2xsVG9wICtcbiAgICAgICAgICB0aGlzLmdldENvbnRlbnQoKS5jbGllbnRIZWlnaHQpXG4gICAgICAgICkgPCAyMDBcblxuICAgICAgICBpZiAoc2hvd01vcmVJdGVtcykge1xuICAgICAgICAgIHRoaXMubGFzdEl0ZW0gKz0gMjBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgb25TcGFjZURvd24gKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIH0sXG4gICAgb25UYWJEb3duIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICBjb25zdCBtZW51ID0gdGhpcy4kcmVmcy5tZW51XG5cbiAgICAgIGlmICghbWVudSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IGFjdGl2ZVRpbGUgPSBtZW51LmFjdGl2ZVRpbGVcblxuICAgICAgLy8gQW4gaXRlbSB0aGF0IGlzIHNlbGVjdGVkIGJ5XG4gICAgICAvLyBtZW51LWluZGV4IHNob3VsZCB0b2dnbGVkXG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLm11bHRpcGxlICYmXG4gICAgICAgIGFjdGl2ZVRpbGUgJiZcbiAgICAgICAgdGhpcy5pc01lbnVBY3RpdmVcbiAgICAgICkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICAgIGFjdGl2ZVRpbGUuY2xpY2soKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgd2UgbWFrZSBpdCBoZXJlLFxuICAgICAgICAvLyB0aGUgdXNlciBoYXMgbm8gc2VsZWN0ZWQgaW5kZXhlc1xuICAgICAgICAvLyBhbmQgaXMgcHJvYmFibHkgdGFiYmluZyBvdXRcbiAgICAgICAgdGhpcy5ibHVyKGUpXG4gICAgICB9XG4gICAgfSxcbiAgICBvblVwRG93biAoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgY29uc3QgbWVudSA9IHRoaXMuJHJlZnMubWVudVxuXG4gICAgICBpZiAoIW1lbnUpIHJldHVyblxuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgLy8gTXVsdGlwbGUgc2VsZWN0cyBkbyBub3QgY3ljbGUgdGhlaXIgdmFsdWVcbiAgICAgIC8vIHdoZW4gcHJlc3NpbmcgdXAgb3IgZG93biwgaW5zdGVhZCBhY3RpdmF0ZVxuICAgICAgLy8gdGhlIG1lbnVcbiAgICAgIGlmICh0aGlzLm11bHRpcGxlKSByZXR1cm4gdGhpcy5hY3RpdmF0ZU1lbnUoKVxuXG4gICAgICBjb25zdCBrZXlDb2RlID0gZS5rZXlDb2RlXG5cbiAgICAgIC8vIEN5Y2xlIHRocm91Z2ggYXZhaWxhYmxlIHZhbHVlcyB0byBhY2hpZXZlXG4gICAgICAvLyBzZWxlY3QgbmF0aXZlIGJlaGF2aW9yXG4gICAgICBtZW51LmlzQm9vdGVkID0gdHJ1ZVxuXG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgbWVudS5nZXRUaWxlcygpXG4gICAgICAgIGtleUNvZGVzLnVwID09PSBrZXlDb2RlID8gbWVudS5wcmV2VGlsZSgpIDogbWVudS5uZXh0VGlsZSgpXG4gICAgICAgIG1lbnUuYWN0aXZlVGlsZSAmJiBtZW51LmFjdGl2ZVRpbGUuY2xpY2soKVxuICAgICAgfSlcbiAgICB9LFxuICAgIHNlbGVjdEl0ZW0gKGl0ZW06IG9iamVjdCkge1xuICAgICAgaWYgKCF0aGlzLm11bHRpcGxlKSB7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5yZXR1cm5PYmplY3QgPyBpdGVtIDogdGhpcy5nZXRWYWx1ZShpdGVtKSlcbiAgICAgICAgdGhpcy5pc01lbnVBY3RpdmUgPSBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxWYWx1ZSA9ICh0aGlzLmludGVybmFsVmFsdWUgfHwgW10pLnNsaWNlKClcbiAgICAgICAgY29uc3QgaSA9IHRoaXMuZmluZEV4aXN0aW5nSW5kZXgoaXRlbSlcblxuICAgICAgICBpICE9PSAtMSA/IGludGVybmFsVmFsdWUuc3BsaWNlKGksIDEpIDogaW50ZXJuYWxWYWx1ZS5wdXNoKGl0ZW0pXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoaW50ZXJuYWxWYWx1ZS5tYXAoKGk6IG9iamVjdCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLnJldHVybk9iamVjdCA/IGkgOiB0aGlzLmdldFZhbHVlKGkpXG4gICAgICAgIH0pKVxuXG4gICAgICAgIC8vIFdoZW4gc2VsZWN0aW5nIG11bHRpcGxlXG4gICAgICAgIC8vIGFkanVzdCBtZW51IGFmdGVyIGVhY2hcbiAgICAgICAgLy8gc2VsZWN0aW9uXG4gICAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICB0aGlzLiRyZWZzLm1lbnUgJiZcbiAgICAgICAgICAgICh0aGlzLiRyZWZzLm1lbnUgYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSkudXBkYXRlRGltZW5zaW9ucygpXG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gV2Ugb25seSBuZWVkIHRvIHJlc2V0IGxpc3QgaW5kZXggZm9yIG11bHRpcGxlXG4gICAgICAgIC8vIHRvIGtlZXAgaGlnaGxpZ2h0IHdoZW4gYW4gaXRlbSBpcyB0b2dnbGVkXG4gICAgICAgIC8vIG9uIGFuZCBvZmZcbiAgICAgICAgaWYgKCF0aGlzLm11bHRpcGxlKSByZXR1cm5cblxuICAgICAgICBjb25zdCBsaXN0SW5kZXggPSB0aGlzLmdldE1lbnVJbmRleCgpXG5cbiAgICAgICAgdGhpcy5zZXRNZW51SW5kZXgoLTEpXG5cbiAgICAgICAgLy8gVGhlcmUgaXMgbm8gaXRlbSB0byByZS1oaWdobGlnaHRcbiAgICAgICAgLy8gd2hlbiBzZWxlY3Rpb25zIGFyZSBoaWRkZW5cbiAgICAgICAgaWYgKHRoaXMuaGlkZVNlbGVjdGVkKSByZXR1cm5cblxuICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB0aGlzLnNldE1lbnVJbmRleChsaXN0SW5kZXgpKVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0TWVudUluZGV4IChpbmRleDogbnVtYmVyKSB7XG4gICAgICB0aGlzLiRyZWZzLm1lbnUgJiYgKCh0aGlzLiRyZWZzLm1lbnUgYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSkubGlzdEluZGV4ID0gaW5kZXgpXG4gICAgfSxcbiAgICBzZXRTZWxlY3RlZEl0ZW1zICgpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkSXRlbXMgPSBbXVxuICAgICAgY29uc3QgdmFsdWVzID0gIXRoaXMubXVsdGlwbGUgfHwgIUFycmF5LmlzQXJyYXkodGhpcy5pbnRlcm5hbFZhbHVlKVxuICAgICAgICA/IFt0aGlzLmludGVybmFsVmFsdWVdXG4gICAgICAgIDogdGhpcy5pbnRlcm5hbFZhbHVlXG5cbiAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5hbGxJdGVtcy5maW5kSW5kZXgodiA9PiB0aGlzLnZhbHVlQ29tcGFyYXRvcihcbiAgICAgICAgICB0aGlzLmdldFZhbHVlKHYpLFxuICAgICAgICAgIHRoaXMuZ2V0VmFsdWUodmFsdWUpXG4gICAgICAgICkpXG5cbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICBzZWxlY3RlZEl0ZW1zLnB1c2godGhpcy5hbGxJdGVtc1tpbmRleF0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gc2VsZWN0ZWRJdGVtc1xuICAgIH0sXG4gICAgc2V0VmFsdWUgKHZhbHVlOiBhbnkpIHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpcy5pbnRlcm5hbFZhbHVlXG4gICAgICB0aGlzLmludGVybmFsVmFsdWUgPSB2YWx1ZVxuICAgICAgdmFsdWUgIT09IG9sZFZhbHVlICYmIHRoaXMuJGVtaXQoJ2NoYW5nZScsIHZhbHVlKVxuICAgIH0sXG4gICAgaXNBcHBlbmRJbm5lciAodGFyZ2V0OiBhbnkpIHtcbiAgICAgIC8vIHJldHVybiB0cnVlIGlmIGFwcGVuZCBpbm5lciBpcyBwcmVzZW50XG4gICAgICAvLyBhbmQgdGhlIHRhcmdldCBpcyBpdHNlbGYgb3IgaW5zaWRlXG4gICAgICBjb25zdCBhcHBlbmRJbm5lciA9IHRoaXMuJHJlZnNbJ2FwcGVuZC1pbm5lciddXG5cbiAgICAgIHJldHVybiBhcHBlbmRJbm5lciAmJiAoYXBwZW5kSW5uZXIgPT09IHRhcmdldCB8fCBhcHBlbmRJbm5lci5jb250YWlucyh0YXJnZXQpKVxuICAgIH0sXG4gIH0sXG59KVxuIl19