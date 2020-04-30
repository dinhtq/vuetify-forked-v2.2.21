import './VSimpleCheckbox.sass';
import ripple from '../../directives/ripple';
import Vue from 'vue';
import { VIcon } from '../VIcon';
import Colorable from '../../mixins/colorable';
import Themeable from '../../mixins/themeable';
import { wrapInArray } from '../../util/helpers';
export default Vue.extend({
    name: 'v-simple-checkbox',
    functional: true,
    directives: {
        ripple,
    },
    props: {
        ...Colorable.options.props,
        ...Themeable.options.props,
        disabled: Boolean,
        ripple: {
            type: Boolean,
            default: true,
        },
        value: Boolean,
        indeterminate: Boolean,
        indeterminateIcon: {
            type: String,
            default: '$checkboxIndeterminate',
        },
        onIcon: {
            type: String,
            default: '$checkboxOn',
        },
        offIcon: {
            type: String,
            default: '$checkboxOff',
        },
    },
    render(h, { props, data }) {
        const children = [];
        if (props.ripple && !props.disabled) {
            const ripple = h('div', Colorable.options.methods.setTextColor(props.color, {
                staticClass: 'v-input--selection-controls__ripple',
                directives: [{
                        name: 'ripple',
                        value: { center: true },
                    }],
            }));
            children.push(ripple);
        }
        let icon = props.offIcon;
        if (props.indeterminate)
            icon = props.indeterminateIcon;
        else if (props.value)
            icon = props.onIcon;
        children.push(h(VIcon, Colorable.options.methods.setTextColor(props.value && props.color, {
            props: {
                disabled: props.disabled,
                dark: props.dark,
                light: props.light,
            },
        }), icon));
        const classes = {
            'v-simple-checkbox': true,
            'v-simple-checkbox--disabled': props.disabled,
        };
        return h('div', {
            ...data,
            class: classes,
            on: {
                click: (e) => {
                    e.stopPropagation();
                    if (data.on && data.on.input && !props.disabled) {
                        wrapInArray(data.on.input).forEach(f => f(!props.value));
                    }
                },
            },
        }, children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNpbXBsZUNoZWNrYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkNoZWNrYm94L1ZTaW1wbGVDaGVja2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLHdCQUF3QixDQUFBO0FBRS9CLE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLE9BQU8sR0FBOEIsTUFBTSxLQUFLLENBQUE7QUFDaEQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUVoQyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFFaEQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxtQkFBbUI7SUFFekIsVUFBVSxFQUFFLElBQUk7SUFFaEIsVUFBVSxFQUFFO1FBQ1YsTUFBTTtLQUNQO0lBRUQsS0FBSyxFQUFFO1FBQ0wsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUs7UUFDMUIsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUs7UUFDMUIsUUFBUSxFQUFFLE9BQU87UUFDakIsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsS0FBSyxFQUFFLE9BQU87UUFDZCxhQUFhLEVBQUUsT0FBTztRQUN0QixpQkFBaUIsRUFBRTtZQUNqQixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSx3QkFBd0I7U0FDbEM7UUFDRCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxhQUFhO1NBQ3ZCO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsY0FBYztTQUN4QjtLQUNGO0lBRUQsTUFBTSxDQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7UUFDeEIsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFBO1FBRW5CLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7WUFDbkMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtnQkFDMUUsV0FBVyxFQUFFLHFDQUFxQztnQkFDbEQsVUFBVSxFQUFFLENBQUM7d0JBQ1gsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtxQkFDeEIsQ0FBcUI7YUFDdkIsQ0FBQyxDQUFDLENBQUE7WUFFSCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ3RCO1FBRUQsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQTtRQUN4QixJQUFJLEtBQUssQ0FBQyxhQUFhO1lBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQTthQUNsRCxJQUFJLEtBQUssQ0FBQyxLQUFLO1lBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUE7UUFFekMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDeEYsS0FBSyxFQUFFO2dCQUNMLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtnQkFDeEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO2dCQUNoQixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7YUFDbkI7U0FDRixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtRQUVWLE1BQU0sT0FBTyxHQUFHO1lBQ2QsbUJBQW1CLEVBQUUsSUFBSTtZQUN6Qiw2QkFBNkIsRUFBRSxLQUFLLENBQUMsUUFBUTtTQUM5QyxDQUFBO1FBRUQsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ2QsR0FBRyxJQUFJO1lBQ1AsS0FBSyxFQUFFLE9BQU87WUFDZCxFQUFFLEVBQUU7Z0JBQ0YsS0FBSyxFQUFFLENBQUMsQ0FBYSxFQUFFLEVBQUU7b0JBQ3ZCLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtvQkFFbkIsSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTt3QkFDL0MsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7cUJBQ3pEO2dCQUNILENBQUM7YUFDRjtTQUNGLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDZCxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL1ZTaW1wbGVDaGVja2JveC5zYXNzJ1xuXG5pbXBvcnQgcmlwcGxlIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvcmlwcGxlJ1xuXG5pbXBvcnQgVnVlLCB7IFZOb2RlLCBWTm9kZURpcmVjdGl2ZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFZJY29uIH0gZnJvbSAnLi4vVkljb24nXG5cbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RoZW1lYWJsZSdcbmltcG9ydCB7IHdyYXBJbkFycmF5IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBWdWUuZXh0ZW5kKHtcbiAgbmFtZTogJ3Ytc2ltcGxlLWNoZWNrYm94JyxcblxuICBmdW5jdGlvbmFsOiB0cnVlLFxuXG4gIGRpcmVjdGl2ZXM6IHtcbiAgICByaXBwbGUsXG4gIH0sXG5cbiAgcHJvcHM6IHtcbiAgICAuLi5Db2xvcmFibGUub3B0aW9ucy5wcm9wcyxcbiAgICAuLi5UaGVtZWFibGUub3B0aW9ucy5wcm9wcyxcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICByaXBwbGU6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgdmFsdWU6IEJvb2xlYW4sXG4gICAgaW5kZXRlcm1pbmF0ZTogQm9vbGVhbixcbiAgICBpbmRldGVybWluYXRlSWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRjaGVja2JveEluZGV0ZXJtaW5hdGUnLFxuICAgIH0sXG4gICAgb25JY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJGNoZWNrYm94T24nLFxuICAgIH0sXG4gICAgb2ZmSWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRjaGVja2JveE9mZicsXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgsIHsgcHJvcHMsIGRhdGEgfSk6IFZOb2RlIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IFtdXG5cbiAgICBpZiAocHJvcHMucmlwcGxlICYmICFwcm9wcy5kaXNhYmxlZCkge1xuICAgICAgY29uc3QgcmlwcGxlID0gaCgnZGl2JywgQ29sb3JhYmxlLm9wdGlvbnMubWV0aG9kcy5zZXRUZXh0Q29sb3IocHJvcHMuY29sb3IsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWlucHV0LS1zZWxlY3Rpb24tY29udHJvbHNfX3JpcHBsZScsXG4gICAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgICAgbmFtZTogJ3JpcHBsZScsXG4gICAgICAgICAgdmFsdWU6IHsgY2VudGVyOiB0cnVlIH0sXG4gICAgICAgIH1dIGFzIFZOb2RlRGlyZWN0aXZlW10sXG4gICAgICB9KSlcblxuICAgICAgY2hpbGRyZW4ucHVzaChyaXBwbGUpXG4gICAgfVxuXG4gICAgbGV0IGljb24gPSBwcm9wcy5vZmZJY29uXG4gICAgaWYgKHByb3BzLmluZGV0ZXJtaW5hdGUpIGljb24gPSBwcm9wcy5pbmRldGVybWluYXRlSWNvblxuICAgIGVsc2UgaWYgKHByb3BzLnZhbHVlKSBpY29uID0gcHJvcHMub25JY29uXG5cbiAgICBjaGlsZHJlbi5wdXNoKGgoVkljb24sIENvbG9yYWJsZS5vcHRpb25zLm1ldGhvZHMuc2V0VGV4dENvbG9yKHByb3BzLnZhbHVlICYmIHByb3BzLmNvbG9yLCB7XG4gICAgICBwcm9wczoge1xuICAgICAgICBkaXNhYmxlZDogcHJvcHMuZGlzYWJsZWQsXG4gICAgICAgIGRhcms6IHByb3BzLmRhcmssXG4gICAgICAgIGxpZ2h0OiBwcm9wcy5saWdodCxcbiAgICAgIH0sXG4gICAgfSksIGljb24pKVxuXG4gICAgY29uc3QgY2xhc3NlcyA9IHtcbiAgICAgICd2LXNpbXBsZS1jaGVja2JveCc6IHRydWUsXG4gICAgICAndi1zaW1wbGUtY2hlY2tib3gtLWRpc2FibGVkJzogcHJvcHMuZGlzYWJsZWQsXG4gICAgfVxuXG4gICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIC4uLmRhdGEsXG4gICAgICBjbGFzczogY2xhc3NlcyxcbiAgICAgIG9uOiB7XG4gICAgICAgIGNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgICAgIGlmIChkYXRhLm9uICYmIGRhdGEub24uaW5wdXQgJiYgIXByb3BzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICB3cmFwSW5BcnJheShkYXRhLm9uLmlucHV0KS5mb3JFYWNoKGYgPT4gZighcHJvcHMudmFsdWUpKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSwgY2hpbGRyZW4pXG4gIH0sXG59KVxuIl19