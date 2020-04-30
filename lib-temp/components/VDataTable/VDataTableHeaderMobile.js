import mixins from '../../util/mixins';
import VSelect from '../VSelect/VSelect';
import VChip from '../VChip';
import header from './mixins/header';
import { wrapInArray } from '../../util/helpers';
export default mixins(header).extend({
    name: 'v-data-table-header-mobile',
    props: {
        sortByText: {
            type: String,
            default: '$vuetify.dataTable.sortBy',
        },
    },
    methods: {
        genSortChip(props) {
            const children = [props.item.text];
            const sortIndex = this.options.sortBy.findIndex(k => k === props.item.value);
            const beingSorted = sortIndex >= 0;
            const isDesc = this.options.sortDesc[sortIndex];
            children.push(this.$createElement('div', {
                staticClass: 'v-chip__close',
                class: {
                    sortable: true,
                    active: beingSorted,
                    asc: beingSorted && !isDesc,
                    desc: beingSorted && isDesc,
                },
            }, [this.genSortIcon()]));
            return this.$createElement(VChip, {
                staticClass: 'sortable',
                nativeOn: {
                    click: (e) => {
                        e.stopPropagation();
                        this.$emit('sort', props.item.value);
                    },
                },
            }, children);
        },
        genSortSelect(items) {
            return this.$createElement(VSelect, {
                props: {
                    label: this.$vuetify.lang.t(this.sortByText),
                    items,
                    hideDetails: true,
                    multiple: this.options.multiSort,
                    value: this.options.multiSort ? this.options.sortBy : this.options.sortBy[0],
                },
                on: {
                    change: (v) => this.$emit('sort', v),
                },
                scopedSlots: {
                    selection: props => this.genSortChip(props),
                },
            });
        },
    },
    render(h) {
        const children = [];
        const header = this.headers.find(h => h.value === 'data-table-select');
        if (header && !this.singleSelect) {
            children.push(this.$createElement('div', {
                class: [
                    'v-data-table-header-mobile__select',
                    ...wrapInArray(header.class),
                ],
                attrs: {
                    width: header.width,
                },
            }, [this.genSelectAll()]));
        }
        const sortHeaders = this.headers.filter(h => h.sortable !== false && h.value !== 'data-table-select');
        if (!this.disableSort && sortHeaders.length) {
            children.push(this.genSortSelect(sortHeaders));
        }
        const th = h('th', [h('div', { staticClass: 'v-data-table-header-mobile__wrapper' }, children)]);
        const tr = h('tr', [th]);
        return h('thead', {
            staticClass: 'v-data-table-header v-data-table-header-mobile',
        }, [tr]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRhdGFUYWJsZUhlYWRlck1vYmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZEYXRhVGFibGUvVkRhdGFUYWJsZUhlYWRlck1vYmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQTtBQUN4QyxPQUFPLEtBQUssTUFBTSxVQUFVLENBQUE7QUFDNUIsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUE7QUFDcEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBR2hELGVBQWUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNuQyxJQUFJLEVBQUUsNEJBQTRCO0lBRWxDLEtBQUssRUFBRTtRQUNMLFVBQVUsRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLDJCQUEyQjtTQUNyQztLQUNGO0lBRUQsT0FBTyxFQUFFO1FBQ1AsV0FBVyxDQUFFLEtBQVU7WUFDckIsTUFBTSxRQUFRLEdBQStCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUU5RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUM1RSxNQUFNLFdBQVcsR0FBRyxTQUFTLElBQUksQ0FBQyxDQUFBO1lBQ2xDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBRS9DLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3ZDLFdBQVcsRUFBRSxlQUFlO2dCQUM1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LENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLFdBQVcsRUFBRSxxQ0FBcUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUVoRyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUV4QixPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUU7WUFDaEIsV0FBVyxFQUFFLGdEQUFnRDtTQUM5RCxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNWLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWTm9kZSwgVk5vZGVDaGlsZHJlbkFycmF5Q29udGVudHMgfSBmcm9tICd2dWUnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IFZTZWxlY3QgZnJvbSAnLi4vVlNlbGVjdC9WU2VsZWN0J1xuaW1wb3J0IFZDaGlwIGZyb20gJy4uL1ZDaGlwJ1xuaW1wb3J0IGhlYWRlciBmcm9tICcuL21peGlucy9oZWFkZXInXG5pbXBvcnQgeyB3cmFwSW5BcnJheSB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCB7IERhdGFUYWJsZUhlYWRlciB9IGZyb20gJ3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoaGVhZGVyKS5leHRlbmQoe1xuICBuYW1lOiAndi1kYXRhLXRhYmxlLWhlYWRlci1tb2JpbGUnLFxuXG4gIHByb3BzOiB7XG4gICAgc29ydEJ5VGV4dDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyR2dWV0aWZ5LmRhdGFUYWJsZS5zb3J0QnknLFxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlblNvcnRDaGlwIChwcm9wczogYW55KSB7XG4gICAgICBjb25zdCBjaGlsZHJlbjogVk5vZGVDaGlsZHJlbkFycmF5Q29udGVudHMgPSBbcHJvcHMuaXRlbS50ZXh0XVxuXG4gICAgICBjb25zdCBzb3J0SW5kZXggPSB0aGlzLm9wdGlvbnMuc29ydEJ5LmZpbmRJbmRleChrID0+IGsgPT09IHByb3BzLml0ZW0udmFsdWUpXG4gICAgICBjb25zdCBiZWluZ1NvcnRlZCA9IHNvcnRJbmRleCA+PSAwXG4gICAgICBjb25zdCBpc0Rlc2MgPSB0aGlzLm9wdGlvbnMuc29ydERlc2Nbc29ydEluZGV4XVxuXG4gICAgICBjaGlsZHJlbi5wdXNoKHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNoaXBfX2Nsb3NlJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICBhY3RpdmU6IGJlaW5nU29ydGVkLFxuICAgICAgICAgIGFzYzogYmVpbmdTb3J0ZWQgJiYgIWlzRGVzYyxcbiAgICAgICAgICBkZXNjOiBiZWluZ1NvcnRlZCAmJiBpc0Rlc2MsXG4gICAgICAgIH0sXG4gICAgICB9LCBbdGhpcy5nZW5Tb3J0SWNvbigpXSkpXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZDaGlwLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAnc29ydGFibGUnLFxuICAgICAgICBuYXRpdmVPbjoge1xuICAgICAgICAgIGNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgdGhpcy4kZW1pdCgnc29ydCcsIHByb3BzLml0ZW0udmFsdWUpXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuU29ydFNlbGVjdCAoaXRlbXM6IGFueVtdKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWU2VsZWN0LCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgbGFiZWw6IHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMuc29ydEJ5VGV4dCksXG4gICAgICAgICAgaXRlbXMsXG4gICAgICAgICAgaGlkZURldGFpbHM6IHRydWUsXG4gICAgICAgICAgbXVsdGlwbGU6IHRoaXMub3B0aW9ucy5tdWx0aVNvcnQsXG4gICAgICAgICAgdmFsdWU6IHRoaXMub3B0aW9ucy5tdWx0aVNvcnQgPyB0aGlzLm9wdGlvbnMuc29ydEJ5IDogdGhpcy5vcHRpb25zLnNvcnRCeVswXSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjaGFuZ2U6ICh2OiBzdHJpbmcgfCBzdHJpbmdbXSkgPT4gdGhpcy4kZW1pdCgnc29ydCcsIHYpLFxuICAgICAgICB9LFxuICAgICAgICBzY29wZWRTbG90czoge1xuICAgICAgICAgIHNlbGVjdGlvbjogcHJvcHMgPT4gdGhpcy5nZW5Tb3J0Q2hpcChwcm9wcykgYXMgYW55LCAvLyBUT0RPOiB3aHl5eT9cbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgY2hpbGRyZW46IFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzID0gW11cblxuICAgIGNvbnN0IGhlYWRlciA9IHRoaXMuaGVhZGVycy5maW5kKGggPT4gaC52YWx1ZSA9PT0gJ2RhdGEtdGFibGUtc2VsZWN0JylcbiAgICBpZiAoaGVhZGVyICYmICF0aGlzLnNpbmdsZVNlbGVjdCkge1xuICAgICAgY2hpbGRyZW4ucHVzaCh0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGNsYXNzOiBbXG4gICAgICAgICAgJ3YtZGF0YS10YWJsZS1oZWFkZXItbW9iaWxlX19zZWxlY3QnLFxuICAgICAgICAgIC4uLndyYXBJbkFycmF5KGhlYWRlci5jbGFzcyksXG4gICAgICAgIF0sXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgd2lkdGg6IGhlYWRlci53aWR0aCxcbiAgICAgICAgfSxcbiAgICAgIH0sIFt0aGlzLmdlblNlbGVjdEFsbCgpXSkpXG4gICAgfVxuXG4gICAgY29uc3Qgc29ydEhlYWRlcnM6IERhdGFUYWJsZUhlYWRlcltdID0gdGhpcy5oZWFkZXJzLmZpbHRlcihoID0+IGguc29ydGFibGUgIT09IGZhbHNlICYmIGgudmFsdWUgIT09ICdkYXRhLXRhYmxlLXNlbGVjdCcpXG4gICAgaWYgKCF0aGlzLmRpc2FibGVTb3J0ICYmIHNvcnRIZWFkZXJzLmxlbmd0aCkge1xuICAgICAgY2hpbGRyZW4ucHVzaCh0aGlzLmdlblNvcnRTZWxlY3Qoc29ydEhlYWRlcnMpKVxuICAgIH1cblxuICAgIGNvbnN0IHRoID0gaCgndGgnLCBbaCgnZGl2JywgeyBzdGF0aWNDbGFzczogJ3YtZGF0YS10YWJsZS1oZWFkZXItbW9iaWxlX193cmFwcGVyJyB9LCBjaGlsZHJlbildKVxuXG4gICAgY29uc3QgdHIgPSBoKCd0cicsIFt0aF0pXG5cbiAgICByZXR1cm4gaCgndGhlYWQnLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtZGF0YS10YWJsZS1oZWFkZXIgdi1kYXRhLXRhYmxlLWhlYWRlci1tb2JpbGUnLFxuICAgIH0sIFt0cl0pXG4gIH0sXG59KVxuIl19