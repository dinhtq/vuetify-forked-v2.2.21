import { getTimestampIdentifier } from '../util/timestamp';
const MILLIS_IN_DAY = 86400000;
export function getVisuals(events, minStart = 0) {
    const visuals = events.map(event => ({
        event,
        columnCount: 0,
        column: 0,
        left: 0,
        width: 100,
    }));
    visuals.sort((a, b) => {
        return (Math.max(minStart, a.event.startTimestampIdentifier) - Math.max(minStart, b.event.startTimestampIdentifier)) ||
            (b.event.endTimestampIdentifier - a.event.endTimestampIdentifier);
    });
    return visuals;
}
export function hasOverlap(s0, e0, s1, e1, exclude = true) {
    return exclude ? !(s0 >= e1 || e0 <= s1) : !(s0 > e1 || e0 < s1);
}
export function setColumnCount(groups) {
    groups.forEach(group => {
        group.visuals.forEach(groupVisual => {
            groupVisual.columnCount = groups.length;
        });
    });
}
export function getRange(event) {
    return [event.startTimestampIdentifier, event.endTimestampIdentifier];
}
export function getDayRange(event) {
    return [event.startIdentifier, event.endIdentifier];
}
export function getNormalizedRange(event, dayStart) {
    return [Math.max(dayStart, event.startTimestampIdentifier), Math.min(dayStart + MILLIS_IN_DAY, event.endTimestampIdentifier)];
}
export function getOpenGroup(groups, start, end, timed) {
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        let intersected = false;
        if (hasOverlap(start, end, group.start, group.end, timed)) {
            for (let k = 0; k < group.visuals.length; k++) {
                const groupVisual = group.visuals[k];
                const [groupStart, groupEnd] = timed ? getRange(groupVisual.event) : getDayRange(groupVisual.event);
                if (hasOverlap(start, end, groupStart, groupEnd, timed)) {
                    intersected = true;
                    break;
                }
            }
        }
        if (!intersected) {
            return i;
        }
    }
    return -1;
}
export function getOverlapGroupHandler(firstWeekday) {
    const handler = {
        groups: [],
        min: -1,
        max: -1,
        reset: () => {
            handler.groups = [];
            handler.min = handler.max = -1;
        },
        getVisuals: (day, dayEvents, timed) => {
            if (day.weekday === firstWeekday || timed) {
                handler.reset();
            }
            const dayStart = getTimestampIdentifier(day);
            const visuals = getVisuals(dayEvents, dayStart);
            visuals.forEach(visual => {
                const [start, end] = timed ? getRange(visual.event) : getDayRange(visual.event);
                if (handler.groups.length > 0 && !hasOverlap(start, end, handler.min, handler.max, timed)) {
                    setColumnCount(handler.groups);
                    handler.reset();
                }
                let targetGroup = getOpenGroup(handler.groups, start, end, timed);
                if (targetGroup === -1) {
                    targetGroup = handler.groups.length;
                    handler.groups.push({ start, end, visuals: [] });
                }
                const target = handler.groups[targetGroup];
                target.visuals.push(visual);
                target.start = Math.min(target.start, start);
                target.end = Math.max(target.end, end);
                visual.column = targetGroup;
                if (handler.min === -1) {
                    handler.min = start;
                    handler.max = end;
                }
                else {
                    handler.min = Math.min(handler.min, start);
                    handler.max = Math.max(handler.max, end);
                }
            });
            setColumnCount(handler.groups);
            return visuals;
        },
    };
    return handler;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkNhbGVuZGFyL21vZGVzL2NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUUxRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUE7QUFJOUIsTUFBTSxVQUFVLFVBQVUsQ0FBRSxNQUE2QixFQUFFLFFBQVEsR0FBRyxDQUFDO0lBQ3JFLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLEtBQUs7UUFDTCxXQUFXLEVBQUUsQ0FBQztRQUNkLE1BQU0sRUFBRSxDQUFDO1FBQ1QsSUFBSSxFQUFFLENBQUM7UUFDUCxLQUFLLEVBQUUsR0FBRztLQUNYLENBQUMsQ0FBQyxDQUFBO0lBRUgsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUM3RyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0lBQzFFLENBQUMsQ0FBQyxDQUFBO0lBRUYsT0FBTyxPQUFPLENBQUE7QUFDaEIsQ0FBQztBQVFELE1BQU0sVUFBVSxVQUFVLENBQUUsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLE9BQU8sR0FBRyxJQUFJO0lBQ3hGLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMs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QUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7aUJBQ2pEO2dCQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7Z0JBQzFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2dCQUMzQixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQTtnQkFDNUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBRXRDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFBO2dCQUUzQixJQUFJLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ3RCLE9BQU8sQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFBO29CQUNuQixPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtpQkFDbEI7cUJBQU07b0JBQ0wsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7b0JBQzFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO2lCQUN6QztZQUNILENBQUMsQ0FBQyxDQUFBO1lBRUYsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUU5QixPQUFPLE9BQU8sQ0FBQTtRQUNoQixDQUFDO0tBQ0YsQ0FBQTtJQUVELE9BQU8sT0FBTyxDQUFBO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYWxlbmRhckV2ZW50UGFyc2VkLCBDYWxlbmRhckV2ZW50VmlzdWFsLCBDYWxlbmRhclRpbWVzdGFtcCB9IGZyb20gJ3R5cGVzJ1xuaW1wb3J0IHsgZ2V0VGltZXN0YW1wSWRlbnRpZmllciB9IGZyb20gJy4uL3V0aWwvdGltZXN0YW1wJ1xuXG5jb25zdCBNSUxMSVNfSU5fREFZID0gODY0MDAwMDBcblxuZXhwb3J0IHR5cGUgR2V0UmFuZ2UgPSAoZXZlbnQ6IENhbGVuZGFyRXZlbnRQYXJzZWQpID0+IFtudW1iZXIsIG51bWJlcl1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZpc3VhbHMgKGV2ZW50czogQ2FsZW5kYXJFdmVudFBhcnNlZFtdLCBtaW5TdGFydCA9IDApOiBDYWxlbmRhckV2ZW50VmlzdWFsW10ge1xuICBjb25zdCB2aXN1YWxzID0gZXZlbnRzLm1hcChldmVudCA9PiAoe1xuICAgIGV2ZW50LFxuICAgIGNvbHVtbkNvdW50OiAwLFxuICAgIGNvbHVtbjogMCxcbiAgICBsZWZ0OiAwLFxuICAgIHdpZHRoOiAxMDAsXG4gIH0pKVxuXG4gIHZpc3VhbHMuc29ydCgoYSwgYikgPT4ge1xuICAgIHJldHVybiAoTWF0aC5tYXgobWluU3RhcnQsIGEuZXZlbnQuc3RhcnRUaW1lc3RhbXBJZGVudGlmaWVyKSAtIE1hdGgubWF4KG1pblN0YXJ0LCBiLmV2ZW50LnN0YXJ0VGltZXN0YW1wSWRlbnRpZmllcikpIHx8XG4gICAgICAgICAgIChiLmV2ZW50LmVuZFRpbWVzdGFtcElkZW50aWZpZXIgLSBhLmV2ZW50LmVuZFRpbWVzdGFtcElkZW50aWZpZXIpXG4gIH0pXG5cbiAgcmV0dXJuIHZpc3VhbHNcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb2x1bW5Hcm91cCB7XG4gIHN0YXJ0OiBudW1iZXJcbiAgZW5kOiBudW1iZXJcbiAgdmlzdWFsczogQ2FsZW5kYXJFdmVudFZpc3VhbFtdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNPdmVybGFwIChzMDogbnVtYmVyLCBlMDogbnVtYmVyLCBzMTogbnVtYmVyLCBlMTogbnVtYmVyLCBleGNsdWRlID0gdHJ1ZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gZXhjbHVkZSA/ICEoczAgPj0gZTEgfHwgZTAgPD0gczEpIDogIShzMCA+IGUxIHx8IGUwIDwgczEpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb2x1bW5Db3VudCAoZ3JvdXBzOiBDb2x1bW5Hcm91cFtdKSB7XG4gIGdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IHtcbiAgICBncm91cC52aXN1YWxzLmZvckVhY2goZ3JvdXBWaXN1YWwgPT4ge1xuICAgICAgZ3JvdXBWaXN1YWwuY29sdW1uQ291bnQgPSBncm91cHMubGVuZ3RoXG4gICAgfSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmdlIChldmVudDogQ2FsZW5kYXJFdmVudFBhcnNlZCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICByZXR1cm4gW2V2ZW50LnN0YXJ0VGltZXN0YW1wSWRlbnRpZmllciwgZXZlbnQuZW5kVGltZXN0YW1wSWRlbnRpZmllcl1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERheVJhbmdlIChldmVudDogQ2FsZW5kYXJFdmVudFBhcnNlZCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICByZXR1cm4gW2V2ZW50LnN0YXJ0SWRlbnRpZmllciwgZXZlbnQuZW5kSWRlbnRpZmllcl1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vcm1hbGl6ZWRSYW5nZSAoZXZlbnQ6IENhbGVuZGFyRXZlbnRQYXJzZWQsIGRheVN0YXJ0OiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgcmV0dXJuIFtNYXRoLm1heChkYXlTdGFydCwgZXZlbnQuc3RhcnRUaW1lc3RhbXBJZGVudGlmaWVyKSwgTWF0aC5taW4oZGF5U3RhcnQgKyBNSUxMSVNfSU5fREFZLCBldmVudC5lbmRUaW1lc3RhbXBJZGVudGlmaWVyKV1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9wZW5Hcm91cCAoZ3JvdXBzOiBDb2x1bW5Hcm91cFtdLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlciwgdGltZWQ6IGJvb2xlYW4pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBncm91cCA9IGdyb3Vwc1tpXVxuICAgIGxldCBpbnRlcnNlY3RlZCA9IGZhbHNlXG5cbiAgICBpZiAoaGFzT3ZlcmxhcChzdGFydCwgZW5kLCBncm91cC5zdGFydCwgZ3JvdXAuZW5kLCB0aW1lZCkpIHtcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgZ3JvdXAudmlzdWFscy5sZW5ndGg7IGsrKykge1xuICAgICAgICBjb25zdCBncm91cFZpc3VhbCA9IGdyb3VwLnZpc3VhbHNba11cbiAgICAgICAgY29uc3QgW2dyb3VwU3RhcnQsIGdyb3VwRW5kXSA9IHRpbWVkID8gZ2V0UmFuZ2UoZ3JvdXBWaXN1YWwuZXZlbnQpIDogZ2V0RGF5UmFuZ2UoZ3JvdXBWaXN1YWwuZXZlbnQpXG5cbiAgICAgICAgaWYgKGhhc092ZXJsYXAoc3RhcnQsIGVuZCwgZ3JvdXBTdGFydCwgZ3JvdXBFbmQsIHRpbWVkKSkge1xuICAgICAgICAgIGludGVyc2VjdGVkID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWludGVyc2VjdGVkKSB7XG4gICAgICByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3ZlcmxhcEdyb3VwSGFuZGxlciAoZmlyc3RXZWVrZGF5OiBudW1iZXIpIHtcbiAgY29uc3QgaGFuZGxlciA9IHtcbiAgICBncm91cHM6IFtdIGFzIENvbHVtbkdyb3VwW10sXG4gICAgbWluOiAtMSxcbiAgICBtYXg6IC0xLFxuICAgIHJlc2V0OiAoKSA9PiB7XG4gICAgICBoYW5kbGVyLmdyb3VwcyA9IFtdXG4gICAgICBoYW5kbGVyLm1pbiA9IGhhbmRsZXIubWF4ID0gLTFcbiAgICB9LFxuICAgIGdldFZpc3VhbHM6IChkYXk6IENhbGVuZGFyVGltZXN0YW1wLCBkYXlFdmVudHM6IENhbGVuZGFyRXZlbnRQYXJzZWRbXSwgdGltZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgIGlmIChkYXkud2Vla2RheSA9PT0gZmlyc3RXZWVrZGF5IHx8IHRpbWVkKSB7XG4gICAgICAgIGhhbmRsZXIucmVzZXQoKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXlTdGFydCA9IGdldFRpbWVzdGFtcElkZW50aWZpZXIoZGF5KVxuICAgICAgY29uc3QgdmlzdWFscyA9IGdldFZpc3VhbHMoZGF5RXZlbnRzLCBkYXlTdGFydClcblxuICAgICAgdmlzdWFscy5mb3JFYWNoKHZpc3VhbCA9PiB7XG4gICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRpbWVkID8gZ2V0UmFuZ2UodmlzdWFsLmV2ZW50KSA6IGdldERheVJhbmdlKHZpc3VhbC5ldmVudClcblxuICAgICAgICBpZiAoaGFuZGxlci5ncm91cHMubGVuZ3RoID4gMCAmJiAhaGFzT3ZlcmxhcChzdGFydCwgZW5kLCBoYW5kbGVyLm1pbiwgaGFuZGxlci5tYXgsIHRpbWVkKSkge1xuICAgICAgICAgIHNldENvbHVtbkNvdW50KGhhbmRsZXIuZ3JvdXBzKVxuICAgICAgICAgIGhhbmRsZXIucmVzZXQoKVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRhcmdldEdyb3VwID0gZ2V0T3Blbkdyb3VwKGhhbmRsZXIuZ3JvdXBzLCBzdGFydCwgZW5kLCB0aW1lZClcblxuICAgICAgICBpZiAodGFyZ2V0R3JvdXAgPT09IC0xKSB7XG4gICAgICAgICAgdGFyZ2V0R3JvdXAgPSBoYW5kbGVyLmdyb3Vwcy5sZW5ndGhcblxuICAgICAgICAgIGhhbmRsZXIuZ3JvdXBzLnB1c2goeyBzdGFydCwgZW5kLCB2aXN1YWxzOiBbXSB9KVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gaGFuZGxlci5ncm91cHNbdGFyZ2V0R3JvdXBdXG4gICAgICAgIHRhcmdldC52aXN1YWxzLnB1c2godmlzdWFsKVxuICAgICAgICB0YXJnZXQuc3RhcnQgPSBNYXRoLm1pbih0YXJnZXQuc3RhcnQsIHN0YXJ0KVxuICAgICAgICB0YXJnZXQuZW5kID0gTWF0aC5tYXgodGFyZ2V0LmVuZCwgZW5kKVxuXG4gICAgICAgIHZpc3VhbC5jb2x1bW4gPSB0YXJnZXRHcm91cFxuXG4gICAgICAgIGlmIChoYW5kbGVyLm1pbiA9PT0gLTEpIHtcbiAgICAgICAgICBoYW5kbGVyLm1pbiA9IHN0YXJ0XG4gICAgICAgICAgaGFuZGxlci5tYXggPSBlbmRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoYW5kbGVyLm1pbiA9IE1hdGgubWluKGhhbmRsZXIubWluLCBzdGFydClcbiAgICAgICAgICBoYW5kbGVyLm1heCA9IE1hdGgubWF4KGhhbmRsZXIubWF4LCBlbmQpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHNldENvbHVtbkNvdW50KGhhbmRsZXIuZ3JvdXBzKVxuXG4gICAgICByZXR1cm4gdmlzdWFsc1xuICAgIH0sXG4gIH1cblxuICByZXR1cm4gaGFuZGxlclxufVxuIl19