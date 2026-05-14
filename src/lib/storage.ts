import { db, type AssetRecord } from './db'
import type { Page, Project, ProjectId } from '@/editor/core/scene-types'
import { migrateLoadedProject } from '@/editor/core/migrations'

export async function saveProject(project: Project, pages: Page[]) {
  if (!db) return
  const database = db
  await database.transaction('rw', database.projects, database.pages, async () => {
    await database.projects.put(project)
    await database.pages.bulkPut(pages)
  })
}

export async function listProjects() {
  if (!db) return []
  return db.projects.orderBy('updatedAt').reverse().toArray()
}

export async function loadProject(projectId: ProjectId) {
  if (!db) return null
  const project = await db.projects.get(projectId)
  if (!project) return null
  const pages = await db.pages.where('projectId').equals(projectId).toArray()
  return migrateLoadedProject(project, pages)
}

export async function deleteProject(projectId: ProjectId) {
  if (!db) return
  const database = db
  await database.transaction('rw', database.projects, database.pages, database.assets, async () => {
    await database.projects.delete(projectId)
    await database.pages.where('projectId').equals(projectId).delete()
    await database.assets.where('projectId').equals(projectId).delete()
  })
}

export async function saveAsset(asset: AssetRecord) {
  if (!db) return
  await db.assets.put(asset)
}

export async function listAssets(projectId: ProjectId) {
  if (!db) return []
  return db.assets.where('projectId').equals(projectId).toArray()
}

export async function clearAllData() {
  if (!db) return
  await Promise.all([db.projects.clear(), db.pages.clear(), db.assets.clear(), db.thumbnails.clear(), db.settings.clear()])
}
