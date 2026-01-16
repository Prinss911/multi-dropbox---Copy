import { b as useRoute, _ as __nuxt_component_0 } from './server.mjs';
import { _ as __nuxt_component_3 } from './VideoPlayer-9LG838lG.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1, b as ssrInterpolate_1, i as ssrRenderAttr_1 } from '../routes/renderer.mjs';
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
import './VisuallyHidden-6QTMh8_p.mjs';
import '../_/index.mjs';
import './Primitive-D3IcFg81.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const shareId = route.params.id;
    const videoExtensions = ["mp4", "webm", "mkv", "avi", "mov"];
    const audioExtensions = ["mp3", "wav", "ogg", "flac", "m4a"];
    const getFileExt = (name) => {
      var _a;
      return ((_a = name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
    };
    const fileInfo = vueExports.ref(null);
    const isLoading = vueExports.ref(true);
    const error = vueExports.ref(null);
    const isLoadingStream = vueExports.ref(false);
    const videoSrc = vueExports.ref("");
    const videoType = vueExports.ref("video/mp4");
    const files = vueExports.computed(() => {
      var _a;
      return ((_a = fileInfo.value) == null ? void 0 : _a.files) || [];
    });
    vueExports.computed(() => files.value.length > 1);
    const isVideo = vueExports.computed(() => {
      if (files.value.length !== 1) return false;
      return videoExtensions.includes(getFileExt(files.value[0].name));
    });
    const isAudio = vueExports.computed(() => {
      if (files.value.length !== 1) return false;
      return audioExtensions.includes(getFileExt(files.value[0].name));
    });
    const streamUrl = (index) => `/api/shares/${shareId}/stream?fileIndex=${index}`;
    vueExports.ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_MediaVideoPlayer = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "h-screen w-screen bg-black overflow-hidden relative font-sans" }, _attrs))}>`);
      if (vueExports.unref(isLoading)) {
        _push(`<div class="absolute inset-0 flex flex-col items-center justify-center text-white z-50 bg-black">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "w-10 h-10 animate-spin mb-4 text-blue-500"
        }, null, _parent));
        _push(`<p class="text-sm text-gray-400">Loading media...</p></div>`);
      } else if (vueExports.unref(error)) {
        _push(`<div class="absolute inset-0 flex flex-col items-center justify-center text-white z-50 bg-black p-4 text-center"><div class="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:alert-circle",
          class: "w-8 h-8 text-red-500"
        }, null, _parent));
        _push(`</div><h3 class="text-lg font-bold mb-2">Media Unavailable</h3><p class="text-gray-400 max-w-md">${ssrInterpolate_1(vueExports.unref(error))}</p></div>`);
      } else if (vueExports.unref(fileInfo)) {
        _push(`<div class="w-full h-full">`);
        if (vueExports.unref(isVideo)) {
          _push(`<div class="w-full h-full relative group">`);
          if (vueExports.unref(isLoadingStream)) {
            _push(`<div class="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm text-white">`);
            _push(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:loader-2",
              class: "w-10 h-10 animate-spin text-blue-500"
            }, null, _parent));
            _push(`<span class="ml-3 font-medium">Preparing stream...</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (vueExports.unref(videoSrc)) {
            _push(ssrRenderComponent_1(_component_MediaVideoPlayer, {
              src: vueExports.unref(videoSrc),
              type: vueExports.unref(videoType),
              title: vueExports.unref(fileInfo).fileName,
              class: "w-full h-full [&>.video-js]:w-full [&>.video-js]:h-full",
              autoplay: ""
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else if (vueExports.unref(isAudio)) {
          _push(`<div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8"><div class="w-32 h-32 bg-indigo-500/20 rounded-full flex items-center justify-center mb-8 animate-pulse">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:music",
            class: "w-16 h-16 text-indigo-400"
          }, null, _parent));
          _push(`</div><h1 class="text-xl font-bold mb-8 text-center px-4">${ssrInterpolate_1(vueExports.unref(fileInfo).fileName)}</h1><audio${ssrRenderAttr_1("src", streamUrl(0))} controls class="w-full max-w-md" autoplay></audio></div>`);
        } else {
          _push(`<div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:file-question",
            class: "w-16 h-16 text-gray-500 mb-4"
          }, null, _parent));
          _push(`<p class="text-lg mb-4">This file type cannot be embedded.</p><a${ssrRenderAttr_1("href", `/file/${vueExports.unref(shareId)}`)} target="_blank" class="px-6 py-2 bg-blue-600 rounded-full text-sm hover:bg-blue-700 transition flex items-center">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:external-link",
            class: "w-4 h-4 mr-2"
          }, null, _parent));
          _push(` View File Page </a></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/embed/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BcH9WBAa.mjs.map
