import mergeData from '../../util/mergeData';
function mergeTransitions(dest = [], ...transitions) {
    /* eslint-disable-next-line no-array-constructor */
    return Array().concat(dest, ...transitions);
}
export function createSimpleTransition(name, origin = 'top center 0', mode) {
    return {
        name,
        functional: true,
        props: {
            group: {
                type: Boolean,
                default: false,
            },
            hideOnLeave: {
                type: Boolean,
                default: false,
            },
            leaveAbsolute: {
                type: Boolean,
                default: false,
            },
            mode: {
                type: String,
                default: mode,
            },
            origin: {
                type: String,
                default: origin,
            },
        },
        render(h, context) {
            const tag = `transition${context.props.group ? '-group' : ''}`;
            const data = {
                props: {
                    name,
                    mode: context.props.mode,
                },
                on: {
                    beforeEnter(el) {
                        el.style.transformOrigin = context.props.origin;
                        el.style.webkitTransformOrigin = context.props.origin;
                    },
                },
            };
            if (context.props.leaveAbsolute) {
                data.on.leave = mergeTransitions(data.on.leave, (el) => (el.style.position = 'absolute'));
            }
            if (context.props.hideOnLeave) {
                data.on.leave = mergeTransitions(data.on.leave, (el) => (el.style.display = 'none'));
            }
            return h(tag, mergeData(context.data, data), context.children);
        },
    };
}
export function createJavascriptTransition(name, functions, mode = 'in-out') {
    return {
        name,
        functional: true,
        props: {
            mode: {
                type: String,
                default: mode,
            },
        },
        render(h, context) {
            return h('transition', mergeData(context.data, {
                props: { name },
                on: functions,
            }), context.children);
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVHJhbnNpdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3RyYW5zaXRpb25zL2NyZWF0ZVRyYW5zaXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sc0JBQXNCLENBQUE7QUFFNUMsU0FBUyxnQkFBZ0IsQ0FDdkIsT0FBOEIsRUFBRSxFQUNoQyxHQUFHLFdBQXNDO0lBRXpDLG1EQUFtRDtJQUNuRCxPQUFPLEtBQUssRUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxXQUFXLENBQUMsQ0FBQTtBQUN2RCxDQUFDO0FBRUQsTUFBTSxVQUFVLHNCQUFzQixDQUNwQyxJQUFZLEVBQ1osTUFBTSxHQUFHLGNBQWMsRUFDdkIsSUFBYTtJQUViLE9BQU87UUFDTCxJQUFJO1FBRUosVUFBVSxFQUFFLElBQUk7UUFFaEIsS0FBSyxFQUFFO1lBQ0wsS0FBSyxFQUFFO2dCQUNMLElBQUksRUFBRSxPQUFPO2dCQUNiLE9BQU8sRUFBRSxLQUFLO2FBQ2Y7WUFDRCxXQUFXLEVBQUU7Z0JBQ1gsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsT0FBTyxFQUFFLEtBQUs7YUFDZjtZQUNELGFBQWEsRUFBRTtnQkFDYixJQUFJLEVBQUUsT0FBTztnQkFDYixPQUFPLEVBQUUsS0FBSzthQUNmO1lBQ0QsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2FBQ2Q7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLE1BQU07Z0JBQ1osT0FBTyxFQUFFLE1BQU07YUFDaEI7U0FDRjtRQUVELE1BQU0sQ0FBRSxDQUFDLEVBQUUsT0FBTztZQUNoQixNQUFNLEdBQUcsR0FBRyxhQUFhLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFBO1lBQzlELE1BQU0sSUFBSSxHQUFjO2dCQUN0QixLQUFLLEVBQUU7b0JBQ0wsSUFBSTtvQkFDSixJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJO2lCQUN6QjtnQkFDRCxFQUFFLEVBQUU7b0JBQ0YsV0FBVyxDQUFFLEVBQWU7d0JBQzFCLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFBO3dCQUMvQyxFQUFFLENBQUMsS0FBSyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFBO29CQUN2RCxDQUFDO2lCQUNGO2FBQ0YsQ0FBQTtZQUVELElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxFQUFHLENBQUMsS0FBSyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUE7YUFDekc7WUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFO2dCQUM3QixJQUFJLENBQUMsRUFBRyxDQUFDLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFBO2FBQ3BHO1lBRUQsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNoRSxDQUFDO0tBQ0YsQ0FBQTtBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsMEJBQTBCLENBQ3hDLElBQVksRUFDWixTQUE4QixFQUM5QixJQUFJLEdBQUcsUUFBUTtJQUVmLE9BQU87UUFDTCxJQUFJO1FBRUosVUFBVSxFQUFFLElBQUk7UUFFaEIsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2FBQ2Q7U0FDRjtRQUVELE1BQU0sQ0FBRSxDQUFDLEVBQUUsT0FBTztZQUNoQixPQUFPLENBQUMsQ0FDTixZQUFZLEVBQ1osU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ3RCLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRTtnQkFDZixFQUFFLEVBQUUsU0FBUzthQUNkLENBQUMsRUFDRixPQUFPLENBQUMsUUFBUSxDQUNqQixDQUFBO1FBQ0gsQ0FBQztLQUNGLENBQUE7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRnVuY3Rpb25hbENvbXBvbmVudE9wdGlvbnMsIFZOb2RlLCBWTm9kZURhdGEgfSBmcm9tICd2dWUnXG5pbXBvcnQgbWVyZ2VEYXRhIGZyb20gJy4uLy4uL3V0aWwvbWVyZ2VEYXRhJ1xuXG5mdW5jdGlvbiBtZXJnZVRyYW5zaXRpb25zIChcbiAgZGVzdDogRnVuY3Rpb24gfCBGdW5jdGlvbltdID0gW10sXG4gIC4uLnRyYW5zaXRpb25zOiAoRnVuY3Rpb24gfCBGdW5jdGlvbltdKVtdXG4pIHtcbiAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWFycmF5LWNvbnN0cnVjdG9yICovXG4gIHJldHVybiBBcnJheTxGdW5jdGlvbj4oKS5jb25jYXQoZGVzdCwgLi4udHJhbnNpdGlvbnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaW1wbGVUcmFuc2l0aW9uIChcbiAgbmFtZTogc3RyaW5nLFxuICBvcmlnaW4gPSAndG9wIGNlbnRlciAwJyxcbiAgbW9kZT86IHN0cmluZ1xuKTogRnVuY3Rpb25hbENvbXBvbmVudE9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIG5hbWUsXG5cbiAgICBmdW5jdGlvbmFsOiB0cnVlLFxuXG4gICAgcHJvcHM6IHtcbiAgICAgIGdyb3VwOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIGhpZGVPbkxlYXZlOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIGxlYXZlQWJzb2x1dGU6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB9LFxuICAgICAgbW9kZToge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIGRlZmF1bHQ6IG1vZGUsXG4gICAgICB9LFxuICAgICAgb3JpZ2luOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgZGVmYXVsdDogb3JpZ2luLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgcmVuZGVyIChoLCBjb250ZXh0KTogVk5vZGUge1xuICAgICAgY29uc3QgdGFnID0gYHRyYW5zaXRpb24ke2NvbnRleHQucHJvcHMuZ3JvdXAgPyAnLWdyb3VwJyA6ICcnfWBcbiAgICAgIGNvbnN0IGRhdGE6IFZOb2RlRGF0YSA9IHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIG1vZGU6IGNvbnRleHQucHJvcHMubW9kZSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBiZWZvcmVFbnRlciAoZWw6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBlbC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBjb250ZXh0LnByb3BzLm9yaWdpblxuICAgICAgICAgICAgZWwuc3R5bGUud2Via2l0VHJhbnNmb3JtT3JpZ2luID0gY29udGV4dC5wcm9wcy5vcmlnaW5cbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfVxuXG4gICAgICBpZiAoY29udGV4dC5wcm9wcy5sZWF2ZUFic29sdXRlKSB7XG4gICAgICAgIGRhdGEub24hLmxlYXZlID0gbWVyZ2VUcmFuc2l0aW9ucyhkYXRhLm9uIS5sZWF2ZSwgKGVsOiBIVE1MRWxlbWVudCkgPT4gKGVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJykpXG4gICAgICB9XG4gICAgICBpZiAoY29udGV4dC5wcm9wcy5oaWRlT25MZWF2ZSkge1xuICAgICAgICBkYXRhLm9uIS5sZWF2ZSA9IG1lcmdlVHJhbnNpdGlvbnMoZGF0YS5vbiEubGVhdmUsIChlbDogSFRNTEVsZW1lbnQpID0+IChlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnKSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGgodGFnLCBtZXJnZURhdGEoY29udGV4dC5kYXRhLCBkYXRhKSwgY29udGV4dC5jaGlsZHJlbilcbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVKYXZhc2NyaXB0VHJhbnNpdGlvbiAoXG4gIG5hbWU6IHN0cmluZyxcbiAgZnVuY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuICBtb2RlID0gJ2luLW91dCdcbik6IEZ1bmN0aW9uYWxDb21wb25lbnRPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lLFxuXG4gICAgZnVuY3Rpb25hbDogdHJ1ZSxcblxuICAgIHByb3BzOiB7XG4gICAgICBtb2RlOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgZGVmYXVsdDogbW9kZSxcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHJlbmRlciAoaCwgY29udGV4dCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiBoKFxuICAgICAgICAndHJhbnNpdGlvbicsXG4gICAgICAgIG1lcmdlRGF0YShjb250ZXh0LmRhdGEsIHtcbiAgICAgICAgICBwcm9wczogeyBuYW1lIH0sXG4gICAgICAgICAgb246IGZ1bmN0aW9ucyxcbiAgICAgICAgfSksXG4gICAgICAgIGNvbnRleHQuY2hpbGRyZW5cbiAgICAgIClcbiAgICB9LFxuICB9XG59XG4iXX0=