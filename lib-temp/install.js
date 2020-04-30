import OurVue from 'vue';
import { consoleError } from './util/console';
export function install(Vue, args = {}) {
    if (install.installed)
        return;
    install.installed = true;
    if (OurVue !== Vue) {
        consoleError('Multiple instances of Vue detected\nSee https://github.com/vuetifyjs/vuetify/issues/4068\n\nIf you\'re seeing "$attrs is readonly", it\'s caused by this');
    }
    const components = args.components || {};
    const directives = args.directives || {};
    for (const name in directives) {
        const directive = directives[name];
        Vue.directive(name, directive);
    }
    (function registerComponents(components) {
        if (components) {
            for (const key in components) {
                const component = components[key];
                if (component && !registerComponents(component.$_vuetify_subcomponents)) {
                    Vue.component(key, component);
                }
            }
            return true;
        }
        return false;
    })(components);
    // Used to avoid multiple mixins being setup
    // when in dev mode and hot module reload
    // https://github.com/vuejs/vue/issues/5089#issuecomment-284260111
    if (Vue.$_vuetify_installed)
        return;
    Vue.$_vuetify_installed = true;
    Vue.mixin({
        beforeCreate() {
            const options = this.$options;
            if (options.vuetify) {
                options.vuetify.init(this, options.ssrContext);
                this.$vuetify = Vue.observable(options.vuetify.framework);
            }
            else {
                this.$vuetify = (options.parent && options.parent.$vuetify) || this;
            }
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnN0YWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBMEIsTUFBTSxLQUFLLENBQUE7QUFFNUMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRTdDLE1BQU0sVUFBVSxPQUFPLENBQUUsR0FBbUIsRUFBRSxPQUEwQixFQUFFO0lBQ3hFLElBQUssT0FBZSxDQUFDLFNBQVM7UUFBRSxPQUFNO0lBQ3JDLE9BQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBRWpDLElBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtRQUNsQixZQUFZLENBQUMsMEpBQTBKLENBQUMsQ0FBQTtLQUN6SztJQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFBO0lBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFBO0lBRXhDLEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxFQUFFO1FBQzdCLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUVsQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUMvQjtJQUVELENBQUMsU0FBUyxrQkFBa0IsQ0FBRSxVQUFlO1FBQzNDLElBQUksVUFBVSxFQUFFO1lBQ2QsS0FBSyxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUU7Z0JBQzVCLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDakMsSUFBSSxTQUFTLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsRUFBRTtvQkFDdkUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBdUIsQ0FBQyxDQUFBO2lCQUM1QzthQUNGO1lBQ0QsT0FBTyxJQUFJLENBQUE7U0FDWjtRQUNELE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUE7SUFFZCw0Q0FBNEM7SUFDNUMseUNBQXlDO0lBQ3pDLGtFQUFrRTtJQUNsRSxJQUFJLEdBQUcsQ0FBQyxtQkFBbUI7UUFBRSxPQUFNO0lBQ25DLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUE7SUFFOUIsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUNSLFlBQVk7WUFDVixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBZSxDQUFBO1lBRXBDLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtnQkFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7YUFDMUQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUE7YUFDcEU7UUFDSCxDQUFDO0tBQ0YsQ0FBQyxDQUFBO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPdXJWdWUsIHsgVnVlQ29uc3RydWN0b3IgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBWdWV0aWZ5VXNlT3B0aW9ucyB9IGZyb20gJ3R5cGVzJ1xuaW1wb3J0IHsgY29uc29sZUVycm9yIH0gZnJvbSAnLi91dGlsL2NvbnNvbGUnXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsIChWdWU6IFZ1ZUNvbnN0cnVjdG9yLCBhcmdzOiBWdWV0aWZ5VXNlT3B0aW9ucyA9IHt9KSB7XG4gIGlmICgoaW5zdGFsbCBhcyBhbnkpLmluc3RhbGxlZCkgcmV0dXJuXG4gIChpbnN0YWxsIGFzIGFueSkuaW5zdGFsbGVkID0gdHJ1ZVxuXG4gIGlmIChPdXJWdWUgIT09IFZ1ZSkge1xuICAgIGNvbnNvbGVFcnJvcignTXVsdGlwbGUgaW5zdGFuY2VzIG9mIFZ1ZSBkZXRlY3RlZFxcblNlZSBodHRwczovL2dpdGh1Yi5jb20vdnVldGlmeWpzL3Z1ZXRpZnkvaXNzdWVzLzQwNjhcXG5cXG5JZiB5b3VcXCdyZSBzZWVpbmcgXCIkYXR0cnMgaXMgcmVhZG9ubHlcIiwgaXRcXCdzIGNhdXNlZCBieSB0aGlzJylcbiAgfVxuXG4gIGNvbnN0IGNvbXBvbmVudHMgPSBhcmdzLmNvbXBvbmVudHMgfHwge31cbiAgY29uc3QgZGlyZWN0aXZlcyA9IGFyZ3MuZGlyZWN0aXZlcyB8fCB7fVxuXG4gIGZvciAoY29uc3QgbmFtZSBpbiBkaXJlY3RpdmVzKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlID0gZGlyZWN0aXZlc1tuYW1lXVxuXG4gICAgVnVlLmRpcmVjdGl2ZShuYW1lLCBkaXJlY3RpdmUpXG4gIH1cblxuICAoZnVuY3Rpb24gcmVnaXN0ZXJDb21wb25lbnRzIChjb21wb25lbnRzOiBhbnkpIHtcbiAgICBpZiAoY29tcG9uZW50cykge1xuICAgICAgZm9yIChjb25zdCBrZXkgaW4gY29tcG9uZW50cykge1xuICAgICAgICBjb25zdCBjb21wb25lbnQgPSBjb21wb25lbnRzW2tleV1cbiAgICAgICAgaWYgKGNvbXBvbmVudCAmJiAhcmVnaXN0ZXJDb21wb25lbnRzKGNvbXBvbmVudC4kX3Z1ZXRpZnlfc3ViY29tcG9uZW50cykpIHtcbiAgICAgICAgICBWdWUuY29tcG9uZW50KGtleSwgY29tcG9uZW50IGFzIHR5cGVvZiBWdWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9KShjb21wb25lbnRzKVxuXG4gIC8vIFVzZWQgdG8gYXZvaWQgbXVsdGlwbGUgbWl4aW5zIGJlaW5nIHNldHVwXG4gIC8vIHdoZW4gaW4gZGV2IG1vZGUgYW5kIGhvdCBtb2R1bGUgcmVsb2FkXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUvaXNzdWVzLzUwODkjaXNzdWVjb21tZW50LTI4NDI2MDExMVxuICBpZiAoVnVlLiRfdnVldGlmeV9pbnN0YWxsZWQpIHJldHVyblxuICBWdWUuJF92dWV0aWZ5X2luc3RhbGxlZCA9IHRydWVcblxuICBWdWUubWl4aW4oe1xuICAgIGJlZm9yZUNyZWF0ZSAoKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gdGhpcy4kb3B0aW9ucyBhcyBhbnlcblxuICAgICAgaWYgKG9wdGlvbnMudnVldGlmeSkge1xuICAgICAgICBvcHRpb25zLnZ1ZXRpZnkuaW5pdCh0aGlzLCBvcHRpb25zLnNzckNvbnRleHQpXG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkgPSBWdWUub2JzZXJ2YWJsZShvcHRpb25zLnZ1ZXRpZnkuZnJhbWV3b3JrKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kdnVldGlmeSA9IChvcHRpb25zLnBhcmVudCAmJiBvcHRpb25zLnBhcmVudC4kdnVldGlmeSkgfHwgdGhpc1xuICAgICAgfVxuICAgIH0sXG4gIH0pXG59XG4iXX0=