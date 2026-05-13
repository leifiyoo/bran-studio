import Dexie, { type Table } from 'dexie'
import type { Page, Project, ProjectId } from '@/editor/core/scene-types'

export type AssetRecord = { id: string; projectId: ProjectId; name: string; type: string; dataUrl: string; createdAt: string }
export type SettingRecord = { key: string; value: unknown }

export class BranDatabase extends Dexie {
  projects!: Table<Project, ProjectId>
  pages!: Table<Page, string>
  assets!: Table<AssetRecord, string>
  thumbnails!: Table<{ projectId: ProjectId; dataUrl: string; updatedAt: string }, ProjectId>
  settings!: Table<SettingRecord, string>
  migrations!: Table<{ id: string; appliedAt: string }, string>

  constructor() {
    super('bran-studio')
    this.version(1).stores({
      projects: 'id, updatedAt, name',
      pages: 'id, projectId, updatedAt',
      assets: 'id, projectId',
      thumbnails: 'projectId',
      settings: 'key',
      migrations: 'id',
    })
  }
}

export const db = typeof window === 'undefined' ? null : new BranDatabase()
