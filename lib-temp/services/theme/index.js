/* eslint-disable no-multi-spaces */
// Extensions
import { Service } from '../service';
// Utilities
import * as ThemeUtils from './utils';
// Types
import Vue from 'vue';
export class Theme extends Service {
    constructor(preset) {
        super();
        this.disabled = false;
        this.isDark = null;
        this.vueInstance = null;
        this.vueMeta = null;
        const { dark, disable, options, themes, } = preset[Theme.property];
        this.dark = Boolean(dark);
        this.defaults = this.themes = themes;
        this.options = options;
        if (disable) {
            this.disabled = true;
            return;
        }
        this.themes = {
            dark: this.fillVariant(themes.dark, true),
            light: this.fillVariant(themes.light, false),
        };
    }
    // When setting css, check for element
    // and apply new values
    set css(val) {
        if (this.vueMeta) {
            if (this.isVueMeta23) {
                this.applyVueMeta23();
            }
            return;
        }
        this.checkOrCreateStyleElement() && (this.styleEl.innerHTML = val);
    }
    set dark(val) {
        const oldDark = this.isDark;
        this.isDark = val;
        // Only apply theme after dark
        // has already been set before
        oldDark != null && this.applyTheme();
    }
    get dark() {
        return Boolean(this.isDark);
    }
    // Apply current theme default
    // only called on client side
    applyTheme() {
        if (this.disabled)
            return this.clearCss();
        this.css = this.generatedStyles;
    }
    clearCss() {
        this.css = '';
    }
    // Initialize theme for SSR and SPA
    // Attach to ssrContext head or
    // apply new theme to document
    init(root, ssrContext) {
        if (this.disabled)
            return;
        /* istanbul ignore else */
        if (root.$meta) {
            this.initVueMeta(root);
        }
        else if (ssrContext) {
            this.initSSR(ssrContext);
        }
        this.initTheme();
    }
    // Allows for you to set target theme
    setTheme(theme, value) {
        this.themes[theme] = Object.assign(this.themes[theme], value);
        this.applyTheme();
    }
    // Reset theme defaults
    resetThemes() {
        this.themes.light = Object.assign({}, this.defaults.light);
        this.themes.dark = Object.assign({}, this.defaults.dark);
        this.applyTheme();
    }
    // Check for existence of style element
    checkOrCreateStyleElement() {
        this.styleEl = document.getElementById('vuetify-theme-stylesheet');
        /* istanbul ignore next */
        if (this.styleEl)
            return true;
        this.genStyleElement(); // If doesn't have it, create it
        return Boolean(this.styleEl);
    }
    fillVariant(theme = {}, dark) {
        const defaultTheme = this.themes[dark ? 'dark' : 'light'];
        return Object.assign({}, defaultTheme, theme);
    }
    // Generate the style element
    // if applicable
    genStyleElement() {
        /* istanbul ignore if */
        if (typeof document === 'undefined')
            return;
        /* istanbul ignore next */
        const options = this.options || {};
        this.styleEl = document.createElement('style');
        this.styleEl.type = 'text/css';
        this.styleEl.id = 'vuetify-theme-stylesheet';
        if (options.cspNonce) {
            this.styleEl.setAttribute('nonce', options.cspNonce);
        }
        document.head.appendChild(this.styleEl);
    }
    initVueMeta(root) {
        this.vueMeta = root.$meta();
        if (this.isVueMeta23) {
            // vue-meta needs to apply after mounted()
            root.$nextTick(() => {
                this.applyVueMeta23();
            });
            return;
        }
        const metaKeyName = typeof this.vueMeta.getOptions === 'function' ? this.vueMeta.getOptions().keyName : 'metaInfo';
        const metaInfo = root.$options[metaKeyName] || {};
        root.$options[metaKeyName] = () => {
            metaInfo.style = metaInfo.style || [];
            const vuetifyStylesheet = metaInfo.style.find((s) => s.id === 'vuetify-theme-stylesheet');
            if (!vuetifyStylesheet) {
                metaInfo.style.push({
                    cssText: this.generatedStyles,
                    type: 'text/css',
                    id: 'vuetify-theme-stylesheet',
                    nonce: (this.options || {}).cspNonce,
                });
            }
            else {
                vuetifyStylesheet.cssText = this.generatedStyles;
            }
            return metaInfo;
        };
    }
    applyVueMeta23() {
        const { set } = this.vueMeta.addApp('vuetify');
        set({
            style: [{
                    cssText: this.generatedStyles,
                    type: 'text/css',
                    id: 'vuetify-theme-stylesheet',
                    nonce: (this.options || {}).cspNonce,
                }],
        });
    }
    initSSR(ssrContext) {
        const options = this.options || {};
        // SSR
        const nonce = options.cspNonce ? ` nonce="${options.cspNonce}"` : '';
        ssrContext.head = ssrContext.head || '';
        ssrContext.head += `<style type="text/css" id="vuetify-theme-stylesheet"${nonce}>${this.generatedStyles}</style>`;
    }
    initTheme() {
        // Only watch for reactivity on client side
        if (typeof document === 'undefined')
            return;
        // If we get here somehow, ensure
        // existing instance is removed
        if (this.vueInstance)
            this.vueInstance.$destroy();
        // Use Vue instance to track reactivity
        // TODO: Update to use RFC if merged
        // https://github.com/vuejs/rfcs/blob/advanced-reactivity-api/active-rfcs/0000-advanced-reactivity-api.md
        this.vueInstance = new Vue({
            data: { themes: this.themes },
            watch: {
                themes: {
                    immediate: true,
                    deep: true,
                    handler: () => this.applyTheme(),
                },
            },
        });
    }
    get currentTheme() {
        const target = this.dark ? 'dark' : 'light';
        return this.themes[target];
    }
    get generatedStyles() {
        const theme = this.parsedTheme;
        /* istanbul ignore next */
        const options = this.options || {};
        let css;
        if (options.themeCache != null) {
            css = options.themeCache.get(theme);
            /* istanbul ignore if */
            if (css != null)
                return css;
        }
        css = ThemeUtils.genStyles(theme, options.customProperties);
        if (options.minifyTheme != null) {
            css = options.minifyTheme(css);
        }
        if (options.themeCache != null) {
            options.themeCache.set(theme, css);
        }
        return css;
    }
    get parsedTheme() {
        /* istanbul ignore next */
        const theme = this.currentTheme || {};
        return ThemeUtils.parse(theme);
    }
    // Is using v2.3 of vue-meta
    // https://github.com/nuxt/vue-meta/releases/tag/v2.3.0
    get isVueMeta23() {
        return typeof this.vueMeta.addApp === 'function';
    }
}
Theme.property = 'theme';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvdGhlbWUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsb0NBQW9DO0FBQ3BDLGFBQWE7QUFDYixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBRXBDLFlBQVk7QUFDWixPQUFPLEtBQUssVUFBVSxNQUFNLFNBQVMsQ0FBQTtBQUVyQyxRQUFRO0FBQ1IsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFBO0FBU3JCLE1BQU0sT0FBTyxLQUFNLFNBQVEsT0FBTztJQW1CaEMsWUFBYSxNQUFxQjtRQUNoQyxLQUFLLEVBQUUsQ0FBQTtRQWpCRixhQUFRLEdBQUcsS0FBSyxDQUFBO1FBVWYsV0FBTSxHQUFHLElBQXNCLENBQUE7UUFFL0IsZ0JBQVcsR0FBRyxJQUFrQixDQUFBO1FBRWhDLFlBQU8sR0FBRyxJQUFrQixDQUFBO1FBS2xDLE1BQU0sRUFDSixJQUFJLEVBQ0osT0FBTyxFQUNQLE9BQU8sRUFDUCxNQUFNLEdBQ1AsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBRTFCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFFdEIsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtZQUVwQixPQUFNO1NBQ1A7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7WUFDekMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUss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QUssQ0FBQyxDQUFBO0lBQ2hDLENBQUM7SUFFRCw0QkFBNEI7SUFDNUIsdURBQXVEO0lBQ3ZELElBQVksV0FBVztRQUNyQixPQUFPLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFBO0lBQ2xELENBQUM7O0FBalJNLGNBQVEsR0FBWSxPQUFPLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1tdWx0aS1zcGFjZXMgKi9cbi8vIEV4dGVuc2lvbnNcbmltcG9ydCB7IFNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCAqIGFzIFRoZW1lVXRpbHMgZnJvbSAnLi91dGlscydcblxuLy8gVHlwZXNcbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgVnVldGlmeVByZXNldCB9IGZyb20gJ3Z1ZXRpZnkvdHlwZXMvc2VydmljZXMvcHJlc2V0cydcbmltcG9ydCB7XG4gIFZ1ZXRpZnlQYXJzZWRUaGVtZSxcbiAgVnVldGlmeVRoZW1lcyxcbiAgVnVldGlmeVRoZW1lVmFyaWFudCxcbiAgVGhlbWUgYXMgSVRoZW1lLFxufSBmcm9tICd2dWV0aWZ5L3R5cGVzL3NlcnZpY2VzL3RoZW1lJ1xuXG5leHBvcnQgY2xhc3MgVGhlbWUgZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgc3RhdGljIHByb3BlcnR5OiAndGhlbWUnID0gJ3RoZW1lJ1xuXG4gIHB1YmxpYyBkaXNhYmxlZCA9IGZhbHNlXG5cbiAgcHVibGljIG9wdGlvbnM6IElUaGVtZVsnb3B0aW9ucyddXG5cbiAgcHVibGljIHN0eWxlRWw/OiBIVE1MU3R5bGVFbGVtZW50XG5cbiAgcHVibGljIHRoZW1lczogVnVldGlmeVRoZW1lc1xuXG4gIHB1YmxpYyBkZWZhdWx0czogVnVldGlmeVRoZW1lc1xuXG4gIHByaXZhdGUgaXNEYXJrID0gbnVsbCBhcyBib29sZWFuIHwgbnVsbFxuXG4gIHByaXZhdGUgdnVlSW5zdGFuY2UgPSBudWxsIGFzIFZ1ZSB8IG51bGxcblxuICBwcml2YXRlIHZ1ZU1ldGEgPSBudWxsIGFzIGFueSB8IG51bGxcblxuICBjb25zdHJ1Y3RvciAocHJlc2V0OiBWdWV0aWZ5UHJlc2V0KSB7XG4gICAgc3VwZXIoKVxuXG4gICAgY29uc3Qge1xuICAgICAgZGFyayxcbiAgICAgIGRpc2FibGUsXG4gICAgICBvcHRpb25zLFxuICAgICAgdGhlbWVzLFxuICAgIH0gPSBwcmVzZXRbVGhlbWUucHJvcGVydHldXG5cbiAgICB0aGlzLmRhcmsgPSBCb29sZWFuKGRhcmspXG4gICAgdGhpcy5kZWZhdWx0cyA9IHRoaXMudGhlbWVzID0gdGhlbWVzXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuXG4gICAgaWYgKGRpc2FibGUpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlXG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMudGhlbWVzID0ge1xuICAgICAgZGFyazogdGhpcy5maWxsVmFyaWFudCh0aGVtZXMuZGFyaywgdHJ1ZSksXG4gICAgICBsaWdodDogdGhpcy5maWxsVmFyaWFudCh0aGVtZXMubGlnaHQsIGZhbHNlKSxcbiAgICB9XG4gIH1cblxuICAvLyBXaGVuIHNldHRpbmcgY3NzLCBjaGVjayBmb3IgZWxlbWVudFxuICAvLyBhbmQgYXBwbHkgbmV3IHZhbHVlc1xuICBzZXQgY3NzICh2YWw6IHN0cmluZykge1xuICAgIGlmICh0aGlzLnZ1ZU1ldGEpIHtcbiAgICAgIGlmICh0aGlzLmlzVnVlTWV0YTIzKSB7XG4gICAgICAgIHRoaXMuYXBwbHlWdWVNZXRhMjMoKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuY2hlY2tPckNyZWF0ZVN0eWxlRWxlbWVudCgpICYmICh0aGlzLnN0eWxlRWwhLmlubmVySFRNTCA9IHZhbClcbiAgfVxuXG4gIHNldCBkYXJrICh2YWw6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBvbGREYXJrID0gdGhpcy5pc0RhcmtcblxuICAgIHRoaXMuaXNEYXJrID0gdmFsXG4gICAgLy8gT25seSBhcHBseSB0aGVtZSBhZnRlciBkYXJrXG4gICAgLy8gaGFzIGFscmVhZHkgYmVlbiBzZXQgYmVmb3JlXG4gICAgb2xkRGFyayAhPSBudWxsICYmIHRoaXMuYXBwbHlUaGVtZSgpXG4gIH1cblxuICBnZXQgZGFyayAoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5pc0RhcmspXG4gIH1cblxuICAvLyBBcHBseSBjdXJyZW50IHRoZW1lIGRlZmF1bHRcbiAgLy8gb25seSBjYWxsZWQgb24gY2xpZW50IHNpZGVcbiAgcHVibGljIGFwcGx5VGhlbWUgKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm4gdGhpcy5jbGVhckNzcygpXG5cbiAgICB0aGlzLmNzcyA9IHRoaXMuZ2VuZXJhdGVkU3R5bGVzXG4gIH1cblxuICBwdWJsaWMgY2xlYXJDc3MgKCk6IHZvaWQge1xuICAgIHRoaXMuY3NzID0gJydcbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgdGhlbWUgZm9yIFNTUiBhbmQgU1BBXG4gIC8vIEF0dGFjaCB0byBzc3JDb250ZXh0IGhlYWQgb3JcbiAgLy8gYXBwbHkgbmV3IHRoZW1lIHRvIGRvY3VtZW50XG4gIHB1YmxpYyBpbml0IChyb290OiBWdWUsIHNzckNvbnRleHQ/OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuXG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmICgocm9vdCBhcyBhbnkpLiRtZXRhKSB7XG4gICAgICB0aGlzLmluaXRWdWVNZXRhKHJvb3QpXG4gICAgfSBlbHNlIGlmIChzc3JDb250ZXh0KSB7XG4gICAgICB0aGlzLmluaXRTU1Ioc3NyQ29udGV4dClcbiAgICB9XG5cbiAgICB0aGlzLmluaXRUaGVtZSgpXG4gIH1cblxuICAvLyBBbGxvd3MgZm9yIHlvdSB0byBzZXQgdGFyZ2V0IHRoZW1lXG4gIHB1YmxpYyBzZXRUaGVtZSAodGhlbWU6ICdsaWdodCcgfCAnZGFyaycsIHZhbHVlOiBvYmplY3QpIHtcbiAgICB0aGlzLnRoZW1lc1t0aGVtZV0gPSBPYmplY3QuYXNzaWduKHRoaXMudGhlbWVzW3RoZW1lXSwgdmFsdWUpXG4gICAgdGhpcy5hcHBseVRoZW1lKClcbiAgfVxuXG4gIC8vIFJlc2V0IHRoZW1lIGRlZmF1bHRzXG4gIHB1YmxpYyByZXNldFRoZW1lcyAoKSB7XG4gICAgdGhpcy50aGVtZXMubGlnaHQgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRzLmxpZ2h0KVxuICAgIHRoaXMudGhlbWVzLmRhcmsgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRzLmRhcmspXG4gICAgdGhpcy5hcHBseVRoZW1lKClcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBleGlzdGVuY2Ugb2Ygc3R5bGUgZWxlbWVudFxuICBwcml2YXRlIGNoZWNrT3JDcmVhdGVTdHlsZUVsZW1lbnQgKCk6IGJvb2xlYW4ge1xuICAgIHRoaXMuc3R5bGVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2dWV0aWZ5LXRoZW1lLXN0eWxlc2hlZXQnKSBhcyBIVE1MU3R5bGVFbGVtZW50XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICh0aGlzLnN0eWxlRWwpIHJldHVybiB0cnVlXG5cbiAgICB0aGlzLmdlblN0eWxlRWxlbWVudCgpIC8vIElmIGRvZXNuJ3QgaGF2ZSBpdCwgY3JlYXRlIGl0XG5cbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLnN0eWxlRWwpXG4gIH1cblxuICBwcml2YXRlIGZpbGxWYXJpYW50IChcbiAgICB0aGVtZTogUGFydGlhbDxWdWV0aWZ5VGhlbWVWYXJpYW50PiA9IHt9LFxuICAgIGRhcms6IGJvb2xlYW5cbiAgKTogVnVldGlmeVRoZW1lVmFyaWFudCB7XG4gICAgY29uc3QgZGVmYXVsdFRoZW1lID0gdGhpcy50aGVtZXNbZGFyayA/ICdkYXJrJyA6ICdsaWdodCddXG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSxcbiAgICAgIGRlZmF1bHRUaGVtZSxcbiAgICAgIHRoZW1lXG4gICAgKVxuICB9XG5cbiAgLy8gR2VuZXJhdGUgdGhlIHN0eWxlIGVsZW1lbnRcbiAgLy8gaWYgYXBwbGljYWJsZVxuICBwcml2YXRlIGdlblN0eWxlRWxlbWVudCAoKTogdm9pZCB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zIHx8IHt9XG5cbiAgICB0aGlzLnN0eWxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgdGhpcy5zdHlsZUVsLnR5cGUgPSAndGV4dC9jc3MnXG4gICAgdGhpcy5zdHlsZUVsLmlkID0gJ3Z1ZXRpZnktdGhlbWUtc3R5bGVzaGVldCdcblxuICAgIGlmIChvcHRpb25zLmNzcE5vbmNlKSB7XG4gICAgICB0aGlzLnN0eWxlRWwuc2V0QXR0cmlidXRlKCdub25jZScsIG9wdGlvbnMuY3NwTm9uY2UpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0aGlzLnN0eWxlRWwpXG4gIH1cblxuICBwcml2YXRlIGluaXRWdWVNZXRhIChyb290OiBhbnkpIHtcbiAgICB0aGlzLnZ1ZU1ldGEgPSByb290LiRtZXRhKClcbiAgICBpZiAodGhpcy5pc1Z1ZU1ldGEyMykge1xuICAgICAgLy8gdnVlLW1ldGEgbmVlZHMgdG8gYXBwbHkgYWZ0ZXIgbW91bnRlZCgpXG4gICAgICByb290LiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgIHRoaXMuYXBwbHlWdWVNZXRhMjMoKVxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG1ldGFLZXlOYW1lID0gdHlwZW9mIHRoaXMudnVlTWV0YS5nZXRPcHRpb25zID09PSAnZnVuY3Rpb24nID8gdGhpcy52dWVNZXRhLmdldE9wdGlvbnMoKS5rZXlOYW1lIDogJ21ldGFJbmZvJ1xuICAgIGNvbnN0IG1ldGFJbmZvID0gcm9vdC4kb3B0aW9uc1ttZXRhS2V5TmFtZV0gfHwge31cblxuICAgIHJvb3QuJG9wdGlvbnNbbWV0YUtleU5hbWVdID0gKCkgPT4ge1xuICAgICAgbWV0YUluZm8uc3R5bGUgPSBtZXRhSW5mby5zdHlsZSB8fCBbXVxuXG4gICAgICBjb25zdCB2dWV0aWZ5U3R5bGVzaGVldCA9IG1ldGFJbmZvLnN0eWxlLmZpbmQoKHM6IGFueSkgPT4gcy5pZCA9PT0gJ3Z1ZXRpZnktdGhlbWUtc3R5bGVzaGVldCcpXG5cbiAgICAgIGlmICghdnVldGlmeVN0eWxlc2hlZXQpIHtcbiAgICAgICAgbWV0YUluZm8uc3R5bGUucHVzaCh7XG4gICAgICAgICAgY3NzVGV4dDogdGhpcy5nZW5lcmF0ZWRTdHlsZXMsXG4gICAgICAgICAgdHlwZTogJ3RleHQvY3NzJyxcbiAgICAgICAgICBpZDogJ3Z1ZXRpZnktdGhlbWUtc3R5bGVzaGVldCcsXG4gICAgICAgICAgbm9uY2U6ICh0aGlzLm9wdGlvbnMgfHwge30pLmNzcE5vbmNlLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdnVldGlmeVN0eWxlc2hlZXQuY3NzVGV4dCA9IHRoaXMuZ2VuZXJhdGVkU3R5bGVzXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtZXRhSW5mb1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlWdWVNZXRhMjMgKCkge1xuICAgIGNvbnN0IHsgc2V0IH0gPSB0aGlzLnZ1ZU1ldGEuYWRkQXBwKCd2dWV0aWZ5JylcblxuICAgIHNldCh7XG4gICAgICBzdHlsZTogW3tcbiAgICAgICAgY3NzVGV4dDogdGhpcy5nZW5lcmF0ZWRTdHlsZXMsXG4gICAgICAgIHR5cGU6ICd0ZXh0L2NzcycsXG4gICAgICAgIGlkOiAndnVldGlmeS10aGVtZS1zdHlsZXNoZWV0JyxcbiAgICAgICAgbm9uY2U6ICh0aGlzLm9wdGlvbnMgfHwge30pLmNzcE5vbmNlLFxuICAgICAgfV0sXG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgaW5pdFNTUiAoc3NyQ29udGV4dD86IGFueSkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMgfHwge31cbiAgICAvLyBTU1JcbiAgICBjb25zdCBub25jZSA9IG9wdGlvbnMuY3NwTm9uY2UgPyBgIG5vbmNlPVwiJHtvcHRpb25zLmNzcE5vbmNlfVwiYCA6ICcnXG4gICAgc3NyQ29udGV4dC5oZWFkID0gc3NyQ29udGV4dC5oZWFkIHx8ICcnXG4gICAgc3NyQ29udGV4dC5oZWFkICs9IGA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCIgaWQ9XCJ2dWV0aWZ5LXRoZW1lLXN0eWxlc2hlZXRcIiR7bm9uY2V9PiR7dGhpcy5nZW5lcmF0ZWRTdHlsZXN9PC9zdHlsZT5gXG4gIH1cblxuICBwcml2YXRlIGluaXRUaGVtZSAoKSB7XG4gICAgLy8gT25seSB3YXRjaCBmb3IgcmVhY3Rpdml0eSBvbiBjbGllbnQgc2lkZVxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSByZXR1cm5cblxuICAgIC8vIElmIHdlIGdldCBoZXJlIHNvbWVob3csIGVuc3VyZVxuICAgIC8vIGV4aXN0aW5nIGluc3RhbmNlIGlzIHJlbW92ZWRcbiAgICBpZiAodGhpcy52dWVJbnN0YW5jZSkgdGhpcy52dWVJbnN0YW5jZS4kZGVzdHJveSgpXG5cbiAgICAvLyBVc2UgVnVlIGluc3RhbmNlIHRvIHRyYWNrIHJlYWN0aXZpdHlcbiAgICAvLyBUT0RPOiBVcGRhdGUgdG8gdXNlIFJGQyBpZiBtZXJnZWRcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvcmZjcy9ibG9iL2FkdmFuY2VkLXJlYWN0aXZpdHktYXBpL2FjdGl2ZS1yZmNzLzAwMDAtYWR2YW5jZWQtcmVhY3Rpdml0eS1hcGkubWRcbiAgICB0aGlzLnZ1ZUluc3RhbmNlID0gbmV3IFZ1ZSh7XG4gICAgICBkYXRhOiB7IHRoZW1lczogdGhpcy50aGVtZXMgfSxcblxuICAgICAgd2F0Y2g6IHtcbiAgICAgICAgdGhlbWVzOiB7XG4gICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgaGFuZGxlcjogKCkgPT4gdGhpcy5hcHBseVRoZW1lKCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pXG4gIH1cblxuICBnZXQgY3VycmVudFRoZW1lICgpIHtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmRhcmsgPyAnZGFyaycgOiAnbGlnaHQnXG5cbiAgICByZXR1cm4gdGhpcy50aGVtZXNbdGFyZ2V0XVxuICB9XG5cbiAgZ2V0IGdlbmVyYXRlZFN0eWxlcyAoKTogc3RyaW5nIHtcbiAgICBjb25zdCB0aGVtZSA9IHRoaXMucGFyc2VkVGhlbWVcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMgfHwge31cbiAgICBsZXQgY3NzXG5cbiAgICBpZiAob3B0aW9ucy50aGVtZUNhY2hlICE9IG51bGwpIHtcbiAgICAgIGNzcyA9IG9wdGlvbnMudGhlbWVDYWNoZS5nZXQodGhlbWUpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChjc3MgIT0gbnVsbCkgcmV0dXJuIGNzc1xuICAgIH1cblxuICAgIGNzcyA9IFRoZW1lVXRpbHMuZ2VuU3R5bGVzKHRoZW1lLCBvcHRpb25zLmN1c3RvbVByb3BlcnRpZXMpXG5cbiAgICBpZiAob3B0aW9ucy5taW5pZnlUaGVtZSAhPSBudWxsKSB7XG4gICAgICBjc3MgPSBvcHRpb25zLm1pbmlmeVRoZW1lKGNzcylcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy50aGVtZUNhY2hlICE9IG51bGwpIHtcbiAgICAgIG9wdGlvbnMudGhlbWVDYWNoZS5zZXQodGhlbWUsIGNzcylcbiAgICB9XG5cbiAgICByZXR1cm4gY3NzXG4gIH1cblxuICBnZXQgcGFyc2VkVGhlbWUgKCk6IFZ1ZXRpZnlQYXJzZWRUaGVtZSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBjb25zdCB0aGVtZSA9IHRoaXMuY3VycmVudFRoZW1lIHx8IHt9XG4gICAgcmV0dXJuIFRoZW1lVXRpbHMucGFyc2UodGhlbWUpXG4gIH1cblxuICAvLyBJcyB1c2luZyB2Mi4zIG9mIHZ1ZS1tZXRhXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9udXh0L3Z1ZS1tZXRhL3JlbGVhc2VzL3RhZy92Mi4zLjBcbiAgcHJpdmF0ZSBnZXQgaXNWdWVNZXRhMjMgKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy52dWVNZXRhLmFkZEFwcCA9PT0gJ2Z1bmN0aW9uJ1xuICB9XG59XG4iXX0=