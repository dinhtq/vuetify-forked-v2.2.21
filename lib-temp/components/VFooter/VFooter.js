// Styles
import './VFooter.sass';
// Mixins
import Applicationable from '../../mixins/applicationable';
import VSheet from '../VSheet/VSheet';
import SSRBootable from '../../mixins/ssr-bootable';
// Utilities
import mixins from '../../util/mixins';
import { convertToUnit } from '../../util/helpers';
/* @vue/component */
export default mixins(VSheet, Applicationable('footer', [
    'height',
    'inset',
]), SSRBootable).extend({
    name: 'v-footer',
    props: {
        height: {
            default: 'auto',
            type: [Number, String],
        },
        inset: Boolean,
        padless: Boolean,
        tile: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        applicationProperty() {
            return this.inset ? 'insetFooter' : 'footer';
        },
        classes() {
            return {
                ...VSheet.options.computed.classes.call(this),
                'v-footer--absolute': this.absolute,
                'v-footer--fixed': !this.absolute && (this.app || this.fixed),
                'v-footer--padless': this.padless,
                'v-footer--inset': this.inset,
            };
        },
        computedBottom() {
            if (!this.isPositioned)
                return undefined;
            return this.app
                ? this.$vuetify.application.bottom
                : 0;
        },
        computedLeft() {
            if (!this.isPositioned)
                return undefined;
            return this.app && this.inset
                ? this.$vuetify.application.left
                : 0;
        },
        computedRight() {
            if (!this.isPositioned)
                return undefined;
            return this.app && this.inset
                ? this.$vuetify.application.right
                : 0;
        },
        isPositioned() {
            return Boolean(this.absolute ||
                this.fixed ||
                this.app);
        },
        styles() {
            const height = parseInt(this.height);
            return {
                ...VSheet.options.computed.styles.call(this),
                height: isNaN(height) ? height : convertToUnit(height),
                left: convertToUnit(this.computedLeft),
                right: convertToUnit(this.computedRight),
                bottom: convertToUnit(this.computedBottom),
            };
        },
    },
    methods: {
        updateApplication() {
            const height = parseInt(this.height);
            return isNaN(height)
                ? this.$el ? this.$el.clientHeight : 0
                : height;
        },
    },
    render(h) {
        const data = this.setBackgroundColor(this.color, {
            staticClass: 'v-footer',
            class: this.classes,
            style: this.styles,
        });
        return h('footer', data, this.$slots.default);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkZvb3Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZGb290ZXIvVkZvb3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxnQkFBZ0IsQ0FBQTtBQUV2QixTQUFTO0FBQ1QsT0FBTyxlQUFlLE1BQU0sOEJBQThCLENBQUE7QUFDMUQsT0FBTyxNQUFNLE1BQU0sa0JBQWtCLENBQUE7QUFDckMsT0FBTyxXQUFXLE1BQU0sMkJBQTJCLENBQUE7QUFFbkQsWUFBWTtBQUNaLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUtsRCxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLE1BQU0sRUFDTixlQUFlLENBQUMsUUFBUSxFQUFFO0lBQ3hCLFFBQVE7SUFDUixPQUFPO0NBQ1IsQ0FBQyxFQUNGLFdBQVcsQ0FDWixDQUFDLE1BQU0sQ0FBQztJQUNQLElBQUksRUFBRSxVQUFVO0lBRWhCLEtBQUssRUFBRTtRQUNMLE1BQU0sRUFBRTtZQUNOLE9BQU8sRUFBRSxNQUFNO1lBQ2YsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztTQUN2QjtRQUNELEtBQUssRUFBRSxPQUFPO1FBQ2QsT0FBTyxFQUFFLE9BQU87UUFDaEIsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFBSTtTQUNkO0tBQ0Y7SUFFRCxRQUFRLEVBQUU7UUFDUixtQkFBbUI7WUFDakIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtRQUM5QyxDQUFDO1FBQ0QsT0FBTztZQUNMLE9BQU87Z0JBQ0wsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUks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SUFDL0MsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZGb290ZXIuc2FzcydcblxuLy8gTWl4aW5zXG5pbXBvcnQgQXBwbGljYXRpb25hYmxlIGZyb20gJy4uLy4uL21peGlucy9hcHBsaWNhdGlvbmFibGUnXG5pbXBvcnQgVlNoZWV0IGZyb20gJy4uL1ZTaGVldC9WU2hlZXQnXG5pbXBvcnQgU1NSQm9vdGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3Nzci1ib290YWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgY29udmVydFRvVW5pdCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAndnVlL3R5cGVzL3Zub2RlJ1xuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBWU2hlZXQsXG4gIEFwcGxpY2F0aW9uYWJsZSgnZm9vdGVyJywgW1xuICAgICdoZWlnaHQnLFxuICAgICdpbnNldCcsXG4gIF0pLFxuICBTU1JCb290YWJsZVxuKS5leHRlbmQoe1xuICBuYW1lOiAndi1mb290ZXInLFxuXG4gIHByb3BzOiB7XG4gICAgaGVpZ2h0OiB7XG4gICAgICBkZWZhdWx0OiAnYXV0bycsXG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgIH0sXG4gICAgaW5zZXQ6IEJvb2xlYW4sXG4gICAgcGFkbGVzczogQm9vbGVhbixcbiAgICB0aWxlOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgYXBwbGljYXRpb25Qcm9wZXJ0eSAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLmluc2V0ID8gJ2luc2V0Rm9vdGVyJyA6ICdmb290ZXInXG4gICAgfSxcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uVlNoZWV0Lm9wdGlvbnMuY29tcHV0ZWQuY2xhc3Nlcy5jYWxsKHRoaXMpLFxuICAgICAgICAndi1mb290ZXItLWFic29sdXRlJzogdGhpcy5hYnNvbHV0ZSxcbiAgICAgICAgJ3YtZm9vdGVyLS1maXhlZCc6ICF0aGlzLmFic29sdXRlICYmICh0aGlzLmFwcCB8fCB0aGlzLmZpeGVkKSxcbiAgICAgICAgJ3YtZm9vdGVyLS1wYWRsZXNzJzogdGhpcy5wYWRsZXNzLFxuICAgICAgICAndi1mb290ZXItLWluc2V0JzogdGhpcy5pbnNldCxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkQm90dG9tICgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgICAgaWYgKCF0aGlzLmlzUG9zaXRpb25lZCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgICByZXR1cm4gdGhpcy5hcHBcbiAgICAgICAgPyB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLmJvdHRvbVxuICAgICAgICA6IDBcbiAgICB9LFxuICAgIGNvbXB1dGVkTGVmdCAoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICghdGhpcy5pc1Bvc2l0aW9uZWQpIHJldHVybiB1bmRlZmluZWRcblxuICAgICAgcmV0dXJuIHRoaXMuYXBwICYmIHRoaXMuaW5zZXRcbiAgICAgICAgPyB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLmxlZnRcbiAgICAgICAgOiAwXG4gICAgfSxcbiAgICBjb21wdXRlZFJpZ2h0ICgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgICAgaWYgKCF0aGlzLmlzUG9zaXRpb25lZCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgICByZXR1cm4gdGhpcy5hcHAgJiYgdGhpcy5pbnNldFxuICAgICAgICA/IHRoaXMuJHZ1ZXRpZnkuYXBwbGljYXRpb24ucmlnaHRcbiAgICAgICAgOiAwXG4gICAgfSxcbiAgICBpc1Bvc2l0aW9uZWQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIEJvb2xlYW4oXG4gICAgICAgIHRoaXMuYWJzb2x1dGUgfHxcbiAgICAgICAgdGhpcy5maXhlZCB8fFxuICAgICAgICB0aGlzLmFwcFxuICAgICAgKVxuICAgIH0sXG4gICAgc3R5bGVzICgpOiBvYmplY3Qge1xuICAgICAgY29uc3QgaGVpZ2h0ID0gcGFyc2VJbnQodGhpcy5oZWlnaHQpXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLlZTaGVldC5vcHRpb25zLmNvbXB1dGVkLnN0eWxlcy5jYWxsKHRoaXMpLFxuICAgICAgICBoZWlnaHQ6IGlzTmFOKGhlaWdodCkgPyBoZWlnaHQgOiBjb252ZXJ0VG9Vbml0KGhlaWdodCksXG4gICAgICAgIGxlZnQ6IGNvbnZlcnRUb1VuaXQodGhpcy5jb21wdXRlZExlZnQpLFxuICAgICAgICByaWdodDogY29udmVydFRvVW5pdCh0aGlzLmNvbXB1dGVkUmlnaHQpLFxuICAgICAgICBib3R0b206IGNvbnZlcnRUb1VuaXQodGhpcy5jb21wdXRlZEJvdHRvbSksXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgdXBkYXRlQXBwbGljYXRpb24gKCkge1xuICAgICAgY29uc3QgaGVpZ2h0ID0gcGFyc2VJbnQodGhpcy5oZWlnaHQpXG5cbiAgICAgIHJldHVybiBpc05hTihoZWlnaHQpXG4gICAgICAgID8gdGhpcy4kZWwgPyB0aGlzLiRlbC5jbGllbnRIZWlnaHQgOiAwXG4gICAgICAgIDogaGVpZ2h0XG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29sb3IsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1mb290ZXInLFxuICAgICAgY2xhc3M6IHRoaXMuY2xhc3NlcyxcbiAgICAgIHN0eWxlOiB0aGlzLnN0eWxlcyxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGgoJ2Zvb3RlcicsIGRhdGEsIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gIH0sXG59KVxuIl19