import { exportSchema } from '@/lib/schemas'
import { migrateExportPayload } from './migrations'

export function importProjectJson(text: string) {
  const parsed = JSON.parse(text) as unknown
  return exportSchema.parse(migrateExportPayload(parsed))
}
