function inserted(el, binding) {
    const modifiers = binding.modifiers || /* istanbul ignore next */ {};
    const value = binding.value;
    const isObject = typeof value === 'object';
    const callback = isObject ? value.handler : value;
    const { once, ...modifierKeys } = modifiers;
    const hasModifiers = Object.keys(modifierKeys).length > 0;
    const hasOptions = isObject && value.options;
    // Options take top priority
    const options = hasOptions ? value.options : hasModifiers
        // If we have modifiers, use only those provided
        ? {
            attributes: modifierKeys.attr,
            childList: modifierKeys.child,
            subtree: modifierKeys.sub,
            characterData: modifierKeys.char,
        }
        // Defaults to everything on
        : {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
        };
    const observer = new MutationObserver((mutationsList, observer) => {
        /* istanbul ignore if */
        if (!el._mutate)
            return; // Just in case, should never fire
        callback(mutationsList, observer);
        // If has the once modifier, unbind
        once && unbind(el);
    });
    observer.observe(el, options);
    el._mutate = { observer };
}
function unbind(el) {
    /* istanbul ignore if */
    if (!el._mutate)
        return;
    el._mutate.observer.disconnect();
    delete el._mutate;
}
export const Mutate = {
    inserted,
    unbind,
};
export default Mutate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0aXZlcy9tdXRhdGUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsU0FBUyxRQUFRLENBQUUsRUFBZSxFQUFFLE9BQTZCO0lBQy9ELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksMEJBQTBCLENBQUMsRUFBRSxDQUFBO0lBQ3BFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUE7SUFDM0IsTUFBTSxRQUFRLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFBO0lBQzFDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO0lBQ2pELE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxZQUFZLEVBQUUsR0FBRyxTQUFTLENBQUE7SUFDM0MsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0lBQ3pELE1BQU0sVUFBVSxHQUFHLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFBO0lBRTVDLDRCQUE0QjtJQUM1QixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFlBQVk7UUFDdkQsZ0RBQWdEO1FBQ2hELENBQUMsQ0FBQztZQUNBLFVBQVUsRUFBRSxZQUFZLENBQUMsSUFBSTtZQUM3QixTQUFTLEVBQUUsWUFBWSxDQUFDLEtBQUs7WUFDN0IsT0FBTyxFQUFFLFlBQVksQ0FBQyxHQUFHO1lBQ3pCLGFBQWEsRUFBRSxZQUFZLENBQUMsSUFBSTtTQUNqQztRQUNELDRCQUE0QjtRQUM1QixDQUFDLENBQUM7WUFDQSxVQUFVLEVBQUUsSUFBSTtZQUNoQixTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxJQUFJO1lBQ2IsYUFBYSxFQUFFLElBQUk7U0FDcEIsQ0FBQTtJQUVILE1BQU0sUUFBUSxHQUFHLElBQUksZ0JBQWdCLENBQUMsQ0FDcEMsYUFBK0IsRUFDL0IsUUFBMEIsRUFDMUIsRUFBRTtRQUNGLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU87WUFBRSxPQUFNLENBQUMsa0NBQWtDO1FBRTFELFFBQVEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFFakMsbUNBQW1DO1FBQ25DLElBQUksSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDcEIsQ0FBQyxDQUFDLENBQUE7SUFFRixRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUM3QixFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUE7QUFDM0IsQ0FBQztBQUVELFNBQVMsTUFBTSxDQUFFLEVBQWU7SUFDOUIsd0JBQXdCO0lBQ3hCLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTztRQUFFLE9BQU07SUFFdkIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUE7SUFDaEMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFBO0FBQ25CLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUc7SUFDcEIsUUFBUTtJQUNSLE1BQU07Q0FDUCxDQUFBO0FBRUQsZUFBZSxNQUFNLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWTm9kZURpcmVjdGl2ZSB9IGZyb20gJ3Z1ZSdcblxuaW50ZXJmYWNlIE11dGF0ZVZOb2RlRGlyZWN0aXZlIGV4dGVuZHMgVk5vZGVEaXJlY3RpdmUge1xuICBvcHRpb25zPzogTXV0YXRpb25PYnNlcnZlckluaXRcbn1cblxuZnVuY3Rpb24gaW5zZXJ0ZWQgKGVsOiBIVE1MRWxlbWVudCwgYmluZGluZzogTXV0YXRlVk5vZGVEaXJlY3RpdmUpIHtcbiAgY29uc3QgbW9kaWZpZXJzID0gYmluZGluZy5tb2RpZmllcnMgfHwgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8ge31cbiAgY29uc3QgdmFsdWUgPSBiaW5kaW5nLnZhbHVlXG4gIGNvbnN0IGlzT2JqZWN0ID0gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0J1xuICBjb25zdCBjYWxsYmFjayA9IGlzT2JqZWN0ID8gdmFsdWUuaGFuZGxlciA6IHZhbHVlXG4gIGNvbnN0IHsgb25jZSwgLi4ubW9kaWZpZXJLZXlzIH0gPSBtb2RpZmllcnNcbiAgY29uc3QgaGFzTW9kaWZpZXJzID0gT2JqZWN0LmtleXMobW9kaWZpZXJLZXlzKS5sZW5ndGggPiAwXG4gIGNvbnN0IGhhc09wdGlvbnMgPSBpc09iamVjdCAmJiB2YWx1ZS5vcHRpb25zXG5cbiAgLy8gT3B0aW9ucyB0YWtlIHRvcCBwcmlvcml0eVxuICBjb25zdCBvcHRpb25zID0gaGFzT3B0aW9ucyA/IHZhbHVlLm9wdGlvbnMgOiBoYXNNb2RpZmllcnNcbiAgICAvLyBJZiB3ZSBoYXZlIG1vZGlmaWVycywgdXNlIG9ubHkgdGhvc2UgcHJvdmlkZWRcbiAgICA/IHtcbiAgICAgIGF0dHJpYnV0ZXM6IG1vZGlmaWVyS2V5cy5hdHRyLFxuICAgICAgY2hpbGRMaXN0OiBtb2RpZmllcktleXMuY2hpbGQsXG4gICAgICBzdWJ0cmVlOiBtb2RpZmllcktleXMuc3ViLFxuICAgICAgY2hhcmFjdGVyRGF0YTogbW9kaWZpZXJLZXlzLmNoYXIsXG4gICAgfVxuICAgIC8vIERlZmF1bHRzIHRvIGV2ZXJ5dGhpbmcgb25cbiAgICA6IHtcbiAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgY2hhcmFjdGVyRGF0YTogdHJ1ZSxcbiAgICB9XG5cbiAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoXG4gICAgbXV0YXRpb25zTGlzdDogTXV0YXRpb25SZWNvcmRbXSxcbiAgICBvYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlclxuICApID0+IHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWVsLl9tdXRhdGUpIHJldHVybiAvLyBKdXN0IGluIGNhc2UsIHNob3VsZCBuZXZlciBmaXJlXG5cbiAgICBjYWxsYmFjayhtdXRhdGlvbnNMaXN0LCBvYnNlcnZlcilcblxuICAgIC8vIElmIGhhcyB0aGUgb25jZSBtb2RpZmllciwgdW5iaW5kXG4gICAgb25jZSAmJiB1bmJpbmQoZWwpXG4gIH0pXG5cbiAgb2JzZXJ2ZXIub2JzZXJ2ZShlbCwgb3B0aW9ucylcbiAgZWwuX211dGF0ZSA9IHsgb2JzZXJ2ZXIgfVxufVxuXG5mdW5jdGlvbiB1bmJpbmQgKGVsOiBIVE1MRWxlbWVudCkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKCFlbC5fbXV0YXRlKSByZXR1cm5cblxuICBlbC5fbXV0YXRlLm9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICBkZWxldGUgZWwuX211dGF0ZVxufVxuXG5leHBvcnQgY29uc3QgTXV0YXRlID0ge1xuICBpbnNlcnRlZCxcbiAgdW5iaW5kLFxufVxuXG5leHBvcnQgZGVmYXVsdCBNdXRhdGVcbiJdfQ==