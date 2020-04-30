// Styles
import './VChipGroup.sass';
// Extensions
import { BaseSlideGroup } from '../VSlideGroup/VSlideGroup';
// Mixins
import Colorable from '../../mixins/colorable';
// Utilities
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(BaseSlideGroup, Colorable).extend({
    name: 'v-chip-group',
    provide() {
        return {
            chipGroup: this,
        };
    },
    props: {
        column: Boolean,
    },
    computed: {
        classes() {
            return {
                ...BaseSlideGroup.options.computed.classes.call(this),
                'v-chip-group': true,
                'v-chip-group--column': this.column,
            };
        },
    },
    watch: {
        column(val) {
            if (val)
                this.scrollOffset = 0;
            this.$nextTick(this.onResize);
        },
    },
    methods: {
        genData() {
            return this.setTextColor(this.color, {
                ...BaseSlideGroup.options.methods.genData.call(this),
            });
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNoaXBHcm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZDaGlwR3JvdXAvVkNoaXBHcm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxtQkFBbUIsQ0FBQTtBQUUxQixhQUFhO0FBQ2IsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFBO0FBRTNELFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUU5QyxZQUFZO0FBQ1osT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFFdEMsb0JBQW9CO0FBQ3BCLGVBQWUsTUFBTSxDQUNuQixjQUFjLEVBQ2QsU0FBUyxDQUNWLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLGNBQWM7SUFFcEIsT0FBTztRQUNMLE9BQU87WUFDTCxTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFBO0lBQ0gsQ0FBQztJQUVELEtBQUssRUFBRTtRQUNMLE1BQU0sRUFBRSxPQUFPO0tBQ2hCO0lBRUQsUUFBUSxFQUFFO1FBQ1IsT0FBTztZQUNMLE9BQU87Z0JBQ0wsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDckQsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLHNCQUFzQixFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3BDLENBQUE7UUFDSCxDQUFDO0tBQ0Y7SUFFRCxLQUFLLEVBQUU7UUFDTCxNQUFNLENBQUUsR0FBRztZQUNULElBQUksR0FBRztnQkFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQTtZQUU5QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUMvQixDQUFDO0tBQ0Y7SUFFRCxPQUFPLEVBQUU7UUFDUCxPQUFPO1lBQ0wsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ25DLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDckQsQ0FBQyxDQUFBO1FBQ0osQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVkNoaXBHcm91cC5zYXNzJ1xuXG4vLyBFeHRlbnNpb25zXG5pbXBvcnQgeyBCYXNlU2xpZGVHcm91cCB9IGZyb20gJy4uL1ZTbGlkZUdyb3VwL1ZTbGlkZUdyb3VwJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBCYXNlU2xpZGVHcm91cCxcbiAgQ29sb3JhYmxlXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWNoaXAtZ3JvdXAnLFxuXG4gIHByb3ZpZGUgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjaGlwR3JvdXA6IHRoaXMsXG4gICAgfVxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgY29sdW1uOiBCb29sZWFuLFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5CYXNlU2xpZGVHcm91cC5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtY2hpcC1ncm91cCc6IHRydWUsXG4gICAgICAgICd2LWNoaXAtZ3JvdXAtLWNvbHVtbic6IHRoaXMuY29sdW1uLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBjb2x1bW4gKHZhbCkge1xuICAgICAgaWYgKHZhbCkgdGhpcy5zY3JvbGxPZmZzZXQgPSAwXG5cbiAgICAgIHRoaXMuJG5leHRUaWNrKHRoaXMub25SZXNpemUpXG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuRGF0YSAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRUZXh0Q29sb3IodGhpcy5jb2xvciwge1xuICAgICAgICAuLi5CYXNlU2xpZGVHcm91cC5vcHRpb25zLm1ldGhvZHMuZ2VuRGF0YS5jYWxsKHRoaXMpLFxuICAgICAgfSlcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==