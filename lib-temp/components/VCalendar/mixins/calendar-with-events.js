// Styles
import './calendar-with-events.sass';
// Directives
import ripple from '../../../directives/ripple';
// Mixins
import CalendarBase from './calendar-base';
// Helpers
import { escapeHTML } from '../../../util/helpers';
// Util
import props from '../util/props';
import { CalendarEventOverlapModes, } from '../modes';
import { getDayIdentifier, diffMinutes, } from '../util/timestamp';
import { parseEvent, isEventStart, isEventOn, isEventOverlapping, } from '../util/events';
const WIDTH_FULL = 100;
const WIDTH_START = 95;
const MINUTES_IN_DAY = 1440;
/* @vue/component */
export default CalendarBase.extend({
    name: 'calendar-with-events',
    directives: {
        ripple,
    },
    props: props.events,
    computed: {
        noEvents() {
            return this.events.length === 0;
        },
        parsedEvents() {
            return this.events.map((input, index) => parseEvent(input, index, this.eventStart, this.eventEnd));
        },
        parsedEventOverlapThreshold() {
            return parseInt(this.eventOverlapThreshold);
        },
        eventColorFunction() {
            return typeof this.eventColor === 'function'
                ? this.eventColor
                : () => this.eventColor;
        },
        eventTextColorFunction() {
            return typeof this.eventTextColor === 'function'
                ? this.eventTextColor
                : () => this.eventTextColor;
        },
        eventNameFunction() {
            return typeof this.eventName === 'function'
                ? this.eventName
                : (event, timedEvent) => {
                    const name = escapeHTML(event.input[this.eventName]);
                    if (event.start.hasTime) {
                        if (timedEvent) {
                            const showStart = event.start.hour < 12 && event.end.hour >= 12;
                            const start = this.formatTime(event.start, showStart);
                            const end = this.formatTime(event.end, true);
                            const singline = diffMinutes(event.start, event.end) <= this.parsedEventOverlapThreshold;
                            const separator = singline ? ', ' : '<br>';
                            return `<strong>${name}</strong>${separator}${start} - ${end}`;
                        }
                        else {
                            const time = this.formatTime(event.start, true);
                            return `<strong>${time}</strong> ${name}`;
                        }
                    }
                    return name;
                };
        },
        eventModeFunction() {
            return typeof this.eventOverlapMode === 'function'
                ? this.eventOverlapMode
                : CalendarEventOverlapModes[this.eventOverlapMode];
        },
        eventWeekdays() {
            return this.parsedWeekdays;
        },
    },
    methods: {
        formatTime(withTime, ampm) {
            const formatter = this.getFormatter({
                timeZone: 'UTC',
                hour: 'numeric',
                minute: withTime.minute > 0 ? 'numeric' : undefined,
            });
            return formatter(withTime, true);
        },
        updateEventVisibility() {
            if (this.noEvents || !this.eventMore) {
                return;
            }
            const eventHeight = this.eventHeight;
            const eventsMap = this.getEventsMap();
            for (const date in eventsMap) {
                const { parent, events, more } = eventsMap[date];
                if (!more) {
                    break;
                }
                const parentBounds = parent.getBoundingClientRect();
                const last = events.length - 1;
                let hide = false;
                let hidden = 0;
                for (let i = 0; i <= last; i++) {
                    if (!hide) {
                        const eventBounds = events[i].getBoundingClientRect();
                        hide = i === last
                            ? (eventBounds.bottom > parentBounds.bottom)
                            : (eventBounds.bottom + eventHeight > parentBounds.bottom);
                    }
                    if (hide) {
                        events[i].style.display = 'none';
                        hidden++;
                    }
                }
                if (hide) {
                    more.style.display = '';
                    more.innerHTML = this.$vuetify.lang.t(this.eventMoreText, hidden);
                }
                else {
                    more.style.display = 'none';
                }
            }
        },
        getEventsMap() {
            const eventsMap = {};
            const elements = this.$refs.events;
            if (!elements || !elements.forEach) {
                return eventsMap;
            }
            elements.forEach(el => {
                const date = el.getAttribute('data-date');
                if (el.parentElement && date) {
                    if (!(date in eventsMap)) {
                        eventsMap[date] = {
                            parent: el.parentElement,
                            more: null,
                            events: [],
                        };
                    }
                    if (el.getAttribute('data-more')) {
                        eventsMap[date].more = el;
                    }
                    else {
                        eventsMap[date].events.push(el);
                        el.style.display = '';
                    }
                }
            });
            return eventsMap;
        },
        genDayEvent({ event }, day) {
            const eventHeight = this.eventHeight;
            const eventMarginBottom = this.eventMarginBottom;
            const dayIdentifier = getDayIdentifier(day);
            const week = day.week;
            const start = dayIdentifier === event.startIdentifier;
            let end = dayIdentifier === event.endIdentifier;
            let width = WIDTH_START;
            for (let i = day.index + 1; i < week.length; i++) {
                const weekdayIdentifier = getDayIdentifier(week[i]);
                if (event.endIdentifier >= weekdayIdentifier) {
                    width += WIDTH_FULL;
                    if (weekdayIdentifier === event.endIdentifier) {
                        end = true;
                    }
                }
                else {
                    end = true;
                    break;
                }
            }
            const scope = { event: event.input, day, outside: day.outside, start, end, timed: false };
            return this.genEvent(event, scope, false, {
                staticClass: 'v-event',
                class: {
                    'v-event-start': start,
                    'v-event-end': end,
                },
                style: {
                    height: `${eventHeight}px`,
                    width: `${width}%`,
                    'margin-bottom': `${eventMarginBottom}px`,
                },
                attrs: {
                    'data-date': day.date,
                },
                key: event.index,
                ref: 'events',
                refInFor: true,
            });
        },
        genTimedEvent({ event, left, width }, day) {
            const dayIdentifier = getDayIdentifier(day);
            const start = event.startIdentifier >= dayIdentifier;
            const end = event.endIdentifier > dayIdentifier;
            const top = start ? day.timeToY(event.start) : 0;
            const bottom = end ? day.timeToY(MINUTES_IN_DAY) : day.timeToY(event.end);
            const height = Math.max(this.eventHeight, bottom - top);
            const scope = { event: event.input, day, outside: day.outside, start, end, timed: true };
            return this.genEvent(event, scope, true, {
                staticClass: 'v-event-timed',
                style: {
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${left}%`,
                    width: `${width}%`,
                },
            });
        },
        genEvent(event, scope, timedEvent, data) {
            const slot = this.$scopedSlots.event;
            const text = this.eventTextColorFunction(event.input);
            const background = this.eventColorFunction(event.input);
            return this.$createElement('div', this.setTextColor(text, this.setBackgroundColor(background, {
                on: this.getDefaultMouseEventHandlers(':event', nativeEvent => ({ ...scope, nativeEvent })),
                directives: [{
                        name: 'ripple',
                        value: this.eventRipple != null ? this.eventRipple : true,
                    }],
                ...data,
            })), slot
                ? slot(scope)
                : [this.genName(event, timedEvent)]);
        },
        genName(event, timedEvent) {
            return this.$createElement('div', {
                staticClass: 'pl-1',
                domProps: {
                    innerHTML: this.eventNameFunction(event, timedEvent),
                },
            });
        },
        genPlaceholder(day) {
            const height = this.eventHeight + this.eventMarginBottom;
            return this.$createElement('div', {
                style: {
                    height: `${height}px`,
                },
                attrs: {
                    'data-date': day.date,
                },
                ref: 'events',
                refInFor: true,
            });
        },
        genMore(day) {
            const eventHeight = this.eventHeight;
            const eventMarginBottom = this.eventMarginBottom;
            return this.$createElement('div', {
                staticClass: 'v-event-more pl-1',
                class: {
                    'v-outside': day.outside,
                },
                attrs: {
                    'data-date': day.date,
                    'data-more': 1,
                },
                directives: [{
                        name: 'ripple',
                        value: this.eventRipple != null ? this.eventRipple : true,
                    }],
                on: {
                    click: () => this.$emit('click:more', day),
                },
                style: {
                    display: 'none',
                    height: `${eventHeight}px`,
                    'margin-bottom': `${eventMarginBottom}px`,
                },
                ref: 'events',
                refInFor: true,
            });
        },
        getVisibleEvents() {
            const start = getDayIdentifier(this.days[0]);
            const end = getDayIdentifier(this.days[this.days.length - 1]);
            return this.parsedEvents.filter(event => isEventOverlapping(event, start, end));
        },
        getEventsForDay(day) {
            const identifier = getDayIdentifier(day);
            const firstWeekday = this.eventWeekdays[0];
            return this.parsedEvents.filter(event => isEventStart(event, day, identifier, firstWeekday));
        },
        getEventsForDayAll(day) {
            const identifier = getDayIdentifier(day);
            const firstWeekday = this.eventWeekdays[0];
            return this.parsedEvents.filter(event => event.allDay && isEventStart(event, day, identifier, firstWeekday));
        },
        getEventsForDayTimed(day) {
            const identifier = getDayIdentifier(day);
            return this.parsedEvents.filter(event => !event.allDay && isEventOn(event, identifier));
        },
        getScopedSlots() {
            if (this.noEvents) {
                return { ...this.$scopedSlots };
            }
            const mode = this.eventModeFunction(this.parsedEvents, this.eventWeekdays[0], this.parsedEventOverlapThreshold);
            const getSlotChildren = (day, getter, mapper, timed) => {
                const events = getter(day);
                if (events.length === 0) {
                    return;
                }
                const visuals = mode(day, events, timed);
                if (timed) {
                    return visuals.map(visual => mapper(visual, day));
                }
                const children = [];
                visuals.forEach((visual, index) => {
                    while (children.length < visual.column) {
                        children.push(this.genPlaceholder(day));
                    }
                    children.push(mapper(visual, day));
                });
                return children;
            };
            const slots = this.$scopedSlots;
            const slotDay = slots.day;
            const slotDayHeader = slots['day-header'];
            const slotDayBody = slots['day-body'];
            return {
                ...slots,
                day: (day) => {
                    let children = getSlotChildren(day, this.getEventsForDay, this.genDayEvent, false);
                    if (children && children.length > 0 && this.eventMore) {
                        children.push(this.genMore(day));
                    }
                    if (slotDay) {
                        const slot = slotDay(day);
                        if (slot) {
                            children = children ? children.concat(slot) : slot;
                        }
                    }
                    return children;
                },
                'day-header': (day) => {
                    let children = getSlotChildren(day, this.getEventsForDayAll, this.genDayEvent, false);
                    if (slotDayHeader) {
                        const slot = slotDayHeader(day);
                        if (slot) {
                            children = children ? children.concat(slot) : slot;
                        }
                    }
                    return children;
                },
                'day-body': (day) => {
                    const events = getSlotChildren(day, this.getEventsForDayTimed, this.genTimedEvent, true);
                    let children = [
                        this.$createElement('div', {
                            staticClass: 'v-event-timed-container',
                        }, events),
                    ];
                    if (slotDayBody) {
                        const slot = slotDayBody(day);
                        if (slot) {
                            children = children.concat(slot);
                        }
                    }
                    return children;
                },
            };
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItd2l0aC1ldmVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ2FsZW5kYXIvbWl4aW5zL2NhbGVuZGFyLXdpdGgtZXZlbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLDZCQUE2QixDQUFBO0FBS3BDLGFBQWE7QUFDYixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUUvQyxTQUFTO0FBQ1QsT0FBTyxZQUFZLE1BQU0saUJBQWlCLENBQUE7QUFFMUMsVUFBVTtBQUNWLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUVsRCxPQUFPO0FBQ1AsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFBO0FBQ2pDLE9BQU8sRUFDTCx5QkFBeUIsR0FDMUIsTUFBTSxVQUFVLENBQUE7QUFDakIsT0FBTyxFQUNMLGdCQUFnQixFQUFFLFdBQVcsR0FDOUIsTUFBTSxtQkFBbUIsQ0FBQTtBQUMxQixPQUFPLEVBQ0wsVUFBVSxFQUNWLFlBQVksRUFDWixTQUFTLEVBQ1Qsa0JBQWtCLEdBQ25CLE1BQU0sZ0JBQWdCLENBQUE7QUErQnZCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQTtBQUN0QixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUE7QUFDdEIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFBO0FBRTNCLG9CQUFvQjtBQUNwQixlQUFlLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDakMsSUFBSSxFQUFFLHNCQUFzQjtJQUU1QixVQUFVLEVBQUU7UUFDVixNQUFNO0tBQ1A7SUFFRCxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU07SUFFbkIsUUFBUSxFQUFFO1FBQ1IsUUFBUTtZQUNOLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFBO1FBQ2pDLENBQUM7UUFDRCxZQUFZO1lBQ1YsT0FBTyxJQUFJLENBQUMsTUFBTSxD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bmltcG9ydCAnLi9jYWxlbmRhci13aXRoLWV2ZW50cy5zYXNzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUsIFZOb2RlRGF0YSB9IGZyb20gJ3Z1ZSdcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IHJpcHBsZSBmcm9tICcuLi8uLi8uLi9kaXJlY3RpdmVzL3JpcHBsZSdcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ2FsZW5kYXJCYXNlIGZyb20gJy4vY2FsZW5kYXItYmFzZSdcblxuLy8gSGVscGVyc1xuaW1wb3J0IHsgZXNjYXBlSFRNTCB9IGZyb20gJy4uLy4uLy4uL3V0aWwvaGVscGVycydcblxuLy8gVXRpbFxuaW1wb3J0IHByb3BzIGZyb20gJy4uL3V0aWwvcHJvcHMnXG5pbXBvcnQge1xuICBDYWxlbmRhckV2ZW50T3ZlcmxhcE1vZGVzLFxufSBmcm9tICcuLi9tb2RlcydcbmltcG9ydCB7XG4gIGdldERheUlkZW50aWZpZXIsIGRpZmZNaW51dGVzLFxufSBmcm9tICcuLi91dGlsL3RpbWVzdGFtcCdcbmltcG9ydCB7XG4gIHBhcnNlRXZlbnQsXG4gIGlzRXZlbnRTdGFydCxcbiAgaXNFdmVudE9uLFxuICBpc0V2ZW50T3ZlcmxhcHBpbmcsXG59IGZyb20gJy4uL3V0aWwvZXZlbnRzJ1xuaW1wb3J0IHtcbiAgQ2FsZW5kYXJUaW1lc3RhbXAsXG4gIENhbGVuZGFyRXZlbnRQYXJzZWQsXG4gIENhbGVuZGFyRXZlbnRWaXN1YWwsXG4gIENhbGVuZGFyRXZlbnRDb2xvckZ1bmN0aW9uLFxuICBDYWxlbmRhckV2ZW50TmFtZUZ1bmN0aW9uLFxuICBDYWxlbmRhckRheVNsb3RTY29wZSxcbiAgQ2FsZW5kYXJEYXlCb2R5U2xvdFNjb3BlLFxuICBDYWxlbmRhckV2ZW50T3ZlcmxhcE1vZGUsXG59IGZyb20gJ3R5cGVzJ1xuXG4vLyBUeXBlc1xudHlwZSBWRXZlbnRHZXR0ZXIgPSAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCkgPT4gQ2FsZW5kYXJFdmVudFBhcnNlZFtdXG5cbnR5cGUgVkV2ZW50VmlzdWFsVG9Ob2RlPEQ+ID0gKHZpc3VhbDogQ2FsZW5kYXJFdmVudFZpc3VhbCwgZGF5OiBEKSA9PiBWTm9kZVxuXG50eXBlIFZFdmVudHNUb05vZGVzID0gPEQgZXh0ZW5kcyBDYWxlbmRhckRheVNsb3RTY29wZT4oXG4gIGRheTogRCxcbiAgZ2V0dGVyOiBWRXZlbnRHZXR0ZXIsXG4gIG1hcHBlcjogVkV2ZW50VmlzdWFsVG9Ob2RlPEQ+LFxuICB0aW1lZDogYm9vbGVhbikgPT4gVk5vZGVbXSB8IHVuZGVmaW5lZFxuXG50eXBlIFZEYWlseUV2ZW50c01hcCA9IHtcbiAgW2RhdGU6IHN0cmluZ106IHtcbiAgICBwYXJlbnQ6IEhUTUxFbGVtZW50XG4gICAgbW9yZTogSFRNTEVsZW1lbnQgfCBudWxsXG4gICAgZXZlbnRzOiBIVE1MRWxlbWVudFtdXG4gIH1cbn1cblxuY29uc3QgV0lEVEhfRlVMTCA9IDEwMFxuY29uc3QgV0lEVEhfU1RBUlQgPSA5NVxuY29uc3QgTUlOVVRFU19JTl9EQVkgPSAxNDQwXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBDYWxlbmRhckJhc2UuZXh0ZW5kKHtcbiAgbmFtZTogJ2NhbGVuZGFyLXdpdGgtZXZlbnRzJyxcblxuICBkaXJlY3RpdmVzOiB7XG4gICAgcmlwcGxlLFxuICB9LFxuXG4gIHByb3BzOiBwcm9wcy5ldmVudHMsXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBub0V2ZW50cyAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5ldmVudHMubGVuZ3RoID09PSAwXG4gICAgfSxcbiAgICBwYXJzZWRFdmVudHMgKCk6IENhbGVuZGFyRXZlbnRQYXJzZWRbXSB7XG4gICAgICByZXR1cm4gdGhpcy5ldmVudHMubWFwKChpbnB1dCwgaW5kZXgpID0+IHBhcnNlRXZlbnQoaW5wdXQsIGluZGV4LCB0aGlzLmV2ZW50U3RhcnQsIHRoaXMuZXZlbnRFbmQpKVxuICAgIH0sXG4gICAgcGFyc2VkRXZlbnRPdmVybGFwVGhyZXNob2xkICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMuZXZlbnRPdmVybGFwVGhyZXNob2xkKVxuICAgIH0sXG4gICAgZXZlbnRDb2xvckZ1bmN0aW9uICgpOiBDYWxlbmRhckV2ZW50Q29sb3JGdW5jdGlvbiB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRoaXMuZXZlbnRDb2xvciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHRoaXMuZXZlbnRDb2xvciBhcyBDYWxlbmRhckV2ZW50Q29sb3JGdW5jdGlvblxuICAgICAgICA6ICgpID0+ICh0aGlzLmV2ZW50Q29sb3IgYXMgc3RyaW5nKVxuICAgIH0sXG4gICAgZXZlbnRUZXh0Q29sb3JGdW5jdGlvbiAoKTogQ2FsZW5kYXJFdmVudENvbG9yRnVuY3Rpb24ge1xuICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLmV2ZW50VGV4dENvbG9yID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gdGhpcy5ldmVudFRleHRDb2xvciBhcyBDYWxlbmRhckV2ZW50Q29sb3JGdW5jdGlvblxuICAgICAgICA6ICgpID0+ICh0aGlzLmV2ZW50VGV4dENvbG9yIGFzIHN0cmluZylcbiAgICB9LFxuICAgIGV2ZW50TmFtZUZ1bmN0aW9uICgpOiBDYWxlbmRhckV2ZW50TmFtZUZ1bmN0aW9uIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5ldmVudE5hbWUgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB0aGlzLmV2ZW50TmFtZSBhcyBDYWxlbmRhckV2ZW50TmFtZUZ1bmN0aW9uXG4gICAgICAgIDogKGV2ZW50LCB0aW1lZEV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IGVzY2FwZUhUTUwoZXZlbnQuaW5wdXRbdGhpcy5ldmVudE5hbWUgYXMgc3RyaW5nXSBhcyBzdHJpbmcpXG4gICAgICAgICAgaWYgKGV2ZW50LnN0YXJ0Lmhhc1RpbWUpIHtcbiAgICAgICAgICAgIGlmICh0aW1lZEV2ZW50KSB7XG4gICAgICAgICAgICAgIGNvbnN0IHNob3dTdGFydCA9IGV2ZW50LnN0YXJ0LmhvdXIgPCAxMiAmJiBldmVudC5lbmQuaG91ciA+PSAxMlxuICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMuZm9ybWF0VGltZShldmVudC5zdGFydCwgc2hvd1N0YXJ0KVxuICAgICAgICAgICAgICBjb25zdCBlbmQgPSB0aGlzLmZvcm1hdFRpbWUoZXZlbnQuZW5kLCB0cnVlKVxuICAgICAgICAgICAgICBjb25zdCBzaW5nbGluZSA9IGRpZmZNaW51dGVzKGV2ZW50LnN0YXJ0LCBldmVudC5lbmQpIDw9IHRoaXMucGFyc2VkRXZlbnRPdmVybGFwVGhyZXNob2xkXG4gICAgICAgICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IHNpbmdsaW5lID8gJywgJyA6ICc8YnI+J1xuICAgICAgICAgICAgICByZXR1cm4gYDxzdHJvbmc+JHtuYW1lfTwvc3Ryb25nPiR7c2VwYXJhdG9yfSR7c3RhcnR9IC0gJHtlbmR9YFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgdGltZSA9IHRoaXMuZm9ybWF0VGltZShldmVudC5zdGFydCwgdHJ1ZSlcbiAgICAgICAgICAgICAgcmV0dXJuIGA8c3Ryb25nPiR7dGltZX08L3N0cm9uZz4gJHtuYW1lfWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5hbWVcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZXZlbnRNb2RlRnVuY3Rpb24gKCk6IENhbGVuZGFyRXZlbnRPdmVybGFwTW9kZSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRoaXMuZXZlbnRPdmVybGFwTW9kZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHRoaXMuZXZlbnRPdmVybGFwTW9kZSBhcyBDYWxlbmRhckV2ZW50T3ZlcmxhcE1vZGVcbiAgICAgICAgOiBDYWxlbmRhckV2ZW50T3ZlcmxhcE1vZGVzW3RoaXMuZXZlbnRPdmVybGFwTW9kZV1cbiAgICB9LFxuICAgIGV2ZW50V2Vla2RheXMgKCk6IG51bWJlcltdIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlZFdlZWtkYXlzXG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZm9ybWF0VGltZSAod2l0aFRpbWU6IENhbGVuZGFyVGltZXN0YW1wLCBhbXBtOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgIGNvbnN0IGZvcm1hdHRlciA9IHRoaXMuZ2V0Rm9ybWF0dGVyKHtcbiAgICAgICAgdGltZVpvbmU6ICdVVEMnLFxuICAgICAgICBob3VyOiAnbnVtZXJpYycsXG4gICAgICAgIG1pbnV0ZTogd2l0aFRpbWUubWludXRlID4gMCA/ICdudW1lcmljJyA6IHVuZGVmaW5lZCxcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBmb3JtYXR0ZXIod2l0aFRpbWUsIHRydWUpXG4gICAgfSxcbiAgICB1cGRhdGVFdmVudFZpc2liaWxpdHkgKCkge1xuICAgICAgaWYgKHRoaXMubm9FdmVudHMgfHwgIXRoaXMuZXZlbnRNb3JlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBldmVudEhlaWdodCA9IHRoaXMuZXZlbnRIZWlnaHRcbiAgICAgIGNvbnN0IGV2ZW50c01hcCA9IHRoaXMuZ2V0RXZlbnRzTWFwKClcblxuICAgICAgZm9yIChjb25zdCBkYXRlIGluIGV2ZW50c01hcCkge1xuICAgICAgICBjb25zdCB7IHBhcmVudCwgZXZlbnRzLCBtb3JlIH0gPSBldmVudHNNYXBbZGF0ZV1cbiAgICAgICAgaWYgKCFtb3JlKSB7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhcmVudEJvdW5kcyA9IHBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBjb25zdCBsYXN0ID0gZXZlbnRzLmxlbmd0aCAtIDFcbiAgICAgICAgbGV0IGhpZGUgPSBmYWxzZVxuICAgICAgICBsZXQgaGlkZGVuID0gMFxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxhc3Q7IGkrKykge1xuICAgICAgICAgIGlmICghaGlkZSkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRCb3VuZHMgPSBldmVudHNbaV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGhpZGUgPSBpID09PSBsYXN0XG4gICAgICAgICAgICAgID8gKGV2ZW50Qm91bmRzLmJvdHRvbSA+IHBhcmVudEJvdW5kcy5ib3R0b20pXG4gICAgICAgICAgICAgIDogKGV2ZW50Qm91bmRzLmJvdHRvbSArIGV2ZW50SGVpZ2h0ID4gcGFyZW50Qm91bmRzLmJvdHRvbSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhpZGUpIHtcbiAgICAgICAgICAgIGV2ZW50c1tpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgICBoaWRkZW4rK1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoaWRlKSB7XG4gICAgICAgICAgbW9yZS5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICAgICAgICBtb3JlLmlubmVySFRNTCA9IHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMuZXZlbnRNb3JlVGV4dCwgaGlkZGVuKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vcmUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRFdmVudHNNYXAgKCk6IFZEYWlseUV2ZW50c01hcCB7XG4gICAgICBjb25zdCBldmVudHNNYXA6IFZEYWlseUV2ZW50c01hcCA9IHt9XG4gICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuJHJlZnMuZXZlbnRzIGFzIEhUTUxFbGVtZW50W11cblxuICAgICAgaWYgKCFlbGVtZW50cyB8fCAhZWxlbWVudHMuZm9yRWFjaCkge1xuICAgICAgICByZXR1cm4gZXZlbnRzTWFwXG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBjb25zdCBkYXRlID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWRhdGUnKVxuICAgICAgICBpZiAoZWwucGFyZW50RWxlbWVudCAmJiBkYXRlKSB7XG4gICAgICAgICAgaWYgKCEoZGF0ZSBpbiBldmVudHNNYXApKSB7XG4gICAgICAgICAgICBldmVudHNNYXBbZGF0ZV0gPSB7XG4gICAgICAgICAgICAgIHBhcmVudDogZWwucGFyZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgbW9yZTogbnVsbCxcbiAgICAgICAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1tb3JlJykpIHtcbiAgICAgICAgICAgIGV2ZW50c01hcFtkYXRlXS5tb3JlID0gZWxcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnRzTWFwW2RhdGVdLmV2ZW50cy5wdXNoKGVsKVxuICAgICAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICcnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gZXZlbnRzTWFwXG4gICAgfSxcbiAgICBnZW5EYXlFdmVudCAoeyBldmVudCB9OiBDYWxlbmRhckV2ZW50VmlzdWFsLCBkYXk6IENhbGVuZGFyRGF5U2xvdFNjb3BlKTogVk5vZGUge1xuICAgICAgY29uc3QgZXZlbnRIZWlnaHQgPSB0aGlzLmV2ZW50SGVpZ2h0XG4gICAgICBjb25zdCBldmVudE1hcmdpbkJvdHRvbSA9IHRoaXMuZXZlbnRNYXJnaW5Cb3R0b21cbiAgICAgIGNvbnN0IGRheUlkZW50aWZpZXIgPSBnZXREYXlJZGVudGlmaWVyKGRheSlcbiAgICAgIGNvbnN0IHdlZWsgPSBkYXkud2Vla1xuICAgICAgY29uc3Qgc3RhcnQgPSBkYXlJZGVudGlmaWVyID09PSBldmVudC5zdGFydElkZW50aWZpZXJcbiAgICAgIGxldCBlbmQgPSBkYXlJZGVudGlmaWVyID09PSBldmVudC5lbmRJZGVudGlmaWVyXG4gICAgICBsZXQgd2lkdGggPSBXSURUSF9TVEFSVFxuICAgICAgZm9yIChsZXQgaSA9IGRheS5pbmRleCArIDE7IGkgPCB3ZWVrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHdlZWtkYXlJZGVudGlmaWVyID0gZ2V0RGF5SWRlbnRpZmllcih3ZWVrW2ldKVxuICAgICAgICBpZiAoZXZlbnQuZW5kSWRlbnRpZmllciA+PSB3ZWVrZGF5SWRlbnRpZmllcikge1xuICAgICAgICAgIHdpZHRoICs9IFdJRFRIX0ZVTExcbiAgICAgICAgICBpZiAod2Vla2RheUlkZW50aWZpZXIgPT09IGV2ZW50LmVuZElkZW50aWZpZXIpIHtcbiAgICAgICAgICAgIGVuZCA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW5kID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHNjb3BlID0geyBldmVudDogZXZlbnQuaW5wdXQsIGRheSwgb3V0c2lkZTogZGF5Lm91dHNpZGUsIHN0YXJ0LCBlbmQsIHRpbWVkOiBmYWxzZSB9XG5cbiAgICAgIHJldHVybiB0aGlzLmdlbkV2ZW50KGV2ZW50LCBzY29wZSwgZmFsc2UsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWV2ZW50JyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1ldmVudC1zdGFydCc6IHN0YXJ0LFxuICAgICAgICAgICd2LWV2ZW50LWVuZCc6IGVuZCxcbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQ6IGAke2V2ZW50SGVpZ2h0fXB4YCxcbiAgICAgICAgICB3aWR0aDogYCR7d2lkdGh9JWAsXG4gICAgICAgICAgJ21hcmdpbi1ib3R0b20nOiBgJHtldmVudE1hcmdpbkJvdHRvbX1weGAsXG4gICAgICAgIH0sXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgJ2RhdGEtZGF0ZSc6IGRheS5kYXRlLFxuICAgICAgICB9LFxuICAgICAgICBrZXk6IGV2ZW50LmluZGV4LFxuICAgICAgICByZWY6ICdldmVudHMnLFxuICAgICAgICByZWZJbkZvcjogdHJ1ZSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5UaW1lZEV2ZW50ICh7IGV2ZW50LCBsZWZ0LCB3aWR0aCB9OiBDYWxlbmRhckV2ZW50VmlzdWFsLCBkYXk6IENhbGVuZGFyRGF5Qm9keVNsb3RTY29wZSk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGRheUlkZW50aWZpZXIgPSBnZXREYXlJZGVudGlmaWVyKGRheSlcbiAgICAgIGNvbnN0IHN0YXJ0ID0gZXZlbnQuc3RhcnRJZGVudGlmaWVyID49IGRheUlkZW50aWZpZXJcbiAgICAgIGNvbnN0IGVuZCA9IGV2ZW50LmVuZElkZW50aWZpZXIgPiBkYXlJZGVudGlmaWVyXG4gICAgICBjb25zdCB0b3AgPSBzdGFydCA/IGRheS50aW1lVG9ZKGV2ZW50LnN0YXJ0KSA6IDBcbiAgICAgIGNvbnN0IGJvdHRvbSA9IGVuZCA/IGRheS50aW1lVG9ZKE1JTlVURVNfSU5fREFZKSA6IGRheS50aW1lVG9ZKGV2ZW50LmVuZClcbiAgICAgIGNvbnN0IGhlaWdodCA9IE1hdGgubWF4KHRoaXMuZXZlbnRIZWlnaHQsIGJvdHRvbSAtIHRvcClcbiAgICAgIGNvbnN0IHNjb3BlID0geyBldmVudDogZXZlbnQuaW5wdXQsIGRheSwgb3V0c2lkZTogZGF5Lm91dHNpZGUsIHN0YXJ0LCBlbmQsIHRpbWVkOiB0cnVlIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZ2VuRXZlbnQoZXZlbnQsIHNjb3BlLCB0cnVlLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1ldmVudC10aW1lZCcsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgdG9wOiBgJHt0b3B9cHhgLFxuICAgICAgICAgIGhlaWdodDogYCR7aGVpZ2h0fXB4YCxcbiAgICAgICAgICBsZWZ0OiBgJHtsZWZ0fSVgLFxuICAgICAgICAgIHdpZHRoOiBgJHt3aWR0aH0lYCxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5FdmVudCAoZXZlbnQ6IENhbGVuZGFyRXZlbnRQYXJzZWQsIHNjb3BlOiBvYmplY3QsIHRpbWVkRXZlbnQ6IGJvb2xlYW4sIGRhdGE6IFZOb2RlRGF0YSk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLiRzY29wZWRTbG90cy5ldmVudFxuICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXZlbnRUZXh0Q29sb3JGdW5jdGlvbihldmVudC5pbnB1dClcbiAgICAgIGNvbnN0IGJhY2tncm91bmQgPSB0aGlzLmV2ZW50Q29sb3JGdW5jdGlvbihldmVudC5pbnB1dClcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsXG4gICAgICAgIHRoaXMuc2V0VGV4dENvbG9yKHRleHQsXG4gICAgICAgICAgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IoYmFja2dyb3VuZCwge1xuICAgICAgICAgICAgb246IHRoaXMuZ2V0RGVmYXVsdE1vdXNlRXZlbnRIYW5kbGVycygnOmV2ZW50JywgbmF0aXZlRXZlbnQgPT4gKHsgLi4uc2NvcGUsIG5hdGl2ZUV2ZW50IH0pKSxcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgICAgICAgIG5hbWU6ICdyaXBwbGUnLFxuICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5ldmVudFJpcHBsZSAhPSBudWxsID8gdGhpcy5ldmVudFJpcHBsZSA6IHRydWUsXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIC4uLmRhdGEsXG4gICAgICAgICAgfSlcbiAgICAgICAgKSwgc2xvdFxuICAgICAgICAgID8gc2xvdChzY29wZSlcbiAgICAgICAgICA6IFt0aGlzLmdlbk5hbWUoZXZlbnQsIHRpbWVkRXZlbnQpXVxuICAgICAgKVxuICAgIH0sXG4gICAgZ2VuTmFtZSAoZXZlbnQ6IENhbGVuZGFyRXZlbnRQYXJzZWQsIHRpbWVkRXZlbnQ6IGJvb2xlYW4pOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3BsLTEnLFxuICAgICAgICBkb21Qcm9wczoge1xuICAgICAgICAgIGlubmVySFRNTDogdGhpcy5ldmVudE5hbWVGdW5jdGlvbihldmVudCwgdGltZWRFdmVudCksXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuUGxhY2Vob2xkZXIgKGRheTogQ2FsZW5kYXJUaW1lc3RhbXApOiBWTm9kZSB7XG4gICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmV2ZW50SGVpZ2h0ICsgdGhpcy5ldmVudE1hcmdpbkJvdHRvbVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGhlaWdodDogYCR7aGVpZ2h0fXB4YCxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAnZGF0YS1kYXRlJzogZGF5LmRhdGUsXG4gICAgICAgIH0sXG4gICAgICAgIHJlZjogJ2V2ZW50cycsXG4gICAgICAgIHJlZkluRm9yOiB0cnVlLFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlbk1vcmUgKGRheTogQ2FsZW5kYXJEYXlTbG90U2NvcGUpOiBWTm9kZSB7XG4gICAgICBjb25zdCBldmVudEhlaWdodCA9IHRoaXMuZXZlbnRIZWlnaHRcbiAgICAgIGNvbnN0IGV2ZW50TWFyZ2luQm90dG9tID0gdGhpcy5ldmVudE1hcmdpbkJvdHRvbVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtZXZlbnQtbW9yZSBwbC0xJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1vdXRzaWRlJzogZGF5Lm91dHNpZGUsXG4gICAgICAgIH0sXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgJ2RhdGEtZGF0ZSc6IGRheS5kYXRlLFxuICAgICAgICAgICdkYXRhLW1vcmUnOiAxLFxuICAgICAgICB9LFxuICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgIG5hbWU6ICdyaXBwbGUnLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLmV2ZW50UmlwcGxlICE9IG51bGwgPyB0aGlzLmV2ZW50UmlwcGxlIDogdHJ1ZSxcbiAgICAgICAgfV0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6ICgpID0+IHRoaXMuJGVtaXQoJ2NsaWNrOm1vcmUnLCBkYXkpLFxuICAgICAgICB9LFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGRpc3BsYXk6ICdub25lJyxcbiAgICAgICAgICBoZWlnaHQ6IGAke2V2ZW50SGVpZ2h0fXB4YCxcbiAgICAgICAgICAnbWFyZ2luLWJvdHRvbSc6IGAke2V2ZW50TWFyZ2luQm90dG9tfXB4YCxcbiAgICAgICAgfSxcbiAgICAgICAgcmVmOiAnZXZlbnRzJyxcbiAgICAgICAgcmVmSW5Gb3I6IHRydWUsXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2V0VmlzaWJsZUV2ZW50cyAoKTogQ2FsZW5kYXJFdmVudFBhcnNlZFtdIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0RGF5SWRlbnRpZmllcih0aGlzLmRheXNbMF0pXG4gICAgICBjb25zdCBlbmQgPSBnZXREYXlJZGVudGlmaWVyKHRoaXMuZGF5c1t0aGlzLmRheXMubGVuZ3RoIC0gMV0pXG5cbiAgICAgIHJldHVybiB0aGlzLnBhcnNlZEV2ZW50cy5maWx0ZXIoXG4gICAgICAgIGV2ZW50ID0+IGlzRXZlbnRPdmVybGFwcGluZyhldmVudCwgc3RhcnQsIGVuZClcbiAgICAgIClcbiAgICB9LFxuICAgIGdldEV2ZW50c0ZvckRheSAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCk6IENhbGVuZGFyRXZlbnRQYXJzZWRbXSB7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gZ2V0RGF5SWRlbnRpZmllcihkYXkpXG4gICAgICBjb25zdCBmaXJzdFdlZWtkYXkgPSB0aGlzLmV2ZW50V2Vla2RheXNbMF1cblxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VkRXZlbnRzLmZpbHRlcihcbiAgICAgICAgZXZlbnQgPT4gaXNFdmVudFN0YXJ0KGV2ZW50LCBkYXksIGlkZW50aWZpZXIsIGZpcnN0V2Vla2RheSlcbiAgICAgIClcbiAgICB9LFxuICAgIGdldEV2ZW50c0ZvckRheUFsbCAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCk6IENhbGVuZGFyRXZlbnRQYXJzZWRbXSB7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gZ2V0RGF5SWRlbnRpZmllcihkYXkpXG4gICAgICBjb25zdCBmaXJzdFdlZWtkYXkgPSB0aGlzLmV2ZW50V2Vla2RheXNbMF1cblxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VkRXZlbnRzLmZpbHRlcihcbiAgICAgICAgZXZlbnQgPT4gZXZlbnQuYWxsRGF5ICYmIGlzRXZlbnRTdGFydChldmVudCwgZGF5LCBpZGVudGlmaWVyLCBmaXJzdFdlZWtkYXkpXG4gICAgICApXG4gICAgfSxcbiAgICBnZXRFdmVudHNGb3JEYXlUaW1lZCAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCk6IENhbGVuZGFyRXZlbnRQYXJzZWRbXSB7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gZ2V0RGF5SWRlbnRpZmllcihkYXkpXG5cbiAgICAgIHJldHVybiB0aGlzLnBhcnNlZEV2ZW50cy5maWx0ZXIoXG4gICAgICAgIGV2ZW50ID0+ICFldmVudC5hbGxEYXkgJiYgaXNFdmVudE9uKGV2ZW50LCBpZGVudGlmaWVyKVxuICAgICAgKVxuICAgIH0sXG4gICAgZ2V0U2NvcGVkU2xvdHMgKCkge1xuICAgICAgaWYgKHRoaXMubm9FdmVudHMpIHtcbiAgICAgICAgcmV0dXJuIHsgLi4udGhpcy4kc2NvcGVkU2xvdHMgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBtb2RlID0gdGhpcy5ldmVudE1vZGVGdW5jdGlvbihcbiAgICAgICAgdGhpcy5wYXJzZWRFdmVudHMsXG4gICAgICAgIHRoaXMuZXZlbnRXZWVrZGF5c1swXSxcbiAgICAgICAgdGhpcy5wYXJzZWRFdmVudE92ZXJsYXBUaHJlc2hvbGRcbiAgICAgIClcblxuICAgICAgY29uc3QgZ2V0U2xvdENoaWxkcmVuOiBWRXZlbnRzVG9Ob2RlcyA9IChkYXksIGdldHRlciwgbWFwcGVyLCB0aW1lZCkgPT4ge1xuICAgICAgICBjb25zdCBldmVudHMgPSBnZXR0ZXIoZGF5KVxuXG4gICAgICAgIGlmIChldmVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2aXN1YWxzID0gbW9kZShkYXksIGV2ZW50cywgdGltZWQpXG5cbiAgICAgICAgaWYgKHRpbWVkKSB7XG4gICAgICAgICAgcmV0dXJuIHZpc3VhbHMubWFwKHZpc3VhbCA9PiBtYXBwZXIodmlzdWFsLCBkYXkpKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hpbGRyZW46IFZOb2RlW10gPSBbXVxuXG4gICAgICAgIHZpc3VhbHMuZm9yRWFjaCgodmlzdWFsLCBpbmRleCkgPT4ge1xuICAgICAgICAgIHdoaWxlIChjaGlsZHJlbi5sZW5ndGggPCB2aXN1YWwuY29sdW1uKSB7XG4gICAgICAgICAgICBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuUGxhY2Vob2xkZXIoZGF5KSlcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hpbGRyZW4ucHVzaChtYXBwZXIodmlzdWFsLCBkYXkpKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBjaGlsZHJlblxuICAgICAgfVxuXG4gICAgICBjb25zdCBzbG90cyA9IHRoaXMuJHNjb3BlZFNsb3RzXG4gICAgICBjb25zdCBzbG90RGF5ID0gc2xvdHMuZGF5XG4gICAgICBjb25zdCBzbG90RGF5SGVhZGVyID0gc2xvdHNbJ2RheS1oZWFkZXInXVxuICAgICAgY29uc3Qgc2xvdERheUJvZHkgPSBzbG90c1snZGF5LWJvZHknXVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zbG90cyxcbiAgICAgICAgZGF5OiAoZGF5OiBDYWxlbmRhckRheVNsb3RTY29wZSkgPT4ge1xuICAgICAgICAgIGxldCBjaGlsZHJlbiA9IGdldFNsb3RDaGlsZHJlbihkYXksIHRoaXMuZ2V0RXZlbnRzRm9yRGF5LCB0aGlzLmdlbkRheUV2ZW50LCBmYWxzZSlcbiAgICAgICAgICBpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoID4gMCAmJiB0aGlzLmV2ZW50TW9yZSkge1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaCh0aGlzLmdlbk1vcmUoZGF5KSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNsb3REYXkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNsb3QgPSBzbG90RGF5KGRheSlcbiAgICAgICAgICAgIGlmIChzbG90KSB7XG4gICAgICAgICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4gPyBjaGlsZHJlbi5jb25jYXQoc2xvdCkgOiBzbG90XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjaGlsZHJlblxuICAgICAgICB9LFxuICAgICAgICAnZGF5LWhlYWRlcic6IChkYXk6IENhbGVuZGFyRGF5U2xvdFNjb3BlKSA9PiB7XG4gICAgICAgICAgbGV0IGNoaWxkcmVuID0gZ2V0U2xvdENoaWxkcmVuKGRheSwgdGhpcy5nZXRFdmVudHNGb3JEYXlBbGwsIHRoaXMuZ2VuRGF5RXZlbnQsIGZhbHNlKVxuXG4gICAgICAgICAgaWYgKHNsb3REYXlIZWFkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNsb3QgPSBzbG90RGF5SGVhZGVyKGRheSlcbiAgICAgICAgICAgIGlmIChzbG90KSB7XG4gICAgICAgICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4gPyBjaGlsZHJlbi5jb25jYXQoc2xvdCkgOiBzbG90XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjaGlsZHJlblxuICAgICAgICB9LFxuICAgICAgICAnZGF5LWJvZHknOiAoZGF5OiBDYWxlbmRhckRheUJvZHlTbG90U2NvcGUpID0+IHtcbiAgICAgICAgICBjb25zdCBldmVudHMgPSBnZXRTbG90Q2hpbGRyZW4oZGF5LCB0aGlzLmdldEV2ZW50c0ZvckRheVRpbWVkLCB0aGlzLmdlblRpbWVkRXZlbnQsIHRydWUpXG4gICAgICAgICAgbGV0IGNoaWxkcmVuOiBWTm9kZVtdID0gW1xuICAgICAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtZXZlbnQtdGltZWQtY29udGFpbmVyJyxcbiAgICAgICAgICAgIH0sIGV2ZW50cyksXG4gICAgICAgICAgXVxuXG4gICAgICAgICAgaWYgKHNsb3REYXlCb2R5KSB7XG4gICAgICAgICAgICBjb25zdCBzbG90ID0gc2xvdERheUJvZHkoZGF5KVxuICAgICAgICAgICAgaWYgKHNsb3QpIHtcbiAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5jb25jYXQoc2xvdClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn0pXG4iXX0=