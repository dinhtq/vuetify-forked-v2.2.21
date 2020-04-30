// Styles
import './VCalendarDaily.sass';
// Directives
import Resize from '../../directives/resize';
// Components
import VBtn from '../VBtn';
// Mixins
import CalendarWithIntervals from './mixins/calendar-with-intervals';
// Util
import { convertToUnit, getSlot } from '../../util/helpers';
/* @vue/component */
export default CalendarWithIntervals.extend({
    name: 'v-calendar-daily',
    directives: { Resize },
    data: () => ({
        scrollPush: 0,
    }),
    computed: {
        classes() {
            return {
                'v-calendar-daily': true,
                ...this.themeClasses,
            };
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.$nextTick(this.onResize);
        },
        onResize() {
            this.scrollPush = this.getScrollPush();
        },
        getScrollPush() {
            const area = this.$refs.scrollArea;
            const pane = this.$refs.pane;
            return area && pane ? (area.offsetWidth - pane.offsetWidth) : 0;
        },
        genHead() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__head',
                style: {
                    marginRight: this.scrollPush + 'px',
                },
            }, [
                this.genHeadIntervals(),
                ...this.genHeadDays(),
            ]);
        },
        genHeadIntervals() {
            const width = convertToUnit(this.intervalWidth);
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__intervals-head',
                style: {
                    width,
                },
            }, getSlot(this, 'interval-header'));
        },
        genHeadDays() {
            return this.days.map(this.genHeadDay);
        },
        genHeadDay(day, index) {
            const header = getSlot(this, 'day-header', () => ({
                week: this.days, ...day, index,
            }));
            return this.$createElement('div', {
                key: day.date,
                staticClass: 'v-calendar-daily_head-day',
                class: this.getRelativeClasses(day),
                on: this.getDefaultMouseEventHandlers(':day', _e => {
                    return this.getSlotScope(day);
                }),
            }, [
                this.genHeadWeekday(day),
                this.genHeadDayLabel(day),
                ...(header || []),
            ]);
        },
        genHeadWeekday(day) {
            const color = day.present ? this.color : undefined;
            return this.$createElement('div', this.setTextColor(color, {
                staticClass: 'v-calendar-daily_head-weekday',
            }), this.weekdayFormatter(day, this.shortWeekdays));
        },
        genHeadDayLabel(day) {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily_head-day-label',
            }, getSlot(this, 'day-label-header', day) || [this.genHeadDayButton(day)]);
        },
        genHeadDayButton(day) {
            const color = day.present ? this.color : 'transparent';
            return this.$createElement(VBtn, {
                props: {
                    color,
                    fab: true,
                    depressed: true,
                },
                on: this.getMouseEventHandlers({
                    'click:date': { event: 'click', stop: true },
                    'contextmenu:date': { event: 'contextmenu', stop: true, prevent: true, result: false },
                }, _e => {
                    return day;
                }),
            }, this.dayFormatter(day, false));
        },
        genBody() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__body',
            }, [
                this.genScrollArea(),
            ]);
        },
        genScrollArea() {
            return this.$createElement('div', {
                ref: 'scrollArea',
                staticClass: 'v-calendar-daily__scroll-area',
            }, [
                this.genPane(),
            ]);
        },
        genPane() {
            return this.$createElement('div', {
                ref: 'pane',
                staticClass: 'v-calendar-daily__pane',
                style: {
                    height: convertToUnit(this.bodyHeight),
                },
            }, [
                this.genDayContainer(),
            ]);
        },
        genDayContainer() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__day-container',
            }, [
                this.genBodyIntervals(),
                ...this.genDays(),
            ]);
        },
        genDays() {
            return this.days.map(this.genDay);
        },
        genDay(day, index) {
            return this.$createElement('div', {
                key: day.date,
                staticClass: 'v-calendar-daily__day',
                class: this.getRelativeClasses(day),
                on: this.getDefaultMouseEventHandlers(':time', e => {
                    return this.getSlotScope(this.getTimestampAtEvent(e, day));
                }),
            }, [
                ...this.genDayIntervals(index),
                ...(getSlot(this, 'day-body', () => this.getSlotScope(day)) || []),
            ]);
        },
        genDayIntervals(index) {
            return this.intervals[index].map(this.genDayInterval);
        },
        genDayInterval(interval) {
            const height = convertToUnit(this.intervalHeight);
            const styler = this.intervalStyle || this.intervalStyleDefault;
            const data = {
                key: interval.time,
                staticClass: 'v-calendar-daily__day-interval',
                style: {
                    height,
                    ...styler(interval),
                },
            };
            const children = getSlot(this, 'interval', () => this.getSlotScope(interval));
            return this.$createElement('div', data, children);
        },
        genBodyIntervals() {
            const width = convertToUnit(this.intervalWidth);
            const data = {
                staticClass: 'v-calendar-daily__intervals-body',
                style: {
                    width,
                },
                on: this.getDefaultMouseEventHandlers(':interval', e => {
                    return this.getTimestampAtEvent(e, this.parsedStart);
                }),
            };
            return this.$createElement('div', data, this.genIntervalLabels());
        },
        genIntervalLabels() {
            if (!this.intervals.length)
                return null;
            return this.intervals[0].map(this.genIntervalLabel);
        },
        genIntervalLabel(interval) {
            const height = convertToUnit(this.intervalHeight);
            const short = this.shortIntervals;
            const shower = this.showIntervalLabel || this.showIntervalLabelDefault;
            const show = shower(interval);
            const label = show ? this.intervalFormatter(interval, short) : undefined;
            return this.$createElement('div', {
                key: interval.time,
                staticClass: 'v-calendar-daily__interval',
                style: {
                    height,
                },
            }, [
                this.$createElement('div', {
                    staticClass: 'v-calendar-daily__interval-text',
                }, label),
            ]);
        },
    },
    render(h) {
        return h('div', {
            class: this.classes,
            nativeOn: {
                dragstart: (e) => {
                    e.preventDefault();
                },
            },
            directives: [{
                    modifiers: { quiet: true },
                    name: 'resize',
                    value: this.onResize,
                }],
        }, [
            !this.hideHeader ? this.genHead() : '',
            this.genBody(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNhbGVuZGFyRGFpbHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ2FsZW5kYXIvVkNhbGVuZGFyRGFpbHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sdUJBQXVCLENBQUE7QUFLOUIsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLGFBQWE7QUFDYixPQUFPLElBQUksTUFBTSxTQUFTLENBQUE7QUFFMUIsU0FBUztBQUNULE9BQU8scUJBQXFCLE1BQU0sa0NBQWtDLENBQUE7QUFFcEUsT0FBTztBQUNQLE9BQU8sRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFHM0Qsb0JBQW9CO0FBQ3BCLGVBQWUscUJBQXFCLENBQUMsTUFBTSxDQUFDO0lBQzFDLElBQUksRUFBRSxrQkFBa0I7SUFFeEIsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFO0lBRXRCLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsVUFBVSxFQUFFLENBQUM7S0FDZCxDQUFDO0lBRUYsUUFBUSxFQUFFO1FBQ1IsT0FBTztZQUNMLE9BQU87Z0JBQ0wsa0JBQWtCLEVBQUUsSUFBSTtnQkFDeEIsR0FBRyxJQUFJLENBQUMsWUFBWTthQUNyQixDQUFBO1FBQ0gsQ0FBQztLQUNGO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUNiLENBQUM7SUFFRCxPQUFPLEVBQUU7UUFDUCxJQUFJO1lBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDL0IsQ0FBQztRQUNELFFBQVE7WUFDTixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUN4QyxDQUFDO1FBQ0QsYUFBYTtZQUNYLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENB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LEVBQUUsaUNBQWlDO2lCQUMvQyxFQUFFLEtBQUssQ0FBQzthQUNWLENBQUMsQ0FBQTtRQUNKLENBQUM7S0FDRjtJQUVELE1BQU0sQ0FBRSxDQUFDO1FBQ1AsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ2QsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ25CLFFBQVEsRUFBRTtnQkFDUixTQUFTLEVBQUUsQ0FBQyxDQUFhLEVBQUUsRUFBRTtvQkFDM0IsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO2dCQUNwQixDQUFDO2FBQ0Y7WUFDRCxVQUFVLEVBQUUsQ0FBQztvQkFDWCxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO29CQUMxQixJQUFJLEVBQUUsUUFBUTtvQkFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVE7aUJBQ3JCLENBQUM7U0FDSCxFQUFFO1lBQ0QsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtTQUNmLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WQ2FsZW5kYXJEYWlseS5zYXNzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBSZXNpemUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yZXNpemUnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWQnRuIGZyb20gJy4uL1ZCdG4nXG5cbi8vIE1peGluc1xuaW1wb3J0IENhbGVuZGFyV2l0aEludGVydmFscyBmcm9tICcuL21peGlucy9jYWxlbmRhci13aXRoLWludGVydmFscydcblxuLy8gVXRpbFxuaW1wb3J0IHsgY29udmVydFRvVW5pdCwgZ2V0U2xvdCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCB7IENhbGVuZGFyVGltZXN0YW1wIH0gZnJvbSAndHlwZXMnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBDYWxlbmRhcldpdGhJbnRlcnZhbHMuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtY2FsZW5kYXItZGFpbHknLFxuXG4gIGRpcmVjdGl2ZXM6IHsgUmVzaXplIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBzY3JvbGxQdXNoOiAwLFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndi1jYWxlbmRhci1kYWlseSc6IHRydWUsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgbW91bnRlZCAoKSB7XG4gICAgdGhpcy5pbml0KClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgaW5pdCAoKSB7XG4gICAgICB0aGlzLiRuZXh0VGljayh0aGlzLm9uUmVzaXplKVxuICAgIH0sXG4gICAgb25SZXNpemUgKCkge1xuICAgICAgdGhpcy5zY3JvbGxQdXNoID0gdGhpcy5nZXRTY3JvbGxQdXNoKClcbiAgICB9LFxuICAgIGdldFNjcm9sbFB1c2ggKCk6IG51bWJlciB7XG4gICAgICBjb25zdCBhcmVhID0gdGhpcy4kcmVmcy5zY3JvbGxBcmVhIGFzIEhUTUxFbGVtZW50XG4gICAgICBjb25zdCBwYW5lID0gdGhpcy4kcmVmcy5wYW5lIGFzIEhUTUxFbGVtZW50XG5cbiAgICAgIHJldHVybiBhcmVhICYmIHBhbmUgPyAoYXJlYS5vZmZzZXRXaWR0aCAtIHBhbmUub2Zmc2V0V2lkdGgpIDogMFxuICAgIH0sXG4gICAgZ2VuSGVhZCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19oZWFkJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBtYXJnaW5SaWdodDogdGhpcy5zY3JvbGxQdXNoICsgJ3B4JyxcbiAgICAgICAgfSxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5IZWFkSW50ZXJ2YWxzKCksXG4gICAgICAgIC4uLnRoaXMuZ2VuSGVhZERheXMoKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5IZWFkSW50ZXJ2YWxzICgpOiBWTm9kZSB7XG4gICAgICBjb25zdCB3aWR0aDogc3RyaW5nIHwgdW5kZWZpbmVkID0gY29udmVydFRvVW5pdCh0aGlzLmludGVydmFsV2lkdGgpXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9faW50ZXJ2YWxzLWhlYWQnLFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIHdpZHRoLFxuICAgICAgICB9LFxuICAgICAgfSwgZ2V0U2xvdCh0aGlzLCAnaW50ZXJ2YWwtaGVhZGVyJykpXG4gICAgfSxcbiAgICBnZW5IZWFkRGF5cyAoKTogVk5vZGVbXSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXlzLm1hcCh0aGlzLmdlbkhlYWREYXkpXG4gICAgfSxcbiAgICBnZW5IZWFkRGF5IChkYXk6IENhbGVuZGFyVGltZXN0YW1wLCBpbmRleDogbnVtYmVyKTogVk5vZGUge1xuICAgICAgY29uc3QgaGVhZGVyID0gZ2V0U2xvdCh0aGlzLCAnZGF5LWhlYWRlcicsICgpID0+ICh7XG4gICAgICAgIHdlZWs6IHRoaXMuZGF5cywgLi4uZGF5LCBpbmRleCxcbiAgICAgIH0pKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBrZXk6IGRheS5kYXRlLFxuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfaGVhZC1kYXknLFxuICAgICAgICBjbGFzczogdGhpcy5nZXRSZWxhdGl2ZUNsYXNzZXMoZGF5KSxcbiAgICAgICAgb246IHRoaXMuZ2V0RGVmYXVsdE1vdXNlRXZlbnRIYW5kbGVycygnOmRheScsIF9lID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTbG90U2NvcGUoZGF5KVxuICAgICAgICB9KSxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5IZWFkV2Vla2RheShkYXkpLFxuICAgICAgICB0aGlzLmdlbkhlYWREYXlMYWJlbChkYXkpLFxuICAgICAgICAuLi4oaGVhZGVyIHx8IFtdKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5IZWFkV2Vla2RheSAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZGF5LnByZXNlbnQgPyB0aGlzLmNvbG9yIDogdW5kZWZpbmVkXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldFRleHRDb2xvcihjb2xvciwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfaGVhZC13ZWVrZGF5JyxcbiAgICAgIH0pLCB0aGlzLndlZWtkYXlGb3JtYXR0ZXIoZGF5LCB0aGlzLnNob3J0V2Vla2RheXMpKVxuICAgIH0sXG4gICAgZ2VuSGVhZERheUxhYmVsIChkYXk6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X2hlYWQtZGF5LWxhYmVsJyxcbiAgICAgIH0sIGdldFNsb3QodGhpcywgJ2RheS1sYWJlbC1oZWFkZXInLCBkYXkpIHx8IFt0aGlzLmdlbkhlYWREYXlCdXR0b24oZGF5KV0pXG4gICAgfSxcbiAgICBnZW5IZWFkRGF5QnV0dG9uIChkYXk6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgY29uc3QgY29sb3IgPSBkYXkucHJlc2VudCA/IHRoaXMuY29sb3IgOiAndHJhbnNwYXJlbnQnXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZCdG4sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBjb2xvcixcbiAgICAgICAgICBmYWI6IHRydWUsXG4gICAgICAgICAgZGVwcmVzc2VkOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBvbjogdGhpcy5nZXRNb3VzZUV2ZW50SGFuZGxlcnMoe1xuICAgICAgICAgICdjbGljazpkYXRlJzogeyBldmVudDogJ2NsaWNrJywgc3RvcDogdHJ1ZSB9LFxuICAgICAgICAgICdjb250ZXh0bWVudTpkYXRlJzogeyBldmVudDogJ2NvbnRleHRtZW51Jywgc3RvcDogdHJ1ZSwgcHJldmVudDogdHJ1ZSwgcmVzdWx0OiBmYWxzZSB9LFxuICAgICAgICB9LCBfZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGRheVxuICAgICAgICB9KSxcbiAgICAgIH0sIHRoaXMuZGF5Rm9ybWF0dGVyKGRheSwgZmFsc2UpKVxuICAgIH0sXG4gICAgZ2VuQm9keSAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19ib2R5JyxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5TY3JvbGxBcmVhKCksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuU2Nyb2xsQXJlYSAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgcmVmOiAnc2Nyb2xsQXJlYScsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9fc2Nyb2xsLWFyZWEnLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLmdlblBhbmUoKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5QYW5lICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICByZWY6ICdwYW5lJyxcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19wYW5lJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQ6IGNvbnZlcnRUb1VuaXQodGhpcy5ib2R5SGVpZ2h0KSxcbiAgICAgICAgfSxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5EYXlDb250YWluZXIoKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5EYXlDb250YWluZXIgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9fZGF5LWNvbnRhaW5lcicsXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuZ2VuQm9keUludGVydmFscygpLFxuICAgICAgICAuLi50aGlzLmdlbkRheXMoKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5EYXlzICgpOiBWTm9kZVtdIHtcbiAgICAgIHJldHVybiB0aGlzLmRheXMubWFwKHRoaXMuZ2VuRGF5KVxuICAgIH0sXG4gICAgZ2VuRGF5IChkYXk6IENhbGVuZGFyVGltZXN0YW1wLCBpbmRleDogbnVtYmVyKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiBkYXkuZGF0ZSxcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19kYXknLFxuICAgICAgICBjbGFzczogdGhpcy5nZXRSZWxhdGl2ZUNsYXNzZXMoZGF5KSxcbiAgICAgICAgb246IHRoaXMuZ2V0RGVmYXVsdE1vdXNlRXZlbnRIYW5kbGVycygnOnRpbWUnLCBlID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTbG90U2NvcGUodGhpcy5nZXRUaW1lc3RhbXBBdEV2ZW50KGUsIGRheSkpXG4gICAgICAgIH0pLFxuICAgICAgfSwgW1xuICAgICAgICAuLi50aGlzLmdlbkRheUludGVydmFscyhpbmRleCksXG4gICAgICAgIC4uLihnZXRTbG90KHRoaXMsICdkYXktYm9keScsICgpID0+IHRoaXMuZ2V0U2xvdFNjb3BlKGRheSkpIHx8IFtdKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5EYXlJbnRlcnZhbHMgKGluZGV4OiBudW1iZXIpOiBWTm9kZVtdIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVydmFsc1tpbmRleF0ubWFwKHRoaXMuZ2VuRGF5SW50ZXJ2YWwpXG4gICAgfSxcbiAgICBnZW5EYXlJbnRlcnZhbCAoaW50ZXJ2YWw6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgY29uc3QgaGVpZ2h0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBjb252ZXJ0VG9Vbml0KHRoaXMuaW50ZXJ2YWxIZWlnaHQpXG4gICAgICBjb25zdCBzdHlsZXIgPSB0aGlzLmludGVydmFsU3R5bGUgfHwgdGhpcy5pbnRlcnZhbFN0eWxlRGVmYXVsdFxuXG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBrZXk6IGludGVydmFsLnRpbWUsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9fZGF5LWludGVydmFsJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgLi4uc3R5bGVyKGludGVydmFsKSxcbiAgICAgICAgfSxcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBnZXRTbG90KHRoaXMsICdpbnRlcnZhbCcsICgpID0+IHRoaXMuZ2V0U2xvdFNjb3BlKGludGVydmFsKSlcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIGRhdGEsIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuQm9keUludGVydmFscyAoKTogVk5vZGUge1xuICAgICAgY29uc3Qgd2lkdGg6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGNvbnZlcnRUb1VuaXQodGhpcy5pbnRlcnZhbFdpZHRoKVxuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19pbnRlcnZhbHMtYm9keScsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB0aGlzLmdldERlZmF1bHRNb3VzZUV2ZW50SGFuZGxlcnMoJzppbnRlcnZhbCcsIGUgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFRpbWVzdGFtcEF0RXZlbnQoZSwgdGhpcy5wYXJzZWRTdGFydClcbiAgICAgICAgfSksXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCBkYXRhLCB0aGlzLmdlbkludGVydmFsTGFiZWxzKCkpXG4gICAgfSxcbiAgICBnZW5JbnRlcnZhbExhYmVscyAoKTogVk5vZGVbXSB8IG51bGwge1xuICAgICAgaWYgKCF0aGlzLmludGVydmFscy5sZW5ndGgpIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLmludGVydmFsc1swXS5tYXAodGhpcy5nZW5JbnRlcnZhbExhYmVsKVxuICAgIH0sXG4gICAgZ2VuSW50ZXJ2YWxMYWJlbCAoaW50ZXJ2YWw6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgY29uc3QgaGVpZ2h0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBjb252ZXJ0VG9Vbml0KHRoaXMuaW50ZXJ2YWxIZWlnaHQpXG4gICAgICBjb25zdCBzaG9ydDogYm9vbGVhbiA9IHRoaXMuc2hvcnRJbnRlcnZhbHNcbiAgICAgIGNvbnN0IHNob3dlciA9IHRoaXMuc2hvd0ludGVydmFsTGFiZWwgfHwgdGhpcy5zaG93SW50ZXJ2YWxMYWJlbERlZmF1bHRcbiAgICAgIGNvbnN0IHNob3cgPSBzaG93ZXIoaW50ZXJ2YWwpXG4gICAgICBjb25zdCBsYWJlbCA9IHNob3cgPyB0aGlzLmludGVydmFsRm9ybWF0dGVyKGludGVydmFsLCBzaG9ydCkgOiB1bmRlZmluZWRcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiBpbnRlcnZhbC50aW1lLFxuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2ludGVydmFsJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2ludGVydmFsLXRleHQnLFxuICAgICAgICB9LCBsYWJlbCksXG4gICAgICBdKVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKCdkaXYnLCB7XG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgbmF0aXZlT246IHtcbiAgICAgICAgZHJhZ3N0YXJ0OiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgIG1vZGlmaWVyczogeyBxdWlldDogdHJ1ZSB9LFxuICAgICAgICBuYW1lOiAncmVzaXplJyxcbiAgICAgICAgdmFsdWU6IHRoaXMub25SZXNpemUsXG4gICAgICB9XSxcbiAgICB9LCBbXG4gICAgICAhdGhpcy5oaWRlSGVhZGVyID8gdGhpcy5nZW5IZWFkKCkgOiAnJyxcbiAgICAgIHRoaXMuZ2VuQm9keSgpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19