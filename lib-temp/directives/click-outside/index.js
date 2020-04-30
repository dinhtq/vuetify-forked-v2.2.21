function closeConditional() {
    return false;
}
function directive(e, el, binding) {
    // Args may not always be supplied
    binding.args = binding.args || {};
    // If no closeConditional was supplied assign a default
    const isActive = (binding.args.closeConditional || closeConditional);
    // The include element callbacks below can be expensive
    // so we should avoid calling them when we're not active.
    // Explicitly check for false to allow fallback compatibility
    // with non-toggleable components
    if (!e || isActive(e) === false)
        return;
    // If click was triggered programmaticaly (domEl.click()) then
    // it shouldn't be treated as click-outside
    // Chrome/Firefox support isTrusted property
    // IE/Edge support pointerType property (empty if not triggered
    // by pointing device)
    if (('isTrusted' in e && !e.isTrusted) ||
        ('pointerType' in e && !e.pointerType))
        return;
    // Check if additional elements were passed to be included in check
    // (click must be outside all included elements, if any)
    const elements = (binding.args.include || (() => []))();
    // Add the root element for the component this directive was defined on
    elements.push(el);
    // Check if it's a click outside our elements, and then if our callback returns true.
    // Non-toggleable components should take action in their callback and return falsy.
    // Toggleable can return true if it wants to deactivate.
    // Note that, because we're in the capture phase, this callback will occur before
    // the bubbling click event on any outside elements.
    !elements.some(el => el.contains(e.target)) && setTimeout(() => {
        isActive(e) && binding.value && binding.value(e);
    }, 0);
}
export const ClickOutside = {
    // [data-app] may not be found
    // if using bind, inserted makes
    // sure that the root element is
    // available, iOS does not support
    // clicks on body
    inserted(el, binding) {
        const onClick = (e) => directive(e, el, binding);
        // iOS does not recognize click events on document
        // or body, this is the entire purpose of the v-app
        // component and [data-app], stop removing this
        const app = document.querySelector('[data-app]') ||
            document.body; // This is only for unit tests
        app.addEventListener('click', onClick, true);
        el._clickOutside = onClick;
    },
    unbind(el) {
        if (!el._clickOutside)
            return;
        const app = document.querySelector('[data-app]') ||
            document.body; // This is only for unit tests
        app && app.removeEventListener('click', el._clickOutside, true);
        delete el._clickOutside;
    },
};
export default ClickOutside;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0aXZlcy9jbGljay1vdXRzaWRlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVlBLFNBQVMsZ0JBQWdCO0lBQ3ZCLE9BQU8sS0FBSyxDQUFBO0FBQ2QsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFFLENBQWUsRUFBRSxFQUFlLEVBQUUsT0FBOEI7SUFDbEYsa0NBQWtDO0lBQ2xDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUE7SUFFakMsdURBQXVEO0lBQ3ZELE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFBO0lBRXBFLHVEQUF1RDtJQUN2RCx5REFBeUQ7SUFDekQsNkRBQTZEO0lBQzdELGlDQUFpQztJQUNqQyxJQUFJLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLO1FBQUUsT0FBTTtJQUV2Qyw4REFBOEQ7SUFDOUQsMkNBQTJDO0lBQzNDLDRDQUE0QztJQUM1QywrREFBK0Q7SUFDL0Qsc0JBQXNCO0lBQ3RCLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNwQyxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBQ3RDLE9BQU07SUFFUixtRUFBbUU7SUFDbkUsd0RBQXdEO0lBQ3hELE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUE7SUFDdkQsdUVBQXVFO0lBQ3ZFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFakIscUZBQXFGO0lBQ3JGLG1GQUFtRjtJQUNuRix3REFBd0Q7SUFDeEQsaUZBQWlGO0lBQ2pGLG9EQUFvRDtJQUNwRCxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFjLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDckUsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNsRCxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDUCxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHO0lBQzFCLDhCQUE4QjtJQUM5QixnQ0FBZ0M7SUFDaEMsZ0NBQWdDO0lBQ2hDLGtDQUFrQztJQUNsQyxpQkFBaUI7SUFDakIsUUFBUSxDQUFFLEVBQWUsRUFBRSxPQUE4QjtRQUN2RCxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQVEsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQWlCLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQ3ZFLGtEQUFrRDtRQUNsRCxtREFBbUQ7UUFDbkQsK0NBQStDO1FBQy9DLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDO1lBQzlDLFFBQVEsQ0FBQyxJQUFJLENBQUEsQ0FBQyw4QkFBOEI7UUFDOUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDNUMsRUFBRSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUE7SUFDNUIsQ0FBQztJQUVELE1BQU0sQ0FBRSxFQUFlO1FBQ3JCLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYTtZQUFFLE9BQU07UUFFN0IsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUM7WUFDOUMsUUFBUSxDQUFDLElBQUksQ0FBQSxDQUFDLDhCQUE4QjtRQUM5QyxHQUFHLElBQUksR0FBRyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQy9ELE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQTtJQUN6QixDQUFDO0NBQ0YsQ0FBQTtBQUVELGVBQWUsWUFBWSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVk5vZGVEaXJlY3RpdmUgfSBmcm9tICd2dWUvdHlwZXMvdm5vZGUnXG5cbmludGVyZmFjZSBDbGlja091dHNpZGVCaW5kaW5nQXJncyB7XG4gIGNsb3NlQ29uZGl0aW9uYWw/OiAoZTogRXZlbnQpID0+IGJvb2xlYW5cbiAgaW5jbHVkZT86ICgpID0+IEhUTUxFbGVtZW50W11cbn1cblxuaW50ZXJmYWNlIENsaWNrT3V0c2lkZURpcmVjdGl2ZSBleHRlbmRzIFZOb2RlRGlyZWN0aXZlIHtcbiAgdmFsdWU/OiAoZTogRXZlbnQpID0+IHZvaWRcbiAgYXJncz86IENsaWNrT3V0c2lkZUJpbmRpbmdBcmdzXG59XG5cbmZ1bmN0aW9uIGNsb3NlQ29uZGl0aW9uYWwgKCkge1xuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gZGlyZWN0aXZlIChlOiBQb2ludGVyRXZlbnQsIGVsOiBIVE1MRWxlbWVudCwgYmluZGluZzogQ2xpY2tPdXRzaWRlRGlyZWN0aXZlKTogdm9pZCB7XG4gIC8vIEFyZ3MgbWF5IG5vdCBhbHdheXMgYmUgc3VwcGxpZWRcbiAgYmluZGluZy5hcmdzID0gYmluZGluZy5hcmdzIHx8IHt9XG5cbiAgLy8gSWYgbm8gY2xvc2VDb25kaXRpb25hbCB3YXMgc3VwcGxpZWQgYXNzaWduIGEgZGVmYXVsdFxuICBjb25zdCBpc0FjdGl2ZSA9IChiaW5kaW5nLmFyZ3MuY2xvc2VDb25kaXRpb25hbCB8fCBjbG9zZUNvbmRpdGlvbmFsKVxuXG4gIC8vIFRoZSBpbmNsdWRlIGVsZW1lbnQgY2FsbGJhY2tzIGJlbG93IGNhbiBiZSBleHBlbnNpdmVcbiAgLy8gc28gd2Ugc2hvdWxkIGF2b2lkIGNhbGxpbmcgdGhlbSB3aGVuIHdlJ3JlIG5vdCBhY3RpdmUuXG4gIC8vIEV4cGxpY2l0bHkgY2hlY2sgZm9yIGZhbHNlIHRvIGFsbG93IGZhbGxiYWNrIGNvbXBhdGliaWxpdHlcbiAgLy8gd2l0aCBub24tdG9nZ2xlYWJsZSBjb21wb25lbnRzXG4gIGlmICghZSB8fCBpc0FjdGl2ZShlKSA9PT0gZmFsc2UpIHJldHVyblxuXG4gIC8vIElmIGNsaWNrIHdhcyB0cmlnZ2VyZWQgcHJvZ3JhbW1hdGljYWx5IChkb21FbC5jbGljaygpKSB0aGVuXG4gIC8vIGl0IHNob3VsZG4ndCBiZSB0cmVhdGVkIGFzIGNsaWNrLW91dHNpZGVcbiAgLy8gQ2hyb21lL0ZpcmVmb3ggc3VwcG9ydCBpc1RydXN0ZWQgcHJvcGVydHlcbiAgLy8gSUUvRWRnZSBzdXBwb3J0IHBvaW50ZXJUeXBlIHByb3BlcnR5IChlbXB0eSBpZiBub3QgdHJpZ2dlcmVkXG4gIC8vIGJ5IHBvaW50aW5nIGRldmljZSlcbiAgaWYgKCgnaXNUcnVzdGVkJyBpbiBlICYmICFlLmlzVHJ1c3RlZCkgfHxcbiAgICAoJ3BvaW50ZXJUeXBlJyBpbiBlICYmICFlLnBvaW50ZXJUeXBlKVxuICApIHJldHVyblxuXG4gIC8vIENoZWNrIGlmIGFkZGl0aW9uYWwgZWxlbWVudHMgd2VyZSBwYXNzZWQgdG8gYmUgaW5jbHVkZWQgaW4gY2hlY2tcbiAgLy8gKGNsaWNrIG11c3QgYmUgb3V0c2lkZSBhbGwgaW5jbHVkZWQgZWxlbWVudHMsIGlmIGFueSlcbiAgY29uc3QgZWxlbWVudHMgPSAoYmluZGluZy5hcmdzLmluY2x1ZGUgfHwgKCgpID0+IFtdKSkoKVxuICAvLyBBZGQgdGhlIHJvb3QgZWxlbWVudCBmb3IgdGhlIGNvbXBvbmVudCB0aGlzIGRpcmVjdGl2ZSB3YXMgZGVmaW5lZCBvblxuICBlbGVtZW50cy5wdXNoKGVsKVxuXG4gIC8vIENoZWNrIGlmIGl0J3MgYSBjbGljayBvdXRzaWRlIG91ciBlbGVtZW50cywgYW5kIHRoZW4gaWYgb3VyIGNhbGxiYWNrIHJldHVybnMgdHJ1ZS5cbiAgLy8gTm9uLXRvZ2dsZWFibGUgY29tcG9uZW50cyBzaG91bGQgdGFrZSBhY3Rpb24gaW4gdGhlaXIgY2FsbGJhY2sgYW5kIHJldHVybiBmYWxzeS5cbiAgLy8gVG9nZ2xlYWJsZSBjYW4gcmV0dXJuIHRydWUgaWYgaXQgd2FudHMgdG8gZGVhY3RpdmF0ZS5cbiAgLy8gTm90ZSB0aGF0LCBiZWNhdXNlIHdlJ3JlIGluIHRoZSBjYXB0dXJlIHBoYXNlLCB0aGlzIGNhbGxiYWNrIHdpbGwgb2NjdXIgYmVmb3JlXG4gIC8vIHRoZSBidWJibGluZyBjbGljayBldmVudCBvbiBhbnkgb3V0c2lkZSBlbGVtZW50cy5cbiAgIWVsZW1lbnRzLnNvbWUoZWwgPT4gZWwuY29udGFpbnMoZS50YXJnZXQgYXMgTm9kZSkpICYmIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGlzQWN0aXZlKGUpICYmIGJpbmRpbmcudmFsdWUgJiYgYmluZGluZy52YWx1ZShlKVxuICB9LCAwKVxufVxuXG5leHBvcnQgY29uc3QgQ2xpY2tPdXRzaWRlID0ge1xuICAvLyBbZGF0YS1hcHBdIG1heSBub3QgYmUgZm91bmRcbiAgLy8gaWYgdXNpbmcgYmluZCwgaW5zZXJ0ZWQgbWFrZXNcbiAgLy8gc3VyZSB0aGF0IHRoZSByb290IGVsZW1lbnQgaXNcbiAgLy8gYXZhaWxhYmxlLCBpT1MgZG9lcyBub3Qgc3VwcG9ydFxuICAvLyBjbGlja3Mgb24gYm9keVxuICBpbnNlcnRlZCAoZWw6IEhUTUxFbGVtZW50LCBiaW5kaW5nOiBDbGlja091dHNpZGVEaXJlY3RpdmUpIHtcbiAgICBjb25zdCBvbkNsaWNrID0gKGU6IEV2ZW50KSA9PiBkaXJlY3RpdmUoZSBhcyBQb2ludGVyRXZlbnQsIGVsLCBiaW5kaW5nKVxuICAgIC8vIGlPUyBkb2VzIG5vdCByZWNvZ25pemUgY2xpY2sgZXZlbnRzIG9uIGRvY3VtZW50XG4gICAgLy8gb3IgYm9keSwgdGhpcyBpcyB0aGUgZW50aXJlIHB1cnBvc2Ugb2YgdGhlIHYtYXBwXG4gICAgLy8gY29tcG9uZW50IGFuZCBbZGF0YS1hcHBdLCBzdG9wIHJlbW92aW5nIHRoaXNcbiAgICBjb25zdCBhcHAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hcHBdJykgfHxcbiAgICAgIGRvY3VtZW50LmJvZHkgLy8gVGhpcyBpcyBvbmx5IGZvciB1bml0IHRlc3RzXG4gICAgYXBwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljaywgdHJ1ZSlcbiAgICBlbC5fY2xpY2tPdXRzaWRlID0gb25DbGlja1xuICB9LFxuXG4gIHVuYmluZCAoZWw6IEhUTUxFbGVtZW50KSB7XG4gICAgaWYgKCFlbC5fY2xpY2tPdXRzaWRlKSByZXR1cm5cblxuICAgIGNvbnN0IGFwcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFwcF0nKSB8fFxuICAgICAgZG9jdW1lbnQuYm9keSAvLyBUaGlzIGlzIG9ubHkgZm9yIHVuaXQgdGVzdHNcbiAgICBhcHAgJiYgYXBwLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZWwuX2NsaWNrT3V0c2lkZSwgdHJ1ZSlcbiAgICBkZWxldGUgZWwuX2NsaWNrT3V0c2lkZVxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBDbGlja091dHNpZGVcbiJdfQ==