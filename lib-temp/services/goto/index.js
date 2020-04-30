// Extensions
import { Service } from '../service';
// Utilities
import * as easingPatterns from './easing-patterns';
import { getContainer, getOffset, } from './util';
export default function goTo(_target, _settings = {}) {
    const settings = {
        container: document.scrollingElement || document.body || document.documentElement,
        duration: 500,
        offset: 0,
        easing: 'easeInOutCubic',
        appOffset: true,
        ..._settings,
    };
    const container = getContainer(settings.container);
    /* istanbul ignore else */
    if (settings.appOffset && goTo.framework.application) {
        const isDrawer = container.classList.contains('v-navigation-drawer');
        const isClipped = container.classList.contains('v-navigation-drawer--clipped');
        const { bar, top } = goTo.framework.application;
        settings.offset += bar;
        /* istanbul ignore else */
        if (!isDrawer || isClipped)
            settings.offset += top;
    }
    const startTime = performance.now();
    let targetLocation;
    if (typeof _target === 'number') {
        targetLocation = getOffset(_target) - settings.offset;
    }
    else {
        targetLocation = getOffset(_target) - getOffset(container) - settings.offset;
    }
    const startLocation = container.scrollTop;
    if (targetLocation === startLocation)
        return Promise.resolve(targetLocation);
    const ease = typeof settings.easing === 'function'
        ? settings.easing
        : easingPatterns[settings.easing];
    /* istanbul ignore else */
    if (!ease)
        throw new TypeError(`Easing function "${settings.easing}" not found.`);
    // Cannot be tested properly in jsdom
    // tslint:disable-next-line:promise-must-complete
    /* istanbul ignore next */
    return new Promise(resolve => requestAnimationFrame(function step(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.abs(settings.duration ? Math.min(timeElapsed / settings.duration, 1) : 1);
        container.scrollTop = Math.floor(startLocation + (targetLocation - startLocation) * ease(progress));
        const clientHeight = container === document.body ? document.documentElement.clientHeight : container.clientHeight;
        if (progress === 1 || clientHeight + container.scrollTop === container.scrollHeight) {
            return resolve(targetLocation);
        }
        requestAnimationFrame(step);
    }));
}
goTo.framework = {};
goTo.init = () => { };
export class Goto extends Service {
    constructor() {
        super();
        return goTo;
    }
}
Goto.property = 'goTo';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvZ290by9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxhQUFhO0FBQ2IsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUVwQyxZQUFZO0FBQ1osT0FBTyxLQUFLLGNBQWMsTUFBTSxtQkFBbUIsQ0FBQTtBQUNuRCxPQUFPLEVBQ0wsWUFBWSxFQUNaLFNBQVMsR0FDVixNQUFNLFFBQVEsQ0FBQTtBQU9mLE1BQU0sQ0FBQyxPQUFPLFVBQVUsSUFBSSxDQUMxQixPQUEwQixFQUMxQixZQUFrQyxFQUFFO0lBRXBDLE1BQU0sUUFBUSxHQUFnQjtRQUM1QixTQUFTLEVBQUcsUUFBUSxDQUFDLGdCQUF1QyxJQUFJLFFBQVEsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLGVBQWU7UUFDekcsUUFBUSxFQUFFLEdBQUc7UUFDYixNQUFNLEVBQUUsQ0FBQztRQUNULE1BQU0sRUFBRSxnQkFBZ0I7UUFDeEIsU0FBUyxFQUFFLElBQUk7UUFDZixHQUFHLFNBQVM7S0FDYixDQUFBO0lBQ0QsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUVsRCwwQkFBMEI7SUFDMUIsSUFBSSxRQUFRLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFO1FBQ3BELE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUE7UUFDcEUsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsOEJBQThCLENBQUMsQ0FBQTtRQUM5RSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBa0IsQ0FBQTtRQUV0RCxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQTtRQUN0QiwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTO1lBQUUsUUFBUSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUE7S0FDbkQ7SUFFRCxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUE7SUFFbkMsSUFBSSxjQUFzQixDQUFBO0lBQzFCLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1FBQy9CLGNBQWMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU8sQ0FBQTtLQUN2RDtTQUFNO1FBQ0wsY0FBYyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU8sQ0FBQTtLQUM5RTtJQUVELE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUE7SUFDekMsSUFBSSxjQUFjLEtBQUssYUFBYTtRQUFFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQTtJQUU1RSxNQUFNLElBQUksR0FBRyxPQUFPLFFBQVEsQ0FBQyxNQUFNLEtBQUssVUFBVTtRQUNoRCxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU07UUFDakIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTyxDQUFDLENBQUE7SUFDcEMsMEJBQTBCO0lBQzFCLElBQUksQ0FBQyxJQUFJO1FBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxvQkFBb0IsUUFBUSxDQUFDLE1BQU0sY0FBYyxDQUFDLENBQUE7SUFFakYscUNBQXFDO0lBQ3JDLGlEQUFpRDtJQUNqRCwwQkFBMEI7SUFDMUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsSUFBSSxDQUFFLFdBQW1CO1FBQ3BGLE1BQU0sV0FBVyxHQUFHLFdBQVcsR0FBRyxTQUFTLENBQUE7UUFDM0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUUvRixTQUFTLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO1FBRW5HLE1BQU0sWUFBWSxHQUFHLFNBQVMsS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQTtRQUNqSCxJQUFJLFFBQVEsS0FBSyxDQUFDLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLFlBQVksRUFBRTtZQUNuRixPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQTtTQUMvQjtRQUVELHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDTCxDQUFDO0FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUE0QyxDQUFBO0FBQzdELElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFBO0FBRXBCLE1BQU0sT0FBTyxJQUFLLFNBQVEsT0FBTztJQUcvQjtRQUNFLEtBQUssRUFBRSxDQUFBO1FBRVAsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDOztBQU5hLGFBQVEsR0FBVyxNQUFNLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBFeHRlbnNpb25zXG5pbXBvcnQgeyBTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgKiBhcyBlYXNpbmdQYXR0ZXJucyBmcm9tICcuL2Vhc2luZy1wYXR0ZXJucydcbmltcG9ydCB7XG4gIGdldENvbnRhaW5lcixcbiAgZ2V0T2Zmc2V0LFxufSBmcm9tICcuL3V0aWwnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBHb1RvT3B0aW9ucywgVnVldGlmeUdvVG9UYXJnZXQgfSBmcm9tICd2dWV0aWZ5L3R5cGVzL3NlcnZpY2VzL2dvdG8nXG5cbmltcG9ydCB7IFZ1ZXRpZnlTZXJ2aWNlQ29udHJhY3QgfSBmcm9tICd2dWV0aWZ5L3R5cGVzL3NlcnZpY2VzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnb1RvIChcbiAgX3RhcmdldDogVnVldGlmeUdvVG9UYXJnZXQsXG4gIF9zZXR0aW5nczogUGFydGlhbDxHb1RvT3B0aW9ucz4gPSB7fVxuKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgY29uc3Qgc2V0dGluZ3M6IEdvVG9PcHRpb25zID0ge1xuICAgIGNvbnRhaW5lcjogKGRvY3VtZW50LnNjcm9sbGluZ0VsZW1lbnQgYXMgSFRNTEVsZW1lbnQgfCBudWxsKSB8fCBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICBkdXJhdGlvbjogNTAwLFxuICAgIG9mZnNldDogMCxcbiAgICBlYXNpbmc6ICdlYXNlSW5PdXRDdWJpYycsXG4gICAgYXBwT2Zmc2V0OiB0cnVlLFxuICAgIC4uLl9zZXR0aW5ncyxcbiAgfVxuICBjb25zdCBjb250YWluZXIgPSBnZXRDb250YWluZXIoc2V0dGluZ3MuY29udGFpbmVyKVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gIGlmIChzZXR0aW5ncy5hcHBPZmZzZXQgJiYgZ29Uby5mcmFtZXdvcmsuYXBwbGljYXRpb24pIHtcbiAgICBjb25zdCBpc0RyYXdlciA9IGNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ3YtbmF2aWdhdGlvbi1kcmF3ZXInKVxuICAgIGNvbnN0IGlzQ2xpcHBlZCA9IGNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLWNsaXBwZWQnKVxuICAgIGNvbnN0IHsgYmFyLCB0b3AgfSA9IGdvVG8uZnJhbWV3b3JrLmFwcGxpY2F0aW9uIGFzIGFueVxuXG4gICAgc2V0dGluZ3Mub2Zmc2V0ICs9IGJhclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgaWYgKCFpc0RyYXdlciB8fCBpc0NsaXBwZWQpIHNldHRpbmdzLm9mZnNldCArPSB0b3BcbiAgfVxuXG4gIGNvbnN0IHN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpXG5cbiAgbGV0IHRhcmdldExvY2F0aW9uOiBudW1iZXJcbiAgaWYgKHR5cGVvZiBfdGFyZ2V0ID09PSAnbnVtYmVyJykge1xuICAgIHRhcmdldExvY2F0aW9uID0gZ2V0T2Zmc2V0KF90YXJnZXQpIC0gc2V0dGluZ3Mub2Zmc2V0IVxuICB9IGVsc2Uge1xuICAgIHRhcmdldExvY2F0aW9uID0gZ2V0T2Zmc2V0KF90YXJnZXQpIC0gZ2V0T2Zmc2V0KGNvbnRhaW5lcikgLSBzZXR0aW5ncy5vZmZzZXQhXG4gIH1cblxuICBjb25zdCBzdGFydExvY2F0aW9uID0gY29udGFpbmVyLnNjcm9sbFRvcFxuICBpZiAodGFyZ2V0TG9jYXRpb24gPT09IHN0YXJ0TG9jYXRpb24pIHJldHVybiBQcm9taXNlLnJlc29sdmUodGFyZ2V0TG9jYXRpb24pXG5cbiAgY29uc3QgZWFzZSA9IHR5cGVvZiBzZXR0aW5ncy5lYXNpbmcgPT09ICdmdW5jdGlvbidcbiAgICA/IHNldHRpbmdzLmVhc2luZ1xuICAgIDogZWFzaW5nUGF0dGVybnNbc2V0dGluZ3MuZWFzaW5nIV1cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKCFlYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBFYXNpbmcgZnVuY3Rpb24gXCIke3NldHRpbmdzLmVhc2luZ31cIiBub3QgZm91bmQuYClcblxuICAvLyBDYW5ub3QgYmUgdGVzdGVkIHByb3Blcmx5IGluIGpzZG9tXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpwcm9taXNlLW11c3QtY29tcGxldGVcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uIHN0ZXAgKGN1cnJlbnRUaW1lOiBudW1iZXIpIHtcbiAgICBjb25zdCB0aW1lRWxhcHNlZCA9IGN1cnJlbnRUaW1lIC0gc3RhcnRUaW1lXG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBNYXRoLmFicyhzZXR0aW5ncy5kdXJhdGlvbiA/IE1hdGgubWluKHRpbWVFbGFwc2VkIC8gc2V0dGluZ3MuZHVyYXRpb24sIDEpIDogMSlcblxuICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBNYXRoLmZsb29yKHN0YXJ0TG9jYXRpb24gKyAodGFyZ2V0TG9jYXRpb24gLSBzdGFydExvY2F0aW9uKSAqIGVhc2UocHJvZ3Jlc3MpKVxuXG4gICAgY29uc3QgY2xpZW50SGVpZ2h0ID0gY29udGFpbmVyID09PSBkb2N1bWVudC5ib2R5ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCA6IGNvbnRhaW5lci5jbGllbnRIZWlnaHRcbiAgICBpZiAocHJvZ3Jlc3MgPT09IDEgfHwgY2xpZW50SGVpZ2h0ICsgY29udGFpbmVyLnNjcm9sbFRvcCA9PT0gY29udGFpbmVyLnNjcm9sbEhlaWdodCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUodGFyZ2V0TG9jYXRpb24pXG4gICAgfVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApXG4gIH0pKVxufVxuXG5nb1RvLmZyYW1ld29yayA9IHt9IGFzIFJlY29yZDxzdHJpbmcsIFZ1ZXRpZnlTZXJ2aWNlQ29udHJhY3Q+XG5nb1RvLmluaXQgPSAoKSA9PiB7fVxuXG5leHBvcnQgY2xhc3MgR290byBleHRlbmRzIFNlcnZpY2Uge1xuICBwdWJsaWMgc3RhdGljIHByb3BlcnR5OiAnZ29UbycgPSAnZ29UbydcblxuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgcmV0dXJuIGdvVG9cbiAgfVxufVxuIl19