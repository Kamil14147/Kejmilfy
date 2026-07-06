"use client";

import * as React from "react";
import { useEditor } from "@/lib/canvas/store";

export function useKeyboardShortcuts() {
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const copy = useEditor((s) => s.copy);
  const cut = useEditor((s) => s.cut);
  const paste = useEditor((s) => s.paste);
  const deleteElements = useEditor((s) => s.deleteElements);
  const duplicateElements = useEditor((s) => s.duplicateElements);
  const selectedIds = useEditor((s) => s.selectedIds);
  const select = useEditor((s) => s.select);
  const zoomIn = useEditor((s) => s.zoomIn);
  const zoomOut = useEditor((s) => s.zoomOut);
  const zoomToFit = useEditor((s) => s.zoomToFit);
  const groupElements = useEditor((s) => s.groupElements);
  const ungroupElements = useEditor((s) => s.ungroupElements);
  const bringForward = useEditor((s) => s.bringForward);
  const sendBackward = useEditor((s) => s.sendBackward);
  const bringToFront = useEditor((s) => s.bringToFront);
  const sendToBack = useEditor((s) => s.sendToBack);
  const toggleGrid = useEditor((s) => s.toggleGrid);
  const toggleSnap = useEditor((s) => s.toggleSnap);
  const getElement = useEditor((s) => s.getElement);
  const updateElement = useEditor((s) => s.updateElement);
  const pushHistory = useEditor((s) => s.pushHistory);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isText =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isText) return;

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // undo / redo
      if (mod && key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((mod && key === "z" && e.shiftKey) || (mod && key === "y")) {
        e.preventDefault();
        redo();
        return;
      }

      // copy/cut/paste
      if (mod && key === "c" && !e.shiftKey) {
        e.preventDefault();
        copy();
        return;
      }
      if (mod && key === "x") {
        e.preventDefault();
        cut();
        return;
      }
      if (mod && key === "v") {
        e.preventDefault();
        // delay to allow clipboard
        setTimeout(() => paste(), 0);
        return;
      }

      // duplicate
      if (mod && key === "d") {
        e.preventDefault();
        if (selectedIds.length > 0) duplicateElements(selectedIds);
        return;
      }

      // select all
      if (mod && key === "a") {
        e.preventDefault();
        const page = useEditor.getState().getCurrentPage();
        if (page) {
          const ids = page.elements.filter((el) => el.visible && !el.locked).map((el) => el.id);
          useEditor.getState().selectMany(ids, false);
        }
        return;
      }

      // group / ungroup
      if (mod && key === "g" && !e.shiftKey) {
        e.preventDefault();
        if (selectedIds.length >= 2) groupElements(selectedIds);
        return;
      }
      if (mod && key === "g" && e.shiftKey) {
        e.preventDefault();
        if (selectedIds.length === 1) {
          const el = getElement(selectedIds[0]);
          if (el?.type === "group") ungroupElements(el.id);
        }
        return;
      }

      // layer ops
      if (mod && key === "]") {
        e.preventDefault();
        if (selectedIds[0]) {
          if (e.shiftKey) bringToFront(selectedIds[0]);
          else bringForward(selectedIds[0]);
        }
        return;
      }
      if (mod && key === "[") {
        e.preventDefault();
        if (selectedIds[0]) {
          if (e.shiftKey) sendToBack(selectedIds[0]);
          else sendBackward(selectedIds[0]);
        }
        return;
      }

      // zoom
      if (mod && key === "=") {
        e.preventDefault();
        zoomIn();
        return;
      }
      if (mod && key === "-") {
        e.preventDefault();
        zoomOut();
        return;
      }
      if (mod && key === "0") {
        e.preventDefault();
        zoomToFit();
        return;
      }

      // toggle grid/snap
      if (key === "g" && !mod) {
        e.preventDefault();
        toggleGrid();
        return;
      }
      if (key === "s" && !mod && !e.shiftKey) {
        // shift+s already used for snap; just 's' shouldn't trigger (save)
      }
      if (e.shiftKey && key === "s") {
        e.preventDefault();
        toggleSnap();
        return;
      }

      // delete
      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        if (selectedIds.length > 0) deleteElements(selectedIds);
        return;
      }

      // arrow keys: nudge
      if (selectedIds.length > 0) {
        const step = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (key === "arrowup") dy = -step;
        else if (key === "arrowdown") dy = step;
        else if (key === "arrowleft") dx = -step;
        else if (key === "arrowright") dx = step;
        if (dx || dy) {
          e.preventDefault();
          for (const id of selectedIds) {
            const el = getElement(id);
            if (el) updateElement(id, { x: el.x + dx, y: el.y + dy });
          }
          pushHistory();
          return;
        }
      }

      // escape: deselect
      if (key === "escape") {
        select(null);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    undo, redo, copy, cut, paste, deleteElements, duplicateElements, selectedIds, select,
    zoomIn, zoomOut, zoomToFit, groupElements, ungroupElements, bringForward, sendBackward,
    bringToFront, sendToBack, toggleGrid, toggleSnap, getElement, updateElement, pushHistory,
  ]);
}
