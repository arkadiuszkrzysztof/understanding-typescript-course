interface Draggable {
  dragStartHandler: (event: DragEvent) => void
  dragEndHandler: (event: DragEvent) => void
}

interface DragTarget {
  dragOverHandler: (event: DragEvent) => void
  dropHandler: (event: DragEvent) => void
  dragLeaveHandler: (event: DragEvent) => void
}

type Listener = (items: ProjectItem[]) => void

enum ProjectStatus { Active = 'active', Completed = 'completed' }

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

const projectState = ProjectState.getInstance()

interface Validatable {
  value: string | number
  required: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
}

function validateProperty (property: Validatable): boolean {
  if (property.required && property.value === undefined) return false

  if (typeof property.value === 'string') {
    if (property.minLength !== undefined && property.value.length < property.minLength) return false
    if (property.maxLength !== undefined && property.value.length > property.maxLength) return false
  }

  if (typeof property.value === 'number') {
    if (property.min !== undefined && property.value < property.min) return false
    if (property.max !== undefined && property.value > property.max) return false
  }

  return true
}

function Autobind (_: any, _2: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get () {
      const boundFunction = originalMethod.bind(this)
      return boundFunction
    }
  }
  return adjustedDescriptor
}

abstract class ProjectComponent {
  templateElement: HTMLTemplateElement
  appElement: HTMLElement

  constructor (templateId: string, appElementId: string) {
    this.templateElement = document.getElementById(templateId) as HTMLTemplateElement
    this.appElement = document.getElementById(appElementId) as HTMLDivElement
  }

  protected attachElemetToApp (insertAtStart: boolean, elementToAttach: HTMLElement): void {
    this.appElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', elementToAttach)
  }
}

class ProjectItem extends ProjectComponent implements Draggable {
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

class ProjectList extends ProjectComponent implements DragTarget {
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

class ProjectInput extends ProjectComponent {
  formElement: HTMLFormElement

  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor () {
    super('project-input', 'app')

    const node = document.importNode(this.templateElement.content, true)
    this.formElement = node.firstElementChild as HTMLFormElement

    this.titleInputElement = this.formElement.querySelector('#title') as HTMLInputElement
    this.descriptionInputElement = this.formElement.querySelector('#description') as HTMLInputElement
    this.peopleInputElement = this.formElement.querySelector('#people') as HTMLInputElement

    this.formElement.addEventListener('submit', this.onFormSubmit)
    this.attachElemetToApp(true, this.formElement)
  }

  private validateForm (inputs: Record<string, string | number>): boolean {
    return validateProperty({ value: inputs.title, required: true, minLength: 3, maxLength: 100 }) &&
            validateProperty({ value: inputs.description, required: true, minLength: 10, maxLength: 1000 }) &&
            validateProperty({ value: inputs.people, required: true, min: 1, max: 100 })
  }

  private getFormInput (): [string, string, number] | undefined {
    const title = this.titleInputElement.value.trim()
    const description = this.descriptionInputElement.value.trim()
    const people = parseInt(this.peopleInputElement.value)

    if (this.validateForm({ title, description, people })) {
      return [title, description, people]
    } else {
      alert('Please fill in all fields')
      return undefined
    }
  }

  private clearFormInput (): void {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.peopleInputElement.value = ''
  }

  @Autobind
  private onFormSubmit (event: Event): void {
    event.preventDefault()
    const formInput = this.getFormInput()

    if (Array.isArray(formInput)) {
      const [title, description, people] = formInput
      projectState.addProject(title, description, people)
      this.clearFormInput()
    }
  }
}

const projectInput = new ProjectInput()

const activeProjectList = new ProjectList(ProjectStatus.Active)
const completedProjectList = new ProjectList(ProjectStatus.Completed)

console.log(projectInput, activeProjectList, completedProjectList)
