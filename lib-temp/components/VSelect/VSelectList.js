// Components
import VSimpleCheckbox from '../VCheckbox/VSimpleCheckbox';
import VDivider from '../VDivider';
import VSubheader from '../VSubheader';
import { VList, VListItem, VListItemAction, VListItemContent, VListItemTitle, } from '../VList';
// Directives
import ripple from '../../directives/ripple';
// Mixins
import Colorable from '../../mixins/colorable';
import Themeable from '../../mixins/themeable';
// Helpers
import { escapeHTML, getPropertyFromItem, } from '../../util/helpers';
// Types
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(Colorable, Themeable).extend({
    name: 'v-select-list',
    // https://github.com/vuejs/vue/issues/6872
    directives: {
        ripple,
    },
    props: {
        action: Boolean,
        dense: Boolean,
        hideSelected: Boolean,
        items: {
            type: Array,
            default: () => [],
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
        noDataText: String,
        noFilter: Boolean,
        searchInput: null,
        selectedItems: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        parsedItems() {
            return this.selectedItems.map(item => this.getValue(item));
        },
        tileActiveClass() {
            return Object.keys(this.setTextColor(this.color).class || {}).join(' ');
        },
        staticNoDataTile() {
            const tile = {
                attrs: {
                    role: undefined,
                },
                on: {
                    mousedown: (e) => e.preventDefault(),
                },
            };
            return this.$createElement(VListItem, tile, [
                this.genTileContent(this.noDataText),
            ]);
        },
    },
    methods: {
        genAction(item, inputValue) {
            return this.$createElement(VListItemAction, [
                this.$createElement(VSimpleCheckbox, {
                    props: {
                        color: this.color,
                        value: inputValue,
                    },
                    on: {
                        input: () => this.$emit('select', item),
                    },
                }),
            ]);
        },
        genDivider(props) {
            return this.$createElement(VDivider, { props });
        },
        genFilteredText(text) {
            text = text || '';
            if (!this.searchInput || this.noFilter)
                return escapeHTML(text);
            const { start, middle, end } = this.getMaskedCharacters(text);
            return `${escapeHTML(start)}${this.genHighlight(middle)}${escapeHTML(end)}`;
        },
        genHeader(props) {
            return this.$createElement(VSubheader, { props }, props.header);
        },
        genHighlight(text) {
            return `<span class="v-list-item__mask">${escapeHTML(text)}</span>`;
        },
        getMaskedCharacters(text) {
            const searchInput = (this.searchInput || '').toString().toLocaleLowerCase();
            const index = text.toLocaleLowerCase().indexOf(searchInput);
            if (index < 0)
                return { start: '', middle: text, end: '' };
            const start = text.slice(0, index);
            const middle = text.slice(index, index + searchInput.length);
            const end = text.slice(index + searchInput.length);
            return { start, middle, end };
        },
        genTile({ item, index, disabled = null, value = false, }) {
            if (!value)
                value = this.hasItem(item);
            if (item === Object(item)) {
                disabled = disabled !== null
                    ? disabled
                    : this.getDisabled(item);
            }
            const tile = {
                attrs: {
                    // Default behavior in list does not
                    // contain aria-selected by default
                    'aria-selected': String(value),
                    id: `list-item-${this._uid}-${index}`,
                    role: 'option',
                },
                on: {
                    mousedown: (e) => {
                        // Prevent onBlur from being called
                        e.preventDefault();
                    },
                    click: () => disabled || this.$emit('select', item),
                },
                props: {
                    activeClass: this.tileActiveClass,
                    disabled,
                    ripple: true,
                    inputValue: value,
                },
            };
            if (!this.$scopedSlots.item) {
                return this.$createElement(VListItem, tile, [
                    this.action && !this.hideSelected && this.items.length > 0
                        ? this.genAction(item, value)
                        : null,
                    this.genTileContent(item, index),
                ]);
            }
            const parent = this;
            const scopedSlot = this.$scopedSlots.item({
                parent,
                item,
                attrs: {
                    ...tile.attrs,
                    ...tile.props,
                },
                on: tile.on,
            });
            return this.needsTile(scopedSlot)
                ? this.$createElement(VListItem, tile, scopedSlot)
                : scopedSlot;
        },
        genTileContent(item, index = 0) {
            const innerHTML = this.genFilteredText(this.getText(item));
            return this.$createElement(VListItemContent, [this.$createElement(VListItemTitle, {
                    domProps: { innerHTML },
                })]);
        },
        hasItem(item) {
            return this.parsedItems.indexOf(this.getValue(item)) > -1;
        },
        needsTile(slot) {
            return slot.length !== 1 ||
                slot[0].componentOptions == null ||
                slot[0].componentOptions.Ctor.options.name !== 'v-list-item';
        },
        getDisabled(item) {
            return Boolean(getPropertyFromItem(item, this.itemDisabled, false));
        },
        getText(item) {
            return String(getPropertyFromItem(item, this.itemText, item));
        },
        getValue(item) {
            return getPropertyFromItem(item, this.itemValue, this.getText(item));
        },
    },
    render() {
        const children = [];
        const itemsLength = this.items.length;
        for (let index = 0; index < itemsLength; index++) {
            const item = this.items[index];
            if (this.hideSelected &&
                this.hasItem(item))
                continue;
            if (item == null)
                children.push(this.genTile({ item, index }));
            else if (item.header)
                children.push(this.genHeader(item));
            else if (item.divider)
                children.push(this.genDivider(item));
            else
                children.push(this.genTile({ item, index }));
        }
        children.length || children.push(this.$slots['no-data'] || this.staticNoDataTile);
        this.$slots['prepend-item'] && children.unshift(this.$slots['prepend-item']);
        this.$slots['append-item'] && children.push(this.$slots['append-item']);
        return this.$createElement(VList, {
            staticClass: 'v-select-list',
            class: this.themeClasses,
            attrs: {
                role: 'listbox',
                tabindex: -1,
            },
            props: { dense: this.dense },
        }, children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNlbGVjdExpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WU2VsZWN0L1ZTZWxlY3RMaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGFBQWE7QUFDYixPQUFPLGVBQWUsTUFBTSw4QkFBOEIsQ0FBQTtBQUMxRCxPQUFPLFFBQVEsTUFBTSxhQUFhLENBQUE7QUFDbEMsT0FBTyxVQUFVLE1BQU0sZUFBZSxDQUFBO0FBQ3RDLE9BQU8sRUFDTCxLQUFLLEVBQ0wsU0FBUyxFQUNULGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsY0FBYyxHQUNmLE1BQU0sVUFBVSxDQUFBO0FBRWpCLGFBQWE7QUFDYixPQUFPLE1BQU0sTUFBTSx5QkFBeUIsQ0FBQTtBQUU1QyxTQUFTO0FBQ1QsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsVUFBVTtBQUNWLE9BQU8sRUFDTCxVQUFVLEVBQ1YsbUJBQW1CLEdBQ3BCLE1BQU0sb0JBQW9CLENBQUE7QUFFM0IsUUFBUTtBQUNSLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBTXRDLG9CQUFvQjtBQUNwQixlQUFlLE1BQU0sQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ2pELElBQUksRUFBRSxlQUFlO0lBRXJCLDJDQUEyQztJQUMzQyxVQUFVLEVBQUU7UUFDVixNQUFNO0tBQ1A7SUFFRCxLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUUsT0FBTztRQUNmLEtBQUssRUFBRSxPQUFPO1FBQ2QsWUFBWSxFQUFFLE9BQU87UUFDckIsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLEtBQXdCO1lBQzlCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO1NBQ2xCO1FBQ0QsWUFBWSxFQUFFO1lBQ1osSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFR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LFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO2lCQUNwRCxJQUFJLElBQUksQ0FBQyxPQUFPO2dCQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBOztnQkFDdEQsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtTQUNsRDtRQUVELFFBQVEsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBRWpGLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7UUFFNUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQTtRQUV2RSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO1lBQ2hDLFdBQVcsRUFBRSxlQUFlO1lBQzVCLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWTtZQUN4QixLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUNiO1lBQ0QsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUU7U0FDN0IsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNkLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb21wb25lbnRzXG5pbXBvcnQgVlNpbXBsZUNoZWNrYm94IGZyb20gJy4uL1ZDaGVja2JveC9WU2ltcGxlQ2hlY2tib3gnXG5pbXBvcnQgVkRpdmlkZXIgZnJvbSAnLi4vVkRpdmlkZXInXG5pbXBvcnQgVlN1YmhlYWRlciBmcm9tICcuLi9WU3ViaGVhZGVyJ1xuaW1wb3J0IHtcbiAgVkxpc3QsXG4gIFZMaXN0SXRlbSxcbiAgVkxpc3RJdGVtQWN0aW9uLFxuICBWTGlzdEl0ZW1Db250ZW50LFxuICBWTGlzdEl0ZW1UaXRsZSxcbn0gZnJvbSAnLi4vVkxpc3QnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCByaXBwbGUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yaXBwbGUnXG5cbi8vIE1peGluc1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBIZWxwZXJzXG5pbXBvcnQge1xuICBlc2NhcGVIVE1MLFxuICBnZXRQcm9wZXJ0eUZyb21JdGVtLFxufSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgVk5vZGUsIFByb3BUeXBlLCBWTm9kZUNoaWxkcmVuIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgU2VsZWN0SXRlbUtleSB9IGZyb20gJ3R5cGVzJ1xuXG50eXBlIExpc3RUaWxlID0geyBpdGVtOiBhbnksIGRpc2FibGVkPzogbnVsbCB8IGJvb2xlYW4sIHZhbHVlPzogYm9vbGVhbiwgaW5kZXg6IG51bWJlciB9O1xuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKENvbG9yYWJsZSwgVGhlbWVhYmxlKS5leHRlbmQoe1xuICBuYW1lOiAndi1zZWxlY3QtbGlzdCcsXG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS9pc3N1ZXMvNjg3MlxuICBkaXJlY3RpdmVzOiB7XG4gICAgcmlwcGxlLFxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgYWN0aW9uOiBCb29sZWFuLFxuICAgIGRlbnNlOiBCb29sZWFuLFxuICAgIGhpZGVTZWxlY3RlZDogQm9vbGVhbixcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogQXJyYXkgYXMgUHJvcFR5cGU8YW55W10+LFxuICAgICAgZGVmYXVsdDogKCkgPT4gW10sXG4gICAgfSxcbiAgICBpdGVtRGlzYWJsZWQ6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIEFycmF5LCBGdW5jdGlvbl0gYXMgUHJvcFR5cGU8U2VsZWN0SXRlbUtleT4sXG4gICAgICBkZWZhdWx0OiAnZGlzYWJsZWQnLFxuICAgIH0sXG4gICAgaXRlbVRleHQ6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIEFycmF5LCBGdW5jdGlvbl0gYXMgUHJvcFR5cGU8U2VsZWN0SXRlbUtleT4sXG4gICAgICBkZWZhdWx0OiAndGV4dCcsXG4gICAgfSxcbiAgICBpdGVtVmFsdWU6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIEFycmF5LCBGdW5jdGlvbl0gYXMgUHJvcFR5cGU8U2VsZWN0SXRlbUtleT4sXG4gICAgICBkZWZhdWx0OiAndmFsdWUnLFxuICAgIH0sXG4gICAgbm9EYXRhVGV4dDogU3RyaW5nLFxuICAgIG5vRmlsdGVyOiBCb29sZWFuLFxuICAgIHNlYXJjaElucHV0OiBudWxsIGFzIHVua25vd24gYXMgUHJvcFR5cGU8YW55PixcbiAgICBzZWxlY3RlZEl0ZW1zOiB7XG4gICAgICB0eXBlOiBBcnJheSBhcyBQcm9wVHlwZTxhbnlbXT4sXG4gICAgICBkZWZhdWx0OiAoKSA9PiBbXSxcbiAgICB9LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgcGFyc2VkSXRlbXMgKCk6IGFueVtdIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkSXRlbXMubWFwKGl0ZW0gPT4gdGhpcy5nZXRWYWx1ZShpdGVtKSlcbiAgICB9LFxuICAgIHRpbGVBY3RpdmVDbGFzcyAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnNldFRleHRDb2xvcih0aGlzLmNvbG9yKS5jbGFzcyB8fCB7fSkuam9pbignICcpXG4gICAgfSxcbiAgICBzdGF0aWNOb0RhdGFUaWxlICgpOiBWTm9kZSB7XG4gICAgICBjb25zdCB0aWxlID0ge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIHJvbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBtb3VzZWRvd246IChlOiBFdmVudCkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpLCAvLyBQcmV2ZW50IG9uQmx1ciBmcm9tIGJlaW5nIGNhbGxlZFxuICAgICAgICB9LFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWTGlzdEl0ZW0sIHRpbGUsIFtcbiAgICAgICAgdGhpcy5nZW5UaWxlQ29udGVudCh0aGlzLm5vRGF0YVRleHQpLFxuICAgICAgXSlcbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBnZW5BY3Rpb24gKGl0ZW06IG9iamVjdCwgaW5wdXRWYWx1ZTogYW55KTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkxpc3RJdGVtQWN0aW9uLCBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVlNpbXBsZUNoZWNrYm94LCB7XG4gICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxuICAgICAgICAgICAgdmFsdWU6IGlucHV0VmFsdWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgaW5wdXQ6ICgpID0+IHRoaXMuJGVtaXQoJ3NlbGVjdCcsIGl0ZW0pLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkRpdmlkZXIgKHByb3BzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRGl2aWRlciwgeyBwcm9wcyB9KVxuICAgIH0sXG4gICAgZ2VuRmlsdGVyZWRUZXh0ICh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgIHRleHQgPSB0ZXh0IHx8ICcnXG5cbiAgICAgIGlmICghdGhpcy5zZWFyY2hJbnB1dCB8fCB0aGlzLm5vRmlsdGVyKSByZXR1cm4gZXNjYXBlSFRNTCh0ZXh0KVxuXG4gICAgICBjb25zdCB7IHN0YXJ0LCBtaWRkbGUsIGVuZCB9ID0gdGhpcy5nZXRNYXNrZWRDaGFyYWN0ZXJzKHRleHQpXG5cbiAgICAgIHJldHVybiBgJHtlc2NhcGVIVE1MKHN0YXJ0KX0ke3RoaXMuZ2VuSGlnaGxpZ2h0KG1pZGRsZSl9JHtlc2NhcGVIVE1MKGVuZCl9YFxuICAgIH0sXG4gICAgZ2VuSGVhZGVyIChwcm9wczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZTdWJoZWFkZXIsIHsgcHJvcHMgfSwgcHJvcHMuaGVhZGVyKVxuICAgIH0sXG4gICAgZ2VuSGlnaGxpZ2h0ICh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cInYtbGlzdC1pdGVtX19tYXNrXCI+JHtlc2NhcGVIVE1MKHRleHQpfTwvc3Bhbj5gXG4gICAgfSxcbiAgICBnZXRNYXNrZWRDaGFyYWN0ZXJzICh0ZXh0OiBzdHJpbmcpOiB7XG4gICAgICBzdGFydDogc3RyaW5nXG4gICAgICBtaWRkbGU6IHN0cmluZ1xuICAgICAgZW5kOiBzdHJpbmdcbiAgICB9IHtcbiAgICAgIGNvbnN0IHNlYXJjaElucHV0ID0gKHRoaXMuc2VhcmNoSW5wdXQgfHwgJycpLnRvU3RyaW5nKCkudG9Mb2NhbGVMb3dlckNhc2UoKVxuICAgICAgY29uc3QgaW5kZXggPSB0ZXh0LnRvTG9jYWxlTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hJbnB1dClcblxuICAgICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuIHsgc3RhcnQ6ICcnLCBtaWRkbGU6IHRleHQsIGVuZDogJycgfVxuXG4gICAgICBjb25zdCBzdGFydCA9IHRleHQuc2xpY2UoMCwgaW5kZXgpXG4gICAgICBjb25zdCBtaWRkbGUgPSB0ZXh0LnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaElucHV0Lmxlbmd0aClcbiAgICAgIGNvbnN0IGVuZCA9IHRleHQuc2xpY2UoaW5kZXggKyBzZWFyY2hJbnB1dC5sZW5ndGgpXG4gICAgICByZXR1cm4geyBzdGFydCwgbWlkZGxlLCBlbmQgfVxuICAgIH0sXG4gICAgZ2VuVGlsZSAoe1xuICAgICAgaXRlbSxcbiAgICAgIGluZGV4LFxuICAgICAgZGlzYWJsZWQgPSBudWxsLFxuICAgICAgdmFsdWUgPSBmYWxzZSxcbiAgICB9OiBMaXN0VGlsZSk6IFZOb2RlIHwgVk5vZGVbXSB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAoIXZhbHVlKSB2YWx1ZSA9IHRoaXMuaGFzSXRlbShpdGVtKVxuXG4gICAgICBpZiAoaXRlbSA9PT0gT2JqZWN0KGl0ZW0pKSB7XG4gICAgICAgIGRpc2FibGVkID0gZGlzYWJsZWQgIT09IG51bGxcbiAgICAgICAgICA/IGRpc2FibGVkXG4gICAgICAgICAgOiB0aGlzLmdldERpc2FibGVkKGl0ZW0pXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRpbGUgPSB7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpbiBsaXN0IGRvZXMgbm90XG4gICAgICAgICAgLy8gY29udGFpbiBhcmlhLXNlbGVjdGVkIGJ5IGRlZmF1bHRcbiAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IFN0cmluZyh2YWx1ZSksXG4gICAgICAgICAgaWQ6IGBsaXN0LWl0ZW0tJHt0aGlzLl91aWR9LSR7aW5kZXh9YCxcbiAgICAgICAgICByb2xlOiAnb3B0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBtb3VzZWRvd246IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgLy8gUHJldmVudCBvbkJsdXIgZnJvbSBiZWluZyBjYWxsZWRcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgY2xpY2s6ICgpID0+IGRpc2FibGVkIHx8IHRoaXMuJGVtaXQoJ3NlbGVjdCcsIGl0ZW0pLFxuICAgICAgICB9LFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIGFjdGl2ZUNsYXNzOiB0aGlzLnRpbGVBY3RpdmVDbGFzcyxcbiAgICAgICAgICBkaXNhYmxlZCxcbiAgICAgICAgICByaXBwbGU6IHRydWUsXG4gICAgICAgICAgaW5wdXRWYWx1ZTogdmFsdWUsXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy4kc2NvcGVkU2xvdHMuaXRlbSkge1xuICAgICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWTGlzdEl0ZW0sIHRpbGUsIFtcbiAgICAgICAgICB0aGlzLmFjdGlvbiAmJiAhdGhpcy5oaWRlU2VsZWN0ZWQgJiYgdGhpcy5pdGVtcy5sZW5ndGggPiAwXG4gICAgICAgICAgICA/IHRoaXMuZ2VuQWN0aW9uKGl0ZW0sIHZhbHVlKVxuICAgICAgICAgICAgOiBudWxsLFxuICAgICAgICAgIHRoaXMuZ2VuVGlsZUNvbnRlbnQoaXRlbSwgaW5kZXgpLFxuICAgICAgICBdKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJlbnQgPSB0aGlzXG4gICAgICBjb25zdCBzY29wZWRTbG90ID0gdGhpcy4kc2NvcGVkU2xvdHMuaXRlbSh7XG4gICAgICAgIHBhcmVudCxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAuLi50aWxlLmF0dHJzLFxuICAgICAgICAgIC4uLnRpbGUucHJvcHMsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB0aWxlLm9uLFxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHRoaXMubmVlZHNUaWxlKHNjb3BlZFNsb3QpXG4gICAgICAgID8gdGhpcy4kY3JlYXRlRWxlbWVudChWTGlzdEl0ZW0sIHRpbGUsIHNjb3BlZFNsb3QpXG4gICAgICAgIDogc2NvcGVkU2xvdFxuICAgIH0sXG4gICAgZ2VuVGlsZUNvbnRlbnQgKGl0ZW06IGFueSwgaW5kZXggPSAwKTogVk5vZGUge1xuICAgICAgY29uc3QgaW5uZXJIVE1MID0gdGhpcy5nZW5GaWx0ZXJlZFRleHQodGhpcy5nZXRUZXh0KGl0ZW0pKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWTGlzdEl0ZW1Db250ZW50LFxuICAgICAgICBbdGhpcy4kY3JlYXRlRWxlbWVudChWTGlzdEl0ZW1UaXRsZSwge1xuICAgICAgICAgIGRvbVByb3BzOiB7IGlubmVySFRNTCB9LFxuICAgICAgICB9KV1cbiAgICAgIClcbiAgICB9LFxuICAgIGhhc0l0ZW0gKGl0ZW06IG9iamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VkSXRlbXMuaW5kZXhPZih0aGlzLmdldFZhbHVlKGl0ZW0pKSA+IC0xXG4gICAgfSxcbiAgICBuZWVkc1RpbGUgKHNsb3Q6IFZOb2RlW10gfCB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBzbG90IS5sZW5ndGggIT09IDEgfHxcbiAgICAgICAgc2xvdCFbMF0uY29tcG9uZW50T3B0aW9ucyA9PSBudWxsIHx8XG4gICAgICAgIHNsb3QhWzBdLmNvbXBvbmVudE9wdGlvbnMuQ3Rvci5vcHRpb25zLm5hbWUgIT09ICd2LWxpc3QtaXRlbSdcbiAgICB9LFxuICAgIGdldERpc2FibGVkIChpdGVtOiBvYmplY3QpIHtcbiAgICAgIHJldHVybiBCb29sZWFuKGdldFByb3BlcnR5RnJvbUl0ZW0oaXRlbSwgdGhpcy5pdGVtRGlzYWJsZWQsIGZhbHNlKSlcbiAgICB9LFxuICAgIGdldFRleHQgKGl0ZW06IG9iamVjdCkge1xuICAgICAgcmV0dXJuIFN0cmluZyhnZXRQcm9wZXJ0eUZyb21JdGVtKGl0ZW0sIHRoaXMuaXRlbVRleHQsIGl0ZW0pKVxuICAgIH0sXG4gICAgZ2V0VmFsdWUgKGl0ZW06IG9iamVjdCkge1xuICAgICAgcmV0dXJuIGdldFByb3BlcnR5RnJvbUl0ZW0oaXRlbSwgdGhpcy5pdGVtVmFsdWUsIHRoaXMuZ2V0VGV4dChpdGVtKSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoKTogVk5vZGUge1xuICAgIGNvbnN0IGNoaWxkcmVuOiBWTm9kZUNoaWxkcmVuID0gW11cbiAgICBjb25zdCBpdGVtc0xlbmd0aCA9IHRoaXMuaXRlbXMubGVuZ3RoXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGl0ZW1zTGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBpdGVtID0gdGhpcy5pdGVtc1tpbmRleF1cblxuICAgICAgaWYgKHRoaXMuaGlkZVNlbGVjdGVkICYmXG4gICAgICAgIHRoaXMuaGFzSXRlbShpdGVtKVxuICAgICAgKSBjb250aW51ZVxuXG4gICAgICBpZiAoaXRlbSA9PSBudWxsKSBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuVGlsZSh7IGl0ZW0sIGluZGV4IH0pKVxuICAgICAgZWxzZSBpZiAoaXRlbS5oZWFkZXIpIGNoaWxkcmVuLnB1c2godGhpcy5nZW5IZWFkZXIoaXRlbSkpXG4gICAgICBlbHNlIGlmIChpdGVtLmRpdmlkZXIpIGNoaWxkcmVuLnB1c2godGhpcy5nZW5EaXZpZGVyKGl0ZW0pKVxuICAgICAgZWxzZSBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuVGlsZSh7IGl0ZW0sIGluZGV4IH0pKVxuICAgIH1cblxuICAgIGNoaWxkcmVuLmxlbmd0aCB8fCBjaGlsZHJlbi5wdXNoKHRoaXMuJHNsb3RzWyduby1kYXRhJ10gfHwgdGhpcy5zdGF0aWNOb0RhdGFUaWxlKVxuXG4gICAgdGhpcy4kc2xvdHNbJ3ByZXBlbmQtaXRlbSddICYmIGNoaWxkcmVuLnVuc2hpZnQodGhpcy4kc2xvdHNbJ3ByZXBlbmQtaXRlbSddKVxuXG4gICAgdGhpcy4kc2xvdHNbJ2FwcGVuZC1pdGVtJ10gJiYgY2hpbGRyZW4ucHVzaCh0aGlzLiRzbG90c1snYXBwZW5kLWl0ZW0nXSlcblxuICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZMaXN0LCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3Ytc2VsZWN0LWxpc3QnLFxuICAgICAgY2xhc3M6IHRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcm9sZTogJ2xpc3Rib3gnLFxuICAgICAgICB0YWJpbmRleDogLTEsXG4gICAgICB9LFxuICAgICAgcHJvcHM6IHsgZGVuc2U6IHRoaXMuZGVuc2UgfSxcbiAgICB9LCBjaGlsZHJlbilcbiAgfSxcbn0pXG4iXX0=