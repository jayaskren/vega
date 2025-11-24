let wasm;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
 * Lookup/join transform WASM export
 * @param {Uint8Array} primary_bytes
 * @param {Uint8Array} secondary_bytes
 * @param {number} key_field
 * @param {number} from_key
 * @param {Uint32Array} from_fields
 * @param {string[]} output_names
 * @returns {Uint8Array}
 */
export function lookupTransform(primary_bytes, secondary_bytes, key_field, from_key, from_fields, output_names) {
    const ptr0 = passArray8ToWasm0(primary_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(secondary_bytes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray32ToWasm0(from_fields, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArrayJsValueToWasm0(output_names, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.lookupTransform(ptr0, len0, ptr1, len1, key_field, from_key, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

let cachedFloat64ArrayMemory0 = null;

function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}
/**
 * Calculate quantitative domain WASM export
 * @param {Uint8Array} file_bytes
 * @param {number} field
 * @param {boolean} include_zero
 * @param {boolean} nice
 * @returns {Float64Array}
 */
export function calculateQuantitativeDomain(file_bytes, field, include_zero, nice) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.calculateQuantitativeDomain(ptr0, len0, field, include_zero, nice);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}
/**
 * Calculate ordinal domain WASM export
 * @param {Uint8Array} file_bytes
 * @param {number} field
 * @param {string | null} [sort]
 * @param {number | null} [limit]
 * @returns {string[]}
 */
export function calculateOrdinalDomain(file_bytes, field, sort, limit) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(sort) ? 0 : passStringToWasm0(sort, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.calculateOrdinalDomain(ptr0, len0, field, ptr1, len1, isLikeNone(limit) ? 0x100000001 : (limit) >>> 0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
}

/**
 * Pivot transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {any} config
 * @returns {Uint8Array}
 */
export function pivotTransform(file_bytes, config) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.pivotTransform(ptr0, len0, config);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Flatten transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {Uint32Array} flatten_fields
 * @param {string[]} output_names
 * @returns {Uint8Array}
 */
export function flattenTransform(file_bytes, flatten_fields, output_names) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(flatten_fields, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(output_names, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.flattenTransform(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Bin transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {any} config
 * @param {string} output_start
 * @param {string} output_end
 * @returns {Uint8Array}
 */
export function binTransform(file_bytes, config, output_start, output_end) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(output_start, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(output_end, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.binTransform(ptr0, len0, config, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Filter transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {any} predicate
 * @returns {Uint8Array}
 */
export function filterTransform(file_bytes, predicate) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.filterTransform(ptr0, len0, predicate);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Sample transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {number} n
 * @param {bigint | null} [seed]
 * @returns {Uint8Array}
 */
export function sampleTransform(file_bytes, n, seed) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.sampleTransform(ptr0, len0, n, !isLikeNone(seed), isLikeNone(seed) ? BigInt(0) : seed);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Regression transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {any} config
 * @returns {Uint8Array}
 */
export function regressionTransform(file_bytes, config) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.regressionTransform(ptr0, len0, config);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Window transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {any} windows
 * @param {string[]} output_names
 * @returns {Uint8Array}
 */
export function windowTransform(file_bytes, windows, output_names) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(output_names, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.windowTransform(ptr0, len0, windows, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
 * Quantile transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {number} field
 * @param {Float64Array} probs
 * @returns {Uint8Array}
 */
export function quantileTransform(file_bytes, field, probs) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayF64ToWasm0(probs, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.quantileTransform(ptr0, len0, field, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Fold transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {Uint32Array} fold_fields
 * @param {string} key_name
 * @param {string} value_name
 * @returns {Uint8Array}
 */
export function foldTransform(file_bytes, fold_fields, key_name, value_name) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray32ToWasm0(fold_fields, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(key_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(value_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.foldTransform(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Density estimation WASM export
 * @param {Uint8Array} file_bytes
 * @param {number} field
 * @param {number | null | undefined} bandwidth
 * @param {boolean} cumulative
 * @param {boolean} counts
 * @param {number | null} [steps]
 * @returns {Uint8Array}
 */
export function densityTransform(file_bytes, field, bandwidth, cumulative, counts, steps) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.densityTransform(ptr0, len0, field, !isLikeNone(bandwidth), isLikeNone(bandwidth) ? 0 : bandwidth, cumulative, counts, isLikeNone(steps) ? 0x100000001 : (steps) >>> 0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Stack transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {any} config
 * @param {string} y0_name
 * @param {string} y1_name
 * @returns {Uint8Array}
 */
export function stackTransform(file_bytes, config, y0_name, y1_name) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(y0_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(y1_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.stackTransform(ptr0, len0, config, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * LOESS smoothing WASM export
 * @param {Uint8Array} file_bytes
 * @param {number} x_field
 * @param {number} y_field
 * @param {number | null} [bandwidth]
 * @returns {Uint8Array}
 */
export function loessTransform(file_bytes, x_field, y_field, bandwidth) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.loessTransform(ptr0, len0, x_field, y_field, !isLikeNone(bandwidth), isLikeNone(bandwidth) ? 0 : bandwidth);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

let cachedBigInt64ArrayMemory0 = null;

function getBigInt64ArrayMemory0() {
    if (cachedBigInt64ArrayMemory0 === null || cachedBigInt64ArrayMemory0.byteLength === 0) {
        cachedBigInt64ArrayMemory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64ArrayMemory0;
}

function getArrayI64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getBigInt64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}
/**
 * Calculate temporal domain WASM export
 * @param {Uint8Array} file_bytes
 * @param {number} field
 * @param {string | null} [nice]
 * @returns {BigInt64Array}
 */
export function calculateTemporalDomain(file_bytes, field, nice) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(nice) ? 0 : passStringToWasm0(nice, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.calculateTemporalDomain(ptr0, len0, field, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayI64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}

/**
 * Calculate (formula) transform WASM export
 * @param {Uint8Array} file_bytes
 * @param {string} expression
 * @param {string} output_name
 * @returns {Uint8Array}
 */
export function calculateTransform(file_bytes, expression, output_name) {
    const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expression, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(output_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.calculateTransform(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Initialize memory management utilities
 */
export function init_memory_management() {
    wasm.init_memory_management();
}

/**
 * Deserialize an integer chunk from binary data
 *
 * Used by LazyDataset to deserialize chunks loaded from IndexedDB
 * @param {Uint8Array} data
 * @returns {WasmIntegerChunk}
 */
export function deserializeIntegerChunk(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.deserializeIntegerChunk(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmIntegerChunk.__wrap(ret[0]);
}

/**
 * Deserialize a string chunk from binary data
 *
 * Used by LazyDataset to deserialize chunks loaded from IndexedDB
 * @param {Uint8Array} data
 * @returns {WasmStringChunk}
 */
export function deserializeStringChunk(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.deserializeStringChunk(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmStringChunk.__wrap(ret[0]);
}

/**
 * Deserialize a float chunk from binary data
 *
 * Used by LazyDataset to deserialize chunks loaded from IndexedDB
 * @param {Uint8Array} data
 * @returns {WasmFloatChunk}
 */
export function deserializeFloatChunk(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.deserializeFloatChunk(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmFloatChunk.__wrap(ret[0]);
}

/**
 * Deserialize a datetime chunk from binary data
 *
 * Supports two formats:
 * 1. AdaptiveDateTimeChunkHeader format (legacy DateTime columns)
 * 2. IntegerChunkHeader format (DateTimeAsInteger columns - stored as Frame-of-Reference integers)
 *
 * Used by LazyDataset to deserialize chunks loaded from IndexedDB
 * @param {Uint8Array} data
 * @returns {WasmIntegerChunk}
 */
export function deserializeDateTimeChunk(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.deserializeDateTimeChunk(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmIntegerChunk.__wrap(ret[0]);
}

/**
 * Get raw (unaggregated) columns from a .ntro file for chart rendering
 *
 * This function efficiently extracts multiple columns of raw data in a single call,
 * optimized for chart rendering (Gantt charts, scatter plots, etc.)
 *
 * # Arguments
 * * `file_bytes` - The complete .ntro file bytes
 * * `column_indices` - Array of column indices to extract
 * * `start_row` - Starting row index
 * * `row_count` - Maximum number of rows to extract
 *
 * # Returns
 * JSON string with the following structure:
 * ```json
 * {
 *   "columns": [
 *     {
 *       "index": 0,
 *       "name": "column_name",
 *       "type": "integer|float|string|datetime",
 *       "values": [...]
 *     }
 *   ],
 *   "rowCount": 1000,
 *   "truncated": false
 * }
 * ```
 *
 * # Example (JavaScript)
 * ```javascript
 * const result = JSON.parse(getRawColumns(fileBytes, [0, 1, 3], 0, 10000));
 * console.log(`Got ${result.rowCount} rows`);
 * ```
 * @param {Uint8Array} file_bytes
 * @param {Uint32Array} column_indices
 * @param {number} start_row
 * @param {number} row_count
 * @returns {string}
 */
export function getRawColumns(file_bytes, column_indices, start_row, row_count) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passArray8ToWasm0(file_bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(column_indices, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.getRawColumns(ptr0, len0, ptr1, len1, start_row, row_count);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * Parse file metadata without loading full table data
 *
 * Returns JSON string with schema information:
 * ```json
 * {
 *   "rowCount": 1000000,
 *   "columnCount": 18,
 *   "columns": [
 *     {"name": "Amount", "type": "Float", "chunkCount": 16},
 *     {"name": "Date", "type": "DateTime", "chunkCount": 16}
 *   ],
 *   "estimatedMemoryMB": 155.2
 * }
 * ```
 *
 * # Example (JavaScript)
 * ```javascript
 * const fileBytes = await indexedDB.get('datasets', 'utah.ntro');
 * const metadata = parseMetadata(fileBytes);
 * console.log(`Dataset has ${metadata.rowCount} rows`);
 * ```
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function parseMetadata(bytes) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.parseMetadata(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Extract a single chunk from the file for lazy loading
 *
 * Returns compressed Tier-2 chunk data that can be stored in IndexedDB.
 * The chunk can be decompressed later using decompressLZ4() or decompressZSTD().
 *
 * # Arguments
 * * `bytes` - Full .ntro file contents
 * * `column_index` - Column index (0-based)
 * * `chunk_index` - Chunk index within column (0-based)
 *
 * # Returns
 * Uint8Array containing compressed chunk data with metadata header:
 * ```
 * [4 bytes: compression type] [4 bytes: original size] [N bytes: compressed data]
 * ```
 *
 * # Example (JavaScript)
 * ```javascript
 * // Extract chunk for column 3, chunk 5
 * const chunkData = extractChunk(fileBytes, 3, 5);
 * await indexedDB.put('chunks', {col: 3, chunk: 5, data: chunkData});
 * ```
 * @param {Uint8Array} bytes
 * @param {number} column_index
 * @param {number} chunk_index
 * @returns {Uint8Array}
 */
export function extractChunk(bytes, column_index, chunk_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.extractChunk(ptr0, len0, column_index, chunk_index);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Parse file metadata with detailed column statistics
 *
 * Similar to parseMetadata() but includes min/max/mean/cardinality statistics
 * by scanning chunk headers (lightweight, doesn't load full data).
 *
 * Returns JSON string with enhanced schema information:
 * ```json
 * {
 *   "rowCount": 1000000,
 *   "columnCount": 18,
 *   "columns": [
 *     {
 *       "name": "Amount",
 *       "type": "Float",
 *       "chunkCount": 16,
 *       "minValue": 0.5,
 *       "maxValue": 999999.99,
 *       "meanValue": 125000.42
 *     },
 *     {
 *       "name": "Date",
 *       "type": "DateTime",
 *       "chunkCount": 16,
 *       "minValue": "2020-01-01T00:00:00Z",
 *       "maxValue": "2023-12-31T23:59:59Z"
 *     },
 *     {
 *       "name": "Category",
 *       "type": "String",
 *       "chunkCount": 16,
 *       "cardinality": 42
 *     }
 *   ],
 *   "estimatedMemoryMB": 155.2
 * }
 * ```
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function parseMetadataWithStats(bytes) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.parseMetadataWithStats(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Single-call aggregation that returns TYPED ARRAYS to minimize JS allocations
 * @param {Uint8Array} bytes
 * @param {number} x_column
 * @param {number | null} [y_column]
 * @param {number | null} [color_column]
 * @param {string | null} [aggregation]
 * @param {string | null} [x_time_granularity]
 * @param {string | null} [color_time_granularity]
 * @returns {any}
 */
export function aggregateForChartTyped(bytes, x_column, y_column, color_column, aggregation, x_time_granularity, color_time_granularity) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(aggregation) ? 0 : passStringToWasm0(aggregation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(x_time_granularity) ? 0 : passStringToWasm0(x_time_granularity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(color_time_granularity) ? 0 : passStringToWasm0(color_time_granularity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    const ret = wasm.aggregateForChartTyped(ptr0, len0, x_column, isLikeNone(y_column) ? 0x100000001 : (y_column) >>> 0, isLikeNone(color_column) ? 0x100000001 : (color_column) >>> 0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Parse chunk metadata from raw chunk bytes
 *
 * Returns a JavaScript object with chunk metadata including:
 * - bitWidth: Bits per value (for integers)
 * - compressionType: Compression type name
 * - elementCount: Number of elements in chunk
 * - minValue: Minimum value (for numeric types)
 * - maxValue: Maximum value (for numeric types)
 * - cardinality: Number of unique values (for strings)
 * - uncompressedBytes: Estimated uncompressed size
 *
 * # Example (JavaScript)
 * ```javascript
 * const chunkData = extractChunk(fileBytes, columnIdx, chunkIdx);
 * const metadata = parseChunkMetadata(chunkData, "Integer");
 * console.log(`Chunk has ${metadata.elementCount} elements, ${metadata.bitWidth} bits/value`);
 * ```
 * @param {Uint8Array} chunk_bytes
 * @param {string} column_type
 * @returns {any}
 */
export function parseChunkMetadata(chunk_bytes, column_type) {
    const ptr0 = passArray8ToWasm0(chunk_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(column_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.parseChunkMetadata(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Single-call aggregation that returns D3-ready chart data
 *
 * This is the MEMORY-OPTIMIZED replacement for:
 *   aggregateLazy() → getXValues() → getCounts() → Map → Array → React state
 *
 * **Phase A Memory Fix**: Eliminates 4-5 intermediate object allocations by:
 * 1. Loading only needed columns from file (existing optimization)
 * 2. Aggregating in WASM (existing logic)
 * 3. **NEW**: Converting to D3-ready format IN WASM
 * 4. Returning single JsValue (one allocation instead of 5)
 *
 * Expected memory savings: 30-40 MB per chart update
 *
 * # Arguments
 * * `bytes` - Full .ntro file data
 * * `x_column` - X-axis column index
 * * `y_column` - Y-axis column index (None for count aggregation)
 * * `color_column` - Color/group column index (optional)
 *
 * # Returns
 * JsValue containing ChartData (ready for D3, no transformations needed)
 *
 * # Example (JavaScript)
 * ```javascript
 * // OLD (memory leak):
 * const result = aggregateLazy(bytes, 0, 1, 2);
 * const xValues = result.getXValues();  // Allocation 1
 * const yValues = result.getYValues();  // Allocation 2
 * const groups = result.getGroups();    // Allocation 3
 * const points = transformToPoints(xValues, yValues, groups);  // Allocation 4
 * setChartData(points);  // Allocation 5 (React state)
 *
 * // NEW (Phase A):
 * const chartData = await aggregateForChart(bytes, 0, 1, 2);
 * // chartData is already D3-ready, use directly with useRef (no state!)
 * chartDataRef.current = chartData;
 * renderD3Chart(container, chartData);
 * ```
 * @param {Uint8Array} bytes
 * @param {number} x_column
 * @param {number | null} [y_column]
 * @param {number | null} [color_column]
 * @returns {any}
 */
export function aggregateForChart(bytes, x_column, y_column, color_column) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.aggregateForChart(ptr0, len0, x_column, isLikeNone(y_column) ? 0x100000001 : (y_column) >>> 0, isLikeNone(color_column) ? 0x100000001 : (color_column) >>> 0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Decompress ZSTD-compressed Tier-2 data
 *
 * # Arguments
 * * `compressed_data` - ZSTD-compressed chunk data
 *
 * # Returns
 * Uint8Array containing decompressed Tier-1 data
 *
 * # Example (JavaScript)
 * ```javascript
 * const compressed = await indexedDB.get('chunks', {col: 3, chunk: 5});
 * const decompressed = decompressZSTD(compressed.data);
 * // Now deserialize Tier-1 format...
 * ```
 * @param {Uint8Array} compressed_data
 * @returns {Uint8Array}
 */
export function decompressZSTD(compressed_data) {
    const ptr0 = passArray8ToWasm0(compressed_data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.decompressZSTD(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Aggregate a specific row range (for manual Web Worker parallelization)
 *
 * This function is designed to be called from Web Workers, where each worker
 * processes a subset of rows and returns partial aggregated results.
 * The main thread then merges all partial results.
 *
 * # Arguments
 * * `bytes` - Raw .ntro file bytes
 * * `start_row` - First row to process (inclusive)
 * * `end_row` - Last row to process (exclusive)
 * * `x_column` - X-axis column index
 * * `y_column` - Y-axis column index (None for record count)
 * * `color_column` - Optional color/grouping column index
 * * `aggregation` - Aggregation type ("sum", "count", "average", "min", "max", "unique")
 * * `x_time_granularity` - Optional time granularity for X axis
 * * `color_time_granularity` - Optional time granularity for color column
 *
 * # Returns
 * Partial aggregated results in ChartDataTyped format ready for merging
 *
 * # Example (Worker)
 * ```javascript
 * const result = await wasm.aggregateChunk(
 *   fileBytes, 0, 1000000, // rows 0-1M
 *   0, 1, null, // x=0, y=1, no color
 *   'sum', null, null
 * );
 * ```
 * @param {Uint8Array} bytes
 * @param {number} start_row
 * @param {number} end_row
 * @param {number} x_column
 * @param {number | null} [y_column]
 * @param {number | null} [color_column]
 * @param {string | null} [aggregation]
 * @param {string | null} [x_time_granularity]
 * @param {string | null} [color_time_granularity]
 * @returns {any}
 */
export function aggregateChunk(bytes, start_row, end_row, x_column, y_column, color_column, aggregation, x_time_granularity, color_time_granularity) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(aggregation) ? 0 : passStringToWasm0(aggregation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(x_time_granularity) ? 0 : passStringToWasm0(x_time_granularity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(color_time_granularity) ? 0 : passStringToWasm0(color_time_granularity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    const ret = wasm.aggregateChunk(ptr0, len0, start_row, end_row, x_column, isLikeNone(y_column) ? 0x100000001 : (y_column) >>> 0, isLikeNone(color_column) ? 0x100000001 : (color_column) >>> 0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} bytes
 * @param {number} x_column
 * @param {number | null | undefined} y_column
 * @param {number | null | undefined} color_column
 * @param {string | null | undefined} aggregation
 * @param {string | null | undefined} x_time_granularity
 * @param {string | null | undefined} color_time_granularity
 * @param {number} _num_threads
 * @returns {any}
 */
export function aggregateForChartParallel(bytes, x_column, y_column, color_column, aggregation, x_time_granularity, color_time_granularity, _num_threads) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(aggregation) ? 0 : passStringToWasm0(aggregation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(x_time_granularity) ? 0 : passStringToWasm0(x_time_granularity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(color_time_granularity) ? 0 : passStringToWasm0(color_time_granularity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    const ret = wasm.aggregateForChartParallel(ptr0, len0, x_column, isLikeNone(y_column) ? 0x100000001 : (y_column) >>> 0, isLikeNone(color_column) ? 0x100000001 : (color_column) >>> 0, ptr1, len1, ptr2, len2, ptr3, len3, _num_threads);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Decompress LZ4-compressed Tier-2 data
 *
 * # Arguments
 * * `compressed_data` - LZ4-compressed chunk data
 *
 * # Returns
 * Uint8Array containing decompressed Tier-1 data
 *
 * # Example (JavaScript)
 * ```javascript
 * const compressed = await indexedDB.get('chunks', {col: 3, chunk: 5});
 * const decompressed = decompressLZ4(compressed.data);
 * // Now deserialize Tier-1 format...
 * ```
 * @param {Uint8Array} compressed_data
 * @returns {Uint8Array}
 */
export function decompressLZ4(compressed_data) {
    const ptr0 = passArray8ToWasm0(compressed_data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.decompressLZ4(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Get actual WebAssembly linear memory size (MB)
 * @returns {number}
 */
export function getWasmLinearMemoryMB() {
    const ret = wasm.getWasmLinearMemoryMB();
    return ret;
}

/**
 * Aggregate chart data WITHOUT loading the full table into memory
 *
 * This is the memory-efficient alternative to loadFromBytes() → aggregateForChart().
 * Instead of decompressing ALL columns to Tier-1 (~700MB), this function:
 * 1. Parses metadata only (~1KB)
 * 2. Loads ONLY the chunks needed for aggregation (2-3 columns)
 * 3. Aggregates data in-place
 * 4. Drops all temporary data immediately
 * 5. Returns small aggregated result (~1-10KB)
 *
 * Expected memory usage: ~10-50MB peak (vs 700MB for full load)
 *
 * # Arguments
 * * `bytes` - Full .ntro file data
 * * `x_column` - X-axis column index
 * * `y_column` - Y-axis column index (optional, for count aggregation)
 * * `color_column` - Color/group column index (optional)
 *
 * # Returns
 * WasmAggregatedResult containing small aggregated arrays ready for charting
 *
 * # Example (JavaScript)
 * ```javascript
 * // Instead of:
 * // const table = loadFromBytes(fileBytes);  // Loads 700MB!
 * // const result = table.aggregateForChart(0, 1, null);
 *
 * // Do this:
 * const result = aggregateLazy(fileBytes, 0, 1, null);  // Loads ~20MB peak!
 * const xValues = result.getXValues();
 * const yValues = result.getYValues();
 * ```
 * @param {Uint8Array} bytes
 * @param {number} x_column
 * @param {number | null} [y_column]
 * @param {number | null} [color_column]
 * @returns {WasmAggregatedResult}
 */
export function aggregateLazy(bytes, x_column, y_column, color_column) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.aggregateLazy(ptr0, len0, x_column, isLikeNone(y_column) ? 0x100000001 : (y_column) >>> 0, isLikeNone(color_column) ? 0x100000001 : (color_column) >>> 0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return WasmAggregatedResult.__wrap(ret[0]);
}

/**
 * Get current WASM memory pool statistics
 * @returns {WasmMemoryStats}
 */
export function getMemoryStats() {
    const ret = wasm.getMemoryStats();
    return WasmMemoryStats.__wrap(ret);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}
/**
 * Main WASM-exported heatmap aggregation function
 *
 * Aggregates columnar data into a 2D heatmap grid for visualization.
 *
 * # Arguments
 * * `table` - Reference to the Neutrino table
 * * `x_column_name` - Name of the column to use for X axis
 * * `y_column_name` - Name of the column to use for Y axis
 * * `value_column_name` - Name of the column to aggregate (or empty for count)
 * * `x_bins` - Number of bins in X direction
 * * `y_bins` - Number of bins in Y direction
 * * `aggregation_type` - Type of aggregation: "count", "sum", "average", "min", "max"
 *
 * # Returns
 * * `HeatmapData` - Structure containing the heatmap grid and metadata
 *
 * # Errors
 * * Column not found
 * * Invalid column type (must be numeric for X, Y, and value columns)
 * * Invalid aggregation type
 * @param {WasmTable} wasm_table
 * @param {string} x_column_name
 * @param {string} y_column_name
 * @param {string} value_column_name
 * @param {number} x_bins
 * @param {number} y_bins
 * @param {string} aggregation_type
 * @returns {HeatmapData}
 */
export function aggregateForHeatmap(wasm_table, x_column_name, y_column_name, value_column_name, x_bins, y_bins, aggregation_type) {
    _assertClass(wasm_table, WasmTable);
    const ptr0 = passStringToWasm0(x_column_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(y_column_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(value_column_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(aggregation_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.aggregateForHeatmap(wasm_table.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, x_bins, y_bins, ptr3, len3);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return HeatmapData.__wrap(ret[0]);
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_brotli_2(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_brotli_2(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Initialize panic hook for better error messages in WASM
 */
export function init_tier2_test() {
    wasm.init_tier2_test();
}

/**
 * Get memory usage estimate (WASM linear memory)
 * @returns {number}
 */
export function get_wasm_memory_pages() {
    const ret = wasm.get_wasm_memory_pages();
    return ret >>> 0;
}

/**
 * Compress data with LZ4 (pure Rust implementation)
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_lz4(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_lz4(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_brotli_6(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_brotli_6(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_brotli_4(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_brotli_4(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_brotli_9(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_brotli_9(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Verify decompressed data matches original
 * @param {Uint8Array} original
 * @param {Uint8Array} decompressed
 * @returns {boolean}
 */
export function verify_data(original, decompressed) {
    const ptr0 = passArray8ToWasm0(original, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(decompressed, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verify_data(ptr0, len0, ptr1, len1);
    return ret !== 0;
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_brotli_7(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_brotli_7(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Get test data info (helper for JavaScript)
 * @returns {string}
 */
export function get_test_data_path() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.get_test_data_path();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_brotli_1(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_brotli_1(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_brotli_5(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_brotli_5(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_brotli_8(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_brotli_8(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function decompress_brotli(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.decompress_brotli(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function compress_brotli_3(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compress_brotli_3(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Decompress Zstd data (pure Rust implementation - ruzstd)
 * Works for all compression levels (1, 3, 6, 9, 12)
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function decompress_zstd(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.decompress_zstd(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Decompress LZ4 data (pure Rust implementation)
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function decompress_lz4(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.decompress_lz4(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Perform general-purpose aggregation on a table
 *
 * This is the main API for Vega integration, supporting:
 * - Multiple groupby dimensions
 * - Multiple aggregation operations
 * - Flexible field mapping
 *
 * # Arguments
 * * `table` - The WasmTable to aggregate
 * * `config` - JavaScript object with aggregation configuration
 *
 * # Returns
 * Array of JavaScript objects, each representing one aggregated row
 * @param {WasmTable} table
 * @param {any} config
 * @returns {any}
 */
export function aggregate(table, config) {
    _assertClass(table, WasmTable);
    const ret = wasm.aggregate(table.__wbg_ptr, config);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

const EfficientWasmTableFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_efficientwasmtable_free(ptr >>> 0, 1));
/**
 * Efficient WASM table with true lazy loading
 */
export class EfficientWasmTable {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EfficientWasmTableFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_efficientwasmtable_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    columnCount() {
        const ret = wasm.efficientwasmtable_columnCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get memory usage statistics
     * @returns {object}
     */
    getMemoryStats() {
        const ret = wasm.efficientwasmtable_getMemoryStats(this.__wbg_ptr);
        return ret;
    }
    /**
     * Efficient batch loading - only loads needed chunks!
     * @param {number} column_index
     * @param {number} start_row
     * @param {number} count
     * @returns {Array<any>}
     */
    getBatch(column_index, start_row, count) {
        const ret = wasm.efficientwasmtable_getBatch(this.__wbg_ptr, column_index, start_row, count);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get table dimensions - ZERO ACCESS to avoid ANY recursion
     * @returns {number}
     */
    rowCount() {
        const ret = wasm.efficientwasmtable_rowCount(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) EfficientWasmTable.prototype[Symbol.dispose] = EfficientWasmTable.prototype.free;

const HeatmapDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_heatmapdata_free(ptr >>> 0, 1));
/**
 * Heatmap data structure for 2D binning and aggregation
 *
 * This structure holds the results of aggregating data into a 2D grid for heatmap visualization.
 * The data is stored in row-major order (index = y * width + x).
 */
export class HeatmapData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(HeatmapData.prototype);
        obj.__wbg_ptr = ptr;
        HeatmapDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HeatmapDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_heatmapdata_free(ptr, 0);
    }
    /**
     * Get the value label
     * @returns {string}
     */
    get value_label() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.heatmapdata_value_label(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the x bin edges (length = width + 1)
     * @returns {Float64Array}
     */
    get x_bin_edges() {
        const ret = wasm.heatmapdata_x_bin_edges(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Get the y bin edges (length = height + 1)
     * @returns {Float64Array}
     */
    get y_bin_edges() {
        const ret = wasm.heatmapdata_y_bin_edges(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Get a value at a specific grid position
     * @param {number} x
     * @param {number} y
     * @returns {number | undefined}
     */
    get(x, y) {
        const ret = wasm.heatmapdata_get(this.__wbg_ptr, x, y);
        return ret[0] === 0 ? undefined : ret[1];
    }
    /**
     * Get the heatmap data as a flat array (row-major order)
     * JavaScript must copy this data
     * @returns {Float64Array}
     */
    get data() {
        const ret = wasm.heatmapdata_data(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Get the width (number of bins in x direction)
     * @returns {number}
     */
    get width() {
        const ret = wasm.heatmapdata_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the height (number of bins in y direction)
     * @returns {number}
     */
    get height() {
        const ret = wasm.heatmapdata_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get the x-axis label
     * @returns {string}
     */
    get x_label() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.heatmapdata_x_label(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the y-axis label
     * @returns {string}
     */
    get y_label() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.heatmapdata_y_label(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the maximum value in the heatmap
     * @returns {number}
     */
    get max_value() {
        const ret = wasm.heatmapdata_max_value(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get the minimum value in the heatmap
     * @returns {number}
     */
    get min_value() {
        const ret = wasm.heatmapdata_min_value(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) HeatmapData.prototype[Symbol.dispose] = HeatmapData.prototype.free;

const HeatmapRendererFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_heatmaprenderer_free(ptr >>> 0, 1));
/**
 * Heatmap renderer for direct pixel manipulation
 */
export class HeatmapRenderer {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HeatmapRendererFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_heatmaprenderer_free(ptr, 0);
    }
    /**
     * Render a heatmap to an RGBA pixel buffer
     *
     * # Arguments
     * * `pixels` - RGBA pixel buffer (Uint8ClampedArray in JS, length = width * height * 4)
     * * `canvas_width` - Width of the canvas in pixels
     * * `canvas_height` - Height of the canvas in pixels
     * * `data` - Heatmap data values (row-major order)
     * * `data_width` - Width of the data grid
     * * `data_height` - Height of the data grid
     * * `min_value` - Minimum value for color scale
     * * `max_value` - Maximum value for color scale
     *
     * # Color Scale
     * Uses a blue-to-red gradient (cold to hot):
     * - Blue (#1f77b4) for minimum values
     * - Yellow for middle values
     * - Red (#d62728) for maximum values
     * @param {Uint8Array} pixels
     * @param {number} canvas_width
     * @param {number} canvas_height
     * @param {Float64Array} data
     * @param {number} data_width
     * @param {number} data_height
     * @param {number} min_value
     * @param {number} max_value
     */
    render_heatmap(pixels, canvas_width, canvas_height, data, data_width, data_height, min_value, max_value) {
        var ptr0 = passArray8ToWasm0(pixels, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.heatmaprenderer_render_heatmap(this.__wbg_ptr, ptr0, len0, pixels, canvas_width, canvas_height, ptr1, len1, data_width, data_height, min_value, max_value);
    }
    /**
     * Render a heatmap with a custom color scale
     *
     * # Arguments
     * * `pixels` - RGBA pixel buffer
     * * `canvas_width` - Width of the canvas in pixels
     * * `canvas_height` - Height of the canvas in pixels
     * * `data` - Heatmap data values (row-major order)
     * * `data_width` - Width of the data grid
     * * `data_height` - Height of the data grid
     * * `min_value` - Minimum value for color scale
     * * `max_value` - Maximum value for color scale
     * * `color_stops` - Array of RGBA colors as u32 (0xRRGGBBAA)
     *
     * The color_stops array should contain at least 2 colors.
     * Values are interpolated between the stops.
     * @param {Uint8Array} pixels
     * @param {number} canvas_width
     * @param {number} canvas_height
     * @param {Float64Array} data
     * @param {number} data_width
     * @param {number} data_height
     * @param {number} min_value
     * @param {number} max_value
     * @param {Uint32Array} color_stops
     */
    render_heatmap_custom(pixels, canvas_width, canvas_height, data, data_width, data_height, min_value, max_value, color_stops) {
        var ptr0 = passArray8ToWasm0(pixels, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray32ToWasm0(color_stops, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        wasm.heatmaprenderer_render_heatmap_custom(this.__wbg_ptr, ptr0, len0, pixels, canvas_width, canvas_height, ptr1, len1, data_width, data_height, min_value, max_value, ptr2, len2);
    }
    /**
     * Render a heatmap with bilinear interpolation for smoother results
     *
     * Same arguments as render_heatmap, but uses bilinear interpolation
     * to blend between data points for smoother gradients.
     * @param {Uint8Array} pixels
     * @param {number} canvas_width
     * @param {number} canvas_height
     * @param {Float64Array} data
     * @param {number} data_width
     * @param {number} data_height
     * @param {number} min_value
     * @param {number} max_value
     */
    render_heatmap_interpolated(pixels, canvas_width, canvas_height, data, data_width, data_height, min_value, max_value) {
        var ptr0 = passArray8ToWasm0(pixels, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.heatmaprenderer_render_heatmap_interpolated(this.__wbg_ptr, ptr0, len0, pixels, canvas_width, canvas_height, ptr1, len1, data_width, data_height, min_value, max_value);
    }
    /**
     * Create a new HeatmapRenderer
     */
    constructor() {
        const ret = wasm.heatmaprenderer_new();
        this.__wbg_ptr = ret >>> 0;
        HeatmapRendererFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) HeatmapRenderer.prototype[Symbol.dispose] = HeatmapRenderer.prototype.free;

const VirtualArrayFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_virtualarray_free(ptr >>> 0, 1));
/**
 * Virtual array that provides JavaScript-compatible access to table data
 *
 * This abstraction layer allows visualization libraries like D3 to access
 * compressed table data as if it were a regular JavaScript array.
 */
export class VirtualArray {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VirtualArrayFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_virtualarray_free(ptr, 0);
    }
    /**
     * Get a string value at the specified index
     * @param {number} index
     * @returns {string}
     */
    getString(index) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.virtualarray_getString(this.__wbg_ptr, index);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Get an integer value at the specified index
     * @param {number} index
     * @returns {bigint}
     */
    getInteger(index) {
        const ret = wasm.virtualarray_getInteger(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * Check if this virtual array contains strings
     * @returns {boolean}
     */
    isStringColumn() {
        const ret = wasm.virtualarray_isStringColumn(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Slice the virtual array (returns a new VirtualArray)
     * @param {number} start
     * @param {number} end
     * @returns {VirtualArraySlice}
     */
    slice(start, end) {
        const ret = wasm.virtualarray_slice(this.__wbg_ptr, start, end);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return VirtualArraySlice.__wrap(ret[0]);
    }
    /**
     * Get the length (compatible with JavaScript Array.length)
     * @returns {number}
     */
    get length() {
        const ret = wasm.virtualarray_length(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Create an iterator-like interface for JavaScript
     * Returns a JavaScript object with next() method
     * @returns {VirtualArrayIterator}
     */
    iterator() {
        const ret = wasm.virtualarray_iterator(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return VirtualArrayIterator.__wrap(ret[0]);
    }
    /**
     * Get multiple values as a JavaScript array (for batch operations)
     * @param {number} start
     * @param {number} end
     * @returns {Array<any>}
     */
    getRange(start, end) {
        const ret = wasm.virtualarray_getRange(this.__wbg_ptr, start, end);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get column statistics for JavaScript consumption
     * @returns {any}
     */
    getStats() {
        const ret = wasm.virtualarray_getStats(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get a value as JavaScript value (auto-detects type)
     * @param {number} index
     * @returns {any}
     */
    getValue(index) {
        const ret = wasm.virtualarray_getValue(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) VirtualArray.prototype[Symbol.dispose] = VirtualArray.prototype.free;

const VirtualArrayIteratorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_virtualarrayiterator_free(ptr >>> 0, 1));
/**
 * Iterator for virtual arrays
 */
export class VirtualArrayIterator {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VirtualArrayIterator.prototype);
        obj.__wbg_ptr = ptr;
        VirtualArrayIteratorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VirtualArrayIteratorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_virtualarrayiterator_free(ptr, 0);
    }
    /**
     * Get the next value in the iterator
     * @returns {any}
     */
    next() {
        const ret = wasm.virtualarrayiterator_next(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) VirtualArrayIterator.prototype[Symbol.dispose] = VirtualArrayIterator.prototype.free;

const VirtualArraySliceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_virtualarrayslice_free(ptr >>> 0, 1));
/**
 * Slice of a virtual array
 */
export class VirtualArraySlice {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VirtualArraySlice.prototype);
        obj.__wbg_ptr = ptr;
        VirtualArraySliceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VirtualArraySliceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_virtualarrayslice_free(ptr, 0);
    }
    /**
     * Get the length of the slice
     * @returns {number}
     */
    get length() {
        const ret = wasm.virtualarrayslice_length(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Convert slice to JavaScript array
     * @returns {Array<any>}
     */
    toArray() {
        const ret = wasm.virtualarrayslice_toArray(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get a value from the slice
     * @param {number} index
     * @returns {any}
     */
    getValue(index) {
        const ret = wasm.virtualarrayslice_getValue(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) VirtualArraySlice.prototype[Symbol.dispose] = VirtualArraySlice.prototype.free;

const WasmAggregatedResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmaggregatedresult_free(ptr >>> 0, 1));
/**
 * WASM wrapper for aggregated chart data - optimized for web visualization
 */
export class WasmAggregatedResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmAggregatedResult.prototype);
        obj.__wbg_ptr = ptr;
        WasmAggregatedResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmAggregatedResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmaggregatedresult_free(ptr, 0);
    }
    /**
     * Get record counts for each group
     * 🔧 MEMORY FIX: Returns Float64Array for counts (5-10x memory savings)
     * @returns {any}
     */
    getCounts() {
        const ret = wasm.wasmaggregatedresult_getCounts(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get X-axis values as JavaScript array with appropriate types
     * 🔧 MEMORY FIX: Returns TypedArray for numeric data (8 bytes/element vs 40-80 for boxed)
     * @returns {any}
     */
    getXValues() {
        const ret = wasm.wasmaggregatedresult_getXValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get Y-axis values as JavaScript array
     * 🔧 MEMORY FIX: Returns Float64Array for numeric data (5-10x memory savings)
     * @returns {any}
     */
    getYValues() {
        const ret = wasm.wasmaggregatedresult_getYValues(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get group IDs for color coding (if available)
     * 🔧 MEMORY FIX: Returns Uint32Array for integer IDs (4 bytes/element vs 40-80 for boxed)
     * @returns {any}
     */
    getGroupIds() {
        const ret = wasm.wasmaggregatedresult_getGroupIds(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get number of groups in the aggregation
     * @returns {number}
     */
    getGroupCount() {
        const ret = wasm.wasmaggregatedresult_getGroupCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get group names for color legends (if available)
     * @returns {Array<any> | undefined}
     */
    getGroupNames() {
        const ret = wasm.wasmaggregatedresult_getGroupNames(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) WasmAggregatedResult.prototype[Symbol.dispose] = WasmAggregatedResult.prototype.free;

const WasmFloatChunkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmfloatchunk_free(ptr >>> 0, 1));
/**
 * WASM-accessible chunk wrapper for float chunks
 */
export class WasmFloatChunk {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmFloatChunk.prototype);
        obj.__wbg_ptr = ptr;
        WasmFloatChunkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmFloatChunkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmfloatchunk_free(ptr, 0);
    }
    /**
     * Get the number of values in this chunk
     * @returns {number}
     */
    get len() {
        const ret = wasm.wasmfloatchunk_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get average value in this chunk
     * @returns {number}
     */
    getAvg() {
        const ret = wasm.wasmfloatchunk_getAvg(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get maximum value in this chunk
     * @returns {number}
     */
    getMax() {
        const ret = wasm.wasmfloatchunk_getMax(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get minimum value in this chunk
     * @returns {number}
     */
    getMin() {
        const ret = wasm.wasmfloatchunk_getMin(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get sum of all values in this chunk
     * @returns {number}
     */
    getSum() {
        const ret = wasm.wasmfloatchunk_getSum(this.__wbg_ptr);
        return ret;
    }
    /**
     * Extract a range of values from this chunk
     *
     * Returns a Float64Array of values [start, end)
     * @param {number} start
     * @param {number} end
     * @returns {Float64Array}
     */
    getRange(start, end) {
        const ret = wasm.wasmfloatchunk_getRange(this.__wbg_ptr, start, end);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Get a single value by index
     * @param {number} index
     * @returns {number}
     */
    getValue(index) {
        const ret = wasm.wasmfloatchunk_getValue(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
}
if (Symbol.dispose) WasmFloatChunk.prototype[Symbol.dispose] = WasmFloatChunk.prototype.free;

const WasmIntegerChunkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmintegerchunk_free(ptr >>> 0, 1));
/**
 * WASM-accessible chunk wrapper for integer chunks
 */
export class WasmIntegerChunk {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmIntegerChunk.prototype);
        obj.__wbg_ptr = ptr;
        WasmIntegerChunkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmIntegerChunkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmintegerchunk_free(ptr, 0);
    }
    /**
     * Get the number of values in this chunk
     * @returns {number}
     */
    get len() {
        const ret = wasm.wasmintegerchunk_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get average value in this chunk
     * @returns {number}
     */
    getAvg() {
        const ret = wasm.wasmintegerchunk_getAvg(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get maximum value in this chunk
     * @returns {number}
     */
    getMax() {
        const ret = wasm.wasmintegerchunk_getMax(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get minimum value in this chunk
     * @returns {number}
     */
    getMin() {
        const ret = wasm.wasmintegerchunk_getMin(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get sum of all values in this chunk
     * @returns {number}
     */
    getSum() {
        const ret = wasm.wasmintegerchunk_getSum(this.__wbg_ptr);
        return ret;
    }
    /**
     * Extract a range of values from this chunk
     *
     * Returns a Float64Array of values [start, end)
     * @param {number} start
     * @param {number} end
     * @returns {Float64Array}
     */
    getRange(start, end) {
        const ret = wasm.wasmintegerchunk_getRange(this.__wbg_ptr, start, end);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * Get a single value by index
     *
     * Returns the value as f64 since JavaScript doesn't have i64
     * @param {number} index
     * @returns {number}
     */
    getValue(index) {
        const ret = wasm.wasmintegerchunk_getValue(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
}
if (Symbol.dispose) WasmIntegerChunk.prototype[Symbol.dispose] = WasmIntegerChunk.prototype.free;

const WasmMemoryManagerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmmemorymanager_free(ptr >>> 0, 1));
/**
 * Memory pool manager for WASM environments
 */
export class WasmMemoryManager {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmMemoryManagerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmmemorymanager_free(ptr, 0);
    }
    /**
     * Get a pooled buffer or create a new one
     * @param {number} size_bytes
     * @returns {Uint8Array}
     */
    get_buffer(size_bytes) {
        const ret = wasm.wasmmemorymanager_get_buffer(this.__wbg_ptr, size_bytes);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Check if we can allocate more memory
     * @param {number} size_bytes
     * @returns {boolean}
     */
    can_allocate(size_bytes) {
        const ret = wasm.wasmmemorymanager_can_allocate(this.__wbg_ptr, size_bytes);
        return ret !== 0;
    }
    /**
     * Return a buffer to the pool for reuse
     * @param {Uint8Array} buffer
     */
    return_buffer(buffer) {
        const ptr0 = passArray8ToWasm0(buffer, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wasmmemorymanager_return_buffer(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Get memory statistics
     * @returns {any}
     */
    get_memory_stats() {
        const ret = wasm.wasmmemorymanager_get_memory_stats(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get current memory usage in MB
     * @returns {number}
     */
    get_current_usage_mb() {
        const ret = wasm.wasmmemorymanager_get_current_usage_mb(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get memory usage percentage
     * @returns {number}
     */
    get_usage_percentage() {
        const ret = wasm.wasmmemorymanager_get_usage_percentage(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get current memory usage in bytes
     * @returns {number}
     */
    get_current_usage_bytes() {
        const ret = wasm.wasmmemorymanager_get_current_usage_bytes(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Create a new memory manager with specified limits
     * @param {number} max_memory_mb
     */
    constructor(max_memory_mb) {
        const ret = wasm.wasmmemorymanager_new(max_memory_mb);
        this.__wbg_ptr = ret >>> 0;
        WasmMemoryManagerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Force garbage collection and cleanup
     */
    cleanup() {
        wasm.wasmmemorymanager_cleanup(this.__wbg_ptr);
    }
}
if (Symbol.dispose) WasmMemoryManager.prototype[Symbol.dispose] = WasmMemoryManager.prototype.free;

const WasmMemoryOptimizerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmmemoryoptimizer_free(ptr >>> 0, 1));
/**
 * WASM memory optimization utilities
 */
export class WasmMemoryOptimizer {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmMemoryOptimizerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmmemoryoptimizer_free(ptr, 0);
    }
    /**
     * Get memory recommendations for a file
     * @param {number} file_size_bytes
     * @returns {any}
     */
    static get_memory_recommendations(file_size_bytes) {
        const ret = wasm.wasmmemoryoptimizer_get_memory_recommendations(file_size_bytes);
        return ret;
    }
    /**
     * Check if current browser supports optimal processing
     * @returns {any}
     */
    static check_browser_compatibility() {
        const ret = wasm.wasmmemoryoptimizer_check_browser_compatibility();
        return ret;
    }
    /**
     * Estimate optimal chunk size for given memory limit
     * @param {number} memory_limit_mb
     * @param {number} file_size_bytes
     * @returns {number}
     */
    static calculate_optimal_chunk_size(memory_limit_mb, file_size_bytes) {
        const ret = wasm.wasmmemoryoptimizer_calculate_optimal_chunk_size(memory_limit_mb, file_size_bytes);
        return ret >>> 0;
    }
}
if (Symbol.dispose) WasmMemoryOptimizer.prototype[Symbol.dispose] = WasmMemoryOptimizer.prototype.free;

const WasmMemoryStatsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmmemorystats_free(ptr >>> 0, 1));
/**
 * Statistics about WebAssembly memory usage
 */
export class WasmMemoryStats {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmMemoryStats.prototype);
        obj.__wbg_ptr = ptr;
        WasmMemoryStatsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmMemoryStatsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmmemorystats_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get total_memory() {
        const ret = wasm.wasmmemorystats_total_memory(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get active_memory() {
        const ret = wasm.wasmmemorystats_active_memory(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get pooled_memory() {
        const ret = wasm.wasmmemorystats_pooled_memory(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get total_buffers() {
        const ret = wasm.wasmmemorystats_total_buffers(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get active_buffers() {
        const ret = wasm.wasmmemorystats_active_buffers(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get totalMemoryMB() {
        const ret = wasm.wasmmemorystats_totalMemoryMB(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) WasmMemoryStats.prototype[Symbol.dispose] = WasmMemoryStats.prototype.free;

const WasmProgressTrackerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmprogresstracker_free(ptr >>> 0, 1));
/**
 * WASM-compatible progress tracking
 */
export class WasmProgressTracker {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmProgressTrackerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmprogresstracker_free(ptr, 0);
    }
    /**
     * @param {any | null} [callback]
     */
    constructor(callback) {
        const ret = wasm.wasmprogresstracker_new(isLikeNone(callback) ? 0 : addToExternrefTable0(callback));
        this.__wbg_ptr = ret >>> 0;
        WasmProgressTrackerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} progress
     * @param {string} message
     */
    update(progress, message) {
        const ptr0 = passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wasmprogresstracker_update(this.__wbg_ptr, progress, ptr0, len0);
    }
}
if (Symbol.dispose) WasmProgressTracker.prototype[Symbol.dispose] = WasmProgressTracker.prototype.free;

const WasmSchemaAnalyzerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmschemaanalyzer_free(ptr >>> 0, 1));
/**
 * WASM-compatible schema analyzer
 */
export class WasmSchemaAnalyzer {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSchemaAnalyzer.prototype);
        obj.__wbg_ptr = ptr;
        WasmSchemaAnalyzerFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSchemaAnalyzerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmschemaanalyzer_free(ptr, 0);
    }
    /**
     * Create a chunk-based analyzer for large files
     * @param {number} chunk_size
     * @returns {WasmSchemaAnalyzer}
     */
    static chunk_based(chunk_size) {
        const ret = wasm.wasmschemaanalyzer_chunk_based(chunk_size);
        return WasmSchemaAnalyzer.__wrap(ret);
    }
    /**
     * Create analyzer with full custom configuration
     * @param {number} sample_size
     * @param {number | null | undefined} chunk_size
     * @param {boolean} distributed_sampling
     * @param {boolean} collect_problematic_samples
     * @param {number} max_problematic_samples
     * @returns {WasmSchemaAnalyzer}
     */
    static with_config(sample_size, chunk_size, distributed_sampling, collect_problematic_samples, max_problematic_samples) {
        const ret = wasm.wasmschemaanalyzer_with_config(sample_size, isLikeNone(chunk_size) ? 0x100000001 : (chunk_size) >>> 0, distributed_sampling, collect_problematic_samples, max_problematic_samples);
        return WasmSchemaAnalyzer.__wrap(ret);
    }
    /**
     * Create a fast preview analyzer for immediate UI feedback
     * @returns {WasmSchemaAnalyzer}
     */
    static fast_preview() {
        const ret = wasm.wasmschemaanalyzer_fast_preview();
        return WasmSchemaAnalyzer.__wrap(ret);
    }
    /**
     * Create ultra-minimal analyzer for problematic files
     * @returns {WasmSchemaAnalyzer}
     */
    static ultra_minimal() {
        const ret = wasm.wasmschemaanalyzer_ultra_minimal();
        return WasmSchemaAnalyzer.__wrap(ret);
    }
    /**
     * Create a schema analyzer with custom sample size
     * @param {number} sample_size
     * @returns {WasmSchemaAnalyzer}
     */
    static with_sample_size(sample_size) {
        const ret = wasm.wasmschemaanalyzer_with_sample_size(sample_size);
        return WasmSchemaAnalyzer.__wrap(ret);
    }
    /**
     * Analyze CSV schema from a file buffer
     * @param {Uint8Array} csv_data
     * @param {string | null} [filename]
     * @returns {any}
     */
    analyze_csv_buffer(csv_data, filename) {
        const ptr0 = passArray8ToWasm0(csv_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(filename) ? 0 : passStringToWasm0(filename, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmschemaanalyzer_analyze_csv_buffer(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Process CSV with confirmed schema and return actual WasmTable
     * Optionally accepts a JavaScript progress callback function(progress: number, message: string)
     * @param {Uint8Array} csv_data
     * @param {string} user_config_json
     * @param {Function | null} [progress_callback]
     * @returns {WasmTable}
     */
    create_table_from_csv(csv_data, user_config_json, progress_callback) {
        const ptr0 = passArray8ToWasm0(csv_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(user_config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmschemaanalyzer_create_table_from_csv(this.__wbg_ptr, ptr0, len0, ptr1, len1, isLikeNone(progress_callback) ? 0 : addToExternrefTable0(progress_callback));
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmTable.__wrap(ret[0]);
    }
    /**
     * Analyze CSV with a maximum number of rows
     * @param {Uint8Array} csv_data
     * @param {number} max_rows
     * @returns {any}
     */
    analyze_csv_with_limit(csv_data, max_rows) {
        const ptr0 = passArray8ToWasm0(csv_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmschemaanalyzer_analyze_csv_with_limit(this.__wbg_ptr, ptr0, len0, max_rows);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Analyze a small sample first (for large files)
     * @param {Uint8Array} csv_data
     * @param {number} sample_size_mb
     * @returns {any}
     */
    analyze_csv_sample_first(csv_data, sample_size_mb) {
        const ptr0 = passArray8ToWasm0(csv_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmschemaanalyzer_analyze_csv_sample_first(this.__wbg_ptr, ptr0, len0, sample_size_mb);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create analyzer with custom chunk and sample sizes
     * @param {number} chunk_size
     * @param {number} sample_size
     * @returns {WasmSchemaAnalyzer}
     */
    static with_chunk_and_sample_size(chunk_size, sample_size) {
        const ret = wasm.wasmschemaanalyzer_with_chunk_and_sample_size(chunk_size, sample_size);
        return WasmSchemaAnalyzer.__wrap(ret);
    }
    /**
     * Process CSV with confirmed user schema
     * @param {Uint8Array} csv_data
     * @param {string} user_config_json
     * @returns {any}
     */
    process_with_confirmed_schema(csv_data, user_config_json) {
        const ptr0 = passArray8ToWasm0(csv_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(user_config_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmschemaanalyzer_process_with_confirmed_schema(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create memory-optimized analyzer for very large files (>100MB)
     * @returns {WasmSchemaAnalyzer}
     */
    static memory_optimized_for_large_files() {
        const ret = wasm.wasmschemaanalyzer_memory_optimized_for_large_files();
        return WasmSchemaAnalyzer.__wrap(ret);
    }
    /**
     * Get recommended configuration for file size
     * @param {bigint} file_size_bytes
     * @returns {any}
     */
    static get_recommended_config_for_file_size(file_size_bytes) {
        const ret = wasm.wasmschemaanalyzer_get_recommended_config_for_file_size(file_size_bytes);
        return ret;
    }
    /**
     * Create a new schema analyzer optimized for web environments
     */
    constructor() {
        const ret = wasm.wasmschemaanalyzer_new();
        this.__wbg_ptr = ret >>> 0;
        WasmSchemaAnalyzerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) WasmSchemaAnalyzer.prototype[Symbol.dispose] = WasmSchemaAnalyzer.prototype.free;

const WasmStreamingProcessorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmstreamingprocessor_free(ptr >>> 0, 1));
/**
 * Streaming CSV processor for memory-efficient analysis
 */
export class WasmStreamingProcessor {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmStreamingProcessorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmstreamingprocessor_free(ptr, 0);
    }
    /**
     * Get processing progress
     * @returns {number}
     */
    get_progress() {
        const ret = wasm.wasmstreamingprocessor_get_progress(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get current memory statistics
     * @returns {any}
     */
    get_memory_stats() {
        const ret = wasm.wasmstreamingprocessor_get_memory_stats(this.__wbg_ptr);
        return ret;
    }
    /**
     * Process CSV data in chunks
     * @param {Uint8Array} csv_data
     * @param {Function | null} [progress_callback]
     * @returns {any}
     */
    process_csv_stream(csv_data, progress_callback) {
        const ptr0 = passArray8ToWasm0(csv_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmstreamingprocessor_process_csv_stream(this.__wbg_ptr, ptr0, len0, isLikeNone(progress_callback) ? 0 : addToExternrefTable0(progress_callback));
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a new streaming processor
     * @param {number} max_memory_mb
     * @param {number} chunk_size
     */
    constructor(max_memory_mb, chunk_size) {
        const ret = wasm.wasmstreamingprocessor_new(max_memory_mb, chunk_size);
        this.__wbg_ptr = ret >>> 0;
        WasmStreamingProcessorFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Force cleanup
     */
    cleanup() {
        wasm.wasmstreamingprocessor_cleanup(this.__wbg_ptr);
    }
}
if (Symbol.dispose) WasmStreamingProcessor.prototype[Symbol.dispose] = WasmStreamingProcessor.prototype.free;

const WasmStringChunkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmstringchunk_free(ptr >>> 0, 1));
/**
 * WASM-accessible chunk wrapper for string chunks
 */
export class WasmStringChunk {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmStringChunk.prototype);
        obj.__wbg_ptr = ptr;
        WasmStringChunkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmStringChunkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmstringchunk_free(ptr, 0);
    }
    /**
     * Count occurrences of a specific value
     * @param {string} target
     * @returns {number}
     */
    countValue(target) {
        const ptr0 = passStringToWasm0(target, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmstringchunk_countValue(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
    }
    /**
     * Get the number of values in this chunk
     * @returns {number}
     */
    get len() {
        const ret = wasm.wasmstringchunk_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Extract a range of values from this chunk
     *
     * Returns an array of strings [start, end)
     * @param {number} start
     * @param {number} end
     * @returns {string[]}
     */
    getRange(start, end) {
        const ret = wasm.wasmstringchunk_getRange(this.__wbg_ptr, start, end);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Get a single value by index
     * @param {number} index
     * @returns {string}
     */
    getValue(index) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmstringchunk_getValue(this.__wbg_ptr, index);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
}
if (Symbol.dispose) WasmStringChunk.prototype[Symbol.dispose] = WasmStringChunk.prototype.free;

const WasmTableFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtable_free(ptr >>> 0, 1));

export class WasmTable {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTable.prototype);
        obj.__wbg_ptr = ptr;
        WasmTableFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTableFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtable_free(ptr, 0);
    }
    /**
     * Get integer value
     * @param {number} column
     * @param {number} row
     * @returns {number}
     */
    getInteger(column, row) {
        const ret = wasm.wasmtable_getInteger(this.__wbg_ptr, column, row);
        return ret;
    }
    /**
     * Get column count
     * @returns {bigint}
     */
    columnCount() {
        const ret = wasm.wasmtable_columnCount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Export table as compressed bytes for download
     * @returns {Uint8Array}
     */
    saveToBytes() {
        const ret = wasm.wasmtable_saveToBytes(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get column type
     * @param {number} column
     * @returns {string}
     */
    getColumnType(column) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmtable_getColumnType(this.__wbg_ptr, column);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Create a table from bytes with default WASM strategy (PreferMemory)
     * @param {Uint8Array} bytes
     * @returns {WasmTable}
     */
    static loadFromBytes(bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmtable_loadFromBytes(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmTable.__wrap(ret[0]);
    }
    /**
     * Get column names
     * @returns {Array<any>}
     */
    getColumnNames() {
        const ret = wasm.wasmtable_getColumnNames(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get entire column as Float64Array (zero-copy for chart rendering)
     *
     * This is 3-5x faster than calling getFloat() in a loop because:
     * - Only 1 WASM boundary crossing instead of N
     * - Returns TypedArray for zero-copy access from JavaScript
     * - Optimized iteration over compressed data
     *
     * # Example (JavaScript)
     * ```javascript
     * // Before: 2M WASM calls for 1M row scatter plot
     * for (let i = 0; i < 1000000; i++) {
     *     const x = table.getFloat(xCol, i);  // WASM call
     *     const y = table.getFloat(yCol, i);  // WASM call
     * }
     *
     * // After: 2 WASM calls
     * const xData = table.getColumnAsFloat64Array(xCol);
     * const yData = table.getColumnAsFloat64Array(yCol);
     * for (let i = 0; i < 1000000; i++) {
     *     const x = xData[i];  // JS array access
     *     const y = yData[i];  // JS array access
     * }
     * ```
     * @param {number} col_idx
     * @returns {Float64Array}
     */
    getColumnAsFloat64Array(col_idx) {
        const ret = wasm.wasmtable_getColumnAsFloat64Array(this.__wbg_ptr, col_idx);
        return ret;
    }
    /**
     * Get entire column as Int32Array (for integer columns)
     *
     * Similar to getColumnAsFloat64Array but returns Int32Array for integer data.
     * Use this when you know the column contains integers and want to save memory.
     * @param {number} col_idx
     * @returns {Int32Array}
     */
    getColumnAsInt32Array(col_idx) {
        const ret = wasm.wasmtable_getColumnAsInt32Array(this.__wbg_ptr, col_idx);
        return ret;
    }
    /**
     * Get the active Tier1Strategy used by this table
     * @returns {string}
     */
    getTier1Strategy() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmtable_getTier1Strategy(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * High-performance chart aggregation to eliminate 400K+ getValue() calls
     * @param {number} x_column
     * @param {number | null} [y_column]
     * @param {number | null} [color_column]
     * @returns {WasmAggregatedResult}
     */
    aggregateForChart(x_column, y_column, color_column) {
        const ret = wasm.wasmtable_aggregateForChart(this.__wbg_ptr, x_column, isLikeNone(y_column) ? 0x100000001 : (y_column) >>> 0, isLikeNone(color_column) ? 0x100000001 : (color_column) >>> 0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmAggregatedResult.__wrap(ret[0]);
    }
    /**
     * Get memory usage in MB
     * @returns {number}
     */
    getMemoryUsageMB() {
        const ret = wasm.wasmtable_getMemoryUsageMB(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get detailed memory usage breakdown (returns JSON string)
     * @returns {string}
     */
    getMemoryUsageDetailed() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmtable_getMemoryUsageDetailed(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Save table to bytes WITHOUT Tier 2 compression (memory-efficient for large CSV parsing)
     *
     * This method is specifically designed for scenarios where memory usage is critical,
     * such as parsing large CSV files in the browser. It applies only Tier 1 compression
     * (bit-packing, FOR encoding, dictionary encoding) and skips Tier 2 compression (LZ4/zstd).
     *
     * **Memory savings**: ~2-3x lower peak memory usage during serialization
     *
     * **When to use**:
     * - Immediately after parsing large CSV files
     * - When you plan to re-compress with Tier 2 later (e.g., before IndexedDB storage)
     *
     * **When NOT to use**:
     * - Final storage (use regular `saveToBytes()` for optimal file size)
     * @returns {Uint8Array}
     */
    saveToBytesWithoutTier2() {
        const ret = wasm.wasmtable_saveToBytesWithoutTier2(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a table from bytes with explicit strategy control
     * prefer_memory: true = PreferMemory (smaller memory, slower access)
     *               false = PreferSpeed (larger memory, faster access)
     * @param {Uint8Array} bytes
     * @param {boolean} prefer_memory
     * @returns {WasmTable}
     */
    static loadFromBytesWithStrategy(bytes, prefer_memory) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmtable_loadFromBytesWithStrategy(ptr0, len0, prefer_memory);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmTable.__wrap(ret[0]);
    }
    /**
     * Get float value
     * @param {number} column
     * @param {number} row
     * @returns {number}
     */
    getFloat(column, row) {
        const ret = wasm.wasmtable_getFloat(this.__wbg_ptr, column, row);
        return ret;
    }
    /**
     * Get a single value from the table (as string representation)
     * @param {number} column
     * @param {number} row
     * @returns {string}
     */
    getValue(column, row) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmtable_getValue(this.__wbg_ptr, column, row);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get row count
     * @returns {bigint}
     */
    rowCount() {
        const ret = wasm.wasmtable_rowCount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
}
if (Symbol.dispose) WasmTable.prototype[Symbol.dispose] = WasmTable.prototype.free;

const WasmUserSchemaConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmuserschemaconfig_free(ptr >>> 0, 1));
/**
 * WASM-compatible user schema configuration
 */
export class WasmUserSchemaConfig {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmUserSchemaConfig.prototype);
        obj.__wbg_ptr = ptr;
        WasmUserSchemaConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmUserSchemaConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmuserschemaconfig_free(ptr, 0);
    }
    /**
     * Get column count
     * @returns {number}
     */
    column_count() {
        const ret = wasm.wasmuserschemaconfig_column_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Update a column's selected type
     * @param {number} index
     * @param {string} new_type
     */
    update_column_type(index, new_type) {
        const ptr0 = passStringToWasm0(new_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmuserschemaconfig_update_column_type(this.__wbg_ptr, index, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Convert to JSON string
     * @returns {string}
     */
    to_json() {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.wasmuserschemaconfig_to_json(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Create from JSON string
     * @param {string} json_str
     * @returns {WasmUserSchemaConfig}
     */
    static from_json(json_str) {
        const ptr0 = passStringToWasm0(json_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmuserschemaconfig_from_json(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmUserSchemaConfig.__wrap(ret[0]);
    }
}
if (Symbol.dispose) WasmUserSchemaConfig.prototype[Symbol.dispose] = WasmUserSchemaConfig.prototype.free;

const WasmUtilsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmutils_free(ptr >>> 0, 1));
/**
 * Utility functions for WASM integration
 */
export class WasmUtils {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmUtilsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmutils_free(ptr, 0);
    }
    /**
     * Check if a file buffer is likely CSV
     * @param {Uint8Array} data
     * @returns {boolean}
     */
    static is_likely_csv(data) {
        const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmutils_is_likely_csv(ptr0, len0);
        return ret !== 0;
    }
    /**
     * Format file size for display
     * @param {bigint} bytes
     * @returns {string}
     */
    static format_file_size(bytes) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmutils_format_file_size(bytes);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Check if estimated memory usage is safe for WASM
     * @param {bigint} estimated_memory_mb
     * @returns {boolean}
     */
    static is_memory_usage_safe(estimated_memory_mb) {
        const ret = wasm.wasmutils_is_memory_usage_safe(estimated_memory_mb);
        return ret !== 0;
    }
    /**
     * Estimate memory usage for processing a CSV file
     * @param {bigint} file_size_bytes
     * @param {number} estimated_rows
     * @returns {bigint}
     */
    static estimate_memory_usage(file_size_bytes, estimated_rows) {
        const ret = wasm.wasmutils_estimate_memory_usage(file_size_bytes, estimated_rows);
        return BigInt.asUintN(64, ret);
    }
}
if (Symbol.dispose) WasmUtils.prototype[Symbol.dispose] = WasmUtils.prototype.free;

const WasmVirtualArrayFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmvirtualarray_free(ptr >>> 0, 1));

export class WasmVirtualArray {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmVirtualArrayFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmvirtualarray_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get length() {
        const ret = wasm.wasmvirtualarray_length(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    getType() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmvirtualarray_getType(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {number} _index
     * @returns {string}
     */
    getValue(_index) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmvirtualarray_getValue(this.__wbg_ptr, _index);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmVirtualArray.prototype[Symbol.dispose] = WasmVirtualArray.prototype.free;

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_Error_e83987f665cf5504 = function(arg0, arg1) {
        const ret = Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_Number_bb48ca12f395cd08 = function(arg0) {
        const ret = Number(arg0);
        return ret;
    };
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_bigint_get_as_i64_f3ebc5a755000afd = function(arg0, arg1) {
        const v = arg1;
        const ret = typeof(v) === 'bigint' ? v : undefined;
        getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg___wbindgen_boolean_get_6d5a1ee65bab5f68 = function(arg0) {
        const v = arg0;
        const ret = typeof(v) === 'boolean' ? v : undefined;
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
    };
    imports.wbg.__wbg___wbindgen_copy_to_typed_array_33fbd71146904370 = function(arg0, arg1, arg2) {
        new Uint8Array(arg2.buffer, arg2.byteOffset, arg2.byteLength).set(getArrayU8FromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg___wbindgen_debug_string_df47ffb5e35e6763 = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_in_bb933bd9e1b3bc0f = function(arg0, arg1) {
        const ret = arg0 in arg1;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_bigint_cb320707dcd35f0b = function(arg0) {
        const ret = typeof(arg0) === 'bigint';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_function_ee8a6c5833c90377 = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_object_c818261d21f283a4 = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_2d472862bd29a478 = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_jsval_eq_6b13ab83478b1c50 = function(arg0, arg1) {
        const ret = arg0 === arg1;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_jsval_loose_eq_b664b38a2f582147 = function(arg0, arg1) {
        const ret = arg0 == arg1;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_memory_27faa6e0e73716bd = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_number_get_a20bf9b85341449d = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg___wbindgen_string_get_e4f06c90489ad01b = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_throw_b855445ff6a94295 = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_buffer_83ef46cd84885a60 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_byteLength_eb3438154e05658e = function(arg0) {
        const ret = arg0.byteLength;
        return ret;
    };
    imports.wbg.__wbg_call_9f64d39129ed27c4 = function(arg0, arg1, arg2, arg3) {
        arg0.call(arg1, getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_call_e45d2cf9fc925fcf = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg0.call(arg1, arg2, arg3);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_e762c39fa8ea36bf = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_done_2042aa2670fb1db1 = function(arg0) {
        const ret = arg0.done;
        return ret;
    };
    imports.wbg.__wbg_entries_e171b586f8f6bdbf = function(arg0) {
        const ret = Object.entries(arg0);
        return ret;
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_error_a7f8fbb0523dae15 = function(arg0) {
        console.error(arg0);
    };
    imports.wbg.__wbg_getRandomValues_1c61fac11405ffdc = function() { return handleError(function (arg0, arg1) {
        globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
    }, arguments) };
    imports.wbg.__wbg_get_7bed016f185add81 = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_get_efcb449f58ec27c2 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_with_ref_key_1dc361bd10053bfe = function(arg0, arg1) {
        const ret = arg0[arg1];
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_70beb1189ca63b38 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Map_8579b5e2ab5437c7 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Map;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Memory_e903cd01d101b9a1 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof WebAssembly.Memory;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_20c8e73002f7af98 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_96e0af9891d0945d = function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    };
    imports.wbg.__wbg_isSafeInteger_d216eda7911dde36 = function(arg0) {
        const ret = Number.isSafeInteger(arg0);
        return ret;
    };
    imports.wbg.__wbg_iterator_e5822695327a3c39 = function() {
        const ret = Symbol.iterator;
        return ret;
    };
    imports.wbg.__wbg_length_69bca3cb64fc8748 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_cdd215e10d9dd507 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_log_73132eb13c1cfef8 = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_log_8cec76766b8c0e33 = function(arg0) {
        console.log(arg0);
    };
    imports.wbg.__wbg_new_1acc0b6eea89d040 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_5a79be3ab53b8aa5 = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_new_e17d9f43105b08be = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_from_slice_92f4d78ca282a2d2 = function(arg0, arg1) {
        const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_with_length_31d2669cb75c5215 = function(arg0) {
        const ret = new Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_with_length_b0bfefdb7afb8ab9 = function(arg0) {
        const ret = new Int32Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_with_length_cd045ed0a87d4dd6 = function(arg0) {
        const ret = new Float64Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_with_length_df9a19d083a824bc = function(arg0) {
        const ret = new Uint32Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_next_020810e0ae8ebcb0 = function() { return handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_next_2c826fe5dfec6b6a = function(arg0) {
        const ret = arg0.next;
        return ret;
    };
    imports.wbg.__wbg_now_793306c526e2e3b6 = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_prototypesetcall_2a6620b6922694b2 = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
    };
    imports.wbg.__wbg_push_df81a39d04db858c = function(arg0, arg1) {
        const ret = arg0.push(arg1);
        return ret;
    };
    imports.wbg.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
        arg0[arg1] = arg2;
    };
    imports.wbg.__wbg_set_c213c871859d6500 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_set_c2abbebe8b9ebee1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_index_6779caf19d000661 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2 >>> 0;
    };
    imports.wbg.__wbg_set_index_a0c01b257dd824f8 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_set_index_ae288d9699f45df6 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_value_692627309814bb8c = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_4625c577ab2ec9ee = function(arg0) {
        // Cast intrinsic for `U64 -> Externref`.
        const ret = BigInt.asUintN(64, arg0);
        return ret;
    };
    imports.wbg.__wbindgen_cast_9ae0607507abb057 = function(arg0) {
        // Cast intrinsic for `I64 -> Externref`.
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
        // Cast intrinsic for `F64 -> Externref`.
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_externrefs;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedBigInt64ArrayMemory0 = null;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('neutrino_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
