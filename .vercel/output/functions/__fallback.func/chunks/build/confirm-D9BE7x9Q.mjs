import { u as useRouter, b as useRoute, _ as __nuxt_component_0, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$1 } from './Button-D1R6eqR9.mjs';
import { _ as _sfc_main$2 } from './Input-QSQMvZ04.mjs';
import { a as useSupabaseClient } from './useSupabase-BKfis0hW.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1, b as ssrInterpolate_1 } from '../routes/renderer.mjs';
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
import '../_/index.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "confirm",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    useRouter();
    useRoute();
    const password = vueExports.ref("");
    const confirmPassword = vueExports.ref("");
    const showPassword = vueExports.ref(false);
    const showConfirmPassword = vueExports.ref(false);
    const isLoading = vueExports.ref(false);
    const isVerifying = vueExports.ref(true);
    const isSessionValid = vueExports.ref(false);
    const error = vueExports.ref("");
    const formError = vueExports.ref("");
    const passwordError = vueExports.ref("");
    const validatePassword = (isInput = false) => {
      if (isInput && !confirmPassword.value) {
        passwordError.value = "";
        return false;
      }
      if (password.value !== confirmPassword.value) {
        passwordError.value = "Passwords don't match";
        return false;
      }
      if (password.value.length < 8) {
        if (!isInput) {
          passwordError.value = "Password must be at least 8 characters";
        }
        return false;
      }
      passwordError.value = "";
      return true;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_UiButton = _sfc_main$1;
      const _component_UiInput = _sfc_main$2;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "min-h-screen bg-muted/30 flex items-center justify-center p-4" }, _attrs))}><div class="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border shadow-sm">`);
      if (vueExports.unref(isVerifying)) {
        _push(`<div class="text-center space-y-4"><div class="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "h-5 w-5 animate-spin"
        }, null, _parent));
        _push(`</div><p class="text-muted-foreground">Verifying your link...</p></div>`);
      } else if (vueExports.unref(error) && !vueExports.unref(isSessionValid)) {
        _push(`<div class="text-center space-y-4"><div class="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:x-circle",
          class: "h-6 w-6"
        }, null, _parent));
        _push(`</div><h1 class="text-xl font-semibold">Link Invalid</h1><p class="text-sm text-muted-foreground">${ssrInterpolate_1(vueExports.unref(error))}</p>`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : vueExports.unref(navigateTo))("/login"),
          variant: "outline",
          class: "mt-4"
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:arrow-left",
                class: "mr-2 h-4 w-4"
              }, null, _parent2, _scopeId));
              _push2(` Back to Login `);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:arrow-left",
                  class: "mr-2 h-4 w-4"
                }),
                vueExports.createTextVNode(" Back to Login ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!--[--><div class="text-center space-y-2"><div class="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:key",
          class: "h-5 w-5"
        }, null, _parent));
        _push(`</div><h1 class="text-2xl font-semibold tracking-tight">Set Password</h1><p class="text-sm text-muted-foreground">Please set a secure password to complete your account setup.</p></div><form class="space-y-4"><div class="space-y-2"><label class="text-sm font-medium leading-none" for="password"> New Password </label><div class="relative">`);
        _push(ssrRenderComponent_1(_component_UiInput, {
          id: "password",
          modelValue: vueExports.unref(password),
          "onUpdate:modelValue": ($event) => vueExports.isRef(password) ? password.value = $event : null,
          type: vueExports.unref(showPassword) ? "text" : "password",
          required: "",
          minlength: "8",
          placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
          disabled: vueExports.unref(isLoading),
          class: "pr-10"
        }, null, _parent));
        _push(`<button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: vueExports.unref(showPassword) ? "lucide:eye-off" : "lucide:eye",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button></div></div><div class="space-y-2"><label class="text-sm font-medium leading-none" for="confirmPassword"> Confirm Password </label><div class="relative">`);
        _push(ssrRenderComponent_1(_component_UiInput, {
          id: "confirmPassword",
          modelValue: vueExports.unref(confirmPassword),
          "onUpdate:modelValue": ($event) => vueExports.isRef(confirmPassword) ? confirmPassword.value = $event : null,
          type: vueExports.unref(showConfirmPassword) ? "text" : "password",
          required: "",
          minlength: "8",
          placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
          disabled: vueExports.unref(isLoading),
          class: "pr-10 " + (vueExports.unref(passwordError) ? "border-destructive focus-visible:ring-destructive" : ""),
          onInput: ($event) => validatePassword(true)
        }, null, _parent));
        _push(`<button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: vueExports.unref(showConfirmPassword) ? "lucide:eye-off" : "lucide:eye",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button></div>`);
        if (vueExports.unref(passwordError)) {
          _push(`<p class="text-xs text-destructive mt-1 flex items-center gap-1">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:alert-circle",
            class: "h-3 w-3"
          }, null, _parent));
          _push(` ${ssrInterpolate_1(vueExports.unref(passwordError))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          class: "w-full",
          type: "submit",
          disabled: vueExports.unref(isLoading)
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (vueExports.unref(isLoading)) {
                _push2(ssrRenderComponent_1(_component_Icon, {
                  name: "lucide:loader-2",
                  class: "mr-2 h-4 w-4 animate-spin"
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(` Complete Setup `);
            } else {
              return [
                vueExports.unref(isLoading) ? (vueExports.openBlock(), vueExports.createBlock(_component_Icon, {
                  key: 0,
                  name: "lucide:loader-2",
                  class: "mr-2 h-4 w-4 animate-spin"
                })) : vueExports.createCommentVNode("", true),
                vueExports.createTextVNode(" Complete Setup ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form>`);
        if (vueExports.unref(formError)) {
          _push(`<div class="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">`);
          _push(ssrRenderComponent_1(_component_Icon, {
            name: "lucide:alert-circle",
            class: "h-4 w-4"
          }, null, _parent));
          _push(` ${ssrInterpolate_1(vueExports.unref(formError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/confirm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=confirm-D9BE7x9Q.mjs.map
