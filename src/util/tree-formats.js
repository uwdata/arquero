import isArray from "./is-array";

export function makeEntries(obj) {
    const output = [];
    for (const key in obj) {
        if (isArray(obj[key])) {
            output.push([key, obj[key]]);
        } else {
        output.push([key, makeEntries(obj[key])]);
        }
    }
    return output;
}

export function makeMaps(obj) {
    let output = [];
    for (const key in obj) {
        if (isArray(obj[key])) {
            output.push([key, obj[key]]);
        } else {
            output.push(new Map([[key, makeMaps(obj[key])]]));
        }
    }
    if (isArray(output[0])) {
        output = new Map(output);
    }
    return output;
  }