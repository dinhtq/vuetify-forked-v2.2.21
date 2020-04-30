import './VPagination.sass';
import VIcon from '../VIcon';
// Directives
import Resize from '../../directives/resize';
// Mixins
import Colorable from '../../mixins/colorable';
import Intersectable from '../../mixins/intersectable';
import Themeable from '../../mixins/themeable';
// Utilities
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(Colorable, Intersectable({ onVisible: ['init'] }), Themeable).extend({
    name: 'v-pagination',
    directives: { Resize },
    props: {
        circle: Boolean,
        disabled: Boolean,
        length: {
            type: Number,
            default: 0,
            validator: (val) => val % 1 === 0,
        },
        nextIcon: {
            type: String,
            default: '$next',
        },
        prevIcon: {
            type: String,
            default: '$prev',
        },
        totalVisible: [Number, String],
        value: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            maxButtons: 0,
            selected: null,
        };
    },
    computed: {
        classes() {
            return {
                'v-pagination': true,
                'v-pagination--circle': this.circle,
                'v-pagination--disabled': this.disabled,
                ...this.themeClasses,
            };
        },
        items() {
            const totalVisible = parseInt(this.totalVisible, 10);
            const maxLength = Math.min(Math.max(0, totalVisible) || this.length, Math.max(0, this.maxButtons) || this.length, this.length);
            if (this.length <= maxLength) {
                return this.range(1, this.length);
            }
            const even = maxLength % 2 === 0 ? 1 : 0;
            const left = Math.floor(maxLength / 2);
            const right = this.length - left + 1 + even;
            if (this.value > left && this.value < right) {
                const start = this.value - left + 2;
                const end = this.value + left - 2 - even;
                return [1, '...', ...this.range(start, end), '...', this.length];
            }
            else if (this.value === left) {
                const end = this.value + left - 1 - even;
                return [...this.range(1, end), '...', this.length];
            }
            else if (this.value === right) {
                const start = this.value - left + 1;
                return [1, '...', ...this.range(start, this.length)];
            }
            else {
                return [
                    ...this.range(1, left),
                    '...',
                    ...this.range(right, this.length),
                ];
            }
        },
    },
    watch: {
        value() {
            this.init();
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.selected = null;
            this.$nextTick(this.onResize);
            // TODO: Change this (f75dee3a, cbdf7caa)
            setTimeout(() => (this.selected = this.value), 100);
        },
        onResize() {
            const width = this.$el && this.$el.parentElement
                ? this.$el.parentElement.clientWidth
                : window.innerWidth;
            this.maxButtons = Math.floor((width - 96) / 42);
        },
        next(e) {
            e.preventDefault();
            this.$emit('input', this.value + 1);
            this.$emit('next');
        },
        previous(e) {
            e.preventDefault();
            this.$emit('input', this.value - 1);
            this.$emit('previous');
        },
        range(from, to) {
            const range = [];
            from = from > 0 ? from : 1;
            for (let i = from; i <= to; i++) {
                range.push(i);
            }
            return range;
        },
        genIcon(h, icon, disabled, fn) {
            return h('li', [
                h('button', {
                    staticClass: 'v-pagination__navigation',
                    class: {
                        'v-pagination__navigation--disabled': disabled,
                    },
                    attrs: {
                        type: 'button',
                    },
                    on: disabled ? {} : { click: fn },
                }, [h(VIcon, [icon])]),
            ]);
        },
        genItem(h, i) {
            const color = (i === this.value) && (this.color || 'primary');
            return h('button', this.setBackgroundColor(color, {
                staticClass: 'v-pagination__item',
                class: {
                    'v-pagination__item--active': i === this.value,
                },
                attrs: {
                    type: 'button',
                },
                on: {
                    click: () => this.$emit('input', i),
                },
            }), [i.toString()]);
        },
        genItems(h) {
            return this.items.map((i, index) => {
                return h('li', { key: index }, [
                    isNaN(Number(i)) ? h('span', { class: 'v-pagination__more' }, [i.toString()]) : this.genItem(h, i),
                ]);
            });
        },
    },
    render(h) {
        const children = [
            this.genIcon(h, this.$vuetify.rtl ? this.nextIcon : this.prevIcon, this.value <= 1, this.previous),
            this.genItems(h),
            this.genIcon(h, this.$vuetify.rtl ? this.prevIcon : this.nextIcon, this.value >= this.length, this.next),
        ];
        return h('ul', {
            directives: [{
                    modifiers: { quiet: true },
                    name: 'resize',
                    value: this.onResize,
                }],
            class: this.classes,
        }, children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBhZ2luYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WUGFnaW5hdGlvbi9WUGFnaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLG9CQUFvQixDQUFBO0FBRTNCLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0seUJBQXlCLENBQUE7QUFFNUMsU0FBUztBQUNULE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sYUFBYSxNQUFNLDRCQUE0QixDQUFBO0FBQ3RELE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBRTlDLFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUt0QyxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLFNBQVMsRUFDVCxhQUFhLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQ3RDLFNBQVMsQ0FDVixDQUFDLE1BQU0sQ0FBQztJQUNQLElBQUksRUFBRSxjQUFjO0lBRXBCLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRTtJQUV0QixLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUUsT0FBTztRQUNmLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLENBQUM7WUFDVixTQUFTLEVBQUUsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztTQUMxQztRQUNELFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLE9BQU87U0FDakI7UUFDRCxRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxPQUFPO1NBQ2pCO1FBQ0QsWUFBWSxFQUFFLENBQUMsTUFBTSxFQUFF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Q0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDbEcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDekcsQ0FBQTtRQUVELE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRTtZQUNiLFVBQVUsRUFBRSxDQUFDO29CQUNYLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7b0JBQzFCLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUTtpQkFDckIsQ0FBQztZQUNGLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTztTQUNwQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ2QsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9WUGFnaW5hdGlvbi5zYXNzJ1xuXG5pbXBvcnQgVkljb24gZnJvbSAnLi4vVkljb24nXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBSZXNpemUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yZXNpemUnXG5cbi8vIE1peGluc1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IEludGVyc2VjdGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2ludGVyc2VjdGFibGUnXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBDcmVhdGVFbGVtZW50IH0gZnJvbSAndnVlJ1xuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBDb2xvcmFibGUsXG4gIEludGVyc2VjdGFibGUoeyBvblZpc2libGU6IFsnaW5pdCddIH0pLFxuICBUaGVtZWFibGVcbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtcGFnaW5hdGlvbicsXG5cbiAgZGlyZWN0aXZlczogeyBSZXNpemUgfSxcblxuICBwcm9wczoge1xuICAgIGNpcmNsZTogQm9vbGVhbixcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICBsZW5ndGg6IHtcbiAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgICB2YWxpZGF0b3I6ICh2YWw6IG51bWJlcikgPT4gdmFsICUgMSA9PT0gMCxcbiAgICB9LFxuICAgIG5leHRJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJG5leHQnLFxuICAgIH0sXG4gICAgcHJldkljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckcHJldicsXG4gICAgfSxcbiAgICB0b3RhbFZpc2libGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF4QnV0dG9uczogMCxcbiAgICAgIHNlbGVjdGVkOiBudWxsIGFzIG51bWJlciB8IG51bGwsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LXBhZ2luYXRpb24nOiB0cnVlLFxuICAgICAgICAndi1wYWdpbmF0aW9uLS1jaXJjbGUnOiB0aGlzLmNpcmNsZSxcbiAgICAgICAgJ3YtcGFnaW5hdGlvbi0tZGlzYWJsZWQnOiB0aGlzLmRpc2FibGVkLFxuICAgICAgICAuLi50aGlzLnRoZW1lQ2xhc3NlcyxcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaXRlbXMgKCk6IChzdHJpbmcgfCBudW1iZXIpW10ge1xuICAgICAgY29uc3QgdG90YWxWaXNpYmxlID0gcGFyc2VJbnQodGhpcy50b3RhbFZpc2libGUsIDEwKVxuXG4gICAgICBjb25zdCBtYXhMZW5ndGggPSBNYXRoLm1pbihcbiAgICAgICAgTWF0aC5tYXgoMCwgdG90YWxWaXNpYmxlKSB8fCB0aGlzLmxlbmd0aCxcbiAgICAgICAgTWF0aC5tYXgoMCwgdGhpcy5tYXhCdXR0b25zKSB8fCB0aGlzLmxlbmd0aCxcbiAgICAgICAgdGhpcy5sZW5ndGhcbiAgICAgIClcblxuICAgICAgaWYgKHRoaXMubGVuZ3RoIDw9IG1heExlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yYW5nZSgxLCB0aGlzLmxlbmd0aClcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXZlbiA9IG1heExlbmd0aCAlIDIgPT09IDAgPyAxIDogMFxuICAgICAgY29uc3QgbGVmdCA9IE1hdGguZmxvb3IobWF4TGVuZ3RoIC8gMilcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5sZW5ndGggLSBsZWZ0ICsgMSArIGV2ZW5cblxuICAgICAgaWYgKHRoaXMudmFsdWUgPiBsZWZ0ICYmIHRoaXMudmFsdWUgPCByaWdodCkge1xuICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMudmFsdWUgLSBsZWZ0ICsgMlxuICAgICAgICBjb25zdCBlbmQgPSB0aGlzLnZhbHVlICsgbGVmdCAtIDIgLSBldmVuXG5cbiAgICAgICAgcmV0dXJuIFsxLCAnLi4uJywgLi4udGhpcy5yYW5nZShzdGFydCwgZW5kKSwgJy4uLicsIHRoaXMubGVuZ3RoXVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnZhbHVlID09PSBsZWZ0KSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IHRoaXMudmFsdWUgKyBsZWZ0IC0gMSAtIGV2ZW5cbiAgICAgICAgcmV0dXJuIFsuLi50aGlzLnJhbmdlKDEsIGVuZCksICcuLi4nLCB0aGlzLmxlbmd0aF1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy52YWx1ZSA9PT0gcmlnaHQpIHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLnZhbHVlIC0gbGVmdCArIDFcbiAgICAgICAgcmV0dXJuIFsxLCAnLi4uJywgLi4udGhpcy5yYW5nZShzdGFydCwgdGhpcy5sZW5ndGgpXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAuLi50aGlzLnJhbmdlKDEsIGxlZnQpLFxuICAgICAgICAgICcuLi4nLFxuICAgICAgICAgIC4uLnRoaXMucmFuZ2UocmlnaHQsIHRoaXMubGVuZ3RoKSxcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICB2YWx1ZSAoKSB7XG4gICAgICB0aGlzLmluaXQoKVxuICAgIH0sXG4gIH0sXG5cbiAgbW91bnRlZCAoKSB7XG4gICAgdGhpcy5pbml0KClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgaW5pdCAoKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkID0gbnVsbFxuXG4gICAgICB0aGlzLiRuZXh0VGljayh0aGlzLm9uUmVzaXplKVxuICAgICAgLy8gVE9ETzogQ2hhbmdlIHRoaXMgKGY3NWRlZTNhLCBjYmRmN2NhYSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gKHRoaXMuc2VsZWN0ZWQgPSB0aGlzLnZhbHVlKSwgMTAwKVxuICAgIH0sXG4gICAgb25SZXNpemUgKCkge1xuICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLiRlbCAmJiB0aGlzLiRlbC5wYXJlbnRFbGVtZW50XG4gICAgICAgID8gdGhpcy4kZWwucGFyZW50RWxlbWVudC5jbGllbnRXaWR0aFxuICAgICAgICA6IHdpbmRvdy5pbm5lcldpZHRoXG5cbiAgICAgIHRoaXMubWF4QnV0dG9ucyA9IE1hdGguZmxvb3IoKHdpZHRoIC0gOTYpIC8gNDIpXG4gICAgfSxcbiAgICBuZXh0IChlOiBFdmVudCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIHRoaXMudmFsdWUgKyAxKVxuICAgICAgdGhpcy4kZW1pdCgnbmV4dCcpXG4gICAgfSxcbiAgICBwcmV2aW91cyAoZTogRXZlbnQpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdGhpcy4kZW1pdCgnaW5wdXQnLCB0aGlzLnZhbHVlIC0gMSlcbiAgICAgIHRoaXMuJGVtaXQoJ3ByZXZpb3VzJylcbiAgICB9LFxuICAgIHJhbmdlIChmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gW11cblxuICAgICAgZnJvbSA9IGZyb20gPiAwID8gZnJvbSA6IDFcblxuICAgICAgZm9yIChsZXQgaSA9IGZyb207IGkgPD0gdG87IGkrKykge1xuICAgICAgICByYW5nZS5wdXNoKGkpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByYW5nZVxuICAgIH0sXG4gICAgZ2VuSWNvbiAoaDogQ3JlYXRlRWxlbWVudCwgaWNvbjogc3RyaW5nLCBkaXNhYmxlZDogYm9vbGVhbiwgZm46IEV2ZW50TGlzdGVuZXIpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gaCgnbGknLCBbXG4gICAgICAgIGgoJ2J1dHRvbicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtcGFnaW5hdGlvbl9fbmF2aWdhdGlvbicsXG4gICAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAgICd2LXBhZ2luYXRpb25fX25hdmlnYXRpb24tLWRpc2FibGVkJzogZGlzYWJsZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjogZGlzYWJsZWQgPyB7fSA6IHsgY2xpY2s6IGZuIH0sXG4gICAgICAgIH0sIFtoKFZJY29uLCBbaWNvbl0pXSksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuSXRlbSAoaDogQ3JlYXRlRWxlbWVudCwgaTogc3RyaW5nIHwgbnVtYmVyKTogVk5vZGUge1xuICAgICAgY29uc3QgY29sb3I6IHN0cmluZyB8IGZhbHNlID0gKGkgPT09IHRoaXMudmFsdWUpICYmICh0aGlzLmNvbG9yIHx8ICdwcmltYXJ5JylcbiAgICAgIHJldHVybiBoKCdidXR0b24nLCB0aGlzLnNldEJhY2tncm91bmRDb2xvcihjb2xvciwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtcGFnaW5hdGlvbl9faXRlbScsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3YtcGFnaW5hdGlvbl9faXRlbS0tYWN0aXZlJzogaSA9PT0gdGhpcy52YWx1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uJyxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjbGljazogKCkgPT4gdGhpcy4kZW1pdCgnaW5wdXQnLCBpKSxcbiAgICAgICAgfSxcbiAgICAgIH0pLCBbaS50b1N0cmluZygpXSlcbiAgICB9LFxuICAgIGdlbkl0ZW1zIChoOiBDcmVhdGVFbGVtZW50KTogVk5vZGVbXSB7XG4gICAgICByZXR1cm4gdGhpcy5pdGVtcy5tYXAoKGksIGluZGV4KSA9PiB7XG4gICAgICAgIHJldHVybiBoKCdsaScsIHsga2V5OiBpbmRleCB9LCBbXG4gICAgICAgICAgaXNOYU4oTnVtYmVyKGkpKSA/IGgoJ3NwYW4nLCB7IGNsYXNzOiAndi1wYWdpbmF0aW9uX19tb3JlJyB9LCBbaS50b1N0cmluZygpXSkgOiB0aGlzLmdlbkl0ZW0oaCwgaSksXG4gICAgICAgIF0pXG4gICAgICB9KVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gW1xuICAgICAgdGhpcy5nZW5JY29uKGgsIHRoaXMuJHZ1ZXRpZnkucnRsID8gdGhpcy5uZXh0SWNvbiA6IHRoaXMucHJldkljb24sIHRoaXMudmFsdWUgPD0gMSwgdGhpcy5wcmV2aW91cyksXG4gICAgICB0aGlzLmdlbkl0ZW1zKGgpLFxuICAgICAgdGhpcy5nZW5JY29uKGgsIHRoaXMuJHZ1ZXRpZnkucnRsID8gdGhpcy5wcmV2SWNvbiA6IHRoaXMubmV4dEljb24sIHRoaXMudmFsdWUgPj0gdGhpcy5sZW5ndGgsIHRoaXMubmV4dCksXG4gICAgXVxuXG4gICAgcmV0dXJuIGgoJ3VsJywge1xuICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgbW9kaWZpZXJzOiB7IHF1aWV0OiB0cnVlIH0sXG4gICAgICAgIG5hbWU6ICdyZXNpemUnLFxuICAgICAgICB2YWx1ZTogdGhpcy5vblJlc2l6ZSxcbiAgICAgIH1dLFxuICAgICAgY2xhc3M6IHRoaXMuY2xhc3NlcyxcbiAgICB9LCBjaGlsZHJlbilcbiAgfSxcbn0pXG4iXX0=