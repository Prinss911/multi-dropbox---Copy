import { _ as __nuxt_component_1 } from './nuxt-link-DhuMLcvX.mjs';
import { a as _export_sfc, _ as __nuxt_component_0 } from './server.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1, h as ssrRenderClass_1, b as ssrInterpolate_1, f as ssrRenderList_1, j as ssrRenderStyle_1, i as ssrRenderAttr_1, k as ssrRenderTeleport_1 } from '../routes/renderer.mjs';
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

const MAX_TOTAL_SIZE = 1024 * 1024 * 1024;
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "upload",
  __ssrInlineRender: true,
  setup(__props) {
    vueExports.ref(null);
    const isDragging = vueExports.ref(false);
    const isUploading = vueExports.ref(false);
    const copied = vueExports.ref(false);
    const errorMessage = vueExports.ref(null);
    const expirationOptions = [
      { days: 1800, unit: "seconds", label: "30m" },
      { days: 1, unit: "days", label: "1d" },
      { days: 3, unit: "days", label: "3d" },
      { days: 7, unit: "days", label: "7d" },
      { days: 30, unit: "days", label: "1mo" }
    ];
    const selectedExpiration = vueExports.ref(7);
    const selectedExpirationUnit = vueExports.ref("days");
    const fileQueue = vueExports.ref([]);
    const uploadResult = vueExports.ref(null);
    const completedFiles = vueExports.computed(() => fileQueue.value.filter((f) => f.status === "done").length);
    const overallProgress = vueExports.computed(() => {
      if (fileQueue.value.length === 0) return 0;
      const total = fileQueue.value.reduce((sum, f) => sum + f.progress, 0);
      return Math.round(total / fileQueue.value.length);
    });
    const formatBytes = (bytes) => {
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    const getFileIcon = (filename) => {
      var _a;
      const ext = (_a = filename.split(".").pop()) == null ? void 0 : _a.toLowerCase();
      if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) return "lucide:image";
      if (["pdf"].includes(ext || "")) return "lucide:file-text";
      if (["mp4", "mov", "avi", "mkv"].includes(ext || "")) return "lucide:video";
      if (["zip", "rar", "7z"].includes(ext || "")) return "lucide:archive";
      if (["mp3", "wav"].includes(ext || "")) return "lucide:music";
      return "lucide:file";
    };
    const formatExpiry = (date) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1;
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden" }, _attrs))} data-v-ac632bb8><div class="absolute inset-0 z-0 pointer-events-none" data-v-ac632bb8><div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#0061FE]/10 rounded-full blur-[100px]" data-v-ac632bb8></div><div class="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" data-v-ac632bb8></div></div><header class="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10" data-v-ac632bb8>`);
      _push(ssrRenderComponent_1(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-2.5 font-semibold text-xl tracking-tight hover:opacity-80 transition-opacity"
      }, {
        default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20" data-v-ac632bb8${_scopeId}>`);
            _push2(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:hard-drive",
              class: "h-5 w-5"
            }, null, _parent2, _scopeId));
            _push2(`</div><span class="text-foreground" data-v-ac632bb8${_scopeId}>MultiBox</span>`);
          } else {
            return [
              vueExports.createVNode("div", { class: "h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20" }, [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:hard-drive",
                  class: "h-5 w-5"
                })
              ]),
              vueExports.createVNode("span", { class: "text-foreground" }, "MultiBox")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header><main class="w-full max-w-2xl px-4 relative z-10" data-v-ac632bb8><div class="bg-card/50 backdrop-blur-xl border shadow-xl rounded-2xl overflow-hidden transition-all duration-500" data-v-ac632bb8>`);
      if (!vueExports.unref(uploadResult) && !vueExports.unref(isUploading)) {
        _push(`<div class="p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-300" data-v-ac632bb8><div class="text-center space-y-3 mb-10" data-v-ac632bb8><h1 class="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" data-v-ac632bb8> Upload &amp; Share </h1><p class="text-muted-foreground text-lg" data-v-ac632bb8> Secure anonymous file sharing. </p></div><div class="${ssrRenderClass_1([
          "group relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer",
          vueExports.unref(isDragging) ? "border-[#0061FE] bg-[#0061FE]/5 scale-[1.02]" : "border-muted-foreground/20 hover:border-[#0061FE]/50 hover:bg-muted/30"
        ])}" data-v-ac632bb8><input type="file" class="hidden" multiple data-v-ac632bb8><div class="flex flex-col items-center gap-4 transition-transform duration-300 group-hover:-translate-y-1" data-v-ac632bb8><div class="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#0061FE]" data-v-ac632bb8>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:cloud-upload",
          class: "h-8 w-8 transition-transform duration-300 group-hover:scale-110"
        }, null, _parent));
        _push(`</div><div class="space-y-1" data-v-ac632bb8><p class="font-semibold text-lg" data-v-ac632bb8>Click to browse or drag files here</p><p class="text-sm text-muted-foreground" data-v-ac632bb8>Up to ${ssrInterpolate_1(formatBytes(MAX_TOTAL_SIZE))} total</p></div></div></div><div class="mt-10" data-v-ac632bb8><div class="flex items-center justify-center gap-2 mb-4" data-v-ac632bb8>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:clock",
          class: "h-4 w-4 text-muted-foreground"
        }, null, _parent));
        _push(`<span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-v-ac632bb8>Auto-Expire In</span></div><div class="flex flex-wrap justify-center gap-2" data-v-ac632bb8><!--[-->`);
        ssrRenderList_1(expirationOptions, (option) => {
          _push(`<button class="${ssrRenderClass_1([
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
            vueExports.unref(selectedExpiration) === option.days && vueExports.unref(selectedExpirationUnit) === option.unit ? "bg-[#0061FE] text-white border-[#0061FE] shadow-md shadow-blue-500/20" : "bg-background hover:bg-muted border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground"
          ])}" data-v-ac632bb8>${ssrInterpolate_1(option.label)}</button>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else if (vueExports.unref(isUploading)) {
        _push(`<div class="p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-300" data-v-ac632bb8><div class="text-center mb-8" data-v-ac632bb8><div class="flex items-center justify-center gap-3 text-[#0061FE] mb-2" data-v-ac632bb8>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "h-6 w-6 animate-spin"
        }, null, _parent));
        _push(`<span class="text-xl font-semibold" data-v-ac632bb8>Uploading...</span></div><p class="text-muted-foreground" data-v-ac632bb8>${ssrInterpolate_1(vueExports.unref(completedFiles))} of ${ssrInterpolate_1(vueExports.unref(fileQueue).length)} files uploaded</p></div><div class="bg-muted/50 rounded-full h-2 w-full overflow-hidden mb-8" data-v-ac632bb8><div class="bg-[#0061FE] h-full transition-all duration-300 ease-out rounded-full" style="${ssrRenderStyle_1({ width: `${vueExports.unref(overallProgress)}%` })}" data-v-ac632bb8></div></div><div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar" data-v-ac632bb8><!--[-->`);
        ssrRenderList_1(vueExports.unref(fileQueue), (file, idx) => {
          _push(`<div class="${ssrRenderClass_1([{ "border-red-500/20 bg-red-500/5": file.status === "error" }, "flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-transparent"])}" data-v-ac632bb8><div class="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0 shadow-sm" data-v-ac632bb8>`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: getFileIcon(file.file.name),
            class: "h-5 w-5 text-muted-foreground"
          }, null, _parent));
          _push(`</div><div class="flex-1 min-w-0" data-v-ac632bb8><div class="flex justify-between mb-1" data-v-ac632bb8><span class="font-medium text-sm truncate" data-v-ac632bb8>${ssrInterpolate_1(file.file.name)}</span><span class="text-xs font-mono text-muted-foreground ml-2 shrink-0" data-v-ac632bb8>${ssrInterpolate_1(file.status === "uploading" ? `${file.progress}%` : file.status === "done" ? "Done" : file.status === "error" ? "Failed" : "Pending")}</span></div><div class="h-1 w-full bg-muted rounded-full overflow-hidden" data-v-ac632bb8><div class="${ssrRenderClass_1([[
            file.status === "done" ? "bg-green-500" : file.status === "error" ? "bg-red-500" : "bg-[#0061FE]"
          ], "h-full transition-all duration-300"])}" style="${ssrRenderStyle_1({ width: `${file.progress}%` })}" data-v-ac632bb8></div></div></div><div class="shrink-0" data-v-ac632bb8>`);
          if (file.status === "done") {
            _push(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:check-circle-2",
              class: "h-5 w-5 text-green-500"
            }, null, _parent));
          } else if (file.status === "error") {
            _push(ssrRenderComponent_1(_component_Icon, {
              name: "lucide:alert-circle",
              class: "h-5 w-5 text-red-500"
            }, null, _parent));
          } else {
            _push(`<div class="h-5 w-5 rounded-full border-2 border-muted border-t-transparent animate-spin" style="${ssrRenderStyle_1(file.status === "uploading" ? null : { display: "none" })}" data-v-ac632bb8></div>`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else if (vueExports.unref(uploadResult)) {
        _push(`<div class="p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500" data-v-ac632bb8><div class="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-bounce-slow" data-v-ac632bb8>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:check",
          class: "h-10 w-10"
        }, null, _parent));
        _push(`</div><h2 class="text-2xl font-bold mb-2" data-v-ac632bb8>Upload Complete!</h2><p class="text-muted-foreground mb-8" data-v-ac632bb8>Your files are ready to share.</p><div class="bg-muted/30 rounded-xl p-1 mb-8 border" data-v-ac632bb8><div class="flex items-center gap-2 p-3" data-v-ac632bb8><div class="h-10 w-10 bg-background rounded-lg flex items-center justify-center text-[#0061FE] shrink-0 border" data-v-ac632bb8>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:link-2",
          class: "h-5 w-5"
        }, null, _parent));
        _push(`</div><input type="text"${ssrRenderAttr_1("value", vueExports.unref(uploadResult).url)} readonly class="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm text-foreground overflow-ellipsis" data-v-ac632bb8><button class="${ssrRenderClass_1([[
          vueExports.unref(copied) ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-[#0061FE] text-white hover:bg-[#0057E5] shadow-lg shadow-blue-500/20"
        ], "h-10 px-5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"])}" data-v-ac632bb8>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: vueExports.unref(copied) ? "lucide:check" : "lucide:copy",
          class: "h-4 w-4"
        }, null, _parent));
        _push(` ${ssrInterpolate_1(vueExports.unref(copied) ? "Copied" : "Copy")}</button></div><div class="px-4 py-2 border-t flex justify-between text-xs text-muted-foreground bg-muted/20" data-v-ac632bb8><span data-v-ac632bb8>Expires: <span class="font-medium text-foreground" data-v-ac632bb8>${ssrInterpolate_1(formatExpiry(vueExports.unref(uploadResult).expiresAt))}</span></span><span data-v-ac632bb8>${ssrInterpolate_1(vueExports.unref(uploadResult).fileCount)} files</span></div></div><button class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 mx-auto" data-v-ac632bb8>`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:refresh-ccw",
          class: "h-3 w-3"
        }, null, _parent));
        _push(` Upload more files </button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><p class="text-center text-xs text-muted-foreground mt-8 opacity-60" data-v-ac632bb8> \xA9 ${ssrInterpolate_1((/* @__PURE__ */ new Date()).getFullYear())} MultiBox. Secure, fast, and anonymous file sharing. </p></main>`);
      ssrRenderTeleport_1(_push, (_push2) => {
        if (vueExports.unref(errorMessage)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" data-v-ac632bb8><div class="bg-card w-full max-w-sm rounded-xl shadow-2xl border p-6 animate-in zoom-in-95 duration-200" data-v-ac632bb8><div class="flex items-center gap-4 mb-4 text-red-500" data-v-ac632bb8><div class="p-2 bg-red-100 dark:bg-red-500/10 rounded-full" data-v-ac632bb8>`);
          _push2(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:alert-triangle",
            class: "h-6 w-6"
          }, null, _parent));
          _push2(`</div><h3 class="font-semibold text-lg text-foreground" data-v-ac632bb8>Upload Error</h3></div><p class="text-muted-foreground mb-6 text-sm leading-relaxed" data-v-ac632bb8>${ssrInterpolate_1(vueExports.unref(errorMessage))}</p><div class="flex justify-end" data-v-ac632bb8><button class="px-4 py-2 bg-background border hover:bg-muted text-foreground rounded-lg text-sm font-medium transition-colors" data-v-ac632bb8> Close </button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/drive/upload.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const upload = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ac632bb8"]]);

export { upload as default };
//# sourceMappingURL=upload-Bkpe00fX.mjs.map
