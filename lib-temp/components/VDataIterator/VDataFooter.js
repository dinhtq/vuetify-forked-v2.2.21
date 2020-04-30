import './VDataFooter.sass';
// Components
import VSelect from '../VSelect/VSelect';
import VIcon from '../VIcon';
import VBtn from '../VBtn';
// Types
import Vue from 'vue';
export default Vue.extend({
    name: 'v-data-footer',
    props: {
        options: {
            type: Object,
            required: true,
        },
        pagination: {
            type: Object,
            required: true,
        },
        itemsPerPageOptions: {
            type: Array,
            default: () => ([5, 10, 15, -1]),
        },
        prevIcon: {
            type: String,
            default: '$prev',
        },
        nextIcon: {
            type: String,
            default: '$next',
        },
        firstIcon: {
            type: String,
            default: '$first',
        },
        lastIcon: {
            type: String,
            default: '$last',
        },
        itemsPerPageText: {
            type: String,
            default: '$vuetify.dataFooter.itemsPerPageText',
        },
        itemsPerPageAllText: {
            type: String,
            default: '$vuetify.dataFooter.itemsPerPageAll',
        },
        showFirstLastPage: Boolean,
        showCurrentPage: Boolean,
        disablePagination: Boolean,
        disableItemsPerPage: Boolean,
        pageText: {
            type: String,
            default: '$vuetify.dataFooter.pageText',
        },
    },
    computed: {
        disableNextPageIcon() {
            return this.options.itemsPerPage <= 0 ||
                this.options.page * this.options.itemsPerPage >= this.pagination.itemsLength ||
                this.pagination.pageStop < 0;
        },
        computedDataItemsPerPageOptions() {
            return this.itemsPerPageOptions.map(option => {
                if (typeof option === 'object')
                    return option;
                else
                    return this.genDataItemsPerPageOption(option);
            });
        },
    },
    methods: {
        updateOptions(obj) {
            this.$emit('update:options', Object.assign({}, this.options, obj));
        },
        onFirstPage() {
            this.updateOptions({ page: 1 });
        },
        onPreviousPage() {
            this.updateOptions({ page: this.options.page - 1 });
        },
        onNextPage() {
            this.updateOptions({ page: this.options.page + 1 });
        },
        onLastPage() {
            this.updateOptions({ page: this.pagination.pageCount });
        },
        onChangeItemsPerPage(itemsPerPage) {
            this.updateOptions({ itemsPerPage, page: 1 });
        },
        genDataItemsPerPageOption(option) {
            return {
                text: option === -1 ? this.$vuetify.lang.t(this.itemsPerPageAllText) : String(option),
                value: option,
            };
        },
        genItemsPerPageSelect() {
            let value = this.options.itemsPerPage;
            const computedIPPO = this.computedDataItemsPerPageOptions;
            if (computedIPPO.length <= 1)
                return null;
            if (!computedIPPO.find(ippo => ippo.value === value))
                value = computedIPPO[0];
            return this.$createElement('div', {
                staticClass: 'v-data-footer__select',
            }, [
                this.$vuetify.lang.t(this.itemsPerPageText),
                this.$createElement(VSelect, {
                    attrs: {
                        'aria-label': this.itemsPerPageText,
                    },
                    props: {
                        disabled: this.disableItemsPerPage,
                        items: computedIPPO,
                        value,
                        hideDetails: true,
                        auto: true,
                        minWidth: '75px',
                    },
                    on: {
                        input: this.onChangeItemsPerPage,
                    },
                }),
            ]);
        },
        genPaginationInfo() {
            let children = ['–'];
            if (this.pagination.itemsLength && this.pagination.itemsPerPage) {
                const itemsLength = this.pagination.itemsLength;
                const pageStart = this.pagination.pageStart + 1;
                const pageStop = itemsLength < this.pagination.pageStop || this.pagination.pageStop < 0
                    ? itemsLength
                    : this.pagination.pageStop;
                children = this.$scopedSlots['page-text']
                    ? [this.$scopedSlots['page-text']({ pageStart, pageStop, itemsLength })]
                    : [this.$vuetify.lang.t(this.pageText, pageStart, pageStop, itemsLength)];
            }
            return this.$createElement('div', {
                class: 'v-data-footer__pagination',
            }, children);
        },
        genIcon(click, disabled, label, icon) {
            return this.$createElement(VBtn, {
                props: {
                    disabled: disabled || this.disablePagination,
                    icon: true,
                    text: true,
                },
                on: {
                    click,
                },
                attrs: {
                    'aria-label': label,
                },
            }, [this.$createElement(VIcon, icon)]);
        },
        genIcons() {
            const before = [];
            const after = [];
            before.push(this.genIcon(this.onPreviousPage, this.options.page === 1, this.$vuetify.lang.t('$vuetify.dataFooter.prevPage'), this.$vuetify.rtl ? this.nextIcon : this.prevIcon));
            after.push(this.genIcon(this.onNextPage, this.disableNextPageIcon, this.$vuetify.lang.t('$vuetify.dataFooter.nextPage'), this.$vuetify.rtl ? this.prevIcon : this.nextIcon));
            if (this.showFirstLastPage) {
                before.unshift(this.genIcon(this.onFirstPage, this.options.page === 1, this.$vuetify.lang.t('$vuetify.dataFooter.firstPage'), this.$vuetify.rtl ? this.lastIcon : this.firstIcon));
                after.push(this.genIcon(this.onLastPage, this.options.page >= this.pagination.pageCount || this.options.itemsPerPage === -1, this.$vuetify.lang.t('$vuetify.dataFooter.lastPage'), this.$vuetify.rtl ? this.firstIcon : this.lastIcon));
            }
            return [
                this.$createElement('div', {
                    staticClass: 'v-data-footer__icons-before',
                }, before),
                this.showCurrentPage && this.$createElement('span', [this.options.page.toString()]),
                this.$createElement('div', {
                    staticClass: 'v-data-footer__icons-after',
                }, after),
            ];
        },
    },
    render() {
        return this.$createElement('div', {
            staticClass: 'v-data-footer',
        }, [
            this.genItemsPerPageSelect(),
            this.genPaginationInfo(),
            this.genIcons(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRhdGFGb290ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WRGF0YUl0ZXJhdG9yL1ZEYXRhRm9vdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sb0JBQW9CLENBQUE7QUFFM0IsYUFBYTtBQUNiLE9BQU8sT0FBTyxNQUFNLG9CQUFvQixDQUFBO0FBQ3hDLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUM1QixPQUFPLElBQUksTUFBTSxTQUFTLENBQUE7QUFFMUIsUUFBUTtBQUNSLE9BQU8sR0FBb0QsTUFBTSxLQUFLLENBQUE7QUFJdEUsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxlQUFlO0lBRXJCLEtBQUssRUFBRTtRQUNMLE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSxNQUErQjtZQUNyQyxRQUFRLEVBQUUsSUFBSTtTQUNmO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQWtDO1lBQ3hDLFFBQVEsRUFBRSxJQUFJO1NBQ2Y7UUFDRCxtQkFBbUIsRUFBRTtZQUNuQixJQUFJLEVBQUUsS0FBSztZQUNYLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNVO1FBQzVDLFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLE9BQU87U0FDakI7UUFDRCxRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxPQUFPO1NBQ2pCO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsUUFBUTtTQUNsQjtRQUNELFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLE9BQU87U0FDakI7UUFDRCxnQkFBZ0IsRUFBRTtZ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VUFBVSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUMsRUFDbEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLEVBQ3BELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUNuRCxDQUFDLENBQUE7YUFDSDtZQUVELE9BQU87Z0JBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7b0JBQ3pCLFdBQVcsRUFBRSw2QkFBNkI7aUJBQzNDLEVBQUUsTUFBTSxDQUFDO2dCQUNWLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRTtvQkFDekIsV0FBVyxFQUFFLDRCQUE0QjtpQkFDMUMsRUFBRSxLQUFLLENBQUM7YUFDVixDQUFBO1FBQ0gsQ0FBQztLQUNGO0lBRUQsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7WUFDaEMsV0FBVyxFQUFFLGVBQWU7U0FDN0IsRUFBRTtZQUNELElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUM1QixJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDeEIsSUFBSSxDQUFDLFFBQVEsRUFBRTtTQUNoQixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL1ZEYXRhRm9vdGVyLnNhc3MnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWU2VsZWN0IGZyb20gJy4uL1ZTZWxlY3QvVlNlbGVjdCdcbmltcG9ydCBWSWNvbiBmcm9tICcuLi9WSWNvbidcbmltcG9ydCBWQnRuIGZyb20gJy4uL1ZCdG4nXG5cbi8vIFR5cGVzXG5pbXBvcnQgVnVlLCB7IFZOb2RlLCBWTm9kZUNoaWxkcmVuQXJyYXlDb250ZW50cywgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBEYXRhUGFnaW5hdGlvbiwgRGF0YU9wdGlvbnMsIERhdGFJdGVtc1BlclBhZ2VPcHRpb24gfSBmcm9tICd0eXBlcydcbmltcG9ydCB7IFByb3BWYWxpZGF0b3IgfSBmcm9tICd2dWUvdHlwZXMvb3B0aW9ucydcblxuZXhwb3J0IGRlZmF1bHQgVnVlLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWRhdGEtZm9vdGVyJyxcblxuICBwcm9wczoge1xuICAgIG9wdGlvbnM6IHtcbiAgICAgIHR5cGU6IE9iamVjdCBhcyBQcm9wVHlwZTxEYXRhT3B0aW9ucz4sXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIHBhZ2luYXRpb246IHtcbiAgICAgIHR5cGU6IE9iamVjdCBhcyBQcm9wVHlwZTxEYXRhUGFnaW5hdGlvbj4sXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICAgIGl0ZW1zUGVyUGFnZU9wdGlvbnM6IHtcbiAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKFs1LCAxMCwgMTUsIC0xXSksXG4gICAgfSBhcyBQcm9wVmFsaWRhdG9yPERhdGFJdGVtc1BlclBhZ2VPcHRpb25bXT4sXG4gICAgcHJldkljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckcHJldicsXG4gICAgfSxcbiAgICBuZXh0SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRuZXh0JyxcbiAgICB9LFxuICAgIGZpcnN0SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRmaXJzdCcsXG4gICAgfSxcbiAgICBsYXN0SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRsYXN0JyxcbiAgICB9LFxuICAgIGl0ZW1zUGVyUGFnZVRleHQ6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckdnVldGlmeS5kYXRhRm9vdGVyLml0ZW1zUGVyUGFnZVRleHQnLFxuICAgIH0sXG4gICAgaXRlbXNQZXJQYWdlQWxsVGV4dDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyR2dWV0aWZ5LmRhdGFGb290ZXIuaXRlbXNQZXJQYWdlQWxsJyxcbiAgICB9LFxuICAgIHNob3dGaXJzdExhc3RQYWdlOiBCb29sZWFuLFxuICAgIHNob3dDdXJyZW50UGFnZTogQm9vbGVhbixcbiAgICBkaXNhYmxlUGFnaW5hdGlvbjogQm9vbGVhbixcbiAgICBkaXNhYmxlSXRlbXNQZXJQYWdlOiBCb29sZWFuLFxuICAgIHBhZ2VUZXh0OiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkuZGF0YUZvb3Rlci5wYWdlVGV4dCcsXG4gICAgfSxcbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGRpc2FibGVOZXh0UGFnZUljb24gKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5pdGVtc1BlclBhZ2UgPD0gMCB8fFxuICAgICAgICB0aGlzLm9wdGlvbnMucGFnZSAqIHRoaXMub3B0aW9ucy5pdGVtc1BlclBhZ2UgPj0gdGhpcy5wYWdpbmF0aW9uLml0ZW1zTGVuZ3RoIHx8XG4gICAgICAgIHRoaXMucGFnaW5hdGlvbi5wYWdlU3RvcCA8IDBcbiAgICB9LFxuICAgIGNvbXB1dGVkRGF0YUl0ZW1zUGVyUGFnZU9wdGlvbnMgKCk6IGFueVtdIHtcbiAgICAgIHJldHVybiB0aGlzLml0ZW1zUGVyUGFnZU9wdGlvbnMubWFwKG9wdGlvbiA9PiB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnb2JqZWN0JykgcmV0dXJuIG9wdGlvblxuICAgICAgICBlbHNlIHJldHVybiB0aGlzLmdlbkRhdGFJdGVtc1BlclBhZ2VPcHRpb24ob3B0aW9uKVxuICAgICAgfSlcbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICB1cGRhdGVPcHRpb25zIChvYmo6IG9iamVjdCkge1xuICAgICAgdGhpcy4kZW1pdCgndXBkYXRlOm9wdGlvbnMnLCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIG9iaikpXG4gICAgfSxcbiAgICBvbkZpcnN0UGFnZSAoKSB7XG4gICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMoeyBwYWdlOiAxIH0pXG4gICAgfSxcbiAgICBvblByZXZpb3VzUGFnZSAoKSB7XG4gICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMoeyBwYWdlOiB0aGlzLm9wdGlvbnMucGFnZSAtIDEgfSlcbiAgICB9LFxuICAgIG9uTmV4dFBhZ2UgKCkge1xuICAgICAgdGhpcy51cGRhdGVPcHRpb25zKHsgcGFnZTogdGhpcy5vcHRpb25zLnBhZ2UgKyAxIH0pXG4gICAgfSxcbiAgICBvbkxhc3RQYWdlICgpIHtcbiAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyh7IHBhZ2U6IHRoaXMucGFnaW5hdGlvbi5wYWdlQ291bnQgfSlcbiAgICB9LFxuICAgIG9uQ2hhbmdlSXRlbXNQZXJQYWdlIChpdGVtc1BlclBhZ2U6IG51bWJlcikge1xuICAgICAgdGhpcy51cGRhdGVPcHRpb25zKHsgaXRlbXNQZXJQYWdlLCBwYWdlOiAxIH0pXG4gICAgfSxcbiAgICBnZW5EYXRhSXRlbXNQZXJQYWdlT3B0aW9uIChvcHRpb246IG51bWJlcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGV4dDogb3B0aW9uID09PSAtMSA/IHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMuaXRlbXNQZXJQYWdlQWxsVGV4dCkgOiBTdHJpbmcob3B0aW9uKSxcbiAgICAgICAgdmFsdWU6IG9wdGlvbixcbiAgICAgIH1cbiAgICB9LFxuICAgIGdlbkl0ZW1zUGVyUGFnZVNlbGVjdCAoKSB7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLm9wdGlvbnMuaXRlbXNQZXJQYWdlXG4gICAgICBjb25zdCBjb21wdXRlZElQUE8gPSB0aGlzLmNvbXB1dGVkRGF0YUl0ZW1zUGVyUGFnZU9wdGlvbnNcblxuICAgICAgaWYgKGNvbXB1dGVkSVBQTy5sZW5ndGggPD0gMSkgcmV0dXJuIG51bGxcblxuICAgICAgaWYgKCFjb21wdXRlZElQUE8uZmluZChpcHBvID0+IGlwcG8udmFsdWUgPT09IHZhbHVlKSkgdmFsdWUgPSBjb21wdXRlZElQUE9bMF1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWRhdGEtZm9vdGVyX19zZWxlY3QnLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLiR2dWV0aWZ5LmxhbmcudCh0aGlzLml0ZW1zUGVyUGFnZVRleHQpLFxuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KFZTZWxlY3QsIHtcbiAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiB0aGlzLml0ZW1zUGVyUGFnZVRleHQsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZUl0ZW1zUGVyUGFnZSxcbiAgICAgICAgICAgIGl0ZW1zOiBjb21wdXRlZElQUE8sXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGhpZGVEZXRhaWxzOiB0cnVlLFxuICAgICAgICAgICAgYXV0bzogdHJ1ZSxcbiAgICAgICAgICAgIG1pbldpZHRoOiAnNzVweCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgaW5wdXQ6IHRoaXMub25DaGFuZ2VJdGVtc1BlclBhZ2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuUGFnaW5hdGlvbkluZm8gKCkge1xuICAgICAgbGV0IGNoaWxkcmVuOiBWTm9kZUNoaWxkcmVuQXJyYXlDb250ZW50cyA9IFsn4oCTJ11cblxuICAgICAgaWYgKHRoaXMucGFnaW5hdGlvbi5pdGVtc0xlbmd0aCAmJiB0aGlzLnBhZ2luYXRpb24uaXRlbXNQZXJQYWdlKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zTGVuZ3RoID0gdGhpcy5wYWdpbmF0aW9uLml0ZW1zTGVuZ3RoXG4gICAgICAgIGNvbnN0IHBhZ2VTdGFydCA9IHRoaXMucGFnaW5hdGlvbi5wYWdlU3RhcnQgKyAxXG4gICAgICAgIGNvbnN0IHBhZ2VTdG9wID0gaXRlbXNMZW5ndGggPCB0aGlzLnBhZ2luYXRpb24ucGFnZVN0b3AgfHwgdGhpcy5wYWdpbmF0aW9uLnBhZ2VTdG9wIDwgMFxuICAgICAgICAgID8gaXRlbXNMZW5ndGhcbiAgICAgICAgICA6IHRoaXMucGFnaW5hdGlvbi5wYWdlU3RvcFxuXG4gICAgICAgIGNoaWxkcmVuID0gdGhpcy4kc2NvcGVkU2xvdHNbJ3BhZ2UtdGV4dCddXG4gICAgICAgICAgPyBbdGhpcy4kc2NvcGVkU2xvdHNbJ3BhZ2UtdGV4dCddISh7IHBhZ2VTdGFydCwgcGFnZVN0b3AsIGl0ZW1zTGVuZ3RoIH0pXVxuICAgICAgICAgIDogW3RoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMucGFnZVRleHQsIHBhZ2VTdGFydCwgcGFnZVN0b3AsIGl0ZW1zTGVuZ3RoKV1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgY2xhc3M6ICd2LWRhdGEtZm9vdGVyX19wYWdpbmF0aW9uJyxcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuSWNvbiAoY2xpY2s6IEZ1bmN0aW9uLCBkaXNhYmxlZDogYm9vbGVhbiwgbGFiZWw6IHN0cmluZywgaWNvbjogc3RyaW5nKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkJ0biwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCB8fCB0aGlzLmRpc2FibGVQYWdpbmF0aW9uLFxuICAgICAgICAgIGljb246IHRydWUsXG4gICAgICAgICAgdGV4dDogdHJ1ZSxcbiAgICAgICAgICAvLyBkYXJrOiB0aGlzLmRhcmssIC8vIFRPRE86IGFkZCBtaXhpblxuICAgICAgICAgIC8vIGxpZ2h0OiB0aGlzLmxpZ2h0IC8vIFRPRE86IGFkZCBtaXhpblxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrLFxuICAgICAgICB9LFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgICdhcmlhLWxhYmVsJzogbGFiZWwsIC8vIFRPRE86IExvY2FsaXphdGlvblxuICAgICAgICB9LFxuICAgICAgfSwgW3RoaXMuJGNyZWF0ZUVsZW1lbnQoVkljb24sIGljb24pXSlcbiAgICB9LFxuICAgIGdlbkljb25zICgpIHtcbiAgICAgIGNvbnN0IGJlZm9yZTogVk5vZGVDaGlsZHJlbkFycmF5Q29udGVudHMgPSBbXVxuICAgICAgY29uc3QgYWZ0ZXI6IFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzID0gW11cblxuICAgICAgYmVmb3JlLnB1c2godGhpcy5nZW5JY29uKFxuICAgICAgICB0aGlzLm9uUHJldmlvdXNQYWdlLFxuICAgICAgICB0aGlzLm9wdGlvbnMucGFnZSA9PT0gMSxcbiAgICAgICAgdGhpcy4kdnVldGlmeS5sYW5nLnQoJyR2dWV0aWZ5LmRhdGFGb290ZXIucHJldlBhZ2UnKSxcbiAgICAgICAgdGhpcy4kdnVldGlmeS5ydGwgPyB0aGlzLm5leHRJY29uIDogdGhpcy5wcmV2SWNvblxuICAgICAgKSlcblxuICAgICAgYWZ0ZXIucHVzaCh0aGlzLmdlbkljb24oXG4gICAgICAgIHRoaXMub25OZXh0UGFnZSxcbiAgICAgICAgdGhpcy5kaXNhYmxlTmV4dFBhZ2VJY29uLFxuICAgICAgICB0aGlzLiR2dWV0aWZ5LmxhbmcudCgnJHZ1ZXRpZnkuZGF0YUZvb3Rlci5uZXh0UGFnZScpLFxuICAgICAgICB0aGlzLiR2dWV0aWZ5LnJ0bCA/IHRoaXMucHJldkljb24gOiB0aGlzLm5leHRJY29uXG4gICAgICApKVxuXG4gICAgICBpZiAodGhpcy5zaG93Rmlyc3RMYXN0UGFnZSkge1xuICAgICAgICBiZWZvcmUudW5zaGlmdCh0aGlzLmdlbkljb24oXG4gICAgICAgICAgdGhpcy5vbkZpcnN0UGFnZSxcbiAgICAgICAgICB0aGlzLm9wdGlvbnMucGFnZSA9PT0gMSxcbiAgICAgICAgICB0aGlzLiR2dWV0aWZ5LmxhbmcudCgnJHZ1ZXRpZnkuZGF0YUZvb3Rlci5maXJzdFBhZ2UnKSxcbiAgICAgICAgICB0aGlzLiR2dWV0aWZ5LnJ0bCA/IHRoaXMubGFzdEljb24gOiB0aGlzLmZpcnN0SWNvblxuICAgICAgICApKVxuXG4gICAgICAgIGFmdGVyLnB1c2godGhpcy5nZW5JY29uKFxuICAgICAgICAgIHRoaXMub25MYXN0UGFnZSxcbiAgICAgICAgICB0aGlzLm9wdGlvbnMucGFnZSA+PSB0aGlzLnBhZ2luYXRpb24ucGFnZUNvdW50IHx8IHRoaXMub3B0aW9ucy5pdGVtc1BlclBhZ2UgPT09IC0xLFxuICAgICAgICAgIHRoaXMuJHZ1ZXRpZnkubGFuZy50KCckdnVldGlmeS5kYXRhRm9vdGVyLmxhc3RQYWdlJyksXG4gICAgICAgICAgdGhpcy4kdnVldGlmeS5ydGwgPyB0aGlzLmZpcnN0SWNvbiA6IHRoaXMubGFzdEljb25cbiAgICAgICAgKSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1kYXRhLWZvb3Rlcl9faWNvbnMtYmVmb3JlJyxcbiAgICAgICAgfSwgYmVmb3JlKSxcbiAgICAgICAgdGhpcy5zaG93Q3VycmVudFBhZ2UgJiYgdGhpcy4kY3JlYXRlRWxlbWVudCgnc3BhbicsIFt0aGlzLm9wdGlvbnMucGFnZS50b1N0cmluZygpXSksXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtZGF0YS1mb290ZXJfX2ljb25zLWFmdGVyJyxcbiAgICAgICAgfSwgYWZ0ZXIpLFxuICAgICAgXVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyICgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1kYXRhLWZvb3RlcicsXG4gICAgfSwgW1xuICAgICAgdGhpcy5nZW5JdGVtc1BlclBhZ2VTZWxlY3QoKSxcbiAgICAgIHRoaXMuZ2VuUGFnaW5hdGlvbkluZm8oKSxcbiAgICAgIHRoaXMuZ2VuSWNvbnMoKSxcbiAgICBdKVxuICB9LFxufSlcbiJdfQ==