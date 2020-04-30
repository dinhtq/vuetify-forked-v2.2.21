// Components
import VDatePickerTitle from './VDatePickerTitle';
import VDatePickerHeader from './VDatePickerHeader';
import VDatePickerDateTable from './VDatePickerDateTable';
import VDatePickerMonthTable from './VDatePickerMonthTable';
import VDatePickerYears from './VDatePickerYears';
// Mixins
import Localable from '../../mixins/localable';
import Picker from '../../mixins/picker';
// Utils
import { pad, createNativeLocaleFormatter } from './util';
import isDateAllowed from './util/isDateAllowed';
import { consoleWarn } from '../../util/console';
import { daysInMonth } from '../VCalendar/util/timestamp';
import mixins from '../../util/mixins';
// Adds leading zero to month/day if necessary, returns 'YYYY' if type = 'year',
// 'YYYY-MM' if 'month' and 'YYYY-MM-DD' if 'date'
function sanitizeDateString(dateString, type) {
    const [year, month = 1, date = 1] = dateString.split('-');
    return `${year}-${pad(month)}-${pad(date)}`.substr(0, { date: 10, month: 7, year: 4 }[type]);
}
export default mixins(Localable, Picker
/* @vue/component */
).extend({
    name: 'v-date-picker',
    props: {
        allowedDates: Function,
        // Function formatting the day in date picker table
        dayFormat: Function,
        disabled: Boolean,
        events: {
            type: [Array, Function, Object],
            default: () => null,
        },
        eventColor: {
            type: [Array, Function, Object, String],
            default: () => 'warning',
        },
        firstDayOfWeek: {
            type: [String, Number],
            default: 0,
        },
        // Function formatting the tableDate in the day/month table header
        headerDateFormat: Function,
        localeFirstDayOfYear: {
            type: [String, Number],
            default: 0,
        },
        max: String,
        min: String,
        // Function formatting month in the months table
        monthFormat: Function,
        multiple: Boolean,
        nextIcon: {
            type: String,
            default: '$next',
        },
        pickerDate: String,
        prevIcon: {
            type: String,
            default: '$prev',
        },
        range: Boolean,
        reactive: Boolean,
        readonly: Boolean,
        scrollable: Boolean,
        showCurrent: {
            type: [Boolean, String],
            default: true,
        },
        selectedItemsText: {
            type: String,
            default: '$vuetify.datePicker.itemsSelected',
        },
        showWeek: Boolean,
        // Function formatting currently selected date in the picker title
        titleDateFormat: Function,
        type: {
            type: String,
            default: 'date',
            validator: (type) => ['date', 'month'].includes(type),
        },
        value: [Array, String],
        weekdayFormat: Function,
        // Function formatting the year in table header and pickup title
        yearFormat: Function,
        yearIcon: String,
    },
    data() {
        const now = new Date();
        return {
            activePicker: this.type.toUpperCase(),
            inputDay: null,
            inputMonth: null,
            inputYear: null,
            isReversing: false,
            now,
            // tableDate is a string in 'YYYY' / 'YYYY-M' format (leading zero for month is not required)
            tableDate: (() => {
                if (this.pickerDate) {
                    return this.pickerDate;
                }
                const date = (this.multiple || this.range ? this.value[this.value.length - 1] : this.value) ||
                    `${now.getFullYear()}-${now.getMonth() + 1}`;
                return sanitizeDateString(date, this.type === 'date' ? 'month' : 'year');
            })(),
        };
    },
    computed: {
        isMultiple() {
            return this.multiple || this.range;
        },
        lastValue() {
            return this.isMultiple ? this.value[this.value.length - 1] : this.value;
        },
        selectedMonths() {
            if (!this.value || !this.value.length || this.type === 'month') {
                return this.value;
            }
            else if (this.isMultiple) {
                return this.value.map(val => val.substr(0, 7));
            }
            else {
                return this.value.substr(0, 7);
            }
        },
        current() {
            if (this.showCurrent === true) {
                return sanitizeDateString(`${this.now.getFullYear()}-${this.now.getMonth() + 1}-${this.now.getDate()}`, this.type);
            }
            return this.showCurrent || null;
        },
        inputDate() {
            return this.type === 'date'
                ? `${this.inputYear}-${pad(this.inputMonth + 1)}-${pad(this.inputDay)}`
                : `${this.inputYear}-${pad(this.inputMonth + 1)}`;
        },
        tableMonth() {
            return Number((this.pickerDate || this.tableDate).split('-')[1]) - 1;
        },
        tableYear() {
            return Number((this.pickerDate || this.tableDate).split('-')[0]);
        },
        minMonth() {
            return this.min ? sanitizeDateString(this.min, 'month') : null;
        },
        maxMonth() {
            return this.max ? sanitizeDateString(this.max, 'month') : null;
        },
        minYear() {
            return this.min ? sanitizeDateString(this.min, 'year') : null;
        },
        maxYear() {
            return this.max ? sanitizeDateString(this.max, 'year') : null;
        },
        formatters() {
            return {
                year: this.yearFormat || createNativeLocaleFormatter(this.currentLocale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 }),
                titleDate: this.titleDateFormat ||
                    (this.isMultiple ? this.defaultTitleMultipleDateFormatter : this.defaultTitleDateFormatter),
            };
        },
        defaultTitleMultipleDateFormatter() {
            return dates => {
                if (!dates.length) {
                    return '-';
                }
                if (dates.length === 1) {
                    return this.defaultTitleDateFormatter(dates[0]);
                }
                return this.$vuetify.lang.t(this.selectedItemsText, dates.length);
            };
        },
        defaultTitleDateFormatter() {
            const titleFormats = {
                year: { year: 'numeric', timeZone: 'UTC' },
                month: { month: 'long', timeZone: 'UTC' },
                date: { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' },
            };
            const titleDateFormatter = createNativeLocaleFormatter(this.currentLocale, titleFormats[this.type], {
                start: 0,
                length: { date: 10, month: 7, year: 4 }[this.type],
            });
            const landscapeFormatter = (date) => titleDateFormatter(date)
                .replace(/([^\d\s])([\d])/g, (match, nonDigit, digit) => `${nonDigit} ${digit}`)
                .replace(', ', ',<br>');
            return this.landscape ? landscapeFormatter : titleDateFormatter;
        },
    },
    watch: {
        tableDate(val, prev) {
            // Make a ISO 8601 strings from val and prev for comparision, otherwise it will incorrectly
            // compare for example '2000-9' and '2000-10'
            const sanitizeType = this.type === 'month' ? 'year' : 'month';
            this.isReversing = sanitizeDateString(val, sanitizeType) < sanitizeDateString(prev, sanitizeType);
            this.$emit('update:picker-date', val);
        },
        pickerDate(val) {
            if (val) {
                this.tableDate = val;
            }
            else if (this.lastValue && this.type === 'date') {
                this.tableDate = sanitizeDateString(this.lastValue, 'month');
            }
            else if (this.lastValue && this.type === 'month') {
                this.tableDate = sanitizeDateString(this.lastValue, 'year');
            }
        },
        value(newValue, oldValue) {
            this.checkMultipleProp();
            this.setInputDate();
            if (!this.isMultiple && this.value && !this.pickerDate) {
                this.tableDate = sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month');
            }
            else if (this.isMultiple && this.value.length && !oldValue.length && !this.pickerDate) {
                this.tableDate = sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month');
            }
        },
        type(type) {
            this.activePicker = type.toUpperCase();
            if (this.value && this.value.length) {
                const output = (this.isMultiple ? this.value : [this.value])
                    .map((val) => sanitizeDateString(val, type))
                    .filter(this.isDateAllowed);
                this.$emit('input', this.isMultiple ? output : output[0]);
            }
        },
    },
    created() {
        this.checkMultipleProp();
        if (this.pickerDate !== this.tableDate) {
            this.$emit('update:picker-date', this.tableDate);
        }
        this.setInputDate();
    },
    methods: {
        emitInput(newInput) {
            if (this.range && this.value) {
                if (this.value.length !== 1) {
                    this.$emit('input', [newInput]);
                }
                else {
                    const output = [...this.value, newInput];
                    this.$emit('input', output);
                    this.$emit('change', output);
                }
                return;
            }
            const output = this.multiple
                ? (this.value.indexOf(newInput) === -1
                    ? this.value.concat([newInput])
                    : this.value.filter(x => x !== newInput))
                : newInput;
            this.$emit('input', output);
            this.multiple || this.$emit('change', newInput);
        },
        checkMultipleProp() {
            if (this.value == null)
                return;
            const valueType = this.value.constructor.name;
            const expected = this.isMultiple ? 'Array' : 'String';
            if (valueType !== expected) {
                consoleWarn(`Value must be ${this.isMultiple ? 'an' : 'a'} ${expected}, got ${valueType}`, this);
            }
        },
        isDateAllowed(value) {
            return isDateAllowed(value, this.min, this.max, this.allowedDates);
        },
        yearClick(value) {
            this.inputYear = value;
            if (this.type === 'month') {
                this.tableDate = `${value}`;
            }
            else {
                this.tableDate = `${value}-${pad((this.tableMonth || 0) + 1)}`;
            }
            this.activePicker = 'MONTH';
            if (this.reactive && !this.readonly && !this.isMultiple && this.isDateAllowed(this.inputDate)) {
                this.$emit('input', this.inputDate);
            }
        },
        monthClick(value) {
            this.inputYear = parseInt(value.split('-')[0], 10);
            this.inputMonth = parseInt(value.split('-')[1], 10) - 1;
            if (this.type === 'date') {
                if (this.inputDay) {
                    this.inputDay = Math.min(this.inputDay, daysInMonth(this.inputYear, this.inputMonth + 1));
                }
                this.tableDate = value;
                this.activePicker = 'DATE';
                if (this.reactive && !this.readonly && !this.isMultiple && this.isDateAllowed(this.inputDate)) {
                    this.$emit('input', this.inputDate);
                }
            }
            else {
                this.emitInput(this.inputDate);
            }
        },
        dateClick(value) {
            this.inputYear = parseInt(value.split('-')[0], 10);
            this.inputMonth = parseInt(value.split('-')[1], 10) - 1;
            this.inputDay = parseInt(value.split('-')[2], 10);
            this.emitInput(this.inputDate);
        },
        genPickerTitle() {
            return this.$createElement(VDatePickerTitle, {
                props: {
                    date: this.value ? this.formatters.titleDate(this.value) : '',
                    disabled: this.disabled,
                    readonly: this.readonly,
                    selectingYear: this.activePicker === 'YEAR',
                    year: this.formatters.year(this.value ? `${this.inputYear}` : this.tableDate),
                    yearIcon: this.yearIcon,
                    value: this.isMultiple ? this.value[0] : this.value,
                },
                slot: 'title',
                on: {
                    'update:selecting-year': (value) => this.activePicker = value ? 'YEAR' : this.type.toUpperCase(),
                },
            });
        },
        genTableHeader() {
            return this.$createElement(VDatePickerHeader, {
                props: {
                    nextIcon: this.nextIcon,
                    color: this.color,
                    dark: this.dark,
                    disabled: this.disabled,
                    format: this.headerDateFormat,
                    light: this.light,
                    locale: this.locale,
                    min: this.activePicker === 'DATE' ? this.minMonth : this.minYear,
                    max: this.activePicker === 'DATE' ? this.maxMonth : this.maxYear,
                    prevIcon: this.prevIcon,
                    readonly: this.readonly,
                    value: this.activePicker === 'DATE' ? `${pad(this.tableYear, 4)}-${pad(this.tableMonth + 1)}` : `${pad(this.tableYear, 4)}`,
                },
                on: {
                    toggle: () => this.activePicker = (this.activePicker === 'DATE' ? 'MONTH' : 'YEAR'),
                    input: (value) => this.tableDate = value,
                },
            });
        },
        genDateTable() {
            return this.$createElement(VDatePickerDateTable, {
                props: {
                    allowedDates: this.allowedDates,
                    color: this.color,
                    current: this.current,
                    dark: this.dark,
                    disabled: this.disabled,
                    events: this.events,
                    eventColor: this.eventColor,
                    firstDayOfWeek: this.firstDayOfWeek,
                    format: this.dayFormat,
                    light: this.light,
                    locale: this.locale,
                    localeFirstDayOfYear: this.localeFirstDayOfYear,
                    min: this.min,
                    max: this.max,
                    range: this.range,
                    readonly: this.readonly,
                    scrollable: this.scrollable,
                    showWeek: this.showWeek,
                    tableDate: `${pad(this.tableYear, 4)}-${pad(this.tableMonth + 1)}`,
                    value: this.value,
                    weekdayFormat: this.weekdayFormat,
                },
                ref: 'table',
                on: {
                    input: this.dateClick,
                    'update:table-date': (value) => this.tableDate = value,
                    'click:date': (value) => this.$emit('click:date', value),
                    'dblclick:date': (value) => this.$emit('dblclick:date', value),
                },
            });
        },
        genMonthTable() {
            return this.$createElement(VDatePickerMonthTable, {
                props: {
                    allowedDates: this.type === 'month' ? this.allowedDates : null,
                    color: this.color,
                    current: this.current ? sanitizeDateString(this.current, 'month') : null,
                    dark: this.dark,
                    disabled: this.disabled,
                    events: this.type === 'month' ? this.events : null,
                    eventColor: this.type === 'month' ? this.eventColor : null,
                    format: this.monthFormat,
                    light: this.light,
                    locale: this.locale,
                    min: this.minMonth,
                    max: this.maxMonth,
                    range: this.range,
                    readonly: this.readonly && this.type === 'month',
                    scrollable: this.scrollable,
                    value: this.selectedMonths,
                    tableDate: `${pad(this.tableYear, 4)}`,
                },
                ref: 'table',
                on: {
                    input: this.monthClick,
                    'update:table-date': (value) => this.tableDate = value,
                    'click:month': (value) => this.$emit('click:month', value),
                    'dblclick:month': (value) => this.$emit('dblclick:month', value),
                },
            });
        },
        genYears() {
            return this.$createElement(VDatePickerYears, {
                props: {
                    color: this.color,
                    format: this.yearFormat,
                    locale: this.locale,
                    min: this.minYear,
                    max: this.maxYear,
                    value: this.tableYear,
                },
                on: {
                    input: this.yearClick,
                },
            });
        },
        genPickerBody() {
            const children = this.activePicker === 'YEAR' ? [
                this.genYears(),
            ] : [
                this.genTableHeader(),
                this.activePicker === 'DATE' ? this.genDateTable() : this.genMonthTable(),
            ];
            return this.$createElement('div', {
                key: this.activePicker,
            }, children);
        },
        setInputDate() {
            if (this.lastValue) {
                const array = this.lastValue.split('-');
                this.inputYear = parseInt(array[0], 10);
                this.inputMonth = parseInt(array[1], 10) - 1;
                if (this.type === 'date') {
                    this.inputDay = parseInt(array[2], 10);
                }
            }
            else {
                this.inputYear = this.inputYear || this.now.getFullYear();
                this.inputMonth = this.inputMonth == null ? this.inputMonth : this.now.getMonth();
                this.inputDay = this.inputDay || this.now.getDate();
            }
        },
    },
    render() {
        return this.genPicker('v-picker--date');
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRhdGVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WRGF0ZVBpY2tlci9WRGF0ZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxhQUFhO0FBQ2IsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQTtBQUNqRCxPQUFPLGlCQUFpQixNQUFNLHFCQUFxQixDQUFBO0FBQ25ELE9BQU8sb0JBQW9CLE1BQU0sd0JBQXdCLENBQUE7QUFDekQsT0FBTyxxQkFBcUIsTUFBTSx5QkFBeUIsQ0FBQTtBQUMzRCxPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFBO0FBRWpELFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLE1BQU0sTUFBTSxxQkFBcUIsQ0FBQTtBQUV4QyxRQUFRO0FBQ1IsT0FBTyxFQUFFLEdBQUcsRUFBRSwyQkFBMkIsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUN6RCxPQUFPLGFBQWEsTUFBTSxzQkFBc0IsQ0FBQTtBQUNoRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDaEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBQ3pELE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBb0J0QyxnRkFBZ0Y7QUFDaEYsa0RBQWtEO0FBQ2xELFNBQVMsa0JBQWtCLENBQUUsVUFBa0IsRUFBRSxJQUErQjtJQUM5RSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDekQsT0FBTyxHQUFHLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUM5RixDQUFDO0FBRUQsZUFBZSxNQUFNLENBQ25CLFNBQVMsRUFDVCxNQUFNO0FBQ1Isb0JBQW9CO0NBQ25CLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLGVBQWU7SUFFckIsS0FBSyxFQUFFO1FBQ0wsWUFBWSxFQUFFLFFBQWdFO1FBQzlFLG1EQUFtRDtRQUNuRCxTQUFTLEVBQUUsUUFBZ0U7UUFDM0UsUUFBUSxFQUFFLE9BQU87UUFDakIsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQStCO1lBQzdELE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJO1NBQ3BCO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFvQztZQUMxRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUztTQUN6QjtRQUNELGNBQWMsRUFBRTtZQUNkLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELGtFQUFrRTtRQUNsRSxnQkFBZ0IsRUFBRSxRQUFxRDtRQUN2RSxvQkFBb0IsRUFBRTtZQUNwQixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1lBQ3RCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxHQUFHLEVBQUUsTUFBTTtRQUNYLEdBQUcsRUFBRSxNQUFNO1FBQ1gsZ0RBQWdEO1FBQ2hELFdBQVcsRUFBRSxRQUFxRDtRQUNsRSxRQUFRLEVBQUUsT0FBTztRQUNqQixRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxPQUFPO1NBQ2pCO1FBQ0QsVUFBVSxFQUFFLE1BQU07UUFDbEIsUUFBUSxFQUFFO1lBQ1IsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsT0FBTztTQUNqQjtRQUNELEtBQUssRUFBRSxPQUFPO1FBQ2QsUUFBUSxFQUFFLE9BQU87UUFDakIsUUFBUSxFQUFFLE9BQU87UUFDakIsVUFBVSxFQUFFLE9BQU87UUFDbkIsV0FBVyxFQUFFO1lBQ1gsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztZQUN2QixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsaUJBQWlCLEVBQUU7WUFDakIsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsbUNBQW1DO1NBQzdDO1FBQ0QsUUFBUSxFQUFFLE9BQU87UUFDakIsa0VBQWtFO1FBQ2xFLGVBQWUsRUFBRSxRQUFtRjtRQUNwRyxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxNQUFNO1lBQ2YsU0FBUyxFQUFFLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1NBQzFCO1FBQ2xDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQThCO1FBQ25ELGFBQWEsRUFBRSxRQUFxRDtRQUNwRSxnRUFBZ0U7UUFDaEUsVUFBVSxFQUFFLFFBQXFEO1FBQ2pFLFFBQVEsRUFBRSxNQUFNO0tBQ2pCO0lBRUQsSUFBSTtRQUNGLE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUE7UUFDdEIsT0FBTztZQUNMLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNyQyxRQUFRLEVBQUUsSUFBcUI7WUFDL0IsVUFBVSxFQUFFLElBQXFCO1lBQ2pDLFNBQVMsRUFBRSxJQUFxQjtZQUNoQyxXQUFXLEVBQUUsS0FBSztZQUNsQixHQUFHO1lBQ0gsNkZBQTZGO1lBQzdGLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRTtnQkFDZixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ25CLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQTtpQkFDdkI7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQyxLQUFrQixDQUFFLElBQUksQ0FBQyxLQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDckgsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFBO2dCQUM5QyxPQUFPLGtCQUFrQixDQUFDLElBQWMsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNwRixDQUFDLENBQUMsRUFBRTtTQUNMLENBQUE7SUFDSCxDQUFDO0lBRUQsUUFBUSxFQUFFO1FBQ1IsVUFBVTtZQUNSLE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFBO1FBQ3BDLENBQUM7UUFDRCxTQUFTO1lBQ1AsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUMsS0FBa0IsQ0FBRSxJQUFJLENBQUMsS0FBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQyxLQUF1QixDQUFBO1FBQ3hILENBQUM7UUFDRCxjQUFjO1lBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtnQkFDOUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO2FBQ2xCO2lCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDMUIsT0FBUSxJQUFJLENBQUMsS0FBa0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQzdEO2lCQUFNO2dCQUNMLE9BQVEsSUFBSSxDQUFDLEtBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTthQUMzQztRQUNILENBQUM7UUFDRCxPQUFPO1lBQ0wsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRTtnQkFDN0IsT0FBTyxrQkFBa0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTthQUNuSDtZQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUE7UUFDakMsQ0FBQztRQUNELFNBQVM7WUFDUCxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTTtnQkFDekIsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVMsQ0FBQyxFQUFFO2dCQUN6RSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFDdEQsQ0FBQztRQUNELFVBQVU7WUFDUixPQUFPLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN0RSxDQUFDO1FBQ0QsU0FBUztZQUNQLE9BQU8sTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEUsQ0FBQztRQUNELFFBQVE7WUFDTixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtRQUNoRSxDQUFDO1FBQ0QsUUFBUTtZQUNOLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO1FBQ2hFLENBQUM7UUFDRCxPQUFPO1lBQ0wsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7UUFDL0QsQ0FBQztRQUNELE9BQU87WUFDTCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtRQUMvRCxDQUFDO1FBQ0QsVUFBVTtZQUNSLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUM3SCxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWU7b0JBQzdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUM7YUFDOUYsQ0FBQTtRQUNILENBQUM7UUFDRCxpQ0FBaUM7WUFDL0IsT0FBTyxLQUFLLENBQUMsRUFBRTtnQkFDYixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtvQkFDakIsT0FBTyxHQUFHLENBQUE7aUJBQ1g7Z0JBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDdEIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQ2hEO2dCQUVELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDbkUsQ0FBQyxDQUFBO1FBQ0gsQ0FBQztRQUNELHlCQUF5QjtZQUN2QixNQUFNLFlBQVksR0FBRztnQkFDbkIsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO2dCQUMxQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7Z0JBQ3pDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7YUFDNUUsQ0FBQTtZQUVELE1BQU0sa0JBQWtCLEdBQUcsMkJBQTJCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNsRyxLQUFLLEVBQUUsQ0FBQztnQkFDUixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDbkQsQ0FBQyxDQUFBO1lBRUYsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2lCQUNsRSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxRQUFRLElBQUksS0FBSyxFQUFFLENBQUM7aUJBQy9FLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFFekIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUE7UUFDakUsQ0FBQztLQUNGO0lBRUQsS0FBSyxFQUFFO1FBQ0wsU0FBUyxDQUFFLEdBQVcsRUFBRSxJQUFZO1lBQ2xDLDJGQUEyRjtZQUMzRiw2Q0FBNkM7WUFDN0MsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO1lBQzdELElBQUksQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQTtZQUNqRyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZDLENBQUM7UUFDRCxVQUFVLENBQUUsR0FBa0I7WUFDNUIsSUFBSSxHQUFHLEVBQUU7Z0JBQ1AsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUE7YUFDckI7aUJBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO2dCQUNqRCxJQUFJLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7YUFDN0Q7aUJBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO2dCQUNsRCxJQUFJLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUE7YUFDNUQ7UUFDSCxDQUFDO1FBQ0QsS0FBSyxDQUFFLFFBQXlCLEVBQUUsUUFBeUI7WUFDekQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7WUFDeEIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1lBRW5CLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUN0RCxJQUFJLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7YUFDOUY7aUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFLLElBQUksQ0FBQyxLQUFrQixDQUFDLE1BQU0sSUFBSSxDQUFFLFFBQXFCLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDbkgsSUFBSSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO2FBQzlGO1FBQ0gsQ0FBQztRQUNELElBQUksQ0FBRSxJQUFvQjtZQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtZQUV0QyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQ25DLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUUsSUFBSSxDQUFDLEtBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQWUsQ0FBQyxDQUFDO3FCQUNqRixHQUFHLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtnQkFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTthQUMxRDtRQUNILENBQUM7S0FDRjtJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtRQUV4QixJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUNqRDtRQUNELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtJQUNyQixDQUFDO0lBRUQsT0FBTyxFQUFFO1FBQ1AsU0FBUyxDQUFFLFFBQWdCO1lBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUM1QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO2lCQUNoQztxQkFBTTtvQkFDTCxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQTtvQkFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7b0JBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO2lCQUM3QjtnQkFDRCxPQUFNO2FBQ1A7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUTtnQkFDMUIsQ0FBQyxDQUFDLENBQ0MsSUFBSSxDQUFDLEtBQWtCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDL0MsQ0FBQyxDQUFFLElBQUksQ0FBQyxLQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUM3QyxDQUFDLENBQUUsSUFBSSxDQUFDLEtBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUN6RDtnQkFDRCxDQUFDLENBQUMsUUFBUSxDQUFBO1lBRVosSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDM0IsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUNqRCxDQUFDO1FBQ0QsaUJBQWlCO1lBQ2YsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUk7Z0JBQUUsT0FBTTtZQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUE7WUFDN0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUE7WUFDckQsSUFBSSxTQUFTLEtBQUssUUFBUSxFQUFFO2dCQUMxQixXQUFXLENBQUMsaUJBQWlCLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFFBQVEsU0FBUyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQTthQUNqRztRQUNILENBQUM7UUFDRCxhQUFhLENBQUUsS0FBYTtZQUMxQixPQUFPLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUNwRSxDQUFDO1FBQ0QsU0FBUyxDQUFFLEtBQWE7WUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUE7WUFDdEIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtnQkFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFBO2FBQzVCO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxLQUFLLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFBO2FBQy9EO1lBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUE7WUFDM0IsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzdGLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTthQUNwQztRQUNILENBQUM7UUFDRCxVQUFVLENBQUUsS0FBYTtZQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQ2xELElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3ZELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7Z0JBQ3hCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO2lCQUMxRjtnQkFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtnQkFDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUE7Z0JBQzFCLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUM3RixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7aUJBQ3BDO2FBQ0Y7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7YUFDL0I7UUFDSCxDQUFDO1FBQ0QsU0FBUyxDQUFFLEtBQWE7WUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUNsRCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUN2RCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQ2pELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2hDLENBQUM7UUFDRCxjQUFjO1lBQ1osT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixFQUFFO2dCQUMzQyxLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBb0MsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3pGLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO29CQUN2QixhQUFhLEVBQUUsSUFBSSxDQUFDLFlBQVksS0FBSyxNQUFNO29CQUMzQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQzdFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQyxLQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSztpQkFDbEU7Z0JBQ0QsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsRUFBRSxFQUFFO29CQUNGLHVCQUF1QixFQUFFLENBQUMsS0FBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtpQkFDMUc7YUFDRixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsY0FBYztZQUNaLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDNUMsS0FBSyxFQUFFO29CQUNMLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2YsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO29CQUN2QixNQUFNLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtvQkFDN0IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU87b0JBQ2hFLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU87b0JBQ2hFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO29CQUN2QixLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRTtpQkFDNUg7Z0JBQ0QsRUFBRSxFQUFFO29CQUNGLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO29CQUNuRixLQUFLLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSztpQkFDakQ7YUFDRixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsWUFBWTtZQUNWLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsRUFBRTtnQkFDL0MsS0FBSyxFQUFFO29CQUNMLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDL0IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87b0JBQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7b0JBQ3ZCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtvQkFDbkIsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO29CQUMzQixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7b0JBQ25DLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUztvQkFDdEIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLG9CQUFvQixFQUFFLElBQUksQ0FBQyxvQkFBb0I7b0JBQy9DLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztvQkFDYixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7b0JBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7b0JBQ3ZCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtvQkFDM0IsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO29CQUN2QixTQUFTLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDbEUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7aUJBQ2xDO2dCQUNELEdBQUcsRUFBRSxPQUFPO2dCQUNaLEVBQUUsRUFBRTtvQkFDRixLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVM7b0JBQ3JCLG1CQUFtQixFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUs7b0JBQzlELFlBQVksRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDO29CQUNoRSxlQUFlLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQztpQkFDdkU7YUFDRixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsYUFBYTtZQUNYLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsRUFBRTtnQkFDaEQsS0FBSyxFQUFFO29CQUNMLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDOUQsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDeEUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO29CQUNmLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDdkIsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNsRCxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzFELE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVztvQkFDeEIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDbEIsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRO29CQUNsQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTztvQkFDaEQsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO29CQUMzQixLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWM7b0JBQzFCLFNBQVMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFO2lCQUN2QztnQkFDRCxHQUFHLEVBQUUsT0FBTztnQkFDWixFQUFFLEVBQUU7b0JBQ0YsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVO29CQUN0QixtQkFBbUIsRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLO29CQUM5RCxhQUFhLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQztvQkFDbEUsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDO2lCQUN6RTthQUNGLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFDRCxRQUFRO1lBQ04sT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixFQUFFO2dCQUMzQyxLQUFLLEVBQUU7b0JBQ0wsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7b0JBQ3ZCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtvQkFDbkIsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNqQixHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU87b0JBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUztpQkFDdEI7Z0JBQ0QsRUFBRSxFQUFFO29CQUNGLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUztpQkFDdEI7YUFDRixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsYUFBYTtZQUNYLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFFBQVEsRUFBRTthQUNoQixDQUFDLENBQUMsQ0FBQztnQkFDRixJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNyQixJQUFJLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO2FBQzFFLENBQUE7WUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO2dCQUNoQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVk7YUFDdkIsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUNkLENBQUM7UUFDRCxZQUFZO1lBQ1YsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO2dCQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUM1QyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO29CQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7aUJBQ3ZDO2FBQ0Y7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUE7Z0JBQ3pELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUE7Z0JBQ2pGLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFBO2FBQ3BEO1FBQ0gsQ0FBQztLQUNGO0lBRUQsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQ3pDLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb21wb25lbnRzXG5pbXBvcnQgVkRhdGVQaWNrZXJUaXRsZSBmcm9tICcuL1ZEYXRlUGlja2VyVGl0bGUnXG5pbXBvcnQgVkRhdGVQaWNrZXJIZWFkZXIgZnJvbSAnLi9WRGF0ZVBpY2tlckhlYWRlcidcbmltcG9ydCBWRGF0ZVBpY2tlckRhdGVUYWJsZSBmcm9tICcuL1ZEYXRlUGlja2VyRGF0ZVRhYmxlJ1xuaW1wb3J0IFZEYXRlUGlja2VyTW9udGhUYWJsZSBmcm9tICcuL1ZEYXRlUGlja2VyTW9udGhUYWJsZSdcbmltcG9ydCBWRGF0ZVBpY2tlclllYXJzIGZyb20gJy4vVkRhdGVQaWNrZXJZZWFycydcblxuLy8gTWl4aW5zXG5pbXBvcnQgTG9jYWxhYmxlIGZyb20gJy4uLy4uL21peGlucy9sb2NhbGFibGUnXG5pbXBvcnQgUGlja2VyIGZyb20gJy4uLy4uL21peGlucy9waWNrZXInXG5cbi8vIFV0aWxzXG5pbXBvcnQgeyBwYWQsIGNyZWF0ZU5hdGl2ZUxvY2FsZUZvcm1hdHRlciB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCBpc0RhdGVBbGxvd2VkIGZyb20gJy4vdXRpbC9pc0RhdGVBbGxvd2VkJ1xuaW1wb3J0IHsgY29uc29sZVdhcm4gfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5pbXBvcnQgeyBkYXlzSW5Nb250aCB9IGZyb20gJy4uL1ZDYWxlbmRhci91dGlsL3RpbWVzdGFtcCdcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBQcm9wVHlwZSwgUHJvcFZhbGlkYXRvciB9IGZyb20gJ3Z1ZS90eXBlcy9vcHRpb25zJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUnXG5pbXBvcnQge1xuICBEYXRlUGlja2VyRm9ybWF0dGVyLFxuICBEYXRlUGlja2VyTXVsdGlwbGVGb3JtYXR0ZXIsXG4gIERhdGVQaWNrZXJBbGxvd2VkRGF0ZXNGdW5jdGlvbixcbiAgRGF0ZVBpY2tlckV2ZW50Q29sb3JzLFxuICBEYXRlUGlja2VyRXZlbnRzLFxuICBEYXRlUGlja2VyVHlwZSxcbn0gZnJvbSAndHlwZXMnXG5cbnR5cGUgRGF0ZVBpY2tlclZhbHVlID0gc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWRcbmludGVyZmFjZSBGb3JtYXR0ZXJzIHtcbiAgeWVhcjogRGF0ZVBpY2tlckZvcm1hdHRlclxuICB0aXRsZURhdGU6IERhdGVQaWNrZXJGb3JtYXR0ZXIgfCBEYXRlUGlja2VyTXVsdGlwbGVGb3JtYXR0ZXJcbn1cblxuLy8gQWRkcyBsZWFkaW5nIHplcm8gdG8gbW9udGgvZGF5IGlmIG5lY2Vzc2FyeSwgcmV0dXJucyAnWVlZWScgaWYgdHlwZSA9ICd5ZWFyJyxcbi8vICdZWVlZLU1NJyBpZiAnbW9udGgnIGFuZCAnWVlZWS1NTS1ERCcgaWYgJ2RhdGUnXG5mdW5jdGlvbiBzYW5pdGl6ZURhdGVTdHJpbmcgKGRhdGVTdHJpbmc6IHN0cmluZywgdHlwZTogJ2RhdGUnIHwgJ21vbnRoJyB8ICd5ZWFyJyk6IHN0cmluZyB7XG4gIGNvbnN0IFt5ZWFyLCBtb250aCA9IDEsIGRhdGUgPSAxXSA9IGRhdGVTdHJpbmcuc3BsaXQoJy0nKVxuICByZXR1cm4gYCR7eWVhcn0tJHtwYWQobW9udGgpfS0ke3BhZChkYXRlKX1gLnN1YnN0cigwLCB7IGRhdGU6IDEwLCBtb250aDogNywgeWVhcjogNCB9W3R5cGVdKVxufVxuXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoXG4gIExvY2FsYWJsZSxcbiAgUGlja2VyXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuKS5leHRlbmQoe1xuICBuYW1lOiAndi1kYXRlLXBpY2tlcicsXG5cbiAgcHJvcHM6IHtcbiAgICBhbGxvd2VkRGF0ZXM6IEZ1bmN0aW9uIGFzIFByb3BUeXBlPERhdGVQaWNrZXJBbGxvd2VkRGF0ZXNGdW5jdGlvbiB8IHVuZGVmaW5lZD4sXG4gICAgLy8gRnVuY3Rpb24gZm9ybWF0dGluZyB0aGUgZGF5IGluIGRhdGUgcGlja2VyIHRhYmxlXG4gICAgZGF5Rm9ybWF0OiBGdW5jdGlvbiBhcyBQcm9wVHlwZTxEYXRlUGlja2VyQWxsb3dlZERhdGVzRnVuY3Rpb24gfCB1bmRlZmluZWQ+LFxuICAgIGRpc2FibGVkOiBCb29sZWFuLFxuICAgIGV2ZW50czoge1xuICAgICAgdHlwZTogW0FycmF5LCBGdW5jdGlvbiwgT2JqZWN0XSBhcyBQcm9wVHlwZTxEYXRlUGlja2VyRXZlbnRzPixcbiAgICAgIGRlZmF1bHQ6ICgpID0+IG51bGwsXG4gICAgfSxcbiAgICBldmVudENvbG9yOiB7XG4gICAgICB0eXBlOiBbQXJyYXksIEZ1bmN0aW9uLCBPYmplY3QsIFN0cmluZ10gYXMgUHJvcFR5cGU8RGF0ZVBpY2tlckV2ZW50Q29sb3JzPixcbiAgICAgIGRlZmF1bHQ6ICgpID0+ICd3YXJuaW5nJyxcbiAgICB9LFxuICAgIGZpcnN0RGF5T2ZXZWVrOiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBOdW1iZXJdLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICAgIC8vIEZ1bmN0aW9uIGZvcm1hdHRpbmcgdGhlIHRhYmxlRGF0ZSBpbiB0aGUgZGF5L21vbnRoIHRhYmxlIGhlYWRlclxuICAgIGhlYWRlckRhdGVGb3JtYXQ6IEZ1bmN0aW9uIGFzIFByb3BUeXBlPERhdGVQaWNrZXJGb3JtYXR0ZXIgfCB1bmRlZmluZWQ+LFxuICAgIGxvY2FsZUZpcnN0RGF5T2ZZZWFyOiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBOdW1iZXJdLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICAgIG1heDogU3RyaW5nLFxuICAgIG1pbjogU3RyaW5nLFxuICAgIC8vIEZ1bmN0aW9uIGZvcm1hdHRpbmcgbW9udGggaW4gdGhlIG1vbnRocyB0YWJsZVxuICAgIG1vbnRoRm9ybWF0OiBGdW5jdGlvbiBhcyBQcm9wVHlwZTxEYXRlUGlja2VyRm9ybWF0dGVyIHwgdW5kZWZpbmVkPixcbiAgICBtdWx0aXBsZTogQm9vbGVhbixcbiAgICBuZXh0SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRuZXh0JyxcbiAgICB9LFxuICAgIHBpY2tlckRhdGU6IFN0cmluZyxcbiAgICBwcmV2SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRwcmV2JyxcbiAgICB9LFxuICAgIHJhbmdlOiBCb29sZWFuLFxuICAgIHJlYWN0aXZlOiBCb29sZWFuLFxuICAgIHJlYWRvbmx5OiBCb29sZWFuLFxuICAgIHNjcm9sbGFibGU6IEJvb2xlYW4sXG4gICAgc2hvd0N1cnJlbnQ6IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIHNlbGVjdGVkSXRlbXNUZXh0OiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkuZGF0ZVBpY2tlci5pdGVtc1NlbGVjdGVkJyxcbiAgICB9LFxuICAgIHNob3dXZWVrOiBCb29sZWFuLFxuICAgIC8vIEZ1bmN0aW9uIGZvcm1hdHRpbmcgY3VycmVudGx5IHNlbGVjdGVkIGRhdGUgaW4gdGhlIHBpY2tlciB0aXRsZVxuICAgIHRpdGxlRGF0ZUZvcm1hdDogRnVuY3Rpb24gYXMgUHJvcFR5cGU8RGF0ZVBpY2tlckZvcm1hdHRlciB8IERhdGVQaWNrZXJNdWx0aXBsZUZvcm1hdHRlciB8IHVuZGVmaW5lZD4sXG4gICAgdHlwZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2RhdGUnLFxuICAgICAgdmFsaWRhdG9yOiAodHlwZTogYW55KSA9PiBbJ2RhdGUnLCAnbW9udGgnXS5pbmNsdWRlcyh0eXBlKSwgLy8gVE9ETzogeWVhclxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxEYXRlUGlja2VyVHlwZT4sXG4gICAgdmFsdWU6IFtBcnJheSwgU3RyaW5nXSBhcyBQcm9wVHlwZTxEYXRlUGlja2VyVmFsdWU+LFxuICAgIHdlZWtkYXlGb3JtYXQ6IEZ1bmN0aW9uIGFzIFByb3BUeXBlPERhdGVQaWNrZXJGb3JtYXR0ZXIgfCB1bmRlZmluZWQ+LFxuICAgIC8vIEZ1bmN0aW9uIGZvcm1hdHRpbmcgdGhlIHllYXIgaW4gdGFibGUgaGVhZGVyIGFuZCBwaWNrdXAgdGl0bGVcbiAgICB5ZWFyRm9ybWF0OiBGdW5jdGlvbiBhcyBQcm9wVHlwZTxEYXRlUGlja2VyRm9ybWF0dGVyIHwgdW5kZWZpbmVkPixcbiAgICB5ZWFySWNvbjogU3RyaW5nLFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgICByZXR1cm4ge1xuICAgICAgYWN0aXZlUGlja2VyOiB0aGlzLnR5cGUudG9VcHBlckNhc2UoKSxcbiAgICAgIGlucHV0RGF5OiBudWxsIGFzIG51bWJlciB8IG51bGwsXG4gICAgICBpbnB1dE1vbnRoOiBudWxsIGFzIG51bWJlciB8IG51bGwsXG4gICAgICBpbnB1dFllYXI6IG51bGwgYXMgbnVtYmVyIHwgbnVsbCxcbiAgICAgIGlzUmV2ZXJzaW5nOiBmYWxzZSxcbiAgICAgIG5vdyxcbiAgICAgIC8vIHRhYmxlRGF0ZSBpcyBhIHN0cmluZyBpbiAnWVlZWScgLyAnWVlZWS1NJyBmb3JtYXQgKGxlYWRpbmcgemVybyBmb3IgbW9udGggaXMgbm90IHJlcXVpcmVkKVxuICAgICAgdGFibGVEYXRlOiAoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5waWNrZXJEYXRlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGlja2VyRGF0ZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0ZSA9ICh0aGlzLm11bHRpcGxlIHx8IHRoaXMucmFuZ2UgPyAodGhpcy52YWx1ZSBhcyBzdHJpbmdbXSlbKHRoaXMudmFsdWUgYXMgc3RyaW5nW10pLmxlbmd0aCAtIDFdIDogdGhpcy52YWx1ZSkgfHxcbiAgICAgICAgICBgJHtub3cuZ2V0RnVsbFllYXIoKX0tJHtub3cuZ2V0TW9udGgoKSArIDF9YFxuICAgICAgICByZXR1cm4gc2FuaXRpemVEYXRlU3RyaW5nKGRhdGUgYXMgc3RyaW5nLCB0aGlzLnR5cGUgPT09ICdkYXRlJyA/ICdtb250aCcgOiAneWVhcicpXG4gICAgICB9KSgpLFxuICAgIH1cbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGlzTXVsdGlwbGUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbGUgfHwgdGhpcy5yYW5nZVxuICAgIH0sXG4gICAgbGFzdFZhbHVlICgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLmlzTXVsdGlwbGUgPyAodGhpcy52YWx1ZSBhcyBzdHJpbmdbXSlbKHRoaXMudmFsdWUgYXMgc3RyaW5nW10pLmxlbmd0aCAtIDFdIDogKHRoaXMudmFsdWUgYXMgc3RyaW5nIHwgbnVsbClcbiAgICB9LFxuICAgIHNlbGVjdGVkTW9udGhzICgpOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAoIXRoaXMudmFsdWUgfHwgIXRoaXMudmFsdWUubGVuZ3RoIHx8IHRoaXMudHlwZSA9PT0gJ21vbnRoJykge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzTXVsdGlwbGUpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnZhbHVlIGFzIHN0cmluZ1tdKS5tYXAodmFsID0+IHZhbC5zdWJzdHIoMCwgNykpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKHRoaXMudmFsdWUgYXMgc3RyaW5nKS5zdWJzdHIoMCwgNylcbiAgICAgIH1cbiAgICB9LFxuICAgIGN1cnJlbnQgKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgaWYgKHRoaXMuc2hvd0N1cnJlbnQgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuIHNhbml0aXplRGF0ZVN0cmluZyhgJHt0aGlzLm5vdy5nZXRGdWxsWWVhcigpfS0ke3RoaXMubm93LmdldE1vbnRoKCkgKyAxfS0ke3RoaXMubm93LmdldERhdGUoKX1gLCB0aGlzLnR5cGUpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnNob3dDdXJyZW50IHx8IG51bGxcbiAgICB9LFxuICAgIGlucHV0RGF0ZSAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09ICdkYXRlJ1xuICAgICAgICA/IGAke3RoaXMuaW5wdXRZZWFyfS0ke3BhZCh0aGlzLmlucHV0TW9udGghICsgMSl9LSR7cGFkKHRoaXMuaW5wdXREYXkhKX1gXG4gICAgICAgIDogYCR7dGhpcy5pbnB1dFllYXJ9LSR7cGFkKHRoaXMuaW5wdXRNb250aCEgKyAxKX1gXG4gICAgfSxcbiAgICB0YWJsZU1vbnRoICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIE51bWJlcigodGhpcy5waWNrZXJEYXRlIHx8IHRoaXMudGFibGVEYXRlKS5zcGxpdCgnLScpWzFdKSAtIDFcbiAgICB9LFxuICAgIHRhYmxlWWVhciAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBOdW1iZXIoKHRoaXMucGlja2VyRGF0ZSB8fCB0aGlzLnRhYmxlRGF0ZSkuc3BsaXQoJy0nKVswXSlcbiAgICB9LFxuICAgIG1pbk1vbnRoICgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLm1pbiA/IHNhbml0aXplRGF0ZVN0cmluZyh0aGlzLm1pbiwgJ21vbnRoJykgOiBudWxsXG4gICAgfSxcbiAgICBtYXhNb250aCAoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICByZXR1cm4gdGhpcy5tYXggPyBzYW5pdGl6ZURhdGVTdHJpbmcodGhpcy5tYXgsICdtb250aCcpIDogbnVsbFxuICAgIH0sXG4gICAgbWluWWVhciAoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICByZXR1cm4gdGhpcy5taW4gPyBzYW5pdGl6ZURhdGVTdHJpbmcodGhpcy5taW4sICd5ZWFyJykgOiBudWxsXG4gICAgfSxcbiAgICBtYXhZZWFyICgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLm1heCA/IHNhbml0aXplRGF0ZVN0cmluZyh0aGlzLm1heCwgJ3llYXInKSA6IG51bGxcbiAgICB9LFxuICAgIGZvcm1hdHRlcnMgKCk6IEZvcm1hdHRlcnMge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeWVhcjogdGhpcy55ZWFyRm9ybWF0IHx8IGNyZWF0ZU5hdGl2ZUxvY2FsZUZvcm1hdHRlcih0aGlzLmN1cnJlbnRMb2NhbGUsIHsgeWVhcjogJ251bWVyaWMnLCB0aW1lWm9uZTogJ1VUQycgfSwgeyBsZW5ndGg6IDQgfSksXG4gICAgICAgIHRpdGxlRGF0ZTogdGhpcy50aXRsZURhdGVGb3JtYXQgfHxcbiAgICAgICAgICAodGhpcy5pc011bHRpcGxlID8gdGhpcy5kZWZhdWx0VGl0bGVNdWx0aXBsZURhdGVGb3JtYXR0ZXIgOiB0aGlzLmRlZmF1bHRUaXRsZURhdGVGb3JtYXR0ZXIpLFxuICAgICAgfVxuICAgIH0sXG4gICAgZGVmYXVsdFRpdGxlTXVsdGlwbGVEYXRlRm9ybWF0dGVyICgpOiBEYXRlUGlja2VyTXVsdGlwbGVGb3JtYXR0ZXIge1xuICAgICAgcmV0dXJuIGRhdGVzID0+IHtcbiAgICAgICAgaWYgKCFkYXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gJy0nXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdFRpdGxlRGF0ZUZvcm1hdHRlcihkYXRlc1swXSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLiR2dWV0aWZ5LmxhbmcudCh0aGlzLnNlbGVjdGVkSXRlbXNUZXh0LCBkYXRlcy5sZW5ndGgpXG4gICAgICB9XG4gICAgfSxcbiAgICBkZWZhdWx0VGl0bGVEYXRlRm9ybWF0dGVyICgpOiBEYXRlUGlja2VyRm9ybWF0dGVyIHtcbiAgICAgIGNvbnN0IHRpdGxlRm9ybWF0cyA9IHtcbiAgICAgICAgeWVhcjogeyB5ZWFyOiAnbnVtZXJpYycsIHRpbWVab25lOiAnVVRDJyB9LFxuICAgICAgICBtb250aDogeyBtb250aDogJ2xvbmcnLCB0aW1lWm9uZTogJ1VUQycgfSxcbiAgICAgICAgZGF0ZTogeyB3ZWVrZGF5OiAnc2hvcnQnLCBtb250aDogJ3Nob3J0JywgZGF5OiAnbnVtZXJpYycsIHRpbWVab25lOiAnVVRDJyB9LFxuICAgICAgfVxuXG4gICAgICBjb25zdCB0aXRsZURhdGVGb3JtYXR0ZXIgPSBjcmVhdGVOYXRpdmVMb2NhbGVGb3JtYXR0ZXIodGhpcy5jdXJyZW50TG9jYWxlLCB0aXRsZUZvcm1hdHNbdGhpcy50eXBlXSwge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgbGVuZ3RoOiB7IGRhdGU6IDEwLCBtb250aDogNywgeWVhcjogNCB9W3RoaXMudHlwZV0sXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsYW5kc2NhcGVGb3JtYXR0ZXIgPSAoZGF0ZTogc3RyaW5nKSA9PiB0aXRsZURhdGVGb3JtYXR0ZXIoZGF0ZSlcbiAgICAgICAgLnJlcGxhY2UoLyhbXlxcZFxcc10pKFtcXGRdKS9nLCAobWF0Y2gsIG5vbkRpZ2l0LCBkaWdpdCkgPT4gYCR7bm9uRGlnaXR9ICR7ZGlnaXR9YClcbiAgICAgICAgLnJlcGxhY2UoJywgJywgJyw8YnI+JylcblxuICAgICAgcmV0dXJuIHRoaXMubGFuZHNjYXBlID8gbGFuZHNjYXBlRm9ybWF0dGVyIDogdGl0bGVEYXRlRm9ybWF0dGVyXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIHRhYmxlRGF0ZSAodmFsOiBzdHJpbmcsIHByZXY6IHN0cmluZykge1xuICAgICAgLy8gTWFrZSBhIElTTyA4NjAxIHN0cmluZ3MgZnJvbSB2YWwgYW5kIHByZXYgZm9yIGNvbXBhcmlzaW9uLCBvdGhlcndpc2UgaXQgd2lsbCBpbmNvcnJlY3RseVxuICAgICAgLy8gY29tcGFyZSBmb3IgZXhhbXBsZSAnMjAwMC05JyBhbmQgJzIwMDAtMTAnXG4gICAgICBjb25zdCBzYW5pdGl6ZVR5cGUgPSB0aGlzLnR5cGUgPT09ICdtb250aCcgPyAneWVhcicgOiAnbW9udGgnXG4gICAgICB0aGlzLmlzUmV2ZXJzaW5nID0gc2FuaXRpemVEYXRlU3RyaW5nKHZhbCwgc2FuaXRpemVUeXBlKSA8IHNhbml0aXplRGF0ZVN0cmluZyhwcmV2LCBzYW5pdGl6ZVR5cGUpXG4gICAgICB0aGlzLiRlbWl0KCd1cGRhdGU6cGlja2VyLWRhdGUnLCB2YWwpXG4gICAgfSxcbiAgICBwaWNrZXJEYXRlICh2YWw6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgdGhpcy50YWJsZURhdGUgPSB2YWxcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5sYXN0VmFsdWUgJiYgdGhpcy50eXBlID09PSAnZGF0ZScpIHtcbiAgICAgICAgdGhpcy50YWJsZURhdGUgPSBzYW5pdGl6ZURhdGVTdHJpbmcodGhpcy5sYXN0VmFsdWUsICdtb250aCcpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGFzdFZhbHVlICYmIHRoaXMudHlwZSA9PT0gJ21vbnRoJykge1xuICAgICAgICB0aGlzLnRhYmxlRGF0ZSA9IHNhbml0aXplRGF0ZVN0cmluZyh0aGlzLmxhc3RWYWx1ZSwgJ3llYXInKVxuICAgICAgfVxuICAgIH0sXG4gICAgdmFsdWUgKG5ld1ZhbHVlOiBEYXRlUGlja2VyVmFsdWUsIG9sZFZhbHVlOiBEYXRlUGlja2VyVmFsdWUpIHtcbiAgICAgIHRoaXMuY2hlY2tNdWx0aXBsZVByb3AoKVxuICAgICAgdGhpcy5zZXRJbnB1dERhdGUoKVxuXG4gICAgICBpZiAoIXRoaXMuaXNNdWx0aXBsZSAmJiB0aGlzLnZhbHVlICYmICF0aGlzLnBpY2tlckRhdGUpIHtcbiAgICAgICAgdGhpcy50YWJsZURhdGUgPSBzYW5pdGl6ZURhdGVTdHJpbmcodGhpcy5pbnB1dERhdGUsIHRoaXMudHlwZSA9PT0gJ21vbnRoJyA/ICd5ZWFyJyA6ICdtb250aCcpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNNdWx0aXBsZSAmJiAodGhpcy52YWx1ZSBhcyBzdHJpbmdbXSkubGVuZ3RoICYmICEob2xkVmFsdWUgYXMgc3RyaW5nW10pLmxlbmd0aCAmJiAhdGhpcy5waWNrZXJEYXRlKSB7XG4gICAgICAgIHRoaXMudGFibGVEYXRlID0gc2FuaXRpemVEYXRlU3RyaW5nKHRoaXMuaW5wdXREYXRlLCB0aGlzLnR5cGUgPT09ICdtb250aCcgPyAneWVhcicgOiAnbW9udGgnKVxuICAgICAgfVxuICAgIH0sXG4gICAgdHlwZSAodHlwZTogRGF0ZVBpY2tlclR5cGUpIHtcbiAgICAgIHRoaXMuYWN0aXZlUGlja2VyID0gdHlwZS50b1VwcGVyQ2FzZSgpXG5cbiAgICAgIGlmICh0aGlzLnZhbHVlICYmIHRoaXMudmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dCA9ICh0aGlzLmlzTXVsdGlwbGUgPyAodGhpcy52YWx1ZSBhcyBzdHJpbmdbXSkgOiBbdGhpcy52YWx1ZSBhcyBzdHJpbmddKVxuICAgICAgICAgIC5tYXAoKHZhbDogc3RyaW5nKSA9PiBzYW5pdGl6ZURhdGVTdHJpbmcodmFsLCB0eXBlKSlcbiAgICAgICAgICAuZmlsdGVyKHRoaXMuaXNEYXRlQWxsb3dlZClcbiAgICAgICAgdGhpcy4kZW1pdCgnaW5wdXQnLCB0aGlzLmlzTXVsdGlwbGUgPyBvdXRwdXQgOiBvdXRwdXRbMF0pXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICB0aGlzLmNoZWNrTXVsdGlwbGVQcm9wKClcblxuICAgIGlmICh0aGlzLnBpY2tlckRhdGUgIT09IHRoaXMudGFibGVEYXRlKSB7XG4gICAgICB0aGlzLiRlbWl0KCd1cGRhdGU6cGlja2VyLWRhdGUnLCB0aGlzLnRhYmxlRGF0ZSlcbiAgICB9XG4gICAgdGhpcy5zZXRJbnB1dERhdGUoKVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBlbWl0SW5wdXQgKG5ld0lucHV0OiBzdHJpbmcpIHtcbiAgICAgIGlmICh0aGlzLnJhbmdlICYmIHRoaXMudmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgdGhpcy4kZW1pdCgnaW5wdXQnLCBbbmV3SW5wdXRdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IG91dHB1dCA9IFsuLi50aGlzLnZhbHVlLCBuZXdJbnB1dF1cbiAgICAgICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIG91dHB1dClcbiAgICAgICAgICB0aGlzLiRlbWl0KCdjaGFuZ2UnLCBvdXRwdXQpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG91dHB1dCA9IHRoaXMubXVsdGlwbGVcbiAgICAgICAgPyAoXG4gICAgICAgICAgKHRoaXMudmFsdWUgYXMgc3RyaW5nW10pLmluZGV4T2YobmV3SW5wdXQpID09PSAtMVxuICAgICAgICAgICAgPyAodGhpcy52YWx1ZSBhcyBzdHJpbmdbXSkuY29uY2F0KFtuZXdJbnB1dF0pXG4gICAgICAgICAgICA6ICh0aGlzLnZhbHVlIGFzIHN0cmluZ1tdKS5maWx0ZXIoeCA9PiB4ICE9PSBuZXdJbnB1dClcbiAgICAgICAgKVxuICAgICAgICA6IG5ld0lucHV0XG5cbiAgICAgIHRoaXMuJGVtaXQoJ2lucHV0Jywgb3V0cHV0KVxuICAgICAgdGhpcy5tdWx0aXBsZSB8fCB0aGlzLiRlbWl0KCdjaGFuZ2UnLCBuZXdJbnB1dClcbiAgICB9LFxuICAgIGNoZWNrTXVsdGlwbGVQcm9wICgpIHtcbiAgICAgIGlmICh0aGlzLnZhbHVlID09IG51bGwpIHJldHVyblxuICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy52YWx1ZS5jb25zdHJ1Y3Rvci5uYW1lXG4gICAgICBjb25zdCBleHBlY3RlZCA9IHRoaXMuaXNNdWx0aXBsZSA/ICdBcnJheScgOiAnU3RyaW5nJ1xuICAgICAgaWYgKHZhbHVlVHlwZSAhPT0gZXhwZWN0ZWQpIHtcbiAgICAgICAgY29uc29sZVdhcm4oYFZhbHVlIG11c3QgYmUgJHt0aGlzLmlzTXVsdGlwbGUgPyAnYW4nIDogJ2EnfSAke2V4cGVjdGVkfSwgZ290ICR7dmFsdWVUeXBlfWAsIHRoaXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0RhdGVBbGxvd2VkICh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICByZXR1cm4gaXNEYXRlQWxsb3dlZCh2YWx1ZSwgdGhpcy5taW4sIHRoaXMubWF4LCB0aGlzLmFsbG93ZWREYXRlcylcbiAgICB9LFxuICAgIHllYXJDbGljayAodmFsdWU6IG51bWJlcikge1xuICAgICAgdGhpcy5pbnB1dFllYXIgPSB2YWx1ZVxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ21vbnRoJykge1xuICAgICAgICB0aGlzLnRhYmxlRGF0ZSA9IGAke3ZhbHVlfWBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGFibGVEYXRlID0gYCR7dmFsdWV9LSR7cGFkKCh0aGlzLnRhYmxlTW9udGggfHwgMCkgKyAxKX1gXG4gICAgICB9XG4gICAgICB0aGlzLmFjdGl2ZVBpY2tlciA9ICdNT05USCdcbiAgICAgIGlmICh0aGlzLnJlYWN0aXZlICYmICF0aGlzLnJlYWRvbmx5ICYmICF0aGlzLmlzTXVsdGlwbGUgJiYgdGhpcy5pc0RhdGVBbGxvd2VkKHRoaXMuaW5wdXREYXRlKSkge1xuICAgICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIHRoaXMuaW5wdXREYXRlKVxuICAgICAgfVxuICAgIH0sXG4gICAgbW9udGhDbGljayAodmFsdWU6IHN0cmluZykge1xuICAgICAgdGhpcy5pbnB1dFllYXIgPSBwYXJzZUludCh2YWx1ZS5zcGxpdCgnLScpWzBdLCAxMClcbiAgICAgIHRoaXMuaW5wdXRNb250aCA9IHBhcnNlSW50KHZhbHVlLnNwbGl0KCctJylbMV0sIDEwKSAtIDFcbiAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICBpZiAodGhpcy5pbnB1dERheSkge1xuICAgICAgICAgIHRoaXMuaW5wdXREYXkgPSBNYXRoLm1pbih0aGlzLmlucHV0RGF5LCBkYXlzSW5Nb250aCh0aGlzLmlucHV0WWVhciwgdGhpcy5pbnB1dE1vbnRoICsgMSkpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRhYmxlRGF0ZSA9IHZhbHVlXG4gICAgICAgIHRoaXMuYWN0aXZlUGlja2VyID0gJ0RBVEUnXG4gICAgICAgIGlmICh0aGlzLnJlYWN0aXZlICYmICF0aGlzLnJlYWRvbmx5ICYmICF0aGlzLmlzTXVsdGlwbGUgJiYgdGhpcy5pc0RhdGVBbGxvd2VkKHRoaXMuaW5wdXREYXRlKSkge1xuICAgICAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgdGhpcy5pbnB1dERhdGUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZW1pdElucHV0KHRoaXMuaW5wdXREYXRlKVxuICAgICAgfVxuICAgIH0sXG4gICAgZGF0ZUNsaWNrICh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICB0aGlzLmlucHV0WWVhciA9IHBhcnNlSW50KHZhbHVlLnNwbGl0KCctJylbMF0sIDEwKVxuICAgICAgdGhpcy5pbnB1dE1vbnRoID0gcGFyc2VJbnQodmFsdWUuc3BsaXQoJy0nKVsxXSwgMTApIC0gMVxuICAgICAgdGhpcy5pbnB1dERheSA9IHBhcnNlSW50KHZhbHVlLnNwbGl0KCctJylbMl0sIDEwKVxuICAgICAgdGhpcy5lbWl0SW5wdXQodGhpcy5pbnB1dERhdGUpXG4gICAgfSxcbiAgICBnZW5QaWNrZXJUaXRsZSAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRGF0ZVBpY2tlclRpdGxlLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgZGF0ZTogdGhpcy52YWx1ZSA/ICh0aGlzLmZvcm1hdHRlcnMudGl0bGVEYXRlIGFzICh2YWx1ZTogYW55KSA9PiBzdHJpbmcpKHRoaXMudmFsdWUpIDogJycsXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgcmVhZG9ubHk6IHRoaXMucmVhZG9ubHksXG4gICAgICAgICAgc2VsZWN0aW5nWWVhcjogdGhpcy5hY3RpdmVQaWNrZXIgPT09ICdZRUFSJyxcbiAgICAgICAgICB5ZWFyOiB0aGlzLmZvcm1hdHRlcnMueWVhcih0aGlzLnZhbHVlID8gYCR7dGhpcy5pbnB1dFllYXJ9YCA6IHRoaXMudGFibGVEYXRlKSxcbiAgICAgICAgICB5ZWFySWNvbjogdGhpcy55ZWFySWNvbixcbiAgICAgICAgICB2YWx1ZTogdGhpcy5pc011bHRpcGxlID8gKHRoaXMudmFsdWUgYXMgc3RyaW5nW10pWzBdIDogdGhpcy52YWx1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgc2xvdDogJ3RpdGxlJyxcbiAgICAgICAgb246IHtcbiAgICAgICAgICAndXBkYXRlOnNlbGVjdGluZy15ZWFyJzogKHZhbHVlOiBib29sZWFuKSA9PiB0aGlzLmFjdGl2ZVBpY2tlciA9IHZhbHVlID8gJ1lFQVInIDogdGhpcy50eXBlLnRvVXBwZXJDYXNlKCksXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuVGFibGVIZWFkZXIgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkRhdGVQaWNrZXJIZWFkZXIsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBuZXh0SWNvbjogdGhpcy5uZXh0SWNvbixcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcbiAgICAgICAgICBkYXJrOiB0aGlzLmRhcmssXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgZm9ybWF0OiB0aGlzLmhlYWRlckRhdGVGb3JtYXQsXG4gICAgICAgICAgbGlnaHQ6IHRoaXMubGlnaHQsXG4gICAgICAgICAgbG9jYWxlOiB0aGlzLmxvY2FsZSxcbiAgICAgICAgICBtaW46IHRoaXMuYWN0aXZlUGlja2VyID09PSAnREFURScgPyB0aGlzLm1pbk1vbnRoIDogdGhpcy5taW5ZZWFyLFxuICAgICAgICAgIG1heDogdGhpcy5hY3RpdmVQaWNrZXIgPT09ICdEQVRFJyA/IHRoaXMubWF4TW9udGggOiB0aGlzLm1heFllYXIsXG4gICAgICAgICAgcHJldkljb246IHRoaXMucHJldkljb24sXG4gICAgICAgICAgcmVhZG9ubHk6IHRoaXMucmVhZG9ubHksXG4gICAgICAgICAgdmFsdWU6IHRoaXMuYWN0aXZlUGlja2VyID09PSAnREFURScgPyBgJHtwYWQodGhpcy50YWJsZVllYXIsIDQpfS0ke3BhZCh0aGlzLnRhYmxlTW9udGggKyAxKX1gIDogYCR7cGFkKHRoaXMudGFibGVZZWFyLCA0KX1gLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIHRvZ2dsZTogKCkgPT4gdGhpcy5hY3RpdmVQaWNrZXIgPSAodGhpcy5hY3RpdmVQaWNrZXIgPT09ICdEQVRFJyA/ICdNT05USCcgOiAnWUVBUicpLFxuICAgICAgICAgIGlucHV0OiAodmFsdWU6IHN0cmluZykgPT4gdGhpcy50YWJsZURhdGUgPSB2YWx1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5EYXRlVGFibGUgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkRhdGVQaWNrZXJEYXRlVGFibGUsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBhbGxvd2VkRGF0ZXM6IHRoaXMuYWxsb3dlZERhdGVzLFxuICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLFxuICAgICAgICAgIGN1cnJlbnQ6IHRoaXMuY3VycmVudCxcbiAgICAgICAgICBkYXJrOiB0aGlzLmRhcmssXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgZXZlbnRzOiB0aGlzLmV2ZW50cyxcbiAgICAgICAgICBldmVudENvbG9yOiB0aGlzLmV2ZW50Q29sb3IsXG4gICAgICAgICAgZmlyc3REYXlPZldlZWs6IHRoaXMuZmlyc3REYXlPZldlZWssXG4gICAgICAgICAgZm9ybWF0OiB0aGlzLmRheUZvcm1hdCxcbiAgICAgICAgICBsaWdodDogdGhpcy5saWdodCxcbiAgICAgICAgICBsb2NhbGU6IHRoaXMubG9jYWxlLFxuICAgICAgICAgIGxvY2FsZUZpcnN0RGF5T2ZZZWFyOiB0aGlzLmxvY2FsZUZpcnN0RGF5T2ZZZWFyLFxuICAgICAgICAgIG1pbjogdGhpcy5taW4sXG4gICAgICAgICAgbWF4OiB0aGlzLm1heCxcbiAgICAgICAgICByYW5nZTogdGhpcy5yYW5nZSxcbiAgICAgICAgICByZWFkb25seTogdGhpcy5yZWFkb25seSxcbiAgICAgICAgICBzY3JvbGxhYmxlOiB0aGlzLnNjcm9sbGFibGUsXG4gICAgICAgICAgc2hvd1dlZWs6IHRoaXMuc2hvd1dlZWssXG4gICAgICAgICAgdGFibGVEYXRlOiBgJHtwYWQodGhpcy50YWJsZVllYXIsIDQpfS0ke3BhZCh0aGlzLnRhYmxlTW9udGggKyAxKX1gLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgICAgIHdlZWtkYXlGb3JtYXQ6IHRoaXMud2Vla2RheUZvcm1hdCxcbiAgICAgICAgfSxcbiAgICAgICAgcmVmOiAndGFibGUnLFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGlucHV0OiB0aGlzLmRhdGVDbGljayxcbiAgICAgICAgICAndXBkYXRlOnRhYmxlLWRhdGUnOiAodmFsdWU6IHN0cmluZykgPT4gdGhpcy50YWJsZURhdGUgPSB2YWx1ZSxcbiAgICAgICAgICAnY2xpY2s6ZGF0ZSc6ICh2YWx1ZTogc3RyaW5nKSA9PiB0aGlzLiRlbWl0KCdjbGljazpkYXRlJywgdmFsdWUpLFxuICAgICAgICAgICdkYmxjbGljazpkYXRlJzogKHZhbHVlOiBzdHJpbmcpID0+IHRoaXMuJGVtaXQoJ2RibGNsaWNrOmRhdGUnLCB2YWx1ZSksXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuTW9udGhUYWJsZSAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRGF0ZVBpY2tlck1vbnRoVGFibGUsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBhbGxvd2VkRGF0ZXM6IHRoaXMudHlwZSA9PT0gJ21vbnRoJyA/IHRoaXMuYWxsb3dlZERhdGVzIDogbnVsbCxcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcbiAgICAgICAgICBjdXJyZW50OiB0aGlzLmN1cnJlbnQgPyBzYW5pdGl6ZURhdGVTdHJpbmcodGhpcy5jdXJyZW50LCAnbW9udGgnKSA6IG51bGwsXG4gICAgICAgICAgZGFyazogdGhpcy5kYXJrLFxuICAgICAgICAgIGRpc2FibGVkOiB0aGlzLmRpc2FibGVkLFxuICAgICAgICAgIGV2ZW50czogdGhpcy50eXBlID09PSAnbW9udGgnID8gdGhpcy5ldmVudHMgOiBudWxsLFxuICAgICAgICAgIGV2ZW50Q29sb3I6IHRoaXMudHlwZSA9PT0gJ21vbnRoJyA/IHRoaXMuZXZlbnRDb2xvciA6IG51bGwsXG4gICAgICAgICAgZm9ybWF0OiB0aGlzLm1vbnRoRm9ybWF0LFxuICAgICAgICAgIGxpZ2h0OiB0aGlzLmxpZ2h0LFxuICAgICAgICAgIGxvY2FsZTogdGhpcy5sb2NhbGUsXG4gICAgICAgICAgbWluOiB0aGlzLm1pbk1vbnRoLFxuICAgICAgICAgIG1heDogdGhpcy5tYXhNb250aCxcbiAgICAgICAgICByYW5nZTogdGhpcy5yYW5nZSxcbiAgICAgICAgICByZWFkb25seTogdGhpcy5yZWFkb25seSAmJiB0aGlzLnR5cGUgPT09ICdtb250aCcsXG4gICAgICAgICAgc2Nyb2xsYWJsZTogdGhpcy5zY3JvbGxhYmxlLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLnNlbGVjdGVkTW9udGhzLFxuICAgICAgICAgIHRhYmxlRGF0ZTogYCR7cGFkKHRoaXMudGFibGVZZWFyLCA0KX1gLFxuICAgICAgICB9LFxuICAgICAgICByZWY6ICd0YWJsZScsXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgaW5wdXQ6IHRoaXMubW9udGhDbGljayxcbiAgICAgICAgICAndXBkYXRlOnRhYmxlLWRhdGUnOiAodmFsdWU6IHN0cmluZykgPT4gdGhpcy50YWJsZURhdGUgPSB2YWx1ZSxcbiAgICAgICAgICAnY2xpY2s6bW9udGgnOiAodmFsdWU6IHN0cmluZykgPT4gdGhpcy4kZW1pdCgnY2xpY2s6bW9udGgnLCB2YWx1ZSksXG4gICAgICAgICAgJ2RibGNsaWNrOm1vbnRoJzogKHZhbHVlOiBzdHJpbmcpID0+IHRoaXMuJGVtaXQoJ2RibGNsaWNrOm1vbnRoJywgdmFsdWUpLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlblllYXJzICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZEYXRlUGlja2VyWWVhcnMsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcbiAgICAgICAgICBmb3JtYXQ6IHRoaXMueWVhckZvcm1hdCxcbiAgICAgICAgICBsb2NhbGU6IHRoaXMubG9jYWxlLFxuICAgICAgICAgIG1pbjogdGhpcy5taW5ZZWFyLFxuICAgICAgICAgIG1heDogdGhpcy5tYXhZZWFyLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLnRhYmxlWWVhcixcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBpbnB1dDogdGhpcy55ZWFyQ2xpY2ssXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuUGlja2VyQm9keSAoKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuYWN0aXZlUGlja2VyID09PSAnWUVBUicgPyBbXG4gICAgICAgIHRoaXMuZ2VuWWVhcnMoKSxcbiAgICAgIF0gOiBbXG4gICAgICAgIHRoaXMuZ2VuVGFibGVIZWFkZXIoKSxcbiAgICAgICAgdGhpcy5hY3RpdmVQaWNrZXIgPT09ICdEQVRFJyA/IHRoaXMuZ2VuRGF0ZVRhYmxlKCkgOiB0aGlzLmdlbk1vbnRoVGFibGUoKSxcbiAgICAgIF1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiB0aGlzLmFjdGl2ZVBpY2tlcixcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgc2V0SW5wdXREYXRlICgpIHtcbiAgICAgIGlmICh0aGlzLmxhc3RWYWx1ZSkge1xuICAgICAgICBjb25zdCBhcnJheSA9IHRoaXMubGFzdFZhbHVlLnNwbGl0KCctJylcbiAgICAgICAgdGhpcy5pbnB1dFllYXIgPSBwYXJzZUludChhcnJheVswXSwgMTApXG4gICAgICAgIHRoaXMuaW5wdXRNb250aCA9IHBhcnNlSW50KGFycmF5WzFdLCAxMCkgLSAxXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdkYXRlJykge1xuICAgICAgICAgIHRoaXMuaW5wdXREYXkgPSBwYXJzZUludChhcnJheVsyXSwgMTApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW5wdXRZZWFyID0gdGhpcy5pbnB1dFllYXIgfHwgdGhpcy5ub3cuZ2V0RnVsbFllYXIoKVxuICAgICAgICB0aGlzLmlucHV0TW9udGggPSB0aGlzLmlucHV0TW9udGggPT0gbnVsbCA/IHRoaXMuaW5wdXRNb250aCA6IHRoaXMubm93LmdldE1vbnRoKClcbiAgICAgICAgdGhpcy5pbnB1dERheSA9IHRoaXMuaW5wdXREYXkgfHwgdGhpcy5ub3cuZ2V0RGF0ZSgpXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKCk6IFZOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5nZW5QaWNrZXIoJ3YtcGlja2VyLS1kYXRlJylcbiAgfSxcbn0pXG4iXX0=