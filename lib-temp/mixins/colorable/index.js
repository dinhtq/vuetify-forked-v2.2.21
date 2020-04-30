import Vue from 'vue';
import { consoleError } from '../../util/console';
function isCssColor(color) {
    return !!color && !!color.match(/^(#|var\(--|(rgb|hsl)a?\()/);
}
export default Vue.extend({
    name: 'colorable',
    props: {
        color: String,
    },
    methods: {
        setBackgroundColor(color, data = {}) {
            if (typeof data.style === 'string') {
                // istanbul ignore next
                consoleError('style must be an object', this);
                // istanbul ignore next
                return data;
            }
            if (typeof data.class === 'string') {
                // istanbul ignore next
                consoleError('class must be an object', this);
                // istanbul ignore next
                return data;
            }
            if (isCssColor(color)) {
                data.style = {
                    ...data.style,
                    'background-color': `${color}`,
                    'border-color': `${color}`,
                };
            }
            else if (color) {
                data.class = {
                    ...data.class,
                    [color]: true,
                };
            }
            return data;
        },
        setTextColor(color, data = {}) {
            if (typeof data.style === 'string') {
                // istanbul ignore next
                consoleError('style must be an object', this);
                // istanbul ignore next
                return data;
            }
            if (typeof data.class === 'string') {
                // istanbul ignore next
                consoleError('class must be an object', this);
                // istanbul ignore next
                return data;
            }
            if (isCssColor(color)) {
                data.style = {
                    ...data.style,
                    color: `${color}`,
                    'caret-color': `${color}`,
                };
            }
            else if (color) {
                const [colorName, colorModifier] = color.toString().trim().split(' ', 2);
                data.class = {
                    ...data.class,
                    [colorName + '--text']: true,
                };
                if (colorModifier) {
                    data.class['text--' + colorModifier] = true;
                }
            }
            return data;
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL2NvbG9yYWJsZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFFckIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBRWpELFNBQVMsVUFBVSxDQUFFLEtBQXNCO0lBQ3pDLE9BQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO0FBQy9ELENBQUM7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDeEIsSUFBSSxFQUFFLFdBQVc7SUFFakIsS0FBSyxFQUFFO1FBQ0wsS0FBSyxFQUFFLE1BQU07S0FDZDtJQUVELE9BQU8sRUFBRTtRQUNQLGtCQUFrQixDQUFFLEtBQXNCLEVBQUUsT0FBa0IsRUFBRTtZQUM5RCxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ2xDLHVCQUF1QjtnQkFDdkIsWUFBWSxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUM3Qyx1QkFBdUI7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFBO2FBQ1o7WUFDRCxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ2xDLHVCQUF1QjtnQkFDdkIsWUFBWSxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUM3Qyx1QkFBdUI7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFBO2FBQ1o7WUFDRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssR0FBRztvQkFDWCxHQUFHLElBQUksQ0FBQyxLQUFlO29CQUN2QixrQkFBa0IsRUFBRSxHQUFHLEtBQUssRUFBRTtvQkFDOUIsY0FBYyxFQUFFLEdBQUcsS0FBSyxFQUFFO2lCQUMzQixDQUFBO2FBQ0Y7aUJBQU0sSUFBSSxLQUFLLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUc7b0JBQ1gsR0FBRyxJQUFJLENBQUMsS0FBSztvQkFDYixDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUk7aUJBQ2QsQ0FBQTthQUNGO1lBRUQsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO1FBRUQsWUFBWSxDQUFFLEtBQXNCLEVBQUUsT0FBa0IsRUFBRTtZQUN4RCxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ2xDLHVCQUF1QjtnQkFDdkIsWUFBWSxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUM3Qyx1QkFBdUI7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFBO2FBQ1o7WUFDRCxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ2xDLHVCQUF1QjtnQkFDdkIsWUFBWSxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUM3Qyx1QkFBdUI7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFBO2FBQ1o7WUFDRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssR0FBRztvQkFDWCxHQUFHLElBQUksQ0FBQyxLQUFlO29CQUN2QixLQUFLLEVBQUUsR0FBRyxLQUFLLEVBQUU7b0JBQ2pCLGFBQWEsRUFBRSxHQUFHLEtBQUssRUFBRTtpQkFDMUIsQ0FBQTthQUNGO2lCQUFNLElBQUksS0FBSyxFQUFFO2dCQUNoQixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBMkIsQ0FBQTtnQkFDbEcsSUFBSSxDQUFDLEtBQUssR0FBRztvQkFDWCxHQUFHLElBQUksQ0FBQyxLQUFLO29CQUNiLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxFQUFFLElBQUk7aUJBQzdCLENBQUE7Z0JBQ0QsSUFBSSxhQUFhLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQTtpQkFDNUM7YUFDRjtZQUNELE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyBWTm9kZURhdGEgfSBmcm9tICd2dWUvdHlwZXMvdm5vZGUnXG5pbXBvcnQgeyBjb25zb2xlRXJyb3IgfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5cbmZ1bmN0aW9uIGlzQ3NzQ29sb3IgKGNvbG9yPzogc3RyaW5nIHwgZmFsc2UpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhY29sb3IgJiYgISFjb2xvci5tYXRjaCgvXigjfHZhclxcKC0tfChyZ2J8aHNsKWE/XFwoKS8pXG59XG5cbmV4cG9ydCBkZWZhdWx0IFZ1ZS5leHRlbmQoe1xuICBuYW1lOiAnY29sb3JhYmxlJyxcblxuICBwcm9wczoge1xuICAgIGNvbG9yOiBTdHJpbmcsXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIHNldEJhY2tncm91bmRDb2xvciAoY29sb3I/OiBzdHJpbmcgfCBmYWxzZSwgZGF0YTogVk5vZGVEYXRhID0ge30pOiBWTm9kZURhdGEge1xuICAgICAgaWYgKHR5cGVvZiBkYXRhLnN0eWxlID09PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBjb25zb2xlRXJyb3IoJ3N0eWxlIG11c3QgYmUgYW4gb2JqZWN0JywgdGhpcylcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgZGF0YS5jbGFzcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgY29uc29sZUVycm9yKCdjbGFzcyBtdXN0IGJlIGFuIG9iamVjdCcsIHRoaXMpXG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHJldHVybiBkYXRhXG4gICAgICB9XG4gICAgICBpZiAoaXNDc3NDb2xvcihjb2xvcikpIHtcbiAgICAgICAgZGF0YS5zdHlsZSA9IHtcbiAgICAgICAgICAuLi5kYXRhLnN0eWxlIGFzIG9iamVjdCxcbiAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6IGAke2NvbG9yfWAsXG4gICAgICAgICAgJ2JvcmRlci1jb2xvcic6IGAke2NvbG9yfWAsXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY29sb3IpIHtcbiAgICAgICAgZGF0YS5jbGFzcyA9IHtcbiAgICAgICAgICAuLi5kYXRhLmNsYXNzLFxuICAgICAgICAgIFtjb2xvcl06IHRydWUsXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGFcbiAgICB9LFxuXG4gICAgc2V0VGV4dENvbG9yIChjb2xvcj86IHN0cmluZyB8IGZhbHNlLCBkYXRhOiBWTm9kZURhdGEgPSB7fSk6IFZOb2RlRGF0YSB7XG4gICAgICBpZiAodHlwZW9mIGRhdGEuc3R5bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIGNvbnNvbGVFcnJvcignc3R5bGUgbXVzdCBiZSBhbiBvYmplY3QnLCB0aGlzKVxuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICByZXR1cm4gZGF0YVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBkYXRhLmNsYXNzID09PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBjb25zb2xlRXJyb3IoJ2NsYXNzIG11c3QgYmUgYW4gb2JqZWN0JywgdGhpcylcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgcmV0dXJuIGRhdGFcbiAgICAgIH1cbiAgICAgIGlmIChpc0Nzc0NvbG9yKGNvbG9yKSkge1xuICAgICAgICBkYXRhLnN0eWxlID0ge1xuICAgICAgICAgIC4uLmRhdGEuc3R5bGUgYXMgb2JqZWN0LFxuICAgICAgICAgIGNvbG9yOiBgJHtjb2xvcn1gLFxuICAgICAgICAgICdjYXJldC1jb2xvcic6IGAke2NvbG9yfWAsXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY29sb3IpIHtcbiAgICAgICAgY29uc3QgW2NvbG9yTmFtZSwgY29sb3JNb2RpZmllcl0gPSBjb2xvci50b1N0cmluZygpLnRyaW0oKS5zcGxpdCgnICcsIDIpIGFzIChzdHJpbmcgfCB1bmRlZmluZWQpW11cbiAgICAgICAgZGF0YS5jbGFzcyA9IHtcbiAgICAgICAgICAuLi5kYXRhLmNsYXNzLFxuICAgICAgICAgIFtjb2xvck5hbWUgKyAnLS10ZXh0J106IHRydWUsXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbG9yTW9kaWZpZXIpIHtcbiAgICAgICAgICBkYXRhLmNsYXNzWyd0ZXh0LS0nICsgY29sb3JNb2RpZmllcl0gPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhXG4gICAgfSxcbiAgfSxcbn0pXG4iXX0=