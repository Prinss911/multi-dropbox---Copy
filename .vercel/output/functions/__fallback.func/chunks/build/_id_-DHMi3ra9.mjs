import { b as useRoute, _ as __nuxt_component_0 } from './server.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-DhuMLcvX.mjs';
import { _ as _sfc_main$1 } from './Button-D1R6eqR9.mjs';
import { _ as __nuxt_component_3 } from './VideoPlayer-9LG838lG.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1, b as ssrInterpolate_1, i as ssrRenderAttr_1, f as ssrRenderList_1, h as ssrRenderClass_1 } from '../routes/renderer.mjs';
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
import './Primitive-D3IcFg81.mjs';
import './cn-H80jjgLf.mjs';
import './VisuallyHidden-6QTMh8_p.mjs';
import '../_/index.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const videoExtensions = ["mp4", "webm", "mkv", "avi", "mov"];
    const audioExtensions = ["mp3", "wav", "ogg", "flac", "m4a"];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    const getFileExt = (name) => {
      var _a;
      return ((_a = name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
    };
    const route = useRoute();
    const shareId = route.params.id;
    const fileInfo = vueExports.ref(null);
    const isLoading = vueExports.ref(true);
    const isDownloading = vueExports.ref(false);
    const error = vueExports.ref(null);
    const timeRemaining = vueExports.ref("");
    const isExpiringSoon = vueExports.ref(false);
    const isLoadingStream = vueExports.ref(false);
    const streamError = vueExports.ref("");
    vueExports.ref(null);
    const videoSrc = vueExports.ref("");
    const videoType = vueExports.ref("video/mp4");
    const files = vueExports.computed(() => {
      var _a;
      return ((_a = fileInfo.value) == null ? void 0 : _a.files) || [];
    });
    const isBatch = vueExports.computed(() => files.value.length > 1);
    const missingCount = vueExports.computed(() => files.value.filter((f) => f.available === false).length);
    const isVideo = vueExports.computed(() => {
      if (files.value.length !== 1) return false;
      return videoExtensions.includes(getFileExt(files.value[0].name));
    });
    const isAudio = vueExports.computed(() => {
      if (files.value.length !== 1) return false;
      return audioExtensions.includes(getFileExt(files.value[0].name));
    });
    const isImage = vueExports.computed(() => {
      if (files.value.length !== 1) return false;
      return imageExtensions.includes(getFileExt(files.value[0].name));
    });
    const isMediaFile = (name) => {
      const ext = getFileExt(name);
      return videoExtensions.includes(ext) || audioExtensions.includes(ext);
    };
    const getFileIcon = (name) => {
      const ext = getFileExt(name);
      if (videoExtensions.includes(ext)) return "lucide:video";
      if (audioExtensions.includes(ext)) return "lucide:music";
      if (imageExtensions.includes(ext)) return "lucide:image";
      if (["pdf"].includes(ext)) return "lucide:file-text";
      if (["zip", "rar", "7z"].includes(ext)) return "lucide:archive";
      return "lucide:file";
    };
    const streamUrl = (index) => `/api/shares/${shareId}/stream?fileIndex=${index}`;
    const formatBytes = (bytes) => {
      if (!bytes || bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    const downloadSingleFile = async (index) => {
      if (!fileInfo.value) return;
      isDownloading.value = true;
      try {
        (void 0).location.href = `/api/shares/${shareId}/stream?fileIndex=${index}`;
      } finally {
        setTimeout(() => {
          isDownloading.value = false;
        }, 2e3);
      }
    };
    const downloadAll = async () => {
      isDownloading.value = true;
      (void 0).location.href = `/api/shares/${shareId}/download-all`;
      setTimeout(() => {
        isDownloading.value = false;
      }, 3e3);
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_Icon = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1;
      const _component_UiButton = _sfc_main$1;
      const _component_MediaVideoPlayer = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "min-h-screen bg-background font-sans text-foreground flex flex-col" }, _attrs))}><header class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"><div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"><a href="/" class="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"><div class="bg-[#0061FE] text-white p-1.5 rounded-lg">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:hard-drive",
        class: "h-5 w-5"
      }, null, _parent));
      _push(`</div><span>MultiBox</span></a></div></header><main class="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 md:py-12">`);
      if (vueExports.unref(isLoading)) {
        _push(`<div class="flex flex-col items-center justify-center min-h-[50vh]">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "w-10 h-10 text-[#0061FE] animate-spin mb-4"
        }, null, _parent));
        _push(`<p class="text-muted-foreground font-medium">Loading file...</p></div>`);
      } else if (vueExports.unref(error)) {
        _push(`<div class="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto"><div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:file-warning",
          class: "h-10 w-10 text-red-500"
        }, null, _parent));
        _push(`</div><h1 class="text-2xl font-bold mb-3">Link Unavailable</h1><p class="text-muted-foreground mb-8">${ssrInterpolate_1(vueExports.unref(error))}</p>`);
        _push(ssrRenderComponent_1(_component_NuxtLink, {
          to: "/",
          class: "inline-flex items-center justify-center h-11 px-8 rounded-full bg-[#0061FE] text-white font-medium hover:bg-[#0057E5] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:arrow-left",
                class: "h-4 w-4 mr-2"
              }, null, _parent2, _scopeId));
              _push2(` Back to Home `);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:arrow-left",
                  class: "h-4 w-4 mr-2"
                }),
                vueExports.createTextVNode(" Back to Home ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (vueExports.unref(fileInfo)) {
        _push(`<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"><div class="flex flex-col md:flex-row md:items-start justify-between gap-6"><div class="flex-1 min-w-0"><div class="flex items-center gap-3 mb-2"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">${ssrInterpolate_1(vueExports.unref(isBatch) ? "Folder Share" : "Shared File")}</span>`);
        if (vueExports.unref(isExpiringSoon)) {
          _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"> Expires ${ssrInterpolate_1(vueExports.unref(timeRemaining))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><h1 class="text-3xl md:text-4xl font-bold tracking-tight text-foreground break-words leading-tight">${ssrInterpolate_1(vueExports.unref(fileInfo).fileName)}</h1><div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground"><div class="flex items-center gap-1.5">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:hard-drive",
          class: "h-4 w-4"
        }, null, _parent));
        _push(` ${ssrInterpolate_1(vueExports.unref(isBatch) ? `${vueExports.unref(files).length} items` : formatBytes((_a = vueExports.unref(files)[0]) == null ? void 0 : _a.size))}</div><div class="h-1 w-1 rounded-full bg-border"></div><div class="flex items-center gap-1.5">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:download-cloud",
          class: "h-4 w-4"
        }, null, _parent));
        _push(` ${ssrInterpolate_1(vueExports.unref(fileInfo).downloadCount)} downloads </div><div class="h-1 w-1 rounded-full bg-border"></div><div class="flex items-center gap-1.5">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:clock",
          class: "h-4 w-4"
        }, null, _parent));
        _push(` ${ssrInterpolate_1(!vueExports.unref(fileInfo).expiresAt ? "Never expires" : vueExports.unref(timeRemaining))}</div></div></div><div class="hidden md:block shrink-0">`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          onClick: ($event) => vueExports.unref(isBatch) ? downloadAll() : downloadSingleFile(0),
          disabled: vueExports.unref(isDownloading),
          size: "lg",
          class: "h-12 px-8 text-base bg-[#0061FE] hover:bg-[#0057E5] text-white shadow-lg shadow-blue-500/20 rounded-full"
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: vueExports.unref(isDownloading) ? "lucide:loader-2" : "lucide:download",
                class: [vueExports.unref(isDownloading) ? "animate-spin" : "", "mr-2 h-5 w-5"]
              }, null, _parent2, _scopeId));
              _push2(` ${ssrInterpolate_1(vueExports.unref(isDownloading) ? "Downloading..." : "Download Now")}`);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: vueExports.unref(isDownloading) ? "lucide:loader-2" : "lucide:download",
                  class: [vueExports.unref(isDownloading) ? "animate-spin" : "", "mr-2 h-5 w-5"]
                }, null, 8, ["name", "class"]),
                vueExports.createTextVNode(" " + vueExports.toDisplayString(vueExports.unref(isDownloading) ? "Downloading..." : "Download Now"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
        if (vueExports.unref(missingCount) > 0) {
          _push(`<div class="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4"><div class="flex"><div class="flex-shrink-0">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:alert-triangle",
            class: "h-5 w-5 text-yellow-500"
          }, null, _parent));
          _push(`</div><div class="ml-3"><p class="text-sm text-yellow-700 dark:text-yellow-200">${ssrInterpolate_1(vueExports.unref(missingCount))} file(s) in this share are no longer available. </p></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="w-full">`);
        if (vueExports.unref(isVideo) && !vueExports.unref(isBatch)) {
          _push(`<div class="rounded-2xl overflow-hidden relative shadow-2xl bg-black ring-1 ring-white/10">`);
          if (vueExports.unref(isLoadingStream)) {
            _push(`<div class="flex items-center justify-center h-64 bg-gray-900 text-white">`);
            _push(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "w-8 h-8 animate-spin mr-2"
            }, null, _parent));
            _push(`<span>Preparing stream...</span></div>`);
          } else if (vueExports.unref(streamError)) {
            _push(`<div class="flex items-center justify-center h-64 bg-gray-900 text-red-500">`);
            _push(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:alert-circle",
              class: "w-8 h-8 mr-2"
            }, null, _parent));
            _push(`<span>${ssrInterpolate_1(vueExports.unref(streamError))}</span></div>`);
          } else if (vueExports.unref(videoSrc)) {
            _push(ssrRenderComponent_1(_component_MediaVideoPlayer, {
              src: vueExports.unref(videoSrc),
              type: vueExports.unref(videoType),
              title: vueExports.unref(fileInfo).fileName
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else if (vueExports.unref(isAudio) && !vueExports.unref(isBatch)) {
          _push(`<div class="bg-card border rounded-2xl p-8 shadow-sm flex flex-col items-center"><div class="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-[#0061FE]">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:music",
            class: "h-10 w-10"
          }, null, _parent));
          _push(`</div><h3 class="text-lg font-medium mb-6">${ssrInterpolate_1(vueExports.unref(fileInfo).fileName)}</h3><audio${ssrRenderAttr_1("src", streamUrl(0))} controls preload="metadata" class="w-full max-w-2xl"> Your browser does not support audio playback. </audio></div>`);
        } else if (vueExports.unref(isImage) && !vueExports.unref(isBatch)) {
          _push(`<div class="bg-muted/10 rounded-2xl overflow-hidden border shadow-sm flex justify-center"><img${ssrRenderAttr_1("src", streamUrl(0))}${ssrRenderAttr_1("alt", vueExports.unref(fileInfo).fileName)} class="max-w-full max-h-[80vh] object-contain shadow-md"></div>`);
        } else {
          _push(`<!---->`);
        }
        if (vueExports.unref(isBatch)) {
          _push(`<div class="bg-card border rounded-xl overflow-hidden shadow-sm"><div class="px-6 py-4 border-b bg-muted/30 flex items-center justify-between"><h3 class="font-semibold">Contains ${ssrInterpolate_1(vueExports.unref(files).length)} Files</h3></div><div class="divide-y max-h-[500px] overflow-auto"><!--[-->`);
          ssrRenderList_1(vueExports.unref(files), (file, idx) => {
            _push(`<div class="group flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"><div class="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#0061FE] shrink-0">`);
            _push(ssrRenderComponent_1(_component_Icon, {
              name: getFileIcon(file.name),
              class: "h-5 w-5"
            }, null, _parent));
            _push(`</div><div class="flex-1 min-w-0"><h4 class="${ssrRenderClass_1(["font-medium text-sm truncate", !file.available && "text-muted-foreground line-through"])}">${ssrInterpolate_1(file.name)}</h4><p class="text-xs text-muted-foreground mt-0.5">${ssrInterpolate_1(formatBytes(file.size))}</p></div><div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">`);
            if (file.available && isMediaFile(file.name)) {
              _push(`<button class="p-2 rounded-full hover:bg-background text-[#0061FE] transition-colors" title="Preview">`);
              _push(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:play-circle",
                class: "h-5 w-5"
              }, null, _parent));
              _push(`</button>`);
            } else {
              _push(`<!---->`);
            }
            if (file.available) {
              _push(`<button class="p-2 rounded-full hover:bg-background text-muted-foreground hover:text-foreground transition-colors" title="Download">`);
              _push(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:download",
                class: "h-5 w-5"
              }, null, _parent));
              _push(`</button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="md:hidden pt-4">`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          onClick: ($event) => vueExports.unref(isBatch) ? downloadAll() : downloadSingleFile(0),
          disabled: vueExports.unref(isDownloading),
          class: "w-full h-12 text-base rounded-full bg-[#0061FE]"
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate_1(vueExports.unref(isDownloading) ? "Downloading..." : "Download File")}`);
            } else {
              return [
                vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(isDownloading) ? "Downloading..." : "Download File"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main><footer class="py-8 text-center text-sm text-muted-foreground border-t mt-auto"><p>\xA9 2026 MultiBox. Secure file sharing.</p></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/file/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-DHMi3ra9.mjs.map
