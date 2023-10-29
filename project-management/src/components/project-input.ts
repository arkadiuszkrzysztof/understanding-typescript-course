import { Autobind } from '../decorators/autobind'
import { ProjectComponent } from './project-component'
import { projectState } from '../state/project-state'

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

export class ProjectInput extends ProjectComponent {
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
