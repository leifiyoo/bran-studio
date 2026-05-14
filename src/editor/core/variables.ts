import type { Project, VariableAlias, VariableValue } from './scene-types'

function isAlias(value: VariableValue): value is VariableAlias {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'alias'
}

export function resolveVariableValue(project: Project, variableId: string, modeOverrides: Record<string, string> = {}, seen = new Set<string>()): string | number | boolean | null {
  if (seen.has(variableId)) return null
  seen.add(variableId)
  for (const collection of Object.values(project.variableCollections ?? {})) {
    const variable = collection.variables[variableId]
    if (!variable) continue
    const modeId = modeOverrides[collection.id] ?? collection.defaultModeId
    const value = variable.valuesByMode[modeId] ?? variable.valuesByMode[collection.defaultModeId]
    if (isAlias(value)) return resolveVariableValue(project, value.variableId, modeOverrides, seen)
    return value ?? null
  }
  return null
}
