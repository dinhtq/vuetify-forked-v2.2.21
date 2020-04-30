// Styles
import './VAutocomplete.sass';
// Extensions
import VSelect, { defaultMenuProps as VSelectMenuProps } from '../VSelect/VSelect';
import VTextField from '../VTextField/VTextField';
// Utilities
import mergeData from '../../util/mergeData';
import { keyCodes, getObjectValueByPath } from '../../util/helpers';
const defaultMenuProps = {
    ...VSelectMenuProps,
    offsetY: true,
    offsetOverflow: true,
    transition: false,
};
/* @vue/component */
export default VSelect.extend({
    name: 'v-autocomplete',
    props: {
        allowOverflow: {
            type: Boolean,
            default: true,
        },
        autoSelectFirst: {
            type: Boolean,
            default: false,
        },
        filter: {
            type: Function,
            default: (item, queryText, itemText) => {
                return itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1;
            },
        },
        hideNoData: Boolean,
        menuProps: {
            type: VSelect.options.props.menuProps.type,
            default: () => defaultMenuProps,
        },
        noFilter: Boolean,
        searchInput: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            lazySearch: this.searchInput,
        };
    },
    computed: {
        classes() {
            return {
                ...VSelect.options.computed.classes.call(this),
                'v-autocomplete': true,
                'v-autocomplete--is-selecting-index': this.selectedIndex > -1,
            };
        },
        computedItems() {
            return this.filteredItems;
        },
        selectedValues() {
            return this.selectedItems.map(item => this.getValue(item));
        },
        hasDisplayedItems() {
            return this.hideSelected
                ? this.filteredItems.some(item => !this.hasItem(item))
                : this.filteredItems.length > 0;
        },
        currentRange() {
            if (this.selectedItem == null)
                return 0;
            return String(this.getText(this.selectedItem)).length;
        },
        filteredItems() {
            if (!this.isSearching || this.noFilter || this.internalSearch == null)
                return this.allItems;
            return this.allItems.filter(item => this.filter(item, String(this.internalSearch), String(this.getText(item))));
        },
        internalSearch: {
            get() {
                return this.lazySearch;
            },
            set(val) {
                this.lazySearch = val;
                this.$emit('update:search-input', val);
            },
        },
        isAnyValueAllowed() {
            return false;
        },
        isDirty() {
            return this.searchIsDirty || this.selectedItems.length > 0;
        },
        isSearching() {
            return (this.multiple &&
                this.searchIsDirty) || (this.searchIsDirty &&
                this.internalSearch !== this.getText(this.selectedItem));
        },
        menuCanShow() {
            if (!this.isFocused)
                return false;
            return this.hasDisplayedItems || !this.hideNoData;
        },
        $_menuProps() {
            const props = VSelect.options.computed.$_menuProps.call(this);
            props.contentClass = `v-autocomplete__content ${props.contentClass || ''}`.trim();
            return {
                ...defaultMenuProps,
                ...props,
            };
        },
        searchIsDirty() {
            return this.internalSearch != null &&
                this.internalSearch !== '';
        },
        selectedItem() {
            if (this.multiple)
                return null;
            return this.selectedItems.find(i => {
                return this.valueComparator(this.getValue(i), this.getValue(this.internalValue));
            });
        },
        listData() {
            const data = VSelect.options.computed.listData.call(this);
            data.props = {
                ...data.props,
                items: this.virtualizedItems,
                noFilter: (this.noFilter ||
                    !this.isSearching ||
                    !this.filteredItems.length),
                searchInput: this.internalSearch,
            };
            return data;
        },
    },
    watch: {
        filteredItems: 'onFilteredItemsChanged',
        internalValue: 'setSearch',
        isFocused(val) {
            if (val) {
                document.addEventListener('copy', this.onCopy);
                this.$refs.input && this.$refs.input.select();
            }
            else {
                document.removeEventListener('copy', this.onCopy);
                this.updateSelf();
            }
        },
        isMenuActive(val) {
            if (val || !this.hasSlot)
                return;
            this.lazySearch = undefined;
        },
        items(val, oldVal) {
            // If we are focused, the menu
            // is not active, hide no data is enabled,
            // and items change
            // User is probably async loading
            // items, try to activate the menu
            if (!(oldVal && oldVal.length) &&
                this.hideNoData &&
                this.isFocused &&
                !this.isMenuActive &&
                val.length)
                this.activateMenu();
        },
        searchInput(val) {
            this.lazySearch = val;
        },
        internalSearch: 'onInternalSearchChanged',
        itemText: 'updateSelf',
    },
    created() {
        this.setSearch();
    },
    methods: {
        onFilteredItemsChanged(val, oldVal) {
            // TODO: How is the watcher triggered
            // for duplicate items? no idea
            if (val === oldVal)
                return;
            this.setMenuIndex(-1);
            this.$nextTick(() => {
                if (!this.internalSearch ||
                    (val.length !== 1 &&
                        !this.autoSelectFirst))
                    return;
                this.$refs.menu.getTiles();
                this.setMenuIndex(0);
            });
        },
        onInternalSearchChanged() {
            this.updateMenuDimensions();
        },
        updateMenuDimensions() {
            // Type from menuable is not making it through
            this.isMenuActive && this.$refs.menu && this.$refs.menu.updateDimensions();
        },
        changeSelectedIndex(keyCode) {
            // Do not allow changing of selectedIndex
            // when search is dirty
            if (this.searchIsDirty)
                return;
            if (this.multiple && keyCode === keyCodes.left) {
                if (this.selectedIndex === -1) {
                    this.selectedIndex = this.selectedItems.length - 1;
                }
                else {
                    this.selectedIndex--;
                }
            }
            else if (this.multiple && keyCode === keyCodes.right) {
                if (this.selectedIndex >= this.selectedItems.length - 1) {
                    this.selectedIndex = -1;
                }
                else {
                    this.selectedIndex++;
                }
            }
            else if (keyCode === keyCodes.backspace || keyCode === keyCodes.delete) {
                this.deleteCurrentItem();
            }
        },
        deleteCurrentItem() {
            if (this.readonly)
                return;
            const index = this.selectedItems.length - 1;
            if (this.selectedIndex === -1 && index !== 0) {
                this.selectedIndex = index;
                return;
            }
            const currentItem = this.selectedItems[this.selectedIndex];
            if (this.getDisabled(currentItem))
                return;
            const newIndex = this.selectedIndex === index
                ? this.selectedIndex - 1
                : this.selectedItems[this.selectedIndex + 1]
                    ? this.selectedIndex
                    : -1;
            if (newIndex === -1) {
                this.setValue(this.multiple ? [] : undefined);
            }
            else {
                this.selectItem(currentItem);
            }
            this.selectedIndex = newIndex;
        },
        clearableCallback() {
            this.internalSearch = undefined;
            VSelect.options.methods.clearableCallback.call(this);
        },
        genInput() {
            const input = VTextField.options.methods.genInput.call(this);
            input.data = mergeData(input.data, {
                attrs: {
                    'aria-activedescendant': getObjectValueByPath(this.$refs.menu, 'activeTile.id'),
                    autocomplete: getObjectValueByPath(input.data, 'attrs.autocomplete', 'off'),
                },
                domProps: { value: this.internalSearch },
            });
            return input;
        },
        genInputSlot() {
            const slot = VSelect.options.methods.genInputSlot.call(this);
            slot.data.attrs.role = 'combobox';
            return slot;
        },
        genSelections() {
            return this.hasSlot || this.multiple
                ? VSelect.options.methods.genSelections.call(this)
                : [];
        },
        onClick(e) {
            if (this.isDisabled)
                return;
            this.selectedIndex > -1
                ? (this.selectedIndex = -1)
                : this.onFocus();
            if (!this.isAppendInner(e.target))
                this.activateMenu();
        },
        onInput(e) {
            if (this.selectedIndex > -1 ||
                !e.target)
                return;
            const target = e.target;
            const value = target.value;
            // If typing and menu is not currently active
            if (target.value)
                this.activateMenu();
            this.internalSearch = value;
            this.badInput = target.validity && target.validity.badInput;
        },
        onKeyDown(e) {
            const keyCode = e.keyCode;
            VSelect.options.methods.onKeyDown.call(this, e);
            // The ordering is important here
            // allows new value to be updated
            // and then moves the index to the
            // proper location
            this.changeSelectedIndex(keyCode);
        },
        onSpaceDown(e) { },
        onTabDown(e) {
            VSelect.options.methods.onTabDown.call(this, e);
            this.updateSelf();
        },
        onUpDown(e) {
            // Prevent screen from scrolling
            e.preventDefault();
            // For autocomplete / combobox, cycling
            // interfers with native up/down behavior
            // instead activate the menu
            this.activateMenu();
        },
        selectItem(item) {
            VSelect.options.methods.selectItem.call(this, item);
            this.setSearch();
        },
        setSelectedItems() {
            VSelect.options.methods.setSelectedItems.call(this);
            // #4273 Don't replace if searching
            // #4403 Don't replace if focused
            if (!this.isFocused)
                this.setSearch();
        },
        setSearch() {
            // Wait for nextTick so selectedItem
            // has had time to update
            this.$nextTick(() => {
                if (!this.multiple ||
                    !this.internalSearch ||
                    !this.isMenuActive) {
                    this.internalSearch = (!this.selectedItems.length ||
                        this.multiple ||
                        this.hasSlot)
                        ? null
                        : this.getText(this.selectedItem);
                }
            });
        },
        updateSelf() {
            if (!this.searchIsDirty &&
                !this.internalValue)
                return;
            if (!this.valueComparator(this.internalSearch, this.getValue(this.internalValue))) {
                this.setSearch();
            }
        },
        hasItem(item) {
            return this.selectedValues.indexOf(this.getValue(item)) > -1;
        },
        onCopy(event) {
            if (this.selectedIndex === -1)
                return;
            const currentItem = this.selectedItems[this.selectedIndex];
            const currentItemText = this.getText(currentItem);
            event.clipboardData.setData('text/plain', currentItemText);
            event.clipboardData.setData('text/vnd.vuetify.autocomplete.item+plain', currentItemText);
            event.preventDefault();
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkF1dG9jb21wbGV0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZBdXRvY29tcGxldGUvVkF1dG9jb21wbGV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxzQkFBc0IsQ0FBQTtBQUU3QixhQUFhO0FBQ2IsT0FBTyxPQUFPLEVBQUUsRUFBRSxnQkFBZ0IsSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ2xGLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBRWpELFlBQVk7QUFDWixPQUFPLFNBQVMsTUFBTSxzQkFBc0IsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFLbkUsTUFBTSxnQkFBZ0IsR0FBRztJQUN2QixHQUFHLGdCQUFnQjtJQUNuQixPQUFPLEVBQUUsSUFBSTtJQUNiLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLFVBQVUsRUFBRSxLQUFLO0NBQ2xCLENBQUE7QUFFRCxvQkFBb0I7QUFDcEIsZUFBZSxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzVCLElBQUksRUFBRSxnQkFBZ0I7SUFFdEIsS0FBSyxFQUFFO1FBQ0wsYUFBYSxFQUFFO1lBQ2IsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsZUFBZSxFQUFFO1lBQ2YsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsS0FBSztTQUNmO1FBQ0QsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsQ0FBQyxJQUFTLEVBQUUsU0FBaUIsRUFBRSxRQUFnQixFQUFFLEVBQUU7Z0JBQzFELE9BQU8sUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDakYsQ0FB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QUMsQ0FDbEMsRUFBRTtnQkFDRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7YUFDakI7UUFDSCxDQUFDO1FBQ0QsT0FBTyxDQUFFLElBQVM7WUFDaEIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDOUQsQ0FBQztRQUNELE1BQU0sQ0FBRSxLQUFxQjtZQUMzQixJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssQ0FBQyxDQUFDO2dCQUFFLE9BQU07WUFFckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDMUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUNqRCxLQUFLLENBQUMsYUFBYyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUE7WUFDM0QsS0FBSyxDQUFDLGFBQWMsQ0FBQyxPQUFPLENBQUMsMENBQTBDLEVBQUUsZUFBZSxDQUFDLENBQUE7WUFDekYsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3hCLENBQUM7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZBdXRvY29tcGxldGUuc2FzcydcblxuLy8gRXh0ZW5zaW9uc1xuaW1wb3J0IFZTZWxlY3QsIHsgZGVmYXVsdE1lbnVQcm9wcyBhcyBWU2VsZWN0TWVudVByb3BzIH0gZnJvbSAnLi4vVlNlbGVjdC9WU2VsZWN0J1xuaW1wb3J0IFZUZXh0RmllbGQgZnJvbSAnLi4vVlRleHRGaWVsZC9WVGV4dEZpZWxkJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBtZXJnZURhdGEgZnJvbSAnLi4vLi4vdXRpbC9tZXJnZURhdGEnXG5pbXBvcnQgeyBrZXlDb2RlcywgZ2V0T2JqZWN0VmFsdWVCeVBhdGggfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBQcm9wVHlwZSB9IGZyb20gJ3Z1ZSdcblxuY29uc3QgZGVmYXVsdE1lbnVQcm9wcyA9IHtcbiAgLi4uVlNlbGVjdE1lbnVQcm9wcyxcbiAgb2Zmc2V0WTogdHJ1ZSxcbiAgb2Zmc2V0T3ZlcmZsb3c6IHRydWUsXG4gIHRyYW5zaXRpb246IGZhbHNlLFxufVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgVlNlbGVjdC5leHRlbmQoe1xuICBuYW1lOiAndi1hdXRvY29tcGxldGUnLFxuXG4gIHByb3BzOiB7XG4gICAgYWxsb3dPdmVyZmxvdzoge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBhdXRvU2VsZWN0Rmlyc3Q6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIGZpbHRlcjoge1xuICAgICAgdHlwZTogRnVuY3Rpb24sXG4gICAgICBkZWZhdWx0OiAoaXRlbTogYW55LCBxdWVyeVRleHQ6IHN0cmluZywgaXRlbVRleHQ6IHN0cmluZykgPT4ge1xuICAgICAgICByZXR1cm4gaXRlbVRleHQudG9Mb2NhbGVMb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5VGV4dC50b0xvY2FsZUxvd2VyQ2FzZSgpKSA+IC0xXG4gICAgICB9LFxuICAgIH0sXG4gICAgaGlkZU5vRGF0YTogQm9vbGVhbixcbiAgICBtZW51UHJvcHM6IHtcbiAgICAgIHR5cGU6IFZTZWxlY3Qub3B0aW9ucy5wcm9wcy5tZW51UHJvcHMudHlwZSxcbiAgICAgIGRlZmF1bHQ6ICgpID0+IGRlZmF1bHRNZW51UHJvcHMsXG4gICAgfSxcbiAgICBub0ZpbHRlcjogQm9vbGVhbixcbiAgICBzZWFyY2hJbnB1dDoge1xuICAgICAgdHlwZTogU3RyaW5nIGFzIFByb3BUeXBlPHN0cmluZyB8IHVuZGVmaW5lZD4sXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWQsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGF6eVNlYXJjaDogdGhpcy5zZWFyY2hJbnB1dCxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uVlNlbGVjdC5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtYXV0b2NvbXBsZXRlJzogdHJ1ZSxcbiAgICAgICAgJ3YtYXV0b2NvbXBsZXRlLS1pcy1zZWxlY3RpbmctaW5kZXgnOiB0aGlzLnNlbGVjdGVkSW5kZXggPiAtMSxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkSXRlbXMgKCk6IG9iamVjdFtdIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbHRlcmVkSXRlbXNcbiAgICB9LFxuICAgIHNlbGVjdGVkVmFsdWVzICgpOiBvYmplY3RbXSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEl0ZW1zLm1hcChpdGVtID0+IHRoaXMuZ2V0VmFsdWUoaXRlbSkpXG4gICAgfSxcbiAgICBoYXNEaXNwbGF5ZWRJdGVtcyAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5oaWRlU2VsZWN0ZWRcbiAgICAgICAgPyB0aGlzLmZpbHRlcmVkSXRlbXMuc29tZShpdGVtID0+ICF0aGlzLmhhc0l0ZW0oaXRlbSkpXG4gICAgICAgIDogdGhpcy5maWx0ZXJlZEl0ZW1zLmxlbmd0aCA+IDBcbiAgICB9LFxuICAgIGN1cnJlbnRSYW5nZSAoKTogbnVtYmVyIHtcbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbSA9PSBudWxsKSByZXR1cm4gMFxuXG4gICAgICByZXR1cm4gU3RyaW5nKHRoaXMuZ2V0VGV4dCh0aGlzLnNlbGVjdGVkSXRlbSkpLmxlbmd0aFxuICAgIH0sXG4gICAgZmlsdGVyZWRJdGVtcyAoKTogb2JqZWN0W10ge1xuICAgICAgaWYgKCF0aGlzLmlzU2VhcmNoaW5nIHx8IHRoaXMubm9GaWx0ZXIgfHwgdGhpcy5pbnRlcm5hbFNlYXJjaCA9PSBudWxsKSByZXR1cm4gdGhpcy5hbGxJdGVtc1xuXG4gICAgICByZXR1cm4gdGhpcy5hbGxJdGVtcy5maWx0ZXIoaXRlbSA9PiB0aGlzLmZpbHRlcihpdGVtLCBTdHJpbmcodGhpcy5pbnRlcm5hbFNlYXJjaCksIFN0cmluZyh0aGlzLmdldFRleHQoaXRlbSkpKSlcbiAgICB9LFxuICAgIGludGVybmFsU2VhcmNoOiB7XG4gICAgICBnZXQgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhenlTZWFyY2hcbiAgICAgIH0sXG4gICAgICBzZXQgKHZhbDogYW55KSB7XG4gICAgICAgIHRoaXMubGF6eVNlYXJjaCA9IHZhbFxuXG4gICAgICAgIHRoaXMuJGVtaXQoJ3VwZGF0ZTpzZWFyY2gtaW5wdXQnLCB2YWwpXG4gICAgICB9LFxuICAgIH0sXG4gICAgaXNBbnlWYWx1ZUFsbG93ZWQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSxcbiAgICBpc0RpcnR5ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLnNlYXJjaElzRGlydHkgfHwgdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCA+IDBcbiAgICB9LFxuICAgIGlzU2VhcmNoaW5nICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMubXVsdGlwbGUgJiZcbiAgICAgICAgdGhpcy5zZWFyY2hJc0RpcnR5XG4gICAgICApIHx8IChcbiAgICAgICAgdGhpcy5zZWFyY2hJc0RpcnR5ICYmXG4gICAgICAgIHRoaXMuaW50ZXJuYWxTZWFyY2ggIT09IHRoaXMuZ2V0VGV4dCh0aGlzLnNlbGVjdGVkSXRlbSlcbiAgICAgIClcbiAgICB9LFxuICAgIG1lbnVDYW5TaG93ICgpOiBib29sZWFuIHtcbiAgICAgIGlmICghdGhpcy5pc0ZvY3VzZWQpIHJldHVybiBmYWxzZVxuXG4gICAgICByZXR1cm4gdGhpcy5oYXNEaXNwbGF5ZWRJdGVtcyB8fCAhdGhpcy5oaWRlTm9EYXRhXG4gICAgfSxcbiAgICAkX21lbnVQcm9wcyAoKTogb2JqZWN0IHtcbiAgICAgIGNvbnN0IHByb3BzID0gVlNlbGVjdC5vcHRpb25zLmNvbXB1dGVkLiRfbWVudVByb3BzLmNhbGwodGhpcyk7XG4gICAgICAocHJvcHMgYXMgYW55KS5jb250ZW50Q2xhc3MgPSBgdi1hdXRvY29tcGxldGVfX2NvbnRlbnQgJHsocHJvcHMgYXMgYW55KS5jb250ZW50Q2xhc3MgfHwgJyd9YC50cmltKClcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmRlZmF1bHRNZW51UHJvcHMsXG4gICAgICAgIC4uLnByb3BzLFxuICAgICAgfVxuICAgIH0sXG4gICAgc2VhcmNoSXNEaXJ0eSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFNlYXJjaCAhPSBudWxsICYmXG4gICAgICAgIHRoaXMuaW50ZXJuYWxTZWFyY2ggIT09ICcnXG4gICAgfSxcbiAgICBzZWxlY3RlZEl0ZW0gKCk6IGFueSB7XG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSkgcmV0dXJuIG51bGxcblxuICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJdGVtcy5maW5kKGkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZUNvbXBhcmF0b3IodGhpcy5nZXRWYWx1ZShpKSwgdGhpcy5nZXRWYWx1ZSh0aGlzLmludGVybmFsVmFsdWUpKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGxpc3REYXRhICgpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBWU2VsZWN0Lm9wdGlvbnMuY29tcHV0ZWQubGlzdERhdGEuY2FsbCh0aGlzKSBhcyBhbnlcblxuICAgICAgZGF0YS5wcm9wcyA9IHtcbiAgICAgICAgLi4uZGF0YS5wcm9wcyxcbiAgICAgICAgaXRlbXM6IHRoaXMudmlydHVhbGl6ZWRJdGVtcyxcbiAgICAgICAgbm9GaWx0ZXI6IChcbiAgICAgICAgICB0aGlzLm5vRmlsdGVyIHx8XG4gICAgICAgICAgIXRoaXMuaXNTZWFyY2hpbmcgfHxcbiAgICAgICAgICAhdGhpcy5maWx0ZXJlZEl0ZW1zLmxlbmd0aFxuICAgICAgICApLFxuICAgICAgICBzZWFyY2hJbnB1dDogdGhpcy5pbnRlcm5hbFNlYXJjaCxcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgZmlsdGVyZWRJdGVtczogJ29uRmlsdGVyZWRJdGVtc0NoYW5nZWQnLFxuICAgIGludGVybmFsVmFsdWU6ICdzZXRTZWFyY2gnLFxuICAgIGlzRm9jdXNlZCAodmFsKSB7XG4gICAgICBpZiAodmFsKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvcHknLCB0aGlzLm9uQ29weSlcbiAgICAgICAgdGhpcy4kcmVmcy5pbnB1dCAmJiB0aGlzLiRyZWZzLmlucHV0LnNlbGVjdCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb3B5JywgdGhpcy5vbkNvcHkpXG4gICAgICAgIHRoaXMudXBkYXRlU2VsZigpXG4gICAgICB9XG4gICAgfSxcbiAgICBpc01lbnVBY3RpdmUgKHZhbCkge1xuICAgICAgaWYgKHZhbCB8fCAhdGhpcy5oYXNTbG90KSByZXR1cm5cblxuICAgICAgdGhpcy5sYXp5U2VhcmNoID0gdW5kZWZpbmVkXG4gICAgfSxcbiAgICBpdGVtcyAodmFsLCBvbGRWYWwpIHtcbiAgICAgIC8vIElmIHdlIGFyZSBmb2N1c2VkLCB0aGUgbWVudVxuICAgICAgLy8gaXMgbm90IGFjdGl2ZSwgaGlkZSBubyBkYXRhIGlzIGVuYWJsZWQsXG4gICAgICAvLyBhbmQgaXRlbXMgY2hhbmdlXG4gICAgICAvLyBVc2VyIGlzIHByb2JhYmx5IGFzeW5jIGxvYWRpbmdcbiAgICAgIC8vIGl0ZW1zLCB0cnkgdG8gYWN0aXZhdGUgdGhlIG1lbnVcbiAgICAgIGlmIChcbiAgICAgICAgIShvbGRWYWwgJiYgb2xkVmFsLmxlbmd0aCkgJiZcbiAgICAgICAgdGhpcy5oaWRlTm9EYXRhICYmXG4gICAgICAgIHRoaXMuaXNGb2N1c2VkICYmXG4gICAgICAgICF0aGlzLmlzTWVudUFjdGl2ZSAmJlxuICAgICAgICB2YWwubGVuZ3RoXG4gICAgICApIHRoaXMuYWN0aXZhdGVNZW51KClcbiAgICB9LFxuICAgIHNlYXJjaElucHV0ICh2YWw6IHN0cmluZykge1xuICAgICAgdGhpcy5sYXp5U2VhcmNoID0gdmFsXG4gICAgfSxcbiAgICBpbnRlcm5hbFNlYXJjaDogJ29uSW50ZXJuYWxTZWFyY2hDaGFuZ2VkJyxcbiAgICBpdGVtVGV4dDogJ3VwZGF0ZVNlbGYnLFxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIHRoaXMuc2V0U2VhcmNoKClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgb25GaWx0ZXJlZEl0ZW1zQ2hhbmdlZCAodmFsOiBuZXZlcltdLCBvbGRWYWw6IG5ldmVyW10pIHtcbiAgICAgIC8vIFRPRE86IEhvdyBpcyB0aGUgd2F0Y2hlciB0cmlnZ2VyZWRcbiAgICAgIC8vIGZvciBkdXBsaWNhdGUgaXRlbXM/IG5vIGlkZWFcbiAgICAgIGlmICh2YWwgPT09IG9sZFZhbCkgcmV0dXJuXG5cbiAgICAgIHRoaXMuc2V0TWVudUluZGV4KC0xKVxuXG4gICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhdGhpcy5pbnRlcm5hbFNlYXJjaCB8fFxuICAgICAgICAgICh2YWwubGVuZ3RoICE9PSAxICYmXG4gICAgICAgICAgICAhdGhpcy5hdXRvU2VsZWN0Rmlyc3QpXG4gICAgICAgICkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy4kcmVmcy5tZW51LmdldFRpbGVzKClcbiAgICAgICAgdGhpcy5zZXRNZW51SW5kZXgoMClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBvbkludGVybmFsU2VhcmNoQ2hhbmdlZCAoKSB7XG4gICAgICB0aGlzLnVwZGF0ZU1lbnVEaW1lbnNpb25zKClcbiAgICB9LFxuICAgIHVwZGF0ZU1lbnVEaW1lbnNpb25zICgpIHtcbiAgICAgIC8vIFR5cGUgZnJvbSBtZW51YWJsZSBpcyBub3QgbWFraW5nIGl0IHRocm91Z2hcbiAgICAgIHRoaXMuaXNNZW51QWN0aXZlICYmIHRoaXMuJHJlZnMubWVudSAmJiB0aGlzLiRyZWZzLm1lbnUudXBkYXRlRGltZW5zaW9ucygpXG4gICAgfSxcbiAgICBjaGFuZ2VTZWxlY3RlZEluZGV4IChrZXlDb2RlOiBudW1iZXIpIHtcbiAgICAgIC8vIERvIG5vdCBhbGxvdyBjaGFuZ2luZyBvZiBzZWxlY3RlZEluZGV4XG4gICAgICAvLyB3aGVuIHNlYXJjaCBpcyBkaXJ0eVxuICAgICAgaWYgKHRoaXMuc2VhcmNoSXNEaXJ0eSkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLm11bHRpcGxlICYmIGtleUNvZGUgPT09IGtleUNvZGVzLmxlZnQpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoIC0gMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleC0tXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5tdWx0aXBsZSAmJiBrZXlDb2RlID09PSBrZXlDb2Rlcy5yaWdodCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEluZGV4ID49IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gLTFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXgrK1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IGtleUNvZGVzLmJhY2tzcGFjZSB8fCBrZXlDb2RlID09PSBrZXlDb2Rlcy5kZWxldGUpIHtcbiAgICAgICAgdGhpcy5kZWxldGVDdXJyZW50SXRlbSgpXG4gICAgICB9XG4gICAgfSxcbiAgICBkZWxldGVDdXJyZW50SXRlbSAoKSB7XG4gICAgICBpZiAodGhpcy5yZWFkb25seSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCAtIDFcblxuICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJbmRleCA9PT0gLTEgJiYgaW5kZXggIT09IDApIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gaW5kZXhcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGN1cnJlbnRJdGVtID0gdGhpcy5zZWxlY3RlZEl0ZW1zW3RoaXMuc2VsZWN0ZWRJbmRleF1cblxuICAgICAgaWYgKHRoaXMuZ2V0RGlzYWJsZWQoY3VycmVudEl0ZW0pKSByZXR1cm5cblxuICAgICAgY29uc3QgbmV3SW5kZXggPSB0aGlzLnNlbGVjdGVkSW5kZXggPT09IGluZGV4XG4gICAgICAgID8gdGhpcy5zZWxlY3RlZEluZGV4IC0gMVxuICAgICAgICA6IHRoaXMuc2VsZWN0ZWRJdGVtc1t0aGlzLnNlbGVjdGVkSW5kZXggKyAxXVxuICAgICAgICAgID8gdGhpcy5zZWxlY3RlZEluZGV4XG4gICAgICAgICAgOiAtMVxuXG4gICAgICBpZiAobmV3SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5tdWx0aXBsZSA/IFtdIDogdW5kZWZpbmVkKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZWxlY3RJdGVtKGN1cnJlbnRJdGVtKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBuZXdJbmRleFxuICAgIH0sXG4gICAgY2xlYXJhYmxlQ2FsbGJhY2sgKCkge1xuICAgICAgdGhpcy5pbnRlcm5hbFNlYXJjaCA9IHVuZGVmaW5lZFxuXG4gICAgICBWU2VsZWN0Lm9wdGlvbnMubWV0aG9kcy5jbGVhcmFibGVDYWxsYmFjay5jYWxsKHRoaXMpXG4gICAgfSxcbiAgICBnZW5JbnB1dCAoKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IFZUZXh0RmllbGQub3B0aW9ucy5tZXRob2RzLmdlbklucHV0LmNhbGwodGhpcylcblxuICAgICAgaW5wdXQuZGF0YSA9IG1lcmdlRGF0YShpbnB1dC5kYXRhISwge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgICdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnOiBnZXRPYmplY3RWYWx1ZUJ5UGF0aCh0aGlzLiRyZWZzLm1lbnUsICdhY3RpdmVUaWxlLmlkJyksXG4gICAgICAgICAgYXV0b2NvbXBsZXRlOiBnZXRPYmplY3RWYWx1ZUJ5UGF0aChpbnB1dC5kYXRhISwgJ2F0dHJzLmF1dG9jb21wbGV0ZScsICdvZmYnKSxcbiAgICAgICAgfSxcbiAgICAgICAgZG9tUHJvcHM6IHsgdmFsdWU6IHRoaXMuaW50ZXJuYWxTZWFyY2ggfSxcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBpbnB1dFxuICAgIH0sXG4gICAgZ2VuSW5wdXRTbG90ICgpIHtcbiAgICAgIGNvbnN0IHNsb3QgPSBWU2VsZWN0Lm9wdGlvbnMubWV0aG9kcy5nZW5JbnB1dFNsb3QuY2FsbCh0aGlzKVxuXG4gICAgICBzbG90LmRhdGEhLmF0dHJzIS5yb2xlID0gJ2NvbWJvYm94J1xuXG4gICAgICByZXR1cm4gc2xvdFxuICAgIH0sXG4gICAgZ2VuU2VsZWN0aW9ucyAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYXNTbG90IHx8IHRoaXMubXVsdGlwbGVcbiAgICAgICAgPyBWU2VsZWN0Lm9wdGlvbnMubWV0aG9kcy5nZW5TZWxlY3Rpb25zLmNhbGwodGhpcylcbiAgICAgICAgOiBbXVxuICAgIH0sXG4gICAgb25DbGljayAoZTogTW91c2VFdmVudCkge1xuICAgICAgaWYgKHRoaXMuaXNEaXNhYmxlZCkgcmV0dXJuXG5cbiAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA+IC0xXG4gICAgICAgID8gKHRoaXMuc2VsZWN0ZWRJbmRleCA9IC0xKVxuICAgICAgICA6IHRoaXMub25Gb2N1cygpXG5cbiAgICAgIGlmICghdGhpcy5pc0FwcGVuZElubmVyKGUudGFyZ2V0KSkgdGhpcy5hY3RpdmF0ZU1lbnUoKVxuICAgIH0sXG4gICAgb25JbnB1dCAoZTogRXZlbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID4gLTEgfHxcbiAgICAgICAgIWUudGFyZ2V0XG4gICAgICApIHJldHVyblxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhcmdldC52YWx1ZVxuXG4gICAgICAvLyBJZiB0eXBpbmcgYW5kIG1lbnUgaXMgbm90IGN1cnJlbnRseSBhY3RpdmVcbiAgICAgIGlmICh0YXJnZXQudmFsdWUpIHRoaXMuYWN0aXZhdGVNZW51KClcblxuICAgICAgdGhpcy5pbnRlcm5hbFNlYXJjaCA9IHZhbHVlXG4gICAgICB0aGlzLmJhZElucHV0ID0gdGFyZ2V0LnZhbGlkaXR5ICYmIHRhcmdldC52YWxpZGl0eS5iYWRJbnB1dFxuICAgIH0sXG4gICAgb25LZXlEb3duIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICBjb25zdCBrZXlDb2RlID0gZS5rZXlDb2RlXG5cbiAgICAgIFZTZWxlY3Qub3B0aW9ucy5tZXRob2RzLm9uS2V5RG93bi5jYWxsKHRoaXMsIGUpXG5cbiAgICAgIC8vIFRoZSBvcmRlcmluZyBpcyBpbXBvcnRhbnQgaGVyZVxuICAgICAgLy8gYWxsb3dzIG5ldyB2YWx1ZSB0byBiZSB1cGRhdGVkXG4gICAgICAvLyBhbmQgdGhlbiBtb3ZlcyB0aGUgaW5kZXggdG8gdGhlXG4gICAgICAvLyBwcm9wZXIgbG9jYXRpb25cbiAgICAgIHRoaXMuY2hhbmdlU2VsZWN0ZWRJbmRleChrZXlDb2RlKVxuICAgIH0sXG4gICAgb25TcGFjZURvd24gKGU6IEtleWJvYXJkRXZlbnQpIHsgLyogbm9vcCAqLyB9LFxuICAgIG9uVGFiRG93biAoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgVlNlbGVjdC5vcHRpb25zLm1ldGhvZHMub25UYWJEb3duLmNhbGwodGhpcywgZSlcbiAgICAgIHRoaXMudXBkYXRlU2VsZigpXG4gICAgfSxcbiAgICBvblVwRG93biAoZTogRXZlbnQpIHtcbiAgICAgIC8vIFByZXZlbnQgc2NyZWVuIGZyb20gc2Nyb2xsaW5nXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgLy8gRm9yIGF1dG9jb21wbGV0ZSAvIGNvbWJvYm94LCBjeWNsaW5nXG4gICAgICAvLyBpbnRlcmZlcnMgd2l0aCBuYXRpdmUgdXAvZG93biBiZWhhdmlvclxuICAgICAgLy8gaW5zdGVhZCBhY3RpdmF0ZSB0aGUgbWVudVxuICAgICAgdGhpcy5hY3RpdmF0ZU1lbnUoKVxuICAgIH0sXG4gICAgc2VsZWN0SXRlbSAoaXRlbTogb2JqZWN0KSB7XG4gICAgICBWU2VsZWN0Lm9wdGlvbnMubWV0aG9kcy5zZWxlY3RJdGVtLmNhbGwodGhpcywgaXRlbSlcbiAgICAgIHRoaXMuc2V0U2VhcmNoKClcbiAgICB9LFxuICAgIHNldFNlbGVjdGVkSXRlbXMgKCkge1xuICAgICAgVlNlbGVjdC5vcHRpb25zLm1ldGhvZHMuc2V0U2VsZWN0ZWRJdGVtcy5jYWxsKHRoaXMpXG5cbiAgICAgIC8vICM0MjczIERvbid0IHJlcGxhY2UgaWYgc2VhcmNoaW5nXG4gICAgICAvLyAjNDQwMyBEb24ndCByZXBsYWNlIGlmIGZvY3VzZWRcbiAgICAgIGlmICghdGhpcy5pc0ZvY3VzZWQpIHRoaXMuc2V0U2VhcmNoKClcbiAgICB9LFxuICAgIHNldFNlYXJjaCAoKSB7XG4gICAgICAvLyBXYWl0IGZvciBuZXh0VGljayBzbyBzZWxlY3RlZEl0ZW1cbiAgICAgIC8vIGhhcyBoYWQgdGltZSB0byB1cGRhdGVcbiAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICF0aGlzLm11bHRpcGxlIHx8XG4gICAgICAgICAgIXRoaXMuaW50ZXJuYWxTZWFyY2ggfHxcbiAgICAgICAgICAhdGhpcy5pc01lbnVBY3RpdmVcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5pbnRlcm5hbFNlYXJjaCA9IChcbiAgICAgICAgICAgICF0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoIHx8XG4gICAgICAgICAgICB0aGlzLm11bHRpcGxlIHx8XG4gICAgICAgICAgICB0aGlzLmhhc1Nsb3RcbiAgICAgICAgICApXG4gICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgIDogdGhpcy5nZXRUZXh0KHRoaXMuc2VsZWN0ZWRJdGVtKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgdXBkYXRlU2VsZiAoKSB7XG4gICAgICBpZiAoIXRoaXMuc2VhcmNoSXNEaXJ0eSAmJlxuICAgICAgICAhdGhpcy5pbnRlcm5hbFZhbHVlXG4gICAgICApIHJldHVyblxuXG4gICAgICBpZiAoIXRoaXMudmFsdWVDb21wYXJhdG9yKFxuICAgICAgICB0aGlzLmludGVybmFsU2VhcmNoLFxuICAgICAgICB0aGlzLmdldFZhbHVlKHRoaXMuaW50ZXJuYWxWYWx1ZSlcbiAgICAgICkpIHtcbiAgICAgICAgdGhpcy5zZXRTZWFyY2goKVxuICAgICAgfVxuICAgIH0sXG4gICAgaGFzSXRlbSAoaXRlbTogYW55KSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFZhbHVlcy5pbmRleE9mKHRoaXMuZ2V0VmFsdWUoaXRlbSkpID4gLTFcbiAgICB9LFxuICAgIG9uQ29weSAoZXZlbnQ6IENsaXBib2FyZEV2ZW50KSB7XG4gICAgICBpZiAodGhpcy5zZWxlY3RlZEluZGV4ID09PSAtMSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IGN1cnJlbnRJdGVtID0gdGhpcy5zZWxlY3RlZEl0ZW1zW3RoaXMuc2VsZWN0ZWRJbmRleF1cbiAgICAgIGNvbnN0IGN1cnJlbnRJdGVtVGV4dCA9IHRoaXMuZ2V0VGV4dChjdXJyZW50SXRlbSlcbiAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEhLnNldERhdGEoJ3RleHQvcGxhaW4nLCBjdXJyZW50SXRlbVRleHQpXG4gICAgICBldmVudC5jbGlwYm9hcmREYXRhIS5zZXREYXRhKCd0ZXh0L3ZuZC52dWV0aWZ5LmF1dG9jb21wbGV0ZS5pdGVtK3BsYWluJywgY3VycmVudEl0ZW1UZXh0KVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIH0sXG4gIH0sXG59KVxuIl19