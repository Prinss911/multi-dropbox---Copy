import { u as useState } from './useSupabase-BKfis0hW.mjs';
import { u as useAuthFetch } from './useAuthFetch-BRq2GRoU.mjs';
import { v as vueExports } from '../routes/renderer.mjs';

const useAccounts = () => {
  const accounts = useState("accounts", () => []);
  const activeAccountId = useState("activeAccountId", () => "");
  const isLoading = useState("accounts-loading", () => false);
  const isAddingAccount = useState("adding-account", () => false);
  const initFromStorage = () => {
  };
  const saveToStorage = (accountId) => {
  };
  const fetchAccounts = async () => {
    isLoading.value = true;
    try {
      const { authFetch } = useAuthFetch();
      const response = await authFetch("/api/accounts");
      accounts.value = response.accounts;
      initFromStorage();
      if (!activeAccountId.value && response.activeAccountId) {
        activeAccountId.value = response.activeAccountId;
      }
      if (activeAccountId.value && !accounts.value.find((a) => a.id === activeAccountId.value)) {
        if (accounts.value.length > 0) {
          activeAccountId.value = accounts.value[0].id;
          saveToStorage(activeAccountId.value);
        }
      }
      if (!activeAccountId.value && accounts.value.length > 0) {
        activeAccountId.value = accounts.value[0].id;
        saveToStorage(activeAccountId.value);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      isLoading.value = false;
    }
  };
  const switchAccount = async (accountId) => {
    activeAccountId.value = accountId;
    accounts.value = accounts.value.map((a) => ({
      ...a,
      isActive: a.id === accountId
    }));
    try {
      const { authFetch } = useAuthFetch();
      await authFetch("/api/accounts/switch", {
        method: "POST",
        body: { accountId }
      });
    } catch (error) {
      console.error("Error syncing account switch to DB:", error);
    }
    return true;
  };
  const getAuthUrl = (appKey) => {
    return `https://www.dropbox.com/oauth2/authorize?client_id=${appKey}&response_type=code&token_access_type=offline`;
  };
  const addAccount = async (code, appKey, appSecret, name) => {
    var _a, _b;
    isAddingAccount.value = true;
    try {
      const { authFetch } = useAuthFetch();
      const response = await authFetch("/api/accounts/add", {
        method: "POST",
        body: { code, appKey, appSecret, name }
      });
      if (response.success) {
        await fetchAccounts();
        if ((_a = response.account) == null ? void 0 : _a.id) {
          activeAccountId.value = response.account.id;
          saveToStorage(response.account.id);
        }
        return { success: true, account: response.account };
      }
      return { success: false, error: "Unknown error" };
    } catch (error) {
      console.error("Error adding account:", error);
      return {
        success: false,
        error: ((_b = error.data) == null ? void 0 : _b.message) || error.message || "Failed to add account"
      };
    } finally {
      isAddingAccount.value = false;
    }
  };
  const removeAccount = async (accountId) => {
    try {
      const { authFetch } = useAuthFetch();
      await authFetch("/api/accounts/delete", {
        method: "POST",
        body: { accountId }
      });
      accounts.value = accounts.value.filter((a) => a.id !== accountId);
      if (activeAccountId.value === accountId && accounts.value.length > 0) {
        activeAccountId.value = accounts.value[0].id;
        saveToStorage(activeAccountId.value);
      } else if (accounts.value.length === 0) {
        activeAccountId.value = "";
        if (false) ;
      }
      return true;
    } catch (error) {
      console.error("Error removing account:", error);
      return false;
    }
  };
  const activeAccount = vueExports.computed(() => {
    return accounts.value.find((a) => a.id === activeAccountId.value);
  });
  return {
    accounts,
    activeAccountId,
    activeAccount,
    isLoading,
    isAddingAccount,
    fetchAccounts,
    switchAccount,
    getAuthUrl,
    addAccount,
    removeAccount
  };
};
const useDropboxFiles = (explicitAccountId) => {
  const { activeAccountId } = useAccounts();
  const stateSuffix = explicitAccountId ? `-${explicitAccountId}` : "-main";
  const targetAccountId = vueExports.computed(() => explicitAccountId || activeAccountId.value);
  const currentPath = useState(`dropbox-path${stateSuffix}`, () => "");
  const files = useState(`dropbox-files${stateSuffix}`, () => []);
  const isLoading = useState(`dropbox-loading${stateSuffix}`, () => false);
  const error = useState(`dropbox-error${stateSuffix}`, () => null);
  const selectedIds = useState(`dropbox-selected${stateSuffix}`, () => /* @__PURE__ */ new Set());
  const selectedFiles = vueExports.computed(() => {
    return files.value.filter((f) => selectedIds.value.has(f.id));
  });
  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds.value);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    selectedIds.value = newSet;
  };
  const selectAll = () => {
    selectedIds.value = new Set(files.value.map((f) => f.id));
  };
  const clearSelection = () => {
    selectedIds.value = /* @__PURE__ */ new Set();
  };
  const isSelected = (id) => selectedIds.value.has(id);
  const isAllSelected = vueExports.computed(() => {
    return files.value.length > 0 && selectedIds.value.size === files.value.length;
  });
  const fetchFiles = async (path = "", clearImmediately = false) => {
    var _a;
    isLoading.value = true;
    error.value = null;
    clearSelection();
    if (!targetAccountId.value) {
      isLoading.value = false;
      return;
    }
    if (clearImmediately) {
      files.value = [];
    }
    try {
      const response = await $fetch("/api/dropbox/files", {
        query: { path, accountId: targetAccountId.value }
      });
      files.value = response.entries;
      currentPath.value = path;
    } catch (err) {
      console.error("Error fetching files:", err);
      error.value = ((_a = err.data) == null ? void 0 : _a.message) || err.message || "Failed to load files";
      files.value = [];
    } finally {
      isLoading.value = false;
    }
  };
  const navigateToFolder = (folderPath) => {
    fetchFiles(folderPath);
  };
  const navigateUp = () => {
    if (!currentPath.value) return;
    const parts = currentPath.value.split("/");
    parts.pop();
    const parentPath = parts.join("/");
    fetchFiles(parentPath);
  };
  const getDownloadLink = async (filePath) => {
    try {
      const response = await $fetch("/api/dropbox/download", {
        query: { path: filePath, accountId: targetAccountId.value }
      });
      return response.link;
    } catch (err) {
      console.error("Error getting download link:", err);
      return null;
    }
  };
  const createFolder = async (name) => {
    var _a;
    try {
      await $fetch("/api/dropbox/folder", {
        method: "POST",
        body: { path: currentPath.value, name, accountId: targetAccountId.value }
      });
      await fetchFiles(currentPath.value);
      return true;
    } catch (err) {
      console.error("Error creating folder:", err);
      throw new Error(((_a = err.data) == null ? void 0 : _a.message) || "Failed to create folder");
    }
  };
  const { authFetch } = useAuthFetch();
  const deleteItem = async (path) => {
    var _a;
    try {
      await authFetch("/api/dropbox/delete", {
        method: "POST",
        body: { path, accountId: targetAccountId.value }
      });
      await fetchFiles(currentPath.value);
      return true;
    } catch (err) {
      console.error("Error deleting:", err);
      throw new Error(((_a = err.data) == null ? void 0 : _a.message) || "Failed to delete");
    }
  };
  const bulkDelete = async (paths) => {
    var _a;
    try {
      await $fetch("/api/dropbox/bulk-delete", {
        method: "POST",
        body: { paths, accountId: targetAccountId.value }
      });
      clearSelection();
      await fetchFiles(currentPath.value);
      return true;
    } catch (err) {
      console.error("Error bulk deleting:", err);
      throw new Error(((_a = err.data) == null ? void 0 : _a.message) || "Failed to delete files");
    }
  };
  const renameItem = async (oldPath, newName) => {
    var _a;
    try {
      const pathParts = oldPath.split("/");
      pathParts.pop();
      const newPath = [...pathParts, newName].join("/");
      await $fetch("/api/dropbox/move", {
        method: "POST",
        body: { fromPath: oldPath, toPath: newPath, accountId: targetAccountId.value }
      });
      await fetchFiles(currentPath.value);
      return true;
    } catch (err) {
      console.error("Error renaming:", err);
      throw new Error(((_a = err.data) == null ? void 0 : _a.message) || "Failed to rename");
    }
  };
  const bulkMove = async (fromPaths, toFolder) => {
    var _a;
    try {
      const entries = fromPaths.map((fromPath) => {
        const fileName = fromPath.split("/").pop();
        const toPath = toFolder ? `${toFolder}/${fileName}` : `/${fileName}`;
        return { from_path: fromPath, to_path: toPath };
      });
      await $fetch("/api/dropbox/bulk-move", {
        method: "POST",
        body: { entries, accountId: targetAccountId.value }
      });
      clearSelection();
      await fetchFiles(currentPath.value);
      return true;
    } catch (err) {
      console.error("Error bulk moving:", err);
      throw new Error(((_a = err.data) == null ? void 0 : _a.message) || "Failed to move files");
    }
  };
  const bulkCopy = async (fromPaths, toFolder) => {
    var _a;
    try {
      const entries = fromPaths.map((fromPath) => {
        const fileName = fromPath.split("/").pop();
        const toPath = toFolder ? `${toFolder}/${fileName}` : `/${fileName}`;
        return { from_path: fromPath, to_path: toPath };
      });
      await $fetch("/api/dropbox/bulk-copy", {
        method: "POST",
        body: { entries, accountId: targetAccountId.value }
      });
      clearSelection();
      await fetchFiles(currentPath.value);
      return true;
    } catch (err) {
      console.error("Error bulk copying:", err);
      throw new Error(((_a = err.data) == null ? void 0 : _a.message) || "Failed to copy files");
    }
  };
  const bulkDownload = async (paths) => {
    var _a;
    try {
      const response = await $fetch("/api/dropbox/bulk-download", {
        method: "POST",
        body: { paths }
      });
      if (response.type === "single") {
        (void 0).open(response.link, "_blank");
      } else {
        for (const item of response.links) {
          if (item == null ? void 0 : item.link) {
            const a = (void 0).createElement("a");
            a.href = item.link;
            a.download = item.name;
            a.target = "_blank";
            (void 0).body.appendChild(a);
            a.click();
            (void 0).body.removeChild(a);
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      }
      clearSelection();
    } catch (err) {
      console.error("Error bulk downloading:", err);
      throw new Error(((_a = err.data) == null ? void 0 : _a.message) || "Failed to download files");
    }
  };
  const uploadFiles = async (fileList) => {
    try {
      const session = await $fetch("/api/dropbox/upload-session", {
        query: { path: currentPath.value, accountId: targetAccountId.value }
      });
      for (const file of Array.from(fileList)) {
        const filePath = currentPath.value ? `${currentPath.value}/${file.name}` : `/${file.name}`;
        const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.accessToken}`,
            "Dropbox-API-Arg": JSON.stringify({
              path: filePath,
              mode: "add",
              autorename: true,
              mute: false
            }),
            "Content-Type": "application/octet-stream"
          },
          body: file
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error_summary || `Failed to upload ${file.name}`);
        }
        try {
          await authFetch("/api/dropbox/record-upload", {
            method: "POST",
            body: {
              filename: file.name,
              dropboxPath: filePath,
              size: file.size,
              contentType: file.type,
              dropboxAccountId: session.accountId || targetAccountId.value
            }
          });
        } catch (recordError) {
          console.error("Failed to record upload in DB:", recordError);
        }
      }
      await fetchFiles(currentPath.value);
      return true;
    } catch (err) {
      console.error("Error uploading:", err);
      throw new Error(err.message || "Failed to upload files");
    }
  };
  const formatFileSize = (bytes) => {
    if (bytes === null) return "-";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  const getFileIcon = (entry) => {
    if (entry.type === "folder") return "lucide:folder";
    const ext = entry.extension;
    const iconMap = {
      pdf: "lucide:file-text",
      doc: "lucide:file-text",
      docx: "lucide:file-text",
      txt: "lucide:file-text",
      xls: "lucide:file-spreadsheet",
      xlsx: "lucide:file-spreadsheet",
      csv: "lucide:file-spreadsheet",
      ppt: "lucide:presentation",
      pptx: "lucide:presentation",
      jpg: "lucide:image",
      jpeg: "lucide:image",
      png: "lucide:image",
      gif: "lucide:image",
      svg: "lucide:image",
      webp: "lucide:image",
      mp4: "lucide:file-video",
      mov: "lucide:file-video",
      avi: "lucide:file-video",
      mkv: "lucide:file-video",
      mp3: "lucide:file-audio",
      wav: "lucide:file-audio",
      flac: "lucide:file-audio",
      zip: "lucide:file-archive",
      rar: "lucide:file-archive",
      "7z": "lucide:file-archive",
      tar: "lucide:file-archive",
      gz: "lucide:file-archive",
      js: "lucide:file-code",
      ts: "lucide:file-code",
      py: "lucide:file-code",
      html: "lucide:file-code",
      css: "lucide:file-code",
      json: "lucide:file-json"
    };
    return iconMap[ext || ""] || "lucide:file";
  };
  const getIconColor = (entry) => {
    if (entry.type === "folder") return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30";
    const ext = entry.extension;
    const colorMap = {
      pdf: "text-red-600 bg-red-50 dark:bg-red-900/30",
      doc: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
      docx: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
      xls: "text-green-600 bg-green-50 dark:bg-green-900/30",
      xlsx: "text-green-600 bg-green-50 dark:bg-green-900/30",
      ppt: "text-orange-600 bg-orange-50 dark:bg-orange-900/30",
      pptx: "text-orange-600 bg-orange-50 dark:bg-orange-900/30",
      jpg: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
      jpeg: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
      png: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
      mp4: "text-pink-600 bg-pink-50 dark:bg-pink-900/30",
      mp3: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30",
      zip: "text-amber-600 bg-amber-50 dark:bg-amber-900/30"
    };
    return colorMap[ext || ""] || "text-gray-600 bg-gray-50 dark:bg-gray-900/30";
  };
  const getFolders = async (path = "") => {
    try {
      const response = await $fetch("/api/dropbox/files", {
        query: { path, accountId: targetAccountId.value }
      });
      return response.entries.filter((e) => e.type === "folder");
    } catch (err) {
      console.error("Error fetching folders:", err);
      return [];
    }
  };
  return {
    currentPath,
    files,
    isLoading,
    error,
    selectedIds,
    selectedFiles,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    fetchFiles,
    navigateToFolder,
    navigateUp,
    getDownloadLink,
    createFolder,
    deleteItem,
    bulkDelete,
    renameItem,
    bulkMove,
    bulkCopy,
    bulkDownload,
    uploadFiles,
    formatFileSize,
    formatDate,
    getFileIcon,
    getIconColor,
    getFolders
  };
};

export { useDropboxFiles as a, useAccounts as u };
//# sourceMappingURL=useDropboxFiles-OACIDE_L.mjs.map
