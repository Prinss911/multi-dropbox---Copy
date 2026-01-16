import { _ as __nuxt_component_0 } from './server.mjs';
import { _ as _sfc_main$1 } from './Button-D1R6eqR9.mjs';
import { _ as _sfc_main$5, a as _sfc_main$4, b as _sfc_main$3, c as _sfc_main$2, d as _sfc_main$1$1, e as _sfc_main$6 } from './TableCell-C0gOs1vp.mjs';
import { a as useDropboxFiles, u as useAccounts } from './useDropboxFiles-OACIDE_L.mjs';
import { v as vueExports, s as ssrRenderAttrs_1, a as ssrRenderComponent_1, b as ssrInterpolate_1, f as ssrRenderList_1, h as ssrRenderClass_1 } from '../routes/renderer.mjs';
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
import './useSupabase-BKfis0hW.mjs';
import './useAuthFetch-BRq2GRoU.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "recent",
  __ssrInlineRender: true,
  setup(__props) {
    const { formatFileSize, formatDate, getFileIcon, getIconColor } = useDropboxFiles();
    const { accounts } = useAccounts();
    const files = vueExports.ref([]);
    const isLoading = vueExports.ref(true);
    const error = vueExports.ref(null);
    const fetchRecent = async () => {
      var _a;
      isLoading.value = true;
      error.value = null;
      files.value = [];
      try {
        const promises = accounts.value.map(async (acc) => {
          try {
            const response = await $fetch("/api/dropbox/recent", {
              query: { accountId: acc.id }
            });
            return response.entries.map((e) => ({
              ...e,
              accountId: acc.id,
              accountName: acc.name
            }));
          } catch (err) {
            console.warn(`Failed to fetch recent for ${acc.name}:`, err);
            return [];
          }
        });
        const results = await Promise.all(promises);
        const allFiles = results.flat();
        files.value = allFiles.sort((a, b) => {
          const dateA = a.modified ? new Date(a.modified).getTime() : 0;
          const dateB = b.modified ? new Date(b.modified).getTime() : 0;
          return dateB - dateA;
        });
      } catch (err) {
        error.value = ((_a = err.data) == null ? void 0 : _a.message) || err.message || "Failed to load recent files";
      } finally {
        isLoading.value = false;
      }
    };
    vueExports.watch(accounts, () => {
      fetchRecent();
    }, { deep: true });
    const getParentPath = (path) => {
      if (!path) return "/";
      const parts = path.split("/");
      parts.pop();
      return parts.join("/") || "/";
    };
    const handleFileClick = async (entry) => {
      try {
        const response = await $fetch("/api/dropbox/download", {
          query: { path: entry.path, accountId: entry.accountId }
        });
        if (response.link) {
          (void 0).open(response.link, "_blank");
        }
      } catch (err) {
        console.error("Error opening file:", err);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_UiButton = _sfc_main$1;
      const _component_UiTable = _sfc_main$5;
      const _component_UiTableHeader = _sfc_main$4;
      const _component_UiTableRow = _sfc_main$3;
      const _component_UiTableHead = _sfc_main$2;
      const _component_UiTableBody = _sfc_main$1$1;
      const _component_UiTableCell = _sfc_main$6;
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "space-y-4" }, _attrs))}><div class="flex items-center justify-between"><div class="flex items-center gap-3"><div class="p-2 rounded-lg bg-blue-500/10">`);
      _push(ssrRenderComponent_1(_component_Icon, {
        name: "lucide:clock",
        class: "h-5 w-5 text-blue-500"
      }, null, _parent));
      _push(`</div><div><h1 class="text-xl font-semibold">Recent Files</h1><p class="text-sm text-muted-foreground">Files you&#39;ve recently accessed or modified</p></div></div></div>`);
      if (vueExports.unref(isLoading)) {
        _push(`<div class="rounded-md border bg-card p-8"><div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:loader-2",
          class: "h-8 w-8 animate-spin"
        }, null, _parent));
        _push(`<p>Loading recent files...</p></div></div>`);
      } else if (vueExports.unref(error)) {
        _push(`<div class="rounded-md border border-destructive/50 bg-destructive/10 p-8"><div class="flex flex-col items-center justify-center gap-2 text-destructive">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:alert-circle",
          class: "h-8 w-8"
        }, null, _parent));
        _push(`<p class="font-medium">Failed to load recent files</p><p class="text-sm">${ssrInterpolate_1(vueExports.unref(error))}</p>`);
        _push(ssrRenderComponent_1(_component_UiButton, {
          variant: "outline",
          size: "sm",
          onClick: fetchRecent,
          class: "mt-2"
        }, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_Icon, {
                name: "lucide:refresh-cw",
                class: "mr-2 h-4 w-4"
              }, null, _parent2, _scopeId));
              _push2(` Retry `);
            } else {
              return [
                vueExports.createVNode(_component_Icon, {
                  name: "lucide:refresh-cw",
                  class: "mr-2 h-4 w-4"
                }),
                vueExports.createTextVNode(" Retry ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else if (vueExports.unref(files).length === 0) {
        _push(`<div class="rounded-md border-2 border-dashed bg-card p-12"><div class="flex flex-col items-center justify-center gap-3 text-muted-foreground">`);
        _push(ssrRenderComponent_1(_component_Icon, {
          name: "lucide:clock",
          class: "h-16 w-16"
        }, null, _parent));
        _push(`<p class="font-medium text-lg">No recent files</p><p class="text-sm">Files you access or modify will appear here</p></div></div>`);
      } else {
        _push(`<div class="rounded-md border bg-card text-card-foreground shadow-sm">`);
        _push(ssrRenderComponent_1(_component_UiTable, null, {
          default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent_1(_component_UiTableHeader, null, {
                default: vueExports.withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent_1(_component_UiTableRow, { class: "hover:bg-transparent" }, {
                      default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "min-w-[200px]" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Name`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Name")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Account`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Account")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Location`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Location")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Size`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Size")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                          _push4(ssrRenderComponent_1(_component_UiTableHead, { class: "text-right hidden md:table-cell" }, {
                            default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`Modified`);
                              } else {
                                return [
                                  vueExports.createTextVNode("Modified")
                                ];
                              }
                            }),
                            _: 1
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            vueExports.createVNode(_component_UiTableHead, { class: "min-w-[200px]" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Name")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Account")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Location")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Size")
                              ]),
                              _: 1
                            }),
                            vueExports.createVNode(_component_UiTableHead, { class: "text-right hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode("Modified")
                              ]),
                              _: 1
                            })
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      vueExports.createVNode(_component_UiTableRow, { class: "hover:bg-transparent" }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createVNode(_component_UiTableHead, { class: "min-w-[200px]" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Name")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Account")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Location")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Size")
                            ]),
                            _: 1
                          }),
                          vueExports.createVNode(_component_UiTableHead, { class: "text-right hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode("Modified")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent_1(_component_UiTableBody, null, {
                default: vueExports.withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<!--[-->`);
                    ssrRenderList_1(vueExports.unref(files), (entry) => {
                      _push3(ssrRenderComponent_1(_component_UiTableRow, {
                        key: entry.id,
                        class: "group cursor-pointer hover:bg-muted/50",
                        onClick: ($event) => handleFileClick(entry)
                      }, {
                        default: vueExports.withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<div class="${ssrRenderClass_1(["p-2 rounded shrink-0", vueExports.unref(getIconColor)(entry)])}"${_scopeId4}>`);
                                  _push5(ssrRenderComponent_1(_component_Icon, {
                                    name: vueExports.unref(getFileIcon)(entry),
                                    class: "h-4 w-4"
                                  }, null, _parent5, _scopeId4));
                                  _push5(`</div><div class="flex flex-col min-w-0"${_scopeId4}><span class="text-sm font-medium text-foreground truncate"${_scopeId4}>${ssrInterpolate_1(entry.name)}</span><span class="text-xs text-muted-foreground md:hidden"${_scopeId4}>${ssrInterpolate_1(entry.accountName)} \u2022 ${ssrInterpolate_1(vueExports.unref(formatFileSize)(entry.size))}</span></div>`);
                                } else {
                                  return [
                                    vueExports.createVNode("div", {
                                      class: ["p-2 rounded shrink-0", vueExports.unref(getIconColor)(entry)]
                                    }, [
                                      vueExports.createVNode(_component_Icon, {
                                        name: vueExports.unref(getFileIcon)(entry),
                                        class: "h-4 w-4"
                                      }, null, 8, ["name"])
                                    ], 2),
                                    vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                      vueExports.createVNode("span", { class: "text-sm font-medium text-foreground truncate" }, vueExports.toDisplayString(entry.name), 1),
                                      vueExports.createVNode("span", { class: "text-xs text-muted-foreground md:hidden" }, vueExports.toDisplayString(entry.accountName) + " \u2022 " + vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                                    ])
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<span class="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground"${_scopeId4}>${ssrInterpolate_1(entry.accountName)}</span>`);
                                } else {
                                  return [
                                    vueExports.createVNode("span", { class: "text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "text-muted-foreground text-sm hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate_1(getParentPath(entry.path))}`);
                                } else {
                                  return [
                                    vueExports.createTextVNode(vueExports.toDisplayString(getParentPath(entry.path)), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate_1(vueExports.unref(formatFileSize)(entry.size))}`);
                                } else {
                                  return [
                                    vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                            _push4(ssrRenderComponent_1(_component_UiTableCell, { class: "text-right text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate_1(vueExports.unref(formatDate)(entry.modified))}`);
                                } else {
                                  return [
                                    vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          } else {
                            return [
                              vueExports.createVNode(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createVNode("div", {
                                    class: ["p-2 rounded shrink-0", vueExports.unref(getIconColor)(entry)]
                                  }, [
                                    vueExports.createVNode(_component_Icon, {
                                      name: vueExports.unref(getFileIcon)(entry),
                                      class: "h-4 w-4"
                                    }, null, 8, ["name"])
                                  ], 2),
                                  vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                    vueExports.createVNode("span", { class: "text-sm font-medium text-foreground truncate" }, vueExports.toDisplayString(entry.name), 1),
                                    vueExports.createVNode("span", { class: "text-xs text-muted-foreground md:hidden" }, vueExports.toDisplayString(entry.accountName) + " \u2022 " + vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                                  ])
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createVNode("span", { class: "text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1)
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground text-sm hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createTextVNode(vueExports.toDisplayString(getParentPath(entry.path)), 1)
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                                ]),
                                _: 2
                              }, 1024),
                              vueExports.createVNode(_component_UiTableCell, { class: "text-right text-muted-foreground hidden md:table-cell" }, {
                                default: vueExports.withCtx(() => [
                                  vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                                ]),
                                _: 2
                              }, 1024)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    });
                    _push3(`<!--]-->`);
                  } else {
                    return [
                      (vueExports.openBlock(true), vueExports.createBlock(vueExports.Fragment, null, vueExports.renderList(vueExports.unref(files), (entry) => {
                        return vueExports.openBlock(), vueExports.createBlock(_component_UiTableRow, {
                          key: entry.id,
                          class: "group cursor-pointer hover:bg-muted/50",
                          onClick: ($event) => handleFileClick(entry)
                        }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createVNode(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("div", {
                                  class: ["p-2 rounded shrink-0", vueExports.unref(getIconColor)(entry)]
                                }, [
                                  vueExports.createVNode(_component_Icon, {
                                    name: vueExports.unref(getFileIcon)(entry),
                                    class: "h-4 w-4"
                                  }, null, 8, ["name"])
                                ], 2),
                                vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                  vueExports.createVNode("span", { class: "text-sm font-medium text-foreground truncate" }, vueExports.toDisplayString(entry.name), 1),
                                  vueExports.createVNode("span", { class: "text-xs text-muted-foreground md:hidden" }, vueExports.toDisplayString(entry.accountName) + " \u2022 " + vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                                ])
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createVNode("span", { class: "text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1)
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground text-sm hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode(vueExports.toDisplayString(getParentPath(entry.path)), 1)
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                              ]),
                              _: 2
                            }, 1024),
                            vueExports.createVNode(_component_UiTableCell, { class: "text-right text-muted-foreground hidden md:table-cell" }, {
                              default: vueExports.withCtx(() => [
                                vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          _: 2
                        }, 1032, ["onClick"]);
                      }), 128))
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                vueExports.createVNode(_component_UiTableHeader, null, {
                  default: vueExports.withCtx(() => [
                    vueExports.createVNode(_component_UiTableRow, { class: "hover:bg-transparent" }, {
                      default: vueExports.withCtx(() => [
                        vueExports.createVNode(_component_UiTableHead, { class: "min-w-[200px]" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Name")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Account")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Location")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "hidden md:table-cell" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Size")
                          ]),
                          _: 1
                        }),
                        vueExports.createVNode(_component_UiTableHead, { class: "text-right hidden md:table-cell" }, {
                          default: vueExports.withCtx(() => [
                            vueExports.createTextVNode("Modified")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                vueExports.createVNode(_component_UiTableBody, null, {
                  default: vueExports.withCtx(() => [
                    (vueExports.openBlock(true), vueExports.createBlock(vueExports.Fragment, null, vueExports.renderList(vueExports.unref(files), (entry) => {
                      return vueExports.openBlock(), vueExports.createBlock(_component_UiTableRow, {
                        key: entry.id,
                        class: "group cursor-pointer hover:bg-muted/50",
                        onClick: ($event) => handleFileClick(entry)
                      }, {
                        default: vueExports.withCtx(() => [
                          vueExports.createVNode(_component_UiTableCell, { class: "font-medium flex items-center gap-3 py-3" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("div", {
                                class: ["p-2 rounded shrink-0", vueExports.unref(getIconColor)(entry)]
                              }, [
                                vueExports.createVNode(_component_Icon, {
                                  name: vueExports.unref(getFileIcon)(entry),
                                  class: "h-4 w-4"
                                }, null, 8, ["name"])
                              ], 2),
                              vueExports.createVNode("div", { class: "flex flex-col min-w-0" }, [
                                vueExports.createVNode("span", { class: "text-sm font-medium text-foreground truncate" }, vueExports.toDisplayString(entry.name), 1),
                                vueExports.createVNode("span", { class: "text-xs text-muted-foreground md:hidden" }, vueExports.toDisplayString(entry.accountName) + " \u2022 " + vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                              ])
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createVNode("span", { class: "text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground" }, vueExports.toDisplayString(entry.accountName), 1)
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground text-sm hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode(vueExports.toDisplayString(getParentPath(entry.path)), 1)
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "text-muted-foreground hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatFileSize)(entry.size)), 1)
                            ]),
                            _: 2
                          }, 1024),
                          vueExports.createVNode(_component_UiTableCell, { class: "text-right text-muted-foreground hidden md:table-cell" }, {
                            default: vueExports.withCtx(() => [
                              vueExports.createTextVNode(vueExports.toDisplayString(vueExports.unref(formatDate)(entry.modified)), 1)
                            ]),
                            _: 2
                          }, 1024)
                        ]),
                        _: 2
                      }, 1032, ["onClick"]);
                    }), 128))
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/recent.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=recent-CCThVP8r.mjs.map
