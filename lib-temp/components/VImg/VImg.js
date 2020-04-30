// Styles
import './VImg.sass';
// Directives
import intersect from '../../directives/intersect';
// Components
import VResponsive from '../VResponsive';
// Utils
import { consoleError, consoleWarn } from '../../util/console';
const hasIntersect = typeof window !== 'undefined' && 'IntersectionObserver' in window;
/* @vue/component */
export default VResponsive.extend({
    name: 'v-img',
    directives: { intersect },
    props: {
        alt: String,
        contain: Boolean,
        eager: Boolean,
        gradient: String,
        lazySrc: String,
        options: {
            type: Object,
            // For more information on types, navigate to:
            // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
            default: () => ({
                root: undefined,
                rootMargin: undefined,
                threshold: undefined,
            }),
        },
        position: {
            type: String,
            default: 'center center',
        },
        sizes: String,
        src: {
            type: [String, Object],
            default: '',
        },
        srcset: String,
        transition: {
            type: [Boolean, String],
            default: 'fade-transition',
        },
    },
    data() {
        return {
            currentSrc: '',
            image: null,
            isLoading: true,
            calculatedAspectRatio: undefined,
            naturalWidth: undefined,
        };
    },
    computed: {
        computedAspectRatio() {
            return Number(this.normalisedSrc.aspect || this.calculatedAspectRatio);
        },
        normalisedSrc() {
            return typeof this.src === 'string'
                ? {
                    src: this.src,
                    srcset: this.srcset,
                    lazySrc: this.lazySrc,
                    aspect: Number(this.aspectRatio || 0),
                } : {
                src: this.src.src,
                srcset: this.srcset || this.src.srcset,
                lazySrc: this.lazySrc || this.src.lazySrc,
                aspect: Number(this.aspectRatio || this.src.aspect),
            };
        },
        __cachedImage() {
            if (!(this.normalisedSrc.src || this.normalisedSrc.lazySrc))
                return [];
            const backgroundImage = [];
            const src = this.isLoading ? this.normalisedSrc.lazySrc : this.currentSrc;
            if (this.gradient)
                backgroundImage.push(`linear-gradient(${this.gradient})`);
            if (src)
                backgroundImage.push(`url("${src}")`);
            const image = this.$createElement('div', {
                staticClass: 'v-image__image',
                class: {
                    'v-image__image--preload': this.isLoading,
                    'v-image__image--contain': this.contain,
                    'v-image__image--cover': !this.contain,
                },
                style: {
                    backgroundImage: backgroundImage.join(', '),
                    backgroundPosition: this.position,
                },
                key: +this.isLoading,
            });
            /* istanbul ignore if */
            if (!this.transition)
                return image;
            return this.$createElement('transition', {
                attrs: {
                    name: this.transition,
                    mode: 'in-out',
                },
            }, [image]);
        },
    },
    watch: {
        src() {
            // Force re-init when src changes
            if (!this.isLoading)
                this.init(undefined, undefined, true);
            else
                this.loadImage();
        },
        '$vuetify.breakpoint.width': 'getSrc',
    },
    mounted() {
        this.init();
    },
    methods: {
        init(entries, observer, isIntersecting) {
            // If the current browser supports the intersection
            // observer api, the image is not observable, and
            // the eager prop isn't being used, do not load
            if (hasIntersect &&
                !isIntersecting &&
                !this.eager)
                return;
            if (this.normalisedSrc.lazySrc) {
                const lazyImg = new Image();
                lazyImg.src = this.normalisedSrc.lazySrc;
                this.pollForSize(lazyImg, null);
            }
            /* istanbul ignore else */
            if (this.normalisedSrc.src)
                this.loadImage();
        },
        onLoad() {
            this.getSrc();
            this.isLoading = false;
            this.$emit('load', this.src);
        },
        onError() {
            consoleError(`Image load failed\n\n` +
                `src: ${this.normalisedSrc.src}`, this);
            this.$emit('error', this.src);
        },
        getSrc() {
            /* istanbul ignore else */
            if (this.image)
                this.currentSrc = this.image.currentSrc || this.image.src;
        },
        loadImage() {
            const image = new Image();
            this.image = image;
            image.onload = () => {
                /* istanbul ignore if */
                if (image.decode) {
                    image.decode().catch((err) => {
                        consoleWarn(`Failed to decode image, trying to render anyway\n\n` +
                            `src: ${this.normalisedSrc.src}` +
                            (err.message ? `\nOriginal error: ${err.message}` : ''), this);
                    }).then(this.onLoad);
                }
                else {
                    this.onLoad();
                }
            };
            image.onerror = this.onError;
            image.src = this.normalisedSrc.src;
            this.sizes && (image.sizes = this.sizes);
            this.normalisedSrc.srcset && (image.srcset = this.normalisedSrc.srcset);
            this.aspectRatio || this.pollForSize(image);
            this.getSrc();
        },
        pollForSize(img, timeout = 100) {
            const poll = () => {
                const { naturalHeight, naturalWidth } = img;
                if (naturalHeight || naturalWidth) {
                    this.naturalWidth = naturalWidth;
                    this.calculatedAspectRatio = naturalWidth / naturalHeight;
                }
                else {
                    timeout != null && setTimeout(poll, timeout);
                }
            };
            poll();
        },
        genContent() {
            const content = VResponsive.options.methods.genContent.call(this);
            if (this.naturalWidth) {
                this._b(content.data, 'div', {
                    style: { width: `${this.naturalWidth}px` },
                });
            }
            return content;
        },
        __genPlaceholder() {
            if (this.$slots.placeholder) {
                const placeholder = this.isLoading
                    ? [this.$createElement('div', {
                            staticClass: 'v-image__placeholder',
                        }, this.$slots.placeholder)]
                    : [];
                if (!this.transition)
                    return placeholder[0];
                return this.$createElement('transition', {
                    props: {
                        appear: true,
                        name: this.transition,
                    },
                }, placeholder);
            }
        },
    },
    render(h) {
        const node = VResponsive.options.render.call(this, h);
        node.data.staticClass += ' v-image';
        // Only load intersect directive if it
        // will work in the current browser.
        if (hasIntersect) {
            node.data.directives = [{
                    name: 'intersect',
                    modifiers: { once: true },
                    value: {
                        handler: this.init,
                        options: this.options,
                    },
                }];
        }
        node.data.attrs = {
            role: this.alt ? 'img' : undefined,
            'aria-label': this.alt,
        };
        node.children = [
            this.__cachedSizer,
            this.__cachedImage,
            this.__genPlaceholder(),
            this.genContent(),
        ];
        return h(node.tag, node.data, node.children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkltZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZJbWcvVkltZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxhQUFhLENBQUE7QUFFcEIsYUFBYTtBQUNiLE9BQU8sU0FBUyxNQUFNLDRCQUE0QixDQUFBO0FBTWxELGFBQWE7QUFDYixPQUFPLFdBQVcsTUFBTSxnQkFBZ0IsQ0FBQTtBQUV4QyxRQUFRO0FBQ1IsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQVU5RCxNQUFNLFlBQVksR0FBRyxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksc0JBQXNCLElBQUksTUFBTSxDQUFBO0FBRXRGLG9CQUFvQjtBQUNwQixlQUFlLFdBQVcsQ0FBQyxNQUFNLENBQUM7SUFDaEMsSUFBSSxFQUFFLE9BQU87SUFFYixVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUU7SUFFekIsS0FBSyxFQUFFO1FBQ0wsR0FBRyxFQUFFLE1BQU07UUFDWCxPQUFPLEVBQUUsT0FBTztRQUNoQixLQUFLLEVBQUUsT0FBTztRQUNkLFFBQVEsRUFBRSxNQUFNO1FBQ2hCLE9BQU8sRUFBRSxNQUFNO1FBQ2YsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLE1BQU07WUFDWiw4Q0FBOEM7WUFDOUMsNkVBQTZFO1lBQzdFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUNkLElBQUksRUFBRSxTQUFTO2dCQUNmLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixTQUFTLEVBQUUsU0FBUzthQUNyQixDQUFDO1NBQ0g7UUFDRCxRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxlQUFlO1NBQ3pCO1FBQ0QsS0FBSyxFQUFFLE1BQU07UUFDYixHQUFHLEVBQUU7WUFDSCxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1lBQ3RCLE9B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QUFFO29CQUN6QixLQUFLLEVBQUU7d0JBQ0wsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJO3dCQUNsQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87cUJBQ3RCO2lCQUNGLENBQUMsQ0FBQTtTQUNIO1FBRUQsSUFBSSxDQUFDLElBQUssQ0FBQyxLQUFLLEdBQUc7WUFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNsQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUc7U0FDdkIsQ0FBQTtRQUVELElBQUksQ0FBQyxRQUFRLEdBQUc7WUFDZCxJQUFJLENBQUMsYUFBYTtZQUNsQixJQUFJLENBQUMsYUFBYTtZQUNsQixJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFVBQVUsRUFBRTtTQUNQLENBQUE7UUFFWixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzlDLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WSW1nLnNhc3MnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBpbnRlcnNlY3QgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9pbnRlcnNlY3QnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFByb3BWYWxpZGF0b3IgfSBmcm9tICd2dWUvdHlwZXMvb3B0aW9ucydcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZSZXNwb25zaXZlIGZyb20gJy4uL1ZSZXNwb25zaXZlJ1xuXG4vLyBVdGlsc1xuaW1wb3J0IHsgY29uc29sZUVycm9yLCBjb25zb2xlV2FybiB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gbm90IGludGVuZGVkIGZvciBwdWJsaWMgdXNlLCB0aGlzIGlzIHBhc3NlZCBpbiBieSB2dWV0aWZ5LWxvYWRlclxuZXhwb3J0IGludGVyZmFjZSBzcmNPYmplY3Qge1xuICBzcmM6IHN0cmluZ1xuICBzcmNzZXQ/OiBzdHJpbmdcbiAgbGF6eVNyYzogc3RyaW5nXG4gIGFzcGVjdDogbnVtYmVyXG59XG5cbmNvbnN0IGhhc0ludGVyc2VjdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICdJbnRlcnNlY3Rpb25PYnNlcnZlcicgaW4gd2luZG93XG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBWUmVzcG9uc2l2ZS5leHRlbmQoe1xuICBuYW1lOiAndi1pbWcnLFxuXG4gIGRpcmVjdGl2ZXM6IHsgaW50ZXJzZWN0IH0sXG5cbiAgcHJvcHM6IHtcbiAgICBhbHQ6IFN0cmluZyxcbiAgICBjb250YWluOiBCb29sZWFuLFxuICAgIGVhZ2VyOiBCb29sZWFuLFxuICAgIGdyYWRpZW50OiBTdHJpbmcsXG4gICAgbGF6eVNyYzogU3RyaW5nLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHR5cGU6IE9iamVjdCxcbiAgICAgIC8vIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHR5cGVzLCBuYXZpZ2F0ZSB0bzpcbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9JbnRlcnNlY3Rpb25fT2JzZXJ2ZXJfQVBJXG4gICAgICBkZWZhdWx0OiAoKSA9PiAoe1xuICAgICAgICByb290OiB1bmRlZmluZWQsXG4gICAgICAgIHJvb3RNYXJnaW46IHVuZGVmaW5lZCxcbiAgICAgICAgdGhyZXNob2xkOiB1bmRlZmluZWQsXG4gICAgICB9KSxcbiAgICB9LFxuICAgIHBvc2l0aW9uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnY2VudGVyIGNlbnRlcicsXG4gICAgfSxcbiAgICBzaXplczogU3RyaW5nLFxuICAgIHNyYzoge1xuICAgICAgdHlwZTogW1N0cmluZywgT2JqZWN0XSxcbiAgICAgIGRlZmF1bHQ6ICcnLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxzdHJpbmcgfCBzcmNPYmplY3Q+LFxuICAgIHNyY3NldDogU3RyaW5nLFxuICAgIHRyYW5zaXRpb246IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogJ2ZhZGUtdHJhbnNpdGlvbicsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3VycmVudFNyYzogJycsIC8vIFNldCBmcm9tIHNyY3NldFxuICAgICAgaW1hZ2U6IG51bGwgYXMgSFRNTEltYWdlRWxlbWVudCB8IG51bGwsXG4gICAgICBpc0xvYWRpbmc6IHRydWUsXG4gICAgICBjYWxjdWxhdGVkQXNwZWN0UmF0aW86IHVuZGVmaW5lZCBhcyBudW1iZXIgfCB1bmRlZmluZWQsXG4gICAgICBuYXR1cmFsV2lkdGg6IHVuZGVmaW5lZCBhcyBudW1iZXIgfCB1bmRlZmluZWQsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY29tcHV0ZWRBc3BlY3RSYXRpbyAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBOdW1iZXIodGhpcy5ub3JtYWxpc2VkU3JjLmFzcGVjdCB8fCB0aGlzLmNhbGN1bGF0ZWRBc3BlY3RSYXRpbylcbiAgICB9LFxuICAgIG5vcm1hbGlzZWRTcmMgKCk6IHNyY09iamVjdCB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRoaXMuc3JjID09PSAnc3RyaW5nJ1xuICAgICAgICA/IHtcbiAgICAgICAgICBzcmM6IHRoaXMuc3JjLFxuICAgICAgICAgIHNyY3NldDogdGhpcy5zcmNzZXQsXG4gICAgICAgICAgbGF6eVNyYzogdGhpcy5sYXp5U3JjLFxuICAgICAgICAgIGFzcGVjdDogTnVtYmVyKHRoaXMuYXNwZWN0UmF0aW8gfHwgMCksXG4gICAgICAgIH0gOiB7XG4gICAgICAgICAgc3JjOiB0aGlzLnNyYy5zcmMsXG4gICAgICAgICAgc3Jjc2V0OiB0aGlzLnNyY3NldCB8fCB0aGlzLnNyYy5zcmNzZXQsXG4gICAgICAgICAgbGF6eVNyYzogdGhpcy5sYXp5U3JjIHx8IHRoaXMuc3JjLmxhenlTcmMsXG4gICAgICAgICAgYXNwZWN0OiBOdW1iZXIodGhpcy5hc3BlY3RSYXRpbyB8fCB0aGlzLnNyYy5hc3BlY3QpLFxuICAgICAgICB9XG4gICAgfSxcbiAgICBfX2NhY2hlZEltYWdlICgpOiBWTm9kZSB8IFtdIHtcbiAgICAgIGlmICghKHRoaXMubm9ybWFsaXNlZFNyYy5zcmMgfHwgdGhpcy5ub3JtYWxpc2VkU3JjLmxhenlTcmMpKSByZXR1cm4gW11cblxuICAgICAgY29uc3QgYmFja2dyb3VuZEltYWdlOiBzdHJpbmdbXSA9IFtdXG4gICAgICBjb25zdCBzcmMgPSB0aGlzLmlzTG9hZGluZyA/IHRoaXMubm9ybWFsaXNlZFNyYy5sYXp5U3JjIDogdGhpcy5jdXJyZW50U3JjXG5cbiAgICAgIGlmICh0aGlzLmdyYWRpZW50KSBiYWNrZ3JvdW5kSW1hZ2UucHVzaChgbGluZWFyLWdyYWRpZW50KCR7dGhpcy5ncmFkaWVudH0pYClcbiAgICAgIGlmIChzcmMpIGJhY2tncm91bmRJbWFnZS5wdXNoKGB1cmwoXCIke3NyY31cIilgKVxuXG4gICAgICBjb25zdCBpbWFnZSA9IHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWltYWdlX19pbWFnZScsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3YtaW1hZ2VfX2ltYWdlLS1wcmVsb2FkJzogdGhpcy5pc0xvYWRpbmcsXG4gICAgICAgICAgJ3YtaW1hZ2VfX2ltYWdlLS1jb250YWluJzogdGhpcy5jb250YWluLFxuICAgICAgICAgICd2LWltYWdlX19pbWFnZS0tY292ZXInOiAhdGhpcy5jb250YWluLFxuICAgICAgICB9LFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYmFja2dyb3VuZEltYWdlLmpvaW4oJywgJyksXG4gICAgICAgICAgYmFja2dyb3VuZFBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uLFxuICAgICAgICB9LFxuICAgICAgICBrZXk6ICt0aGlzLmlzTG9hZGluZyxcbiAgICAgIH0pXG5cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKCF0aGlzLnRyYW5zaXRpb24pIHJldHVybiBpbWFnZVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgndHJhbnNpdGlvbicsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBuYW1lOiB0aGlzLnRyYW5zaXRpb24sXG4gICAgICAgICAgbW9kZTogJ2luLW91dCcsXG4gICAgICAgIH0sXG4gICAgICB9LCBbaW1hZ2VdKVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBzcmMgKCkge1xuICAgICAgLy8gRm9yY2UgcmUtaW5pdCB3aGVuIHNyYyBjaGFuZ2VzXG4gICAgICBpZiAoIXRoaXMuaXNMb2FkaW5nKSB0aGlzLmluaXQodW5kZWZpbmVkLCB1bmRlZmluZWQsIHRydWUpXG4gICAgICBlbHNlIHRoaXMubG9hZEltYWdlKClcbiAgICB9LFxuICAgICckdnVldGlmeS5icmVha3BvaW50LndpZHRoJzogJ2dldFNyYycsXG4gIH0sXG5cbiAgbW91bnRlZCAoKSB7XG4gICAgdGhpcy5pbml0KClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgaW5pdCAoXG4gICAgICBlbnRyaWVzPzogSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeVtdLFxuICAgICAgb2JzZXJ2ZXI/OiBJbnRlcnNlY3Rpb25PYnNlcnZlcixcbiAgICAgIGlzSW50ZXJzZWN0aW5nPzogYm9vbGVhblxuICAgICkge1xuICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgYnJvd3NlciBzdXBwb3J0cyB0aGUgaW50ZXJzZWN0aW9uXG4gICAgICAvLyBvYnNlcnZlciBhcGksIHRoZSBpbWFnZSBpcyBub3Qgb2JzZXJ2YWJsZSwgYW5kXG4gICAgICAvLyB0aGUgZWFnZXIgcHJvcCBpc24ndCBiZWluZyB1c2VkLCBkbyBub3QgbG9hZFxuICAgICAgaWYgKFxuICAgICAgICBoYXNJbnRlcnNlY3QgJiZcbiAgICAgICAgIWlzSW50ZXJzZWN0aW5nICYmXG4gICAgICAgICF0aGlzLmVhZ2VyXG4gICAgICApIHJldHVyblxuXG4gICAgICBpZiAodGhpcy5ub3JtYWxpc2VkU3JjLmxhenlTcmMpIHtcbiAgICAgICAgY29uc3QgbGF6eUltZyA9IG5ldyBJbWFnZSgpXG4gICAgICAgIGxhenlJbWcuc3JjID0gdGhpcy5ub3JtYWxpc2VkU3JjLmxhenlTcmNcbiAgICAgICAgdGhpcy5wb2xsRm9yU2l6ZShsYXp5SW1nLCBudWxsKVxuICAgICAgfVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmICh0aGlzLm5vcm1hbGlzZWRTcmMuc3JjKSB0aGlzLmxvYWRJbWFnZSgpXG4gICAgfSxcbiAgICBvbkxvYWQgKCkge1xuICAgICAgdGhpcy5nZXRTcmMoKVxuICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZVxuICAgICAgdGhpcy4kZW1pdCgnbG9hZCcsIHRoaXMuc3JjKVxuICAgIH0sXG4gICAgb25FcnJvciAoKSB7XG4gICAgICBjb25zb2xlRXJyb3IoXG4gICAgICAgIGBJbWFnZSBsb2FkIGZhaWxlZFxcblxcbmAgK1xuICAgICAgICBgc3JjOiAke3RoaXMubm9ybWFsaXNlZFNyYy5zcmN9YCxcbiAgICAgICAgdGhpc1xuICAgICAgKVxuICAgICAgdGhpcy4kZW1pdCgnZXJyb3InLCB0aGlzLnNyYylcbiAgICB9LFxuICAgIGdldFNyYyAoKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKHRoaXMuaW1hZ2UpIHRoaXMuY3VycmVudFNyYyA9IHRoaXMuaW1hZ2UuY3VycmVudFNyYyB8fCB0aGlzLmltYWdlLnNyY1xuICAgIH0sXG4gICAgbG9hZEltYWdlICgpIHtcbiAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKClcbiAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZVxuXG4gICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoaW1hZ2UuZGVjb2RlKSB7XG4gICAgICAgICAgaW1hZ2UuZGVjb2RlKCkuY2F0Y2goKGVycjogRE9NRXhjZXB0aW9uKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlV2FybihcbiAgICAgICAgICAgICAgYEZhaWxlZCB0byBkZWNvZGUgaW1hZ2UsIHRyeWluZyB0byByZW5kZXIgYW55d2F5XFxuXFxuYCArXG4gICAgICAgICAgICAgIGBzcmM6ICR7dGhpcy5ub3JtYWxpc2VkU3JjLnNyY31gICtcbiAgICAgICAgICAgICAgKGVyci5tZXNzYWdlID8gYFxcbk9yaWdpbmFsIGVycm9yOiAke2Vyci5tZXNzYWdlfWAgOiAnJyksXG4gICAgICAgICAgICAgIHRoaXNcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KS50aGVuKHRoaXMub25Mb2FkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMub25Mb2FkKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaW1hZ2Uub25lcnJvciA9IHRoaXMub25FcnJvclxuXG4gICAgICBpbWFnZS5zcmMgPSB0aGlzLm5vcm1hbGlzZWRTcmMuc3JjXG4gICAgICB0aGlzLnNpemVzICYmIChpbWFnZS5zaXplcyA9IHRoaXMuc2l6ZXMpXG4gICAgICB0aGlzLm5vcm1hbGlzZWRTcmMuc3Jjc2V0ICYmIChpbWFnZS5zcmNzZXQgPSB0aGlzLm5vcm1hbGlzZWRTcmMuc3Jjc2V0KVxuXG4gICAgICB0aGlzLmFzcGVjdFJhdGlvIHx8IHRoaXMucG9sbEZvclNpemUoaW1hZ2UpXG4gICAgICB0aGlzLmdldFNyYygpXG4gICAgfSxcbiAgICBwb2xsRm9yU2l6ZSAoaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCB0aW1lb3V0OiBudW1iZXIgfCBudWxsID0gMTAwKSB7XG4gICAgICBjb25zdCBwb2xsID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB7IG5hdHVyYWxIZWlnaHQsIG5hdHVyYWxXaWR0aCB9ID0gaW1nXG5cbiAgICAgICAgaWYgKG5hdHVyYWxIZWlnaHQgfHwgbmF0dXJhbFdpZHRoKSB7XG4gICAgICAgICAgdGhpcy5uYXR1cmFsV2lkdGggPSBuYXR1cmFsV2lkdGhcbiAgICAgICAgICB0aGlzLmNhbGN1bGF0ZWRBc3BlY3RSYXRpbyA9IG5hdHVyYWxXaWR0aCAvIG5hdHVyYWxIZWlnaHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aW1lb3V0ICE9IG51bGwgJiYgc2V0VGltZW91dChwb2xsLCB0aW1lb3V0KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHBvbGwoKVxuICAgIH0sXG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICBjb25zdCBjb250ZW50OiBWTm9kZSA9IFZSZXNwb25zaXZlLm9wdGlvbnMubWV0aG9kcy5nZW5Db250ZW50LmNhbGwodGhpcylcbiAgICAgIGlmICh0aGlzLm5hdHVyYWxXaWR0aCkge1xuICAgICAgICB0aGlzLl9iKGNvbnRlbnQuZGF0YSEsICdkaXYnLCB7XG4gICAgICAgICAgc3R5bGU6IHsgd2lkdGg6IGAke3RoaXMubmF0dXJhbFdpZHRofXB4YCB9LFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudFxuICAgIH0sXG4gICAgX19nZW5QbGFjZWhvbGRlciAoKTogVk5vZGUgfCB2b2lkIHtcbiAgICAgIGlmICh0aGlzLiRzbG90cy5wbGFjZWhvbGRlcikge1xuICAgICAgICBjb25zdCBwbGFjZWhvbGRlciA9IHRoaXMuaXNMb2FkaW5nXG4gICAgICAgICAgPyBbdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWltYWdlX19wbGFjZWhvbGRlcicsXG4gICAgICAgICAgfSwgdGhpcy4kc2xvdHMucGxhY2Vob2xkZXIpXVxuICAgICAgICAgIDogW11cblxuICAgICAgICBpZiAoIXRoaXMudHJhbnNpdGlvbikgcmV0dXJuIHBsYWNlaG9sZGVyWzBdXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RyYW5zaXRpb24nLCB7XG4gICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGFwcGVhcjogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWU6IHRoaXMudHJhbnNpdGlvbixcbiAgICAgICAgICB9LFxuICAgICAgICB9LCBwbGFjZWhvbGRlcilcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCBub2RlID0gVlJlc3BvbnNpdmUub3B0aW9ucy5yZW5kZXIuY2FsbCh0aGlzLCBoKVxuXG4gICAgbm9kZS5kYXRhIS5zdGF0aWNDbGFzcyArPSAnIHYtaW1hZ2UnXG5cbiAgICAvLyBPbmx5IGxvYWQgaW50ZXJzZWN0IGRpcmVjdGl2ZSBpZiBpdFxuICAgIC8vIHdpbGwgd29yayBpbiB0aGUgY3VycmVudCBicm93c2VyLlxuICAgIGlmIChoYXNJbnRlcnNlY3QpIHtcbiAgICAgIG5vZGUuZGF0YSEuZGlyZWN0aXZlcyA9IFt7XG4gICAgICAgIG5hbWU6ICdpbnRlcnNlY3QnLFxuICAgICAgICBtb2RpZmllcnM6IHsgb25jZTogdHJ1ZSB9LFxuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIGhhbmRsZXI6IHRoaXMuaW5pdCxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIH0sXG4gICAgICB9XVxuICAgIH1cblxuICAgIG5vZGUuZGF0YSEuYXR0cnMgPSB7XG4gICAgICByb2xlOiB0aGlzLmFsdCA/ICdpbWcnIDogdW5kZWZpbmVkLFxuICAgICAgJ2FyaWEtbGFiZWwnOiB0aGlzLmFsdCxcbiAgICB9XG5cbiAgICBub2RlLmNoaWxkcmVuID0gW1xuICAgICAgdGhpcy5fX2NhY2hlZFNpemVyLFxuICAgICAgdGhpcy5fX2NhY2hlZEltYWdlLFxuICAgICAgdGhpcy5fX2dlblBsYWNlaG9sZGVyKCksXG4gICAgICB0aGlzLmdlbkNvbnRlbnQoKSxcbiAgICBdIGFzIFZOb2RlW11cblxuICAgIHJldHVybiBoKG5vZGUudGFnLCBub2RlLmRhdGEsIG5vZGUuY2hpbGRyZW4pXG4gIH0sXG59KVxuIl19