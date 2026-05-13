import type { ToolId } from './scene-types'

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable
}

export type ShortcutActions = {
  setTool: (tool: ToolId) => void
  undo: () => void
  redo: () => void
  copy: () => void
  paste: () => void
  cut: () => void
  duplicate: () => void
  selectAll: () => void
  clearSelection: () => void
  delete: () => void
  group: () => void
  ungroup: () => void
  toggleLock: () => void
  toggleVisibility: () => void
  bringForward: () => void
  sendBackward: () => void
  bringToFront: () => void
  sendToBack: () => void
  nudge: (dx: number, dy: number) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomFit: () => void
  zoom100: () => void
  save: () => void
}

export function handleEditorShortcut(event: KeyboardEvent, actions: ShortcutActions) {
  const key = event.key.toLowerCase()
  const mod = event.metaKey || event.ctrlKey
  if (isTypingTarget(event.target) && !(key === 'escape' || (mod && ['s', 'z', 'y'].includes(key)))) return false
  const toolMap: Record<string, ToolId> = { v: 'select', h: 'hand', f: 'frame', r: 'rectangle', t: 'text', i: 'image' }
  if (!mod && !event.altKey && !event.shiftKey && toolMap[key]) { actions.setTool(toolMap[key]); event.preventDefault(); return true }
  if (mod && key === 'z') { if (event.shiftKey) actions.redo(); else actions.undo(); event.preventDefault(); return true }
  if ((mod && key === 'y')) { actions.redo(); event.preventDefault(); return true }
  if (mod && key === 'c') { actions.copy(); event.preventDefault(); return true }
  if (mod && key === 'x') { actions.cut(); event.preventDefault(); return true }
  if (mod && key === 'v') { actions.paste(); event.preventDefault(); return true }
  if (mod && key === 'd') { actions.duplicate(); event.preventDefault(); return true }
  if (mod && key === 'a') { actions.selectAll(); event.preventDefault(); return true }
  if (mod && key === 'g') { if (event.shiftKey) actions.ungroup(); else actions.group(); event.preventDefault(); return true }
  if (mod && key === 'l') { actions.toggleLock(); event.preventDefault(); return true }
  if (mod && event.shiftKey && key === 'h') { actions.toggleVisibility(); event.preventDefault(); return true }
  if (key === 'delete' || key === 'backspace') { actions.delete(); event.preventDefault(); return true }
  if (key === 'escape') { actions.clearSelection(); event.preventDefault(); return true }
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    const step = event.shiftKey ? 10 : 1
    actions.nudge(key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0, key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0)
    event.preventDefault(); return true
  }
  if (key === ']') { if (event.shiftKey) actions.bringToFront(); else actions.bringForward(); event.preventDefault(); return true }
  if (key === '[') { if (event.shiftKey) actions.sendToBack(); else actions.sendBackward(); event.preventDefault(); return true }
  if (mod && (key === '+' || key === '=')) { actions.zoomIn(); event.preventDefault(); return true }
  if (mod && key === '-') { actions.zoomOut(); event.preventDefault(); return true }
  if (mod && key === '0') { actions.zoomFit(); event.preventDefault(); return true }
  if (mod && key === '1') { actions.zoom100(); event.preventDefault(); return true }
  if (mod && key === 's') { actions.save(); event.preventDefault(); return true }
  return false
}
