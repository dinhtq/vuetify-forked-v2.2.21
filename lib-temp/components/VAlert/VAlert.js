// Styles
import './VAlert.sass';
// Extensions
import VSheet from '../VSheet';
// Components
import VBtn from '../VBtn';
import VIcon from '../VIcon';
// Mixins
import Toggleable from '../../mixins/toggleable';
import Themeable from '../../mixins/themeable';
import Transitionable from '../../mixins/transitionable';
// Utilities
import mixins from '../../util/mixins';
import { breaking } from '../../util/console';
/* @vue/component */
export default mixins(VSheet, Toggleable, Transitionable).extend({
    name: 'v-alert',
    props: {
        border: {
            type: String,
            validator(val) {
                return [
                    'top',
                    'right',
                    'bottom',
                    'left',
                ].includes(val);
            },
        },
        closeLabel: {
            type: String,
            default: '$vuetify.close',
        },
        coloredBorder: Boolean,
        dense: Boolean,
        dismissible: Boolean,
        icon: {
            default: '',
            type: [Boolean, String],
            validator(val) {
                return typeof val === 'string' || val === false;
            },
        },
        outlined: Boolean,
        prominent: Boolean,
        text: Boolean,
        type: {
            type: String,
            validator(val) {
                return [
                    'info',
                    'error',
                    'success',
                    'warning',
                ].includes(val);
            },
        },
        value: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        __cachedBorder() {
            if (!this.border)
                return null;
            let data = {
                staticClass: 'v-alert__border',
                class: {
                    [`v-alert__border--${this.border}`]: true,
                },
            };
            if (this.coloredBorder) {
                data = this.setBackgroundColor(this.computedColor, data);
                data.class['v-alert__border--has-color'] = true;
            }
            return this.$createElement('div', data);
        },
        __cachedDismissible() {
            if (!this.dismissible)
                return null;
            const color = this.iconColor;
            return this.$createElement(VBtn, {
                staticClass: 'v-alert__dismissible',
                props: {
                    color,
                    icon: true,
                    small: true,
                },
                attrs: {
                    'aria-label': this.$vuetify.lang.t(this.closeLabel),
                },
                on: {
                    click: () => (this.isActive = false),
                },
            }, [
                this.$createElement(VIcon, {
                    props: { color },
                }, '$cancel'),
            ]);
        },
        __cachedIcon() {
            if (!this.computedIcon)
                return null;
            return this.$createElement(VIcon, {
                staticClass: 'v-alert__icon',
                props: { color: this.iconColor },
            }, this.computedIcon);
        },
        classes() {
            const classes = {
                ...VSheet.options.computed.classes.call(this),
                'v-alert--border': Boolean(this.border),
                'v-alert--dense': this.dense,
                'v-alert--outlined': this.outlined,
                'v-alert--prominent': this.prominent,
                'v-alert--text': this.text,
            };
            if (this.border) {
                classes[`v-alert--border-${this.border}`] = true;
            }
            return classes;
        },
        computedColor() {
            return this.color || this.type;
        },
        computedIcon() {
            if (this.icon === false)
                return false;
            if (typeof this.icon === 'string' && this.icon)
                return this.icon;
            if (!['error', 'info', 'success', 'warning'].includes(this.type))
                return false;
            return `$${this.type}`;
        },
        hasColoredIcon() {
            return (this.hasText ||
                (Boolean(this.border) && this.coloredBorder));
        },
        hasText() {
            return this.text || this.outlined;
        },
        iconColor() {
            return this.hasColoredIcon ? this.computedColor : undefined;
        },
        isDark() {
            if (this.type &&
                !this.coloredBorder &&
                !this.outlined)
                return true;
            return Themeable.options.computed.isDark.call(this);
        },
    },
    created() {
        /* istanbul ignore next */
        if (this.$attrs.hasOwnProperty('outline')) {
            breaking('outline', 'outlined', this);
        }
    },
    methods: {
        genWrapper() {
            const children = [
                this.$slots.prepend || this.__cachedIcon,
                this.genContent(),
                this.__cachedBorder,
                this.$slots.append,
                this.$scopedSlots.close
                    ? this.$scopedSlots.close({ toggle: this.toggle })
                    : this.__cachedDismissible,
            ];
            const data = {
                staticClass: 'v-alert__wrapper',
            };
            return this.$createElement('div', data, children);
        },
        genContent() {
            return this.$createElement('div', {
                staticClass: 'v-alert__content',
            }, this.$slots.default);
        },
        genAlert() {
            let data = {
                staticClass: 'v-alert',
                attrs: {
                    role: 'alert',
                },
                class: this.classes,
                style: this.styles,
                directives: [{
                        name: 'show',
                        value: this.isActive,
                    }],
            };
            if (!this.coloredBorder) {
                const setColor = this.hasText ? this.setTextColor : this.setBackgroundColor;
                data = setColor(this.computedColor, data);
            }
            return this.$createElement('div', data, [this.genWrapper()]);
        },
        /** @public */
        toggle() {
            this.isActive = !this.isActive;
        },
    },
    render(h) {
        const render = this.genAlert();
        if (!this.transition)
            return render;
        return h('transition', {
            props: {
                name: this.transition,
                origin: this.origin,
                mode: this.mode,
            },
        }, [render]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFsZXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkFsZXJ0L1ZBbGVydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxlQUFlLENBQUE7QUFFdEIsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLFdBQVcsQ0FBQTtBQUU5QixhQUFhO0FBQ2IsT0FBTyxJQUFJLE1BQU0sU0FBUyxDQUFBO0FBQzFCLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixTQUFTO0FBQ1QsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFDaEQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxjQUFjLE1BQU0sNkJBQTZCLENBQUE7QUFFeEQsWUFBWTtBQUNaLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQU03QyxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBYyxDQUNmLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLFNBQVM7SUFFZixLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLFNBQVMsQ0FBRSxHQUFXO2dCQUNwQixPQUFPO29CQUNMLEtBQUs7b0JBQ0wsT0FBTztvQkFDUCxRQUFRO29CQUNSLE1BQU07aUJBQ1AsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDakIsQ0FBQztTQUNGO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsZ0JBQWdCO1NBQzFCO1FBQ0QsYUFBYSxFQUFFLE9BQU87UUFDdEIsS0FBSyxFQUFFLE9BQU87UUFDZCxXQUFXLEVBQUUsT0FBTztRQUNwQixJQUFJLEVBQUU7WUFDSixPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7WUFDdkIsU0FBUyxDQUFFLEdBQXFCO2dCQUM5QixPQUFPLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxHQUFHLEtBQUssS0FBSyxDQUFBO1lBQ2pELENBQUM7U0FDRjtRQUNELFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFNBQVMsRUFBRSxPQUFPO1FBQ2xCLElBQUksRUFBRSxPQUFPO1FBQ2IsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE1BQU07WUFDWixTQUFTLENBQUUsR0FBVztnQkFDcEIsT0FBTztvQkFDTCxNQUFNO29CQUNOLE9BQU87b0JBQ1AsU0FBUztvQkFDVCxTQUFTO2lCQUNWLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2pCLENBQUM7U0FDRjtRQUNELEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLElBQUk7U0FDZDtLQUNGO0lBRUQsUUFBUSxFQUFFO1FBQ1IsY0FBYztZQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtnQkFBRSxPQUFPLElBQUksQ0FBQTtZQUU3QixJQUFJLElBQUksR0FBYztnQkFDcEIsV0FBVyxFQUFFLGlCQUFpQjtnQkFDOUIsS0FBSyxFQUFFO29CQUNMLENBQUMsb0JBQW9CLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUk7aUJBQzFDO2FBQ0YsQ0FBQTtZQUVELElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDdEIsSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUN4RCxJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLEdBQUcsSUFBSSxDQUFBO2FBQ2hEO1lBRUQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUN6QyxDQUFDO1FBQ0QsbUJBQW1CO1lBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPLElBQUksQ0FBQTtZQUVsQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFBO1lBRTVCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUU7Z0JBQy9CLFdBQVcsRUFBRSxzQkFBc0I7Z0JBQ25DLEtBQUssRUFBRTtvQkFDTCxLQUFLO29CQUNMLElBQUksRUFBRSxJQUFJO29CQUNWLEtBQUssRUFBRSxJQUFJO2lCQUNaO2dCQUNELEtBQUssRUFBRTtvQkFDTCxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7aUJBQ3BEO2dCQUNELEVBQUUsRUFBRTtvQkFDRixLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztpQkFDckM7YUFDRixFQUFFO2dCQUNELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO29CQUN6QixLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUU7aUJBQ2pCLEVBQUUsU0FBUyxDQUFDO2FBQ2QsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELFlBQVk7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7Z0JBQUUsT0FBTyxJQUFJLENBQUE7WUFFbkMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRTtnQkFDaEMsV0FBVyxFQUFFLGVBQWU7Z0JBQzVCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO2FBQ2pDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3ZCLENBQUM7UUFDRCxPQUFPO1lBQ0wsTUFBTSxPQUFPLEdBQTRCO2dCQUN2QyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUM3QyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDdkMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEtBQUs7Z0JBQzVCLG1CQUFtQixFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUNsQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDcEMsZUFBZSxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQzNCLENBQUE7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2YsT0FBTyxDQUFDLG1CQUFtQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUE7YUFDakQ7WUFFRCxPQUFPLE9BQU8sQ0FBQTtRQUNoQixDQUFDO1FBQ0QsYUFBYTtZQUNYLE9BQU8sSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFBO1FBQ2hDLENBQUM7UUFDRCxZQUFZO1lBQ1YsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUs7Z0JBQUUsT0FBTyxLQUFLLENBQUE7WUFDckMsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtZQUNoRSxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQTtZQUU5RSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3hCLENBQUM7UUFDRCxjQUFjO1lBQ1osT0FBTyxDQUNMLElBQUksQ0FBQyxPQUFPO2dCQUNaLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQzdDLENBQUE7UUFDSCxDQUFDO1FBQ0QsT0FBTztZQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFBO1FBQ25DLENBQUM7UUFDRCxTQUFTO1lBQ1AsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUE7UUFDN0QsQ0FBQztRQUNELE1BQU07WUFDSixJQUNFLElBQUksQ0FBQyxJQUFJO2dCQUNULENBQUMsSUFBSSxDQUFDLGFBQWE7Z0JBQ25CLENBQUMsSUFBSSxDQUFDLFFBQVE7Z0JBQ2QsT0FBTyxJQUFJLENBQUE7WUFFYixPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDckQsQ0FBQztLQUNGO0lBRUQsT0FBTztRQUNMLDBCQUEwQjtRQUMxQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3pDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQ3RDO0lBQ0gsQ0FBQztJQUVELE9BQU8sRUFBRTtRQUNQLFVBQVU7WUFDUixNQUFNLFFBQVEsR0FBRztnQkFDZixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsWUFBWTtnQkFDeEMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDakIsSUFBSSxDQUFDLGNBQWM7Z0JBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtnQkFDbEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLO29CQUNyQixDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNsRCxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQjthQUM3QixDQUFBO1lBRUQsTUFBTSxJQUFJLEdBQWM7Z0JBQ3RCLFdBQVcsRUFBRSxrQkFBa0I7YUFDaEMsQ0FBQTtZQUVELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ25ELENBQUM7UUFDRCxVQUFVO1lBQ1IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRTtnQkFDaEMsV0FBVyxFQUFFLGtCQUFrQjthQUNoQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDekIsQ0FBQztRQUNELFFBQVE7WUFDTixJQUFJLElBQUksR0FBYztnQkFDcEIsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsT0FBTztpQkFDZDtnQkFDRCxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ25CLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbEIsVUFBVSxFQUFFLENBQUM7d0JBQ1gsSUFBSSxFQUFFLE1BQU07d0JBQ1osS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRO3FCQUNyQixDQUFDO2FBQ0gsQ0FBQTtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN2QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUE7Z0JBQzNFLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQTthQUMxQztZQUVELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM5RCxDQUFDO1FBQ0QsY0FBYztRQUNkLE1BQU07WUFDSixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUNoQyxDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUU5QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVU7WUFBRSxPQUFPLE1BQU0sQ0FBQTtRQUVuQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUU7WUFDckIsS0FBSyxFQUFFO2dCQUNMLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNuQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7YUFDaEI7U0FDRixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUNkLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WQWxlcnQuc2FzcydcblxuLy8gRXh0ZW5zaW9uc1xuaW1wb3J0IFZTaGVldCBmcm9tICcuLi9WU2hlZXQnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWQnRuIGZyb20gJy4uL1ZCdG4nXG5pbXBvcnQgVkljb24gZnJvbSAnLi4vVkljb24nXG5cbi8vIE1peGluc1xuaW1wb3J0IFRvZ2dsZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RvZ2dsZWFibGUnXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5pbXBvcnQgVHJhbnNpdGlvbmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RyYW5zaXRpb25hYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBicmVha2luZyB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlRGF0YSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAndnVlL3R5cGVzJ1xuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBWU2hlZXQsXG4gIFRvZ2dsZWFibGUsXG4gIFRyYW5zaXRpb25hYmxlXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWFsZXJ0JyxcblxuICBwcm9wczoge1xuICAgIGJvcmRlcjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgdmFsaWRhdG9yICh2YWw6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICd0b3AnLFxuICAgICAgICAgICdyaWdodCcsXG4gICAgICAgICAgJ2JvdHRvbScsXG4gICAgICAgICAgJ2xlZnQnLFxuICAgICAgICBdLmluY2x1ZGVzKHZhbClcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjbG9zZUxhYmVsOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkuY2xvc2UnLFxuICAgIH0sXG4gICAgY29sb3JlZEJvcmRlcjogQm9vbGVhbixcbiAgICBkZW5zZTogQm9vbGVhbixcbiAgICBkaXNtaXNzaWJsZTogQm9vbGVhbixcbiAgICBpY29uOiB7XG4gICAgICBkZWZhdWx0OiAnJyxcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBTdHJpbmddLFxuICAgICAgdmFsaWRhdG9yICh2YWw6IGJvb2xlYW4gfCBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnIHx8IHZhbCA9PT0gZmFsc2VcbiAgICAgIH0sXG4gICAgfSxcbiAgICBvdXRsaW5lZDogQm9vbGVhbixcbiAgICBwcm9taW5lbnQ6IEJvb2xlYW4sXG4gICAgdGV4dDogQm9vbGVhbixcbiAgICB0eXBlOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICB2YWxpZGF0b3IgKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgJ2luZm8nLFxuICAgICAgICAgICdlcnJvcicsXG4gICAgICAgICAgJ3N1Y2Nlc3MnLFxuICAgICAgICAgICd3YXJuaW5nJyxcbiAgICAgICAgXS5pbmNsdWRlcyh2YWwpXG4gICAgICB9LFxuICAgIH0sXG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBfX2NhY2hlZEJvcmRlciAoKTogVk5vZGUgfCBudWxsIHtcbiAgICAgIGlmICghdGhpcy5ib3JkZXIpIHJldHVybiBudWxsXG5cbiAgICAgIGxldCBkYXRhOiBWTm9kZURhdGEgPSB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1hbGVydF9fYm9yZGVyJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICBbYHYtYWxlcnRfX2JvcmRlci0tJHt0aGlzLmJvcmRlcn1gXTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29sb3JlZEJvcmRlcikge1xuICAgICAgICBkYXRhID0gdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IodGhpcy5jb21wdXRlZENvbG9yLCBkYXRhKVxuICAgICAgICBkYXRhLmNsYXNzWyd2LWFsZXJ0X19ib3JkZXItLWhhcy1jb2xvciddID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgZGF0YSlcbiAgICB9LFxuICAgIF9fY2FjaGVkRGlzbWlzc2libGUgKCk6IFZOb2RlIHwgbnVsbCB7XG4gICAgICBpZiAoIXRoaXMuZGlzbWlzc2libGUpIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IGNvbG9yID0gdGhpcy5pY29uQ29sb3JcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkJ0biwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtYWxlcnRfX2Rpc21pc3NpYmxlJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBjb2xvcixcbiAgICAgICAgICBpY29uOiB0cnVlLFxuICAgICAgICAgIHNtYWxsOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgICdhcmlhLWxhYmVsJzogdGhpcy4kdnVldGlmeS5sYW5nLnQodGhpcy5jbG9zZUxhYmVsKSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjbGljazogKCkgPT4gKHRoaXMuaXNBY3RpdmUgPSBmYWxzZSksXG4gICAgICAgIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkljb24sIHtcbiAgICAgICAgICBwcm9wczogeyBjb2xvciB9LFxuICAgICAgICB9LCAnJGNhbmNlbCcpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIF9fY2FjaGVkSWNvbiAoKTogVk5vZGUgfCBudWxsIHtcbiAgICAgIGlmICghdGhpcy5jb21wdXRlZEljb24pIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1hbGVydF9faWNvbicsXG4gICAgICAgIHByb3BzOiB7IGNvbG9yOiB0aGlzLmljb25Db2xvciB9LFxuICAgICAgfSwgdGhpcy5jb21wdXRlZEljb24pXG4gICAgfSxcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgY29uc3QgY2xhc3NlczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7XG4gICAgICAgIC4uLlZTaGVldC5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtYWxlcnQtLWJvcmRlcic6IEJvb2xlYW4odGhpcy5ib3JkZXIpLFxuICAgICAgICAndi1hbGVydC0tZGVuc2UnOiB0aGlzLmRlbnNlLFxuICAgICAgICAndi1hbGVydC0tb3V0bGluZWQnOiB0aGlzLm91dGxpbmVkLFxuICAgICAgICAndi1hbGVydC0tcHJvbWluZW50JzogdGhpcy5wcm9taW5lbnQsXG4gICAgICAgICd2LWFsZXJ0LS10ZXh0JzogdGhpcy50ZXh0LFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5ib3JkZXIpIHtcbiAgICAgICAgY2xhc3Nlc1tgdi1hbGVydC0tYm9yZGVyLSR7dGhpcy5ib3JkZXJ9YF0gPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjbGFzc2VzXG4gICAgfSxcbiAgICBjb21wdXRlZENvbG9yICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMuY29sb3IgfHwgdGhpcy50eXBlXG4gICAgfSxcbiAgICBjb21wdXRlZEljb24gKCk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgICAgaWYgKHRoaXMuaWNvbiA9PT0gZmFsc2UpIHJldHVybiBmYWxzZVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLmljb24gPT09ICdzdHJpbmcnICYmIHRoaXMuaWNvbikgcmV0dXJuIHRoaXMuaWNvblxuICAgICAgaWYgKCFbJ2Vycm9yJywgJ2luZm8nLCAnc3VjY2VzcycsICd3YXJuaW5nJ10uaW5jbHVkZXModGhpcy50eXBlKSkgcmV0dXJuIGZhbHNlXG5cbiAgICAgIHJldHVybiBgJCR7dGhpcy50eXBlfWBcbiAgICB9LFxuICAgIGhhc0NvbG9yZWRJY29uICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuaGFzVGV4dCB8fFxuICAgICAgICAoQm9vbGVhbih0aGlzLmJvcmRlcikgJiYgdGhpcy5jb2xvcmVkQm9yZGVyKVxuICAgICAgKVxuICAgIH0sXG4gICAgaGFzVGV4dCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0IHx8IHRoaXMub3V0bGluZWRcbiAgICB9LFxuICAgIGljb25Db2xvciAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIHJldHVybiB0aGlzLmhhc0NvbG9yZWRJY29uID8gdGhpcy5jb21wdXRlZENvbG9yIDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBpc0RhcmsgKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnR5cGUgJiZcbiAgICAgICAgIXRoaXMuY29sb3JlZEJvcmRlciAmJlxuICAgICAgICAhdGhpcy5vdXRsaW5lZFxuICAgICAgKSByZXR1cm4gdHJ1ZVxuXG4gICAgICByZXR1cm4gVGhlbWVhYmxlLm9wdGlvbnMuY29tcHV0ZWQuaXNEYXJrLmNhbGwodGhpcylcbiAgICB9LFxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHRoaXMuJGF0dHJzLmhhc093blByb3BlcnR5KCdvdXRsaW5lJykpIHtcbiAgICAgIGJyZWFraW5nKCdvdXRsaW5lJywgJ291dGxpbmVkJywgdGhpcylcbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbldyYXBwZXIgKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW1xuICAgICAgICB0aGlzLiRzbG90cy5wcmVwZW5kIHx8IHRoaXMuX19jYWNoZWRJY29uLFxuICAgICAgICB0aGlzLmdlbkNvbnRlbnQoKSxcbiAgICAgICAgdGhpcy5fX2NhY2hlZEJvcmRlcixcbiAgICAgICAgdGhpcy4kc2xvdHMuYXBwZW5kLFxuICAgICAgICB0aGlzLiRzY29wZWRTbG90cy5jbG9zZVxuICAgICAgICAgID8gdGhpcy4kc2NvcGVkU2xvdHMuY2xvc2UoeyB0b2dnbGU6IHRoaXMudG9nZ2xlIH0pXG4gICAgICAgICAgOiB0aGlzLl9fY2FjaGVkRGlzbWlzc2libGUsXG4gICAgICBdXG5cbiAgICAgIGNvbnN0IGRhdGE6IFZOb2RlRGF0YSA9IHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWFsZXJ0X193cmFwcGVyJyxcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIGRhdGEsIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuQ29udGVudCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWFsZXJ0X19jb250ZW50JyxcbiAgICAgIH0sIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gICAgfSxcbiAgICBnZW5BbGVydCAoKTogVk5vZGUge1xuICAgICAgbGV0IGRhdGE6IFZOb2RlRGF0YSA9IHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWFsZXJ0JyxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICByb2xlOiAnYWxlcnQnLFxuICAgICAgICB9LFxuICAgICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgICBzdHlsZTogdGhpcy5zdHlsZXMsXG4gICAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgICAgbmFtZTogJ3Nob3cnLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLmlzQWN0aXZlLFxuICAgICAgICB9XSxcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmNvbG9yZWRCb3JkZXIpIHtcbiAgICAgICAgY29uc3Qgc2V0Q29sb3IgPSB0aGlzLmhhc1RleHQgPyB0aGlzLnNldFRleHRDb2xvciA6IHRoaXMuc2V0QmFja2dyb3VuZENvbG9yXG4gICAgICAgIGRhdGEgPSBzZXRDb2xvcih0aGlzLmNvbXB1dGVkQ29sb3IsIGRhdGEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCBkYXRhLCBbdGhpcy5nZW5XcmFwcGVyKCldKVxuICAgIH0sXG4gICAgLyoqIEBwdWJsaWMgKi9cbiAgICB0b2dnbGUgKCkge1xuICAgICAgdGhpcy5pc0FjdGl2ZSA9ICF0aGlzLmlzQWN0aXZlXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgcmVuZGVyID0gdGhpcy5nZW5BbGVydCgpXG5cbiAgICBpZiAoIXRoaXMudHJhbnNpdGlvbikgcmV0dXJuIHJlbmRlclxuXG4gICAgcmV0dXJuIGgoJ3RyYW5zaXRpb24nLCB7XG4gICAgICBwcm9wczoge1xuICAgICAgICBuYW1lOiB0aGlzLnRyYW5zaXRpb24sXG4gICAgICAgIG9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICAgIG1vZGU6IHRoaXMubW9kZSxcbiAgICAgIH0sXG4gICAgfSwgW3JlbmRlcl0pXG4gIH0sXG59KVxuIl19