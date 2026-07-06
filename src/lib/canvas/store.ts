"use client";

import { create } from "zustand";
import {
  CanvasElement,
  Page,
  Project,
  ProjectSize,
  newProject,
  newPage,
  makeId,
  Background,
  defaultBackground,
  TextElement,
  ShapeElement,
  ImageElement,
  IconElement,
  GroupElement,
} from "./types";

// ============= History snapshot =============
interface Snapshot {
  pages: Page[];
  currentPageId: string;
}

// ============= Editor state =============
interface EditorState {
  project: Project | null;
  currentPageId: string | null;
  selectedIds: string[];
  clipboard: CanvasElement[] | null;
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showGuides: boolean;
  history: Snapshot[];
  historyIndex: number;
  lastSavedAt: number | null;
  isDirty: boolean;

  // multi-action helper
  beginBatch: () => void;
  commitBatch: () => void;
  _batching: boolean;
  _batchSnapshot: Snapshot | null;

  // project
  createProject: (size: ProjectSize, name?: string) => void;
  loadProject: (p: Project) => void;
  setProjectName: (name: string) => void;
  deleteProject: () => void;

  // pages
  addPage: () => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;
  reorderPages: (from: number, to: number) => void;
  updatePage: (pageId: string, patch: Partial<Page>) => void;
  setPageSize: (width: number, height: number) => void;
  setBackground: (bg: Background) => void;
  magicResize: (width: number, height: number) => void;

  // elements
  addElement: (el: CanvasElement) => void;
  addElements: (els: CanvasElement[]) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  updateElements: (ids: string[], patch: Partial<CanvasElement>) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  groupElements: (ids: string[]) => void;
  ungroupElements: (groupId: string) => void;
  alignElements: (
    ids: string[],
    align: "left" | "right" | "center" | "top" | "bottom" | "middle"
  ) => void;
  distributeElements: (
    ids: string[],
    axis: "horizontal" | "vertical"
  ) => void;
  flipElement: (id: string, axis: "x" | "y") => void;

  // selection
  select: (id: string | null, additive?: boolean) => void;
  selectMany: (ids: string[], additive?: boolean) => void;
  clearSelection: () => void;
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;

  // clipboard
  copy: () => void;
  cut: () => void;
  paste: () => void;

  // view
  setZoom: (z: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  setPan: (p: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  toggleRulers: () => void;
  toggleGuides: () => void;

  // history
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // persistence
  saveToStorage: () => void;
  markSaved: () => void;

  // helpers
  getElement: (id: string) => CanvasElement | undefined;
  getCurrentPage: () => Page | undefined;
}

function snapshot(state: EditorState): Snapshot {
  const project = state.project;
  if (!project) return { pages: [], currentPageId: "" };
  return {
    pages: JSON.parse(JSON.stringify(project.pages)),
    currentPageId: state.currentPageId || "",
  };
}

function applySnapshot(state: EditorState, snap: Snapshot): Partial<EditorState> {
  if (!state.project) return {};
  return {
    project: { ...state.project, pages: JSON.parse(JSON.stringify(snap.pages)) },
    currentPageId: snap.currentPageId,
    selectedIds: [],
    isDirty: true,
  };
}

export const useEditor = create<EditorState>()(
  (set, get) => ({
    project: null,
    currentPageId: null,
    selectedIds: [],
    clipboard: null,
    zoom: 1,
      pan: { x: 0, y: 0 },
      showGrid: false,
      snapToGrid: true,
      gridSize: 20,
      showRulers: true,
      showGuides: true,
      history: [],
      historyIndex: -1,
      lastSavedAt: null,
      isDirty: false,
      _batching: false,
      _batchSnapshot: null,

      beginBatch: () => set({ _batching: true, _batchSnapshot: snapshot(get()) }),
      commitBatch: () => {
        const snap = get()._batchSnapshot;
        if (snap) {
          const hist = get().history.slice(0, get().historyIndex + 1);
          hist.push(snap);
          set({
            _batching: false,
            _batchSnapshot: null,
            history: hist.slice(-100),
            historyIndex: Math.min(hist.length - 1, 99),
            isDirty: true,
          });
        } else {
          set({ _batching: false, _batchSnapshot: null });
        }
      },

      createProject: (size, name) => {
        const p = newProject(size, name);
        set({
          project: p,
          currentPageId: p.pages[0].id,
          selectedIds: [],
          zoom: 1,
          pan: { x: 0, y: 0 },
          history: [],
          historyIndex: -1,
          isDirty: true,
        });
        get().pushHistory();
      },

      loadProject: (p) => {
        set({
          project: p,
          currentPageId: p.pages[0]?.id || null,
          selectedIds: [],
          history: [],
          historyIndex: -1,
          isDirty: false,
        });
        get().pushHistory();
      },

      setProjectName: (name) => {
        if (!get().project) return;
        set({ project: { ...get().project!, name, updatedAt: Date.now() }, isDirty: true });
      },

      deleteProject: () => {
        set({ project: null, currentPageId: null, selectedIds: [], history: [], historyIndex: -1 });
      },

      addPage: () => {
        const proj = get().project;
        if (!proj) return;
        const firstPage = proj.pages[0];
        const p = newPage(firstPage.width, firstPage.height, `Page ${proj.pages.length + 1}`);
        set({
          project: { ...proj, pages: [...proj.pages, p], updatedAt: Date.now() },
          currentPageId: p.id,
          isDirty: true,
        });
        get().pushHistory();
      },

      duplicatePage: (pageId) => {
        const proj = get().project;
        if (!proj) return;
        const idx = proj.pages.findIndex((p) => p.id === pageId);
        if (idx < 0) return;
        const orig = proj.pages[idx];
        const copy: Page = JSON.parse(JSON.stringify(orig));
        copy.id = `p_${Math.random().toString(36).slice(2, 10)}`;
        copy.name = orig.name + " copy";
        copy.elements = copy.elements.map((el) => ({ ...el, id: makeId(el.type.slice(0, 3)) }));
        const pages = [...proj.pages];
        pages.splice(idx + 1, 0, copy);
        set({ project: { ...proj, pages, updatedAt: Date.now() }, currentPageId: copy.id, isDirty: true });
        get().pushHistory();
      },

      deletePage: (pageId) => {
        const proj = get().project;
        if (!proj || proj.pages.length <= 1) return;
        const pages = proj.pages.filter((p) => p.id !== pageId);
        const newCurrent = get().currentPageId === pageId ? pages[0].id : get().currentPageId;
        set({ project: { ...proj, pages, updatedAt: Date.now() }, currentPageId: newCurrent, isDirty: true });
        get().pushHistory();
      },

      setCurrentPage: (pageId) => {
        set({ currentPageId: pageId, selectedIds: [] });
      },

      reorderPages: (from, to) => {
        const proj = get().project;
        if (!proj) return;
        const pages = [...proj.pages];
        const [moved] = pages.splice(from, 1);
        pages.splice(to, 0, moved);
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        get().pushHistory();
      },

      updatePage: (pageId, patch) => {
        const proj = get().project;
        if (!proj) return;
        const pages = proj.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p));
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
      },

      setPageSize: (width, height) => {
        const pid = get().currentPageId;
        if (!pid) return;
        get().updatePage(pid, { width, height });
        get().pushHistory();
      },

      setBackground: (bg) => {
        const pid = get().currentPageId;
        if (!pid) return;
        get().updatePage(pid, { background: bg });
        get().pushHistory();
      },

      magicResize: (width, height) => {
        const proj = get().project;
        if (!proj) return;
        const oldW = proj.pages[0].width;
        const oldH = proj.pages[0].height;
        const sx = width / oldW;
        const sy = height / oldH;
        const pages = proj.pages.map((p) => ({
          ...p,
          width,
          height,
          elements: p.elements.map((el) => ({
            ...el,
            x: el.x * sx,
            y: el.y * sy,
            width: el.width * sx,
            height: el.height * sy,
            // scale font size for text
            ...(el.type === "text" ? { fontSize: Math.round((el as TextElement).fontSize * Math.min(sx, sy)) } : {}),
          })),
        }));
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        get().pushHistory();
      },

      addElement: (el) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const pages = proj.pages.map((p) =>
          p.id === pid ? { ...p, elements: [...p.elements, el] } : p
        );
        set({
          project: { ...proj, pages, updatedAt: Date.now() },
          selectedIds: [el.id],
          isDirty: true,
        });
        get().pushHistory();
      },

      addElements: (els) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const pages = proj.pages.map((p) =>
          p.id === pid ? { ...p, elements: [...p.elements, ...els] } : p
        );
        set({
          project: { ...proj, pages, updatedAt: Date.now() },
          selectedIds: els.map((e) => e.id),
          isDirty: true,
        });
        get().pushHistory();
      },

      updateElement: (id, patch) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const pages = proj.pages.map((p) =>
          p.id === pid
            ? {
                ...p,
                elements: p.elements.map((el) =>
                  el.id === id ? ({ ...el, ...patch } as CanvasElement) : el
                ),
              }
            : p
        );
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        if (!get()._batching) {
          // don't push history on every drag move; caller batches
        }
      },

      updateElements: (ids, patch) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const idSet = new Set(ids);
        const pages = proj.pages.map((p) =>
          p.id === pid
            ? {
                ...p,
                elements: p.elements.map((el) =>
                  idSet.has(el.id) ? ({ ...el, ...patch } as CanvasElement) : el
                ),
              }
            : p
        );
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
      },

      deleteElements: (ids) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const idSet = new Set(ids);
        const pages = proj.pages.map((p) =>
          p.id === pid ? { ...p, elements: p.elements.filter((el) => !idSet.has(el.id)) } : p
        );
        set({
          project: { ...proj, pages, updatedAt: Date.now() },
          selectedIds: [],
          isDirty: true,
        });
        get().pushHistory();
      },

      duplicateElements: (ids) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const page = proj.pages.find((p) => p.id === pid);
        if (!page) return;
        const copies: CanvasElement[] = [];
        for (const id of ids) {
          const orig = page.elements.find((e) => e.id === id);
          if (!orig) continue;
          const copy = JSON.parse(JSON.stringify(orig)) as CanvasElement;
          copy.id = makeId(orig.type.slice(0, 3));
          copy.x += 20;
          copy.y += 20;
          copies.push(copy);
        }
        const pages = proj.pages.map((p) =>
          p.id === pid ? { ...p, elements: [...p.elements, ...copies] } : p
        );
        set({
          project: { ...proj, pages, updatedAt: Date.now() },
          selectedIds: copies.map((c) => c.id),
          isDirty: true,
        });
        get().pushHistory();
      },

      bringForward: (id) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const pages = proj.pages.map((p) => {
          if (p.id !== pid) return p;
          const els = [...p.elements];
          const i = els.findIndex((e) => e.id === id);
          if (i < 0 || i === els.length - 1) return p;
          [els[i], els[i + 1]] = [els[i + 1], els[i]];
          return { ...p, elements: els };
        });
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        get().pushHistory();
      },

      sendBackward: (id) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const pages = proj.pages.map((p) => {
          if (p.id !== pid) return p;
          const els = [...p.elements];
          const i = els.findIndex((e) => e.id === id);
          if (i <= 0) return p;
          [els[i], els[i - 1]] = [els[i - 1], els[i]];
          return { ...p, elements: els };
        });
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        get().pushHistory();
      },

      bringToFront: (id) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const pages = proj.pages.map((p) => {
          if (p.id !== pid) return p;
          const els = [...p.elements];
          const i = els.findIndex((e) => e.id === id);
          if (i < 0 || i === els.length - 1) return p;
          const [el] = els.splice(i, 1);
          els.push(el);
          return { ...p, elements: els };
        });
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        get().pushHistory();
      },

      sendToBack: (id) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const pages = proj.pages.map((p) => {
          if (p.id !== pid) return p;
          const els = [...p.elements];
          const i = els.findIndex((e) => e.id === id);
          if (i <= 0) return p;
          const [el] = els.splice(i, 1);
          els.unshift(el);
          return { ...p, elements: els };
        });
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        get().pushHistory();
      },

      groupElements: (ids) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid || ids.length < 2) return;
        const page = proj.pages.find((p) => p.id === pid);
        if (!page) return;
        const els = page.elements.filter((e) => ids.includes(e.id));
        if (els.length < 2) return;
        const xs = els.map((e) => e.x);
        const ys = els.map((e) => e.y);
        const xs2 = els.map((e) => e.x + e.width);
        const ys2 = els.map((e) => e.y + e.height);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs2);
        const maxY = Math.max(...ys2);
        const group: GroupElement = {
          id: makeId("grp"),
          type: "group",
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          childIds: ids,
        };
        const pages = proj.pages.map((p) =>
          p.id === pid ? { ...p, elements: [...p.elements, group] } : p
        );
        set({
          project: { ...proj, pages, updatedAt: Date.now() },
          selectedIds: [group.id],
          isDirty: true,
        });
        get().pushHistory();
      },

      ungroupElements: (groupId) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid) return;
        const pages = proj.pages.map((p) =>
          p.id === pid ? { ...p, elements: p.elements.filter((e) => e.id !== groupId) } : p
        );
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        get().pushHistory();
      },

      alignElements: (ids, align) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid || ids.length < 2) return;
        const page = proj.pages.find((p) => p.id === pid);
        if (!page) return;
        const els = page.elements.filter((e) => ids.includes(e.id));
        if (els.length < 2) return;
        const minX = Math.min(...els.map((e) => e.x));
        const maxX = Math.max(...els.map((e) => e.x + e.width));
        const minY = Math.min(...els.map((e) => e.y));
        const maxY = Math.max(...els.map((e) => e.y + e.height));
        const pages = proj.pages.map((p) => {
          if (p.id !== pid) return p;
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (!ids.includes(el.id)) return el;
              const patch: Partial<CanvasElement> = {};
              if (align === "left") patch.x = minX;
              else if (align === "right") patch.x = maxX - el.width;
              else if (align === "center") patch.x = (minX + maxX) / 2 - el.width / 2;
              else if (align === "top") patch.y = minY;
              else if (align === "bottom") patch.y = maxY - el.height;
              else if (align === "middle") patch.y = (minY + maxY) / 2 - el.height / 2;
              return { ...el, ...patch } as CanvasElement;
            }),
          };
        });
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        get().pushHistory();
      },

      distributeElements: (ids, axis) => {
        const pid = get().currentPageId;
        const proj = get().project;
        if (!proj || !pid || ids.length < 3) return;
        const page = proj.pages.find((p) => p.id === pid);
        if (!page) return;
        const els = page.elements.filter((e) => ids.includes(e.id)).sort((a, b) =>
          axis === "horizontal" ? a.x - b.x : a.y - b.y
        );
        if (els.length < 3) return;
        const first = els[0];
        const last = els[els.length - 1];
        const totalGap =
          axis === "horizontal"
            ? last.x - (first.x + first.width)
            : last.y - (first.y + first.height);
        const step = totalGap / (els.length - 1);
        let cursor = axis === "horizontal" ? first.x + first.width : first.y + first.height;
        const updates = new Map<string, number>();
        for (let i = 1; i < els.length - 1; i++) {
          if (axis === "horizontal") {
            updates.set(els[i].id, cursor);
            cursor += els[i].width + step;
          } else {
            updates.set(els[i].id, cursor);
            cursor += els[i].height + step;
          }
        }
        const pages = proj.pages.map((p) => {
          if (p.id !== pid) return p;
          return {
            ...p,
            elements: p.elements.map((el) => {
              if (!updates.has(el.id)) return el;
              const v = updates.get(el.id)!;
              return axis === "horizontal"
                ? ({ ...el, x: v } as CanvasElement)
                : ({ ...el, y: v } as CanvasElement);
            }),
          };
        });
        set({ project: { ...proj, pages, updatedAt: Date.now() }, isDirty: true });
        get().pushHistory();
      },

      flipElement: (id, axis) => {
        const el = get().getElement(id);
        if (!el) return;
        if (el.type === "image") {
          get().updateElement(id, { flipX: axis === "x" ? !el.flipX : el.flipX, flipY: axis === "y" ? !el.flipY : el.flipY } as Partial<ImageElement>);
        } else if ("fill" in el) {
          get().updateElement(id, { flipX: axis === "x" ? !el.flipX : el.flipX, flipY: axis === "y" ? !el.flipY : el.flipY } as Partial<ShapeElement>);
        }
        get().pushHistory();
      },

      select: (id, additive) => {
        if (!id) {
          set({ selectedIds: [] });
          return;
        }
        const cur = get().selectedIds;
        if (additive) {
          set({ selectedIds: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
        } else {
          set({ selectedIds: [id] });
        }
      },

      selectMany: (ids, additive) => {
        if (additive) {
          set({ selectedIds: Array.from(new Set([...get().selectedIds, ...ids])) });
        } else {
          set({ selectedIds: ids });
        }
      },

      clearSelection: () => set({ selectedIds: [] }),

      toggleLock: (id) => {
        const el = get().getElement(id);
        if (!el) return;
        get().updateElement(id, { locked: !el.locked });
        get().pushHistory();
      },

      toggleVisibility: (id) => {
        const el = get().getElement(id);
        if (!el) return;
        get().updateElement(id, { visible: !el.visible });
        get().pushHistory();
      },

      copy: () => {
        const page = get().getCurrentPage();
        if (!page) return;
        const els = page.elements.filter((e) => get().selectedIds.includes(e.id));
        if (els.length === 0) return;
        set({ clipboard: JSON.parse(JSON.stringify(els)) });
      },

      cut: () => {
        get().copy();
        get().deleteElements(get().selectedIds);
      },

      paste: () => {
        const clip = get().clipboard;
        const pid = get().currentPageId;
        const proj = get().project;
        if (!clip || !proj || !pid) return;
        const copies = clip.map((c) => {
          const copy = JSON.parse(JSON.stringify(c)) as CanvasElement;
          copy.id = makeId(c.type.slice(0, 3));
          copy.x += 20;
          copy.y += 20;
          return copy;
        });
        const pages = proj.pages.map((p) =>
          p.id === pid ? { ...p, elements: [...p.elements, ...copies] } : p
        );
        set({
          project: { ...proj, pages, updatedAt: Date.now() },
          selectedIds: copies.map((c) => c.id),
          isDirty: true,
        });
        get().pushHistory();
      },

      setZoom: (z) => set({ zoom: Math.max(0.05, Math.min(8, z)) }),
      zoomIn: () => set({ zoom: Math.min(8, get().zoom * 1.2) }),
      zoomOut: () => set({ zoom: Math.max(0.05, get().zoom / 1.2) }),
      zoomToFit: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),
      setPan: (p) => set({ pan: p }),
      toggleGrid: () => set({ showGrid: !get().showGrid }),
      toggleSnap: () => set({ snapToGrid: !get().snapToGrid }),
      toggleRulers: () => set({ showRulers: !get().showRulers }),
      toggleGuides: () => set({ showGuides: !get().showGuides }),

      pushHistory: () => {
        const state = get();
        const snap = snapshot(state);
        const hist = state.history.slice(0, state.historyIndex + 1);
        // skip if identical to last
        const last = hist[hist.length - 1];
        if (last && JSON.stringify(last) === JSON.stringify(snap)) return;
        hist.push(snap);
        set({
          history: hist.slice(-100),
          historyIndex: Math.min(hist.length - 1, 99),
          isDirty: true,
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex <= 0) return;
        const newIdx = state.historyIndex - 1;
        const snap = state.history[newIdx];
        set(applySnapshot(state, snap));
        set({ historyIndex: newIdx });
      },

      redo: () => {
        const state = get();
        if (state.historyIndex >= state.history.length - 1) return;
        const newIdx = state.historyIndex + 1;
        const snap = state.history[newIdx];
        set(applySnapshot(state, snap));
        set({ historyIndex: newIdx });
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      saveToStorage: () => {
        const proj = get().project;
        if (!proj) return;
        // Save to backend API (auth-protected)
        fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project: proj }),
        })
          .then(() => {
            set({ lastSavedAt: Date.now(), isDirty: false });
          })
          .catch((e) => console.error("save failed", e));
      },

      markSaved: () => set({ lastSavedAt: Date.now(), isDirty: false }),

      getElement: (id) => {
        const page = get().getCurrentPage();
        return page?.elements.find((e) => e.id === id);
      },

      getCurrentPage: () => {
        const proj = get().project;
        if (!proj) return undefined;
        return proj.pages.find((p) => p.id === get().currentPageId);
      },
    })
);

// ============= Project list helpers (DB via API) =============
export async function listProjects(): Promise<Project[]> {
  try {
    const res = await fetch("/api/projects");
    if (!res.ok) return [];
    const data = await res.json();
    return data.projects;
  } catch {
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.project;
  } catch {
    return null;
  }
}

export async function deleteProjectFromStorage(id: string) {
  await fetch(`/api/projects/${id}`, { method: "DELETE" });
}

export async function trashProject(id: string) {
  await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deleted: true }),
  });
}

export async function restoreProject(id: string) {
  await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deleted: false }),
  });
}

export async function toggleFavorite(id: string) {
  // optimistic — caller should refresh from server
  await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ favorite: true }), // toggled server-side via existing value
  });
}
