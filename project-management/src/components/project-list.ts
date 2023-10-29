import { ProjectComponent } from './project-component'
import { type ProjectItem } from './project-item'
import { type DragTarget } from '../models/drag-drop'
import { Autobind } from '../decorators/autobind'
import { projectState, type ProjectStatus } from '../state/project-state'

export class ProjectList extends ProjectComponent implements DragTarget {
  listItemTemplate: HTMLTemplateElement
  listElementContainer: HTMLElement
  assignedProjects: ProjectItem[] = []

  constructor (public projectStatus: ProjectStatus) {
    super('project-list', 'app')

    this.listItemTemplate = document.getElementById('single-project') as HTMLTemplateElement

    const node = document.importNode(this.templateElement.content, true)
    this.listElementContainer = node.firstElementChild as HTMLElement
    this.listElementContainer.id = `${this.projectStatus}-projects`

    projectState.addListener(this.renderProjects)
    this.listElementContainer.addEventListener('dragover', this.dragOverHandler)
    this.listElementContainer.addEventListener('dragleave', this.dragLeaveHandler)
    this.listElementContainer.addEventListener('drop', this.dropHandler)
    this.attachElemetToApp(false, this.listElementContainer)
    this.renderProjectListContainer()
  }

  private renderProjectListContainer (): void {
    const listId = `${this.projectStatus}-projects-list`
    const listElement = this.listElementContainer.querySelector('ul') as HTMLUListElement
    listElement.id = listId

    const headerElement = this.listElementContainer.querySelector('h2') as HTMLHeadingElement
    headerElement.textContent = this.projectStatus.toString().toUpperCase() + ' PROJECTS'
  }

  @Autobind
  dragOverHandler (event: DragEvent): void {
    if (event.dataTransfer?.types[0] !== 'text/plain') return

    event.preventDefault()
    this.listElementContainer.classList.add('droppable')
  }

  @Autobind
  dropHandler (event: DragEvent): void {
    const projectId = event.dataTransfer?.getData('text/plain')
    if (projectId != null) projectState.moveProject(projectId, this.projectStatus)
    this.listElementContainer.classList.remove('droppable')
  }

  @Autobind
  dragLeaveHandler (_: DragEvent): void {
    this.listElementContainer.classList.remove('droppable')
  }

  @Autobind
  private renderProjects (projects: any[]): void {
    this.assignedProjects = projects.filter(project => project.status === this.projectStatus)
    const listElement = this.listElementContainer.querySelector('ul') as HTMLUListElement
    listElement.replaceChildren()

    for (const project of this.assignedProjects) {
      project.renderProject()
    }
  }
}
