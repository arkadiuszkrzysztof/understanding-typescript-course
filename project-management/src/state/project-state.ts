import { ProjectItem } from '../components/project-item'

type Listener = (items: ProjectItem[]) => void

export enum ProjectStatus { Active = 'active', Completed = 'completed' }

class ProjectState {
  private readonly listeners: any[] = []
  private readonly projects: ProjectItem[] = []
  private static instance: ProjectState

  private constructor () { }

  static getInstance (): ProjectState {
    if (this.instance === undefined) {
      this.instance = new ProjectState()
    }

    return this.instance
  }

  addListener (listener: Listener): void {
    this.listeners.push(listener)
  }

  addProject (title: string, description: string, people: number): void {
    this.projects.push(
      new ProjectItem(
        new Date().getTime().toString(),
        title,
        description,
        people,
        ProjectStatus.Active
      )
    )

    this.updateListeners()
  }

  moveProject (projectId: string, newStatus: ProjectStatus): void {
    const projectToMove = this.projects.find(project => project.id === projectId)
    if (projectToMove != null) {
      projectToMove.status = newStatus
      projectToMove.appElement = document.getElementById(`${newStatus}-projects-list`) as HTMLDivElement
      this.updateListeners()
    }
  }

  updateListeners (): void {
    for (const listener of this.listeners) {
      listener(this.projects.slice())
    }
  }
}

export const projectState = ProjectState.getInstance()
