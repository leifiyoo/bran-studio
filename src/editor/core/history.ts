export type Command<T> = { label: string; before: T; after: T }

export class History<T> {
  private undoStack: Command<T>[] = []
  private redoStack: Command<T>[] = []

  push(command: Command<T>) {
    this.undoStack.push(command)
    this.redoStack = []
  }
  undo(current: T): T {
    const command = this.undoStack.pop()
    if (!command) return current
    this.redoStack.push(command)
    return command.before
  }
  redo(current: T): T {
    const command = this.redoStack.pop()
    if (!command) return current
    this.undoStack.push(command)
    return command.after
  }
  get canUndo() { return this.undoStack.length > 0 }
  get canRedo() { return this.redoStack.length > 0 }
}
