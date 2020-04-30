import VIcon from '../../VIcon';
import VSimpleCheckbox from '../../VCheckbox/VSimpleCheckbox';
import ripple from '../../../directives/ripple';
import mixins from '../../../util/mixins';
export default mixins().extend({
    // https://github.com/vuejs/vue/issues/6872
    directives: {
        ripple,
    },
    props: {
        headers: {
            type: Array,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({
                page: 1,
                itemsPerPage: 10,
                sortBy: [],
                sortDesc: [],
                groupBy: [],
                groupDesc: [],
                multiSort: false,
                mustSort: false,
            }),
        },
        sortIcon: {
            type: String,
            default: '$sort',
        },
        everyItem: Boolean,
        someItems: Boolean,
        showGroupBy: Boolean,
        singleSelect: Boolean,
        disableSort: Boolean,
    },
    methods: {
        genSelectAll() {
            const data = {
                props: {
                    value: this.everyItem,
                    indeterminate: !this.everyItem && this.someItems,
                },
                on: {
                    input: (v) => this.$emit('toggle-select-all', v),
                },
            };
            if (this.$scopedSlots['data-table-select']) {
                return this.$scopedSlots['data-table-select'](data);
            }
            return this.$createElement(VSimpleCheckbox, {
                staticClass: 'v-data-table__checkbox',
                ...data,
            });
        },
        genSortIcon() {
            return this.$createElement(VIcon, {
                staticClass: 'v-data-table-header__icon',
                props: {
                    size: 18,
                },
            }, [this.sortIcon]);
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkRhdGFUYWJsZS9taXhpbnMvaGVhZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sS0FBSyxNQUFNLGFBQWEsQ0FBQTtBQUMvQixPQUFPLGVBQWUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUM3RCxPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUcvQyxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQVN6QyxlQUFlLE1BQU0sRUFBVyxDQUFDLE1BQU0sQ0FBQztJQUN0QywyQ0FBMkM7SUFDM0MsVUFBVSxFQUFFO1FBQ1YsTUFBTTtLQUNQO0lBRUQsS0FBSyxFQUFFO1FBQ0wsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLEtBQW9DO1lBQzFDLFFBQVEsRUFBRSxJQUFJO1NBQ2Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsTUFBK0I7WUFDckMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ2QsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsWUFBWSxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sRUFBRSxFQUFFO2dCQUNWLFFBQVEsRUFBRSxFQUFFO2dCQUNaLE9BQU8sRUFBRSxFQUFFO2dCQUNYLFNBQVMsRUFBRSxFQUFFO2dCQUNiLFNBQVMsRUFBRSxLQUFLO2dCQUNoQixRQUFRLEVBQUUsS0FBSzthQUNoQixDQUFDO1NBQ0g7UUFDRCxRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxPQUFPO1NBQ2pCO1FBQ0QsU0FBUyxFQUFFLE9BQU87UUFDbEIsU0FBUyxFQUFFLE9BQU87UUFDbEIsV0FBVyxFQUFFLE9BQU87UUFDcEIsWUFBWSxFQUFFLE9BQU87UUFDckIsV0FBVyxFQUFFLE9BQU87S0FDckI7SUFFRCxPQUFPLEVBQUU7UUFDUCxZQUFZO1lBQ1YsTUFBTSxJQUFJLEdBQUc7Z0JBQ1gsS0FBSyxFQUFFO29CQUNMLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUztvQkFDckIsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUztpQkFDakQ7Z0JBQ0QsRUFBRSxFQUFFO29CQUNGLEtBQUssRUFBRSxDQUFDLENBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7aUJBQzFEO2FBQ0YsQ0FBQTtZQUVELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO2dCQUMxQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQTthQUNyRDtZQUVELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUU7Z0JBQzFDLFdBQVcsRUFBRSx3QkFBd0I7Z0JBQ3JDLEdBQUcsSUFBSTthQUNSLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxXQUFXO1lBQ1QsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRTtnQkFDaEMsV0FBVyxFQUFFLDJCQUEyQjtnQkFDeEMsS0FBSyxFQUFFO29CQUNMLElBQUksRUFBRSxFQUFFO2lCQUNUO2FBQ0YsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO1FBQ3JCLENBQUM7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFZEYXRhVGFibGUgfSBmcm9tICcuLi8nXG5pbXBvcnQgVkljb24gZnJvbSAnLi4vLi4vVkljb24nXG5pbXBvcnQgVlNpbXBsZUNoZWNrYm94IGZyb20gJy4uLy4uL1ZDaGVja2JveC9WU2ltcGxlQ2hlY2tib3gnXG5pbXBvcnQgcmlwcGxlIGZyb20gJy4uLy4uLy4uL2RpcmVjdGl2ZXMvcmlwcGxlJ1xuXG5pbXBvcnQgVnVlLCB7IFByb3BUeXBlIH0gZnJvbSAndnVlJ1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IERhdGFPcHRpb25zLCBEYXRhVGFibGVIZWFkZXIgfSBmcm9tICd0eXBlcydcblxudHlwZSBWRGF0YVRhYmxlSW5zdGFuY2UgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIFZEYXRhVGFibGU+XG5cbmludGVyZmFjZSBvcHRpb25zIGV4dGVuZHMgVnVlIHtcbiAgZGF0YVRhYmxlOiBWRGF0YVRhYmxlSW5zdGFuY2Vcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWl4aW5zPG9wdGlvbnM+KCkuZXh0ZW5kKHtcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS9pc3N1ZXMvNjg3MlxuICBkaXJlY3RpdmVzOiB7XG4gICAgcmlwcGxlLFxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgaGVhZGVyczoge1xuICAgICAgdHlwZTogQXJyYXkgYXMgUHJvcFR5cGU8RGF0YVRhYmxlSGVhZGVyW10+LFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICBvcHRpb25zOiB7XG4gICAgICB0eXBlOiBPYmplY3QgYXMgUHJvcFR5cGU8RGF0YU9wdGlvbnM+LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKHtcbiAgICAgICAgcGFnZTogMSxcbiAgICAgICAgaXRlbXNQZXJQYWdlOiAxMCxcbiAgICAgICAgc29ydEJ5OiBbXSxcbiAgICAgICAgc29ydERlc2M6IFtdLFxuICAgICAgICBncm91cEJ5OiBbXSxcbiAgICAgICAgZ3JvdXBEZXNjOiBbXSxcbiAgICAgICAgbXVsdGlTb3J0OiBmYWxzZSxcbiAgICAgICAgbXVzdFNvcnQ6IGZhbHNlLFxuICAgICAgfSksXG4gICAgfSxcbiAgICBzb3J0SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRzb3J0JyxcbiAgICB9LFxuICAgIGV2ZXJ5SXRlbTogQm9vbGVhbixcbiAgICBzb21lSXRlbXM6IEJvb2xlYW4sXG4gICAgc2hvd0dyb3VwQnk6IEJvb2xlYW4sXG4gICAgc2luZ2xlU2VsZWN0OiBCb29sZWFuLFxuICAgIGRpc2FibGVTb3J0OiBCb29sZWFuLFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBnZW5TZWxlY3RBbGwgKCkge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5ldmVyeUl0ZW0sXG4gICAgICAgICAgaW5kZXRlcm1pbmF0ZTogIXRoaXMuZXZlcnlJdGVtICYmIHRoaXMuc29tZUl0ZW1zLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGlucHV0OiAodjogYm9vbGVhbikgPT4gdGhpcy4kZW1pdCgndG9nZ2xlLXNlbGVjdC1hbGwnLCB2KSxcbiAgICAgICAgfSxcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuJHNjb3BlZFNsb3RzWydkYXRhLXRhYmxlLXNlbGVjdCddKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRzY29wZWRTbG90c1snZGF0YS10YWJsZS1zZWxlY3QnXSEoZGF0YSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVlNpbXBsZUNoZWNrYm94LCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1kYXRhLXRhYmxlX19jaGVja2JveCcsXG4gICAgICAgIC4uLmRhdGEsXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuU29ydEljb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkljb24sIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWRhdGEtdGFibGUtaGVhZGVyX19pY29uJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBzaXplOiAxOCxcbiAgICAgICAgfSxcbiAgICAgIH0sIFt0aGlzLnNvcnRJY29uXSlcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==