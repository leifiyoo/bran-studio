'use client'

import { create } from 'zustand'
import type { Page, Project, ProjectId } from '@/editor/core/scene-types'
import { makeProjectFromTemplate } from '@/editor/core/templates'
import { deleteProject as deleteStoredProject, listProjects, loadProject, saveProject } from '@/lib/storage'
import { thumbnailForPage } from '@/lib/thumbnails'

type ProjectState = {
  projects: Project[]
  hydrated: boolean
  refresh: () => Promise<void>
  createProject: (template?: 'blank' | 'saas' | 'mobile' | 'landing', name?: string) => Promise<Project>
  renameProject: (id: ProjectId, name: string) => Promise<void>
  duplicateProject: (id: ProjectId) => Promise<Project | null>
  deleteProject: (id: ProjectId) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  hydrated: false,
  refresh: async () => set({ projects: await listProjects(), hydrated: true }),
  createProject: async (template = 'blank', name) => {
    const { project, pages } = makeProjectFromTemplate(template, name)
    project.thumbnail = thumbnailForPage(pages[0])
    await saveProject(project, pages)
    await get().refresh()
    return project
  },
  renameProject: async (id, name) => {
    const loaded = await loadProject(id)
    if (!loaded) return
    await saveProject({ ...loaded.project, name, updatedAt: new Date().toISOString() }, loaded.pages)
    await get().refresh()
  },
  duplicateProject: async (id) => {
    const loaded = await loadProject(id)
    if (!loaded) return null
    const { project } = makeProjectFromTemplate('blank', `${loaded.project.name} Copy`)
    const clonedPages: Page[] = loaded.pages.map((page, index) => ({ ...page, id: project.pages[index] ?? page.id, projectId: project.id, name: page.name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }))
    const clonedProject = { ...project, pages: clonedPages.map((page) => page.id), activePageId: clonedPages[0].id, tokens: loaded.project.tokens, styles: loaded.project.styles, components: loaded.project.components, thumbnail: loaded.project.thumbnail }
    await saveProject(clonedProject, clonedPages)
    await get().refresh()
    return clonedProject
  },
  deleteProject: async (id) => {
    await deleteStoredProject(id)
    await get().refresh()
  },
}))
