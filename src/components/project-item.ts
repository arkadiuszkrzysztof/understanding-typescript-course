import { type Draggable } from '../models/drag-drop'
import { Autobind } from '../decorators/autobind'
import { ProjectComponent } from './project-component'
import { type ProjectStatus } from '../state/project-state'

export class ProjectItem extends ProjectComponent implements Draggable {
  element: HTMLLIElement

  get persons (): string {
    return this.people === 1 ? '1 person' : `${this.people} persons`
  }

  constructor (
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {
    super('single-project', `${status}-projects-list`)

    const node = document.importNode(this.templateElement.content, true)
    this.element = node.firstElementChild as HTMLLIElement

    this.element.addEventListener('dragstart', this.dragStartHandler)
    this.element.addEventListener('dragend', this.dragEndHandler)
  }

  @Autobind
  dragStartHandler (event: DragEvent): void {
    if (event.dataTransfer === null) return

    event.dataTransfer.setData('text/plain', this.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  @Autobind
  dragEndHandler (_: DragEvent): void {

  }

  renderProject (): void {
    const projectTitle = this.element.querySelector('.project-title') as HTMLSpanElement
    const projectPeople = this.element.querySelector('.project-people') as HTMLSpanElement
    const projectDescription = this.element.querySelector('.project-description') as HTMLParagraphElement
    projectTitle.textContent = this.title
    projectPeople.textContent = this.persons
    projectDescription.textContent = this.description

    this.attachElemetToApp(false, this.element)
  }
}
