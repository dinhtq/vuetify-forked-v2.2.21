import { camelize } from './helpers';
const pattern = {
    styleList: /;(?![^(]*\))/g,
    styleProp: /:(.*)/,
};
function parseStyle(style) {
    const styleMap = {};
    for (const s of style.split(pattern.styleList)) {
        let [key, val] = s.split(pattern.styleProp);
        key = key.trim();
        if (!key) {
            continue;
        }
        // May be undefined if the `key: value` pair is incomplete.
        if (typeof val === 'string') {
            val = val.trim();
        }
        styleMap[camelize(key)] = val;
    }
    return styleMap;
}
export default function mergeData() {
    const mergeTarget = {};
    let i = arguments.length;
    let prop;
    let event;
    // Allow for variadic argument length.
    while (i--) {
        // Iterate through the data properties and execute merge strategies
        // Object.keys eliminates need for hasOwnProperty call
        for (prop of Object.keys(arguments[i])) {
            switch (prop) {
                // Array merge strategy (array concatenation)
                case 'class':
                case 'style':
                case 'directives':
                    if (!arguments[i][prop]) {
                        break;
                    }
                    if (!Array.isArray(mergeTarget[prop])) {
                        mergeTarget[prop] = [];
                    }
                    if (prop === 'style') {
                        let style;
                        if (Array.isArray(arguments[i].style)) {
                            style = arguments[i].style;
                        }
                        else {
                            style = [arguments[i].style];
                        }
                        for (let j = 0; j < style.length; j++) {
                            const s = style[j];
                            if (typeof s === 'string') {
                                style[j] = parseStyle(s);
                            }
                        }
                        arguments[i].style = style;
                    }
                    // Repackaging in an array allows Vue runtime
                    // to merge class/style bindings regardless of type.
                    mergeTarget[prop] = mergeTarget[prop].concat(arguments[i][prop]);
                    break;
                // Space delimited string concatenation strategy
                case 'staticClass':
                    if (!arguments[i][prop]) {
                        break;
                    }
                    if (mergeTarget[prop] === undefined) {
                        mergeTarget[prop] = '';
                    }
                    if (mergeTarget[prop]) {
                        // Not an empty string, so concatenate
                        mergeTarget[prop] += ' ';
                    }
                    mergeTarget[prop] += arguments[i][prop].trim();
                    break;
                // Object, the properties of which to merge via array merge strategy (array concatenation).
                // Callback merge strategy merges callbacks to the beginning of the array,
                // so that the last defined callback will be invoked first.
                // This is done since to mimic how Object.assign merging
                // uses the last given value to assign.
                case 'on':
                case 'nativeOn':
                    if (!arguments[i][prop]) {
                        break;
                    }
                    if (!mergeTarget[prop]) {
                        mergeTarget[prop] = {};
                    }
                    const listeners = mergeTarget[prop];
                    for (event of Object.keys(arguments[i][prop] || {})) {
                        // Concat function to array of functions if callback present.
                        if (listeners[event]) {
                            // Insert current iteration data in beginning of merged array.
                            listeners[event] = Array().concat(// eslint-disable-line
                            listeners[event], arguments[i][prop][event]);
                        }
                        else {
                            // Straight assign.
                            listeners[event] = arguments[i][prop][event];
                        }
                    }
                    break;
                // Object merge strategy
                case 'attrs':
                case 'props':
                case 'domProps':
                case 'scopedSlots':
                case 'staticStyle':
                case 'hook':
                case 'transition':
                    if (!arguments[i][prop]) {
                        break;
                    }
                    if (!mergeTarget[prop]) {
                        mergeTarget[prop] = {};
                    }
                    mergeTarget[prop] = { ...arguments[i][prop], ...mergeTarget[prop] };
                    break;
                // Reassignment strategy (no merge)
                case 'slot':
                case 'key':
                case 'ref':
                case 'tag':
                case 'show':
                case 'keepAlive':
                default:
                    if (!mergeTarget[prop]) {
                        mergeTarget[prop] = arguments[i][prop];
                    }
            }
        }
    }
    return mergeTarget;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvbWVyZ2VEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFFcEMsTUFBTSxPQUFPLEdBQUc7SUFDZCxTQUFTLEVBQUUsZUFBZTtJQUMxQixTQUFTLEVBQUUsT0FBTztDQUNWLENBQUE7QUFFVixTQUFTLFVBQVUsQ0FBRSxLQUFhO0lBQ2hDLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUE7SUFFcEMsS0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUM5QyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQzNDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDaEIsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNSLFNBQVE7U0FDVDtRQUNELDJEQUEyRDtRQUMzRCxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUMzQixHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO1NBQ2pCO1FBQ0QsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtLQUM5QjtJQUVELE9BQU8sUUFBUSxDQUFBO0FBQ2pCLENBQUM7QUFRRCxNQUFNLENBQUMsT0FBTyxVQUFVLFNBQVM7SUFDL0IsTUFBTSxXQUFXLEdBQWdDLEVBQUUsQ0FBQTtJQUNuRCxJQUFJLENBQUMsR0FBVyxTQUFTLENBQUMsTUFBTSxDQUFBO0lBQ2hDLElBQUksSUFBWSxDQUFBO0lBQ2hCLElBQUksS0FBYSxDQUFBO0lBRWpCLHNDQUFzQztJQUN0QyxPQUFPLENBQUMsRUFBRSxFQUFFO1FBQ1Ys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UCxtQ0FBbUM7Z0JBQ25DLEtBQUssTUFBTSxDQUFDO2dCQUNaLEtBQUssS0FBSyxDQUFDO2dCQUNYLEtBQUssS0FBSyxDQUFDO2dCQUNYLEtBQUssS0FBSyxDQUFDO2dCQUNYLEtBQUssTUFBTSxDQUFDO2dCQUNaLEtBQUssV0FBVyxDQUFDO2dCQUNqQjtvQkFDRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN0QixXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO3FCQUN2QzthQUNKO1NBQ0Y7S0FDRjtJQUVELE9BQU8sV0FBVyxDQUFBO0FBQ3BCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBjb3B5cmlnaHQgMjAxNyBBbGV4IFJlZ2FuXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FsZXhzYXNoYXJlZ2FuL3Z1ZS1mdW5jdGlvbmFsLWRhdGEtbWVyZ2VcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbWF4LXN0YXRlbWVudHMgKi9cbmltcG9ydCB7IFZOb2RlRGF0YSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IGNhbWVsaXplIH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5jb25zdCBwYXR0ZXJuID0ge1xuICBzdHlsZUxpc3Q6IC87KD8hW14oXSpcXCkpL2csXG4gIHN0eWxlUHJvcDogLzooLiopLyxcbn0gYXMgY29uc3RcblxuZnVuY3Rpb24gcGFyc2VTdHlsZSAoc3R5bGU6IHN0cmluZykge1xuICBjb25zdCBzdHlsZU1hcDogRGljdGlvbmFyeTxhbnk+ID0ge31cblxuICBmb3IgKGNvbnN0IHMgb2Ygc3R5bGUuc3BsaXQocGF0dGVybi5zdHlsZUxpc3QpKSB7XG4gICAgbGV0IFtrZXksIHZhbF0gPSBzLnNwbGl0KHBhdHRlcm4uc3R5bGVQcm9wKVxuICAgIGtleSA9IGtleS50cmltKClcbiAgICBpZiAoIWtleSkge1xuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gTWF5IGJlIHVuZGVmaW5lZCBpZiB0aGUgYGtleTogdmFsdWVgIHBhaXIgaXMgaW5jb21wbGV0ZS5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbCA9IHZhbC50cmltKClcbiAgICB9XG4gICAgc3R5bGVNYXBbY2FtZWxpemUoa2V5KV0gPSB2YWxcbiAgfVxuXG4gIHJldHVybiBzdHlsZU1hcFxufVxuXG4vKipcbiAqIEludGVsbGlnZW50bHkgbWVyZ2VzIGRhdGEgZm9yIGNyZWF0ZUVsZW1lbnQuXG4gKiBNZXJnZXMgYXJndW1lbnRzIGxlZnQgdG8gcmlnaHQsIHByZWZlcnJpbmcgdGhlIHJpZ2h0IGFyZ3VtZW50LlxuICogUmV0dXJucyBuZXcgVk5vZGVEYXRhIG9iamVjdC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWVyZ2VEYXRhICguLi52Tm9kZURhdGE6IFZOb2RlRGF0YVtdKTogVk5vZGVEYXRhXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZXJnZURhdGEgKCk6IFZOb2RlRGF0YSB7XG4gIGNvbnN0IG1lcmdlVGFyZ2V0OiBWTm9kZURhdGEgJiBEaWN0aW9uYXJ5PGFueT4gPSB7fVxuICBsZXQgaTogbnVtYmVyID0gYXJndW1lbnRzLmxlbmd0aFxuICBsZXQgcHJvcDogc3RyaW5nXG4gIGxldCBldmVudDogc3RyaW5nXG5cbiAgLy8gQWxsb3cgZm9yIHZhcmlhZGljIGFyZ3VtZW50IGxlbmd0aC5cbiAgd2hpbGUgKGktLSkge1xuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgZGF0YSBwcm9wZXJ0aWVzIGFuZCBleGVjdXRlIG1lcmdlIHN0cmF0ZWdpZXNcbiAgICAvLyBPYmplY3Qua2V5cyBlbGltaW5hdGVzIG5lZWQgZm9yIGhhc093blByb3BlcnR5IGNhbGxcbiAgICBmb3IgKHByb3Agb2YgT2JqZWN0LmtleXMoYXJndW1lbnRzW2ldKSkge1xuICAgICAgc3dpdGNoIChwcm9wKSB7XG4gICAgICAgIC8vIEFycmF5IG1lcmdlIHN0cmF0ZWd5IChhcnJheSBjb25jYXRlbmF0aW9uKVxuICAgICAgICBjYXNlICdjbGFzcyc6XG4gICAgICAgIGNhc2UgJ3N0eWxlJzpcbiAgICAgICAgY2FzZSAnZGlyZWN0aXZlcyc6XG4gICAgICAgICAgaWYgKCFhcmd1bWVudHNbaV1bcHJvcF0pIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShtZXJnZVRhcmdldFtwcm9wXSkpIHtcbiAgICAgICAgICAgIG1lcmdlVGFyZ2V0W3Byb3BdID0gW11cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocHJvcCA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgICAgbGV0IHN0eWxlOiBhbnlbXVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJndW1lbnRzW2ldLnN0eWxlKSkge1xuICAgICAgICAgICAgICBzdHlsZSA9IGFyZ3VtZW50c1tpXS5zdHlsZVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3R5bGUgPSBbYXJndW1lbnRzW2ldLnN0eWxlXVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzdHlsZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICBjb25zdCBzID0gc3R5bGVbal1cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHN0eWxlW2pdID0gcGFyc2VTdHlsZShzKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcmd1bWVudHNbaV0uc3R5bGUgPSBzdHlsZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlcGFja2FnaW5nIGluIGFuIGFycmF5IGFsbG93cyBWdWUgcnVudGltZVxuICAgICAgICAgIC8vIHRvIG1lcmdlIGNsYXNzL3N0eWxlIGJpbmRpbmdzIHJlZ2FyZGxlc3Mgb2YgdHlwZS5cbiAgICAgICAgICBtZXJnZVRhcmdldFtwcm9wXSA9IG1lcmdlVGFyZ2V0W3Byb3BdLmNvbmNhdChhcmd1bWVudHNbaV1bcHJvcF0pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLy8gU3BhY2UgZGVsaW1pdGVkIHN0cmluZyBjb25jYXRlbmF0aW9uIHN0cmF0ZWd5XG4gICAgICAgIGNhc2UgJ3N0YXRpY0NsYXNzJzpcbiAgICAgICAgICBpZiAoIWFyZ3VtZW50c1tpXVtwcm9wXSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1lcmdlVGFyZ2V0W3Byb3BdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1lcmdlVGFyZ2V0W3Byb3BdID0gJydcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1lcmdlVGFyZ2V0W3Byb3BdKSB7XG4gICAgICAgICAgICAvLyBOb3QgYW4gZW1wdHkgc3RyaW5nLCBzbyBjb25jYXRlbmF0ZVxuICAgICAgICAgICAgbWVyZ2VUYXJnZXRbcHJvcF0gKz0gJyAnXG4gICAgICAgICAgfVxuICAgICAgICAgIG1lcmdlVGFyZ2V0W3Byb3BdICs9IGFyZ3VtZW50c1tpXVtwcm9wXS50cmltKClcbiAgICAgICAgICBicmVha1xuICAgICAgICAvLyBPYmplY3QsIHRoZSBwcm9wZXJ0aWVzIG9mIHdoaWNoIHRvIG1lcmdlIHZpYSBhcnJheSBtZXJnZSBzdHJhdGVneSAoYXJyYXkgY29uY2F0ZW5hdGlvbikuXG4gICAgICAgIC8vIENhbGxiYWNrIG1lcmdlIHN0cmF0ZWd5IG1lcmdlcyBjYWxsYmFja3MgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXksXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGxhc3QgZGVmaW5lZCBjYWxsYmFjayB3aWxsIGJlIGludm9rZWQgZmlyc3QuXG4gICAgICAgIC8vIFRoaXMgaXMgZG9uZSBzaW5jZSB0byBtaW1pYyBob3cgT2JqZWN0LmFzc2lnbiBtZXJnaW5nXG4gICAgICAgIC8vIHVzZXMgdGhlIGxhc3QgZ2l2ZW4gdmFsdWUgdG8gYXNzaWduLlxuICAgICAgICBjYXNlICdvbic6XG4gICAgICAgIGNhc2UgJ25hdGl2ZU9uJzpcbiAgICAgICAgICBpZiAoIWFyZ3VtZW50c1tpXVtwcm9wXSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFtZXJnZVRhcmdldFtwcm9wXSkge1xuICAgICAgICAgICAgbWVyZ2VUYXJnZXRbcHJvcF0gPSB7fVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSBtZXJnZVRhcmdldFtwcm9wXSFcbiAgICAgICAgICBmb3IgKGV2ZW50IG9mIE9iamVjdC5rZXlzKGFyZ3VtZW50c1tpXVtwcm9wXSB8fCB7fSkpIHtcbiAgICAgICAgICAgIC8vIENvbmNhdCBmdW5jdGlvbiB0byBhcnJheSBvZiBmdW5jdGlvbnMgaWYgY2FsbGJhY2sgcHJlc2VudC5cbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgICAgICAgICAgIC8vIEluc2VydCBjdXJyZW50IGl0ZXJhdGlvbiBkYXRhIGluIGJlZ2lubmluZyBvZiBtZXJnZWQgYXJyYXkuXG4gICAgICAgICAgICAgIGxpc3RlbmVyc1tldmVudF0gPSBBcnJheTxGdW5jdGlvbj4oKS5jb25jYXQoIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbZXZlbnRdLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50c1tpXVtwcm9wXVtldmVudF1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gU3RyYWlnaHQgYXNzaWduLlxuICAgICAgICAgICAgICBsaXN0ZW5lcnNbZXZlbnRdID0gYXJndW1lbnRzW2ldW3Byb3BdW2V2ZW50XVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICAvLyBPYmplY3QgbWVyZ2Ugc3RyYXRlZ3lcbiAgICAgICAgY2FzZSAnYXR0cnMnOlxuICAgICAgICBjYXNlICdwcm9wcyc6XG4gICAgICAgIGNhc2UgJ2RvbVByb3BzJzpcbiAgICAgICAgY2FzZSAnc2NvcGVkU2xvdHMnOlxuICAgICAgICBjYXNlICdzdGF0aWNTdHlsZSc6XG4gICAgICAgIGNhc2UgJ2hvb2snOlxuICAgICAgICBjYXNlICd0cmFuc2l0aW9uJzpcbiAgICAgICAgICBpZiAoIWFyZ3VtZW50c1tpXVtwcm9wXSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFtZXJnZVRhcmdldFtwcm9wXSkge1xuICAgICAgICAgICAgbWVyZ2VUYXJnZXRbcHJvcF0gPSB7fVxuICAgICAgICAgIH1cbiAgICAgICAgICBtZXJnZVRhcmdldFtwcm9wXSA9IHsgLi4uYXJndW1lbnRzW2ldW3Byb3BdLCAuLi5tZXJnZVRhcmdldFtwcm9wXSB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLy8gUmVhc3NpZ25tZW50IHN0cmF0ZWd5IChubyBtZXJnZSlcbiAgICAgICAgY2FzZSAnc2xvdCc6XG4gICAgICAgIGNhc2UgJ2tleSc6XG4gICAgICAgIGNhc2UgJ3JlZic6XG4gICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgIGNhc2UgJ3Nob3cnOlxuICAgICAgICBjYXNlICdrZWVwQWxpdmUnOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghbWVyZ2VUYXJnZXRbcHJvcF0pIHtcbiAgICAgICAgICAgIG1lcmdlVGFyZ2V0W3Byb3BdID0gYXJndW1lbnRzW2ldW3Byb3BdXG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZXJnZVRhcmdldFxufVxuIl19