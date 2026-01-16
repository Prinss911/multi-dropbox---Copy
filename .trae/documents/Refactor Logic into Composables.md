I will implement **Phase 2: Consolidate Logic into Composables** to further clean up `pages/drive/files.vue`.

### Implementation Steps
1.  **Create `composables/useFileSelection.ts`**:
    *   Extract selection state (`selectedFiles`) and logic (`toggleSelectAll`, `clearSelection`).
2.  **Create `composables/useFileDragDrop.ts`**:
    *   Extract internal drag-and-drop logic for moving files.
    *   Include "Long Press" logic used for touch/mouse interaction.
3.  **Create `composables/useFileUpload.ts`**:
    *   Extract the heavy upload logic (chunked upload, wake lock, progress tracking).
    *   Extract external drag-and-drop (file drop from OS) logic.
4.  **Refactor `pages/drive/files.vue`**:
    *   Replace the extracted code with calls to these new composables.

### Expected Outcome
The `pages/drive/files.vue` file size will be significantly reduced, and the logic will be modular and testable. Ideally, the main page will just coordinate these composables.