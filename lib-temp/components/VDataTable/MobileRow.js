import Vue from 'vue';
import { getObjectValueByPath } from '../../util/helpers';
export default Vue.extend({
    name: 'row',
    functional: true,
    props: {
        headers: Array,
        item: Object,
        rtl: Boolean,
    },
    render(h, { props, slots, data }) {
        const computedSlots = slots();
        const columns = props.headers.map((header) => {
            const classes = {
                'v-data-table__mobile-row': true,
            };
            const children = [];
            const value = getObjectValueByPath(props.item, header.value);
            const slotName = header.value;
            const scopedSlot = data.scopedSlots && data.scopedSlots[slotName];
            const regularSlot = computedSlots[slotName];
            if (scopedSlot) {
                children.push(scopedSlot({ item: props.item, header, value }));
            }
            else if (regularSlot) {
                children.push(regularSlot);
            }
            else {
                children.push(value == null ? value : String(value));
            }
            const mobileRowChildren = [
                h('div', {
                    staticClass: 'v-data-table__mobile-row__cell',
                }, children),
            ];
            if (header.value !== 'dataTableSelect') {
                mobileRowChildren.unshift(h('div', {
                    staticClass: 'v-data-table__mobile-row__header',
                }, [header.text]));
            }
            return h('td', { class: classes }, mobileRowChildren);
        });
        return h('tr', { ...data, staticClass: 'v-data-table__mobile-table-row' }, columns);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9iaWxlUm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkRhdGFUYWJsZS9Nb2JpbGVSb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxHQUF3QixNQUFNLEtBQUssQ0FBQTtBQUMxQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUd6RCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDeEIsSUFBSSxFQUFFLEtBQUs7SUFFWCxVQUFVLEVBQUUsSUFBSTtJQUVoQixLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUUsS0FBb0M7UUFDN0MsSUFBSSxFQUFFLE1BQU07UUFDWixHQUFHLEVBQUUsT0FBTztLQUNiO0lBRUQsTUFBTSxDQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQy9CLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxDQUFBO1FBRTdCLE1BQU0sT0FBTyxHQUFZLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBdUIsRUFBRSxFQUFFO1lBQ3JFLE1BQU0sT0FBTyxHQUFHO2dCQUNkLDBCQUEwQixFQUFFLElBQUk7YUFDakMsQ0FBQTtZQUVELE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQTtZQUNuQixNQUFNLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUU1RCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFBO1lBQzdCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNqRSxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUE7WUFFM0MsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFBO2FBQy9EO2lCQUFNLElBQUksV0FBVyxFQUFFO2dCQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO2FBQzNCO2lCQUFNO2dCQUNMLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTthQUNyRDtZQUVELE1BQU0saUJBQWlCLEdBQUc7Z0JBQ3hCLENBQUMsQ0FBQyxLQUFLLEVBQUU7b0JBQ1AsV0FBVyxFQUFFLGdDQUFnQztpQkFDOUMsRUFBRSxRQUFRLENBQUM7YUFDYixDQUFBO1lBRUQsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLGlCQUFpQixFQUFFO2dCQUN0QyxpQkFBaUIsQ0FBQyxPQUFPLENBQ3ZCLENBQUMsQ0FBQyxLQUFLLEVBQUU7b0JBQ1AsV0FBVyxFQUFFLGtDQUFrQztpQkFDaEQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUNsQixDQUFBO2FBQ0Y7WUFFRCxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtRQUN2RCxDQUFDLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFLFdBQVcsRUFBRSxnQ0FBZ0MsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3JGLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVnVlLCB7IFZOb2RlLCBQcm9wVHlwZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IGdldE9iamVjdFZhbHVlQnlQYXRoIH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgRGF0YVRhYmxlSGVhZGVyIH0gZnJvbSAndHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IFZ1ZS5leHRlbmQoe1xuICBuYW1lOiAncm93JyxcblxuICBmdW5jdGlvbmFsOiB0cnVlLFxuXG4gIHByb3BzOiB7XG4gICAgaGVhZGVyczogQXJyYXkgYXMgUHJvcFR5cGU8RGF0YVRhYmxlSGVhZGVyW10+LFxuICAgIGl0ZW06IE9iamVjdCxcbiAgICBydGw6IEJvb2xlYW4sXG4gIH0sXG5cbiAgcmVuZGVyIChoLCB7IHByb3BzLCBzbG90cywgZGF0YSB9KTogVk5vZGUge1xuICAgIGNvbnN0IGNvbXB1dGVkU2xvdHMgPSBzbG90cygpXG5cbiAgICBjb25zdCBjb2x1bW5zOiBWTm9kZVtdID0gcHJvcHMuaGVhZGVycy5tYXAoKGhlYWRlcjogRGF0YVRhYmxlSGVhZGVyKSA9PiB7XG4gICAgICBjb25zdCBjbGFzc2VzID0ge1xuICAgICAgICAndi1kYXRhLXRhYmxlX19tb2JpbGUtcm93JzogdHJ1ZSxcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBbXVxuICAgICAgY29uc3QgdmFsdWUgPSBnZXRPYmplY3RWYWx1ZUJ5UGF0aChwcm9wcy5pdGVtLCBoZWFkZXIudmFsdWUpXG5cbiAgICAgIGNvbnN0IHNsb3ROYW1lID0gaGVhZGVyLnZhbHVlXG4gICAgICBjb25zdCBzY29wZWRTbG90ID0gZGF0YS5zY29wZWRTbG90cyAmJiBkYXRhLnNjb3BlZFNsb3RzW3Nsb3ROYW1lXVxuICAgICAgY29uc3QgcmVndWxhclNsb3QgPSBjb21wdXRlZFNsb3RzW3Nsb3ROYW1lXVxuXG4gICAgICBpZiAoc2NvcGVkU2xvdCkge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKHNjb3BlZFNsb3QoeyBpdGVtOiBwcm9wcy5pdGVtLCBoZWFkZXIsIHZhbHVlIH0pKVxuICAgICAgfSBlbHNlIGlmIChyZWd1bGFyU2xvdCkge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKHJlZ3VsYXJTbG90KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCh2YWx1ZSA9PSBudWxsID8gdmFsdWUgOiBTdHJpbmcodmFsdWUpKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBtb2JpbGVSb3dDaGlsZHJlbiA9IFtcbiAgICAgICAgaCgnZGl2Jywge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1kYXRhLXRhYmxlX19tb2JpbGUtcm93X19jZWxsJyxcbiAgICAgICAgfSwgY2hpbGRyZW4pLFxuICAgICAgXVxuXG4gICAgICBpZiAoaGVhZGVyLnZhbHVlICE9PSAnZGF0YVRhYmxlU2VsZWN0Jykge1xuICAgICAgICBtb2JpbGVSb3dDaGlsZHJlbi51bnNoaWZ0KFxuICAgICAgICAgIGgoJ2RpdicsIHtcbiAgICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1kYXRhLXRhYmxlX19tb2JpbGUtcm93X19oZWFkZXInLFxuICAgICAgICAgIH0sIFtoZWFkZXIudGV4dF0pXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGgoJ3RkJywgeyBjbGFzczogY2xhc3NlcyB9LCBtb2JpbGVSb3dDaGlsZHJlbilcbiAgICB9KVxuXG4gICAgcmV0dXJuIGgoJ3RyJywgeyAuLi5kYXRhLCBzdGF0aWNDbGFzczogJ3YtZGF0YS10YWJsZV9fbW9iaWxlLXRhYmxlLXJvdycgfSwgY29sdW1ucylcbiAgfSxcbn0pXG4iXX0=