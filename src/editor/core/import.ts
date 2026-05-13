import { exportSchema } from '@/lib/schemas'

export function importProjectJson(text: string) {
  const parsed = JSON.parse(text) as unknown
  return exportSchema.parse(parsed)
}
