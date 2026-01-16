import { _ as __nuxt_component_0, f as fetchDefaults, d as useAsyncData, c as useNuxtApp } from './server.mjs';
import { c as cn } from './cn-H80jjgLf.mjs';
import { a as useSupabaseClient } from './useSupabase-BKfis0hW.mjs';
import { u as useToast } from './useToast-Cu2d6NoU.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1, b as ssrInterpolate_1, l as ssrIncludeBooleanAttr, f as ssrRenderList_1, k as ssrRenderTeleport_1, h as ssrRenderClass_1, i as ssrRenderAttr_1, j as ssrRenderStyle_1 } from '../routes/renderer.mjs';
import '../_/nitro.mjs';
import 'crypto';
import 'util';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:crypto';
import 'node:util';
import 'node:path';
import 'node:process';
import 'node:tty';
import 'node:fs';
import 'node:stream';

const defaults = Object.freeze({
  ignoreUnknown: false,
  respectType: false,
  respectFunctionNames: false,
  respectFunctionProperties: false,
  unorderedObjects: true,
  unorderedArrays: false,
  unorderedSets: false,
  excludeKeys: void 0,
  excludeValues: void 0,
  replacer: void 0
});
function objectHash(object, options) {
  if (options) {
    options = { ...defaults, ...options };
  } else {
    options = defaults;
  }
  const hasher = createHasher(options);
  hasher.dispatch(object);
  return hasher.toString();
}
const defaultPrototypesKeys = Object.freeze([
  "prototype",
  "__proto__",
  "constructor"
]);
function createHasher(options) {
  let buff = "";
  let context = /* @__PURE__ */ new Map();
  const write = (str) => {
    buff += str;
  };
  return {
    toString() {
      return buff;
    },
    getContext() {
      return context;
    },
    dispatch(value) {
      if (options.replacer) {
        value = options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    },
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      if (objectLength < 10) {
        objType = "unknown:[" + objString + "]";
      } else {
        objType = objString.slice(8, objectLength - 1);
      }
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = context.get(object)) === void 0) {
        context.set(object, context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write("buffer:");
        return write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else if (!options.ignoreUnknown) {
          this.unkown(object, objType);
        }
      } else {
        let keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        let extraKeys = [];
        if (options.respectType !== false && !isNativeFunction(object)) {
          extraKeys = defaultPrototypesKeys;
        }
        if (options.excludeKeys) {
          keys = keys.filter((key) => {
            return !options.excludeKeys(key);
          });
          extraKeys = extraKeys.filter((key) => {
            return !options.excludeKeys(key);
          });
        }
        write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          write(":");
          if (!options.excludeValues) {
            this.dispatch(object[key]);
          }
          write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    },
    array(arr, unordered) {
      unordered = unordered === void 0 ? options.unorderedArrays !== false : unordered;
      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = createHasher(options);
        hasher.dispatch(entry);
        for (const [key, value] of hasher.getContext()) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    },
    date(date) {
      return write("date:" + date.toJSON());
    },
    symbol(sym) {
      return write("symbol:" + sym.toString());
    },
    unkown(value, type) {
      write(type);
      if (!value) {
        return;
      }
      write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          Array.from(value.entries()),
          true
          /* ordered */
        );
      }
    },
    error(err) {
      return write("error:" + err.toString());
    },
    boolean(bool) {
      return write("bool:" + bool);
    },
    string(string) {
      write("string:" + string.length + ":");
      write(string);
    },
    function(fn) {
      write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
      if (options.respectFunctionNames !== false) {
        this.dispatch("function-name:" + String(fn.name));
      }
      if (options.respectFunctionProperties) {
        this.object(fn);
      }
    },
    number(number) {
      return write("number:" + number);
    },
    xml(xml) {
      return write("xml:" + xml.toString());
    },
    null() {
      return write("Null");
    },
    undefined() {
      return write("Undefined");
    },
    regexp(regex) {
      return write("regex:" + regex.toString());
    },
    uint8array(arr) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint8clampedarray(arr) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int8array(arr) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint16array(arr) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int16array(arr) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint32array(arr) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int32array(arr) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float32array(arr) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float64array(arr) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    arraybuffer(arr) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    url(url) {
      return write("url:" + url.toString());
    },
    map(map) {
      write("map:");
      const arr = [...map];
      return this.array(arr, options.unorderedSets !== false);
    },
    set(set) {
      write("set:");
      const arr = [...set];
      return this.array(arr, options.unorderedSets !== false);
    },
    file(file) {
      write("file:");
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
    },
    blob() {
      if (options.ignoreUnknown) {
        return write("[blob]");
      }
      throw new Error(
        'Hashing Blob objects is currently not supported\nUse "options.replacer" or "options.ignoreUnknown"\n'
      );
    },
    domwindow() {
      return write("domwindow");
    },
    bigint(number) {
      return write("bigint:" + number.toString());
    },
    /* Node.js standard native objects */
    process() {
      return write("process");
    },
    timer() {
      return write("timer");
    },
    pipe() {
      return write("pipe");
    },
    tcp() {
      return write("tcp");
    },
    udp() {
      return write("udp");
    },
    tty() {
      return write("tty");
    },
    statwatcher() {
      return write("statwatcher");
    },
    securecontext() {
      return write("securecontext");
    },
    connection() {
      return write("connection");
    },
    zlib() {
      return write("zlib");
    },
    context() {
      return write("context");
    },
    nodescript() {
      return write("nodescript");
    },
    httpparser() {
      return write("httpparser");
    },
    dataview() {
      return write("dataview");
    },
    signal() {
      return write("signal");
    },
    fsevent() {
      return write("fsevent");
    },
    tlswrap() {
      return write("tlswrap");
    }
  };
}
const nativeFunc = "[native code] }";
const nativeFuncLength = nativeFunc.length;
function isNativeFunction(f) {
  if (typeof f !== "function") {
    return false;
  }
  return Function.prototype.toString.call(f).slice(-nativeFuncLength) === nativeFunc;
}

class WordArray {
  words;
  sigBytes;
  constructor(words, sigBytes) {
    words = this.words = words || [];
    this.sigBytes = sigBytes === void 0 ? words.length * 4 : sigBytes;
  }
  toString(encoder) {
    return (encoder || Hex).stringify(this);
  }
  concat(wordArray) {
    this.clamp();
    if (this.sigBytes % 4) {
      for (let i = 0; i < wordArray.sigBytes; i++) {
        const thatByte = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
        this.words[this.sigBytes + i >>> 2] |= thatByte << 24 - (this.sigBytes + i) % 4 * 8;
      }
    } else {
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[this.sigBytes + j >>> 2] = wordArray.words[j >>> 2];
      }
    }
    this.sigBytes += wordArray.sigBytes;
    return this;
  }
  clamp() {
    this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8;
    this.words.length = Math.ceil(this.sigBytes / 4);
  }
  clone() {
    return new WordArray([...this.words]);
  }
}
const Hex = {
  stringify(wordArray) {
    const hexChars = [];
    for (let i = 0; i < wordArray.sigBytes; i++) {
      const bite = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      hexChars.push((bite >>> 4).toString(16), (bite & 15).toString(16));
    }
    return hexChars.join("");
  }
};
const Base64 = {
  stringify(wordArray) {
    const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const base64Chars = [];
    for (let i = 0; i < wordArray.sigBytes; i += 3) {
      const byte1 = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      const byte2 = wordArray.words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
      const byte3 = wordArray.words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
      const triplet = byte1 << 16 | byte2 << 8 | byte3;
      for (let j = 0; j < 4 && i * 8 + j * 6 < wordArray.sigBytes * 8; j++) {
        base64Chars.push(keyStr.charAt(triplet >>> 6 * (3 - j) & 63));
      }
    }
    return base64Chars.join("");
  }
};
const Latin1 = {
  parse(latin1Str) {
    const latin1StrLength = latin1Str.length;
    const words = [];
    for (let i = 0; i < latin1StrLength; i++) {
      words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
    }
    return new WordArray(words, latin1StrLength);
  }
};
const Utf8 = {
  parse(utf8Str) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  }
};
class BufferedBlockAlgorithm {
  _data = new WordArray();
  _nDataBytes = 0;
  _minBufferSize = 0;
  blockSize = 512 / 32;
  reset() {
    this._data = new WordArray();
    this._nDataBytes = 0;
  }
  _append(data) {
    if (typeof data === "string") {
      data = Utf8.parse(data);
    }
    this._data.concat(data);
    this._nDataBytes += data.sigBytes;
  }
  _doProcessBlock(_dataWords, _offset) {
  }
  _process(doFlush) {
    let processedWords;
    let nBlocksReady = this._data.sigBytes / (this.blockSize * 4);
    if (doFlush) {
      nBlocksReady = Math.ceil(nBlocksReady);
    } else {
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    }
    const nWordsReady = nBlocksReady * this.blockSize;
    const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += this.blockSize) {
        this._doProcessBlock(this._data.words, offset);
      }
      processedWords = this._data.words.splice(0, nWordsReady);
      this._data.sigBytes -= nBytesReady;
    }
    return new WordArray(processedWords, nBytesReady);
  }
}
class Hasher extends BufferedBlockAlgorithm {
  update(messageUpdate) {
    this._append(messageUpdate);
    this._process();
    return this;
  }
  finalize(messageUpdate) {
    if (messageUpdate) {
      this._append(messageUpdate);
    }
  }
}

const H = [
  1779033703,
  -1150833019,
  1013904242,
  -1521486534,
  1359893119,
  -1694144372,
  528734635,
  1541459225
];
const K = [
  1116352408,
  1899447441,
  -1245643825,
  -373957723,
  961987163,
  1508970993,
  -1841331548,
  -1424204075,
  -670586216,
  310598401,
  607225278,
  1426881987,
  1925078388,
  -2132889090,
  -1680079193,
  -1046744716,
  -459576895,
  -272742522,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  -1740746414,
  -1473132947,
  -1341970488,
  -1084653625,
  -958395405,
  -710438585,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  -2117940946,
  -1838011259,
  -1564481375,
  -1474664885,
  -1035236496,
  -949202525,
  -778901479,
  -694614492,
  -200395387,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  -2067236844,
  -1933114872,
  -1866530822,
  -1538233109,
  -1090935817,
  -965641998
];
const W = [];
class SHA256 extends Hasher {
  _hash = new WordArray([...H]);
  /**
   * Resets the internal state of the hash object to initial values.
   */
  reset() {
    super.reset();
    this._hash = new WordArray([...H]);
  }
  _doProcessBlock(M, offset) {
    const H2 = this._hash.words;
    let a = H2[0];
    let b = H2[1];
    let c = H2[2];
    let d = H2[3];
    let e = H2[4];
    let f = H2[5];
    let g = H2[6];
    let h = H2[7];
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W[i] = M[offset + i] | 0;
      } else {
        const gamma0x = W[i - 15];
        const gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
        const gamma1x = W[i - 2];
        const gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
      }
      const ch = e & f ^ ~e & g;
      const maj = a & b ^ a & c ^ b & c;
      const sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
      const sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
      const t1 = h + sigma1 + ch + K[i] + W[i];
      const t2 = sigma0 + maj;
      h = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    H2[0] = H2[0] + a | 0;
    H2[1] = H2[1] + b | 0;
    H2[2] = H2[2] + c | 0;
    H2[3] = H2[3] + d | 0;
    H2[4] = H2[4] + e | 0;
    H2[5] = H2[5] + f | 0;
    H2[6] = H2[6] + g | 0;
    H2[7] = H2[7] + h | 0;
  }
  /**
   * Finishes the hash calculation and returns the hash as a WordArray.
   *
   * @param {string} messageUpdate - Additional message content to include in the hash.
   * @returns {WordArray} The finalised hash as a WordArray.
   */
  finalize(messageUpdate) {
    super.finalize(messageUpdate);
    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = this._data.sigBytes * 8;
    this._data.words[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(
      nBitsTotal / 4294967296
    );
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
    this._data.sigBytes = this._data.words.length * 4;
    this._process();
    return this._hash;
  }
}
function sha256base64(message) {
  return new SHA256().finalize(message).toString(Base64);
}

function hash(object, options = {}) {
  const hashed = typeof object === "string" ? object : objectHash(object, options);
  return sha256base64(hashed).slice(0, 10);
}

const _sfc_main$6 = /* @__PURE__ */ vueExports.defineComponent({
  __name: "Skeleton",
  __ssrInlineRender: true,
  props: {
    class: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({
        class: vueExports.unref(cn)("animate-pulse rounded-md bg-muted", props.class)
      }, _ctx.$attrs, _attrs))}></div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/Skeleton.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "-";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const getFileIcon = (ext) => {
  if (!ext) return "lucide:file";
  const map = {
    png: "lucide:image",
    jpg: "lucide:image",
    jpeg: "lucide:image",
    gif: "lucide:image",
    webp: "lucide:image",
    pdf: "lucide:file-text",
    doc: "lucide:file-text",
    docx: "lucide:file-text",
    xls: "lucide:file-spreadsheet",
    xlsx: "lucide:file-spreadsheet",
    mp4: "lucide:file-video",
    mkv: "lucide:file-video",
    avi: "lucide:file-video",
    mov: "lucide:file-video",
    mp3: "lucide:file-audio",
    wav: "lucide:file-audio",
    flac: "lucide:file-audio",
    zip: "lucide:file-archive",
    rar: "lucide:file-archive",
    "7z": "lucide:file-archive"
  };
  return map[ext.toLowerCase()] || "lucide:file";
};
const getIconColor = (ext) => {
  const colorMap = {
    pdf: "text-red-600 bg-red-50 dark:bg-red-900/30",
    doc: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
    docx: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
    xls: "text-green-600 bg-green-50 dark:bg-green-900/30",
    xlsx: "text-green-600 bg-green-50 dark:bg-green-900/30",
    jpg: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
    jpeg: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
    png: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
    gif: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
    webp: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
    mp4: "text-pink-600 bg-pink-50 dark:bg-pink-900/30",
    mkv: "text-pink-600 bg-pink-50 dark:bg-pink-900/30",
    avi: "text-pink-600 bg-pink-50 dark:bg-pink-900/30",
    mov: "text-pink-600 bg-pink-50 dark:bg-pink-900/30",
    mp3: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30",
    wav: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30",
    flac: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30",
    zip: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
    rar: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
    "7z": "text-amber-600 bg-amber-50 dark:bg-amber-900/30"
  };
  return colorMap[(ext == null ? void 0 : ext.toLowerCase()) || ""] || "text-gray-600 bg-gray-50 dark:bg-gray-900/30";
};
const getExpiryColor = (dateStr) => {
  const now = /* @__PURE__ */ new Date();
  const expiry = new Date(dateStr);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  if (diffDays <= 3) return "text-red-500 font-semibold";
  if (diffDays <= 7) return "text-orange-500";
  return "text-muted-foreground";
};
const getExpiryDistance = (dateStr) => {
  if (!dateStr) return "";
  const now = /* @__PURE__ */ new Date();
  const expiry = new Date(dateStr);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Expires today";
  if (diffDays === 1) return "Expires tomorrow";
  return `${diffDays} days left`;
};
const isVideoFile = (ext) => {
  if (!ext) return false;
  return ["mp4", "mkv", "avi", "mov", "webm", "wmv", "flv"].includes(ext.toLowerCase());
};
const isArchiveFile = (ext) => {
  if (!ext) return false;
  return ["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext.toLowerCase());
};
const isImageFile = (ext) => {
  if (!ext) return false;
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext.toLowerCase());
};
const isAudioFile = (ext) => {
  if (!ext) return false;
  return ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma"].includes(ext.toLowerCase());
};
function useRequestEvent(nuxtApp = useNuxtApp()) {
  var _a;
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
function useRequestFetch() {
  var _a;
  return ((_a = useRequestEvent()) == null ? void 0 : _a.$fetch) || globalThis.$fetch;
}
function useFetch(request, arg1, arg2) {
  const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _request = vueExports.computed(() => vueExports.toValue(request));
  const _key = opts.key || hash([autoKey, typeof _request.value === "string" ? _request.value : "", ...generateOptionSegments(opts)]);
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useFetch] key must be a string: " + _key);
  }
  const key = _key === autoKey ? "$f" + _key : _key;
  if (!opts.baseURL && typeof _request.value === "string" && (_request.value[0] === "/" && _request.value[1] === "/")) {
    throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
  }
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch: watch2,
    immediate,
    getCachedData,
    deep,
    dedupe,
    ...fetchOptions
  } = opts;
  const _fetchOptions = vueExports.reactive({
    ...fetchDefaults,
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  });
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    immediate,
    getCachedData,
    deep,
    dedupe,
    watch: watch2 === false ? [] : [_fetchOptions, _request, ...watch2 || []]
  };
  let controller;
  const asyncData = useAsyncData(key, () => {
    var _a;
    (_a = controller == null ? void 0 : controller.abort) == null ? void 0 : _a.call(controller, new DOMException("Request aborted as another request to the same endpoint was initiated.", "AbortError"));
    controller = typeof AbortController !== "undefined" ? new AbortController() : {};
    const timeoutLength = vueExports.toValue(opts.timeout);
    let timeoutId;
    if (timeoutLength) {
      timeoutId = setTimeout(() => controller.abort(new DOMException("Request aborted due to timeout.", "AbortError")), timeoutLength);
      controller.signal.onabort = () => clearTimeout(timeoutId);
    }
    let _$fetch = opts.$fetch || globalThis.$fetch;
    if (!opts.$fetch) {
      const isLocalFetch = typeof _request.value === "string" && _request.value[0] === "/" && (!vueExports.toValue(opts.baseURL) || vueExports.toValue(opts.baseURL)[0] === "/");
      if (isLocalFetch) {
        _$fetch = useRequestFetch();
      }
    }
    return _$fetch(_request.value, { signal: controller.signal, ..._fetchOptions }).finally(() => {
      clearTimeout(timeoutId);
    });
  }, _asyncDataOptions);
  return asyncData;
}
function generateOptionSegments(opts) {
  var _a;
  const segments = [
    ((_a = vueExports.toValue(opts.method)) == null ? void 0 : _a.toUpperCase()) || "GET",
    vueExports.toValue(opts.baseURL)
  ];
  for (const _obj of [opts.params || opts.query]) {
    const obj = vueExports.toValue(_obj);
    if (!obj) {
      continue;
    }
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[vueExports.toValue(key)] = vueExports.toValue(value);
    }
    segments.push(unwrapped);
  }
  return segments;
}
async function useFileBrowser() {
  const supabase = useSupabaseClient();
  const searchQuery = vueExports.ref("");
  const sortBy = vueExports.ref("modified");
  const viewMode = vueExports.ref("list");
  const currentPage = vueExports.ref(1);
  const currentPath = vueExports.ref("/");
  const currentVirtualFolder = vueExports.ref(null);
  const pageSize = 50;
  const { data, pending, error, refresh } = await useFetch("/api/my-files", {
    server: false,
    async onRequest({ options }) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session == null ? void 0 : session.access_token) {
        const existingHeaders = options.headers || {};
        options.headers = {
          ...existingHeaders,
          Authorization: `Bearer ${session.access_token}`
        };
      }
    }
  }, "$Lz1Zhj65EL");
  const files = vueExports.computed(() => data.value || []);
  const virtualFolders = vueExports.computed(() => {
    if (!data.value) return [];
    const folders = /* @__PURE__ */ new Set();
    data.value.forEach((file) => {
      if (file.virtualFolder) folders.add(file.virtualFolder);
    });
    return Array.from(folders).map((name) => {
      var _a;
      return {
        id: `vf-${name}`,
        name,
        path: `/virtual/${name}`,
        size: 0,
        modified: (/* @__PURE__ */ new Date()).toISOString(),
        extension: null,
        accountId: "",
        type: "folder",
        isVirtual: true,
        fileCount: ((_a = data.value) == null ? void 0 : _a.filter((f) => f.virtualFolder === name).length) || 0
      };
    });
  });
  const filteredFiles = vueExports.computed(() => {
    if (!data.value) return [];
    if (currentVirtualFolder.value) {
      return data.value.filter((file) => file.virtualFolder === currentVirtualFolder.value);
    }
    const path = currentPath.value;
    if (path === "/") {
      const persistentFolders = data.value.filter((item) => item.isVirtualFolder === true);
      const regularItems = data.value.filter((item) => !item.isVirtualFolder);
      const rootFiles = regularItems.filter((file) => !file.virtualFolder);
      const vFolders = virtualFolders.value;
      const mergedMap = /* @__PURE__ */ new Map();
      persistentFolders.forEach((folder) => {
        mergedMap.set(folder.name, { ...folder, fileCount: 0, isVirtual: false });
      });
      vFolders.forEach((vf) => {
        if (mergedMap.has(vf.name)) {
          const existing = mergedMap.get(vf.name);
          existing.fileCount = vf.fileCount;
          existing.isVirtual = true;
        } else {
          mergedMap.set(vf.name, vf);
        }
      });
      return [...Array.from(mergedMap.values()), ...rootFiles.filter((f) => f.type !== "folder")];
    }
    return data.value.filter((file) => {
      if (!file.path.startsWith(path + "/")) return false;
      const subPath = file.path.substring(path.length + 1);
      return !subPath.includes("/");
    });
  });
  const sortedFiles = vueExports.computed(() => {
    const filtered = filteredFiles.value.filter(
      (f) => f.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    return filtered.sort((a, b) => {
      if (a.type === b.type) {
        return new Date(b.modified || 0).getTime() - new Date(a.modified || 0).getTime();
      }
      return a.type === "folder" ? -1 : 1;
    });
  });
  const totalPages = vueExports.computed(() => Math.ceil(sortedFiles.value.length / pageSize));
  const paginatedFiles = vueExports.computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return sortedFiles.value.slice(start, start + pageSize);
  });
  const navigateToFolder = (path) => currentPath.value = path;
  const navigateToVirtualFolder = (folderName) => currentVirtualFolder.value = folderName;
  const breadcrumbs = vueExports.computed(() => {
    const crumbs = [{ name: "Home", path: "/", isVirtual: false }];
    if (currentVirtualFolder.value) {
      crumbs.push({ name: currentVirtualFolder.value, path: `/virtual/${currentVirtualFolder.value}`, isVirtual: true });
      return crumbs;
    }
    const parts = currentPath.value.split("/").filter((p) => p);
    let current = "/";
    parts.forEach((part) => {
      current = current === "/" ? `/${part}` : `${current}/${part}`;
      crumbs.push({ name: part, path: current, isVirtual: false });
    });
    return crumbs;
  });
  const handleBreadcrumbClick = (crumb) => {
    if (crumb.path === "/") {
      currentVirtualFolder.value = null;
      currentPath.value = "/";
    } else if (!crumb.isVirtual) {
      currentVirtualFolder.value = null;
      navigateToFolder(crumb.path);
    }
  };
  const handleFolderClick = (file) => {
    if (file.isVirtualFolder || file.isVirtual || file.isPersistent) {
      navigateToVirtualFolder(file.name);
    } else if (file.type === "folder") {
      navigateToFolder(file.path);
    }
  };
  vueExports.watch([searchQuery, sortBy], () => currentPage.value = 1);
  return {
    // State
    searchQuery,
    sortBy,
    viewMode,
    currentPage,
    currentPath,
    currentVirtualFolder,
    totalPages,
    // Data
    files,
    pending,
    error,
    refresh,
    // Computed
    virtualFolders,
    filteredFiles,
    sortedFiles,
    paginatedFiles,
    breadcrumbs,
    // Actions
    navigateToFolder,
    navigateToVirtualFolder,
    handleBreadcrumbClick,
    handleFolderClick
  };
}
function useFileSelection(files) {
  const selectedFiles = vueExports.ref(/* @__PURE__ */ new Set());
  const isAllSelected = vueExports.computed(() => {
    const currentFiles = files.value.filter((f) => f.type !== "folder");
    return currentFiles.length > 0 && currentFiles.every((f) => selectedFiles.value.has(f.id));
  });
  const isPartiallySelected = vueExports.computed(() => {
    const currentFiles = files.value.filter((f) => f.type !== "folder");
    const selectedCount2 = currentFiles.filter((f) => selectedFiles.value.has(f.id)).length;
    return selectedCount2 > 0 && selectedCount2 < currentFiles.length;
  });
  const selectedCount = vueExports.computed(() => selectedFiles.value.size);
  const toggleSelectAll = () => {
    const currentFiles = files.value.filter((f) => f.type !== "folder");
    if (isAllSelected.value) {
      currentFiles.forEach((f) => selectedFiles.value.delete(f.id));
    } else {
      currentFiles.forEach((f) => selectedFiles.value.add(f.id));
    }
    selectedFiles.value = new Set(selectedFiles.value);
  };
  const toggleFileSelection = (file) => {
    if (file.type === "folder") return;
    if (selectedFiles.value.has(file.id)) {
      selectedFiles.value.delete(file.id);
    } else {
      selectedFiles.value.add(file.id);
    }
    selectedFiles.value = new Set(selectedFiles.value);
  };
  const clearSelection = () => {
    selectedFiles.value = /* @__PURE__ */ new Set();
  };
  return {
    selectedFiles,
    isAllSelected,
    isPartiallySelected,
    selectedCount,
    toggleSelectAll,
    toggleFileSelection,
    clearSelection
  };
}
function useFileDragDrop(refreshFiles) {
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const draggedFile = vueExports.ref(null);
  const dropTargetId = vueExports.ref(null);
  const isMoving = vueExports.ref(false);
  const isLongPress = vueExports.ref(false);
  const longPressTimer = vueExports.ref(null);
  const startLongPress = (e, file) => {
    if (e.button !== 0) return;
    const target = e.currentTarget;
    longPressTimer.value = setTimeout(() => {
      isLongPress.value = true;
      if ((void 0).vibrate) (void 0).vibrate(50);
      target.classList.add("ring-2", "ring-blue-400", "scale-[1.02]");
    }, 400);
  };
  const cancelLongPress = (e) => {
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value);
      longPressTimer.value = null;
    }
    if (isLongPress.value) {
      if (e && e.currentTarget) {
        e.currentTarget.classList.remove("ring-2", "ring-blue-400", "scale-[1.02]");
      }
    }
    if (!draggedFile.value) {
      isLongPress.value = false;
    }
  };
  const handleDragStart = (event, file) => {
    if (!isLongPress.value) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    draggedFile.value = file;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/x-file-move", file.id);
    }
    const target = event.target;
    target.style.opacity = "0.5";
  };
  const handleDragEnd = (event) => {
    draggedFile.value = null;
    dropTargetId.value = null;
    isLongPress.value = false;
    const target = event.target;
    target.style.opacity = "1";
    target.classList.remove("ring-2", "ring-blue-400", "scale-[1.02]");
  };
  const handleDragOver = (event, file) => {
    if (!draggedFile.value) return;
    if (file.type !== "folder") return;
    if (draggedFile.value.id === file.id) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    dropTargetId.value = file.id;
  };
  const handleDragLeave = (_event) => {
    dropTargetId.value = null;
  };
  const moveFile = async (file, targetFolder) => {
    var _a;
    isMoving.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const newVirtualFolder = targetFolder.path === "/" ? null : targetFolder.name;
      console.log("[Move] Organizing file:", {
        fileId: file.id,
        fileName: file.name,
        targetFolder: newVirtualFolder
      });
      await $fetch("/api/files/update-folder", {
        method: "POST",
        body: {
          fileId: file.id,
          virtualFolder: newVirtualFolder
        },
        headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : void 0
      });
      console.log(`[Move] Success: "${file.name}" -> "${targetFolder.name}"`);
      toast.success(`Moved "${file.name}" to "${targetFolder.name}"`);
      await refreshFiles();
    } catch (err) {
      console.error("[Move] Failed:", err);
      toast.error("Failed to organize file", ((_a = err.data) == null ? void 0 : _a.statusMessage) || err.message || "Unknown error");
    } finally {
      isMoving.value = false;
    }
  };
  const handleFileDrop = async (event, targetFolder) => {
    event.preventDefault();
    dropTargetId.value = null;
    if (!draggedFile.value) return;
    if (targetFolder.type !== "folder") return;
    if (draggedFile.value.id === targetFolder.id) return;
    if (targetFolder.path.startsWith(draggedFile.value.path + "/")) {
      toast.error("Cannot move a folder into itself");
      draggedFile.value = null;
      return;
    }
    await moveFile(draggedFile.value, targetFolder);
    draggedFile.value = null;
  };
  const handleBreadcrumbDrop = async (event, crumb) => {
    const target = event.currentTarget;
    target.classList.remove("bg-blue-100", "text-blue-600", "dark:bg-blue-900/40", "dark:text-blue-400");
    if (!draggedFile.value) return;
    const targetFolder = {
      id: crumb.path === "/" ? "root" : `vf-${crumb.name}`,
      name: crumb.name,
      path: crumb.path,
      type: "folder",
      isVirtual: crumb.isVirtual,
      size: 0,
      modified: "",
      extension: null,
      accountId: ""
    };
    await moveFile(draggedFile.value, targetFolder);
    draggedFile.value = null;
  };
  const removeFromFolder = async (file) => {
    var _a;
    if (!file.virtualFolder) return;
    isMoving.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await $fetch("/api/files/update-folder", {
        method: "POST",
        body: {
          fileId: file.id,
          virtualFolder: null
          // Remove from folder
        },
        headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : void 0
      });
      console.log(`[Move] Removed "${file.name}" from folder`);
      toast.success(`Removed "${file.name}" from folder`);
      await refreshFiles();
    } catch (err) {
      console.error("[Move] Failed to remove from folder:", err);
      toast.error("Failed to remove from folder", ((_a = err.data) == null ? void 0 : _a.statusMessage) || err.message || "Unknown error");
    } finally {
      isMoving.value = false;
    }
  };
  return {
    draggedFile,
    dropTargetId,
    isMoving,
    isLongPress,
    startLongPress,
    cancelLongPress,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleFileDrop,
    handleBreadcrumbDrop,
    removeFromFolder
  };
}
function useFileUpload(currentPath, refreshFiles) {
  useToast();
  const supabase = useSupabaseClient();
  const isDragging = vueExports.ref(false);
  const isUploading = vueExports.ref(false);
  const uploadProgress = vueExports.ref(0);
  const uploadingFileName = vueExports.ref("");
  const uploadedCount = vueExports.ref(0);
  const totalUploadCount = vueExports.ref(0);
  const uploadError = vueExports.ref("");
  const fileInput = vueExports.ref(null);
  const CHUNK_SIZE = 8 * 1024 * 1024;
  const LARGE_FILE_THRESHOLD = 150 * 1024 * 1024;
  const MAX_RETRIES = 3;
  let wakeLock = null;
  const isOnline = vueExports.ref(true);
  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in void 0) {
        wakeLock = await (void 0).wakeLock.request("screen");
      }
    } catch (err) {
      console.warn("Wake lock not available:", err);
    }
  };
  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  };
  const waitForOnline = (timeoutMs = 3e4) => {
    return Promise.resolve(true);
  };
  const withRetry = async (fn, maxRetries = MAX_RETRIES, delayMs = 1e3) => {
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!isOnline.value) {
          const backOnline = await waitForOnline();
          if (!backOnline) throw new Error("Network offline timeout");
        }
        return await fn();
      } catch (err) {
        lastError = err;
        if (!(void 0).onLine) await waitForOnline();
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
        }
      }
    }
    throw lastError;
  };
  const sanitizeFilename = (name) => name.replace(/[<>:"/\\|?*]/g, "_");
  const uploadSmallFile = async (file, accessToken, uploadPath, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new (void 0)();
      xhr.open("POST", "https://content.dropboxapi.com/2/files/upload");
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.setRequestHeader("Dropbox-API-Arg", JSON.stringify({
        path: uploadPath,
        mode: "add",
        autorename: true,
        mute: false
      }));
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total * 100);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve({ path_display: uploadPath });
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(file);
    });
  };
  const uploadLargeFile = async (file, accessToken, uploadPath, onProgress) => {
    const startChunk = file.slice(0, Math.min(CHUNK_SIZE, file.size));
    const startRes = await fetch("https://content.dropboxapi.com/2/files/upload_session/start", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({ close: false }),
        "Content-Type": "application/octet-stream"
      },
      body: startChunk
    });
    if (!startRes.ok) throw new Error(`Start session failed: ${startRes.status}`);
    const startData = await startRes.json();
    const sessionId = startData.session_id;
    let offset = startChunk.size;
    onProgress(offset / file.size * 100);
    while (offset < file.size - CHUNK_SIZE) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      const appendRes = await fetch("https://content.dropboxapi.com/2/files/upload_session/append_v2", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Dropbox-API-Arg": JSON.stringify({
            cursor: { session_id: sessionId, offset },
            close: false
          }),
          "Content-Type": "application/octet-stream"
        },
        body: chunk
      });
      if (!appendRes.ok) throw new Error(`Append failed: ${appendRes.status}`);
      offset += chunk.size;
      onProgress(offset / file.size * 100);
    }
    const finalChunk = file.slice(offset);
    const finishRes = await fetch("https://content.dropboxapi.com/2/files/upload_session/finish", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({
          cursor: { session_id: sessionId, offset },
          commit: { path: uploadPath, mode: "add", autorename: true, mute: false }
        }),
        "Content-Type": "application/octet-stream"
      },
      body: finalChunk
    });
    if (!finishRes.ok) throw new Error(`Finish failed: ${finishRes.status}`);
    const result = await finishRes.json();
    onProgress(100);
    return result;
  };
  const processUpload = async (filesToUpload) => {
    if (filesToUpload.length === 0) return;
    await requestWakeLock();
    isUploading.value = true;
    uploadProgress.value = 0;
    uploadedCount.value = 0;
    totalUploadCount.value = filesToUpload.length;
    uploadError.value = "";
    const failedFiles = [];
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = (session == null ? void 0 : session.access_token) ? { "Authorization": `Bearer ${session.access_token}` } : {};
      const allocation = await withRetry(() => $fetch("/api/upload/allocate", {
        method: "POST",
        headers,
        body: { files: filesToUpload.map((f, i) => ({ index: i, name: f.name, size: f.size })) }
      }));
      if (!allocation.success) throw new Error("Allocation failed");
      const CONCURRENCY_LIMIT = 5;
      const queue = allocation.allocations.map((alloc) => ({ file: filesToUpload[alloc.index], alloc }));
      const fileProgressMap = /* @__PURE__ */ new Map();
      const processSingleFile = async (item) => {
        const { file, alloc } = item;
        const index = filesToUpload.indexOf(file);
        try {
          uploadingFileName.value = file.name;
          const basePath = currentPath.value === "/" ? "/uploads" : currentPath.value;
          const uploadPath = `${basePath}/${sanitizeFilename(file.name)}`;
          const uploadFn = file.size > LARGE_FILE_THRESHOLD ? uploadLargeFile : uploadSmallFile;
          const dropboxResult = await withRetry(
            () => uploadFn(file, alloc.accessToken, uploadPath, (percent) => {
              fileProgressMap.set(index, percent);
              const totalPercent = Array.from(fileProgressMap.values()).reduce((a, b) => a + b, 0);
              uploadProgress.value = totalPercent / filesToUpload.length;
            })
          );
          await withRetry(() => $fetch("/api/dropbox/record-upload", {
            method: "POST",
            headers,
            body: {
              filename: file.name,
              dropboxPath: dropboxResult.path_display || uploadPath,
              size: file.size,
              contentType: file.type || "application/octet-stream",
              dropboxAccountId: alloc.accountId
            }
          }));
          uploadedCount.value++;
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          failedFiles.push(file.name);
        }
      };
      const activePromises = [];
      for (const item of queue) {
        const p = processSingleFile(item).then(() => {
          activePromises.splice(activePromises.indexOf(p), 1);
        });
        activePromises.push(p);
        if (activePromises.length >= CONCURRENCY_LIMIT) await Promise.race(activePromises);
      }
      await Promise.all(activePromises);
      if (failedFiles.length > 0) {
        uploadError.value = `${failedFiles.length} file(s) failed`;
      }
      await refreshFiles();
    } catch (err) {
      uploadError.value = err.message || "Upload failed";
    } finally {
      isUploading.value = false;
      releaseWakeLock();
    }
  };
  const handleExternalDragOver = (e) => {
    var _a;
    if ((_a = e.dataTransfer) == null ? void 0 : _a.types.includes("Files")) {
      isDragging.value = true;
    }
  };
  const handleExternalDragLeave = () => {
    isDragging.value = false;
  };
  const handleDrop = (e) => {
    var _a;
    isDragging.value = false;
    const droppedFiles = (_a = e.dataTransfer) == null ? void 0 : _a.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processUpload(Array.from(droppedFiles));
    }
  };
  const handleFileSelect = (e) => {
    const target = e.target;
    if (target.files && target.files.length > 0) {
      processUpload(Array.from(target.files));
      target.value = "";
    }
  };
  const triggerFileInput = () => {
    var _a;
    (_a = fileInput.value) == null ? void 0 : _a.click();
  };
  return {
    isDragging,
    isUploading,
    uploadProgress,
    uploadingFileName,
    uploadedCount,
    totalUploadCount,
    uploadError,
    fileInput,
    handleExternalDragOver,
    handleExternalDragLeave,
    handleDrop,
    handleFileSelect,
    triggerFileInput
  };
}
function useFilePreview() {
  const supabase = useSupabaseClient();
  const previewTarget = vueExports.ref(null);
  const previewUrl = vueExports.ref(null);
  const isLoadingPreview = vueExports.ref(false);
  const previewError = vueExports.ref(null);
  const openPreview = async (file) => {
    var _a;
    previewTarget.value = file;
    previewUrl.value = null;
    previewError.value = null;
    isLoadingPreview.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await $fetch("/api/dropbox/download", {
        query: { path: file.path, accountId: file.accountId },
        headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      previewUrl.value = response.link;
    } catch (err) {
      previewError.value = ((_a = err.data) == null ? void 0 : _a.message) || err.message;
    } finally {
      isLoadingPreview.value = false;
    }
  };
  const closePreview = () => {
    previewTarget.value = null;
    previewUrl.value = null;
    previewError.value = null;
  };
  const handleExternalLink = (url) => {
    if (!url) return;
    (void 0).open(url, "_blank");
  };
  return {
    previewTarget,
    previewUrl,
    isLoadingPreview,
    previewError,
    openPreview,
    closePreview,
    handleExternalLink
  };
}
function useFileShare() {
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const shareTarget = vueExports.ref(null);
  const shareResult = vueExports.ref(null);
  const isSharing = vueExports.ref(false);
  const copied = vueExports.ref(false);
  const shareTab = vueExports.ref("link");
  const expirationOptions = [{ days: 1, label: "1 Day" }, { days: 7, label: "7 Days" }, { days: "never", label: "Never" }];
  const selectedExpiration = vueExports.ref(7);
  const isGeneratingEmbed = vueExports.ref(false);
  const isDeletingShare = vueExports.ref(false);
  const confirmDeleteShare = vueExports.ref(false);
  const openShareModal = (file) => {
    shareTarget.value = file;
    copied.value = false;
    selectedExpiration.value = 7;
    shareTab.value = "link";
    if (file.shareId && file.shareUrl) {
      shareResult.value = {
        id: file.shareId,
        url: `${(void 0).location.origin}${file.shareUrl}`,
        expiresAt: file.shareExpiresAt || null
      };
    } else {
      shareResult.value = null;
    }
  };
  const closeShareModal = () => {
    shareTarget.value = null;
    shareResult.value = null;
    confirmDeleteShare.value = false;
  };
  const handleShare = async () => {
    if (!shareTarget.value) return;
    isSharing.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const result = await $fetch("/api/shares/create", {
        method: "POST",
        body: {
          accountId: shareTarget.value.accountId,
          filePath: shareTarget.value.path,
          fileName: shareTarget.value.name,
          expirationDays: selectedExpiration.value === "never" ? null : selectedExpiration.value,
          expirationUnit: "days"
        },
        headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      shareResult.value = { id: result.share.id, url: result.share.url, expiresAt: result.share.expiresAt };
      toast.success("Link created");
    } catch (err) {
      toast.error("Share failed", err.message);
    } finally {
      isSharing.value = false;
    }
  };
  const copyShareLink = async () => {
    if (!shareResult.value) return;
    await (void 0).clipboard.writeText(shareResult.value.url);
    copied.value = true;
    setTimeout(() => copied.value = false, 2e3);
  };
  const getEmbedCode = (id) => `<iframe src="${(void 0).location.origin}/embed/${id}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
  const getEmbedUrl = (id) => `${(void 0).location.origin}/embed/${id}`;
  const copyEmbedCode = async (id) => {
    await (void 0).clipboard.writeText(getEmbedCode(id));
    copied.value = true;
    setTimeout(() => copied.value = false, 2e3);
  };
  const copyEmbedUrl = async (id) => {
    await (void 0).clipboard.writeText(getEmbedUrl(id));
    copied.value = true;
    setTimeout(() => copied.value = false, 2e3);
  };
  const generateEmbed = async (file) => {
    isGeneratingEmbed.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const result = await $fetch("/api/embed/generate", {
        method: "POST",
        body: { fileId: file.id },
        headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      shareResult.value = { id: result.shareId, url: result.shareUrl, expiresAt: result.expiresAt };
      shareTab.value = "embed";
    } catch (err) {
      toast.error("Generate embed failed", err.message);
    } finally {
      isGeneratingEmbed.value = false;
    }
  };
  const deleteShareLink = async (refreshFiles) => {
    var _a;
    if (!((_a = shareResult.value) == null ? void 0 : _a.id)) return;
    if (!confirmDeleteShare.value) {
      confirmDeleteShare.value = true;
      return;
    }
    isDeletingShare.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await $fetch(`/api/shares/${shareResult.value.id}`, {
        method: "DELETE",
        headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      await refreshFiles();
      shareResult.value = null;
      closeShareModal();
    } catch (err) {
      toast.error("Delete failed", err.message);
    } finally {
      isDeletingShare.value = false;
      confirmDeleteShare.value = false;
    }
  };
  return {
    shareTarget,
    shareResult,
    isSharing,
    copied,
    shareTab,
    expirationOptions,
    selectedExpiration,
    isGeneratingEmbed,
    isDeletingShare,
    confirmDeleteShare,
    openShareModal,
    closeShareModal,
    handleShare,
    copyShareLink,
    generateEmbed,
    deleteShareLink,
    getEmbedCode,
    getEmbedUrl,
    copyEmbedCode,
    copyEmbedUrl
  };
}
function useFileOperations(files, selectedFiles, refreshFiles, clearSelection) {
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const isCreatingFolder = vueExports.ref(false);
  const newFolderName = vueExports.ref("");
  const folderError = vueExports.ref("");
  const createFolderModalOpen = vueExports.ref(false);
  const createFolder = async () => {
    if (!newFolderName.value.trim()) return;
    isCreatingFolder.value = true;
    folderError.value = "";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await $fetch("/api/folder/create", {
        method: "POST",
        body: { name: newFolderName.value },
        headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      await refreshFiles();
      createFolderModalOpen.value = false;
      newFolderName.value = "";
      toast.success(`Folder "${newFolderName.value}" created`);
    } catch (err) {
      folderError.value = err.statusMessage || "Failed to create folder";
      toast.error("Failed to create folder", folderError.value);
    } finally {
      isCreatingFolder.value = false;
    }
  };
  const isBulkDeleting = vueExports.ref(false);
  const handleBulkDelete = async () => {
    if (selectedFiles.value.size === 0) return;
    const count = selectedFiles.value.size;
    if (!confirm(`Are you sure you want to delete ${count} file(s)?`)) return;
    isBulkDeleting.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const filesToDelete = files.value.filter((f) => selectedFiles.value.has(f.id));
      const results = await Promise.allSettled(filesToDelete.map(
        (file) => $fetch("/api/files/delete", {
          method: "POST",
          body: { fileId: file.id },
          headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : {}
        })
      ));
      const failed = results.filter((r) => r.status === "rejected").length;
      failed > 0 ? toast.warning(`${count - failed} deleted, ${failed} failed`) : toast.success(`${count} deleted`);
      await refreshFiles();
      clearSelection();
    } catch (err) {
      toast.error("Failed to delete files", err.message);
    } finally {
      isBulkDeleting.value = false;
    }
  };
  const isBulkDownloading = vueExports.ref(false);
  const handleBulkDownload = async () => {
    if (selectedFiles.value.size === 0) return;
    isBulkDownloading.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : {};
      const filesToDownload = files.value.filter((f) => selectedFiles.value.has(f.id));
      for (const file of filesToDownload) {
        const response = await $fetch("/api/dropbox/download", {
          method: "POST",
          body: { path: file.path, accountId: file.accountId },
          headers
        });
        const link = (void 0).createElement("a");
        link.href = response.url;
        link.download = file.name;
        link.target = "_blank";
        (void 0).body.appendChild(link);
        link.click();
        (void 0).body.removeChild(link);
        await new Promise((r) => setTimeout(r, 300));
      }
      clearSelection();
    } catch (err) {
      toast.error("Download failed", err.message);
    } finally {
      isBulkDownloading.value = false;
    }
  };
  const handleDownload = async (file) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { link } = await $fetch("/api/dropbox/download", {
        query: { path: file.path, accountId: file.accountId },
        headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      (void 0).open(link, "_blank");
    } catch (err) {
      toast.error("Download failed", err.message);
    }
  };
  const deleteTarget = vueExports.ref(null);
  const isDeleting = vueExports.ref(false);
  const confirmDelete = (file) => {
    var _a;
    if (file.isVirtual || ((_a = file.id) == null ? void 0 : _a.startsWith("vf-"))) {
      alert("Virtual folders cannot be deleted directly.");
      return;
    }
    deleteTarget.value = file;
  };
  const handleDelete = async () => {
    if (!deleteTarget.value) return;
    isDeleting.value = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await $fetch("/api/files/delete", {
        method: "POST",
        body: { fileId: deleteTarget.value.id },
        headers: (session == null ? void 0 : session.access_token) ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      await refreshFiles();
      deleteTarget.value = null;
      toast.success("File deleted");
    } catch (err) {
      toast.error("Delete failed", err.message);
    } finally {
      isDeleting.value = false;
    }
  };
  const copiedFileId = vueExports.ref(null);
  const copyExistingLink = async (file) => {
    if (!file.shareUrl) return;
    await (void 0).clipboard.writeText(`${(void 0).location.origin}${file.shareUrl}`);
    copiedFileId.value = file.id;
    setTimeout(() => copiedFileId.value = null, 2e3);
  };
  return {
    isCreatingFolder,
    newFolderName,
    folderError,
    createFolderModalOpen,
    createFolder,
    isBulkDeleting,
    handleBulkDelete,
    isBulkDownloading,
    handleBulkDownload,
    handleDownload,
    deleteTarget,
    isDeleting,
    confirmDelete,
    handleDelete,
    copiedFileId,
    copyExistingLink
  };
}
const _sfc_main$5 = /* @__PURE__ */ vueExports.defineComponent({
  __name: "FileStats",
  __ssrInlineRender: true,
  props: {
    totalSizeFormatted: {},
    filesCount: {},
    activeSharesCount: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "flex items-center gap-6 text-sm" }, _attrs))}><div class="flex flex-col"><span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Storage</span><span class="font-medium text-foreground">${ssrInterpolate_1(__props.totalSizeFormatted)} Used</span></div><div class="w-px h-8 bg-border hidden md:block"></div><div class="flex flex-col"><span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Files</span><span class="font-medium text-foreground">${ssrInterpolate_1(__props.filesCount)} Items</span></div><div class="w-px h-8 bg-border hidden md:block"></div><div class="flex flex-col"><span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shared</span><span class="font-medium text-foreground">${ssrInterpolate_1(__props.activeSharesCount)} Active</span></div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/drive/FileStats.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ vueExports.defineComponent({
  __name: "FileToolbar",
  __ssrInlineRender: true,
  props: {
    searchQuery: {},
    viewMode: {}
  },
  emits: ["update:searchQuery", "toggle-view", "create-folder", "upload"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "flex items-center gap-3" }, _attrs))}><div class="relative group">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:search",
        class: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
      }, null, _parent));
      _push(`<input${ssrRenderAttr_1("value", __props.searchQuery)} type="text" placeholder="Search files..." class="h-10 pl-9 pr-4 w-full md:w-64 rounded-full border bg-muted/20 hover:bg-muted/40 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"></div><div class="h-6 w-px bg-border mx-1"></div><button class="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"${ssrRenderAttr_1("title", __props.viewMode === "list" ? "Switch to Grid" : "Switch to List")}>`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: __props.viewMode === "list" ? "lucide:layout-grid" : "lucide:align-justify",
        class: "h-5 w-5"
      }, null, _parent));
      _push(`</button><button class="h-10 px-4 rounded-full border border-input hover:bg-accent hover:text-accent-foreground font-medium text-sm transition-all flex items-center gap-2">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:folder-plus",
        class: "h-4 w-4"
      }, null, _parent));
      _push(`<span class="hidden sm:inline">New Folder</span></button><button class="h-10 px-5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-sm transition-all hover:shadow-md flex items-center gap-2 active:scale-95">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:upload",
        class: "h-4 w-4"
      }, null, _parent));
      _push(`<span>Upload</span></button></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/drive/FileToolbar.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ vueExports.defineComponent({
  __name: "Breadcrumbs",
  __ssrInlineRender: true,
  props: {
    breadcrumbs: {},
    isDraggingInternal: { type: Boolean }
  },
  emits: ["navigate", "drop"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<nav${ssrRenderAttrs_1(vueExports.mergeProps({ class: "flex items-center text-sm overflow-x-auto no-scrollbar mask-gradient-right -mx-6 px-6" }, _attrs))}><ol class="flex items-center gap-1 whitespace-nowrap"><!--[-->`);
      ssrRenderList_1(__props.breadcrumbs, (crumb, idx) => {
        _push(`<li class="flex items-center">`);
        if (idx > 0) {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:chevron-right",
            class: "h-4 w-4 text-muted-foreground mx-1"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="${ssrRenderClass_1([idx === __props.breadcrumbs.length - 1 ? "text-foreground cursor-default pointer-events-none" : "text-muted-foreground hover:text-foreground", "hover:bg-muted px-2 py-1 rounded-md transition-colors font-medium flex items-center gap-1"])}">`);
        if (idx === 0) {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:home",
            class: "h-4 w-4"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (idx === 0) {
          _push(`<span>My Files</span>`);
        } else if (crumb.isVirtual) {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:folder",
            class: "h-4 w-4 text-blue-500"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (idx > 0) {
          _push(`<span>${ssrInterpolate_1(crumb.name)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button></li>`);
      });
      _push(`<!--]--></ol></nav>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/drive/Breadcrumbs.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ vueExports.defineComponent({
  __name: "FileList",
  __ssrInlineRender: true,
  props: {
    files: {},
    selectedFiles: {},
    isAllSelected: { type: Boolean },
    isPartiallySelected: { type: Boolean },
    sortBy: {},
    dropTargetId: {},
    draggedFile: {},
    copiedFileId: {}
  },
  emits: ["toggle-select-all", "update:sortBy", "row-click", "toggle-file-selection", "long-press-start", "long-press-cancel", "drag-start", "drag-end", "drag-over", "drag-leave", "drop", "action"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<table${ssrRenderAttrs_1(vueExports.mergeProps({ class: "w-full text-left border-collapse" }, _attrs))}><thead class="sticky top-0 bg-background/95 backdrop-blur z-10"><tr><th class="py-3 px-2 w-10 border-b"><div class="flex items-center justify-center"><input type="checkbox"${ssrIncludeBooleanAttr(__props.isAllSelected) ? " checked" : ""}${ssrRenderAttr_1("indeterminate", __props.isPartiallySelected)} class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"></div></th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-1/2 cursor-pointer hover:text-foreground group"> Name `);
      if (__props.sortBy === "name") {
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:chevron-down",
          class: "inline h-3 w-3 ml-1"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden md:table-cell hover:bg-muted/50 cursor-pointer"> Size `);
      if (__props.sortBy === "size") {
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:chevron-down",
          class: "inline h-3 w-3 ml-1"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-40 hidden lg:table-cell hover:bg-muted/50 cursor-pointer"> Modified `);
      if (__props.sortBy === "modified") {
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:chevron-down",
          class: "inline h-3 w-3 ml-1"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</th><th class="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-32 hidden lg:table-cell">Members</th><th class="py-3 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b w-24">Actions</th></tr></thead><tbody class="divide-y divide-border/40"><!--[-->`);
      ssrRenderList_1(__props.files, (file) => {
        var _a;
        _push(`<tr class="${ssrRenderClass_1([[
          __props.selectedFiles.has(file.id) ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-[#F7F9FA] dark:hover:bg-muted/20",
          __props.dropTargetId === file.id ? "bg-blue-100 dark:bg-blue-800/30 ring-2 ring-blue-400 ring-inset" : "",
          ((_a = __props.draggedFile) == null ? void 0 : _a.id) === file.id ? "opacity-50" : "",
          "cursor-pointer select-none"
        ], "group transition-colors duration-200"])}"${ssrRenderAttr_1("draggable", true)}><td class="py-3 px-2"><div class="flex items-center justify-center"><input type="checkbox"${ssrIncludeBooleanAttr(__props.selectedFiles.has(file.id)) ? " checked" : ""} class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"></div></td><td class="py-3 px-4"><div class="flex items-center gap-4"><div class="relative shrink-0"><div class="${ssrRenderClass_1([file.type === "folder" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : vueExports.unref(getIconColor)(file.extension), "h-10 w-10 rounded-lg flex items-center justify-center transition-colors"])}">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: file.type === "folder" ? "lucide:folder" : vueExports.unref(getFileIcon)(file.extension),
          class: ["h-5 w-5", { "fill-blue-500/20": file.type === "folder" }]
        }, null, _parent));
        _push(`</div>`);
        if (file.shareUrl && file.type !== "folder") {
          _push(`<span class="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-100"></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="min-w-0 pr-4"><p class="font-medium text-sm text-foreground dark:text-foreground truncate transition-colors group-hover:text-primary"${ssrRenderAttr_1("title", file.name)}>${ssrInterpolate_1(file.name)}</p>`);
        if (file.type !== "folder") {
          _push(`<div class="flex items-center gap-2 mt-0.5 md:hidden"><span class="text-xs text-muted-foreground">${ssrInterpolate_1(vueExports.unref(formatBytes)(file.size))}</span><span class="text-xs text-muted-foreground">\u2022</span><span class="text-xs text-muted-foreground">${ssrInterpolate_1(vueExports.unref(formatDate)(file.modified))}</span></div>`);
        } else {
          _push(`<div class="flex items-center gap-2 mt-0.5 md:hidden"><span class="text-xs text-muted-foreground">Folder</span></div>`);
        }
        _push(`</div></div></td><td class="py-3 px-4 text-sm text-[#52555A] hidden md:table-cell font-mono text-xs">${ssrInterpolate_1(vueExports.unref(formatBytes)(file.size))}</td><td class="py-3 px-4 text-sm text-[#52555A] hidden lg:table-cell">${ssrInterpolate_1(vueExports.unref(formatDate)(file.modified))}</td><td class="py-3 px-4 text-sm hidden lg:table-cell">`);
        if (file.shareUrl) {
          _push(`<div class="flex flex-col items-start gap-1"><div class="flex items-center gap-1.5 text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-full w-fit">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:globe",
            class: "h-3 w-3"
          }, null, _parent));
          _push(`<span>Link active</span></div>`);
          if (file.shareExpiresAt) {
            _push(`<span class="${ssrRenderClass_1([vueExports.unref(getExpiryColor)(file.shareExpiresAt), "text-[10px] ml-1"])}">${ssrInterpolate_1(vueExports.unref(getExpiryDistance)(file.shareExpiresAt))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="text-xs text-muted-foreground italic">Only you</div>`);
        }
        _push(`</td><td class="py-3 px-4 text-right"><div class="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">`);
        if (file.shareUrl) {
          _push(`<button${ssrRenderAttr_1("title", __props.copiedFileId === file.id ? "Copied" : "Copy link")} class="${ssrRenderClass_1([__props.copiedFileId === file.id ? "text-green-600 bg-green-50" : "text-muted-foreground", "h-8 w-8 flex items-center justify-center rounded hover:bg-white hover:text-green-600 hover:shadow-sm transition-all"])}">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: __props.copiedFileId === file.id ? "lucide:check" : "lucide:link",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button title="Preview" class="h-8 w-8 flex items-center justify-center rounded hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm transition-all text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:eye",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button><button title="Share" class="h-8 w-8 flex items-center justify-center rounded hover:bg-primary hover:text-primary-foreground hover:shadow-sm transition-all text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:share-2",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button><button title="Download" class="h-8 w-8 flex items-center justify-center rounded hover:bg-background hover:text-primary hover:shadow-sm transition-all text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:download",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button>`);
        if (file.virtualFolder) {
          _push(`<button title="Remove from folder" class="h-8 w-8 flex items-center justify-center rounded hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm transition-all text-muted-foreground">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:folder-minus",
            class: "h-4 w-4"
          }, null, _parent));
          _push(`</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button title="Delete" class="h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:trash-2",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button></div></td></tr>`);
      });
      _push(`<!--]--></tbody></table>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/drive/FileList.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ vueExports.defineComponent({
  __name: "FileGrid",
  __ssrInlineRender: true,
  props: {
    files: {},
    selectedFiles: {},
    dropTargetId: {},
    draggedFile: {}
  },
  emits: ["row-click", "toggle-file-selection", "long-press-start", "long-press-cancel", "drag-start", "drag-end", "drag-over", "drag-leave", "drop", "action"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" }, _attrs))}><!--[-->`);
      ssrRenderList_1(__props.files, (file) => {
        var _a, _b;
        _push(`<div class="${ssrRenderClass_1([[
          __props.selectedFiles.has(file.id) ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700" : "hover:bg-muted/30 border-transparent hover:border-border/50",
          __props.dropTargetId === file.id ? "bg-blue-100 dark:bg-blue-800/30 ring-2 ring-blue-400" : "",
          ((_a = __props.draggedFile) == null ? void 0 : _a.id) === file.id ? "opacity-50" : "",
          "cursor-pointer"
        ], "group relative bg-card border rounded-[10px] p-4 flex flex-col items-center text-center transition-all duration-200 select-none"])}"${ssrRenderAttr_1("draggable", true)}>`);
        if (file.type !== "folder") {
          _push(`<div class="${ssrRenderClass_1([__props.selectedFiles.has(file.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100", "absolute top-3 left-3 transition-opacity z-10"])}"><input type="checkbox"${ssrIncludeBooleanAttr(__props.selectedFiles.has(file.id)) ? " checked" : ""} class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">`);
        if (file.shareUrl) {
          _push(`<button class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-green-50 text-green-600">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:link",
            class: "h-3.5 w-3.5"
          }, null, _parent));
          _push(`</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-blue-50 text-blue-600">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:share-2",
          class: "h-3.5 w-3.5"
        }, null, _parent));
        _push(`</button>`);
        if (file.virtualFolder) {
          _push(`<button class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-orange-50 text-orange-600" title="Remove from folder">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:folder-minus",
            class: "h-3.5 w-3.5"
          }, null, _parent));
          _push(`</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="h-7 w-7 rounded bg-background shadow-sm border flex items-center justify-center hover:bg-red-50 text-red-600">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:trash-2",
          class: "h-3.5 w-3.5"
        }, null, _parent));
        _push(`</button></div><div class="h-24 w-full flex items-center justify-center mb-3 cursor-pointer hover:scale-105 transition-transform"><div class="${ssrRenderClass_1([file.type === "folder" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : vueExports.unref(getIconColor)(file.extension), "h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm"])}">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: file.type === "folder" ? "lucide:folder" : vueExports.unref(getFileIcon)(file.extension),
          class: ["h-8 w-8", { "fill-blue-500/20": file.type === "folder" }]
        }, null, _parent));
        _push(`</div>`);
        if (vueExports.unref(isVideoFile)(file.extension)) {
          _push(`<span class="absolute bottom-16 right-4 text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">${ssrInterpolate_1(file.duration || "VIDEO")}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><h4 class="font-medium text-sm text-[#1E1919] dark:text-foreground w-full truncate px-1 cursor-pointer hover:text-[#0061FE] transition-colors"${ssrRenderAttr_1("title", file.name)}>${ssrInterpolate_1(file.name)}</h4><div class="text-xs text-[#52555A] mt-1 space-x-1"><span>${ssrInterpolate_1((_b = file.extension) == null ? void 0 : _b.toUpperCase())}</span><span>\u2022</span><span>${ssrInterpolate_1(vueExports.unref(formatBytes)(file.size))}</span></div></div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/drive/FileGrid.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "files",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const {
      searchQuery,
      sortBy,
      viewMode,
      currentPage,
      currentPath,
      totalPages,
      files,
      pending,
      error,
      refresh,
      sortedFiles,
      paginatedFiles,
      breadcrumbs,
      navigateToFolder,
      handleBreadcrumbClick,
      handleFolderClick
    } = ([__temp, __restore] = vueExports.withAsyncContext(() => useFileBrowser()), __temp = await __temp, __restore(), __temp);
    const {
      selectedFiles,
      isAllSelected,
      isPartiallySelected,
      selectedCount,
      toggleSelectAll,
      toggleFileSelection,
      clearSelection
    } = useFileSelection(paginatedFiles);
    const {
      isCreatingFolder,
      newFolderName,
      folderError,
      createFolderModalOpen,
      isBulkDeleting,
      isBulkDownloading,
      handleDownload,
      deleteTarget,
      isDeleting,
      confirmDelete,
      copiedFileId,
      copyExistingLink
    } = useFileOperations(files, selectedFiles, refresh, clearSelection);
    const {
      isDragging,
      isUploading,
      uploadProgress,
      uploadingFileName,
      uploadedCount,
      totalUploadCount,
      uploadError,
      triggerFileInput
    } = useFileUpload(currentPath, refresh);
    const {
      draggedFile,
      dropTargetId,
      isMoving,
      // Not used in template directly? Check FileList/FileGrid events
      startLongPress,
      cancelLongPress,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleFileDrop,
      handleBreadcrumbDrop,
      removeFromFolder
    } = useFileDragDrop(refresh);
    const {
      previewTarget,
      previewUrl,
      isLoadingPreview,
      previewError,
      openPreview
    } = useFilePreview();
    const {
      shareTarget,
      shareResult,
      isSharing,
      copied,
      shareTab,
      expirationOptions,
      selectedExpiration,
      isGeneratingEmbed,
      isDeletingShare,
      confirmDeleteShare,
      openShareModal,
      getEmbedCode,
      getEmbedUrl
    } = useFileShare();
    const onRowClick = (file) => file.type === "folder" ? handleFolderClick(file) : openPreview(file);
    const handleAction = (action, file) => {
      switch (action) {
        case "copy-link":
          copyExistingLink(file);
          break;
        case "preview":
          openPreview(file);
          break;
        case "share":
          openShareModal(file);
          break;
        case "download":
          handleDownload(file);
          break;
        case "remove-from-folder":
          removeFromFolder(file);
          break;
        case "delete":
          confirmDelete(file);
          break;
      }
    };
    const totalSizeFormatted = vueExports.computed(() => formatBytes(files.value.reduce((acc, file) => acc + file.size, 0)));
    const activeSharesCount = vueExports.computed(() => files.value.filter((f) => f.shareUrl).length);
    const formatExpiry = (dateStr) => {
      if (!dateStr) return "Never";
      return formatDate(dateStr);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_UiSkeleton = _sfc_main$6;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "h-full flex flex-col bg-background/50" }, _attrs))}><input type="file" multiple class="hidden">`);
      if (vueExports.unref(isDragging) && !vueExports.unref(draggedFile)) {
        _push(`<div class="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none"><div class="bg-white dark:bg-card rounded-2xl p-12 shadow-2xl border-2 border-dashed border-blue-500 text-center">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:upload-cloud",
          class: "h-16 w-16 mx-auto mb-4 text-blue-500"
        }, null, _parent));
        _push(`<p class="text-xl font-semibold text-foreground">Drop files to upload</p><p class="text-sm text-muted-foreground mt-2">Files will be uploaded to your storage</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4 flex flex-col gap-4"><div class="w-full"><div class="flex flex-col md:flex-row md:items-center justify-between gap-4">`);
      _push(ssrRenderComponent_1(_sfc_main$5, {
        "total-size-formatted": totalSizeFormatted.value,
        "files-count": vueExports.unref(files).length,
        "active-shares-count": activeSharesCount.value
      }, null, _parent));
      _push(ssrRenderComponent_1(_sfc_main$4, {
        "search-query": vueExports.unref(searchQuery),
        "onUpdate:searchQuery": ($event) => searchQuery.value = $event,
        "view-mode": vueExports.unref(viewMode),
        onToggleView: ($event) => viewMode.value = vueExports.unref(viewMode) === "list" ? "grid" : "list",
        onCreateFolder: ($event) => createFolderModalOpen.value = true,
        onUpload: vueExports.unref(triggerFileInput)
      }, null, _parent));
      _push(`</div></div>`);
      _push(ssrRenderComponent_1(_sfc_main$3, {
        breadcrumbs: vueExports.unref(breadcrumbs),
        "is-dragging-internal": !!vueExports.unref(draggedFile),
        onNavigate: vueExports.unref(handleBreadcrumbClick),
        onDrop: vueExports.unref(handleBreadcrumbDrop)
      }, null, _parent));
      _push(`</div><div class="flex-1 overflow-auto px-4 md:px-6 py-6 transition-all"><div class="w-full h-full">`);
      if (vueExports.unref(selectedCount) > 0) {
        _push(`<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-5 sm:py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-[95vw] overflow-hidden"><div class="flex items-center gap-2 text-gray-900 dark:text-gray-100 shrink-0"><div class="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-sm">${ssrInterpolate_1(vueExports.unref(selectedCount))}</div><span class="text-xs sm:text-sm font-medium hidden xs:inline">selected</span></div><div class="w-px h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 shrink-0"></div><button${ssrIncludeBooleanAttr(vueExports.unref(isBulkDownloading)) ? " disabled" : ""} class="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 shrink-0">`);
        if (vueExports.unref(isBulkDownloading)) {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:loader-2",
            class: "h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin"
          }, null, _parent));
        } else {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:download",
            class: "h-3.5 w-3.5 sm:h-4 sm:w-4"
          }, null, _parent));
        }
        _push(`<span class="hidden sm:inline">Download</span></button><button${ssrIncludeBooleanAttr(vueExports.unref(isBulkDeleting)) ? " disabled" : ""} class="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 shrink-0">`);
        if (vueExports.unref(isBulkDeleting)) {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:loader-2",
            class: "h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin"
          }, null, _parent));
        } else {
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:trash-2",
            class: "h-3.5 w-3.5 sm:h-4 sm:w-4"
          }, null, _parent));
        }
        _push(`<span class="hidden sm:inline">Delete</span></button><div class="w-px h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 shrink-0"></div><button class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors shrink-0" title="Clear selection">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:x",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(isMoving)) {
        _push(`<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-blue-600 rounded-full shadow-2xl">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "h-5 w-5 text-white animate-spin"
        }, null, _parent));
        _push(`<span class="text-white font-medium">Moving file...</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(draggedFile)) {
        _push(`<div class="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-gray-900/90 rounded-lg shadow-lg">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:move",
          class: "h-4 w-4 text-blue-400"
        }, null, _parent));
        _push(`<span class="text-white text-sm">Drop on a folder to move</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(pending)) {
        _push(`<div class="w-full space-y-4 animate-in fade-in duration-500"><div class="space-y-3"><div class="flex items-center justify-between px-4 py-2 border-b">`);
        _push(ssrRenderComponent_1(_component_UiSkeleton, { class: "h-4 w-32" }, null, _parent));
        _push(ssrRenderComponent_1(_component_UiSkeleton, { class: "h-4 w-20" }, null, _parent));
        _push(`</div><!--[-->`);
        ssrRenderList_1(5, (i) => {
          _push(`<div class="flex items-center gap-4 px-4 py-3">`);
          _push(ssrRenderComponent_1(_component_UiSkeleton, { class: "h-10 w-10 rounded-lg shrink-0" }, null, _parent));
          _push(`<div class="flex-1 space-y-2">`);
          _push(ssrRenderComponent_1(_component_UiSkeleton, { class: "h-4 w-1/3" }, null, _parent));
          _push(ssrRenderComponent_1(_component_UiSkeleton, { class: "h-3 w-1/4" }, null, _parent));
          _push(`</div>`);
          _push(ssrRenderComponent_1(_component_UiSkeleton, { class: "h-4 w-24 hidden sm:block" }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div></div>`);
      } else if (vueExports.unref(error)) {
        _push(`<div class="p-6 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center mx-auto max-w-lg mt-10">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:alert-circle",
          class: "h-8 w-8 mb-2 mx-auto"
        }, null, _parent));
        _push(`<h3 class="font-medium">Failed to load files</h3><p class="text-sm opacity-80 mt-1">${ssrInterpolate_1(vueExports.unref(error).message)}</p></div>`);
      } else if (vueExports.unref(sortedFiles).length === 0) {
        _push(`<div class="h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-500 cursor-pointer"><div class="h-32 w-32 mb-6 opacity-30"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="w-full h-full text-blue-300"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg></div><h3 class="text-xl font-semibold text-foreground dark:text-foreground mb-2">${ssrInterpolate_1(vueExports.unref(searchQuery) ? "No results found" : "Your folder is empty")}</h3><p class="text-muted-foreground max-w-xs mb-8">${ssrInterpolate_1(vueExports.unref(searchQuery) ? "Try adjusting your search terms." : "Drag and drop files here to upload, or click to browse.")}</p>`);
        if (!vueExports.unref(searchQuery)) {
          _push(`<button class="h-11 px-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"> Choose Files </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (vueExports.unref(viewMode) === "list") {
        _push(`<div class="w-full">`);
        _push(ssrRenderComponent_1(_sfc_main$2, {
          files: vueExports.unref(paginatedFiles),
          "selected-files": vueExports.unref(selectedFiles),
          "is-all-selected": vueExports.unref(isAllSelected),
          "is-partially-selected": vueExports.unref(isPartiallySelected),
          "sort-by": vueExports.unref(sortBy),
          "drop-target-id": vueExports.unref(dropTargetId),
          "dragged-file": vueExports.unref(draggedFile),
          "copied-file-id": vueExports.unref(copiedFileId),
          onToggleSelectAll: vueExports.unref(toggleSelectAll),
          "onUpdate:sortBy": ($event) => sortBy.value = $event,
          onRowClick,
          onToggleFileSelection: vueExports.unref(toggleFileSelection),
          onLongPressStart: vueExports.unref(startLongPress),
          onLongPressCancel: vueExports.unref(cancelLongPress),
          onDragStart: vueExports.unref(handleDragStart),
          onDragEnd: vueExports.unref(handleDragEnd),
          onDragOver: vueExports.unref(handleDragOver),
          onDragLeave: vueExports.unref(handleDragLeave),
          onDrop: vueExports.unref(handleFileDrop),
          onAction: handleAction
        }, null, _parent));
        _push(`</div>`);
      } else if (vueExports.unref(viewMode) === "grid") {
        _push(`<div>`);
        _push(ssrRenderComponent_1(_sfc_main$1, {
          files: vueExports.unref(paginatedFiles),
          "selected-files": vueExports.unref(selectedFiles),
          "drop-target-id": vueExports.unref(dropTargetId),
          "dragged-file": vueExports.unref(draggedFile),
          onRowClick,
          onToggleFileSelection: vueExports.unref(toggleFileSelection),
          onLongPressStart: vueExports.unref(startLongPress),
          onLongPressCancel: vueExports.unref(cancelLongPress),
          onDragStart: vueExports.unref(handleDragStart),
          onDragEnd: vueExports.unref(handleDragEnd),
          onDragOver: vueExports.unref(handleDragOver),
          onDragLeave: vueExports.unref(handleDragLeave),
          onDrop: vueExports.unref(handleFileDrop),
          onAction: handleAction
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (vueExports.unref(totalPages) > 1) {
        _push(`<div class="flex justify-center mt-8 pb-8"><div class="flex items-center gap-1 bg-muted/30 p-1 rounded-full"><button${ssrIncludeBooleanAttr(vueExports.unref(currentPage) === 1) ? " disabled" : ""} class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-background disabled:opacity-50 transition-all text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:chevron-left",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button><div class="px-4 text-xs font-medium text-muted-foreground"> Page ${ssrInterpolate_1(vueExports.unref(currentPage))} of ${ssrInterpolate_1(vueExports.unref(totalPages))}</div><button${ssrIncludeBooleanAttr(vueExports.unref(currentPage) === vueExports.unref(totalPages)) ? " disabled" : ""} class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-background disabled:opacity-50 transition-all text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:chevron-right",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(shareTarget)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[480px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"><div class="px-6 py-5 border-b bg-background flex items-center justify-between"><h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground">Share details</h3><button class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:x",
            class: "h-5 w-5"
          }, null, _parent));
          _push2(`</button></div><div class="p-6"><div class="flex items-center gap-4 mb-6"><div class="${ssrRenderClass_1([vueExports.unref(getIconColor)(vueExports.unref(shareTarget).extension), "h-12 w-12 rounded-lg flex items-center justify-center shrink-0"])}">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: vueExports.unref(getFileIcon)(vueExports.unref(shareTarget).extension),
            class: "h-6 w-6"
          }, null, _parent));
          _push2(`</div><div class="min-w-0"><h4 class="font-medium text-sm truncate">${ssrInterpolate_1(vueExports.unref(shareTarget).name)}</h4><div class="flex text-xs text-muted-foreground gap-2"><span>${ssrInterpolate_1(vueExports.unref(formatBytes)(vueExports.unref(shareTarget).size))}</span><span>\u2022</span><span>Last modified ${ssrInterpolate_1(vueExports.unref(formatDate)(vueExports.unref(shareTarget).modified))}</span></div></div></div>`);
          if (vueExports.unref(shareResult)) {
            _push2(`<div class="space-y-5"><div class="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg flex gap-3 border border-green-100 dark:border-green-800/30"><div class="mt-0.5">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:check-circle-2",
              class: "h-5 w-5 text-green-600"
            }, null, _parent));
            _push2(`</div><div><p class="text-sm font-medium text-green-800 dark:text-green-300">Link created</p><p class="text-xs text-green-600 dark:text-green-400 mt-0.5">Anyone with this link can view this file.</p></div></div><div class="flex border-b border-border mb-2"><button class="${ssrRenderClass_1(["px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none", vueExports.unref(shareTab) === "link" ? "border-[#0061FE] text-[#0061FE]" : "border-transparent text-muted-foreground hover:text-foreground"])}"> Share Link </button><button class="${ssrRenderClass_1(["px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none", vueExports.unref(shareTab) === "embed" ? "border-[#0061FE] text-[#0061FE]" : "border-transparent text-muted-foreground hover:text-foreground"])}"> Embed Code </button></div>`);
            if (vueExports.unref(shareTab) === "link") {
              _push2(`<div class="space-y-2 animate-in fade-in slide-in-from-left-2 duration-200"><label class="text-xs font-bold uppercase text-muted-foreground tracking-wider">Link to file</label><div class="flex gap-2"><div class="flex-1 relative"><input type="text"${ssrRenderAttr_1("value", vueExports.unref(shareResult).url)} readonly class="w-full h-11 pl-3 pr-10 bg-muted/30 border rounded-md text-sm font-mono text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"></div><button class="h-11 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-colors flex items-center gap-2">`);
              if (vueExports.unref(copied)) {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:check",
                  class: "h-4 w-4"
                }, null, _parent));
              } else {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:copy",
                  class: "h-4 w-4"
                }, null, _parent));
              }
              _push2(` ${ssrInterpolate_1(vueExports.unref(copied) ? "Copied" : "Copy")}</button></div></div>`);
            } else {
              _push2(`<div class="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200"><div class="space-y-2"><label class="text-xs font-bold uppercase text-muted-foreground tracking-wider">Embed URL</label><div class="flex gap-2"><input type="text" readonly${ssrRenderAttr_1("value", vueExports.unref(getEmbedUrl)(vueExports.unref(shareResult).id))} class="flex-1 h-10 px-3 bg-muted/30 border rounded-md text-xs font-mono text-foreground focus:ring-2 focus:ring-blue-500/20 outline-none"><button class="h-10 px-4 rounded-md bg-muted hover:bg-muted/80 text-foreground font-medium text-sm transition-colors flex items-center gap-2 border">`);
              if (vueExports.unref(copied)) {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:check",
                  class: "h-4 w-4 text-green-500"
                }, null, _parent));
              } else {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:link",
                  class: "h-4 w-4"
                }, null, _parent));
              }
              _push2(`</button></div><p class="text-xs text-muted-foreground">Use this URL directly in your video player.</p></div><div class="space-y-2"><label class="text-xs font-bold uppercase text-muted-foreground tracking-wider">iFrame Code</label><div class="relative group"><textarea readonly class="w-full h-20 p-3 bg-muted/50 border rounded-md text-xs font-mono text-foreground resize-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all">${ssrInterpolate_1(vueExports.unref(getEmbedCode)(vueExports.unref(shareResult).id))}</textarea><button class="absolute top-2 right-2 p-1.5 bg-background shadow-sm border rounded hover:bg-muted text-[#0061FE] transition-all opacity-0 group-hover:opacity-100" title="Copy Code">`);
              if (vueExports.unref(copied)) {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:check",
                  class: "h-4 w-4"
                }, null, _parent));
              } else {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:copy",
                  class: "h-4 w-4"
                }, null, _parent));
              }
              _push2(`</button></div><p class="text-xs text-muted-foreground">Paste this code into your website&#39;s HTML.</p></div></div>`);
            }
            _push2(`<div class="pt-4 border-t mt-4">`);
            if (vueExports.unref(confirmDeleteShare)) {
              _push2(`<div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200"><p class="text-sm text-red-800 dark:text-red-200 font-medium mb-2">Delete this share link?</p><p class="text-xs text-red-600 dark:text-red-400 mb-3">Anyone with this link will no longer be able to access the file.</p><div class="flex gap-2"><button${ssrIncludeBooleanAttr(vueExports.unref(isDeletingShare)) ? " disabled" : ""} class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">`);
              if (vueExports.unref(isDeletingShare)) {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:loader-2",
                  class: "h-4 w-4 animate-spin"
                }, null, _parent));
              } else {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:trash-2",
                  class: "h-4 w-4"
                }, null, _parent));
              }
              _push2(` Yes, Delete </button><button class="px-4 py-2 bg-white dark:bg-gray-800 border text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"> Cancel </button></div></div>`);
            } else {
              _push2(`<div class="flex items-center justify-between"><span class="text-xs text-muted-foreground">Expires: <span class="font-medium text-foreground">${ssrInterpolate_1(formatExpiry(vueExports.unref(shareResult).expiresAt))}</span></span><div class="flex items-center gap-3"><button class="text-sm text-red-500 hover:text-red-600 hover:underline flex items-center gap-1">`);
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:trash-2",
                class: "h-3 w-3"
              }, null, _parent));
              _push2(` Delete Link </button><button class="text-sm text-muted-foreground hover:text-foreground hover:underline">Done</button></div></div>`);
            }
            _push2(`</div></div>`);
          } else {
            _push2(`<div class="space-y-6"><div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30"><div class="flex items-start gap-3"><div class="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-full text-purple-600 dark:text-purple-400 shrink-0">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:code",
              class: "h-4 w-4"
            }, null, _parent));
            _push2(`</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-purple-900 dark:text-purple-200">Quick Embed</p><p class="text-xs text-purple-600 dark:text-purple-400 mt-0.5">Get embed code instantly (link never expires)</p></div><button${ssrIncludeBooleanAttr(vueExports.unref(isGeneratingEmbed)) ? " disabled" : ""} class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">`);
            if (vueExports.unref(isGeneratingEmbed)) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:loader-2",
                class: "h-4 w-4 animate-spin"
              }, null, _parent));
            } else {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:sparkles",
                class: "h-4 w-4"
              }, null, _parent));
            }
            _push2(` Generate </button></div></div><div class="relative flex items-center"><div class="flex-grow border-t border-border"></div><span class="px-3 text-xs text-muted-foreground">or create link with expiration</span><div class="flex-grow border-t border-border"></div></div><div><label class="text-sm font-medium text-foreground mb-3 block">Link settings</label><div class="space-y-3"><div class="flex items-center gap-2 mb-4 px-1"><div class="p-2 bg-blue-50 rounded-full text-blue-600">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:clock",
              class: "h-4 w-4"
            }, null, _parent));
            _push2(`</div><div><p class="text-sm font-medium">Expiration</p><p class="text-xs text-muted-foreground">When should this link expire?</p></div></div><div class="grid grid-cols-2 gap-3"><!--[-->`);
            ssrRenderList_1(vueExports.unref(expirationOptions), (option) => {
              _push2(`<button class="${ssrRenderClass_1([
                "px-3 py-2.5 rounded-lg text-sm font-medium transition-all border text-left flex items-center justify-between",
                vueExports.unref(selectedExpiration) === option.days ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200" : "bg-card hover:bg-muted border-input text-muted-foreground hover:text-foreground"
              ])}">${ssrInterpolate_1(option.label)} `);
              if (vueExports.unref(selectedExpiration) === option.days) {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:check",
                  class: "h-4 w-4"
                }, null, _parent));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</button>`);
            });
            _push2(`<!--]--></div></div></div><button${ssrIncludeBooleanAttr(vueExports.unref(isSharing)) ? " disabled" : ""} class="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4">`);
            if (vueExports.unref(isSharing)) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:loader-2",
                class: "h-5 w-5 animate-spin"
              }, null, _parent));
            } else {
              _push2(`<span>Create Link</span>`);
            }
            _push2(`</button></div>`);
          }
          _push2(`</div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(deleteTarget)) {
          _push2(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"><div class="px-6 py-5 border-b bg-background flex items-center gap-3"><div class="p-2 rounded-full bg-red-100">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:trash-2",
            class: "h-5 w-5 text-red-600"
          }, null, _parent));
          _push2(`</div><h3 class="font-semibold text-lg text-[#1E1919] dark:text-foreground">Delete File</h3></div><div class="p-6"><p class="text-muted-foreground mb-2"> Are you sure you want to delete this file? </p><div class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-4">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: vueExports.unref(getFileIcon)(vueExports.unref(deleteTarget).extension),
            class: ["h-8 w-8", vueExports.unref(getIconColor)(vueExports.unref(deleteTarget).extension)]
          }, null, _parent));
          _push2(`<div class="min-w-0"><p class="font-medium text-sm truncate">${ssrInterpolate_1(vueExports.unref(deleteTarget).name)}</p><p class="text-xs text-muted-foreground">${ssrInterpolate_1(vueExports.unref(formatBytes)(vueExports.unref(deleteTarget).size))}</p></div></div><p class="text-xs text-muted-foreground mb-6"> The file will be moved to trash and automatically deleted after 30 days. </p><div class="flex gap-3 justify-end"><button class="px-4 py-2 rounded-lg text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"> Cancel </button><button${ssrIncludeBooleanAttr(vueExports.unref(isDeleting)) ? " disabled" : ""} class="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50">`);
          if (vueExports.unref(isDeleting)) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-4 w-4 animate-spin"
            }, null, _parent));
          } else {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:trash-2",
              class: "h-4 w-4"
            }, null, _parent));
          }
          _push2(` Delete </button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(previewTarget)) {
          _push2(`<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"><button class="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:x",
            class: "h-6 w-6"
          }, null, _parent));
          _push2(`</button><div class="absolute top-4 left-4 z-10 flex items-center gap-3 max-w-[50%]">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: vueExports.unref(getFileIcon)(vueExports.unref(previewTarget).extension),
            class: "h-8 w-8 text-white shrink-0"
          }, null, _parent));
          _push2(`<div class="min-w-0"><p class="text-white font-medium truncate">${ssrInterpolate_1(vueExports.unref(previewTarget).name)}</p><p class="text-white/60 text-sm">${ssrInterpolate_1(vueExports.unref(formatBytes)(vueExports.unref(previewTarget).size))}</p></div></div><div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2"><button class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:download",
            class: "h-4 w-4"
          }, null, _parent));
          _push2(` Download </button><button class="px-4 py-2 rounded-lg bg-[#0061FE] hover:bg-[#0057E5] text-white transition-colors flex items-center gap-2">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:share-2",
            class: "h-4 w-4"
          }, null, _parent));
          _push2(` Share </button></div><div class="max-w-[90vw] max-h-[80vh] flex items-center justify-center">`);
          if (vueExports.unref(isLoadingPreview)) {
            _push2(`<div class="flex flex-col items-center gap-4 text-white">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-12 w-12 animate-spin"
            }, null, _parent));
            _push2(`<p>Loading preview...</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          if (vueExports.unref(previewError)) {
            _push2(`<div class="bg-card p-8 rounded-xl shadow-2xl text-center max-w-md border border-destructive/20"><div class="h-20 w-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:alert-circle",
              class: "h-10 w-10"
            }, null, _parent));
            _push2(`</div><p class="font-medium text-lg mb-2 text-foreground">Failed to load preview</p><p class="text-muted-foreground text-sm mb-6">${ssrInterpolate_1(vueExports.unref(previewError))}</p><div class="flex justify-center gap-3"><button class="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"> Close </button><button class="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"> Retry </button></div></div>`);
          } else if (vueExports.unref(isArchiveFile)(vueExports.unref(previewTarget).extension)) {
            _push2(`<div class="bg-card p-8 rounded-xl shadow-2xl text-center max-w-md"><div class="h-20 w-20 mx-auto mb-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:package",
              class: "h-10 w-10"
            }, null, _parent));
            _push2(`</div><p class="font-medium text-lg mb-2">${ssrInterpolate_1(vueExports.unref(previewTarget).name)}</p><p class="text-muted-foreground text-sm mb-6">Archive files cannot be previewed directly.</p><button class="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex items-center gap-2 mx-auto">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:download",
              class: "h-4 w-4"
            }, null, _parent));
            _push2(` Download to View </button></div>`);
          } else if (vueExports.unref(previewUrl) && vueExports.unref(isImageFile)(vueExports.unref(previewTarget).extension)) {
            _push2(`<img${ssrRenderAttr_1("src", vueExports.unref(previewUrl))}${ssrRenderAttr_1("alt", vueExports.unref(previewTarget).name)} class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl">`);
          } else if (vueExports.unref(previewUrl) && vueExports.unref(isVideoFile)(vueExports.unref(previewTarget).extension)) {
            _push2(`<video${ssrRenderAttr_1("src", vueExports.unref(previewUrl))} controls autoplay class="max-w-full max-h-[80vh] rounded-lg shadow-2xl"></video>`);
          } else if (vueExports.unref(previewUrl) && vueExports.unref(isAudioFile)(vueExports.unref(previewTarget).extension)) {
            _push2(`<div class="bg-card p-8 rounded-xl shadow-2xl text-center">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: vueExports.unref(getFileIcon)(vueExports.unref(previewTarget).extension),
              class: "h-24 w-24 mx-auto mb-4 text-indigo-500"
            }, null, _parent));
            _push2(`<p class="font-medium text-lg mb-4">${ssrInterpolate_1(vueExports.unref(previewTarget).name)}</p><audio${ssrRenderAttr_1("src", vueExports.unref(previewUrl))} controls autoplay class="w-full max-w-md"></audio></div>`);
          } else if (vueExports.unref(previewUrl)) {
            _push2(`<div class="bg-card p-8 rounded-xl shadow-2xl text-center max-w-md"><div class="${ssrRenderClass_1([vueExports.unref(getIconColor)(vueExports.unref(previewTarget).extension), "h-20 w-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"])}">`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: vueExports.unref(getFileIcon)(vueExports.unref(previewTarget).extension),
              class: "h-10 w-10"
            }, null, _parent));
            _push2(`</div><p class="font-medium text-lg mb-2">${ssrInterpolate_1(vueExports.unref(previewTarget).name)}</p><p class="text-muted-foreground text-sm mb-6">${ssrInterpolate_1(vueExports.unref(formatBytes)(vueExports.unref(previewTarget).size))}</p><p class="text-sm text-muted-foreground mb-4">Preview not available for this file type</p><button class="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"> Open in New Tab </button></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(isUploading)) {
          _push2(`<div class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-md rounded-xl shadow-2xl border-0 overflow-hidden p-6"><div class="flex items-center gap-4 mb-6"><div class="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:upload-cloud",
            class: "h-6 w-6"
          }, null, _parent));
          _push2(`</div><div class="min-w-0 flex-1"><h3 class="text-lg font-semibold text-foreground">Uploading Files</h3><p class="text-sm text-muted-foreground truncate">${ssrInterpolate_1(vueExports.unref(uploadingFileName) || "Preparing...")}</p></div></div><div class="mb-4"><div class="h-2 bg-muted rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300" style="${ssrRenderStyle_1({ width: `${vueExports.unref(uploadProgress)}%` })}"></div></div><div class="flex justify-between mt-2 text-xs text-muted-foreground"><span>${ssrInterpolate_1(vueExports.unref(uploadedCount))} of ${ssrInterpolate_1(vueExports.unref(totalUploadCount))} files</span><span>${ssrInterpolate_1(vueExports.unref(uploadProgress).toFixed(0))}%</span></div></div>`);
          if (vueExports.unref(uploadError)) {
            _push2(`<p class="text-sm text-red-500 mt-2">${ssrInterpolate_1(vueExports.unref(uploadError))}</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(createFolderModalOpen)) {
          _push2(`<div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#1E1919]/60 backdrop-blur-[2px]"><div class="bg-card w-full max-w-[400px] rounded-xl shadow-2xl border-0 overflow-hidden"><div class="px-6 py-5 border-b bg-background flex items-center justify-between"><h3 class="font-semibold text-lg">Create new folder</h3><button class="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:x",
            class: "h-5 w-5"
          }, null, _parent));
          _push2(`</button></div><div class="p-6"><div class="space-y-4"><div><label class="text-sm font-medium mb-1.5 block">Folder Name</label><input${ssrRenderAttr_1("value", vueExports.unref(newFolderName))} type="text" placeholder="e.g. Projects" class="w-full h-10 px-3 bg-muted/30 border rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" autofocus></div>`);
          if (vueExports.unref(folderError)) {
            _push2(`<div class="text-sm text-red-500 bg-red-50 p-2 rounded">${ssrInterpolate_1(vueExports.unref(folderError))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<button${ssrIncludeBooleanAttr(vueExports.unref(isCreatingFolder) || !vueExports.unref(newFolderName).trim()) ? " disabled" : ""} class="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2">`);
          if (vueExports.unref(isCreatingFolder)) {
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "h-4 w-4 animate-spin"
            }, null, _parent));
          } else {
            _push2(`<!---->`);
          }
          _push2(` Create </button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/drive/files.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=files-QvjKuXHK.mjs.map
